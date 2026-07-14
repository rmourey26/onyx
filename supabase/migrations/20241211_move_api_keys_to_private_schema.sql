-- Migration: Move api_keys table from public schema to private schema
-- This enhances security by moving sensitive API key data to a private schema

-- Step 1: Create private schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS private;

-- Step 2: Drop existing triggers to avoid conflicts during migration
DROP TRIGGER IF EXISTS update_api_keys_updated_at ON public.api_keys;
DROP TRIGGER IF EXISTS track_api_key_usage ON public.api_keys;
DROP TRIGGER IF EXISTS audit_api_key_changes ON public.api_keys;

-- Step 3: Drop foreign key constraint from api_key_audit_log temporarily
ALTER TABLE public.api_key_audit_log DROP CONSTRAINT IF EXISTS api_key_audit_log_api_key_id_fkey;

-- Step 4: Create the api_keys table in private schema with all columns
CREATE TABLE private.api_keys (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  total_requests INTEGER DEFAULT 0,
  last_request_at TIMESTAMPTZ,
  scopes JSONB DEFAULT '[]'::jsonb
);

-- Step 5: Migrate existing data from public.api_keys to private.api_keys
INSERT INTO private.api_keys 
SELECT * FROM public.api_keys;

-- Step 6: Create indexes on private.api_keys
CREATE INDEX idx_api_keys_user_id ON private.api_keys(user_id);
CREATE INDEX idx_api_keys_key_hash ON private.api_keys(key_hash);
CREATE INDEX idx_api_keys_is_active ON private.api_keys(is_active);
CREATE INDEX idx_api_keys_last_request_at ON private.api_keys(last_request_at DESC);
CREATE INDEX idx_api_keys_scopes ON private.api_keys USING GIN (scopes);

-- Step 7: Enable RLS on private.api_keys
ALTER TABLE private.api_keys ENABLE ROW LEVEL SECURITY;

-- Step 8: Recreate RLS policies on private.api_keys
CREATE POLICY "Users can view their own API keys"
  ON private.api_keys
  FOR SELECT
  USING (public.current_user_id() = user_id);

CREATE POLICY "Users can create their own API keys"
  ON private.api_keys
  FOR INSERT
  WITH CHECK (public.current_user_id() = user_id);

CREATE POLICY "Users can update their own API keys"
  ON private.api_keys
  FOR UPDATE
  USING (public.current_user_id() = user_id);

CREATE POLICY "Users can delete their own API keys"
  ON private.api_keys
  FOR DELETE
  USING (public.current_user_id() = user_id);

-- Step 9: Update validate_api_key function to use private schema
CREATE OR REPLACE FUNCTION public.validate_api_key(api_key text)
RETURNS TABLE (
  user_id uuid,
  api_key_id uuid,
  scopes jsonb,
  valid boolean
) 
SECURITY DEFINER
SET search_path = public, private
LANGUAGE plpgsql
AS $$
DECLARE
  key_record private.api_keys;
  key_hash_to_check text;
BEGIN
  -- Hash the provided key using SHA-256
  key_hash_to_check := encode(digest(api_key, 'sha256'), 'hex');
  
  -- Look up the key by hash from private schema
  SELECT * INTO key_record
  FROM private.api_keys
  WHERE key_hash = key_hash_to_check
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
  LIMIT 1;
  
  IF key_record IS NOT NULL THEN
    -- Set RLS context for the user
    PERFORM set_config('request.jwt.claim.sub', key_record.user_id::text, false);
    PERFORM set_config('request.jwt.claim.api_key_id', key_record.id::text, false);
    PERFORM set_config('request.jwt.claim.scopes', key_record.scopes::text, false);
    PERFORM set_config('request.jwt.claim.role', 'authenticated', false);
    
    -- Update last_used_at timestamp in private schema
    UPDATE private.api_keys
    SET last_used_at = now(),
        total_requests = COALESCE(total_requests, 0) + 1,
        last_request_at = now()
    WHERE id = key_record.id;
    
    -- Return validation result
    RETURN QUERY SELECT 
      key_record.user_id,
      key_record.id,
      key_record.scopes,
      true;
  ELSE
    -- Invalid key
    RETURN QUERY SELECT 
      NULL::uuid,
      NULL::uuid,
      NULL::jsonb,
      false;
  END IF;
END;
$$;

-- Step 10: Update update_api_keys_updated_at function
CREATE OR REPLACE FUNCTION private.update_api_keys_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 11: Update log_api_key_usage function
CREATE OR REPLACE FUNCTION private.log_api_key_usage()
RETURNS TRIGGER AS $$
BEGIN
  -- Increment total_requests when last_used_at is updated
  IF NEW.last_used_at IS DISTINCT FROM OLD.last_used_at THEN
    NEW.total_requests = COALESCE(OLD.total_requests, 0) + 1;
    NEW.last_request_at = NEW.last_used_at;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 12: Update log_api_key_audit function
CREATE OR REPLACE FUNCTION private.log_api_key_audit()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.api_key_audit_log (api_key_id, user_id, action, metadata)
    VALUES (NEW.id, NEW.user_id, 'created', jsonb_build_object('name', NEW.name, 'expires_at', NEW.expires_at));
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.is_active = false AND OLD.is_active = true THEN
      INSERT INTO public.api_key_audit_log (api_key_id, user_id, action)
      VALUES (NEW.id, NEW.user_id, 'revoked');
    ELSIF NEW.key_hash != OLD.key_hash THEN
      INSERT INTO public.api_key_audit_log (api_key_id, user_id, action)
      VALUES (NEW.id, NEW.user_id, 'rotated');
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.api_key_audit_log (api_key_id, user_id, action)
    VALUES (OLD.id, OLD.user_id, 'deleted');
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Step 13: Recreate triggers on private.api_keys
CREATE TRIGGER update_api_keys_updated_at
  BEFORE UPDATE ON private.api_keys
  FOR EACH ROW
  EXECUTE FUNCTION private.update_api_keys_updated_at();

CREATE TRIGGER track_api_key_usage
  BEFORE UPDATE ON private.api_keys
  FOR EACH ROW
  EXECUTE FUNCTION private.log_api_key_usage();

CREATE TRIGGER audit_api_key_changes
  AFTER INSERT OR UPDATE OR DELETE ON private.api_keys
  FOR EACH ROW
  EXECUTE FUNCTION private.log_api_key_audit();

-- Step 14: Update api_key_audit_log foreign key to reference private.api_keys
ALTER TABLE public.api_key_audit_log 
  ADD CONSTRAINT api_key_audit_log_api_key_id_fkey 
  FOREIGN KEY (api_key_id) 
  REFERENCES private.api_keys(id) 
  ON DELETE CASCADE;

-- Step 15: Drop the old public.api_keys table
DROP TABLE IF EXISTS public.api_keys CASCADE;

-- Step 16: Drop old functions from public schema
DROP FUNCTION IF EXISTS public.update_api_keys_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.log_api_key_usage() CASCADE;
DROP FUNCTION IF EXISTS public.log_api_key_audit() CASCADE;

-- Step 17: Add helpful comments
COMMENT ON TABLE private.api_keys IS 
'API keys table stored in private schema for enhanced security. Access is controlled through RLS policies and the validate_api_key function.';

COMMENT ON FUNCTION public.validate_api_key IS 
'Validates an API key and sets RLS context. This function accesses the private.api_keys table securely and is the primary interface for API key authentication.';

-- Step 18: Grant necessary permissions
-- The SECURITY DEFINER functions will handle access to private.api_keys
-- No direct grants needed for private schema tables
GRANT USAGE ON SCHEMA private TO postgres, authenticated, service_role;
