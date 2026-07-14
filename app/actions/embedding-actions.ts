"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"
import { EmbeddingSystem } from "@/lib/embeddings/embedding-system"
import { JobQueue } from "@/lib/background-jobs/job-queue"
import { revalidatePath } from "next/cache"

// Get embeddings settings for a user
export async function getEmbeddingsSettings(userId: string) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("user_settings")
    .select("settings")
    .eq("user_id", userId)
    .eq("settings_type", "embeddings")
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return null
    }
    console.error("Error fetching embeddings settings:", error)
    throw new Error("Failed to fetch embeddings settings")
  }

  return data?.settings
}

// Save embeddings settings for a user
export async function saveEmbeddingsSettings(userId: string, settings: any) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("user_settings")
    .upsert({
      user_id: userId,
      settings_type: "embeddings",
      settings: settings,
    })
    .select()

  if (error) {
    console.error("Error saving embeddings settings:", error)
    throw new Error("Failed to save embeddings settings")
  }

  revalidatePath("/ai-suite/embeddings")
  return data
}

// Get RAG settings for a specific agent
export async function getRagSettings(userId: string, agentId: string) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("ai_agent_settings")
    .select("settings")
    .eq("user_id", userId)
    .eq("agent_id", agentId)
    .eq("settings_type", "rag")
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return null
    }
    console.error("Error fetching RAG settings:", error)
    throw new Error("Failed to fetch RAG settings")
  }

  return data?.settings
}

// Save RAG settings for a specific agent
export async function saveRagSettings(userId: string, agentId: string, settings: any) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("ai_agent_settings")
    .upsert({
      user_id: userId,
      agent_id: agentId,
      settings_type: "rag",
      settings: settings,
    })
    .select()

  if (error) {
    console.error("Error saving RAG settings:", error)
    throw new Error("Failed to save RAG settings")
  }

  revalidatePath("/ai-suite/embeddings")
  return data
}

// Upload file and create embeddings
export async function uploadFileForEmbedding(formData: FormData) {
  const supabase = await createServerSupabaseClient()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseServiceKey) throw new Error("Missing Supabase configuration")

  const files = formData.getAll("files") as File[]
  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const modelId = formData.get("modelId") as string
  const chunkSize = Number.parseInt(formData.get("chunkSize") as string)
  const chunkOverlap = Number.parseInt(formData.get("chunkOverlap") as string)
  const userId = formData.get("userId") as string

  const maxFileSize = 100 * 1024 * 1024 // 100MB
  const oversizedFiles = files.filter((file) => file.size > maxFileSize)
  if (oversizedFiles.length > 0) {
    throw new Error(`Files exceed 100MB limit: ${oversizedFiles.map((f) => f.name).join(", ")}`)
  }

  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
  if (bucketsError) {
    console.error("[v0] Error checking storage buckets:", bucketsError)
  }

  const bucketExists = buckets?.some((bucket) => bucket.id === "embedding_files" || bucket.name === "embedding_files")

  console.log("[v0] Bucket check result:", { bucketExists, bucketsCount: buckets?.length })

  if (!bucketExists) {
    console.log("[v0] embedding_files bucket not found, attempting to create it...")

    const adminClient = createAdminSupabaseClient()
    const { error: createError } = await adminClient.storage.createBucket("embedding_files", {
      public: false,
    })

    if (createError) {
      if (createError.message?.includes("already exists") || createError.message?.includes("Duplicate")) {
        console.log("[v0] Bucket already exists (409 error), continuing with upload...")
      } else {
        console.error("[v0] Error creating embedding_files bucket:", createError)
        throw new Error(
          `Storage bucket 'embedding_files' not found and could not be created automatically. Error: ${createError.message}. Please manually create the bucket in Supabase Dashboard under Storage with the name 'embedding_files'.`,
        )
      }
    } else {
      console.log("[v0] Successfully created embedding_files bucket")
    }
  }

  const { data: jobData, error: jobError } = await supabase
    .from("embedding_jobs")
    .insert({
      job_type: "file_upload",
      status: "processing",
      parameters: { name, description, modelId, chunkSize, chunkOverlap, fileCount: files.length },
      user_id: userId,
    })
    .select()
    .single()
  if (jobError || !jobData) throw new Error("Failed to create embedding job: " + jobError?.message)
  const jobId = jobData.id

  try {
    const { data: modelData, error: modelError } = await supabase
      .from("ai_models")
      .select("*")
      .eq("id", modelId)
      .single()
    if (modelError || !modelData) throw new Error("Failed to fetch embedding model")

    const fileUploadPromises = files.map(async (file) => {
      const fileName = `${userId}/${Date.now()}-${file.name}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("embedding_files")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        })

      if (uploadError) {
        console.error(`Upload error for ${file.name}:`, uploadError)
        throw new Error(`Failed to upload file ${file.name}: ${uploadError.message}`)
      }

      if (!uploadData) {
        throw new Error(`No upload data returned for file ${file.name}`)
      }

      const { data: fileRecord, error: fileError } = await supabase
        .from("embedding_files")
        .insert({
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          file_path: uploadData.path,
          user_id: userId,
        })
        .select()
        .single()
      if (fileError || !fileRecord) throw new Error(`Failed to record file ${file.name}: ${fileError?.message}`)
      return { file, fileRecord }
    })
    const uploadedFilesData = await Promise.all(fileUploadPromises)

    await supabase
      .from("embedding_jobs")
      .update({ file_ids: uploadedFilesData.map((ud) => ud.fileRecord.id) })
      .eq("id", jobId)

    const embeddingSystem = new EmbeddingSystem(supabaseUrl, supabaseServiceKey, modelData.model_id)
    let totalChunksProcessed = 0

    for (const { file } of uploadedFilesData) {
      let fileContent: string
      if (file.size > 10 * 1024 * 1024) {
        const chunks: string[] = []
        const fileChunkSize = 1024 * 1024 // 1MB
        for (let offset = 0; offset < file.size; offset += fileChunkSize) {
          chunks.push(await file.slice(offset, offset + fileChunkSize).text())
        }
        fileContent = chunks.join("")
      } else {
        fileContent = await file.text()
      }
      const documentChunks = await embeddingSystem.processDocumentFile(fileContent, file.name, {
        chunkSize,
        chunkOverlap,
      })
      await embeddingSystem.createEmbeddings(documentChunks, userId, name, description)
      totalChunksProcessed += documentChunks.length
    }

    await supabase
      .from("embedding_jobs")
      .update({
        status: "completed",
        result: {
          message: "Successfully processed files and created embeddings",
          fileCount: files.length,
          chunkCount: totalChunksProcessed,
        },
      })
      .eq("id", jobId)
  } catch (error: any) {
    console.error("Error processing files for embedding:", error)
    await supabase.from("embedding_jobs").update({ status: "failed", error: error.message }).eq("id", jobId)
    throw new Error(error.message || "An error occurred during file processing for embeddings.")
  }
  revalidatePath("/ai-suite/embeddings")
  return { success: true }
}

// Create embeddings from text
export async function createEmbeddingFromText(data: {
  name: string
  description: string
  modelId: string
  chunkSize: number
  chunkOverlap: number
  textContent: string
  userId: string
}) {
  const supabase = createServerSupabaseClient()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseServiceKey) throw new Error("Missing Supabase configuration")

  const { data: jobData, error: jobError } = await supabase
    .from("embedding_jobs")
    .insert({
      job_type: "text_input",
      status: "processing",
      parameters: {
        name: data.name,
        description: data.description,
        modelId: data.modelId,
        chunkSize: data.chunkSize,
        chunkOverlap: data.chunkOverlap,
        textLength: data.textContent.length,
      },
      user_id: data.userId,
    })
    .select()
    .single()
  if (jobError || !jobData) throw new Error("Failed to create embedding job: " + jobError?.message)
  const jobId = jobData.id

  try {
    const { data: modelData, error: modelError } = await supabase
      .from("ai_models")
      .select("*")
      .eq("id", data.modelId)
      .single()
    if (modelError || !modelData) throw new Error("Failed to fetch embedding model")

    const embeddingSystem = new EmbeddingSystem(supabaseUrl, supabaseServiceKey, modelData.model_id)
    const chunks = await embeddingSystem.processDocumentFile(data.textContent, "text-input.txt", {
      chunkSize: data.chunkSize,
      chunkOverlap: data.chunkOverlap,
    })
    await embeddingSystem.createEmbeddings(chunks, data.userId, data.name, data.description)

    await supabase
      .from("embedding_jobs")
      .update({
        status: "completed",
        result: { message: "Successfully processed text and created embeddings", chunkCount: chunks.length },
      })
      .eq("id", jobId)
  } catch (error: any) {
    console.error("Error processing text for embedding:", error)
    await supabase.from("embedding_jobs").update({ status: "failed", error: error.message }).eq("id", jobId)
    throw new Error(error.message || "An error occurred during text processing for embeddings.")
  }
  revalidatePath("/ai-suite/embeddings")
  return { success: true }
}

// Create embeddings from database - Now with robust background processing
export async function createEmbeddingsFromDatabase(data: {
  userId: string
  name: string
  description?: string
  modelId: string
  chunkSize: number
  chunkOverlap: number
  connectionId: string
  query: string
}): Promise<{ success: boolean; error?: string; jobId?: string }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return { success: false, error: "Missing Supabase configuration" }
  }

  try {
    // Initialize job queue
    const jobQueue = new JobQueue(supabaseUrl, supabaseServiceKey)

    // Create background job
    const jobId = await jobQueue.createJob(
      "database_import",
      {
        name: data.name,
        description: data.description,
        modelId: data.modelId,
        chunkSize: data.chunkSize,
        chunkOverlap: data.chunkOverlap,
        connectionId: data.connectionId,
        query: data.query,
      },
      data.userId,
    )

    // Trigger background processing
    await jobQueue.triggerProcessing(jobId)

    revalidatePath("/ai-suite/embeddings")
    return { success: true, jobId }
  } catch (error: any) {
    console.error("Error creating database embedding job:", error)
    return { success: false, error: error.message || "Failed to create database embedding job" }
  }
}

// Get job status
export async function getJobStatus(jobId: string, userId: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase configuration")
  }

  const jobQueue = new JobQueue(supabaseUrl, supabaseServiceKey)
  return await jobQueue.getJobStatus(jobId, userId)
}

// Cancel job
export async function cancelJob(jobId: string, userId: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase configuration")
  }

  const jobQueue = new JobQueue(supabaseUrl, supabaseServiceKey)
  await jobQueue.cancelJob(jobId, userId)

  revalidatePath("/ai-suite/embeddings")
  return { success: true }
}

// Retry job
export async function retryJob(jobId: string, userId: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase configuration")
  }

  const jobQueue = new JobQueue(supabaseUrl, supabaseServiceKey)
  await jobQueue.retryJob(jobId, userId)

  revalidatePath("/ai-suite/embeddings")
  return { success: true }
}

// Update an embedding
export async function updateEmbedding(embeddingId: string, userId: string, updates: any) {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from("data_embeddings")
    .update(updates)
    .eq("id", embeddingId)
    .eq("user_id", userId)
    .select()
  if (error) {
    console.error("Error updating embedding:", error)
    throw new Error("Failed to update embedding")
  }
  revalidatePath("/ai-suite/embeddings")
  return data
}

// Delete an embedding
export async function deleteEmbedding(embeddingId: string, userId: string) {
  const supabase = createServerSupabaseClient()
  const { data: files, error: filesError } = await supabase
    .from("embedding_files")
    .select("id, file_path")
    .eq("embedding_id", embeddingId)
  if (filesError) console.error("Error fetching embedding files:", filesError)
  else if (files && files.length > 0) {
    await supabase.storage.from("embedding_files").remove(files.map((f) => f.file_path))
    await supabase
      .from("embedding_files")
      .delete()
      .in(
        "id",
        files.map((f) => f.id),
      )
  }
  const { error } = await supabase.from("data_embeddings").delete().eq("id", embeddingId).eq("user_id", userId)
  if (error) {
    console.error("Error deleting embedding:", error)
    throw new Error("Failed to delete embedding")
  }
  revalidatePath("/ai-suite/embeddings")
  return { success: true }
}
