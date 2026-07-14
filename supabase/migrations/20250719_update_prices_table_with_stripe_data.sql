-- Migration: Update prices table with Stripe price data from CSV
-- Adds missing columns and inserts/updates price records

-- Add new columns to prices table to match Stripe schema
ALTER TABLE public.prices
ADD COLUMN IF NOT EXISTS product_name TEXT,
ADD COLUMN IF NOT EXISTS statement_descriptor TEXT,
ADD COLUMN IF NOT EXISTS tax_code TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
ADD COLUMN IF NOT EXISTS usage_type TEXT DEFAULT 'licensed',
ADD COLUMN IF NOT EXISTS aggregate_usage TEXT,
ADD COLUMN IF NOT EXISTS billing_scheme TEXT DEFAULT 'per_unit',
ADD COLUMN IF NOT EXISTS tax_behavior TEXT DEFAULT 'exclusive';

-- Create index on product_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_prices_product_id ON public.prices(product_id);
CREATE INDEX IF NOT EXISTS idx_prices_active ON public.prices(active);

-- Insert or update price records from Stripe CSV data
-- Lite Plan (Introductory) $9/Month
INSERT INTO public.prices (
    id, 
    product_id, 
    product_name,
    statement_descriptor,
    tax_code,
    description,
    created_at,
    unit_amount,
    currency,
    type,
    interval,
    interval_count,
    usage_type,
    billing_scheme,
    trial_period_days,
    tax_behavior,
    active,
    metadata
) VALUES (
    'price_1SQApkGuLRgF7OEEpxo3aalx',
    'prod_TMufaEtW7h95Aj',
    'Lite Plan $9/Month (Introductory)',
    NULL,
    'txcd_10000000',
    'Introductory pricing for new customers - limited time offer',
    '2025-11-05 17:49:00+00',
    900, -- $9.00 in cents
    'usd',
    'recurring',
    'month',
    1,
    'licensed',
    'per_unit',
    NULL,
    'exclusive',
    true,
    '{"tier": "lite_intro", "features": ["5 users", "100 assets", "Basic AI agents"]}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    product_id = EXCLUDED.product_id,
    product_name = EXCLUDED.product_name,
    unit_amount = EXCLUDED.unit_amount,
    active = EXCLUDED.active,
    metadata = EXCLUDED.metadata;

-- Lite Plan (Introductory) $108/year
INSERT INTO public.prices (
    id, 
    product_id, 
    product_name,
    statement_descriptor,
    tax_code,
    description,
    created_at,
    unit_amount,
    currency,
    type,
    interval,
    interval_count,
    usage_type,
    billing_scheme,
    trial_period_days,
    tax_behavior,
    active,
    metadata
) VALUES (
    'price_1SQAqhGuLRgF7OEEBaQ56nQI',
    'prod_TMug1pcu5Gu5xY',
    'Lite Plan (Introductory) $108/year',
    NULL,
    'txcd_10000000',
    'Introductory annual pricing - save 16% compared to monthly',
    '2025-11-05 17:50:00+00',
    10800, -- $108.00 in cents
    'usd',
    'recurring',
    'year',
    1,
    'licensed',
    'per_unit',
    NULL,
    'exclusive',
    true,
    '{"tier": "lite_intro_annual", "features": ["5 users", "100 assets", "Basic AI agents"]}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    product_id = EXCLUDED.product_id,
    product_name = EXCLUDED.product_name,
    unit_amount = EXCLUDED.unit_amount,
    active = EXCLUDED.active,
    metadata = EXCLUDED.metadata;

-- Lite Plan $19/month
INSERT INTO public.prices (
    id, 
    product_id, 
    product_name,
    statement_descriptor,
    tax_code,
    description,
    created_at,
    unit_amount,
    currency,
    type,
    interval,
    interval_count,
    usage_type,
    billing_scheme,
    trial_period_days,
    tax_behavior,
    active,
    metadata
) VALUES (
    'price_1SQArfGuLRgF7OEERzczMl7Y',
    'prod_TMuhYIE74GWDIj',
    'Lite Plan $19/month',
    NULL,
    'txcd_10000000',
    'Standard Lite plan with essential features',
    '2025-11-05 17:51:00+00',
    1900, -- $19.00 in cents
    'usd',
    'recurring',
    'month',
    1,
    'licensed',
    'per_unit',
    NULL,
    'exclusive',
    true,
    '{"tier": "lite", "features": ["5 users", "100 assets", "Basic AI agents"]}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    product_id = EXCLUDED.product_id,
    product_name = EXCLUDED.product_name,
    unit_amount = EXCLUDED.unit_amount,
    active = EXCLUDED.active,
    metadata = EXCLUDED.metadata;

-- Lite Plan $228/year
INSERT INTO public.prices (
    id, 
    product_id, 
    product_name,
    statement_descriptor,
    tax_code,
    description,
    created_at,
    unit_amount,
    currency,
    type,
    interval,
    interval_count,
    usage_type,
    billing_scheme,
    trial_period_days,
    tax_behavior,
    active,
    metadata
) VALUES (
    'price_1SQAsnGuLRgF7OEExU2oaQTv',
    'prod_TMuiD5ZbsLcCGp',
    'Lite Plan $228/year',
    NULL,
    'txcd_10000000',
    'Annual Lite plan - save 2 months compared to monthly',
    '2025-11-05 17:52:00+00',
    22800, -- $228.00 in cents
    'usd',
    'recurring',
    'year',
    1,
    'licensed',
    'per_unit',
    NULL,
    'exclusive',
    true,
    '{"tier": "lite_annual", "features": ["5 users", "100 assets", "Basic AI agents"]}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    product_id = EXCLUDED.product_id,
    product_name = EXCLUDED.product_name,
    unit_amount = EXCLUDED.unit_amount,
    active = EXCLUDED.active,
    metadata = EXCLUDED.metadata;

-- Pro Plan $99/month
INSERT INTO public.prices (
    id, 
    product_id, 
    product_name,
    statement_descriptor,
    tax_code,
    description,
    created_at,
    unit_amount,
    currency,
    type,
    interval,
    interval_count,
    usage_type,
    billing_scheme,
    trial_period_days,
    tax_behavior,
    active,
    metadata
) VALUES (
    'price_1SQAtHGuLRgF7OEEDDDs4bbt',
    'prod_TMui1t8iLoxYH4',
    'Pro Plan $99/month',
    NULL,
    'txcd_10000000',
    'Professional plan with advanced features and analytics',
    '2025-11-05 17:53:00+00',
    9900, -- $99.00 in cents
    'usd',
    'recurring',
    'month',
    1,
    'licensed',
    'per_unit',
    NULL,
    'exclusive',
    true,
    '{"tier": "pro", "features": ["25 users", "1000 assets", "Advanced AI agents", "Custom workflows"]}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    product_id = EXCLUDED.product_id,
    product_name = EXCLUDED.product_name,
    unit_amount = EXCLUDED.unit_amount,
    active = EXCLUDED.active,
    metadata = EXCLUDED.metadata;

-- Pro Plan $1188/year
INSERT INTO public.prices (
    id, 
    product_id, 
    product_name,
    statement_descriptor,
    tax_code,
    description,
    created_at,
    unit_amount,
    currency,
    type,
    interval,
    interval_count,
    usage_type,
    billing_scheme,
    trial_period_days,
    tax_behavior,
    active,
    metadata
) VALUES (
    'price_1SQAuJGuLRgF7OEEBbQfxd7R',
    'prod_TMujimafO3kxtp',
    'Pro Plan $1188/year',
    NULL,
    'txcd_10000000',
    'Annual Pro plan - save 10% compared to monthly',
    '2025-11-05 17:54:00+00',
    118800, -- $1188.00 in cents
    'usd',
    'recurring',
    'year',
    1,
    'licensed',
    'per_unit',
    NULL,
    'exclusive',
    true,
    '{"tier": "pro_annual", "features": ["25 users", "1000 assets", "Advanced AI agents", "Custom workflows"]}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    product_id = EXCLUDED.product_id,
    product_name = EXCLUDED.product_name,
    unit_amount = EXCLUDED.unit_amount,
    active = EXCLUDED.active,
    metadata = EXCLUDED.metadata;

-- Enterprise Plan $499/month
INSERT INTO public.prices (
    id, 
    product_id, 
    product_name,
    statement_descriptor,
    tax_code,
    description,
    created_at,
    unit_amount,
    currency,
    type,
    interval,
    interval_count,
    usage_type,
    billing_scheme,
    trial_period_days,
    tax_behavior,
    active,
    metadata
) VALUES (
    'price_1SQAtjGuLRgF7OEEFvurxw6a',
    'prod_TMujR00vorQM9R',
    'Enterprise Plan $499/month',
    NULL,
    'txcd_10000000',
    'Enterprise plan with unlimited features, dedicated support, and custom integrations',
    '2025-11-05 17:53:00+00',
    49900, -- $499.00 in cents
    'usd',
    'recurring',
    'month',
    1,
    'licensed',
    'per_unit',
    NULL,
    'exclusive',
    true,
    '{"tier": "enterprise", "features": ["Unlimited users", "Unlimited assets", "Enterprise AI agents", "Custom integrations", "Dedicated support"]}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    product_id = EXCLUDED.product_id,
    product_name = EXCLUDED.product_name,
    unit_amount = EXCLUDED.unit_amount,
    active = EXCLUDED.active,
    metadata = EXCLUDED.metadata;

-- Enterprise Plan $5988/year
INSERT INTO public.prices (
    id, 
    product_id, 
    product_name,
    statement_descriptor,
    tax_code,
    description,
    created_at,
    unit_amount,
    currency,
    type,
    interval,
    interval_count,
    usage_type,
    billing_scheme,
    trial_period_days,
    tax_behavior,
    active,
    metadata
) VALUES (
    'price_1SQAujGuLRgF7OEEP66Cs5tR',
    'prod_TMukE7DkQ9ocQz',
    'Enterprise Plan $5988/year',
    NULL,
    'txcd_10000000',
    'Annual Enterprise plan - save 12 months compared to monthly',
    '2025-11-05 17:54:00+00',
    598800, -- $5988.00 in cents
    'usd',
    'recurring',
    'year',
    1,
    'licensed',
    'per_unit',
    NULL,
    'unspecified',
    true,
    '{"tier": "enterprise_annual", "features": ["Unlimited users", "Unlimited assets", "Enterprise AI agents", "Custom integrations", "Dedicated support"]}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    product_id = EXCLUDED.product_id,
    product_name = EXCLUDED.product_name,
    unit_amount = EXCLUDED.unit_amount,
    active = EXCLUDED.active,
    metadata = EXCLUDED.metadata;

-- Add comment to table
COMMENT ON TABLE public.prices IS 'Stores Stripe pricing information for subscription plans. Updated from Stripe dashboard export on 2025-11-05.';
