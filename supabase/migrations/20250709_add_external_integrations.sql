-- Drop existing types if they exist to avoid conflicts
DROP TYPE IF EXISTS integration_provider;
DROP TYPE IF EXISTS integration_status;
DROP TYPE IF EXISTS sync_status;

-- Create ENUM types for provider, status, and sync_status
CREATE TYPE integration_provider AS ENUM ('shopify', 'wix');
CREATE TYPE integration_status AS ENUM ('active', 'revoked', 'error', 'pending');
CREATE TYPE sync_status AS ENUM ('idle', 'syncing', 'completed', 'failed');

-- Create the external_integrations table
CREATE TABLE IF NOT EXISTS external_integrations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider integration_provider NOT NULL,
    provider_shop_id TEXT, -- For Shopify
    provider_site_id TEXT, -- For Wix
    encrypted_access_token BYTEA NOT NULL,
    scopes TEXT[],
    status integration_status NOT NULL DEFAULT 'pending',
    sync_status sync_status NOT NULL DEFAULT 'idle',
    last_sync_at TIMESTAMPTZ,
    sync_error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, provider, provider_shop_id),
    UNIQUE(user_id, provider, provider_site_id)
);

-- Add comments for clarity
COMMENT ON COLUMN external_integrations.encrypted_access_token IS 'Access token encrypted using a secure key management system.';
COMMENT ON COLUMN external_integrations.provider_shop_id IS 'The unique shop identifier from Shopify (e.g., your-store.myshopify.com).';
COMMENT ON COLUMN external_integrations.provider_site_id IS 'The unique site identifier from Wix.';

-- Enable Row Level Security
ALTER TABLE external_integrations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to redefine them
DROP POLICY IF EXISTS "Users can view their own integrations" ON external_integrations;
DROP POLICY IF EXISTS "Users can insert their own integrations" ON external_integrations;
DROP POLICY IF EXISTS "Users can update their own integrations" ON external_integrations;
DROP POLICY IF EXISTS "Users can delete their own integrations" ON external_integrations;

-- Define RLS policies
CREATE POLICY "Users can view their own integrations"
ON external_integrations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own integrations"
ON external_integrations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own integrations"
ON external_integrations FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own integrations"
ON external_integrations FOR DELETE
USING (auth.uid() = user_id);

-- Trigger to update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_external_integrations_updated ON external_integrations;
CREATE TRIGGER on_external_integrations_updated
BEFORE UPDATE ON external_integrations
FOR EACH ROW
EXECUTE PROCEDURE handle_updated_at();
