-- Add is_admin column to profiles table if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Create marketplace_agents table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.marketplace_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'rejected')),
    creator_id UUID REFERENCES auth.users(id) NOT NULL,
    creator_name TEXT NOT NULL,
    avatar_url TEXT,
    capabilities TEXT[] DEFAULT '{}',
    system_prompt TEXT,
    model_id TEXT,
    tools TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create agent_purchases table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.agent_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    agent_id UUID REFERENCES public.marketplace_agents(id) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
    stripe_payment_intent_id TEXT,
    total_interactions INTEGER DEFAULT 0,
    last_interaction TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, agent_id)
);

-- Create agent_reviews table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.agent_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    agent_id UUID REFERENCES public.marketplace_agents(id) NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    review_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, agent_id)
);

-- Enable RLS
ALTER TABLE public.marketplace_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for marketplace_agents
CREATE POLICY "Public can view active agents" ON public.marketplace_agents
    FOR SELECT USING (status = 'active');

CREATE POLICY "Users can create agents" ON public.marketplace_agents
    FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update own agents" ON public.marketplace_agents
    FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Admins can manage all agents" ON public.marketplace_agents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- RLS Policies for agent_purchases
CREATE POLICY "Users can view own purchases" ON public.agent_purchases
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create purchases" ON public.agent_purchases
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all purchases" ON public.agent_purchases
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- RLS Policies for agent_reviews
CREATE POLICY "Public can view reviews" ON public.agent_reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can create reviews for purchased agents" ON public.agent_reviews
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.agent_purchases 
            WHERE user_id = auth.uid() AND agent_id = agent_reviews.agent_id
        )
    );

CREATE POLICY "Users can update own reviews" ON public.agent_reviews
    FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_marketplace_agents_status ON public.marketplace_agents(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_agents_category ON public.marketplace_agents(category);
CREATE INDEX IF NOT EXISTS idx_marketplace_agents_creator ON public.marketplace_agents(creator_id);
CREATE INDEX IF NOT EXISTS idx_agent_purchases_user ON public.agent_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_purchases_agent ON public.agent_purchases(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_reviews_agent ON public.agent_reviews(agent_id);

-- Function to update agent ratings
CREATE OR REPLACE FUNCTION update_agent_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.marketplace_agents 
    SET rating = (
        SELECT COALESCE(AVG(rating), 0) 
        FROM public.agent_reviews 
        WHERE agent_id = NEW.agent_id
    )
    WHERE id = NEW.agent_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update agent ratings
DROP TRIGGER IF EXISTS trigger_update_agent_rating ON public.agent_reviews;
CREATE TRIGGER trigger_update_agent_rating
    AFTER INSERT OR UPDATE OR DELETE ON public.agent_reviews
    FOR EACH ROW EXECUTE FUNCTION update_agent_rating();
