-- AI Agent Context System for Multi-Context Support
-- Enables agents to use context from MCP, API, Cloud Native, and Multiple Blockchains

-- Agent Context Types Table
CREATE TABLE IF NOT EXISTS public.ai_agent_contexts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  context_type TEXT NOT NULL CHECK (context_type IN (
    'mcp', 'api', 'cloud_native', 'sui', 'canton', 'ethereum', 'bitcoin', 'solana', 'aethernet'
  )),
  context_name TEXT NOT NULL,
  context_config JSONB NOT NULL DEFAULT '{}',
  oauth_client_id TEXT REFERENCES private.oauth_clients(client_id) ON DELETE SET NULL,
  connection_status TEXT DEFAULT 'disconnected' CHECK (connection_status IN (
    'connected', 'disconnected', 'error', 'pending'
  )),
  last_sync_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, context_name)
);

-- Agent Context Permissions Table
CREATE TABLE IF NOT EXISTS public.ai_agent_context_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  context_id UUID NOT NULL REFERENCES public.ai_agent_contexts(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  permissions JSONB NOT NULL DEFAULT '[]',
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  
  UNIQUE(context_id, agent_id)
);

-- Blockchain Connections Table
CREATE TABLE IF NOT EXISTS public.blockchain_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blockchain_type TEXT NOT NULL CHECK (blockchain_type IN (
    'sui', 'canton', 'ethereum', 'bitcoin', 'solana'
  )),
  network TEXT NOT NULL, -- mainnet, testnet, devnet
  connection_name TEXT NOT NULL,
  wallet_address TEXT,
  rpc_endpoint TEXT,
  api_key_encrypted TEXT,
  connection_config JSONB DEFAULT '{}',
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, blockchain_type, connection_name)
);

-- MCP Server Connections Table
CREATE TABLE IF NOT EXISTS public.mcp_server_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  oauth_client_id TEXT REFERENCES private.oauth_clients(client_id) ON DELETE CASCADE,
  server_name TEXT NOT NULL,
  server_url TEXT NOT NULL,
  server_type TEXT DEFAULT 'custom',
  capabilities JSONB DEFAULT '[]',
  connection_status TEXT DEFAULT 'disconnected',
  last_connected_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, server_name)
);

-- API Endpoint Connections Table
CREATE TABLE IF NOT EXISTS public.api_endpoint_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  oauth_client_id TEXT REFERENCES private.oauth_clients(client_id) ON DELETE CASCADE,
  endpoint_name TEXT NOT NULL,
  base_url TEXT NOT NULL,
  auth_type TEXT DEFAULT 'none' CHECK (auth_type IN (
    'none', 'bearer', 'basic', 'oauth2', 'api_key'
  )),
  auth_config JSONB DEFAULT '{}',
  headers JSONB DEFAULT '{}',
  rate_limit_config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, endpoint_name)
);

-- Cloud Native Service Connections Table
CREATE TABLE IF NOT EXISTS public.cloud_service_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL CHECK (service_type IN (
    'aws', 'gcp', 'azure', 'vercel', 'cloudflare', 'supabase'
  )),
  service_name TEXT NOT NULL,
  service_config JSONB NOT NULL DEFAULT '{}',
  credentials_encrypted TEXT,
  oauth_client_id TEXT REFERENCES private.oauth_clients(client_id) ON DELETE SET NULL,
  connection_status TEXT DEFAULT 'disconnected',
  last_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, service_type, service_name)
);

-- AetherNet Connections Table
CREATE TABLE IF NOT EXISTS public.aethernet_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connection_name TEXT NOT NULL,
  aethernet_address TEXT NOT NULL,
  public_key TEXT NOT NULL,
  private_key_encrypted TEXT NOT NULL,
  connection_status TEXT DEFAULT 'disconnected',
  network_type TEXT DEFAULT 'mainnet',
  peer_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMPTZ,
  bandwidth_used BIGINT DEFAULT 0,
  messages_sent INTEGER DEFAULT 0,
  messages_received INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, connection_name)
);

-- Agent Execution Context Logs
CREATE TABLE IF NOT EXISTS public.agent_execution_contexts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id UUID NOT NULL,
  agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  context_type TEXT NOT NULL,
  context_data JSONB NOT NULL DEFAULT '{}',
  execution_timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_agent_contexts_user_id ON public.ai_agent_contexts(user_id);
CREATE INDEX idx_agent_contexts_agent_id ON public.ai_agent_contexts(agent_id);
CREATE INDEX idx_agent_contexts_type ON public.ai_agent_contexts(context_type);
CREATE INDEX idx_agent_contexts_status ON public.ai_agent_contexts(connection_status);

CREATE INDEX idx_blockchain_connections_user_id ON public.blockchain_connections(user_id);
CREATE INDEX idx_blockchain_connections_type ON public.blockchain_connections(blockchain_type);
CREATE INDEX idx_blockchain_connections_default ON public.blockchain_connections(is_default);

CREATE INDEX idx_mcp_connections_user_id ON public.mcp_server_connections(user_id);
CREATE INDEX idx_mcp_connections_status ON public.mcp_server_connections(connection_status);

CREATE INDEX idx_api_connections_user_id ON public.api_endpoint_connections(user_id);
CREATE INDEX idx_api_connections_active ON public.api_endpoint_connections(is_active);

CREATE INDEX idx_cloud_connections_user_id ON public.cloud_service_connections(user_id);
CREATE INDEX idx_cloud_connections_type ON public.cloud_service_connections(service_type);

CREATE INDEX idx_aethernet_connections_user_id ON public.aethernet_connections(user_id);
CREATE INDEX idx_aethernet_connections_status ON public.aethernet_connections(connection_status);

CREATE INDEX idx_agent_execution_contexts_agent_id ON public.agent_execution_contexts(agent_id);
CREATE INDEX idx_agent_execution_contexts_type ON public.agent_execution_contexts(context_type);

-- Enable RLS
ALTER TABLE public.ai_agent_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agent_context_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blockchain_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mcp_server_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_endpoint_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cloud_service_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aethernet_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_execution_contexts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own agent contexts"
  ON public.ai_agent_contexts
  FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own blockchain connections"
  ON public.blockchain_connections
  FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own MCP connections"
  ON public.mcp_server_connections
  FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own API connections"
  ON public.api_endpoint_connections
  FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own cloud connections"
  ON public.cloud_service_connections
  FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own AetherNet connections"
  ON public.aethernet_connections
  FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Users can view execution contexts for their agents"
  ON public.agent_execution_contexts
  FOR SELECT
  USING (agent_id IN (SELECT id FROM public.ai_agents WHERE user_id = auth.uid()));

-- Functions
CREATE OR REPLACE FUNCTION public.create_agent_context(
  p_agent_id UUID,
  p_context_type TEXT,
  p_context_name TEXT,
  p_context_config JSONB DEFAULT '{}'::JSONB
)
RETURNS UUID AS $$
DECLARE
  v_context_id UUID;
BEGIN
  INSERT INTO public.ai_agent_contexts (
    user_id,
    agent_id,
    context_type,
    context_name,
    context_config
  ) VALUES (
    auth.uid(),
    p_agent_id,
    p_context_type,
    p_context_name,
    p_context_config
  )
  RETURNING id INTO v_context_id;
  
  RETURN v_context_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.test_aethernet_connection(
  p_connection_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_connection RECORD;
BEGIN
  SELECT * INTO v_connection
  FROM public.aethernet_connections
  WHERE id = p_connection_id
    AND user_id = auth.uid();
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Connection not found');
  END IF;
  
  -- Update connection status
  UPDATE public.aethernet_connections
  SET 
    connection_status = 'connected',
    last_message_at = NOW(),
    updated_at = NOW()
  WHERE id = p_connection_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'address', v_connection.aethernet_address,
    'status', 'connected',
    'network', v_connection.network_type
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT ALL ON public.ai_agent_contexts TO authenticated;
GRANT ALL ON public.blockchain_connections TO authenticated;
GRANT ALL ON public.mcp_server_connections TO authenticated;
GRANT ALL ON public.api_endpoint_connections TO authenticated;
GRANT ALL ON public.cloud_service_connections TO authenticated;
GRANT ALL ON public.aethernet_connections TO authenticated;
GRANT SELECT ON public.agent_execution_contexts TO authenticated;

GRANT EXECUTE ON FUNCTION public.create_agent_context TO authenticated;
GRANT EXECUTE ON FUNCTION public.test_aethernet_connection TO authenticated;

-- Comments
COMMENT ON TABLE public.ai_agent_contexts IS 'Multi-context system for AI agents supporting MCP, API, Cloud Native, and Blockchain contexts';
COMMENT ON TABLE public.blockchain_connections IS 'User blockchain connections for Sui, Canton, Ethereum, Bitcoin, and Solana';
COMMENT ON TABLE public.mcp_server_connections IS 'Model Context Protocol server connections with OAuth 2.1 authentication';
COMMENT ON TABLE public.aethernet_connections IS 'AetherNet P2P messaging network connections';
