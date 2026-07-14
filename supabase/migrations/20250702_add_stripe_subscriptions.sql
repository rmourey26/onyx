-- Add stripe_customer_id to profiles table
ALTER TABLE public.profiles
ADD COLUMN stripe_customer_id TEXT UNIQUE;

-- Create products table to store subscription plan details
CREATE TABLE public.products (
    id TEXT PRIMARY KEY, -- Corresponds to Stripe Product ID
    active BOOLEAN,
    name TEXT,
    description TEXT,
    image TEXT,
    metadata JSONB
);

-- Create prices table to store pricing information for each product
CREATE TABLE public.prices (
    id TEXT PRIMARY KEY, -- Corresponds to Stripe Price ID
    product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
    active BOOLEAN,
    description TEXT,
    unit_amount BIGINT,
    currency TEXT,
    type TEXT, -- 'one_time' or 'recurring'
    interval TEXT, -- 'day', 'week', 'month', 'year'
    interval_count INTEGER,
    trial_period_days INTEGER,
    metadata JSONB
);

-- Create subscriptions table to track user subscriptions
CREATE TABLE public.subscriptions (
    id TEXT PRIMARY KEY, -- Corresponds to Stripe Subscription ID
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    status TEXT, -- Stripe subscription status (e.g., 'active', 'trialing', 'canceled')
    metadata JSONB,
    price_id TEXT REFERENCES public.prices(id),
    quantity INTEGER,
    cancel_at_period_end BOOLEAN,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    current_period_end TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    ended_at TIMESTAMPTZ,
    cancel_at TIMESTAMPTZ,
    canceled_at TIMESTAMPTZ,
    trial_start TIMESTAMPTZ,
    trial_end TIMESTAMPTZ
);

-- Add Row Level Security (RLS) policies
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.products FOR SELECT USING (true);

ALTER TABLE public.prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.prices FOR SELECT USING (true);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Can view own subscription" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
