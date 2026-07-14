-- Create storage bucket for NFT assets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('nft-assets', 'nft-assets', true, 10485760, ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'application/octet-stream', 'application/json']::text[])
ON CONFLICT (id) DO UPDATE
SET 
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'application/octet-stream', 'application/json']::text[];

-- Set up storage policies for public read access
INSERT INTO storage.policies (name, definition, bucket_id)
VALUES 
  ('NFT Assets Public', '(bucket_id = ''nft-assets''::text)', 'nft-assets')
ON CONFLICT (name, definition, bucket_id) DO NOTHING;
