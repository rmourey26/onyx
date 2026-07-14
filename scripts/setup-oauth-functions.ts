// This script sets up the OAuth client management functions in Supabase
// Run this to initialize the OAuth 2.1 server functionality

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function setupOAuthFunctions() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  console.log('Setting up OAuth client management functions...')

  // SQL to create all OAuth functions
  const sql = `
-- Function to register/create a new OAuth client
CREATE OR REPLACE FUNCTION public.register_oauth_client(
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
CREATE OR REPLACE FUNCTION public.get_user_oauth_clients()
RETURNS TABLE (
  client_id TEXT,
  client_name TEXT,
  client_description TEXT,
  redirect_uris TEXT[],
  allowed_scopes TEXT[],
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.client_id,
    c.client_name,
    c.client_description,
    c.redirect_uris,
    c.allowed_scopes,
    c.is_active,
    c.created_at,
    c.updated_at
  FROM private.oauth_clients c
  WHERE c.user_id = auth.uid()
  ORDER BY c.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, private, extensions;

-- Function to update OAuth client
CREATE OR REPLACE FUNCTION public.update_oauth_client(
  p_client_id TEXT,
  p_client_name TEXT DEFAULT NULL,
  p_client_description TEXT DEFAULT NULL,
  p_redirect_uris TEXT[] DEFAULT NULL,
  p_allowed_scopes TEXT[] DEFAULT NULL,
  p_is_active BOOLEAN DEFAULT NULL
)
RETURNS TABLE (
  client_id TEXT,
  client_name TEXT,
  client_description TEXT,
  redirect_uris TEXT[],
  allowed_scopes TEXT[],
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  UPDATE private.oauth_clients
  SET
    client_name = COALESCE(p_client_name, private.oauth_clients.client_name),
    client_description = COALESCE(p_client_description, private.oauth_clients.client_description),
    redirect_uris = COALESCE(p_redirect_uris, private.oauth_clients.redirect_uris),
    allowed_scopes = COALESCE(p_allowed_scopes, private.oauth_clients.allowed_scopes),
    is_active = COALESCE(p_is_active, private.oauth_clients.is_active),
    updated_at = NOW()
  WHERE private.oauth_clients.client_id = p_client_id
    AND private.oauth_clients.user_id = auth.uid()
  RETURNING 
    private.oauth_clients.client_id,
    private.oauth_clients.client_name,
    private.oauth_clients.client_description,
    private.oauth_clients.redirect_uris,
    private.oauth_clients.allowed_scopes,
    private.oauth_clients.is_active,
    private.oauth_clients.created_at,
    private.oauth_clients.updated_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, private, extensions;

-- Function to delete OAuth client
CREATE OR REPLACE FUNCTION public.delete_oauth_client(p_client_id TEXT)
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
CREATE OR REPLACE FUNCTION public.rotate_oauth_client_secret(p_client_id TEXT)
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
GRANT EXECUTE ON FUNCTION public.register_oauth_client(TEXT, TEXT, TEXT[], TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_oauth_clients() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_oauth_client(TEXT, TEXT, TEXT, TEXT[], TEXT[], BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_oauth_client(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rotate_oauth_client_secret(TEXT) TO authenticated;
  `

  try {
    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql })

    if (error) {
      console.error('Error setting up OAuth functions:', error)
      return
    }

    console.log('✅ OAuth functions created successfully!')
    console.log('The following functions are now available:')
    console.log('  - register_oauth_client')
    console.log('  - get_user_oauth_clients')
    console.log('  - update_oauth_client')
    console.log('  - delete_oauth_client')
    console.log('  - rotate_oauth_client_secret')
  } catch (error) {
    console.error('Error:', error)
  }
}

setupOAuthFunctions()
