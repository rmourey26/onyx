/**
 * Kronova v1 Embeddings API
 * Enterprise-grade vector embeddings management
 */

import type { NextRequest } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { validateAPIAuth, apiError, apiSuccess } from "@/lib/auth/api-auth"
import { EmbeddingSystem } from "@/lib/embeddings/embedding-system"

export async function GET(request: NextRequest) {
  try {
    const auth = await validateAPIAuth(request, ["read:embeddings"])

    if (!auth.authenticated) {
      return apiError(auth.error || "Authentication failed", auth.status || 401)
    }

    const supabase = await createServerSupabaseClient()
    const { searchParams } = new URL(request.url)

    const limit = Math.min(Number.parseInt(searchParams.get("limit") || "50"), 100)
    const offset = Number.parseInt(searchParams.get("offset") || "0")
    const datasetId = searchParams.get("dataset_id")

    let query = supabase
      .from("data_embeddings")
      .select("id, name, description, source_type, chunk_count, model_id, created_at, metadata", { count: "exact" })
      .eq("user_id", auth.userId!)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (datasetId) {
      query = query.eq("dataset_id", datasetId)
    }

    const { data, error, count } = await query

    if (error) {
      console.error("[Embeddings API] Query error:", error)
      return apiError("Failed to fetch embeddings", 500)
    }

    return apiSuccess({
      embeddings: data || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    })
  } catch (error) {
    console.error("[Embeddings API] Error:", error)
    return apiError("Internal server error", 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await validateAPIAuth(request, ["write:embeddings"])

    if (!auth.authenticated) {
      return apiError(auth.error || "Authentication failed", auth.status || 401)
    }

    const body = await request.json()
    const {
      name,
      description,
      content,
      modelId = "text-embedding-3-small",
      chunkSize = 1000,
      chunkOverlap = 200,
      metadata = {},
    } = body

    if (!name || !content) {
      return apiError("Missing required fields: name, content", 400)
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return apiError("Server configuration error", 500)
    }

    const supabase = await createServerSupabaseClient()

    // Create embedding job
    const { data: job, error: jobError } = await supabase
      .from("embedding_jobs")
      .insert({
        job_type: "api_text_input",
        status: "processing",
        parameters: { name, description, modelId, chunkSize, chunkOverlap, contentLength: content.length },
        user_id: auth.userId,
      })
      .select()
      .single()

    if (jobError) {
      return apiError("Failed to create embedding job", 500)
    }

    // Process embeddings
    try {
      const embeddingSystem = new EmbeddingSystem(supabaseUrl, supabaseServiceKey, modelId)
      const chunks = await embeddingSystem.processDocumentFile(content, "api-input.txt", {
        chunkSize,
        chunkOverlap,
      })

      await embeddingSystem.createEmbeddings(chunks, auth.userId!, name, description)

      // Update job status
      await supabase
        .from("embedding_jobs")
        .update({
          status: "completed",
          result: {
            message: "Successfully created embeddings",
            chunkCount: chunks.length,
          },
        })
        .eq("id", job.id)

      return apiSuccess(
        {
          jobId: job.id,
          status: "completed",
          chunkCount: chunks.length,
          message: "Embeddings created successfully",
        },
        201,
      )
    } catch (processingError: any) {
      await supabase
        .from("embedding_jobs")
        .update({ status: "failed", error: processingError.message })
        .eq("id", job.id)

      return apiError(`Embedding processing failed: ${processingError.message}`, 500)
    }
  } catch (error) {
    console.error("[Embeddings API] Error:", error)
    return apiError("Internal server error", 500)
  }
}
