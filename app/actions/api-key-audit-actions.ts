"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"

export interface APIKeyAuditLog {
  id: string
  api_key_id: string
  user_id: string
  action: string
  ip_address: string | null
  user_agent: string | null
  metadata: Record<string, any>
  created_at: string
}

export async function getAPIKeyAuditLogs(apiKeyId?: string) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Unauthorized" }
    }

    let query = supabase
      .from("api_key_audit_log")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100)

    if (apiKeyId) {
      query = query.eq("api_key_id", apiKeyId)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching audit logs:", error)
      return { error: "Failed to fetch audit logs" }
    }

    return { data }
  } catch (error) {
    console.error("Error in getAPIKeyAuditLogs:", error)
    return { error: "An error occurred while fetching audit logs" }
  }
}

export async function getAPIKeyUsageStats(apiKeyId: string) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Unauthorized" }
    }

    const { data: key, error } = await supabase
      .from("api_keys")
      .select("total_requests, last_request_at, last_used_at, created_at")
      .eq("id", apiKeyId)
      .eq("user_id", user.id)
      .single()

    if (error) {
      console.error("Error fetching usage stats:", error)
      return { error: "Failed to fetch usage statistics" }
    }

    return { data: key }
  } catch (error) {
    console.error("Error in getAPIKeyUsageStats:", error)
    return { error: "An error occurred while fetching usage statistics" }
  }
}
