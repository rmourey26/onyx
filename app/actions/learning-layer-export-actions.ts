"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"

export interface ExportLearningDataOptions {
  format: "csv" | "json"
  filters?: {
    executionType?: "agent" | "workflow"
    tags?: string[]
    dateRange?: {
      from: string
      to: string
    }
    assetIds?: string[]
  }
  includeVectors?: boolean
}

/**
 * Export learning layer data with filters
 */
export async function exportLearningData(options: ExportLearningDataOptions) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    // Build query with filters
    let query = supabase
      .from("asset_intelligence_learning")
      .select(
        `
        id,
        name,
        description,
        execution_type,
        execution_id,
        execution_name,
        asset_ids,
        asset_context,
        execution_input,
        execution_output,
        execution_metrics,
        success_score,
        quality_rating,
        user_feedback,
        embedding_model,
        ${options.includeVectors ? "vector_data," : ""}
        metadata,
        tags,
        created_at,
        updated_at
      `,
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    // Apply filters
    if (options.filters?.executionType) {
      query = query.eq("execution_type", options.filters.executionType)
    }

    if (options.filters?.tags && options.filters.tags.length > 0) {
      query = query.overlaps("tags", options.filters.tags)
    }

    if (options.filters?.dateRange) {
      query = query.gte("created_at", options.filters.dateRange.from).lte("created_at", options.filters.dateRange.to)
    }

    if (options.filters?.assetIds && options.filters.assetIds.length > 0) {
      query = query.overlaps("asset_ids", options.filters.assetIds)
    }

    const { data, error } = await query

    if (error) {
      console.error("[v0] Error fetching learning data for export:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error("[v0] Error in exportLearningData:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Export data embeddings with filters
 */
export async function exportEmbeddingsData(options: {
  format: "csv" | "json"
  filters?: {
    sourceType?: string
    embeddingModel?: string
    dateRange?: {
      from: string
      to: string
    }
  }
  includeVectors?: boolean
}) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    // Build query with filters
    let query = supabase
      .from("data_embeddings")
      .select(
        `
        id,
        name,
        description,
        source_type,
        source_id,
        embedding_model,
        ${options.includeVectors ? "vector_data," : ""}
        metadata,
        created_at,
        updated_at
      `,
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    // Apply filters
    if (options.filters?.sourceType) {
      query = query.eq("source_type", options.filters.sourceType)
    }

    if (options.filters?.embeddingModel) {
      query = query.eq("embedding_model", options.filters.embeddingModel)
    }

    if (options.filters?.dateRange) {
      query = query.gte("created_at", options.filters.dateRange.from).lte("created_at", options.filters.dateRange.to)
    }

    const { data, error } = await query

    if (error) {
      console.error("[v0] Error fetching embeddings for export:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error("[v0] Error in exportEmbeddingsData:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Get learning layer statistics for export metadata
 */
export async function getLearningExportStats() {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    const { data, error } = await supabase.from("asset_intelligence_learning_stats").select("*").eq("user_id", user.id)

    if (error) {
      console.error("[v0] Error fetching learning stats:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error("[v0] Error in getLearningExportStats:", error)
    return { success: false, error: error.message }
  }
}
