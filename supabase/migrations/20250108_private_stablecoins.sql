-- ============================================================
-- Private Stablecoins Schema
-- Canton Network + Circle USDC Integration
-- ============================================================

-- Private Stablecoins Table
CREATE TABLE IF NOT EXISTS private_stablecoins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  
  -- Token Details
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  decimals INTEGER NOT NULL DEFAULT 6,
  total_supply TEXT NOT NULL DEFAULT '0',
  
  -- Backing Configuration
  backing_type TEXT NOT NULL CHECK (backing_type IN ('usdc', 'fiat', 'multi-collateral', 'algorithmic')),
  collateral_ratio NUMERIC(5,2) NOT NULL DEFAULT 100.00,
  
  -- Canton Network
  canton_contract_id TEXT,
  issuer_party_id TEXT,
  
  -- Configuration
  config JSONB NOT NULL DEFAULT '{}',
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'retired')),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Stablecoin Holders Table
CREATE TABLE IF NOT EXISTS stablecoin_holders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stablecoin_id UUID NOT NULL REFERENCES private_stablecoins(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Canton Network Party
  party_id TEXT NOT NULL,
  address TEXT NOT NULL,
  
  -- Balance
  balance TEXT NOT NULL DEFAULT '0',
  
  -- Compliance
  kyc_status TEXT NOT NULL DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'approved', 'rejected')),
  whitelisted BOOLEAN NOT NULL DEFAULT false,
  blacklisted BOOLEAN NOT NULL DEFAULT false,
  frozen BOOLEAN NOT NULL DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(stablecoin_id, address)
);

-- Stablecoin Operations Table
CREATE TABLE IF NOT EXISTS stablecoin_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stablecoin_id UUID NOT NULL REFERENCES private_stablecoins(id) ON DELETE CASCADE,
  
  -- Operation Details
  operation_type TEXT NOT NULL CHECK (operation_type IN ('mint', 'burn', 'transfer', 'freeze', 'unfreeze', 'blacklist', 'whitelist')),
  amount TEXT,
  target_address TEXT,
  reason TEXT,
  
  -- Canton Transaction
  canton_transaction_id TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Circle USDC Reserves Table (for USDC-backed stablecoins)
CREATE TABLE IF NOT EXISTS stablecoin_reserves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stablecoin_id UUID NOT NULL REFERENCES private_stablecoins(id) ON DELETE CASCADE,
  
  -- Reserve Details
  chain TEXT NOT NULL,
  reserve_address TEXT NOT NULL,
  collateral_amount TEXT NOT NULL DEFAULT '0',
  
  -- Circle Integration
  circle_wallet_id TEXT,
  
  -- Verification
  last_verified_at TIMESTAMPTZ,
  verification_tx_hash TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- xReserve Transactions Table (Canton Network <-> L1)
CREATE TABLE IF NOT EXISTS xreserve_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stablecoin_id UUID REFERENCES private_stablecoins(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Transaction Type
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('mint', 'burn')),
  
  -- Amount
  amount TEXT NOT NULL,
  
  -- Source
  source_chain TEXT,
  source_address TEXT,
  source_party_id TEXT,
  
  -- Destination
  destination_chain TEXT,
  destination_address TEXT,
  destination_party_id TEXT,
  
  -- Transaction IDs
  circle_transaction_id TEXT,
  canton_contract_id TEXT,
  l1_tx_hash TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_private_stablecoins_user_id ON private_stablecoins(user_id);
CREATE INDEX IF NOT EXISTS idx_private_stablecoins_symbol ON private_stablecoins(symbol);
CREATE INDEX IF NOT EXISTS idx_private_stablecoins_status ON private_stablecoins(status);

CREATE INDEX IF NOT EXISTS idx_stablecoin_holders_stablecoin_id ON stablecoin_holders(stablecoin_id);
CREATE INDEX IF NOT EXISTS idx_stablecoin_holders_address ON stablecoin_holders(address);
CREATE INDEX IF NOT EXISTS idx_stablecoin_holders_kyc_status ON stablecoin_holders(kyc_status);

CREATE INDEX IF NOT EXISTS idx_stablecoin_operations_stablecoin_id ON stablecoin_operations(stablecoin_id);
CREATE INDEX IF NOT EXISTS idx_stablecoin_operations_type ON stablecoin_operations(operation_type);
CREATE INDEX IF NOT EXISTS idx_stablecoin_operations_created_at ON stablecoin_operations(created_at);

CREATE INDEX IF NOT EXISTS idx_stablecoin_reserves_stablecoin_id ON stablecoin_reserves(stablecoin_id);

CREATE INDEX IF NOT EXISTS idx_xreserve_transactions_user_id ON xreserve_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_xreserve_transactions_status ON xreserve_transactions(status);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE private_stablecoins ENABLE ROW LEVEL SECURITY;
ALTER TABLE stablecoin_holders ENABLE ROW LEVEL SECURITY;
ALTER TABLE stablecoin_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE stablecoin_reserves ENABLE ROW LEVEL SECURITY;
ALTER TABLE xreserve_transactions ENABLE ROW LEVEL SECURITY;

-- Stablecoins Policies
CREATE POLICY "Users can view own stablecoins"
  ON private_stablecoins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create stablecoins"
  ON private_stablecoins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stablecoins"
  ON private_stablecoins FOR UPDATE
  USING (auth.uid() = user_id);

-- Holders Policies
CREATE POLICY "Stablecoin owners can view holders"
  ON stablecoin_holders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM private_stablecoins
      WHERE id = stablecoin_holders.stablecoin_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Stablecoin owners can manage holders"
  ON stablecoin_holders FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM private_stablecoins
      WHERE id = stablecoin_holders.stablecoin_id
      AND user_id = auth.uid()
    )
  );

-- Operations Policies
CREATE POLICY "Stablecoin owners can view operations"
  ON stablecoin_operations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM private_stablecoins
      WHERE id = stablecoin_operations.stablecoin_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Stablecoin owners can create operations"
  ON stablecoin_operations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM private_stablecoins
      WHERE id = stablecoin_operations.stablecoin_id
      AND user_id = auth.uid()
    )
  );

-- Reserves Policies
CREATE POLICY "Stablecoin owners can view reserves"
  ON stablecoin_reserves FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM private_stablecoins
      WHERE id = stablecoin_reserves.stablecoin_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Stablecoin owners can manage reserves"
  ON stablecoin_reserves FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM private_stablecoins
      WHERE id = stablecoin_reserves.stablecoin_id
      AND user_id = auth.uid()
    )
  );

-- xReserve Transactions Policies
CREATE POLICY "Users can view own xReserve transactions"
  ON xreserve_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create xReserve transactions"
  ON xreserve_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- Updated At Triggers
-- ============================================================

CREATE OR REPLACE FUNCTION update_stablecoin_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_private_stablecoins_updated_at
  BEFORE UPDATE ON private_stablecoins
  FOR EACH ROW
  EXECUTE FUNCTION update_stablecoin_updated_at();

CREATE TRIGGER trigger_stablecoin_holders_updated_at
  BEFORE UPDATE ON stablecoin_holders
  FOR EACH ROW
  EXECUTE FUNCTION update_stablecoin_updated_at();

CREATE TRIGGER trigger_stablecoin_reserves_updated_at
  BEFORE UPDATE ON stablecoin_reserves
  FOR EACH ROW
  EXECUTE FUNCTION update_stablecoin_updated_at();
