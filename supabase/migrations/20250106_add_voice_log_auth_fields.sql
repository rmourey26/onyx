-- Add missing auth fields to voice_execution_logs table
-- This migration is safe to run whether api_keys is in public or private schema

-- Add auth_method column
ALTER TABLE voice_execution_logs
ADD COLUMN IF NOT EXISTS auth_method VARCHAR(50) DEFAULT 'session';

-- Add api_key_id column without foreign key first
ALTER TABLE voice_execution_logs
ADD COLUMN IF NOT EXISTS api_key_id UUID;

-- Try to add foreign key to private.api_keys first (newer schema)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'private' AND table_name = 'api_keys'
  ) THEN
    ALTER TABLE voice_execution_logs
    ADD CONSTRAINT fk_voice_logs_api_key_private
    FOREIGN KEY (api_key_id) REFERENCES private.api_keys(id) ON DELETE SET NULL;
    
    RAISE NOTICE 'Created foreign key to private.api_keys';
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'api_keys'
  ) THEN
    ALTER TABLE voice_execution_logs
    ADD CONSTRAINT fk_voice_logs_api_key_public
    FOREIGN KEY (api_key_id) REFERENCES public.api_keys(id) ON DELETE SET NULL;
    
    RAISE NOTICE 'Created foreign key to public.api_keys';
  ELSE
    RAISE NOTICE 'No api_keys table found. Foreign key will need to be added manually after api_keys table is created.';
  END IF;
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE 'Foreign key constraint already exists';
  WHEN others THEN
    RAISE NOTICE 'Could not create foreign key: %. Continuing without it.', SQLERRM;
END
$$;

-- Add indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_voice_logs_auth_method ON voice_execution_logs(auth_method);
CREATE INDEX IF NOT EXISTS idx_voice_logs_api_key_id ON voice_execution_logs(api_key_id) WHERE api_key_id IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN voice_execution_logs.auth_method IS 'Authentication method used: session or api_key';
COMMENT ON COLUMN voice_execution_logs.api_key_id IS 'API key ID if authenticated via API key';
