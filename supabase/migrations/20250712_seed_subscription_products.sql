-- Seed subscription products and prices
-- This mirrors the functionality of scripts/seed-stripe-products.ts

-- Clear existing data for a clean seed
DELETE FROM prices WHERE id != '0';
DELETE FROM products WHERE id != '0';

-- Insert products
INSERT INTO products (id, active, name, description, metadata) VALUES
(
  'prod_starter_plan',
  true,
  'Starter',
  'For small stores getting started with AI.',
  '{"index": 0}'::jsonb
),
(
  'prod_growth_plan',
  true,
  'Growth',
  'For growing businesses ready to scale with advanced AI.',
  '{"index": 1, "featured": "true"}'::jsonb
),
(
  'prod_scale_plan',
  true,
  'Scale',
  'For large enterprises needing the full, unlimited suite.',
  '{"index": 2}'::jsonb
);

-- Insert prices
INSERT INTO prices (id, product_id, active, unit_amount, currency, type, interval) VALUES
(
  'price_starter_monthly',
  'prod_starter_plan',
  true,
  2900,
  'usd',
  'recurring',
  'month'
),
(
  'price_growth_monthly',
  'prod_growth_plan',
  true,
  9900,
  'usd',
  'recurring',
  'month'
),
(
  'price_scale_monthly',
  'prod_scale_plan',
  true,
  24900,
  'usd',
  'recurring',
  'month'
);

-- Verify the data was inserted correctly
SELECT 
  p.name as product_name,
  p.description,
  p.metadata,
  pr.unit_amount / 100.0 as price_dollars,
  pr.interval
FROM products p
JOIN prices pr ON p.id = pr.product_id
ORDER BY (p.metadata->>'index')::int;
