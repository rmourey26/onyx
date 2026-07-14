-- Create storage bucket for embedding files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'embedding_files',
  'embedding_files',
  false,
  104857600, -- 100MB limit
  ARRAY[
    'text/plain',
    'text/markdown',
    'text/csv',
    'application/pdf',
    'application/json',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for embedding_files bucket
-- Allow users to upload files to their own folder
CREATE POLICY "Users can upload files to their own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'embedding_files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to read their own files
CREATE POLICY "Users can read their own files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'embedding_files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own files
CREATE POLICY "Users can update their own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'embedding_files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'embedding_files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create embedding_files table if it doesn't exist
CREATE TABLE IF NOT EXISTS embedding_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  file_path TEXT NOT NULL,
  embedding_id UUID REFERENCES data_embeddings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_embedding_files_user_id ON embedding_files(user_id);
CREATE INDEX IF NOT EXISTS idx_embedding_files_embedding_id ON embedding_files(embedding_id);

-- Enable RLS on embedding_files table
ALTER TABLE embedding_files ENABLE ROW LEVEL SECURITY;

-- RLS policies for embedding_files table
CREATE POLICY "Users can view their own embedding files"
ON embedding_files FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own embedding files"
ON embedding_files FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own embedding files"
ON embedding_files FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own embedding files"
ON embedding_files FOR DELETE
TO authenticated
USING (user_id = auth.uid());
