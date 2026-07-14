"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import crypto from "crypto"

export async function getWebhooks() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  const { data, error } = await supabase
    .from("webhooks")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function createWebhook(formData: {
  name: string
  url: string
  events: string[]
  description?: string
}) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  const secret = crypto.randomBytes(32).toString("hex")

  const { data, error } = await supabase
    .from("webhooks")
    .insert({
      user_id: user.id,
      name: formData.name,
      url: formData.url,
      events: formData.events,
      description: formData.description,
      secret,
      is_active: true,
    })
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/ai-suite/settings")
  return { success: true, data }
}

export async function updateWebhook(
  webhookId: string,
  formData: {
    name?: string
    url?: string
    events?: string[]
    description?: string
    is_active?: boolean
  },
) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  const { data, error } = await supabase
    .from("webhooks")
    .update(formData)
    .eq("id", webhookId)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/ai-suite/settings")
  return { success: true, data }
}

export async function deleteWebhook(webhookId: string) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  const { error } = await supabase.from("webhooks").delete().eq("id", webhookId).eq("user_id", user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/ai-suite/settings")
  return { success: true }
}

export async function getWebhookLogs(webhookId: string) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  const { data: webhook } = await supabase
    .from("webhooks")
    .select("id")
    .eq("id", webhookId)
    .eq("user_id", user.id)
    .single()

  if (!webhook) {
    return { success: false, error: "Webhook not found" }
  }

  const { data, error } = await supabase
    .from("webhook_logs")
    .select("*")
    .eq("webhook_id", webhookId)
    .order("delivered_at", { ascending: false })
    .limit(100)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data }
}
