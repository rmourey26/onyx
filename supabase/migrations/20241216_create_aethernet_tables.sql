-- Create Aethernet messaging protocol tables
-- Reference: API_CHANGELOG_v1.4.0.md - Messaging System with Aethernet Protocol

-- Create Aethernet messages table
CREATE TABLE IF NOT EXISTS public.aethernet_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'standard' CHECK (message_type IN ('standard', 'alert', 'notification', 'system')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
  encrypted BOOLEAN DEFAULT false,
  encryption_method TEXT CHECK (encryption_method IN ('aes-256-gcm', 'rsa-oaep', 'none')),
  thread_id UUID REFERENCES public.aethernet_messages(id) ON DELETE SET NULL,
  parent_message_id UUID REFERENCES public.aethernet_messages(id) ON DELETE SET NULL,
  attachments JSONB DEFAULT '[]'::JSONB,
  metadata JSONB DEFAULT '{}'::JSONB,
  expires_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('draft', 'sent', 'delivered', 'failed', 'expired')),
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Aethernet message recipients table
CREATE TABLE IF NOT EXISTS public.aethernet_message_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aethernet_message_id UUID NOT NULL REFERENCES public.aethernet_messages(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_type TEXT NOT NULL DEFAULT 'to' CHECK (recipient_type IN ('to', 'cc', 'bcc')),
  delivery_status TEXT NOT NULL DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'delivered', 'failed', 'bounced')),
  read_status TEXT NOT NULL DEFAULT 'unread' CHECK (read_status IN ('unread', 'read')),
  read_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(aethernet_message_id, recipient_id)
);

-- Create Aethernet protocol settings table
CREATE TABLE IF NOT EXISTS public.aethernet_protocol_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  protocol_version TEXT NOT NULL DEFAULT 'v1.0',
  encryption_enabled BOOLEAN DEFAULT true,
  default_encryption_method TEXT DEFAULT 'aes-256-gcm',
  message_retention_days INTEGER DEFAULT 90,
  max_message_size_mb INTEGER DEFAULT 25,
  max_attachments_per_message INTEGER DEFAULT 10,
  allowed_file_types TEXT[] DEFAULT ARRAY['pdf', 'doc', 'docx', 'txt', 'jpg', 'png', 'csv'],
  notification_preferences JSONB DEFAULT '{
    "email": true,
    "push": true,
    "sms": false,
    "in_app": true
  }'::JSONB,
  auto_reply_settings JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create Aethernet delivery logs table for audit trail
CREATE TABLE IF NOT EXISTS public.aethernet_delivery_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.aethernet_messages(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('queued', 'processing', 'delivered', 'read', 'failed', 'bounced', 'expired')),
  event_timestamp TIMESTAMPTZ DEFAULT NOW(),
  details JSONB DEFAULT '{}'::JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_aethernet_messages_sender_id ON public.aethernet_messages(sender_id);
CREATE INDEX idx_aethernet_messages_thread_id ON public.aethernet_messages(thread_id);
CREATE INDEX idx_aethernet_messages_status ON public.aethernet_messages(status);
CREATE INDEX idx_aethernet_messages_sent_at ON public.aethernet_messages(sent_at DESC);
CREATE INDEX idx_aethernet_messages_priority ON public.aethernet_messages(priority);

CREATE INDEX idx_aethernet_recipients_message_id ON public.aethernet_message_recipients(aethernet_message_id);
CREATE INDEX idx_aethernet_recipients_recipient_id ON public.aethernet_message_recipients(recipient_id);
CREATE INDEX idx_aethernet_recipients_delivery_status ON public.aethernet_message_recipients(delivery_status);
CREATE INDEX idx_aethernet_recipients_read_status ON public.aethernet_message_recipients(read_status);

CREATE INDEX idx_aethernet_delivery_logs_message_id ON public.aethernet_delivery_logs(message_id);
CREATE INDEX idx_aethernet_delivery_logs_recipient_id ON public.aethernet_delivery_logs(recipient_id);
CREATE INDEX idx_aethernet_delivery_logs_event_type ON public.aethernet_delivery_logs(event_type);
CREATE INDEX idx_aethernet_delivery_logs_event_timestamp ON public.aethernet_delivery_logs(event_timestamp DESC);

-- Enable RLS
ALTER TABLE public.aethernet_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aethernet_message_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aethernet_protocol_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aethernet_delivery_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for aethernet_messages
CREATE POLICY "Users can view messages they sent"
  ON public.aethernet_messages
  FOR SELECT
  USING (sender_id = auth.uid());

CREATE POLICY "Users can view messages sent to them"
  ON public.aethernet_messages
  FOR SELECT
  USING (
    id IN (
      SELECT aethernet_message_id 
      FROM public.aethernet_message_recipients 
      WHERE recipient_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own messages"
  ON public.aethernet_messages
  FOR INSERT
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update their own messages"
  ON public.aethernet_messages
  FOR UPDATE
  USING (sender_id = auth.uid());

CREATE POLICY "Users can delete their own messages"
  ON public.aethernet_messages
  FOR DELETE
  USING (sender_id = auth.uid());

-- RLS Policies for aethernet_message_recipients
CREATE POLICY "Users can view recipients of their messages"
  ON public.aethernet_message_recipients
  FOR SELECT
  USING (
    aethernet_message_id IN (
      SELECT id FROM public.aethernet_messages WHERE sender_id = auth.uid()
    ) OR recipient_id = auth.uid()
  );

CREATE POLICY "Users can create recipients for their messages"
  ON public.aethernet_message_recipients
  FOR INSERT
  WITH CHECK (
    aethernet_message_id IN (
      SELECT id FROM public.aethernet_messages WHERE sender_id = auth.uid()
    )
  );

CREATE POLICY "Recipients can update their own status"
  ON public.aethernet_message_recipients
  FOR UPDATE
  USING (recipient_id = auth.uid());

-- RLS Policies for aethernet_protocol_settings
CREATE POLICY "Users can view their own protocol settings"
  ON public.aethernet_protocol_settings
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own protocol settings"
  ON public.aethernet_protocol_settings
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own protocol settings"
  ON public.aethernet_protocol_settings
  FOR UPDATE
  USING (user_id = auth.uid());

-- RLS Policies for aethernet_delivery_logs
CREATE POLICY "Users can view delivery logs for their messages"
  ON public.aethernet_delivery_logs
  FOR SELECT
  USING (
    message_id IN (
      SELECT id FROM public.aethernet_messages WHERE sender_id = auth.uid()
    ) OR recipient_id = auth.uid()
  );

-- Create function to send Aethernet message
CREATE OR REPLACE FUNCTION public.send_aethernet_message(
  p_subject TEXT,
  p_body TEXT,
  p_recipients UUID[],
  p_priority TEXT DEFAULT 'normal',
  p_encrypted BOOLEAN DEFAULT false,
  p_attachments JSONB DEFAULT '[]'::JSONB,
  p_thread_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_message_id UUID;
  v_recipient_id UUID;
BEGIN
  -- Insert message
  INSERT INTO public.aethernet_messages (
    sender_id,
    subject,
    body,
    priority,
    encrypted,
    attachments,
    thread_id,
    status
  ) VALUES (
    auth.uid(),
    p_subject,
    p_body,
    p_priority,
    p_encrypted,
    p_attachments,
    p_thread_id,
    'sent'
  )
  RETURNING id INTO v_message_id;

  -- Insert recipients
  FOREACH v_recipient_id IN ARRAY p_recipients
  LOOP
    INSERT INTO public.aethernet_message_recipients (
      aethernet_message_id,
      recipient_id,
      recipient_type,
      delivery_status
    ) VALUES (
      v_message_id,
      v_recipient_id,
      'to',
      'delivered'
    );

    -- Log delivery event
    INSERT INTO public.aethernet_delivery_logs (
      message_id,
      recipient_id,
      event_type,
      details
    ) VALUES (
      v_message_id,
      v_recipient_id,
      'delivered',
      jsonb_build_object('priority', p_priority)
    );
  END LOOP;

  RETURN v_message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to mark message as read
CREATE OR REPLACE FUNCTION public.mark_message_as_read(
  p_message_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.aethernet_message_recipients
  SET 
    read_status = 'read',
    read_at = NOW(),
    updated_at = NOW()
  WHERE 
    aethernet_message_id = p_message_id
    AND recipient_id = auth.uid()
    AND read_status = 'unread';

  IF FOUND THEN
    INSERT INTO public.aethernet_delivery_logs (
      message_id,
      recipient_id,
      event_type
    ) VALUES (
      p_message_id,
      auth.uid(),
      'read'
    );
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get message thread
CREATE OR REPLACE FUNCTION public.get_message_thread(
  p_thread_id UUID
)
RETURNS TABLE (
  id UUID,
  sender_id UUID,
  subject TEXT,
  body TEXT,
  priority TEXT,
  sent_at TIMESTAMPTZ,
  read_status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.sender_id,
    m.subject,
    m.body,
    m.priority,
    m.sent_at,
    COALESCE(r.read_status, 'unread') as read_status
  FROM public.aethernet_messages m
  LEFT JOIN public.aethernet_message_recipients r 
    ON r.aethernet_message_id = m.id AND r.recipient_id = auth.uid()
  WHERE m.thread_id = p_thread_id OR m.id = p_thread_id
  ORDER BY m.sent_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_aethernet_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_aethernet_messages_updated_at
  BEFORE UPDATE ON public.aethernet_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_aethernet_updated_at();

CREATE TRIGGER update_aethernet_recipients_updated_at
  BEFORE UPDATE ON public.aethernet_message_recipients
  FOR EACH ROW
  EXECUTE FUNCTION update_aethernet_updated_at();

CREATE TRIGGER update_aethernet_settings_updated_at
  BEFORE UPDATE ON public.aethernet_protocol_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_aethernet_updated_at();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.aethernet_messages TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.aethernet_message_recipients TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.aethernet_protocol_settings TO authenticated;
GRANT SELECT ON public.aethernet_delivery_logs TO authenticated;
GRANT EXECUTE ON FUNCTION public.send_aethernet_message TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_message_as_read TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_message_thread TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE public.aethernet_messages IS 'Aethernet protocol messaging system for decentralized communication';
COMMENT ON TABLE public.aethernet_message_recipients IS 'Message recipient tracking with delivery and read status';
COMMENT ON TABLE public.aethernet_protocol_settings IS 'User-specific Aethernet protocol configuration';
COMMENT ON TABLE public.aethernet_delivery_logs IS 'Audit trail for message delivery events';
COMMENT ON FUNCTION public.send_aethernet_message IS 'Send message via Aethernet protocol to multiple recipients';
COMMENT ON FUNCTION public.mark_message_as_read IS 'Mark message as read for current user';
COMMENT ON FUNCTION public.get_message_thread IS 'Retrieve all messages in a conversation thread';
