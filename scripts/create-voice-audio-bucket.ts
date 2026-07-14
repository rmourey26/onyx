/**
 * Script to create the voice-audio storage bucket in Supabase
 * Run this script once to set up the storage bucket for voice agent functionality
 */

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing required environment variables:")
  console.error("- NEXT_PUBLIC_SUPABASE_URL")
  console.error("- SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

async function createVoiceAudioBucket() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  console.log("Creating voice-audio storage bucket...")

  // Create the bucket
  const { data: bucket, error: bucketError } = await supabase.storage.createBucket("voice-audio", {
    public: false,
    fileSizeLimit: 10485760, // 10MB
    allowedMimeTypes: ["audio/wav", "audio/webm", "audio/mp3", "audio/mpeg", "audio/ogg", "audio/opus"],
  })

  if (bucketError) {
    if (bucketError.message.includes("already exists")) {
      console.log("✓ Bucket already exists")
    } else {
      console.error("✗ Failed to create bucket:", bucketError)
      process.exit(1)
    }
  } else {
    console.log("✓ Bucket created successfully:", bucket)
  }

  console.log("\n⚠️  Important: You need to manually set up RLS policies in the Supabase dashboard:")
  console.log("\n1. Go to Storage → voice-audio → Policies")
  console.log("2. Add these policies:\n")
  console.log('Policy 1: "Users can upload their own voice audio"')
  console.log("   - Operation: INSERT")
  console.log("   - Target roles: authenticated")
  console.log("   - WITH CHECK: bucket_id = 'voice-audio' AND (storage.foldername(name))[1] = auth.uid()::text\n")
  console.log('Policy 2: "Users can read their own voice audio"')
  console.log("   - Operation: SELECT")
  console.log("   - Target roles: authenticated")
  console.log("   - USING: bucket_id = 'voice-audio' AND (storage.foldername(name))[1] = auth.uid()::text\n")
  console.log('Policy 3: "Users can delete their own voice audio"')
  console.log("   - Operation: DELETE")
  console.log("   - Target roles: authenticated")
  console.log("   - USING: bucket_id = 'voice-audio' AND (storage.foldername(name))[1] = auth.uid()::text\n")
  console.log('Policy 4: "Allow public access to voice audio via signed URLs"')
  console.log("   - Operation: SELECT")
  console.log("   - Target roles: anon")
  console.log("   - USING: bucket_id = 'voice-audio'\n")
  console.log("\nOr run the SQL migration: supabase/migrations/20250105_voice_audio_storage_bucket.sql")
}

createVoiceAudioBucket()
  .then(() => {
    console.log("\n✓ Setup complete!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("\n✗ Setup failed:", error)
    process.exit(1)
  })
