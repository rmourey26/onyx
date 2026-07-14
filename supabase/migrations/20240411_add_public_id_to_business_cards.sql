-- Add public_id column to business_cards table
ALTER TABLE business_cards ADD COLUMN IF NOT EXISTS public_id UUID DEFAULT gen_random_uuid();

-- Create a unique index on public_id
CREATE UNIQUE INDEX IF NOT EXISTS business_cards_public_id_idx ON business_cards (public_id);

-- Create a trigger to automatically generate a UUID for new business cards
CREATE OR REPLACE FUNCTION set_business_card_public_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.public_id IS NULL THEN
    NEW.public_id := gen_random_uuid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS set_business_card_public_id_trigger ON business_cards;

-- Create the trigger
CREATE TRIGGER set_business_card_public_id_trigger
BEFORE INSERT ON business_cards
FOR EACH ROW
EXECUTE FUNCTION set_business_card_public_id();

-- Update existing records that have NULL public_id
UPDATE business_cards SET public_id = gen_random_uuid() WHERE public_id IS NULL;

-- Make public_id NOT NULL after updating existing records
ALTER TABLE business_cards ALTER COLUMN public_id SET NOT NULL;

-- Create a function to get a business card by public_id
CREATE OR REPLACE FUNCTION get_business_card_by_public_id(p_public_id UUID)
RETURNS SETOF business_cards
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM business_cards WHERE public_id = p_public_id;
$$;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION get_business_card_by_public_id TO authenticated;
GRANT EXECUTE ON FUNCTION get_business_card_by_public_id TO anon;
GRANT EXECUTE ON FUNCTION get_business_card_by_public_id TO service_role;
