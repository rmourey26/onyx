-- =====================================================
-- Resend-It OAuth 2.1 and Extended API Tables - SAFE VERSION
-- =====================================================
-- This migration safely extends the existing OAuth infrastructure
-- It uses IF NOT EXISTS and DO blocks to prevent conflicts with:
-- - private.oauth_clients (from 20241216_enable_oauth_server_for_mcp.sql)
-- - private.oauth_authorization_codes (from 20241216_enable_oauth_server_for_mcp.sql)
-- - private.oauth_tokens (from 20241216_enable_oauth_server_for_mcp.sql)
-- - private.api_keys (from 20241211_move_api_keys_to_private_schema.sql)
-- =====================================================

-- =====================================================
-- PART 1: EMBEDDING DATASETS (NEW - Safe to add)
-- =====================================================

-- Embedding Datasets table - NEW table, safe to create
CREATE TABLE IF NOT EXISTS embedding_datasets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  embedding_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add dataset_id to data_embeddings if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'data_embeddings' 
    AND column_name = 'dataset_id'
  ) THEN
    ALTER TABLE data_embeddings ADD COLUMN dataset_id UUID REFERENCES embedding_datasets(id) ON DELETE SET NULL;
  END IF;
EXCEPTION
  WHEN undefined_table THEN
    -- data_embeddings table doesn't exist, skip
    NULL;
END $$;

-- Indexes for embedding datasets
CREATE INDEX IF NOT EXISTS idx_embedding_datasets_user ON embedding_datasets(user_id);
CREATE INDEX IF NOT EXISTS idx_embedding_datasets_name ON embedding_datasets(name);

-- RLS for embedding datasets
ALTER TABLE embedding_datasets ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'embedding_datasets' AND policyname = 'Users can manage their own datasets'
  ) THEN
    CREATE POLICY "Users can manage their own datasets"
      ON embedding_datasets FOR ALL
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- =====================================================
-- PART 2: PUBLIC OAUTH TABLES (For simplified API access)
-- These complement the private schema tables for different use cases
-- =====================================================

-- OAuth Auth Requests table (for login redirect flow state management)
-- This is a NEW table not in private schema
CREATE TABLE IF NOT EXISTS oauth_auth_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL,
  redirect_uri TEXT NOT NULL,
  scope TEXT,
  state TEXT,
  code_challenge TEXT,
  code_challenge_method TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '10 minutes'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for auth requests
CREATE INDEX IF NOT EXISTS idx_oauth_auth_requests_state ON oauth_auth_requests(state);
CREATE INDEX IF NOT EXISTS idx_oauth_auth_requests_expires ON oauth_auth_requests(expires_at);
CREATE INDEX IF NOT EXISTS idx_oauth_auth_requests_client ON oauth_auth_requests(client_id);

-- RLS for auth requests
ALTER TABLE oauth_auth_requests ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'oauth_auth_requests' AND policyname = 'Users can manage their own auth requests'
  ) THEN
    CREATE POLICY "Users can manage their own auth requests"
      ON oauth_auth_requests FOR ALL
      USING (auth.uid() = user_id OR user_id IS NULL);
  END IF;
END $$;

-- =====================================================
-- PART 3: EXTEND PRIVATE SCHEMA WITH ADDITIONAL COLUMNS
-- Safely add new columns without breaking existing data
-- =====================================================

-- Add pkce_method column to private.oauth_authorization_codes if not exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'private' AND table_name = 'oauth_authorization_codes'
  ) THEN
    -- Add nonce column for OIDC support if not exists
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'private' 
      AND table_name = 'oauth_authorization_codes' 
      AND column_name = 'nonce'
    ) THEN
      ALTER TABLE private.oauth_authorization_codes ADD COLUMN nonce TEXT;
    END IF;
  END IF;
END $$;

-- Add additional columns to private.oauth_clients if needed
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'private' AND table_name = 'oauth_clients'
  ) THEN
    -- Add contacts column for OIDC dynamic registration
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'private' 
      AND table_name = 'oauth_clients' 
      AND column_name = 'contacts'
    ) THEN
      ALTER TABLE private.oauth_clients ADD COLUMN contacts TEXT[];
    END IF;
    
    -- Add policy_uri column
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'private' 
      AND table_name = 'oauth_clients' 
      AND column_name = 'policy_uri'
    ) THEN
      ALTER TABLE private.oauth_clients ADD COLUMN policy_uri TEXT;
    END IF;
    
    -- Add tos_uri column
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'private' 
      AND table_name = 'oauth_clients' 
      AND column_name = 'tos_uri'
    ) THEN
      ALTER TABLE private.oauth_clients ADD COLUMN tos_uri TEXT;
    END IF;
  END IF;
END $$;

-- Add scopes column to private.oauth_tokens if it uses TEXT[] instead of TEXT
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'private' AND table_name = 'oauth_tokens'
  ) THEN
    -- Add issued_token_type for token exchange support
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'private' 
      AND table_name = 'oauth_tokens' 
      AND column_name = 'issued_token_type'
    ) THEN
      ALTER TABLE private.oauth_tokens ADD COLUMN issued_token_type TEXT DEFAULT 'urn:ietf:params:oauth:token-type:access_token';
    END IF;
  END IF;
END $$;

-- =====================================================
-- PART 4: CLEANUP FUNCTION (Safe token cleanup)
-- =====================================================

-- Function to clean up expired OAuth tokens (extends existing or creates new)
CREATE OR REPLACE FUNCTION cleanup_expired_oauth_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private
AS $$
BEGIN
  -- Clean up public schema tables
  DELETE FROM oauth_auth_requests WHERE expires_at < NOW();
  
  -- Clean up private schema tables if they exist
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'private' AND table_name = 'oauth_authorization_codes') THEN
    DELETE FROM private.oauth_authorization_codes WHERE expires_at < NOW();
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'private' AND table_name = 'oauth_tokens') THEN
    DELETE FROM private.oauth_tokens WHERE expires_at < NOW() AND revoked_at IS NULL;
  END IF;
END;
$$;

-- =====================================================
-- PART 5: HELPER VIEWS (Read-only access to private data)
-- =====================================================

-- Create a secure view for users to see their OAuth clients
CREATE OR REPLACE VIEW user_oauth_clients AS
SELECT 
  id,
  client_id,
  client_name,
  client_description,
  redirect_uris,
  allowed_scopes,
  is_active,
  created_at,
  updated_at
FROM private.oauth_clients
WHERE user_id = auth.uid();

-- Grant access to the view
GRANT SELECT ON user_oauth_clients TO authenticated;

-- =====================================================
-- PART 6: PERMISSIONS
-- =====================================================

-- Grant necessary permissions (safe - uses IF NOT EXISTS pattern)
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON embedding_datasets TO authenticated;
GRANT ALL ON oauth_auth_requests TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_oauth_tokens() TO authenticated;

-- =====================================================
-- PART 7: COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE embedding_datasets IS 'User-managed datasets for organizing vector embeddings';
COMMENT ON TABLE oauth_auth_requests IS 'Temporary storage for OAuth authorization request state (PKCE, state parameter)';
COMMENT ON FUNCTION cleanup_expired_oauth_tokens IS 'Removes expired OAuth tokens from both public and private schemas';
COMMENT ON VIEW user_oauth_clients IS 'Secure view allowing users to see their own OAuth clients without direct access to private schema';
