-- Migration: Update validate_api_key search_path to include extensions and private schemas
-- This ensures the function can access extensions (like pgcrypto) and private schema objects

-- Update validate_api_key function with expanded search_path
CREATE OR REPLACE FUNCTION public.validate_api_key(api_key text)
RETURNS TABLE (
  user_id uuid,
  api_key_id uuid,
  scopes jsonb,
  valid boolean
) 
SECURITY DEFINER
-- Added extensions and private schemas to search_path
SET search_path = public, extensions, private
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

-- Ensure permissions are maintained
GRANT EXECUTE ON FUNCTION public.validate_api_key(text) TO authenticated, anon;

-- Add comment documenting the search_path change
COMMENT ON FUNCTION public.validate_api_key IS 
'Validates an API key and sets RLS context. This function is called before each API request to establish user identity for Row Level Security policies. Search path includes public, extensions, and private schemas to access all necessary objects and functions.';
