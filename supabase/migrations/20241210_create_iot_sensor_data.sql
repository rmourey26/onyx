-- Create iot_sensor_data table for storing sensor readings
CREATE TABLE IF NOT EXISTS public.iot_sensor_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  iot_sensor_id text NOT NULL REFERENCES public.iot_sensors(sensor_id) ON DELETE CASCADE,
  temperature numeric,
  humidity numeric,
  battery_level numeric CHECK (battery_level >= 0 AND battery_level <= 100),
  timestamp timestamptz DEFAULT now() NOT NULL,
  location jsonb DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_iot_sensor_data_sensor_id ON public.iot_sensor_data(iot_sensor_id);
CREATE INDEX IF NOT EXISTS idx_iot_sensor_data_timestamp ON public.iot_sensor_data(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_iot_sensor_data_sensor_timestamp ON public.iot_sensor_data(iot_sensor_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_iot_sensor_data_created_at ON public.iot_sensor_data(created_at DESC);

-- Enable RLS
ALTER TABLE public.iot_sensor_data ENABLE ROW LEVEL SECURITY;

-- RLS policies: Users can view sensor data for their assets
CREATE POLICY "Users can view their IoT sensor data" ON public.iot_sensor_data
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.assets
      WHERE assets.iot_sensor_id = iot_sensor_data.iot_sensor_id
      AND assets.user_id = auth.uid()
    )
  );

-- Service role can manage all sensor data
CREATE POLICY "Service role can manage IoT sensor data" ON public.iot_sensor_data
  FOR ALL
  USING (auth.role() = 'service_role');

-- Add comments
COMMENT ON TABLE public.iot_sensor_data IS 'Time-series data from IoT sensors attached to assets';
COMMENT ON COLUMN public.iot_sensor_data.iot_sensor_id IS 'Reference to the IoT sensor device';
COMMENT ON COLUMN public.iot_sensor_data.temperature IS 'Temperature reading in Celsius';
COMMENT ON COLUMN public.iot_sensor_data.humidity IS 'Humidity reading in percentage';
COMMENT ON COLUMN public.iot_sensor_data.battery_level IS 'Battery level in percentage';
COMMENT ON COLUMN public.iot_sensor_data.timestamp IS 'Time when the reading was taken';
COMMENT ON COLUMN public.iot_sensor_data.location IS 'GPS or location data from the sensor';
COMMENT ON COLUMN public.iot_sensor_data.metadata IS 'Additional sensor metadata and quality information';
