-- ============================================================================
-- KRONOVA VOICE AGENT & TOKENIZATION SCHEMA MIGRATION
-- Voice NLP Operations & Asset Tokenization Tables
-- Version: 1.0.0
-- Date: 2026-01-24
-- ============================================================================

-- ============================================================================
-- 1. VOICE EXECUTION LOGS TABLE
-- Records voice agent interactions and NLP processing
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.voice_execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Agent reference
  agent_id UUID REFERENCES public.ai_agents(id) ON DELETE SET NULL,
  
  -- Execution details
  session_id TEXT NOT NULL,
  execution_type TEXT NOT NULL DEFAULT 'voice_command',
  
  -- Input/Output
  input_audio_url TEXT,
  input_transcript TEXT,
  output_text TEXT,
  output_audio_url TEXT,
  
  -- NLP Analysis
  intent_detected TEXT,
  entities_extracted JSONB DEFAULT '[]'::jsonb,
  sentiment_score DECIMAL(3, 2),
  confidence_score DECIMAL(3, 2),
  
  -- Performance metrics
  duration_ms INTEGER,
  tokens_used INTEGER,
  latency_ms INTEGER,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- ============================================================================
-- 2. VOICE CONTEXT SNAPSHOTS TABLE
-- Maintains conversation context for multi-turn voice interactions
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.voice_context_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Session reference
  session_id TEXT NOT NULL,
  
  -- Context data
  context_type TEXT NOT NULL DEFAULT 'conversation',
  context_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- State
  turn_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  -- Expiration
  expires_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 3. ASSET TOKENS TABLE
-- Tokenized assets on blockchain networks
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.asset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Asset reference
  asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
  
  -- Token details
  token_symbol TEXT NOT NULL,
  token_name TEXT NOT NULL,
  token_standard TEXT DEFAULT 'ERC-20',
  
  -- Supply
  total_supply DECIMAL(38, 18) NOT NULL DEFAULT 0,
  circulating_supply DECIMAL(38, 18) DEFAULT 0,
  
  -- Pricing
  current_price DECIMAL(38, 18),
  initial_price DECIMAL(38, 18),
  
  -- Blockchain
  blockchain_network TEXT NOT NULL DEFAULT 'sui',
  contract_address TEXT,
  deployment_tx_hash TEXT,
  
  -- Canton Network integration (for NTG/Kevin Nolan use case)
  canton_domain TEXT,
  canton_party_id TEXT,
  
  -- Metadata
  token_metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'draft',
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 4. FRACTIONALIZATION POOLS TABLE
-- Pools for fractionalized asset ownership
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.fractionalization_pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Token reference
  token_id UUID NOT NULL REFERENCES public.asset_tokens(id) ON DELETE CASCADE,
  
  -- Pool details
  pool_name TEXT NOT NULL,
  pool_type TEXT DEFAULT 'liquidity',
  
  -- Financial metrics
  total_value_locked DECIMAL(38, 18) DEFAULT 0,
  participant_count INTEGER DEFAULT 0,
  
  -- Fee structure
  management_fee_bps INTEGER DEFAULT 100, -- basis points
  performance_fee_bps INTEGER DEFAULT 2000,
  
  -- Compliance
  accredited_only BOOLEAN DEFAULT false,
  kyc_required BOOLEAN DEFAULT true,
  jurisdiction_restrictions TEXT[] DEFAULT '{}',
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending',
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 5. TOKEN TRANSACTIONS TABLE
-- Records all token transfers and operations
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.token_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Token reference
  token_id UUID NOT NULL REFERENCES public.asset_tokens(id) ON DELETE CASCADE,
  
  -- Transaction details
  transaction_type TEXT NOT NULL,
  amount DECIMAL(38, 18) NOT NULL,
  
  -- Addresses
  from_address TEXT,
  to_address TEXT,
  
  -- Blockchain data
  tx_hash TEXT,
  block_number BIGINT,
  gas_used DECIMAL(38, 0),
  
  -- Pricing at time of transaction
  price_at_transaction DECIMAL(38, 18),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending',
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 6. PRIVATE STABLECOINS TABLE
-- For NTG/Kevin Nolan: Private stablecoin issuance
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.private_stablecoins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Stablecoin details
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  
  -- Backing
  backing_type TEXT NOT NULL DEFAULT 'fiat', -- fiat, crypto, hybrid
  backing_ratio DECIMAL(5, 4) DEFAULT 1.0000, -- 1:1 backing
  
  -- Reserve details
  reserve_asset TEXT,
  reserve_custodian TEXT,
  audit_frequency TEXT DEFAULT 'monthly',
  last_audit_at TIMESTAMPTZ,
  
  -- Supply
  total_supply DECIMAL(38, 18) DEFAULT 0,
  max_supply DECIMAL(38, 18),
  
  -- Network
  blockchain_network TEXT DEFAULT 'canton',
  contract_address TEXT,
  
  -- Compliance
  regulator_approved BOOLEAN DEFAULT false,
  compliance_framework TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'draft',
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 7. NTG FREIGHT INTEGRATION TABLE
-- Specific integration for NTG/Nolan Transportation Group
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ntg_freight_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Integration details
  integration_name TEXT NOT NULL,
  integration_type TEXT NOT NULL, -- 'carrier', 'shipper', 'broker'
  
  -- NTG-specific fields
  ntg_account_id TEXT,
  ntg_api_key_encrypted TEXT,
  
  -- OTR Solutions integration
  otr_fuel_card_enabled BOOLEAN DEFAULT false,
  otr_factoring_enabled BOOLEAN DEFAULT false,
  
  -- IoT/Telematics
  telematics_provider TEXT,
  eld_integration_enabled BOOLEAN DEFAULT false,
  
  -- AetherNet bridge
  aethernet_connection_id UUID REFERENCES public.aethernet_connections(id),
  
  -- Voice agent integration
  voice_agent_enabled BOOLEAN DEFAULT true,
  voice_agent_id UUID REFERENCES public.ai_agents(id),
  
  -- A2A Protocol
  a2a_agent_card_id UUID REFERENCES public.a2a_agent_cards(id),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending',
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_voice_execution_logs_user_id ON public.voice_execution_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_execution_logs_session_id ON public.voice_execution_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_voice_execution_logs_created_at ON public.voice_execution_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_voice_context_snapshots_user_id ON public.voice_context_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_context_snapshots_session_id ON public.voice_context_snapshots(session_id);

CREATE INDEX IF NOT EXISTS idx_asset_tokens_user_id ON public.asset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_asset_tokens_asset_id ON public.asset_tokens(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_tokens_symbol ON public.asset_tokens(token_symbol);

CREATE INDEX IF NOT EXISTS idx_fractionalization_pools_user_id ON public.fractionalization_pools(user_id);
CREATE INDEX IF NOT EXISTS idx_fractionalization_pools_token_id ON public.fractionalization_pools(token_id);

CREATE INDEX IF NOT EXISTS idx_token_transactions_user_id ON public.token_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_token_id ON public.token_transactions(token_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_created_at ON public.token_transactions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_private_stablecoins_user_id ON public.private_stablecoins(user_id);
CREATE INDEX IF NOT EXISTS idx_ntg_freight_integrations_user_id ON public.ntg_freight_integrations(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.voice_execution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_context_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fractionalization_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.private_stablecoins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ntg_freight_integrations ENABLE ROW LEVEL SECURITY;

-- Voice execution logs
CREATE POLICY "Users can manage own voice execution logs"
  ON public.voice_execution_logs FOR ALL
  USING (auth.uid() = user_id);

-- Voice context snapshots
CREATE POLICY "Users can manage own voice context snapshots"
  ON public.voice_context_snapshots FOR ALL
  USING (auth.uid() = user_id);

-- Asset tokens
CREATE POLICY "Users can manage own asset tokens"
  ON public.asset_tokens FOR ALL
  USING (auth.uid() = user_id);

-- Fractionalization pools
CREATE POLICY "Users can manage own fractionalization pools"
  ON public.fractionalization_pools FOR ALL
  USING (auth.uid() = user_id);

-- Token transactions
CREATE POLICY "Users can manage own token transactions"
  ON public.token_transactions FOR ALL
  USING (auth.uid() = user_id);

-- Private stablecoins
CREATE POLICY "Users can manage own private stablecoins"
  ON public.private_stablecoins FOR ALL
  USING (auth.uid() = user_id);

-- NTG freight integrations
CREATE POLICY "Users can manage own ntg freight integrations"
  ON public.ntg_freight_integrations FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER update_voice_context_snapshots_updated_at
  BEFORE UPDATE ON public.voice_context_snapshots
  FOR EACH ROW EXECUTE FUNCTION update_a2a_updated_at();

CREATE TRIGGER update_asset_tokens_updated_at
  BEFORE UPDATE ON public.asset_tokens
  FOR EACH ROW EXECUTE FUNCTION update_a2a_updated_at();

CREATE TRIGGER update_fractionalization_pools_updated_at
  BEFORE UPDATE ON public.fractionalization_pools
  FOR EACH ROW EXECUTE FUNCTION update_a2a_updated_at();

CREATE TRIGGER update_private_stablecoins_updated_at
  BEFORE UPDATE ON public.private_stablecoins
  FOR EACH ROW EXECUTE FUNCTION update_a2a_updated_at();

CREATE TRIGGER update_ntg_freight_integrations_updated_at
  BEFORE UPDATE ON public.ntg_freight_integrations
  FOR EACH ROW EXECUTE FUNCTION update_a2a_updated_at();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.voice_execution_logs IS 'Voice agent execution logs for NLP operations';
COMMENT ON TABLE public.voice_context_snapshots IS 'Conversation context for multi-turn voice interactions';
COMMENT ON TABLE public.asset_tokens IS 'Tokenized assets on blockchain networks';
COMMENT ON TABLE public.fractionalization_pools IS 'Pools for fractionalized asset ownership';
COMMENT ON TABLE public.token_transactions IS 'Token transfer and operation records';
COMMENT ON TABLE public.private_stablecoins IS 'Private stablecoin issuance for enterprise';
COMMENT ON TABLE public.ntg_freight_integrations IS 'NTG/Nolan Transportation Group specific integrations';
