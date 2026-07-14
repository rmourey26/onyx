"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface Webhook {
  id: string
  user_id: string
  name: string
  url: string
  description: string | null
  events: string[]
  secret: string
  is_active: boolean
  last_triggered_at: string | null
  last_status: string | null
  failure_count: number
  created_at: string
  updated_at: string
}

export interface WebhookLog {
  id: string
  webhook_id: string
  event_type: string
  payload: any
  response_status: number | null
  response_body: string | null
  error_message: string | null
  delivered_at: string
}

// Generate a random webhook secret
function generateWebhookSecret(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")
}

export async function createWebhook(data: {
  name: string
  url: string
  description?: string
  events: string[]
}) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: "Unauthorized" }
    }

    // Validate URL
    try {
      new URL(data.url)
    } catch {
      return { error: "Invalid URL format" }
    }

    // Validate events
    if (!data.events || data.events.length === 0) {
      return { error: "At least one event must be selected" }
    }

    const secret = generateWebhookSecret()

    const { data: webhook, error } = await supabase
      .from("webhooks")
      .insert({
        user_id: user.id,
        name: data.name,
        url: data.url,
        description: data.description || null,
        events: data.events,
        secret: secret,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating webhook:", error)
      return { error: error.message }
    }

    revalidatePath("/ai-suite/settings")
    return { webhook, secret }
  } catch (error) {
    console.error("Error in createWebhook:", error)
    return { error: "Failed to create webhook" }
  }
}

export async function getWebhooks() {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: "Unauthorized" }
    }

    const { data: webhooks, error } = await supabase
      .from("webhooks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching webhooks:", error)
      return { error: error.message }
    }

    return { webhooks: webhooks as Webhook[] }
  } catch (error) {
    console.error("Error in getWebhooks:", error)
    return { error: "Failed to fetch webhooks" }
  }
}

export async function updateWebhook(
  id: string,
  data: {
    name?: string
    url?: string
    description?: string
    events?: string[]
    is_active?: boolean
  },
) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: "Unauthorized" }
    }

    // Validate URL if provided
    if (data.url) {
      try {
        new URL(data.url)
      } catch {
        return { error: "Invalid URL format" }
      }
    }

    const { data: webhook, error } = await supabase
      .from("webhooks")
      .update(data)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating webhook:", error)
      return { error: error.message }
    }

    revalidatePath("/ai-suite/settings")
    return { webhook }
  } catch (error) {
    console.error("Error in updateWebhook:", error)
    return { error: "Failed to update webhook" }
  }
}

export async function deleteWebhook(id: string) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: "Unauthorized" }
    }

    const { error } = await supabase.from("webhooks").delete().eq("id", id).eq("user_id", user.id)

    if (error) {
      console.error("Error deleting webhook:", error)
      return { error: error.message }
    }

    revalidatePath("/ai-suite/settings")
    return { success: true }
  } catch (error) {
    console.error("Error in deleteWebhook:", error)
    return { error: "Failed to delete webhook" }
  }
}

export async function testWebhook(id: string) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: "Unauthorized" }
    }

    // Get webhook
    const { data: webhook, error: webhookError } = await supabase
      .from("webhooks")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (webhookError || !webhook) {
      return { error: "Webhook not found" }
    }

    // Send test payload
    const testPayload = {
      event: "webhook.test",
      timestamp: new Date().toISOString(),
      data: {
        message: "This is a test webhook delivery",
      },
    }

    try {
      const response = await fetch(webhook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Secret": webhook.secret,
        },
        body: JSON.stringify(testPayload),
      })

      const responseBody = await response.text()

      // Log the test
      await supabase.from("webhook_logs").insert({
        webhook_id: id,
        event_type: "webhook.test",
        payload: testPayload,
        response_status: response.status,
        response_body: responseBody.substring(0, 1000), // Limit size
        error_message: response.ok ? null : `HTTP ${response.status}`,
      })

      // Update webhook status
      await supabase
        .from("webhooks")
        .update({
          last_triggered_at: new Date().toISOString(),
          last_status: response.ok ? "success" : "failed",
          failure_count: response.ok ? 0 : webhook.failure_count + 1,
        })
        .eq("id", id)

      revalidatePath("/ai-suite/settings")

      return {
        success: response.ok,
        status: response.status,
        message: response.ok ? "Webhook test successful" : `Webhook test failed with status ${response.status}`,
      }
    } catch (fetchError: any) {
      // Log the error
      await supabase.from("webhook_logs").insert({
        webhook_id: id,
        event_type: "webhook.test",
        payload: testPayload,
        response_status: null,
        response_body: null,
        error_message: fetchError.message,
      })

      // Update webhook status
      await supabase
        .from("webhooks")
        .update({
          last_triggered_at: new Date().toISOString(),
          last_status: "failed",
          failure_count: webhook.failure_count + 1,
        })
        .eq("id", id)

      revalidatePath("/ai-suite/settings")

      return {
        success: false,
        message: `Failed to deliver webhook: ${fetchError.message}`,
      }
    }
  } catch (error) {
    console.error("Error in testWebhook:", error)
    return { error: "Failed to test webhook" }
  }
}

export async function getWebhookLogs(webhookId: string, limit = 50) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: "Unauthorized" }
    }

    // Verify webhook belongs to user
    const { data: webhook } = await supabase
      .from("webhooks")
      .select("id")
      .eq("id", webhookId)
      .eq("user_id", user.id)
      .single()

    if (!webhook) {
      return { error: "Webhook not found" }
    }

    const { data: logs, error } = await supabase
      .from("webhook_logs")
      .select("*")
      .eq("webhook_id", webhookId)
      .order("delivered_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching webhook logs:", error)
      return { error: error.message }
    }

    return { logs: logs as WebhookLog[] }
  } catch (error) {
    console.error("Error in getWebhookLogs:", error)
    return { error: "Failed to fetch webhook logs" }
  }
}
