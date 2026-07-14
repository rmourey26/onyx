import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const SUPABASE_PROJECT_ID = SUPABASE_URL.split("//")[1].split(".")[0]

async function setupVoiceStorage() {
  console.log("[Voice Storage Setup] Starting...")
  console.log("[Voice Storage Setup] Project ID:", SUPABASE_PROJECT_ID)

  // Create service role client
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  try {
    // Step 1: Check if bucket exists
    console.log("[Voice Storage Setup] Checking if voice-audio bucket exists...")
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      console.error("[Voice Storage Setup] Error listing buckets:", listError)
      throw listError
    }

    const bucketExists = buckets?.some((b) => b.id === "voice-audio")

    if (bucketExists) {
      console.log("[Voice Storage Setup] ✓ Bucket already exists")
    } else {
      // Step 2: Create bucket
      console.log("[Voice Storage Setup] Creating voice-audio bucket...")
      const { data: bucket, error: createError } = await supabase.storage.createBucket("voice-audio", {
        public: false,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ["audio/wav", "audio/webm", "audio/mp3", "audio/mpeg", "audio/ogg", "audio/opus"],
      })

      if (createError) {
        console.error("[Voice Storage Setup] Error creating bucket:", createError)
        throw createError
      }

      console.log("[Voice Storage Setup] ✓ Bucket created successfully")
    }

    // Step 3: Test bucket access
    console.log("[Voice Storage Setup] Testing bucket access...")
    const testPath = "test/test.txt"
    const testData = new Blob(["test"], { type: "text/plain" })

    const { error: uploadError } = await supabase.storage
      .from("voice-audio")
      .upload(testPath, testData, { upsert: true })

    if (uploadError) {
      console.error("[Voice Storage Setup] Error testing upload:", uploadError)
      throw uploadError
    }

    // Clean up test file
    await supabase.storage.from("voice-audio").remove([testPath])

    console.log("[Voice Storage Setup] ✓ Bucket access test successful")

    console.log("\n✅ Voice storage setup complete!")
    console.log("\n⚠️  IMPORTANT: You must configure RLS policies manually:")
    console.log("1. Go to Supabase Dashboard > Storage > voice-audio")
    console.log('2. Click "Policies" tab')
    console.log("3. Add the following policies:")
    console.log("   - Allow authenticated users to insert their own files")
    console.log("   - Allow authenticated users to select their own files")
    console.log("   - Allow authenticated users to delete their own files")
    console.log("   - Allow anon users to select (for signed URLs)")
    console.log("\nSee VOICE_AGENT_SETUP.md for detailed policy configuration.")
  } catch (error) {
    console.error("[Voice Storage Setup] Failed:", error)
    process.exit(1)
  }
}

setupVoiceStorage()
