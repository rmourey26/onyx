-- Make sure the public_id column exists and is indexed
ALTER TABLE public.business_cards
ADD COLUMN IF NOT EXISTS public_id UUID DEFAULT uuid_generate_v4();

-- Create an index on public_id for faster lookups if it doesn't exist
CREATE INDEX IF NOT EXISTS business_cards_public_id_idx ON public.business_cards(public_id);

-- Make sure public_access column exists with default true
ALTER TABLE public.business_cards
ADD COLUMN IF NOT EXISTS public_access BOOLEAN DEFAULT true;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow public access to public business cards" ON public.business_cards;

-- Create a policy to allow public access to cards with public_access=true
CREATE POLICY "Allow public access to public business cards" 
ON public.business_cards
FOR SELECT 
USING (public_access = true);

-- Make sure the profiles table is also accessible for public cards
DROP POLICY IF EXISTS "Allow public access to profiles for public cards" ON public.profiles;

CREATE POLICY "Allow public access to profiles for public cards" 
ON public.profiles
FOR SELECT 
USING (true);
