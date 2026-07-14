"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

/**
 * Send message via Aethernet protocol
 */
export async function sendAethernetMessage(params: {
  subject: string
  body: string
  recipients: string[]
  priority?: "low" | "normal" | "high" | "critical"
  encrypted?: boolean
  attachments?: any[]
  thread_id?: string
}) {
  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase.rpc("send_aethernet_message", {
      p_subject: params.subject,
      p_body: params.body,
      p_recipients: params.recipients,
      p_priority: params.priority || "normal",
      p_encrypted: params.encrypted || false,
      p_attachments: params.attachments || [],
      p_thread_id: params.thread_id || null,
    })

    if (error) {
      console.error("[v0] Error sending Aethernet message:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/messages")
    return { success: true, messageId: data }
  } catch (error: any) {
    console.error("[v0] Exception sending Aethernet message:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Get user's messages (inbox)
 */
export async function getAethernetMessages(params?: {
  limit?: number
  offset?: number
  status?: string
}) {
  try {
    const supabase = await createServerSupabaseClient()

    let query = supabase
      .from("aethernet_messages")
      .select(
        `
        *,
        sender:sender_id(id, full_name, email, avatar_url),
        recipients:aethernet_message_recipients(
          id,
          recipient_id,
          delivery_status,
          read_status,
          read_at
        )
      `,
      )
      .order("sent_at", { ascending: false })

    if (params?.status) {
      query = query.eq("status", params.status)
    }

    if (params?.limit) {
      query = query.limit(params.limit)
    }

    if (params?.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) {
      console.error("[v0] Error fetching Aethernet messages:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error("[v0] Exception fetching Aethernet messages:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Mark message as read
 */
export async function markAethernetMessageAsRead(messageId: string) {
  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase.rpc("mark_message_as_read", {
      p_message_id: messageId,
    })

    if (error) {
      console.error("[v0] Error marking message as read:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/messages")
    return { success: true, data }
  } catch (error: any) {
    console.error("[v0] Exception marking message as read:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Get message thread
 */
export async function getAethernetMessageThread(threadId: string) {
  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase.rpc("get_message_thread", {
      p_thread_id: threadId,
    })

    if (error) {
      console.error("[v0] Error fetching message thread:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error("[v0] Exception fetching message thread:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Get or create protocol settings for user
 */
export async function getAethernetProtocolSettings() {
  try {
    const supabase = await createServerSupabaseClient()

    const { data: existing, error: fetchError } = await supabase
      .from("aethernet_protocol_settings")
      .select("*")
      .single()

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("[v0] Error fetching protocol settings:", fetchError)
      return { success: false, error: fetchError.message }
    }

    if (existing) {
      return { success: true, data: existing }
    }

    // Create default settings
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    const { data: created, error: createError } = await supabase
      .from("aethernet_protocol_settings")
      .insert({
        user_id: user.id,
      })
      .select()
      .single()

    if (createError) {
      console.error("[v0] Error creating protocol settings:", createError)
      return { success: false, error: createError.message }
    }

    return { success: true, data: created }
  } catch (error: any) {
    console.error("[v0] Exception with protocol settings:", error)
    return { success: false, error: error.message }
  }
}
