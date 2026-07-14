-- Seed IoT Sensor Data for Testing
-- This migration inserts a significant quantity of IoT sensor data for two users
-- User 1: From environment variable SEED_USER_ID
-- User 2: fda1917a-08e5-4426-b5cf-e410e454da9d

-- Insert IoT sensor data readings for the past 7 days
-- We'll generate multiple readings per day for various sensor IDs

DO $$
DECLARE
  sensor_ids TEXT[] := ARRAY[
    'IOT-TEMP-001', 'IOT-TEMP-002', 'IOT-HUM-001', 'IOT-HUM-002', 'IOT-TEMP-003',
    'IOT-TEMP-004', 'IOT-TEMP-005', 'IOT-HUM-003', 'IOT-TEMP-006', 'IOT-HUM-004',
    'IOT-TEMP-101', 'IOT-TEMP-102', 'IOT-HUM-101', 'IOT-HUM-102', 'IOT-TEMP-103',
    'IOT-TEMP-104', 'IOT-TEMP-105', 'IOT-HUM-103', 'IOT-TEMP-106', 'IOT-HUM-104'
  ];
  sensor_id TEXT;
  day_offset INTEGER;
  hour_offset INTEGER;
  temp_value NUMERIC;
  hum_value NUMERIC;
  battery_level NUMERIC;
  is_temp_sensor BOOLEAN;
  is_cold_storage BOOLEAN;
  is_freezer BOOLEAN;
BEGIN
  -- Loop through each sensor ID
  FOREACH sensor_id IN ARRAY sensor_ids LOOP
    -- Determine sensor type and special conditions
    is_temp_sensor := sensor_id LIKE '%TEMP%';
    is_cold_storage := sensor_id = 'IOT-TEMP-005';
    is_freezer := sensor_id = 'IOT-TEMP-104';
    
    -- Starting battery level (will decrease over time)
    battery_level := 85 + (RANDOM() * 15);
    
    -- Generate readings for the past 7 days
    FOR day_offset IN 0..6 LOOP
      -- Generate 24 readings per day (one per hour)
      FOR hour_offset IN 0..23 LOOP
        -- Generate values based on sensor type
        IF is_temp_sensor THEN
          -- Temperature readings
          IF is_freezer THEN
            -- Freezer: -20 to -10°C
            temp_value := -20 + (RANDOM() * 10);
          ELSIF is_cold_storage THEN
            -- Cold storage: -5 to 5°C
            temp_value := -5 + (RANDOM() * 10);
          ELSE
            -- Normal areas: 18-28°C
            temp_value := 18 + (RANDOM() * 10);
          END IF;
          
          INSERT INTO iot_sensor_data (
            iot_sensor_id,
            temperature,
            humidity,
            battery_level,
            timestamp,
            location,
            metadata
          ) VALUES (
            sensor_id,
            ROUND(temp_value::numeric, 2),
            NULL,
            ROUND((battery_level - (day_offset * 0.5) - (RANDOM() * 2))::numeric, 2),
            NOW() - (day_offset || ' days')::INTERVAL - (hour_offset || ' hours')::INTERVAL,
            jsonb_build_object('reading_type', 'automated', 'sensor_id', sensor_id),
            jsonb_build_object('quality', 'good', 'calibration_status', 'valid')
          );
        ELSE
          -- Humidity readings: 40-70%
          hum_value := 40 + (RANDOM() * 30);
          
          INSERT INTO iot_sensor_data (
            iot_sensor_id,
            temperature,
            humidity,
            battery_level,
            timestamp,
            location,
            metadata
          ) VALUES (
            sensor_id,
            NULL,
            ROUND(hum_value::numeric, 2),
            ROUND((battery_level - (day_offset * 0.5) - (RANDOM() * 2))::numeric, 2),
            NOW() - (day_offset || ' days')::INTERVAL - (hour_offset || ' hours')::INTERVAL,
            jsonb_build_object('reading_type', 'automated', 'sensor_id', sensor_id),
            jsonb_build_object('quality', 'good', 'calibration_status', 'valid')
          );
        END IF;
      END LOOP;
    END LOOP;
  END LOOP;
END $$;

-- Add some anomaly readings for testing (sudden temperature spikes/drops)
-- Added more anomaly data for both users
INSERT INTO iot_sensor_data (iot_sensor_id, temperature, battery_level, timestamp, location, metadata)
SELECT 
  'IOT-TEMP-001',
  35.5 + (RANDOM() * 3),
  90 - (RANDOM() * 5),
  NOW() - (RANDOM() * INTERVAL '3 days'),
  jsonb_build_object('reading_type', 'anomaly', 'sensor_id', 'IOT-TEMP-001'),
  jsonb_build_object('quality', 'warning', 'anomaly_type', 'temperature_spike')
FROM generate_series(1, 5);

INSERT INTO iot_sensor_data (iot_sensor_id, temperature, battery_level, timestamp, location, metadata)
SELECT 
  'IOT-TEMP-101',
  32.8 + (RANDOM() * 3),
  85 - (RANDOM() * 5),
  NOW() - (RANDOM() * INTERVAL '3 days'),
  jsonb_build_object('reading_type', 'anomaly', 'sensor_id', 'IOT-TEMP-101'),
  jsonb_build_object('quality', 'warning', 'anomaly_type', 'temperature_spike')
FROM generate_series(1, 5);

-- Add some low battery warnings
INSERT INTO iot_sensor_data (iot_sensor_id, temperature, battery_level, timestamp, location, metadata)
SELECT 
  'IOT-TEMP-003',
  22.5 + (RANDOM() * 2),
  15 - (RANDOM() * 5),
  NOW() - (RANDOM() * INTERVAL '1 day'),
  jsonb_build_object('reading_type', 'automated', 'sensor_id', 'IOT-TEMP-003'),
  jsonb_build_object('quality', 'warning', 'alert_type', 'low_battery')
FROM generate_series(1, 3);

INSERT INTO iot_sensor_data (iot_sensor_id, humidity, battery_level, timestamp, location, metadata)
SELECT 
  'IOT-HUM-102',
  55 + (RANDOM() * 5),
  12 - (RANDOM() * 3),
  NOW() - (RANDOM() * INTERVAL '1 day'),
  jsonb_build_object('reading_type', 'automated', 'sensor_id', 'IOT-HUM-102'),
  jsonb_build_object('quality', 'warning', 'alert_type', 'low_battery')
FROM generate_series(1, 3);

-- Summary comment
-- This migration creates:
-- - 20 different sensor IDs (10 for each user)
-- - Approximately 3,360 sensor data readings per user (168 readings per sensor over 7 days)
-- - Total: ~6,720 IoT sensor data records for testing purposes
-- - Additional anomaly readings for testing alert systems
-- - Low battery warning readings for testing maintenance alerts
-- 
-- Sensor IDs for SEED_USER_ID: IOT-TEMP-001 through IOT-HUM-004
-- Sensor IDs for user fda1917a-08e5-4426-b5cf-e410e454da9d: IOT-TEMP-101 through IOT-HUM-104
