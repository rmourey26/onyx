-- Alter the package_ids column to JSONB type if it's not already
DO $$
BEGIN
  -- Check if the column exists and is not already JSONB
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'shipping' 
    AND column_name = 'package_ids'
    AND data_type != 'jsonb'
  ) THEN
    -- Alter the column type to JSONB
    ALTER TABLE public.shipping 
    ALTER COLUMN package_ids TYPE JSONB USING 
      CASE 
        WHEN package_ids IS NULL THEN '[]'::jsonb
        WHEN package_ids::text = '{}' THEN '[]'::jsonb
        ELSE to_jsonb(package_ids)
      END;
      
    -- Add comment explaining the column
    COMMENT ON COLUMN public.shipping.package_ids IS 
    'JSONB array of package IDs associated with this shipment';
  END IF;
END $$;
