-- Create storage bucket for voice audio files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'voice-audio',
  'voice-audio',
  false,  -- Private bucket for security
  10485760,  -- 10MB max file size
  ARRAY['audio/wav', 'audio/webm', 'audio/mp3', 'audio/mpeg', 'audio/ogg', 'audio/opus']
)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for voice-audio bucket
CREATE POLICY "Users can upload their own voice audio"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'voice-audio' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can read their own voice audio"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'voice-audio' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own voice audio"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'voice-audio' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow ElevenLabs to access files via signed URLs (for cloud_storage_url parameter)
CREATE POLICY "Allow public access to voice audio via signed URLs"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id = 'voice-audio');

COMMENT ON POLICY "Allow public access to voice audio via signed URLs" ON storage.objects IS 
'This policy allows ElevenLabs API to access audio files via signed URLs for transcription';
