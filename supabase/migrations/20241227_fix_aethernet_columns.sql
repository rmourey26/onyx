-- Add missing columns to aethernet tables safely
-- This migration adds columns that may be missing from previous migrations

-- Add status column to aethernet_messages if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'aethernet_messages' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE public.aethernet_messages 
      ADD COLUMN status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('draft', 'sent', 'delivered', 'failed', 'expired'));
  END IF;
END $$;

-- Add sent_at column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'aethernet_messages' 
    AND column_name = 'sent_at'
  ) THEN
    ALTER TABLE public.aethernet_messages 
      ADD COLUMN sent_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Add thread_id column if it doesn't exist  
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'aethernet_messages' 
    AND column_name = 'thread_id'
  ) THEN
    ALTER TABLE public.aethernet_messages 
      ADD COLUMN thread_id UUID;
  END IF;
END $$;

-- Add parent_message_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'aethernet_messages' 
    AND column_name = 'parent_message_id'
  ) THEN
    ALTER TABLE public.aethernet_messages 
      ADD COLUMN parent_message_id UUID;
  END IF;
END $$;

-- Add self-referential foreign keys safely
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'fk_aethernet_messages_thread_id'
  ) THEN
    ALTER TABLE public.aethernet_messages 
      ADD CONSTRAINT fk_aethernet_messages_thread_id 
      FOREIGN KEY (thread_id) REFERENCES public.aethernet_messages(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'fk_aethernet_messages_parent_message_id'
  ) THEN
    ALTER TABLE public.aethernet_messages 
      ADD CONSTRAINT fk_aethernet_messages_parent_message_id 
      FOREIGN KEY (parent_message_id) REFERENCES public.aethernet_messages(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add indexes safely
CREATE INDEX IF NOT EXISTS idx_aethernet_messages_status ON public.aethernet_messages(status);
CREATE INDEX IF NOT EXISTS idx_aethernet_messages_sent_at ON public.aethernet_messages(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_aethernet_messages_thread_id ON public.aethernet_messages(thread_id);
