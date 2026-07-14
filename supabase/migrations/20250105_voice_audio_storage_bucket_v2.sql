-- Create storage bucket for voice audio files (Simplified version)
-- This only creates the bucket. RLS policies should be created via Supabase Dashboard or Management API.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'voice-audio',
  'voice-audio',
  false,  -- Private bucket for security
  10485760,  -- 10MB max file size
  ARRAY['audio/wav', 'audio/webm', 'audio/mp3', 'audio/mpeg', 'audio/ogg', 'audio/opus']
)
ON CONFLICT (id) DO NOTHING;

-- Note: RLS policies cannot be created via regular SQL due to permission restrictions.
-- Please create the following policies manually in Supabase Dashboard > Storage > voice-audio > Policies:
--
-- 1. "Users can upload their own voice audio" (INSERT)
--    Target roles: authenticated
--    WITH CHECK: bucket_id = 'voice-audio' AND (storage.foldername(name))[1] = auth.uid()::text
--
-- 2. "Users can read their own voice audio" (SELECT)
--    Target roles: authenticated
--    USING: bucket_id = 'voice-audio' AND (storage.foldername(name))[1] = auth.uid()::text
--
-- 3. "Users can delete their own voice audio" (DELETE)
--    Target roles: authenticated
--    USING: bucket_id = 'voice-audio' AND (storage.foldername(name))[1] = auth.uid()::text
--
-- 4. "Allow public access via signed URLs" (SELECT)
--    Target roles: anon
--    USING: bucket_id = 'voice-audio'
