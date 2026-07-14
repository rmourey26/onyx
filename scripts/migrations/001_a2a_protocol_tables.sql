-- ============================================================================
-- KRONOVA A2A PROTOCOL SCHEMA MIGRATION
-- Agent2Agent (A2A) Protocol Interoperability Tables
-- Version: 1.0.0
-- Date: 2026-01-24
-- 
-- This migration creates tables to support the A2A Protocol specification
-- enabling Kronova agents to communicate with external AI agents using
-- the open standard developed by Google and donated to Linux Foundation.
-- 
-- Reference: https://a2a-protocol.org/latest/specification/
-- ============================================================================

-- ============================================================================
-- 1. A2A AGENT CARDS TABLE
-- Stores Agent Card metadata for discoverable agents (Section 4.1.2)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.a2a_agent_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- A2A Agent Card Core Fields (Section 4.1.2)
  agent_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  protocol_versions TEXT[] DEFAULT ARRAY['0.3', '1.0'],
  
  -- Capabilities (Section 4.1.2)
  capabilities JSONB DEFAULT '{
    "streaming": true,
    "pushNotifications": true,
    "extendedAgentCard": false,
    "stateTransitionHistory": true
  }'::jsonb,
  
  -- Skills (array of skill objects)
  skills JSONB DEFAULT '[]'::jsonb,
  
  -- Security Schemes (OAuth 2.1, API Key, etc.)
  security_schemes JSONB DEFAULT '{}'::jsonb,
  security JSONB DEFAULT '[]'::jsonb,
  
  -- Input/Output modes supported
  default_input_modes TEXT[] DEFAULT ARRAY['text/plain', 'application/json'],
  default_output_modes TEXT[] DEFAULT ARRAY['text/plain', 'application/json'],
  
  -- Provider information
  provider JSONB DEFAULT '{}'::jsonb,
  
  -- Documentation
  documentation_url TEXT,
  
  -- Extended card for authenticated access
  extended_card JSONB,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT false,
  
  -- Kronova integration
  kronova_agent_id UUID REFERENCES public.ai_agents(id) ON DELETE SET NULL,
  aethernet_address TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 2. A2A TASKS TABLE
-- Core unit of work in A2A (Section 4.1.1)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.a2a_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- A2A Task Core Fields
  task_id TEXT NOT NULL UNIQUE,
  context_id TEXT NOT NULL,
  
  -- Status (Section 4.1.1)
  status JSONB NOT NULL DEFAULT '{
    "state": "submitted",
    "timestamp": null,
    "message": null
  }'::jsonb,
  
  -- Task State: submitted, working, input-required, completed, failed, canceled, rejected
  current_state TEXT NOT NULL DEFAULT 'submitted',
  
  -- History of messages (Section 4.1.1)
  history JSONB DEFAULT '[]'::jsonb,
  
  -- Artifacts produced (Section 4.1.1)
  artifacts JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Related agent cards
  client_agent_card_id UUID REFERENCES public.a2a_agent_cards(id) ON DELETE SET NULL,
  server_agent_card_id UUID REFERENCES public.a2a_agent_cards(id) ON DELETE SET NULL,
  
  -- Kronova integration
  kronova_workflow_run_id UUID REFERENCES public.ai_workflow_runs(id) ON DELETE SET NULL,
  
  -- Push notification config
  push_notification_config JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 3. A2A MESSAGES TABLE
-- Communication turns between agents (Section 4.1.3)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.a2a_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES public.a2a_tasks(id) ON DELETE CASCADE,
  
  -- A2A Message Fields (Section 4.1.3)
  message_id TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('user', 'agent')),
  
  -- Parts array (TextPart, FilePart, DataPart)
  parts JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Reference to related tasks
  reference_task_ids TEXT[] DEFAULT '{}',
  
  -- Context inheritance
  context_id TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Extensions
  extensions JSONB DEFAULT '[]'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 4. A2A ARTIFACTS TABLE
-- Output artifacts from task execution (Section 4.1.4)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.a2a_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.a2a_tasks(id) ON DELETE CASCADE,
  
  -- A2A Artifact Fields
  artifact_id TEXT NOT NULL,
  name TEXT,
  description TEXT,
  
  -- Parts array
  parts JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Index for ordering
  artifact_index INTEGER DEFAULT 0,
  
  -- Append flag for streaming
  append BOOLEAN DEFAULT false,
  last_chunk BOOLEAN DEFAULT false,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Extensions
  extensions JSONB DEFAULT '[]'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 5. A2A PUSH NOTIFICATION CONFIGS TABLE
-- Webhook configurations for async task updates (Section 3.1.7)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.a2a_push_notification_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.a2a_tasks(id) ON DELETE CASCADE,
  
  -- Config Fields
  config_id TEXT NOT NULL,
  url TEXT NOT NULL,
  
  -- Authentication for webhook
  authentication JSONB,
  
  -- Event filters
  events_to_send TEXT[] DEFAULT ARRAY['status_update', 'artifact_update'],
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_delivery_at TIMESTAMPTZ,
  last_delivery_status TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(task_id, config_id)
);

-- ============================================================================
-- 6. A2A EXTENSIONS TABLE
-- Custom extensions for A2A protocol (Section 4.4)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.a2a_extensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Extension Fields
  uri TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  version TEXT DEFAULT '1.0.0',
  
  -- Schema definition
  schema_definition JSONB NOT NULL,
  
  -- Whether this extension is required
  is_required BOOLEAN DEFAULT false,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 7. KRONOVA A2A INTEGRATION SETTINGS TABLE
-- Configuration for Kronova-specific A2A integrations
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.kronova_a2a_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Integration Settings
  enable_a2a_discovery BOOLEAN DEFAULT true,
  enable_aethernet_bridge BOOLEAN DEFAULT true,
  enable_canton_tokenization BOOLEAN DEFAULT false,
  enable_voice_a2a BOOLEAN DEFAULT true,
  
  -- Default agent card for user
  default_agent_card_id UUID REFERENCES public.a2a_agent_cards(id) ON DELETE SET NULL,
  
  -- AetherNet P2P settings
  aethernet_connection_id UUID REFERENCES public.aethernet_connections(id) ON DELETE SET NULL,
  
  -- Security settings
  allowed_remote_agents TEXT[] DEFAULT '{}',
  blocked_remote_agents TEXT[] DEFAULT '{}',
  require_mutual_auth BOOLEAN DEFAULT true,
  
  -- Rate limiting
  max_tasks_per_minute INTEGER DEFAULT 60,
  max_messages_per_task INTEGER DEFAULT 100,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_a2a_agent_cards_user_id ON public.a2a_agent_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_a2a_agent_cards_agent_id ON public.a2a_agent_cards(agent_id);
CREATE INDEX IF NOT EXISTS idx_a2a_agent_cards_is_public ON public.a2a_agent_cards(is_public) WHERE is_public = true;

CREATE INDEX IF NOT EXISTS idx_a2a_tasks_user_id ON public.a2a_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_a2a_tasks_task_id ON public.a2a_tasks(task_id);
CREATE INDEX IF NOT EXISTS idx_a2a_tasks_context_id ON public.a2a_tasks(context_id);
CREATE INDEX IF NOT EXISTS idx_a2a_tasks_current_state ON public.a2a_tasks(current_state);
CREATE INDEX IF NOT EXISTS idx_a2a_tasks_created_at ON public.a2a_tasks(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_a2a_messages_task_id ON public.a2a_messages(task_id);
CREATE INDEX IF NOT EXISTS idx_a2a_messages_message_id ON public.a2a_messages(message_id);
CREATE INDEX IF NOT EXISTS idx_a2a_messages_created_at ON public.a2a_messages(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_a2a_artifacts_task_id ON public.a2a_artifacts(task_id);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

ALTER TABLE public.a2a_agent_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.a2a_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.a2a_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.a2a_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.a2a_push_notification_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.a2a_extensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kronova_a2a_settings ENABLE ROW LEVEL SECURITY;

-- Agent Cards: Users can manage their own, public cards are readable by all
CREATE POLICY "Users can manage own agent cards"
  ON public.a2a_agent_cards FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Public agent cards are readable"
  ON public.a2a_agent_cards FOR SELECT
  USING (is_public = true);

-- Tasks: Users can only access their own tasks
CREATE POLICY "Users can manage own tasks"
  ON public.a2a_tasks FOR ALL
  USING (auth.uid() = user_id);

-- Messages: Users can access messages for their tasks
CREATE POLICY "Users can manage messages for own tasks"
  ON public.a2a_messages FOR ALL
  USING (auth.uid() = user_id);

-- Artifacts: Access through task ownership
CREATE POLICY "Users can view artifacts for own tasks"
  ON public.a2a_artifacts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.a2a_tasks 
      WHERE a2a_tasks.id = a2a_artifacts.task_id 
      AND a2a_tasks.user_id = auth.uid()
    )
  );

-- Push configs: Users can manage configs for their tasks
CREATE POLICY "Users can manage push configs for own tasks"
  ON public.a2a_push_notification_configs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.a2a_tasks 
      WHERE a2a_tasks.id = a2a_push_notification_configs.task_id 
      AND a2a_tasks.user_id = auth.uid()
    )
  );

-- Extensions: Users can manage own extensions
CREATE POLICY "Users can manage own extensions"
  ON public.a2a_extensions FOR ALL
  USING (auth.uid() = user_id);

-- Settings: Users can manage own settings
CREATE POLICY "Users can manage own a2a settings"
  ON public.kronova_a2a_settings FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_a2a_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_a2a_agent_cards_updated_at
  BEFORE UPDATE ON public.a2a_agent_cards
  FOR EACH ROW EXECUTE FUNCTION update_a2a_updated_at();

CREATE TRIGGER update_a2a_tasks_updated_at
  BEFORE UPDATE ON public.a2a_tasks
  FOR EACH ROW EXECUTE FUNCTION update_a2a_updated_at();

CREATE TRIGGER update_a2a_push_configs_updated_at
  BEFORE UPDATE ON public.a2a_push_notification_configs
  FOR EACH ROW EXECUTE FUNCTION update_a2a_updated_at();

CREATE TRIGGER update_a2a_extensions_updated_at
  BEFORE UPDATE ON public.a2a_extensions
  FOR EACH ROW EXECUTE FUNCTION update_a2a_updated_at();

CREATE TRIGGER update_kronova_a2a_settings_updated_at
  BEFORE UPDATE ON public.kronova_a2a_settings
  FOR EACH ROW EXECUTE FUNCTION update_a2a_updated_at();

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE public.a2a_agent_cards IS 'A2A Protocol Agent Cards - metadata for discoverable agents';
COMMENT ON TABLE public.a2a_tasks IS 'A2A Protocol Tasks - core unit of work between agents';
COMMENT ON TABLE public.a2a_messages IS 'A2A Protocol Messages - communication turns between agents';
COMMENT ON TABLE public.a2a_artifacts IS 'A2A Protocol Artifacts - output from task execution';
COMMENT ON TABLE public.a2a_push_notification_configs IS 'A2A Protocol Push Notification Configs - webhook settings';
COMMENT ON TABLE public.a2a_extensions IS 'A2A Protocol Extensions - custom protocol extensions';
COMMENT ON TABLE public.kronova_a2a_settings IS 'Kronova-specific A2A integration settings';
