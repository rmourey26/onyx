-- Add stored procedures for managing OAuth clients in private schema
-- These allow PostgREST to access private.oauth_clients via RPC calls

-- Function to register/create a new OAuth client
CREATE OR REPLACE FUNCTION register_oauth_client(
  p_client_name TEXT,
  p_client_description TEXT DEFAULT NULL,
  p_redirect_uris TEXT[] DEFAULT ARRAY[]::TEXT[],
  p_allowed_scopes TEXT[] DEFAULT ARRAY['openid', 'email', 'profile']::TEXT[]
)
RETURNS JSONB AS $$
DECLARE
  v_client_id TEXT;
  v_client_secret TEXT;
  v_client_secret_hash TEXT;
  v_user_id UUID;
BEGIN
  -- Get authenticated user ID
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Generate client ID and secret
  v_client_id := encode(gen_random_bytes(16), 'hex');
  v_client_secret := encode(gen_random_bytes(32), 'base64');
  v_client_secret_hash := crypt(v_client_secret, gen_salt('bf'));
  
  -- Insert new client
  INSERT INTO private.oauth_clients (
    client_id,
    client_secret_hash,
    client_name,
    client_description,
    user_id,
    redirect_uris,
    allowed_scopes,
    is_active
  ) VALUES (
    v_client_id,
    v_client_secret_hash,
    p_client_name,
    p_client_description,
    v_user_id,
    p_redirect_uris,
    p_allowed_scopes,
    true
  );
  
  -- Return client details (secret only shown once)
  RETURN jsonb_build_object(
    'client_id', v_client_id,
    'client_secret', v_client_secret,
    'client_name', p_client_name,
    'client_description', p_client_description,
    'redirect_uris', p_redirect_uris,
    'allowed_scopes', p_allowed_scopes
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, private, extensions;

-- Function to get user's OAuth clients
CREATE OR REPLACE FUNCTION get_user_oauth_clients()
RETURNS SETOF private.oauth_clients AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM private.oauth_clients
  WHERE user_id = auth.uid()
  ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, private, extensions;

-- Function to get a specific OAuth client by ID
CREATE OR REPLACE FUNCTION get_oauth_client_by_id(p_client_id TEXT)
RETURNS private.oauth_clients AS $$
DECLARE
  v_client private.oauth_clients;
BEGIN
  SELECT *
  INTO v_client
  FROM private.oauth_clients
  WHERE client_id = p_client_id
    AND user_id = auth.uid();
  
  RETURN v_client;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, private, extensions;

-- Function to update OAuth client
CREATE OR REPLACE FUNCTION update_oauth_client(
  p_client_id TEXT,
  p_client_name TEXT DEFAULT NULL,
  p_client_description TEXT DEFAULT NULL,
  p_redirect_uris TEXT[] DEFAULT NULL,
  p_allowed_scopes TEXT[] DEFAULT NULL,
  p_is_active BOOLEAN DEFAULT NULL
)
RETURNS private.oauth_clients AS $$
DECLARE
  v_client private.oauth_clients;
BEGIN
  UPDATE private.oauth_clients
  SET
    client_name = COALESCE(p_client_name, client_name),
    client_description = COALESCE(p_client_description, client_description),
    redirect_uris = COALESCE(p_redirect_uris, redirect_uris),
    allowed_scopes = COALESCE(p_allowed_scopes, allowed_scopes),
    is_active = COALESCE(p_is_active, is_active),
    updated_at = NOW()
  WHERE client_id = p_client_id
    AND user_id = auth.uid()
  RETURNING *
  INTO v_client;
  
  RETURN v_client;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, private, extensions;

-- Function to delete OAuth client
CREATE OR REPLACE FUNCTION delete_oauth_client(p_client_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_deleted BOOLEAN;
BEGIN
  DELETE FROM private.oauth_clients
  WHERE client_id = p_client_id
    AND user_id = auth.uid();
  
  v_deleted := FOUND;
  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, private, extensions;

-- Function to rotate OAuth client secret
CREATE OR REPLACE FUNCTION rotate_oauth_client_secret(p_client_id TEXT)
RETURNS JSONB AS $$
DECLARE
  v_new_secret TEXT;
  v_new_secret_hash TEXT;
  v_client_name TEXT;
BEGIN
  -- Check if client belongs to user
  SELECT client_name INTO v_client_name
  FROM private.oauth_clients
  WHERE client_id = p_client_id
    AND user_id = auth.uid();
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Client not found or unauthorized');
  END IF;
  
  -- Generate new secret
  v_new_secret := encode(gen_random_bytes(32), 'base64');
  v_new_secret_hash := crypt(v_new_secret, gen_salt('bf'));
  
  -- Update client secret
  UPDATE private.oauth_clients
  SET 
    client_secret_hash = v_new_secret_hash,
    updated_at = NOW()
  WHERE client_id = p_client_id
    AND user_id = auth.uid();
  
  -- Return new secret (only shown once)
  RETURN jsonb_build_object(
    'client_id', p_client_id,
    'client_secret', v_new_secret,
    'client_name', v_client_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, private, extensions;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION register_oauth_client(TEXT, TEXT, TEXT[], TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_oauth_clients() TO authenticated;
GRANT EXECUTE ON FUNCTION get_oauth_client_by_id(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_oauth_client(TEXT, TEXT, TEXT, TEXT[], TEXT[], BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_oauth_client(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION rotate_oauth_client_secret(TEXT) TO authenticated;

-- Add comments
COMMENT ON FUNCTION register_oauth_client(TEXT, TEXT, TEXT[], TEXT[]) IS 'Register a new OAuth 2.1 client';
COMMENT ON FUNCTION get_user_oauth_clients() IS 'Get all OAuth clients for the authenticated user';
COMMENT ON FUNCTION get_oauth_client_by_id(TEXT) IS 'Get a specific OAuth client by client_id';
COMMENT ON FUNCTION update_oauth_client(TEXT, TEXT, TEXT, TEXT[], TEXT[], BOOLEAN) IS 'Update OAuth client details';
COMMENT ON FUNCTION delete_oauth_client(TEXT) IS 'Delete an OAuth client';
COMMENT ON FUNCTION rotate_oauth_client_secret(TEXT) IS 'Rotate OAuth client secret and return new secret';
