-- Add IoT sensor data support to the shipping table
ALTER TABLE shipping 
ADD COLUMN IF NOT EXISTS iot_data JSONB;

-- Create a function to search shipments by IoT sensor data
CREATE OR REPLACE FUNCTION search_shipments_by_iot_data(
  search_query TEXT,
  user_id UUID
) RETURNS SETOF shipping AS $$
BEGIN
  RETURN QUERY
  SELECT s.*
  FROM shipping s
  WHERE s.user_id = search_shipments_by_iot_data.user_id
  AND (
    -- Search in IoT device ID
    (s.iot_data->>'device_id' ILIKE '%' || search_query || '%')
    -- Search in sensor type
    OR (s.iot_data->>'sensor_type' ILIKE '%' || search_query || '%')
    -- Search in alerts
    OR (s.iot_data->'alerts' @> '[{"message": "' || search_query || '"}]')
    -- Search for refrigerated shipments
    OR (search_query ILIKE '%refrigerated%' AND (s.iot_data->>'is_refrigerated')::boolean = true)
    -- Search for temperature excursions
    OR (search_query ILIKE '%temperature%excursion%' AND s.iot_data->'alerts' @> '[{"type": "temperature_excursion"}]')
    -- Search for impact/shock events
    OR (search_query ILIKE '%impact%' AND s.iot_data->'alerts' @> '[{"type": "impact_detected"}]')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a view for IoT sensor analytics
CREATE OR REPLACE VIEW iot_sensor_analytics AS
SELECT
  s.user_id,
  COUNT(*) AS total_iot_shipments,
  COUNT(*) FILTER (WHERE s.iot_data->>'is_refrigerated' = 'true') AS refrigerated_shipments,
  COUNT(*) FILTER (WHERE s.iot_data->'alerts' @> '[{"type": "temperature_excursion"}]') AS temperature_excursions,
  COUNT(*) FILTER (WHERE s.iot_data->'alerts' @> '[{"type": "impact_detected"}]') AS impact_events,
  COUNT(*) FILTER (WHERE s.iot_data->'alerts' @> '[{"type": "low_battery"}]') AS low_battery_events,
  AVG((s.iot_data->'location_tracking' -> 0 ->> 'latitude')::float) AS avg_start_latitude,
  AVG((s.iot_data->'location_tracking' -> 0 ->> 'longitude')::float) AS avg_start_longitude,
  json_agg(DISTINCT s.iot_data->>'sensor_type') FILTER (WHERE s.iot_data->>'sensor_type' IS NOT NULL) AS sensor_types
FROM
  shipping s
WHERE
  s.iot_data IS NOT NULL
GROUP BY
  s.user_id;

-- Create a function to get temperature statistics for refrigerated shipments
CREATE OR REPLACE FUNCTION get_refrigerated_shipment_stats(
  user_id UUID
) RETURNS TABLE (
  avg_min_temp FLOAT,
  avg_max_temp FLOAT,
  excursion_rate FLOAT,
  total_refrigerated_shipments BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH temp_stats AS (
    SELECT
      s.id,
      s.tracking_number,
      s.iot_data,
      CASE WHEN s.iot_data->'alerts' @> '[{"type": "temperature_excursion"}]' THEN 1 ELSE 0 END AS had_excursion
    FROM
      shipping s
    WHERE
      s.user_id = get_refrigerated_shipment_stats.user_id
      AND s.iot_data IS NOT NULL
      AND (s.iot_data->>'is_refrigerated')::boolean = true
  )
  SELECT
    AVG(t.min_temp) AS avg_min_temp,
    AVG(t.max_temp) AS avg_max_temp,
    CASE WHEN COUNT(*) > 0 THEN SUM(ts.had_excursion)::float / COUNT(*) ELSE 0 END AS excursion_rate,
    COUNT(*) AS total_refrigerated_shipments
  FROM
    temp_stats ts,
    LATERAL (
      SELECT
        MIN((reading->>'value')::float) AS min_temp,
        MAX((reading->>'value')::float) AS max_temp
      FROM
        jsonb_array_elements(ts.iot_data->'sensor_readings') AS reading
      WHERE
        reading->'temperature' IS NOT NULL
    ) t;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
