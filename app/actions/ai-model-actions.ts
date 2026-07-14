"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function getActiveAIModels() {
  const supabase = await createServerSupabaseClient()

  try {
    const { data, error } = await supabase
      .from("ai_models")
      .select("*")
      .eq("is_active", true)
      .order("provider", { ascending: true })
      .order("name", { ascending: true })

    if (error) {
      console.error("Error fetching AI models:", error)
      return { success: false, error: error.message, data: [] }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error("Error in getActiveAIModels:", error)
    return { success: false, error: "An unexpected error occurred", data: [] }
  }
}

export async function getAIModelsByType(type: "chat" | "embedding" | "image" | "audio") {
  const supabase = await createServerSupabaseClient()

  try {
    const { data, error } = await supabase
      .from("ai_models")
      .select("*")
      .eq("is_active", true)
      .eq("type", type)
      .order("provider", { ascending: true })
      .order("name", { ascending: true })

    if (error) {
      console.error("Error fetching AI models by type:", error)
      return { success: false, error: error.message, data: [] }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error("Error in getAIModelsByType:", error)
    return { success: false, error: "An unexpected error occurred", data: [] }
  }
}
