-- Add public_id column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS public_id UUID DEFAULT uuid_generate_v4();

-- Create an index on public_id for faster lookups
CREATE INDEX IF NOT EXISTS profiles_public_id_idx ON public.profiles(public_id);

-- Update all existing profiles to have a public_id if they don't already
UPDATE public.profiles
SET public_id = uuid_generate_v4()
WHERE public_id IS NULL;

-- Create a policy to allow public access to profiles by public_id
DROP POLICY IF EXISTS "Allow public access to profiles" ON public.profiles;

CREATE POLICY "Allow public access to profiles" 
ON public.profiles
FOR SELECT 
TO anon, authenticated
USING (true);
