-- Token Trading and Marketplace Tables

-- Token Offers table
CREATE TABLE IF NOT EXISTS public.token_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pool_id UUID NOT NULL REFERENCES public.fractionalization_pools(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    fraction_count INTEGER NOT NULL CHECK (fraction_count > 0),
    offer_price DECIMAL(20, 8) NOT NULL CHECK (offer_price > 0),
    total_price DECIMAL(20, 8) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled', 'expired')),
    expires_at TIMESTAMPTZ NOT NULL,
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Token Transactions table
CREATE TABLE IF NOT EXISTS public.token_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pool_id UUID REFERENCES public.fractionalization_pools(id) ON DELETE SET NULL,
    from_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    to_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    fraction_count INTEGER NOT NULL,
    price DECIMAL(20, 8) NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('sale', 'transfer', 'swap')),
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
    tx_hash TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Token Marketplace Listings table
CREATE TABLE IF NOT EXISTS public.token_marketplace_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_id UUID NOT NULL REFERENCES public.asset_tokens(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    price_per_fraction DECIMAL(20, 8) NOT NULL CHECK (price_per_fraction > 0),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'cancelled')),
    views INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    sold_at TIMESTAMPTZ
);

-- Token Price History table (for tracking valuation changes)
CREATE TABLE IF NOT EXISTS public.token_price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pool_id UUID NOT NULL REFERENCES public.fractionalization_pools(id) ON DELETE CASCADE,
    price_per_fraction DECIMAL(20, 8) NOT NULL,
    volume INTEGER DEFAULT 0,
    source TEXT NOT NULL CHECK (source IN ('sale', 'offer', 'manual', 'market')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_token_offers_pool_id ON public.token_offers(pool_id);
CREATE INDEX IF NOT EXISTS idx_token_offers_buyer_id ON public.token_offers(buyer_id);
CREATE INDEX IF NOT EXISTS idx_token_offers_status ON public.token_offers(status);
CREATE INDEX IF NOT EXISTS idx_token_offers_expires_at ON public.token_offers(expires_at);

CREATE INDEX IF NOT EXISTS idx_token_transactions_pool_id ON public.token_transactions(pool_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_from_user ON public.token_transactions(from_user_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_to_user ON public.token_transactions(to_user_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_created_at ON public.token_transactions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_marketplace_listings_token_id ON public.token_marketplace_listings(token_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_seller_id ON public.token_marketplace_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_status ON public.token_marketplace_listings(status);

CREATE INDEX IF NOT EXISTS idx_token_price_history_pool_id ON public.token_price_history(pool_id);
CREATE INDEX IF NOT EXISTS idx_token_price_history_created_at ON public.token_price_history(created_at DESC);

-- Row Level Security
ALTER TABLE public.token_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_price_history ENABLE ROW LEVEL SECURITY;

-- Fixed UUID type mismatches in RLS policies by casting auth.uid() to UUID
-- Token Offers policies
CREATE POLICY "Users can view offers for their assets or their own offers"
    ON public.token_offers FOR SELECT
    USING (
        buyer_id = (auth.uid())::uuid OR
        EXISTS (
            SELECT 1 FROM public.fractionalization_pools fp
            INNER JOIN public.asset_tokens at ON fp.asset_token_id = at.id
            WHERE fp.id = token_offers.pool_id AND at.user_id = (auth.uid())::uuid
        )
    );

CREATE POLICY "Users can create offers"
    ON public.token_offers FOR INSERT
    WITH CHECK (buyer_id = (auth.uid())::uuid);

CREATE POLICY "Users can update their own offers"
    ON public.token_offers FOR UPDATE
    USING (buyer_id = (auth.uid())::uuid);

-- Token Transactions policies
CREATE POLICY "Users can view their own transactions"
    ON public.token_transactions FOR SELECT
    USING (from_user_id = (auth.uid())::uuid OR to_user_id = (auth.uid())::uuid);

CREATE POLICY "System can insert transactions"
    ON public.token_transactions FOR INSERT
    WITH CHECK (true);

-- Marketplace Listings policies
CREATE POLICY "Anyone can view active listings"
    ON public.token_marketplace_listings FOR SELECT
    USING (status = 'active');

CREATE POLICY "Sellers can create listings"
    ON public.token_marketplace_listings FOR INSERT
    WITH CHECK (seller_id = (auth.uid())::uuid);

CREATE POLICY "Sellers can update their listings"
    ON public.token_marketplace_listings FOR UPDATE
    USING (seller_id = (auth.uid())::uuid);

-- Price History policies
CREATE POLICY "Anyone can view price history"
    ON public.token_price_history FOR SELECT
    USING (true);

CREATE POLICY "System can insert price history"
    ON public.token_price_history FOR INSERT
    WITH CHECK (true);

-- Triggers
CREATE TRIGGER set_token_offers_updated_at
    BEFORE UPDATE ON public.token_offers
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_marketplace_listings_updated_at
    BEFORE UPDATE ON public.token_marketplace_listings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Function to record price when transaction occurs
CREATE OR REPLACE FUNCTION public.record_transaction_price()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND NEW.pool_id IS NOT NULL THEN
        INSERT INTO public.token_price_history (pool_id, price_per_fraction, volume, source)
        VALUES (
            NEW.pool_id,
            NEW.price / NEW.fraction_count,
            NEW.fraction_count,
            NEW.transaction_type
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER record_price_on_transaction
    AFTER INSERT OR UPDATE ON public.token_transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.record_transaction_price();

-- Function to auto-expire offers
CREATE OR REPLACE FUNCTION public.expire_old_offers()
RETURNS void AS $$
BEGIN
    UPDATE public.token_offers
    SET status = 'expired'
    WHERE status = 'pending'
    AND expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON TABLE public.token_offers IS 'Buy offers for fractional tokens';
COMMENT ON TABLE public.token_transactions IS 'Historical record of all token transactions';
COMMENT ON TABLE public.token_marketplace_listings IS 'Active marketplace listings for tokenized assets';
COMMENT ON TABLE public.token_price_history IS 'Price tracking for fractional tokens over time';
