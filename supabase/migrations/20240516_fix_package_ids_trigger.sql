-- Fix the trigger function to handle cases where package_ids might not exist
CREATE OR REPLACE FUNCTION update_package_shipment_references()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if NEW record has package_ids field and it's not null
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Check if the package_ids column exists and is not null
    IF NEW IS NOT NULL AND 
       EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' 
               AND table_name = 'shipping' 
               AND column_name = 'package_ids') AND
       NEW.package_ids IS NOT NULL THEN
      
      -- For each package ID in the new shipment's package_ids array
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
  END IF;
  
  -- If this is an update and packages were removed
  IF TG_OP = 'UPDATE' AND 
     EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_schema = 'public' 
             AND table_name = 'shipping' 
             AND column_name = 'package_ids') AND
     OLD.package_ids IS NOT NULL THEN
    
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
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error and continue
    RAISE NOTICE 'Error in update_package_shipment_references: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Make sure the trigger exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_package_shipment_references_trigger'
  ) THEN
    CREATE TRIGGER update_package_shipment_references_trigger
    AFTER INSERT OR UPDATE ON public.shipping
    FOR EACH ROW
    EXECUTE FUNCTION update_package_shipment_references();
  END IF;
END $$;
