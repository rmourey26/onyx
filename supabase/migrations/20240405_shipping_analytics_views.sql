-- Create a view for shipping analytics by day
CREATE OR REPLACE VIEW shipping_analytics AS
SELECT
  DATE_TRUNC('day', shipping_date) AS shipping_day,
  COUNT(*) AS total_shipments,
  AVG(EXTRACT(EPOCH FROM (estimated_delivery - shipping_date)) / 86400) AS avg_estimated_delivery_days,
  AVG(EXTRACT(EPOCH FROM (actual_delivery - shipping_date)) / 86400) AS avg_actual_delivery_days,
  SUM(cost) AS total_cost,
  AVG(cost) AS avg_cost,
  SUM(weight) AS total_weight,
  AVG(weight) AS avg_weight,
  COUNT(*) FILTER (WHERE status = 'delivered') AS delivered_count,
  COUNT(*) FILTER (WHERE status = 'in_transit') AS in_transit_count,
  COUNT(*) FILTER (WHERE status = 'delayed') AS delayed_count
FROM
  shipping
WHERE
  shipping_date IS NOT NULL
GROUP BY
  shipping_day
ORDER BY
  shipping_day DESC;

-- Create a view for package utilization
CREATE OR REPLACE VIEW package_utilization AS
SELECT
  rp.id,
  rp.package_id,
  rp.name,
  rp.reuse_count,
  rp.status,
  COUNT(s.id) AS shipment_count,
  MAX(s.shipping_date) AS last_used_date,
  rp.created_at,
  EXTRACT(EPOCH FROM (NOW() - rp.created_at)) / 86400 AS days_since_creation,
  CASE
    WHEN EXTRACT(EPOCH FROM (NOW() - rp.created_at)) / 86400 = 0 THEN 0
    ELSE rp.reuse_count / (EXTRACT(EPOCH FROM (NOW() - rp.created_at)) / 86400)
  END AS reuses_per_day
FROM
  reusable_packages rp
LEFT JOIN
  shipping s ON rp.id = ANY(s.package_ids)
GROUP BY
  rp.id, rp.package_id, rp.name, rp.reuse_count, rp.status, rp.created_at;

-- Create a function to increment the reuse count
CREATE OR REPLACE FUNCTION increment_reuse_count()
RETURNS integer
LANGUAGE SQL
AS $$
  SELECT reuse_count + 1
$$;
