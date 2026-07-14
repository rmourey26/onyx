-- Add scopes column for granular permissions
ALTER TABLE public.api_keys
ADD COLUMN IF NOT EXISTS scopes JSONB DEFAULT '[]'::jsonb;

-- Create index for scopes
CREATE INDEX IF NOT EXISTS idx_api_keys_scopes ON public.api_keys USING GIN (scopes);

-- Enable pgcrypto extension for secure hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create validation function that sets RLS context (following PDF best practices)
CREATE OR REPLACE FUNCTION public.validate_api_key(api_key text)
RETURNS TABLE (
  user_id uuid,
  api_key_id uuid,
  scopes jsonb,
  valid boolean
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  key_record public.api_keys;
  key_hash_to_check text;
BEGIN
  -- Hash the provided key using SHA-256 (matching current implementation)
  key_hash_to_check := encode(digest(api_key, 'sha256'), 'hex');
  
  -- Look up the key by hash
  SELECT * INTO key_record
  FROM public.api_keys
  WHERE key_hash = key_hash_to_check
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
  LIMIT 1;
  
  IF key_record IS NOT NULL THEN
    -- **CRITICAL: Set RLS context for the user**
    -- This allows RLS policies to work with API key authentication
    PERFORM set_config('request.jwt.claim.sub', key_record.user_id::text, false);
    PERFORM set_config('request.jwt.claim.api_key_id', key_record.id::text, false);
    PERFORM set_config('request.jwt.claim.scopes', key_record.scopes::text, false);
    PERFORM set_config('request.jwt.claim.role', 'authenticated', false);
    
    -- Update last_used_at timestamp
    UPDATE public.api_keys
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

-- Grant execute permission to authenticated and anon users
GRANT EXECUTE ON FUNCTION public.validate_api_key(text) TO authenticated, anon;

-- Create helper function to check if a scope is allowed
CREATE OR REPLACE FUNCTION public.has_api_key_scope(required_scope text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_scopes jsonb;
BEGIN
  -- Get scopes from session config
  user_scopes := current_setting('request.jwt.claim.scopes', true)::jsonb;
  
  -- If no scopes set, deny access
  IF user_scopes IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if required scope exists in user's scopes
  RETURN user_scopes ? required_scope;
END;
$$;

GRANT EXECUTE ON FUNCTION public.has_api_key_scope(text) TO authenticated, anon;

-- Create function to get current API key user (works with both JWT and API key auth)
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Try to get user from JWT claim (set by validate_api_key or regular auth)
  RETURN COALESCE(
    current_setting('request.jwt.claim.sub', true)::uuid,
    auth.uid()
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.current_user_id() TO authenticated, anon;

-- Update RLS policies to work with API key authentication
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own API keys" ON public.api_keys;
DROP POLICY IF EXISTS "Users can create their own API keys" ON public.api_keys;
DROP POLICY IF EXISTS "Users can update their own API keys" ON public.api_keys;
DROP POLICY IF EXISTS "Users can delete their own API keys" ON public.api_keys;

-- Recreate policies using current_user_id() function
CREATE POLICY "Users can view their own API keys"
  ON public.api_keys
  FOR SELECT
  USING (public.current_user_id() = user_id);

CREATE POLICY "Users can create their own API keys"
  ON public.api_keys
  FOR INSERT
  WITH CHECK (public.current_user_id() = user_id);

CREATE POLICY "Users can update their own API keys"
  ON public.api_keys
  FOR UPDATE
  USING (public.current_user_id() = user_id);

CREATE POLICY "Users can delete their own API keys"
  ON public.api_keys
  FOR DELETE
  USING (public.current_user_id() = user_id);

-- Add comment explaining the security model
COMMENT ON FUNCTION public.validate_api_key IS 
'Validates an API key and sets RLS context. This function is called before each API request to establish user identity for Row Level Security policies. It follows Supabase best practices by using set_config to set request.jwt.claim.* variables.';

COMMENT ON FUNCTION public.has_api_key_scope IS
'Checks if the current API key has a specific scope. Use this in RLS policies for granular permission control.';

COMMENT ON COLUMN public.api_keys.scopes IS
'Array of permission scopes for this API key (e.g., ["read:assets", "write:workflows"]). Used for granular access control.';
