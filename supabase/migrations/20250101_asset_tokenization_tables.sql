-- Asset Tokenization Tables
-- Comprehensive schema for managing tokenized assets on Sui blockchain

-- Asset Tokens table
CREATE TABLE IF NOT EXISTS public.asset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token_type TEXT NOT NULL CHECK (token_type IN ('nft', 'fungible')),
    blockchain TEXT NOT NULL DEFAULT 'sui',
    contract_address TEXT NOT NULL,
    token_id TEXT NOT NULL, -- On-chain object ID
    wallet_address TEXT NOT NULL,
    tx_hash TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'transferred', 'burned')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Fractionalization Pools table
CREATE TABLE IF NOT EXISTS public.fractionalization_pools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_token_id UUID NOT NULL REFERENCES public.asset_tokens(id) ON DELETE CASCADE,
    pool_id TEXT NOT NULL UNIQUE, -- On-chain pool object ID
    total_fractions INTEGER NOT NULL CHECK (total_fractions > 0),
    available_fractions INTEGER NOT NULL CHECK (available_fractions >= 0),
    price_per_fraction DECIMAL(20, 8) NOT NULL CHECK (price_per_fraction > 0),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'sold_out')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Fractional Ownerships table
CREATE TABLE IF NOT EXISTS public.fractional_ownerships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pool_id UUID NOT NULL REFERENCES public.fractionalization_pools(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    fraction_count INTEGER NOT NULL CHECK (fraction_count > 0),
    ownership_percentage DECIMAL(10, 6) NOT NULL CHECK (ownership_percentage > 0 AND ownership_percentage <= 100),
    purchase_price DECIMAL(20, 8) NOT NULL,
    tx_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Token Transfer History table
CREATE TABLE IF NOT EXISTS public.token_transfer_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_id UUID NOT NULL REFERENCES public.asset_tokens(id) ON DELETE CASCADE,
    from_address TEXT NOT NULL,
    to_address TEXT NOT NULL,
    tx_hash TEXT NOT NULL UNIQUE,
    transfer_type TEXT NOT NULL CHECK (transfer_type IN ('sale', 'gift', 'swap', 'other')),
    transfer_value DECIMAL(20, 8),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Token Valuations table (track value over time)
CREATE TABLE IF NOT EXISTS public.token_valuations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_id UUID NOT NULL REFERENCES public.asset_tokens(id) ON DELETE CASCADE,
    valuation_amount DECIMAL(20, 8) NOT NULL,
    valuation_method TEXT NOT NULL CHECK (valuation_method IN ('market', 'appraisal', 'algorithmic', 'manual')),
    valuation_source TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_asset_tokens_user_id ON public.asset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_asset_tokens_asset_id ON public.asset_tokens(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_tokens_status ON public.asset_tokens(status);
CREATE INDEX IF NOT EXISTS idx_asset_tokens_blockchain ON public.asset_tokens(blockchain);

CREATE INDEX IF NOT EXISTS idx_fractionalization_pools_asset_token_id ON public.fractionalization_pools(asset_token_id);
CREATE INDEX IF NOT EXISTS idx_fractionalization_pools_status ON public.fractionalization_pools(status);

CREATE INDEX IF NOT EXISTS idx_fractional_ownerships_pool_id ON public.fractional_ownerships(pool_id);
CREATE INDEX IF NOT EXISTS idx_fractional_ownerships_user_id ON public.fractional_ownerships(user_id);

CREATE INDEX IF NOT EXISTS idx_token_transfer_history_token_id ON public.token_transfer_history(token_id);
CREATE INDEX IF NOT EXISTS idx_token_transfer_history_from_address ON public.token_transfer_history(from_address);
CREATE INDEX IF NOT EXISTS idx_token_transfer_history_to_address ON public.token_transfer_history(to_address);

CREATE INDEX IF NOT EXISTS idx_token_valuations_token_id ON public.token_valuations(token_id);
CREATE INDEX IF NOT EXISTS idx_token_valuations_created_at ON public.token_valuations(created_at DESC);

-- Row Level Security (RLS) Policies
ALTER TABLE public.asset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fractionalization_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fractional_ownerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_transfer_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_valuations ENABLE ROW LEVEL SECURITY;

-- Asset Tokens policies
CREATE POLICY "Users can view their own asset tokens"
    ON public.asset_tokens FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own asset tokens"
    ON public.asset_tokens FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own asset tokens"
    ON public.asset_tokens FOR UPDATE
    USING (user_id = auth.uid());

-- Fractionalization Pools policies (public read, owner write)
CREATE POLICY "Anyone can view active fractionalization pools"
    ON public.fractionalization_pools FOR SELECT
    USING (status = 'active');

CREATE POLICY "Token owners can create fractionalization pools"
    ON public.fractionalization_pools FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.asset_tokens
            WHERE asset_tokens.id = fractionalization_pools.asset_token_id 
            AND asset_tokens.user_id = auth.uid()
        )
    );

CREATE POLICY "Token owners can update their pools"
    ON public.fractionalization_pools FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.asset_tokens
            WHERE asset_tokens.id = fractionalization_pools.asset_token_id 
            AND asset_tokens.user_id = auth.uid()
        )
    );

-- Fractional Ownerships policies
CREATE POLICY "Users can view their own fractional ownerships"
    ON public.fractional_ownerships FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own fractional ownerships"
    ON public.fractional_ownerships FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Token Transfer History policies (public read)
CREATE POLICY "Anyone can view token transfer history"
    ON public.token_transfer_history FOR SELECT
    USING (true);

CREATE POLICY "System can insert transfer history"
    ON public.token_transfer_history FOR INSERT
    WITH CHECK (true);

-- Token Valuations policies
CREATE POLICY "Users can view valuations of their tokens"
    ON public.token_valuations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.asset_tokens
            WHERE asset_tokens.id = token_valuations.token_id 
            AND asset_tokens.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert valuations for their tokens"
    ON public.token_valuations FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.asset_tokens
            WHERE asset_tokens.id = token_valuations.token_id 
            AND asset_tokens.user_id = auth.uid()
        )
    );

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_asset_tokens_updated_at
    BEFORE UPDATE ON public.asset_tokens
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_fractionalization_pools_updated_at
    BEFORE UPDATE ON public.fractionalization_pools
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Function to auto-update pool status when sold out
CREATE OR REPLACE FUNCTION public.update_pool_status_on_fraction_sale()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.available_fractions = 0 THEN
        UPDATE public.fractionalization_pools
        SET status = 'sold_out'
        WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_update_pool_status
    AFTER UPDATE OF available_fractions ON public.fractionalization_pools
    FOR EACH ROW
    WHEN (NEW.available_fractions = 0 AND OLD.available_fractions > 0)
    EXECUTE FUNCTION public.update_pool_status_on_fraction_sale();

-- Comments for documentation
COMMENT ON TABLE public.asset_tokens IS 'Stores tokenized asset NFTs minted on Sui blockchain';
COMMENT ON TABLE public.fractionalization_pools IS 'Manages fractional ownership pools for tokenized assets';
COMMENT ON TABLE public.fractional_ownerships IS 'Records user ownership of fractional asset tokens';
COMMENT ON TABLE public.token_transfer_history IS 'Tracks all token transfers and ownership changes';
COMMENT ON TABLE public.token_valuations IS 'Historical valuation records for tokenized assets';
