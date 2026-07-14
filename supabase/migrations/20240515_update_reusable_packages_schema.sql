-- Update the reusable_packages table to ensure package_id references shipments correctly

-- First, check if we need to modify the package_id column
DO $$
BEGIN
  -- Check if the column exists but needs to be modified
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'reusable_packages' 
    AND column_name = 'package_id'
  ) THEN
    -- Ensure the column is NOT NULL and has a proper comment
    ALTER TABLE public.reusable_packages 
    ALTER COLUMN package_id SET NOT NULL,
    ALTER COLUMN package_id SET DATA TYPE text;
    
    COMMENT ON COLUMN public.reusable_packages.package_id IS 'Unique identifier for the package that can be used for tracking and linking to shipments';
  END IF;
  
  -- Add an index on package_id for faster lookups
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE tablename = 'reusable_packages' AND indexname = 'reusable_packages_package_id_idx'
  ) THEN
    CREATE INDEX reusable_packages_package_id_idx ON public.reusable_packages (package_id);
  END IF;
  
  -- Add a shipment_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'reusable_packages' 
    AND column_name = 'current_shipment_id'
  ) THEN
    ALTER TABLE public.reusable_packages 
    ADD COLUMN current_shipment_id uuid REFERENCES public.shipping(id) NULL;
    
    COMMENT ON COLUMN public.reusable_packages.current_shipment_id IS 'Reference to the current shipment using this package, if any';
  END IF;
  
  -- Add a shipment_history column to track all shipments this package has been used in
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'reusable_packages' 
    AND column_name = 'shipment_history'
  ) THEN
    ALTER TABLE public.reusable_packages 
    ADD COLUMN shipment_history uuid[] DEFAULT '{}';
    
    COMMENT ON COLUMN public.reusable_packages.shipment_history IS 'History of all shipment IDs this package has been used in';
  END IF;
END $$;

-- Create a function to update the current_shipment_id and shipment_history when a package is assigned to a shipment
CREATE OR REPLACE FUNCTION update_package_shipment_references()
RETURNS TRIGGER AS $$
BEGIN
  -- For each package ID in the new shipment's package_ids array
  IF NEW.package_ids IS NOT NULL THEN
    FOREACH package_id IN ARRAY NEW.package_ids
    LOOP
      -- Update the package's current_shipment_id
      UPDATE public.reusable_packages
      SET 
        current_shipment_id = NEW.id,
        shipment_history = array_append(COALESCE(shipment_history, '{}'), NEW.id)
      WHERE id = package_id;
    END LOOP;
  END IF;
  
  -- If this is an update and packages were removed
  IF TG_OP = 'UPDATE' AND OLD.package_ids IS NOT NULL THEN
    -- For each package that was in the old record but not in the new one
    FOREACH package_id IN ARRAY OLD.package_ids
    LOOP
      IF NEW.package_ids IS NULL OR NOT (package_id = ANY(NEW.package_ids)) THEN
        -- Clear the current_shipment_id since it's no longer associated
        UPDATE public.reusable_packages
        SET current_shipment_id = NULL
        WHERE id = package_id AND current_shipment_id = OLD.id;
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_package_shipment_references_trigger'
  ) THEN
    CREATE TRIGGER update_package_shipment_references_trigger
    AFTER INSERT OR UPDATE OF package_ids ON public.shipping
    FOR EACH ROW
    EXECUTE FUNCTION update_package_shipment_references();
  END IF;
END $$;

-- Create a view that shows packages with their current shipment details
CREATE OR REPLACE VIEW public.package_shipment_details AS
SELECT 
  rp.id AS package_id,
  rp.package_id AS tracking_code,
  rp.name AS package_name,
  rp.status,
  rp.reuse_count,
  s.id AS shipment_id,
  s.tracking_number,
  s.status AS shipment_status,
  s.carrier,
  s.origin_address,
  s.destination_address,
  s.shipping_date,
  s.estimated_delivery
FROM 
  public.reusable_packages rp
LEFT JOIN 
  public.shipping s ON rp.current_shipment_id = s.id;

-- Grant permissions
ALTER VIEW public.package_shipment_details OWNER TO postgres;
GRANT ALL ON public.package_shipment_details TO postgres;
GRANT SELECT ON public.package_shipment_details TO anon, authenticated, service_role;
