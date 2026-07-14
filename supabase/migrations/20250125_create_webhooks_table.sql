-- Create webhooks table for user webhook configurations
CREATE TABLE IF NOT EXISTS webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  events TEXT[] NOT NULL DEFAULT '{}', -- Array of event types to listen for
  secret TEXT NOT NULL, -- Webhook signing secret
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  last_status TEXT, -- 'success', 'failed', or null
  failure_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT webhooks_user_id_name_key UNIQUE(user_id, name)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS webhooks_user_id_idx ON webhooks(user_id);
CREATE INDEX IF NOT EXISTS webhooks_is_active_idx ON webhooks(is_active);

-- Create webhook_logs table for tracking webhook deliveries
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  error_message TEXT,
  delivered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for webhook logs
CREATE INDEX IF NOT EXISTS webhook_logs_webhook_id_idx ON webhook_logs(webhook_id);
CREATE INDEX IF NOT EXISTS webhook_logs_delivered_at_idx ON webhook_logs(delivered_at DESC);

-- Enable RLS
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for webhooks
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'webhooks' 
    AND policyname = 'Users can view their own webhooks'
  ) THEN
    CREATE POLICY "Users can view their own webhooks"
      ON webhooks FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'webhooks' 
    AND policyname = 'Users can create their own webhooks'
  ) THEN
    CREATE POLICY "Users can create their own webhooks"
      ON webhooks FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'webhooks' 
    AND policyname = 'Users can update their own webhooks'
  ) THEN
    CREATE POLICY "Users can update their own webhooks"
      ON webhooks FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'webhooks' 
    AND policyname = 'Users can delete their own webhooks'
  ) THEN
    CREATE POLICY "Users can delete their own webhooks"
      ON webhooks FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- RLS Policies for webhook_logs
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'webhook_logs' 
    AND policyname = 'Users can view logs for their webhooks'
  ) THEN
    CREATE POLICY "Users can view logs for their webhooks"
      ON webhook_logs FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM webhooks
          WHERE webhooks.id = webhook_logs.webhook_id
          AND webhooks.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_webhooks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_webhooks_updated_at_trigger ON webhooks;
CREATE TRIGGER update_webhooks_updated_at_trigger
  BEFORE UPDATE ON webhooks
  FOR EACH ROW
  EXECUTE FUNCTION update_webhooks_updated_at();
