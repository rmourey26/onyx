/**
 * Kronova v1 Embedding Detail API
 */

import type { NextRequest } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { validateAPIAuth, apiError, apiSuccess } from "@/lib/auth/api-auth"

export async function GET(request: NextRequest, { params }: { params: { embeddingId: string } }) {
  try {
    const auth = await validateAPIAuth(request, ["read:embeddings"])

    if (!auth.authenticated) {
      return apiError(auth.error || "Authentication failed", auth.status || 401)
    }

    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from("data_embeddings")
      .select("*")
      .eq("id", params.embeddingId)
      .eq("user_id", auth.userId!)
      .single()

    if (error || !data) {
      return apiError("Embedding not found", 404)
    }

    return apiSuccess(data)
  } catch (error) {
    console.error("[Embedding Detail API] Error:", error)
    return apiError("Internal server error", 500)
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { embeddingId: string } }) {
  try {
    const auth = await validateAPIAuth(request, ["write:embeddings"])

    if (!auth.authenticated) {
      return apiError(auth.error || "Authentication failed", auth.status || 401)
    }

    const body = await request.json()
    const { name, description, metadata } = body

    const supabase = await createServerSupabaseClient()

    const updates: any = {}
    if (name !== undefined) updates.name = name
    if (description !== undefined) updates.description = description
    if (metadata !== undefined) updates.metadata = metadata

    const { data, error } = await supabase
      .from("data_embeddings")
      .update(updates)
      .eq("id", params.embeddingId)
      .eq("user_id", auth.userId!)
      .select()
      .single()

    if (error || !data) {
      return apiError("Failed to update embedding", error ? 500 : 404)
    }

    return apiSuccess(data)
  } catch (error) {
    console.error("[Embedding Detail API] Error:", error)
    return apiError("Internal server error", 500)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { embeddingId: string } }) {
  try {
    const auth = await validateAPIAuth(request, ["delete:embeddings"])

    if (!auth.authenticated) {
      return apiError(auth.error || "Authentication failed", auth.status || 401)
    }

    const supabase = await createServerSupabaseClient()

    // Delete associated files
    const { data: files } = await supabase
      .from("embedding_files")
      .select("file_path")
      .eq("embedding_id", params.embeddingId)

    if (files && files.length > 0) {
      await supabase.storage.from("embedding_files").remove(files.map((f) => f.file_path))

      await supabase.from("embedding_files").delete().eq("embedding_id", params.embeddingId)
    }

    const { error } = await supabase
      .from("data_embeddings")
      .delete()
      .eq("id", params.embeddingId)
      .eq("user_id", auth.userId!)

    if (error) {
      return apiError("Failed to delete embedding", 500)
    }

    return apiSuccess({ message: "Embedding deleted successfully" })
  } catch (error) {
    console.error("[Embedding Detail API] Error:", error)
    return apiError("Internal server error", 500)
  }
}
