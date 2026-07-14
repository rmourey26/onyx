-- Add public_id column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS public_id UUID DEFAULT gen_random_uuid();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS public_access BOOLEAN DEFAULT true;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS profiles_public_id_idx ON profiles(public_id);

-- Add RLS policies for public access
CREATE POLICY "Allow public read access to profiles with public_id" 
ON profiles FOR SELECT 
USING (public_access = true);
