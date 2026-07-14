-- Migration to add Resend-It Asset Intelligence subscription plans
-- Based on Strategic Pricing and Packaging Analysis

-- Add usage tracking fields to subscriptions table
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS ai_tokens_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ai_tokens_limit INTEGER,
ADD COLUMN IF NOT EXISTS assets_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS assets_limit INTEGER,
ADD COLUMN IF NOT EXISTS licensed_users INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS active_workflows INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS workflows_limit INTEGER,
ADD COLUMN IF NOT EXISTS storage_used_gb DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS storage_limit_gb INTEGER,
ADD COLUMN IF NOT EXISTS has_api_access BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS has_custom_analytics BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS has_integrations BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS plan_tier TEXT;

-- Create function to reset monthly usage
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS void AS $$
BEGIN
  UPDATE public.subscriptions
  SET ai_tokens_used = 0
  WHERE status IN ('active', 'trialing')
  AND current_period_start < NOW() - INTERVAL '1 month';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert Resend-It Asset Intelligence subscription products
-- These will be synced with Stripe products

-- Lite Plan (Introductory)
INSERT INTO public.products (id, active, name, description, metadata)
VALUES (
  'prod_lite_intro',
  true,
  'Lite Plan (Introductory)',
  'AI-powered asset intelligence for small businesses - Special introductory pricing for first 12 months',
  jsonb_build_object(
    'tier', 'lite',
    'ai_tokens_limit', 100000,
    'assets_limit', 100,
    'licensed_users', 1,
    'workflows_limit', 2,
    'storage_limit_gb', 5,
    'has_api_access', false,
    'has_custom_analytics', false,
    'has_integrations', false,
    'features', jsonb_build_array(
      'Full Asset & Lifecycle Management',
      '100,000 AI Tokens per month',
      'AI Insights & Agents',
      'Basic Workflow Automation (2 workflows)',
      'Basic Reporting Dashboards',
      'Mobile App Access',
      '100 Managed Assets',
      '5GB Storage'
    )
  )
)
ON CONFLICT (id) DO UPDATE SET
  active = EXCLUDED.active,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  metadata = EXCLUDED.metadata;

INSERT INTO public.prices (id, product_id, active, unit_amount, currency, type, interval, interval_count, metadata)
VALUES (
  'price_lite_intro_monthly',
  'prod_lite_intro',
  true,
  900, -- $9.00 in cents
  'usd',
  'recurring',
  'month',
  1,
  jsonb_build_object('tier', 'lite', 'pricing_type', 'introductory')
)
ON CONFLICT (id) DO UPDATE SET
  active = EXCLUDED.active,
  unit_amount = EXCLUDED.unit_amount,
  metadata = EXCLUDED.metadata;

INSERT INTO public.prices (id, product_id, active, unit_amount, currency, type, interval, interval_count, metadata)
VALUES (
  'price_lite_intro_annual',
  'prod_lite_intro',
  true,
  10800, -- $108.00 in cents ($9/month * 12)
  'usd',
  'recurring',
  'year',
  1,
  jsonb_build_object('tier', 'lite', 'pricing_type', 'introductory')
)
ON CONFLICT (id) DO UPDATE SET
  active = EXCLUDED.active,
  unit_amount = EXCLUDED.unit_amount,
  metadata = EXCLUDED.metadata;

-- Lite Plan (Standard)
INSERT INTO public.products (id, active, name, description, metadata)
VALUES (
  'prod_lite_standard',
  true,
  'Lite Plan',
  'AI-powered asset intelligence for small businesses - Standard pricing after introductory period',
  jsonb_build_object(
    'tier', 'lite',
    'ai_tokens_limit', 100000,
    'assets_limit', 100,
    'licensed_users', 1,
    'workflows_limit', 2,
    'storage_limit_gb', 5,
    'has_api_access', false,
    'has_custom_analytics', false,
    'has_integrations', false,
    'features', jsonb_build_array(
      'Full Asset & Lifecycle Management',
      '100,000 AI Tokens per month',
      'AI Insights & Agents',
      'Basic Workflow Automation (2 workflows)',
      'Basic Reporting Dashboards',
      'Mobile App Access',
      '100 Managed Assets',
      '5GB Storage'
    )
  )
)
ON CONFLICT (id) DO UPDATE SET
  active = EXCLUDED.active,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  metadata = EXCLUDED.metadata;

INSERT INTO public.prices (id, product_id, active, unit_amount, currency, type, interval, interval_count, metadata)
VALUES (
  'price_lite_standard_monthly',
  'prod_lite_standard',
  true,
  1900, -- $19.00 in cents
  'usd',
  'recurring',
  'month',
  1,
  jsonb_build_object('tier', 'lite', 'pricing_type', 'standard')
)
ON CONFLICT (id) DO UPDATE SET
  active = EXCLUDED.active,
  unit_amount = EXCLUDED.unit_amount,
  metadata = EXCLUDED.metadata;

INSERT INTO public.prices (id, product_id, active, unit_amount, currency, type, interval, interval_count, metadata)
VALUES (
  'price_lite_standard_annual',
  'prod_lite_standard',
  true,
  22800, -- $228.00 in cents ($19/month * 12)
  'usd',
  'recurring',
  'year',
  1,
  jsonb_build_object('tier', 'lite', 'pricing_type', 'standard')
)
ON CONFLICT (id) DO UPDATE SET
  active = EXCLUDED.active,
  unit_amount = EXCLUDED.unit_amount,
  metadata = EXCLUDED.metadata;

-- Pro Plan
INSERT INTO public.products (id, active, name, description, metadata)
VALUES (
  'prod_pro',
  true,
  'Pro Plan',
  'Advanced AI-powered asset intelligence for growing businesses with API access and custom analytics',
  jsonb_build_object(
    'tier', 'pro',
    'ai_tokens_limit', 1000000,
    'assets_limit', 1000,
    'licensed_users', 5,
    'workflows_limit', -1,
    'storage_limit_gb', 50,
    'has_api_access', true,
    'has_custom_analytics', true,
    'has_integrations', true,
    'features', jsonb_build_array(
      'Everything in Lite Plan',
      '1,000,000 AI Tokens per month',
      'Up to 1,000 Managed Assets',
      '5 Licensed Users',
      'Unlimited Workflow Automation',
      'API Access',
      'Custom Analytics & Reporting',
      'Standard Integrations (CRM, Shopify, etc.)',
      '50GB Storage',
      'Priority Support'
    )
  )
)
ON CONFLICT (id) DO UPDATE SET
  active = EXCLUDED.active,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  metadata = EXCLUDED.metadata;

INSERT INTO public.prices (id, product_id, active, unit_amount, currency, type, interval, interval_count, metadata)
VALUES (
  'price_pro_monthly',
  'prod_pro',
  true,
  9900, -- $99.00 in cents
  'usd',
  'recurring',
  'month',
  1,
  jsonb_build_object('tier', 'pro')
)
ON CONFLICT (id) DO UPDATE SET
  active = EXCLUDED.active,
  unit_amount = EXCLUDED.unit_amount,
  metadata = EXCLUDED.metadata;

INSERT INTO public.prices (id, product_id, active, unit_amount, currency, type, interval, interval_count, metadata)
VALUES (
  'price_pro_annual',
  'prod_pro',
  true,
  118800, -- $1,188.00 in cents ($99/month * 12)
  'usd',
  'recurring',
  'year',
  1,
  jsonb_build_object('tier', 'pro')
)
ON CONFLICT (id) DO UPDATE SET
  active = EXCLUDED.active,
  unit_amount = EXCLUDED.unit_amount,
  metadata = EXCLUDED.metadata;

-- Enterprise Plan
INSERT INTO public.products (id, active, name, description, metadata)
VALUES (
  'prod_enterprise',
  true,
  'Enterprise Plan',
  'Complete AI-powered asset intelligence platform for large organizations with unlimited resources',
  jsonb_build_object(
    'tier', 'enterprise',
    'ai_tokens_limit', -1,
    'assets_limit', -1,
    'licensed_users', -1,
    'workflows_limit', -1,
    'storage_limit_gb', -1,
    'has_api_access', true,
    'has_custom_analytics', true,
    'has_integrations', true,
    'features', jsonb_build_array(
      'Everything in Pro Plan',
      'Unlimited AI Tokens',
      'Unlimited Managed Assets',
      'Unlimited Licensed Users',
      'Unlimited Workflow Automation',
      'Advanced API Access',
      'Custom Analytics & Reporting',
      'All Integrations',
      'Unlimited Storage',
      'Multi-site Management',
      'Advanced User Permissions',
      'SSO & SAML',
      'Dedicated Account Manager',
      '24/7 Priority Support',
      'Custom SLA'
    )
  )
)
ON CONFLICT (id) DO UPDATE SET
  active = EXCLUDED.active,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  metadata = EXCLUDED.metadata;

INSERT INTO public.prices (id, product_id, active, unit_amount, currency, type, interval, interval_count, metadata)
VALUES (
  'price_enterprise_monthly',
  'prod_enterprise',
  true,
  49900, -- $499.00 in cents
  'usd',
  'recurring',
  'month',
  1,
  jsonb_build_object('tier', 'enterprise')
)
ON CONFLICT (id) DO UPDATE SET
  active = EXCLUDED.active,
  unit_amount = EXCLUDED.unit_amount,
  metadata = EXCLUDED.metadata;

INSERT INTO public.prices (id, product_id, active, unit_amount, currency, type, interval, interval_count, metadata)
VALUES (
  'price_enterprise_annual',
  'prod_enterprise',
  true,
  598800, -- $5,988.00 in cents ($499/month * 12)
  'usd',
  'recurring',
  'year',
  1,
  jsonb_build_object('tier', 'enterprise')
)
ON CONFLICT (id) DO UPDATE SET
  active = EXCLUDED.active,
  unit_amount = EXCLUDED.unit_amount,
  metadata = EXCLUDED.metadata;

-- Create index for faster subscription queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON public.subscriptions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_tier ON public.subscriptions(plan_tier);

-- Add comment explaining the schema
COMMENT ON TABLE public.subscriptions IS 'Tracks user subscriptions with usage limits based on Strategic Pricing Analysis';
COMMENT ON COLUMN public.subscriptions.ai_tokens_used IS 'Current month AI token usage';
COMMENT ON COLUMN public.subscriptions.ai_tokens_limit IS 'Monthly AI token limit (-1 for unlimited)';
COMMENT ON COLUMN public.subscriptions.assets_limit IS 'Maximum number of managed assets (-1 for unlimited)';
COMMENT ON COLUMN public.subscriptions.workflows_limit IS 'Maximum number of active workflows (-1 for unlimited)';
