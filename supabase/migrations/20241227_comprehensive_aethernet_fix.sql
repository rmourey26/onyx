-- Comprehensive migration to add all missing AetherNet columns
-- This is safe to run multiple times - it checks for existing columns first

-- Add missing columns to aethernet_messages table
DO $$
BEGIN
  -- Add thread_id if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='aethernet_messages' AND column_name='thread_id') THEN
    ALTER TABLE public.aethernet_messages ADD COLUMN thread_id UUID;
  END IF;

  -- Add parent_message_id if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='aethernet_messages' AND column_name='parent_message_id') THEN
    ALTER TABLE public.aethernet_messages ADD COLUMN parent_message_id UUID;
  END IF;

  -- Add message_type if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='aethernet_messages' AND column_name='message_type') THEN
    ALTER TABLE public.aethernet_messages ADD COLUMN message_type TEXT NOT NULL DEFAULT 'standard' CHECK (message_type IN ('standard', 'alert', 'notification', 'system'));
  END IF;

  -- Add priority if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='aethernet_messages' AND column_name='priority') THEN
    ALTER TABLE public.aethernet_messages ADD COLUMN priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical'));
  END IF;

  -- Add encrypted if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='aethernet_messages' AND column_name='encrypted') THEN
    ALTER TABLE public.aethernet_messages ADD COLUMN encrypted BOOLEAN DEFAULT false;
  END IF;

  -- Add encryption_method if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='aethernet_messages' AND column_name='encryption_method') THEN
    ALTER TABLE public.aethernet_messages ADD COLUMN encryption_method TEXT CHECK (encryption_method IN ('aes-256-gcm', 'rsa-oaep', 'none'));
  END IF;

  -- Add attachments if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='aethernet_messages' AND column_name='attachments') THEN
    ALTER TABLE public.aethernet_messages ADD COLUMN attachments JSONB DEFAULT '[]'::JSONB;
  END IF;

  -- Add metadata if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='aethernet_messages' AND column_name='metadata') THEN
    ALTER TABLE public.aethernet_messages ADD COLUMN metadata JSONB DEFAULT '{}'::JSONB;
  END IF;

  -- Add expires_at if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='aethernet_messages' AND column_name='expires_at') THEN
    ALTER TABLE public.aethernet_messages ADD COLUMN expires_at TIMESTAMPTZ;
  END IF;

  -- Add status if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='aethernet_messages' AND column_name='status') THEN
    ALTER TABLE public.aethernet_messages ADD COLUMN status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('draft', 'sent', 'delivered', 'failed', 'expired'));
  END IF;

  -- Add sent_at if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='aethernet_messages' AND column_name='sent_at') THEN
    ALTER TABLE public.aethernet_messages ADD COLUMN sent_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Add missing columns to aethernet_message_recipients table (if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='aethernet_message_recipients') THEN
    -- Add recipient_type if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='aethernet_message_recipients' AND column_name='recipient_type') THEN
      ALTER TABLE public.aethernet_message_recipients ADD COLUMN recipient_type TEXT NOT NULL DEFAULT 'to' CHECK (recipient_type IN ('to', 'cc', 'bcc'));
    END IF;

    -- Add delivery_status if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='aethernet_message_recipients' AND column_name='delivery_status') THEN
      ALTER TABLE public.aethernet_message_recipients ADD COLUMN delivery_status TEXT NOT NULL DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'delivered', 'failed', 'bounced'));
    END IF;

    -- Add read_status if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='aethernet_message_recipients' AND column_name='read_status') THEN
      ALTER TABLE public.aethernet_message_recipients ADD COLUMN read_status TEXT NOT NULL DEFAULT 'unread' CHECK (read_status IN ('unread', 'read'));
    END IF;

    -- Add read_at if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='aethernet_message_recipients' AND column_name='read_at') THEN
      ALTER TABLE public.aethernet_message_recipients ADD COLUMN read_at TIMESTAMPTZ;
    END IF;

    -- Add delivered_at if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='aethernet_message_recipients' AND column_name='delivered_at') THEN
      ALTER TABLE public.aethernet_message_recipients ADD COLUMN delivered_at TIMESTAMPTZ;
    END IF;

    -- Add error_message if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='aethernet_message_recipients' AND column_name='error_message') THEN
      ALTER TABLE public.aethernet_message_recipients ADD COLUMN error_message TEXT;
    END IF;

    -- Add metadata if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='aethernet_message_recipients' AND column_name='metadata') THEN
      ALTER TABLE public.aethernet_message_recipients ADD COLUMN metadata JSONB DEFAULT '{}'::JSONB;
    END IF;
  END IF;
END $$;

-- Add foreign key constraints if they don't exist
DO $$
BEGIN
  -- Add thread_id foreign key if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='fk_aethernet_messages_thread_id') THEN
    ALTER TABLE public.aethernet_messages 
      ADD CONSTRAINT fk_aethernet_messages_thread_id 
      FOREIGN KEY (thread_id) REFERENCES public.aethernet_messages(id) ON DELETE SET NULL;
  END IF;

  -- Add parent_message_id foreign key if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='fk_aethernet_messages_parent_message_id') THEN
    ALTER TABLE public.aethernet_messages 
      ADD CONSTRAINT fk_aethernet_messages_parent_message_id 
      FOREIGN KEY (parent_message_id) REFERENCES public.aethernet_messages(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_aethernet_messages_sender_id ON public.aethernet_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_aethernet_messages_thread_id ON public.aethernet_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_aethernet_messages_status ON public.aethernet_messages(status);
CREATE INDEX IF NOT EXISTS idx_aethernet_messages_sent_at ON public.aethernet_messages(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_aethernet_messages_priority ON public.aethernet_messages(priority);
CREATE INDEX IF NOT EXISTS idx_aethernet_messages_created_at ON public.aethernet_messages(created_at DESC);

-- Create indexes for recipients table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='aethernet_message_recipients') THEN
    CREATE INDEX IF NOT EXISTS idx_aethernet_recipients_message_id ON public.aethernet_message_recipients(aethernet_message_id);
    CREATE INDEX IF NOT EXISTS idx_aethernet_recipients_recipient_id ON public.aethernet_message_recipients(recipient_id);
    CREATE INDEX IF NOT EXISTS idx_aethernet_recipients_delivery_status ON public.aethernet_message_recipients(delivery_status);
    CREATE INDEX IF NOT EXISTS idx_aethernet_recipients_read_status ON public.aethernet_message_recipients(read_status);
  END IF;
END $$;

-- Add comment
COMMENT ON TABLE public.aethernet_messages IS 'Aethernet protocol messaging system - Updated with all required columns';
