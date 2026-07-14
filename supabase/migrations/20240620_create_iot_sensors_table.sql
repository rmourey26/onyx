-- Create IoT sensors table for tracking package sensors
CREATE TABLE IF NOT EXISTS public.iot_sensors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sensor_id text UNIQUE NOT NULL,
  device_type text NOT NULL CHECK (device_type IN ('temperature_humidity', 'gps_tracker', 'shock_detector', 'multi_sensor')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance', 'low_battery', 'error')),
  battery_level integer DEFAULT 100 CHECK (battery_level >= 0 AND battery_level <= 100),
  last_reading timestamptz DEFAULT now(),
  location_data jsonb DEFAULT '[]'::jsonb,
  sensor_readings jsonb DEFAULT '[]'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_iot_sensors_sensor_id ON public.iot_sensors(sensor_id);
CREATE INDEX IF NOT EXISTS idx_iot_sensors_status ON public.iot_sensors(status);
CREATE INDEX IF NOT EXISTS idx_iot_sensors_device_type ON public.iot_sensors(device_type);
CREATE INDEX IF NOT EXISTS idx_iot_sensors_battery_level ON public.iot_sensors(battery_level);
CREATE INDEX IF NOT EXISTS idx_iot_sensors_last_reading ON public.iot_sensors(last_reading);

-- Add RLS policies
ALTER TABLE public.iot_sensors ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to read all sensors
CREATE POLICY "Users can view IoT sensors" ON public.iot_sensors
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy for service role to manage sensors
CREATE POLICY "Service role can manage IoT sensors" ON public.iot_sensors
  FOR ALL USING (auth.role() = 'service_role');

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_iot_sensors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_iot_sensors_updated_at
  BEFORE UPDATE ON public.iot_sensors
  FOR EACH ROW
  EXECUTE FUNCTION update_iot_sensors_updated_at();

-- Add QR code column to reusable_packages if it doesn't exist
ALTER TABLE public.reusable_packages 
ADD COLUMN IF NOT EXISTS qr_code text UNIQUE;

-- Add category column to reusable_packages if it doesn't exist
ALTER TABLE public.reusable_packages 
ADD COLUMN IF NOT EXISTS category text DEFAULT 'box' 
CHECK (category IN ('box', 'container', 'tote', 'bag', 'crate', 'envelope'));

-- Add sustainability_score column to reusable_packages if it doesn't exist
ALTER TABLE public.reusable_packages 
ADD COLUMN IF NOT EXISTS sustainability_score integer DEFAULT 85 
CHECK (sustainability_score >= 0 AND sustainability_score <= 100);

-- Create index on QR code for fast lookups
CREATE INDEX IF NOT EXISTS idx_reusable_packages_qr_code ON public.reusable_packages(qr_code);

-- Create a view for package analytics with IoT data
CREATE OR REPLACE VIEW public.package_iot_analytics AS
SELECT 
  rp.id,
  rp.package_id,
  rp.name,
  rp.qr_code,
  rp.category,
  rp.status,
  rp.reuse_count,
  rp.sustainability_score,
  rp.iot_sensor_id,
  iot.sensor_id,
  iot.device_type,
  iot.status as sensor_status,
  iot.battery_level,
  iot.last_reading,
  CASE 
    WHEN iot.battery_level < 20 THEN 'low'
    WHEN iot.battery_level < 50 THEN 'medium'
    ELSE 'high'
  END as battery_status,
  CASE 
    WHEN rp.reuse_count > 100 THEN 'high_usage'
    WHEN rp.reuse_count > 50 THEN 'medium_usage'
    ELSE 'low_usage'
  END as usage_category
FROM public.reusable_packages rp
LEFT JOIN public.iot_sensors iot ON rp.iot_sensor_id = iot.sensor_id;

-- Grant permissions on the view
GRANT SELECT ON public.package_iot_analytics TO authenticated;
GRANT ALL ON public.package_iot_analytics TO service_role;

-- Create function to generate QR codes
CREATE OR REPLACE FUNCTION generate_qr_code()
RETURNS text AS $$
DECLARE
  prefix text := 'RSP';
  timestamp_part text;
  random_part text;
BEGIN
  -- Generate timestamp part (base36 of current timestamp)
  timestamp_part := upper(encode(int8send(extract(epoch from now())::bigint), 'base64'));
  timestamp_part := regexp_replace(timestamp_part, '[^A-Z0-9]', '', 'g');
  timestamp_part := substr(timestamp_part, 1, 6);
  
  -- Generate random part
  random_part := upper(substr(md5(random()::text), 1, 6));
  
  RETURN prefix || '-' || timestamp_part || '-' || random_part;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate QR codes for new packages
CREATE OR REPLACE FUNCTION auto_generate_qr_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.qr_code IS NULL THEN
    NEW.qr_code := generate_qr_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_generate_qr_code_trigger
  BEFORE INSERT ON public.reusable_packages
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_qr_code();

-- Add comment to document the table
COMMENT ON TABLE public.iot_sensors IS 'IoT sensors attached to reusable packages for tracking location, condition, and usage';
COMMENT ON COLUMN public.iot_sensors.sensor_id IS 'Unique identifier for the physical sensor device';
COMMENT ON COLUMN public.iot_sensors.location_data IS 'Array of location tracking points with timestamps';
COMMENT ON COLUMN public.iot_sensors.sensor_readings IS 'Array of sensor readings (temperature, humidity, shock, etc.)';
COMMENT ON COLUMN public.reusable_packages.qr_code IS 'Unique QR code identifier for package scanning and tracking';
