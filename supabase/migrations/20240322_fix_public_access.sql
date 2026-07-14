-- Make sure the public_id column exists and is indexed
ALTER TABLE public.business_cards
ADD COLUMN IF NOT EXISTS public_id UUID DEFAULT uuid_generate_v4();

-- Create an index on public_id for faster lookups if it doesn't exist
CREATE INDEX IF NOT EXISTS business_cards_public_id_idx ON public.business_cards(public_id);

-- Make sure public_access column exists with default true
ALTER TABLE public.business_cards
ADD COLUMN IF NOT EXISTS public_access BOOLEAN DEFAULT true;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public access to public business cards" ON public.business_cards;
DROP POLICY IF EXISTS "Allow public access to profiles for public cards" ON public.profiles;

-- Create a policy to allow public access to cards with public_access=true
CREATE POLICY "Allow public access to public business cards" 
ON public.business_cards
FOR SELECT 
USING (public_access = true OR auth.uid() = user_id);

-- Make sure the profiles table is also accessible for public cards
CREATE POLICY "Allow public access to profiles for public cards" 
ON public.profiles
FOR SELECT 
USING (true);

-- Update all existing cards to have a public_id if they don't already
UPDATE public.business_cards
SET public_id = uuid_generate_v4(), public_access = true
WHERE public_id IS NULL;
