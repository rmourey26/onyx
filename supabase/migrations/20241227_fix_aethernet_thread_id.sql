-- Fix AetherNet thread_id column and constraints
-- This migration safely adds the thread_id column if it doesn't exist

-- Check and add thread_id column to aethernet_messages if it doesn't exist
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

-- Drop existing constraint if it exists (to allow re-creation)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_aethernet_messages_thread_id' 
    AND table_name = 'aethernet_messages'
  ) THEN
    ALTER TABLE public.aethernet_messages 
    DROP CONSTRAINT fk_aethernet_messages_thread_id;
  END IF;
END $$;

-- Add the foreign key constraint
ALTER TABLE public.aethernet_messages 
  ADD CONSTRAINT fk_aethernet_messages_thread_id 
  FOREIGN KEY (thread_id) REFERENCES public.aethernet_messages(id) ON DELETE SET NULL;

-- Check and add parent_message_id column if it doesn't exist
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

-- Drop existing parent_message_id constraint if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_aethernet_messages_parent_message_id' 
    AND table_name = 'aethernet_messages'
  ) THEN
    ALTER TABLE public.aethernet_messages 
    DROP CONSTRAINT fk_aethernet_messages_parent_message_id;
  END IF;
END $$;

-- Add the parent_message_id foreign key constraint
ALTER TABLE public.aethernet_messages 
  ADD CONSTRAINT fk_aethernet_messages_parent_message_id 
  FOREIGN KEY (parent_message_id) REFERENCES public.aethernet_messages(id) ON DELETE SET NULL;

-- Create index for thread_id if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_aethernet_messages_thread_id 
  ON public.aethernet_messages(thread_id);

-- Create index for parent_message_id if it doesn't exist  
CREATE INDEX IF NOT EXISTS idx_aethernet_messages_parent_message_id 
  ON public.aethernet_messages(parent_message_id);

COMMENT ON COLUMN public.aethernet_messages.thread_id IS 'Groups related messages into a conversation thread';
COMMENT ON COLUMN public.aethernet_messages.parent_message_id IS 'References the message being replied to';
