"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"

// This function should be run once to set up the storage buckets
export async function configureStorageBuckets() {
  const supabase = await createServerSupabaseClient()

  // Configure avatars bucket
  try {
    // Check if bucket exists
    const { data: avatarsBucket, error: avatarsCheckError } = await supabase.storage.getBucket("avatars")

    if (avatarsCheckError && avatarsCheckError.message.includes("does not exist")) {
      // Create bucket if it doesn't exist
      const { error: createError } = await supabase.storage.createBucket("avatars", {
        public: true,
        fileSizeLimit: 5 * 1024 * 1024, // 5MB
        allowedMimeTypes: ["image/png", "image/jpeg", "image/gif", "image/webp"],
      })

      if (createError) throw createError

      // Set bucket to public
      const { error: updateError } = await supabase.storage.updateBucket("avatars", {
        public: true,
      })

      if (updateError) throw updateError
    } else if (avatarsBucket) {
      // Update existing bucket to ensure it's public
      const { error: updateError } = await supabase.storage.updateBucket("avatars", {
        public: true,
      })

      if (updateError) throw updateError
    }

    // Configure company-logos bucket
    const { data: logosBucket, error: logosCheckError } = await supabase.storage.getBucket("company-logos")

    if (logosCheckError && logosCheckError.message.includes("does not exist")) {
      // Create bucket if it doesn't exist
      const { error: createError } = await supabase.storage.createBucket("company-logos", {
        public: true,
        fileSizeLimit: 5 * 1024 * 1024, // 5MB
        allowedMimeTypes: ["image/png", "image/jpeg", "image/gif", "image/webp", "image/svg+xml"],
      })

      if (createError) throw createError

      // Set bucket to public
      const { error: updateError } = await supabase.storage.updateBucket("company-logos", {
        public: true,
      })

      if (updateError) throw updateError
    } else if (logosBucket) {
      // Update existing bucket to ensure it's public
      const { error: updateError } = await supabase.storage.updateBucket("company-logos", {
        public: true,
      })

      if (updateError) throw updateError
    }

    const { data: embeddingsBucket, error: embeddingsCheckError } = await supabase.storage.getBucket("embedding_files")

    if (embeddingsCheckError && embeddingsCheckError.message.includes("does not exist")) {
      // Create bucket if it doesn't exist
      const { error: createError } = await supabase.storage.createBucket("embedding_files", {
        public: false, // Private bucket for user embeddings
        fileSizeLimit: 100 * 1024 * 1024, // 100MB
        allowedMimeTypes: [
          "text/plain",
          "text/csv",
          "text/markdown",
          "application/pdf",
          "application/json",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ],
      })

      if (createError) throw createError
    } else if (embeddingsBucket) {
      // Update existing bucket to ensure correct settings
      const { error: updateError } = await supabase.storage.updateBucket("embedding_files", {
        public: false,
      })

      if (updateError) throw updateError
    }

    return { success: true }
  } catch (error) {
    console.error("Error configuring storage buckets:", error)
    return { success: false, error }
  }
}
