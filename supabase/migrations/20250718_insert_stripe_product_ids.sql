-- Migration to insert actual Stripe Product IDs and Price IDs for Resend-It subscription plans
-- Replaces placeholder product IDs with real Stripe product/price identifiers

-- Note: This migration uses UPSERT (INSERT ... ON CONFLICT) to handle both new installations
-- and updates to existing data

-- ============================================================================
-- MONTHLY PLANS
-- ============================================================================

-- Lite Plan - Introductory ($9/month)
INSERT INTO public.products (id, active, name, description, metadata)
VALUES (
  'prod_TMufaEtW7h95Aj',
  true,
  'Lite Plan (Introductory)',
  'AI-powered asset intelligence for small businesses - Special introductory pricing',
  jsonb_build_object(
    'tier', 'lite',
    'pricing_type', 'introductory',
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

-- Lite Plan - Standard ($19/month)
INSERT INTO public.products (id, active, name, description, metadata)
VALUES (
  'prod_TMuhYIE74GWDIj',
  true,
  'Lite Plan',
  'AI-powered asset intelligence for small businesses - Standard pricing',
  jsonb_build_object(
    'tier', 'lite',
    'pricing_type', 'standard',
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

-- Pro Plan ($99/month)
INSERT INTO public.products (id, active, name, description, metadata)
VALUES (
  'prod_TMui1t8iLoxYH4',
  true,
  'Pro Plan',
  'Advanced AI-powered asset intelligence for growing businesses with API access',
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

-- Enterprise Plan ($499/month)
INSERT INTO public.products (id, active, name, description, metadata)
VALUES (
  'prod_TMujR00vorQM9R',
  true,
  'Enterprise Plan',
  'Complete AI-powered asset intelligence platform for large organizations',
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

-- ============================================================================
-- ANNUAL PLANS
-- ============================================================================

-- Lite Plan - Introductory Annual ($108/year)
INSERT INTO public.products (id, active, name, description, metadata)
VALUES (
  'prod_TMug1pcu5Gu5xY',
  true,
  'Lite Plan (Introductory) - Annual',
  'AI-powered asset intelligence for small businesses - Annual introductory pricing',
  jsonb_build_object(
    'tier', 'lite',
    'pricing_type', 'introductory',
    'billing_period', 'annual',
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

-- Lite Plan - Standard Annual ($228/year)
INSERT INTO public.products (id, active, name, description, metadata)
VALUES (
  'prod_TMuiD5ZbsLcCGp',
  true,
  'Lite Plan - Annual',
  'AI-powered asset intelligence for small businesses - Annual standard pricing',
  jsonb_build_object(
    'tier', 'lite',
    'pricing_type', 'standard',
    'billing_period', 'annual',
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

-- Pro Plan - Annual ($1188/year)
INSERT INTO public.products (id, active, name, description, metadata)
VALUES (
  'prod_TMujimafO3kxtp',
  true,
  'Pro Plan - Annual',
  'Advanced AI-powered asset intelligence - Annual pricing',
  jsonb_build_object(
    'tier', 'pro',
    'billing_period', 'annual',
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

-- Enterprise Plan - Annual ($5988/year)
INSERT INTO public.products (id, active, name, description, metadata)
VALUES (
  'prod_TMukE7DkQ9ocQz',
  true,
  'Enterprise Plan - Annual',
  'Complete AI-powered asset intelligence platform - Annual pricing',
  jsonb_build_object(
    'tier', 'enterprise',
    'billing_period', 'annual',
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

-- ============================================================================
-- INDEXES AND COMMENTS
-- ============================================================================

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_products_metadata_tier ON public.products USING GIN ((metadata->'tier'));
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(active) WHERE active = true;

-- Add descriptive comments
COMMENT ON TABLE public.products IS 'Stripe products synchronized with actual Stripe Product IDs from Resend-It Stripe account';
COMMENT ON COLUMN public.products.id IS 'Actual Stripe Product ID (e.g., prod_TMufaEtW7h95Aj)';
COMMENT ON COLUMN public.products.metadata IS 'Product configuration including tier, limits, and features as defined in Strategic Pricing Analysis';

-- Verification query to display all products
DO $$
BEGIN
  RAISE NOTICE 'Successfully inserted % Stripe products', (SELECT COUNT(*) FROM public.products WHERE id LIKE 'prod_TMu%');
END $$;
