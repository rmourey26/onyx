-- Enable OAuth 2.1 Server for Model Context Protocol (MCP) Authentication
-- Reference: https://supabase.com/docs/guides/auth/oauth-server/mcp-authentication

-- Create OAuth clients table for MCP authentication
CREATE TABLE IF NOT EXISTS private.oauth_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT UNIQUE NOT NULL,
  client_secret_hash TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_description TEXT,
  client_uri TEXT,
  logo_uri TEXT,
  redirect_uris TEXT[] NOT NULL DEFAULT '{}',
  allowed_scopes TEXT[] NOT NULL DEFAULT '{}',
  grant_types TEXT[] NOT NULL DEFAULT ARRAY['authorization_code', 'refresh_token'],
  response_types TEXT[] NOT NULL DEFAULT ARRAY['code'],
  token_endpoint_auth_method TEXT DEFAULT 'client_secret_basic',
  is_dynamic_registration BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_oauth_clients_client_id ON private.oauth_clients(client_id);
CREATE INDEX idx_oauth_clients_user_id ON private.oauth_clients(user_id);
CREATE INDEX idx_oauth_clients_is_active ON private.oauth_clients(is_active);

-- Create OAuth authorization codes table
CREATE TABLE IF NOT EXISTS private.oauth_authorization_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  client_id TEXT NOT NULL REFERENCES private.oauth_clients(client_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  redirect_uri TEXT NOT NULL,
  scope TEXT[] DEFAULT '{}',
  code_challenge TEXT,
  code_challenge_method TEXT CHECK (code_challenge_method IN ('S256', 'plain')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '10 minutes'),
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for authorization codes
CREATE INDEX idx_oauth_authorization_codes_code ON private.oauth_authorization_codes(code);
CREATE INDEX idx_oauth_authorization_codes_client_id ON private.oauth_authorization_codes(client_id);
CREATE INDEX idx_oauth_authorization_codes_user_id ON private.oauth_authorization_codes(user_id);

-- Create OAuth tokens table for tracking
CREATE TABLE IF NOT EXISTS private.oauth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  access_token_hash TEXT UNIQUE NOT NULL,
  refresh_token_hash TEXT UNIQUE,
  client_id TEXT NOT NULL REFERENCES private.oauth_clients(client_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scope TEXT[] DEFAULT '{}',
  token_type TEXT DEFAULT 'Bearer',
  expires_at TIMESTAMPTZ NOT NULL,
  refresh_expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for tokens
CREATE INDEX idx_oauth_tokens_access_token_hash ON private.oauth_tokens(access_token_hash);
CREATE INDEX idx_oauth_tokens_refresh_token_hash ON private.oauth_tokens(refresh_token_hash);
CREATE INDEX idx_oauth_tokens_client_id ON private.oauth_tokens(client_id);
CREATE INDEX idx_oauth_tokens_user_id ON private.oauth_tokens(user_id);

-- Create function to validate OAuth client
CREATE OR REPLACE FUNCTION private.validate_oauth_client(
  p_client_id TEXT,
  p_client_secret TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_client_secret_hash TEXT;
  v_is_active BOOLEAN;
BEGIN
  SELECT client_secret_hash, is_active
  INTO v_client_secret_hash, v_is_active
  FROM private.oauth_clients
  WHERE client_id = p_client_id;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  IF NOT v_is_active THEN
    RETURN FALSE;
  END IF;

  -- Verify client secret using pgcrypto
  RETURN v_client_secret_hash = crypt(p_client_secret, v_client_secret_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to register OAuth client (for dynamic registration)
CREATE OR REPLACE FUNCTION private.register_oauth_client(
  p_client_name TEXT,
  p_client_description TEXT,
  p_redirect_uris TEXT[],
  p_allowed_scopes TEXT[],
  p_user_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_client_id TEXT;
  v_client_secret TEXT;
  v_client_secret_hash TEXT;
  v_client JSONB;
BEGIN
  -- Generate client ID and secret
  v_client_id := 'mcp_' || gen_random_uuid()::TEXT;
  v_client_secret := encode(gen_random_bytes(32), 'base64');
  v_client_secret_hash := crypt(v_client_secret, gen_salt('bf'));

  -- Insert client
  INSERT INTO private.oauth_clients (
    client_id,
    client_secret_hash,
    client_name,
    client_description,
    redirect_uris,
    allowed_scopes,
    is_dynamic_registration,
    user_id
  ) VALUES (
    v_client_id,
    v_client_secret_hash,
    p_client_name,
    p_client_description,
    p_redirect_uris,
    p_allowed_scopes,
    TRUE,
    COALESCE(p_user_id, auth.uid())
  )
  RETURNING jsonb_build_object(
    'client_id', client_id,
    'client_name', client_name,
    'redirect_uris', redirect_uris,
    'allowed_scopes', allowed_scopes,
    'created_at', created_at
  ) INTO v_client;

  -- Return client details with secret (only shown once)
  RETURN v_client || jsonb_build_object('client_secret', v_client_secret);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to create authorization code
CREATE OR REPLACE FUNCTION private.create_authorization_code(
  p_client_id TEXT,
  p_user_id UUID,
  p_redirect_uri TEXT,
  p_scope TEXT[],
  p_code_challenge TEXT DEFAULT NULL,
  p_code_challenge_method TEXT DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
  v_code TEXT;
BEGIN
  -- Generate authorization code
  v_code := encode(gen_random_bytes(32), 'base64url');

  -- Insert authorization code
  INSERT INTO private.oauth_authorization_codes (
    code,
    client_id,
    user_id,
    redirect_uri,
    scope,
    code_challenge,
    code_challenge_method
  ) VALUES (
    v_code,
    p_client_id,
    p_user_id,
    p_redirect_uri,
    p_scope,
    p_code_challenge,
    p_code_challenge_method
  );

  RETURN v_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to validate and exchange authorization code
CREATE OR REPLACE FUNCTION private.exchange_authorization_code(
  p_code TEXT,
  p_client_id TEXT,
  p_redirect_uri TEXT,
  p_code_verifier TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_auth_code RECORD;
  v_valid BOOLEAN := FALSE;
BEGIN
  -- Get authorization code
  SELECT *
  INTO v_auth_code
  FROM private.oauth_authorization_codes
  WHERE code = p_code
    AND client_id = p_client_id
    AND redirect_uri = p_redirect_uri
    AND used_at IS NULL
    AND expires_at > NOW();

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'invalid_grant', 'error_description', 'Invalid or expired authorization code');
  END IF;

  -- Validate PKCE if present
  IF v_auth_code.code_challenge IS NOT NULL THEN
    IF p_code_verifier IS NULL THEN
      RETURN jsonb_build_object('error', 'invalid_request', 'error_description', 'Code verifier required');
    END IF;

    IF v_auth_code.code_challenge_method = 'S256' THEN
      v_valid := v_auth_code.code_challenge = encode(digest(p_code_verifier, 'sha256'), 'base64url');
    ELSIF v_auth_code.code_challenge_method = 'plain' THEN
      v_valid := v_auth_code.code_challenge = p_code_verifier;
    END IF;

    IF NOT v_valid THEN
      RETURN jsonb_build_object('error', 'invalid_grant', 'error_description', 'Invalid code verifier');
    END IF;
  END IF;

  -- Mark code as used
  UPDATE private.oauth_authorization_codes
  SET used_at = NOW()
  WHERE code = p_code;

  -- Return success with user ID and scope
  RETURN jsonb_build_object(
    'user_id', v_auth_code.user_id,
    'scope', v_auth_code.scope,
    'client_id', v_auth_code.client_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to revoke OAuth tokens
CREATE OR REPLACE FUNCTION private.revoke_oauth_token(
  p_token_hash TEXT,
  p_token_type TEXT DEFAULT 'access'
)
RETURNS BOOLEAN AS $$
BEGIN
  IF p_token_type = 'access' THEN
    UPDATE private.oauth_tokens
    SET revoked_at = NOW()
    WHERE access_token_hash = p_token_hash
      AND revoked_at IS NULL;
  ELSIF p_token_type = 'refresh' THEN
    UPDATE private.oauth_tokens
    SET revoked_at = NOW()
    WHERE refresh_token_hash = p_token_hash
      AND revoked_at IS NULL;
  END IF;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE private.oauth_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.oauth_authorization_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.oauth_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies for OAuth clients
CREATE POLICY "Users can view their own OAuth clients"
  ON private.oauth_clients
  FOR SELECT
  USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can create OAuth clients"
  ON private.oauth_clients
  FOR INSERT
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can update their own OAuth clients"
  ON private.oauth_clients
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own OAuth clients"
  ON private.oauth_clients
  FOR DELETE
  USING (user_id = auth.uid());

-- Grant necessary permissions
GRANT SELECT, INSERT ON private.oauth_clients TO authenticated;
GRANT EXECUTE ON FUNCTION private.validate_oauth_client TO authenticated;
GRANT EXECUTE ON FUNCTION private.register_oauth_client TO authenticated;
GRANT EXECUTE ON FUNCTION private.create_authorization_code TO authenticated;
GRANT EXECUTE ON FUNCTION private.exchange_authorization_code TO authenticated;
GRANT EXECUTE ON FUNCTION private.revoke_oauth_token TO authenticated;

-- Add comment for documentation
COMMENT ON TABLE private.oauth_clients IS 'OAuth 2.1 clients for Model Context Protocol (MCP) authentication';
COMMENT ON FUNCTION private.register_oauth_client IS 'Register new OAuth client for MCP - supports dynamic registration';
COMMENT ON FUNCTION private.validate_oauth_client IS 'Validate OAuth client credentials';
COMMENT ON FUNCTION private.create_authorization_code IS 'Create authorization code with PKCE support';
COMMENT ON FUNCTION private.exchange_authorization_code IS 'Exchange authorization code for access token';
