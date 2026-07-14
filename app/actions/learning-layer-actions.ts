"use server"

import { LearningLayerSystem, type LearningDataInput } from "@/lib/ai/learning-layer-system"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function saveToLearningLayer(input: LearningDataInput) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    const learningSystem = new LearningLayerSystem(supabase)
    return await learningSystem.saveToLearningLayer(input, user.id)
  } catch (error: any) {
    console.error("[v0] Error in saveToLearningLayer action:", error)
    return { success: false, error: error.message }
  }
}

export async function searchLearningLayer(
  query: string,
  options: {
    limit?: number
    threshold?: number
    executionType?: "agent" | "workflow"
    assetIds?: string[]
  } = {},
) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    const learningSystem = new LearningLayerSystem(supabase)
    return await learningSystem.searchLearningLayer(query, user.id, options)
  } catch (error: any) {
    console.error("[v0] Error in searchLearningLayer action:", error)
    return { success: false, error: error.message }
  }
}

export async function getLearningStats() {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    const learningSystem = new LearningLayerSystem(supabase)
    return await learningSystem.getLearningStats(user.id)
  } catch (error: any) {
    console.error("[v0] Error in getLearningStats action:", error)
    return { success: false, error: error.message }
  }
}
