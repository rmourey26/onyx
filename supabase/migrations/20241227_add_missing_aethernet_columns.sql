-- Safe migration to add missing columns to existing aethernet_messages table
-- This handles cases where the table exists but is missing some columns

-- Add priority column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'aethernet_messages' 
    AND column_name = 'priority'
  ) THEN
    ALTER TABLE public.aethernet_messages 
      ADD COLUMN priority TEXT NOT NULL DEFAULT 'normal' 
      CHECK (priority IN ('low', 'normal', 'high', 'critical'));
  END IF;
END $$;

-- Add message_type column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'aethernet_messages' 
    AND column_name = 'message_type'
  ) THEN
    ALTER TABLE public.aethernet_messages 
      ADD COLUMN message_type TEXT NOT NULL DEFAULT 'standard' 
      CHECK (message_type IN ('standard', 'alert', 'notification', 'system'));
  END IF;
END $$;

-- Add encrypted column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'aethernet_messages' 
    AND column_name = 'encrypted'
  ) THEN
    ALTER TABLE public.aethernet_messages 
      ADD COLUMN encrypted BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Add encryption_method column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'aethernet_messages' 
    AND column_name = 'encryption_method'
  ) THEN
    ALTER TABLE public.aethernet_messages 
      ADD COLUMN encryption_method TEXT 
      CHECK (encryption_method IN ('aes-256-gcm', 'rsa-oaep', 'none'));
  END IF;
END $$;

-- Add attachments column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'aethernet_messages' 
    AND column_name = 'attachments'
  ) THEN
    ALTER TABLE public.aethernet_messages 
      ADD COLUMN attachments JSONB DEFAULT '[]'::JSONB;
  END IF;
END $$;

-- Add metadata column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'aethernet_messages' 
    AND column_name = 'metadata'
  ) THEN
    ALTER TABLE public.aethernet_messages 
      ADD COLUMN metadata JSONB DEFAULT '{}'::JSONB;
  END IF;
END $$;

-- Add expires_at column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'aethernet_messages' 
    AND column_name = 'expires_at'
  ) THEN
    ALTER TABLE public.aethernet_messages 
      ADD COLUMN expires_at TIMESTAMPTZ;
  END IF;
END $$;

-- Now safely create indexes (they will only be created if they don't exist)
CREATE INDEX IF NOT EXISTS idx_aethernet_messages_priority ON public.aethernet_messages(priority);
CREATE INDEX IF NOT EXISTS idx_aethernet_messages_sender_id ON public.aethernet_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_aethernet_messages_thread_id ON public.aethernet_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_aethernet_messages_status ON public.aethernet_messages(status);
CREATE INDEX IF NOT EXISTS idx_aethernet_messages_sent_at ON public.aethernet_messages(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_aethernet_messages_created_at ON public.aethernet_messages(created_at DESC);
