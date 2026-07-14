-- First, drop the existing trigger and function if they exist
DROP TRIGGER IF EXISTS update_package_shipment_references ON public.shipping;
DROP FUNCTION IF EXISTS public.update_package_shipment_references();

-- Create the updated function that works with JSONB arrays
CREATE OR REPLACE FUNCTION public.update_package_shipment_references()
RETURNS TRIGGER AS $$
DECLARE
  package_id UUID;
  package_ids_array UUID[];
  old_package_ids_array UUID[] DEFAULT '{}';
BEGIN
  -- For INSERT or UPDATE operations
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    -- Convert JSONB array to UUID array for easier processing
    SELECT ARRAY(SELECT jsonb_array_elements_text(NEW.package_ids)::UUID) INTO package_ids_array;
    
    -- If this is an UPDATE, get the old package IDs to handle removed packages
    IF (TG_OP = 'UPDATE' AND OLD.package_ids IS NOT NULL) THEN
      SELECT ARRAY(SELECT jsonb_array_elements_text(OLD.package_ids)::UUID) INTO old_package_ids_array;
    END IF;
    
    -- Update each package in the new array to reference this shipment
    FOREACH package_id IN ARRAY package_ids_array
    LOOP
      UPDATE public.reusable_packages
      SET current_shipment_id = NEW.id
      WHERE id = package_id;
    END LOOP;
    
    -- If this is an UPDATE, handle packages that were removed from the shipment
    IF (TG_OP = 'UPDATE') THEN
      FOREACH package_id IN ARRAY old_package_ids_array
      LOOP
        -- Only update packages that are no longer in the new array
        IF NOT (package_id = ANY(package_ids_array)) THEN
          UPDATE public.reusable_packages
          SET current_shipment_id = NULL
          WHERE id = package_id AND current_shipment_id = OLD.id;
        END IF;
      END LOOP;
    END IF;
    
    RETURN NEW;
  
  -- For DELETE operations
  ELSIF (TG_OP = 'DELETE') THEN
    -- Convert JSONB array to UUID array
    IF (OLD.package_ids IS NOT NULL) THEN
      SELECT ARRAY(SELECT jsonb_array_elements_text(OLD.package_ids)::UUID) INTO old_package_ids_array;
      
      -- Update each package to remove the shipment reference
      FOREACH package_id IN ARRAY old_package_ids_array
      LOOP
        UPDATE public.reusable_packages
        SET current_shipment_id = NULL
        WHERE id = package_id AND current_shipment_id = OLD.id;
      END LOOP;
    END IF;
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create the new trigger
CREATE TRIGGER update_package_shipment_references
AFTER INSERT OR UPDATE OR DELETE ON public.shipping
FOR EACH ROW EXECUTE FUNCTION public.update_package_shipment_references();

-- Add comment explaining the trigger's purpose
COMMENT ON FUNCTION public.update_package_shipment_references() IS 
'Updates the current_shipment_id in reusable_packages when packages are added to or removed from shipments. 
Works with package_ids stored as a JSONB array.';
