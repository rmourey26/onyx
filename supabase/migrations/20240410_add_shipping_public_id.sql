-- Add public_id column to shipping table
ALTER TABLE shipping ADD COLUMN IF NOT EXISTS public_id UUID DEFAULT gen_random_uuid();

-- Create an index on public_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_shipping_public_id ON shipping(public_id);

-- Add RLS policy for public access to shipping information
CREATE POLICY IF NOT EXISTS "Allow public access to shipping by public_id" 
ON shipping FOR SELECT 
TO anon
USING (true);

-- Update existing shipping records to have a public_id if they don't already
UPDATE shipping SET public_id = gen_random_uuid() WHERE public_id IS NULL;
