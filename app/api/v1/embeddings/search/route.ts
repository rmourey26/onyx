/**
 * Kronova v1 Semantic Search API
 * Vector similarity search across embeddings
 */

import type { NextRequest } from "next/server"
import { validateAPIAuth, apiError, apiSuccess } from "@/lib/auth/api-auth"
import { EmbeddingSystem } from "@/lib/embeddings/embedding-system"

export async function POST(request: NextRequest) {
  try {
    const auth = await validateAPIAuth(request, ["read:embeddings"])

    if (!auth.authenticated) {
      return apiError(auth.error || "Authentication failed", auth.status || 401)
    }

    const body = await request.json()
    const { query, limit = 10, threshold = 0.7, datasetIds = [], modelId = "text-embedding-3-small" } = body

    if (!query) {
      return apiError("Missing required field: query", 400)
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return apiError("Server configuration error", 500)
    }

    const embeddingSystem = new EmbeddingSystem(supabaseUrl, supabaseServiceKey, modelId)

    const results = await embeddingSystem.searchSimilar(
      query,
      auth.userId!,
      Math.min(limit, 50),
      threshold,
      datasetIds.length > 0 ? datasetIds : undefined,
    )

    return apiSuccess({
      query,
      results,
      count: results.length,
      threshold,
    })
  } catch (error) {
    console.error("[Embedding Search API] Error:", error)
    return apiError("Internal server error", 500)
  }
}
