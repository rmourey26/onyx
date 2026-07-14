-- Add a public_access column to business_cards table
ALTER TABLE public.business_cards
ADD COLUMN IF NOT EXISTS public_access BOOLEAN DEFAULT true;

-- Add a public_id column for easier sharing
ALTER TABLE public.business_cards
ADD COLUMN IF NOT EXISTS public_id UUID DEFAULT uuid_generate_v4();

-- Create an index on public_id for faster lookups
CREATE INDEX IF NOT EXISTS business_cards_public_id_idx ON public.business_cards(public_id);

-- Create a policy to allow public access to cards with public_access=true
CREATE POLICY "Allow public access to public business cards" 
ON public.business_cards
FOR SELECT 
USING (public_access = true);
