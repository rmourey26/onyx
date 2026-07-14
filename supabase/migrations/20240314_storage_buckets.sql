-- Create storage buckets for avatars and company logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp']::text[]),
  ('company-logos', 'company-logos', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml']::text[])
ON CONFLICT (id) DO UPDATE
SET 
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml']::text[];

-- Set up storage policies for public read access
INSERT INTO storage.policies (name, definition, bucket_id)
VALUES 
  ('Avatar Images Public', '(bucket_id = ''avatars''::text)', 'avatars'),
  ('Company Logos Public', '(bucket_id = ''company-logos''::text)', 'company-logos')
ON CONFLICT (name, definition, bucket_id) DO NOTHING;
