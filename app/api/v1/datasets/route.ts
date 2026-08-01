/**
 * Kronova v1 Datasets API
 * Manage embedding datasets for RAG applications
 */

import type { NextRequest } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { validateAPIAuth, apiError, apiSuccess } from "@/lib/auth/api-auth"

export async function GET(request: NextRequest) {
  try {
    const auth = await validateAPIAuth(request, ["read:datasets"])

    if (!auth.authenticated) {
      return apiError(auth.error || "Authentication failed", auth.status || 401)
    }

    const supabase = await createServerSupabaseClient()
    const { searchParams } = new URL(request.url)

    const limit = Math.min(Number.parseInt(searchParams.get("limit") || "50"), 100)
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const { data, error, count } = await supabase
      .from("embedding_datasets")
      .select("*", { count: "exact" })
      .eq("user_id", auth.userId!)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return apiError("Failed to fetch datasets", 500)
    }

    return apiSuccess({
      datasets: data || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    })
  } catch (error) {
    console.error("[Datasets API] Error:", error)
    return apiError("Internal server error", 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await validateAPIAuth(request, ["write:datasets"])

    if (!auth.authenticated) {
      return apiError(auth.error || "Authentication failed", auth.status || 401)
    }

    const body = await request.json()
    const { name, description, metadata = {} } = body

    if (!name) {
      return apiError("Missing required field: name", 400)
    }

    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from("embedding_datasets")
      .insert({
        name,
        description,
        user_id: auth.userId,
        metadata,
        embedding_count: 0,
      })
      .select()
      .single()

    if (error) {
      return apiError("Failed to create dataset", 500)
    }

    return apiSuccess(data, 201)
  } catch (error) {
    console.error("[Datasets API] Error:", error)
    return apiError("Internal server error", 500)
  }
}
