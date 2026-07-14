-- Create the storage bucket for embedding files if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'embedding_files',
  'embedding_files',
  true, -- Files are public, but RLS policies will control access
  104857600, -- 100MB file size limit
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/markdown'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist, to ensure a clean setup
DROP POLICY IF EXISTS "Allow authenticated uploads on embedding_files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated reads on own embedding_files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes on own embedding_files" ON storage.objects;

-- Add RLS policies for the embedding_files bucket

-- Allow any authenticated user to upload files.
-- The server-side action will ensure files are stored in user-specific folders.
CREATE POLICY "Allow authenticated uploads on embedding_files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'embedding_files');

-- Allow authenticated users to read their own files.
-- The `owner_id` is automatically set by Supabase to the user's ID on upload.
CREATE POLICY "Allow authenticated reads on own embedding_files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'embedding_files' AND owner_id = auth.uid());

-- Allow authenticated users to delete their own files.
CREATE POLICY "Allow authenticated deletes on own embedding_files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'embedding_files' AND owner_id = auth.uid());
