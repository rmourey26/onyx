-- ============================================================================
-- KRONOVA VOICE & TOKENIZATION ENHANCEMENT MIGRATION
-- Safe, Idempotent Column Additions to Existing Tables
-- Version: 2.0.0
-- Date: 2026-01-25
-- ============================================================================

-- This migration safely adds new columns to existing tables without
-- attempting to recreate them. All operations use IF NOT EXISTS checks.

BEGIN;

-- ============================================================================
-- 1. ENHANCE asset_tokens TABLE
-- Add additional columns for enterprise tokenization features
-- ============================================================================

-- Add token naming columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='asset_tokens' AND column_name='token_symbol') THEN
    ALTER TABLE public.asset_tokens ADD COLUMN token_symbol TEXT;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='asset_tokens' AND column_name='token_name') THEN
    ALTER TABLE public.asset_tokens ADD COLUMN token_name TEXT;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='asset_tokens' AND column_name='token_standard') THEN
    ALTER TABLE public.asset_tokens ADD COLUMN token_standard TEXT DEFAULT 'ERC-20';
  END IF;
END $$;

-- Add supply tracking columns
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='asset_tokens' AND column_name='total_supply') THEN
    ALTER TABLE public.asset_tokens ADD COLUMN total_supply DECIMAL(38, 18) DEFAULT 0;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='asset_tokens' AND column_name='circulating_supply') THEN
    ALTER TABLE public.asset_tokens ADD COLUMN circulating_supply DECIMAL(38, 18) DEFAULT 0;
  END IF;
END $$;

-- Add pricing columns
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='asset_tokens' AND column_name='current_price') THEN
    ALTER TABLE public.asset_tokens ADD COLUMN current_price DECIMAL(38, 18);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='asset_tokens' AND column_name='initial_price') THEN
    ALTER TABLE public.asset_tokens ADD COLUMN initial_price DECIMAL(38, 18);
  END IF;
END $$;

-- Add Canton Network integration columns
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='asset_tokens' AND column_name='canton_domain') THEN
    ALTER TABLE public.asset_tokens ADD COLUMN canton_domain TEXT;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='asset_tokens' AND column_name='canton_party_id') THEN
    ALTER TABLE public.asset_tokens ADD COLUMN canton_party_id TEXT;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='asset_tokens' AND column_name='token_metadata') THEN
    ALTER TABLE public.asset_tokens ADD COLUMN token_metadata JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='asset_tokens' AND column_name='blockchain_network') THEN
    ALTER TABLE public.asset_tokens ADD COLUMN blockchain_network TEXT DEFAULT 'sui';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='asset_tokens' AND column_name='is_active') THEN
    ALTER TABLE public.asset_tokens ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;
END $$;

-- ============================================================================
-- 2. ENHANCE fractionalization_pools TABLE
-- Add enterprise pool management columns
-- ============================================================================

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='fractionalization_pools' AND column_name='pool_name') THEN
    ALTER TABLE public.fractionalization_pools ADD COLUMN pool_name TEXT;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='fractionalization_pools' AND column_name='pool_type') THEN
    ALTER TABLE public.fractionalization_pools ADD COLUMN pool_type TEXT DEFAULT 'liquidity';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='fractionalization_pools' AND column_name='total_value_locked') THEN
    ALTER TABLE public.fractionalization_pools ADD COLUMN total_value_locked DECIMAL(38, 18) DEFAULT 0;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='fractionalization_pools' AND column_name='participant_count') THEN
    ALTER TABLE public.fractionalization_pools ADD COLUMN participant_count INTEGER DEFAULT 0;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='fractionalization_pools' AND column_name='management_fee_bps') THEN
    ALTER TABLE public.fractionalization_pools ADD COLUMN management_fee_bps INTEGER DEFAULT 100;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='fractionalization_pools' AND column_name='performance_fee_bps') THEN
    ALTER TABLE public.fractionalization_pools ADD COLUMN performance_fee_bps INTEGER DEFAULT 2000;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='fractionalization_pools' AND column_name='accredited_only') THEN
    ALTER TABLE public.fractionalization_pools ADD COLUMN accredited_only BOOLEAN DEFAULT false;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='fractionalization_pools' AND column_name='kyc_required') THEN
    ALTER TABLE public.fractionalization_pools ADD COLUMN kyc_required BOOLEAN DEFAULT true;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='fractionalization_pools' AND column_name='jurisdiction_restrictions') THEN
    ALTER TABLE public.fractionalization_pools ADD COLUMN jurisdiction_restrictions TEXT[] DEFAULT '{}';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='fractionalization_pools' AND column_name='is_active') THEN
    ALTER TABLE public.fractionalization_pools ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='fractionalization_pools' AND column_name='user_id') THEN
    ALTER TABLE public.fractionalization_pools ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ============================================================================
-- 3. ENHANCE token_transactions TABLE
-- Add comprehensive transaction tracking
-- ============================================================================

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='token_transactions' AND column_name='token_id') THEN
    ALTER TABLE public.token_transactions ADD COLUMN token_id UUID;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='token_transactions' AND column_name='amount') THEN
    ALTER TABLE public.token_transactions ADD COLUMN amount DECIMAL(38, 18) NOT NULL DEFAULT 0;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='token_transactions' AND column_name='from_address') THEN
    ALTER TABLE public.token_transactions ADD COLUMN from_address TEXT;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='token_transactions' AND column_name='to_address') THEN
    ALTER TABLE public.token_transactions ADD COLUMN to_address TEXT;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='token_transactions' AND column_name='block_number') THEN
    ALTER TABLE public.token_transactions ADD COLUMN block_number BIGINT;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='token_transactions' AND column_name='gas_used') THEN
    ALTER TABLE public.token_transactions ADD COLUMN gas_used DECIMAL(38, 0);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='token_transactions' AND column_name='price_at_transaction') THEN
    ALTER TABLE public.token_transactions ADD COLUMN price_at_transaction DECIMAL(38, 18);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='token_transactions' AND column_name='user_id') THEN
    ALTER TABLE public.token_transactions ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ============================================================================
-- 4. ENHANCE private_stablecoins TABLE
-- Add enterprise stablecoin management features
-- ============================================================================

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='private_stablecoins' AND column_name='backing_ratio') THEN
    ALTER TABLE public.private_stablecoins ADD COLUMN backing_ratio DECIMAL(5, 4) DEFAULT 1.0000;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='private_stablecoins' AND column_name='reserve_asset') THEN
    ALTER TABLE public.private_stablecoins ADD COLUMN reserve_asset TEXT;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='private_stablecoins' AND column_name='reserve_custodian') THEN
    ALTER TABLE public.private_stablecoins ADD COLUMN reserve_custodian TEXT;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='private_stablecoins' AND column_name='audit_frequency') THEN
    ALTER TABLE public.private_stablecoins ADD COLUMN audit_frequency TEXT DEFAULT 'monthly';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='private_stablecoins' AND column_name='last_audit_at') THEN
    ALTER TABLE public.private_stablecoins ADD COLUMN last_audit_at TIMESTAMPTZ;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='private_stablecoins' AND column_name='max_supply') THEN
    ALTER TABLE public.private_stablecoins ADD COLUMN max_supply DECIMAL(38, 18);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='private_stablecoins' AND column_name='blockchain_network') THEN
    ALTER TABLE public.private_stablecoins ADD COLUMN blockchain_network TEXT DEFAULT 'canton';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='private_stablecoins' AND column_name='contract_address') THEN
    ALTER TABLE public.private_stablecoins ADD COLUMN contract_address TEXT;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='private_stablecoins' AND column_name='regulator_approved') THEN
    ALTER TABLE public.private_stablecoins ADD COLUMN regulator_approved BOOLEAN DEFAULT false;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='private_stablecoins' AND column_name='compliance_framework') THEN
    ALTER TABLE public.private_stablecoins ADD COLUMN compliance_framework TEXT;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='private_stablecoins' AND column_name='is_active') THEN
    ALTER TABLE public.private_stablecoins ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;
END $$;

-- ============================================================================
-- 5. ENHANCE voice_execution_logs TABLE
-- Add additional NLP and processing columns
-- ============================================================================

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='voice_execution_logs' AND column_name='session_id') THEN
    ALTER TABLE public.voice_execution_logs ADD COLUMN session_id TEXT;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='voice_execution_logs' AND column_name='execution_type') THEN
    ALTER TABLE public.voice_execution_logs ADD COLUMN execution_type TEXT DEFAULT 'voice_command';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='voice_execution_logs' AND column_name='input_audio_url') THEN
    ALTER TABLE public.voice_execution_logs ADD COLUMN input_audio_url TEXT;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='voice_execution_logs' AND column_name='input_transcript') THEN
    ALTER TABLE public.voice_execution_logs ADD COLUMN input_transcript TEXT;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='voice_execution_logs' AND column_name='output_text') THEN
    ALTER TABLE public.voice_execution_logs ADD COLUMN output_text TEXT;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='voice_execution_logs' AND column_name='output_audio_url') THEN
    ALTER TABLE public.voice_execution_logs ADD COLUMN output_audio_url TEXT;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='voice_execution_logs' AND column_name='intent_detected') THEN
    ALTER TABLE public.voice_execution_logs ADD COLUMN intent_detected TEXT;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='voice_execution_logs' AND column_name='entities_extracted') THEN
    ALTER TABLE public.voice_execution_logs ADD COLUMN entities_extracted JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='voice_execution_logs' AND column_name='sentiment_score') THEN
    ALTER TABLE public.voice_execution_logs ADD COLUMN sentiment_score DECIMAL(3, 2);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='voice_execution_logs' AND column_name='confidence_score') THEN
    ALTER TABLE public.voice_execution_logs ADD COLUMN confidence_score DECIMAL(3, 2);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='voice_execution_logs' AND column_name='duration_ms') THEN
    ALTER TABLE public.voice_execution_logs ADD COLUMN duration_ms INTEGER;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='voice_execution_logs' AND column_name='tokens_used') THEN
    ALTER TABLE public.voice_execution_logs ADD COLUMN tokens_used INTEGER;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='voice_execution_logs' AND column_name='latency_ms') THEN
    ALTER TABLE public.voice_execution_logs ADD COLUMN latency_ms INTEGER;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='voice_execution_logs' AND column_name='error_message') THEN
    ALTER TABLE public.voice_execution_logs ADD COLUMN error_message TEXT;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='voice_execution_logs' AND column_name='metadata') THEN
    ALTER TABLE public.voice_execution_logs ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- ============================================================================
-- 6. ENHANCE voice_context_snapshots TABLE
-- Add context management features
-- ============================================================================

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='voice_context_snapshots' AND column_name='context_type') THEN
    ALTER TABLE public.voice_context_snapshots ADD COLUMN context_type TEXT DEFAULT 'conversation';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='voice_context_snapshots' AND column_name='turn_count') THEN
    ALTER TABLE public.voice_context_snapshots ADD COLUMN turn_count INTEGER DEFAULT 0;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='voice_context_snapshots' AND column_name='is_active') THEN
    ALTER TABLE public.voice_context_snapshots ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='voice_context_snapshots' AND column_name='expires_at') THEN
    ALTER TABLE public.voice_context_snapshots ADD COLUMN expires_at TIMESTAMPTZ;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='voice_context_snapshots' AND column_name='updated_at') THEN
    ALTER TABLE public.voice_context_snapshots ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;

-- ============================================================================
-- 7. CREATE ntg_freight_integrations TABLE IF IT DOESN'T EXIST
-- For Kevin Nolan's NTG/Nolan Transportation Group integration
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
  aethernet_connection_id UUID,
  
  -- Voice agent integration
  voice_agent_enabled BOOLEAN DEFAULT true,
  voice_agent_id UUID,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending',
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add foreign key constraints if table was just created
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'ntg_freight_aethernet_fkey'
  ) THEN
    ALTER TABLE public.ntg_freight_integrations 
    ADD CONSTRAINT ntg_freight_aethernet_fkey 
    FOREIGN KEY (aethernet_connection_id) 
    REFERENCES public.aethernet_connections(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'ntg_freight_voice_agent_fkey'
  ) THEN
    ALTER TABLE public.ntg_freight_integrations 
    ADD CONSTRAINT ntg_freight_voice_agent_fkey 
    FOREIGN KEY (voice_agent_id) 
    REFERENCES public.ai_agents(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE public.ntg_freight_integrations ENABLE ROW LEVEL SECURITY;

-- Create RLS policy if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'ntg_freight_integrations' 
    AND policyname = 'Users can manage own ntg freight integrations'
  ) THEN
    CREATE POLICY "Users can manage own ntg freight integrations"
      ON public.ntg_freight_integrations FOR ALL
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ntg_freight_integrations_user_id ON public.ntg_freight_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_ntg_freight_integrations_aethernet ON public.ntg_freight_integrations(aethernet_connection_id);

-- ============================================================================
-- 8. ADD HELPFUL INDEXES FOR NEW COLUMNS
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_asset_tokens_canton_party ON public.asset_tokens(canton_party_id) WHERE canton_party_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_asset_tokens_symbol_active ON public.asset_tokens(token_symbol) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_voice_execution_session ON public.voice_execution_logs(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_voice_execution_intent ON public.voice_execution_logs(intent_detected) WHERE intent_detected IS NOT NULL;

-- ============================================================================
-- 9. ADD COMMENTS FOR NEW COLUMNS
-- ============================================================================

COMMENT ON COLUMN public.asset_tokens.canton_domain IS 'Canton Network domain for privacy-preserving transactions';
COMMENT ON COLUMN public.asset_tokens.canton_party_id IS 'Canton Network party identifier';
COMMENT ON COLUMN public.fractionalization_pools.management_fee_bps IS 'Management fee in basis points (100 = 1%)';
COMMENT ON COLUMN public.fractionalization_pools.jurisdiction_restrictions IS 'Array of restricted jurisdictions (e.g., {"US", "CN"})';
COMMENT ON COLUMN public.voice_execution_logs.intent_detected IS 'NLP-detected user intent from voice command';
COMMENT ON COLUMN public.voice_execution_logs.entities_extracted IS 'Named entities extracted from voice input';
COMMENT ON TABLE public.ntg_freight_integrations IS 'NTG/Nolan Transportation Group specific freight integrations';

COMMIT;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Verify migration success
DO $$
BEGIN
  RAISE NOTICE 'Voice & Tokenization Enhancement Migration completed successfully';
  RAISE NOTICE 'Tables enhanced: asset_tokens, fractionalization_pools, token_transactions, private_stablecoins, voice_execution_logs, voice_context_snapshots';
  RAISE NOTICE 'New table created (if not exists): ntg_freight_integrations';
END $$;
