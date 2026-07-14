-- Add nfc_tag_id to reusable_packages
ALTER TABLE public.reusable_packages
ADD COLUMN nfc_tag_id TEXT UNIQUE;

-- Add nfc_tag_id to iot_sensors
ALTER TABLE public.iot_sensors
ADD COLUMN nfc_tag_id TEXT UNIQUE;

-- Create an index for faster lookups on nfc_tag_id
CREATE INDEX IF NOT EXISTS idx_reusable_packages_nfc_tag_id ON public.reusable_packages(nfc_tag_id);
CREATE INDEX IF NOT EXISTS idx_iot_sensors_nfc_tag_id ON public.iot_sensors(nfc_tag_id);

-- Add a column to associate a shipment with its generated label
ALTER TABLE public.shipping
ADD COLUMN label_image_base64 TEXT,
ADD COLUMN carrier_api_response JSONB;

COMMENT ON COLUMN public.reusable_packages.nfc_tag_id IS 'Unique identifier for the embedded NFC tag.';
COMMENT ON COLUMN public.iot_sensors.nfc_tag_id IS 'Unique identifier for the associated NFC tag, if separate from the sensor.';
COMMENT ON COLUMN public.shipping.label_image_base64 IS 'Base64 encoded shipping label image returned from the carrier API.';
COMMENT ON COLUMN public.shipping.carrier_api_response IS 'The full API response from the carrier for debugging and future use.';
