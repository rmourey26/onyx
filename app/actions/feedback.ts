"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

type FeedbackReport = {
  type: "feedback" | "bug" | "feature_request"
  title: string
  description: string
  priority?: "low" | "medium" | "high" | "critical"
  tags?: string[]
  pageUrl?: string
  userAgent?: string
  browserInfo?: Record<string, any>
}

function validateFeedback(data: FeedbackReport): { valid: boolean; error?: string } {
  if (!data.type || !["feedback", "bug", "feature_request"].includes(data.type)) {
    return { valid: false, error: "Invalid feedback type" }
  }
  if (!data.title || data.title.length < 5) {
    return { valid: false, error: "Title must be at least 5 characters" }
  }
  if (data.title.length > 255) {
    return { valid: false, error: "Title must be less than 255 characters" }
  }
  if (!data.description || data.description.length < 10) {
    return { valid: false, error: "Description must be at least 10 characters" }
  }
  if (data.description.length > 2000) {
    return { valid: false, error: "Description must be less than 2000 characters" }
  }
  if (data.priority && !["low", "medium", "high", "critical"].includes(data.priority)) {
    return { valid: false, error: "Invalid priority level" }
  }
  return { valid: true }
}

export async function submitFeedback(data: FeedbackReport) {
  try {
    console.log("[v0] submitFeedback called with data:", JSON.stringify(data))

    const supabase = await createServerSupabaseClient()

    console.log("[v0] Validating feedback data...")
    const validation = validateFeedback(data)
    if (!validation.valid) {
      console.error("[v0] Validation failed:", validation.error)
      return { success: false, error: validation.error }
    }
    console.log("[v0] Validation successful")

    // Get current user (optional for feedback)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    console.log("[v0] Inserting feedback into database...")

    // Insert feedback report
    const { data: report, error } = await supabase
      .from("feedback_reports")
      .insert({
        user_id: user?.id || null,
        type: data.type,
        title: data.title,
        description: data.description,
        priority: data.priority || "medium",
        tags: data.tags || [],
        page_url: data.pageUrl,
        user_agent: data.userAgent,
        browser_info: data.browserInfo,
        status: "open",
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Database error:", error)
      return { success: false, error: error.message || "Failed to submit feedback" }
    }

    console.log("[v0] Feedback inserted successfully:", report)

    // Revalidate relevant paths
    revalidatePath("/admin/feedback")

    return { success: true, data: report }
  } catch (error) {
    console.error("[v0] Error in submitFeedback:", error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Invalid feedback data" }
  }
}

export async function getFeedbackReports() {
  try {
    const supabase = await createServerSupabaseClient()

    const { data: reports, error } = await supabase
      .from("feedback_reports")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching feedback reports:", error)
      return { success: false, error: "Failed to fetch feedback reports" }
    }

    return { success: true, data: reports }
  } catch (error) {
    console.error("Error in getFeedbackReports:", error)
    return { success: false, error: "Failed to fetch feedback reports" }
  }
}

export async function updateFeedbackStatus(id: string, status: "open" | "in_progress" | "resolved" | "closed") {
  try {
    const supabase = await createServerSupabaseClient()

    const { data: report, error } = await supabase
      .from("feedback_reports")
      .update({ status })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating feedback status:", error)
      return { success: false, error: "Failed to update feedback status" }
    }

    revalidatePath("/admin/feedback")

    return { success: true, data: report }
  } catch (error) {
    console.error("Error in updateFeedbackStatus:", error)
    return { success: false, error: "Failed to update feedback status" }
  }
}
