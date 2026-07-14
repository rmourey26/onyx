"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Notification settings schema
const NotificationSettingsSchema = z.object({
  email_notifications: z.boolean().default(true),
  workflow_notifications: z.boolean().default(true),
  agent_notifications: z.boolean().default(true),
  asset_notifications: z.boolean().default(true),
  security_alerts: z.boolean().default(true),
  marketing_emails: z.boolean().default(false),
  weekly_digest: z.boolean().default(true),
})

// Security settings schema
const SecuritySettingsSchema = z.object({
  two_factor_enabled: z.boolean().default(false),
  session_timeout: z.number().min(5).max(1440).default(60), // minutes
  api_key_rotation_days: z.number().min(30).max(365).default(90),
  login_notifications: z.boolean().default(true),
  suspicious_activity_alerts: z.boolean().default(true),
  allowed_ip_addresses: z.array(z.string()).default([]),
})

export type NotificationSettings = z.infer<typeof NotificationSettingsSchema>
export type SecuritySettings = z.infer<typeof SecuritySettingsSchema>

// Get user settings by type
export async function getUserSettings(settingsType: "notifications" | "security") {
  const supabase = await createServerSupabaseClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    const { data, error } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", user.id)
      .eq("settings_type", settingsType)
      .maybeSingle()

    if (error) throw error

    // Return default settings if none exist
    if (!data) {
      const defaultSettings =
        settingsType === "notifications" ? NotificationSettingsSchema.parse({}) : SecuritySettingsSchema.parse({})

      return { success: true, data: defaultSettings }
    }

    return { success: true, data: data.settings }
  } catch (error) {
    console.error(`Error fetching ${settingsType} settings:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch settings",
    }
  }
}

// Update notification settings
export async function updateNotificationSettings(settings: NotificationSettings) {
  const supabase = await createServerSupabaseClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Validate settings
    const validatedSettings = NotificationSettingsSchema.parse(settings)

    // Check if settings exist
    const { data: existing } = await supabase
      .from("user_settings")
      .select("id")
      .eq("user_id", user.id)
      .eq("settings_type", "notifications")
      .maybeSingle()

    if (existing) {
      // Update existing settings
      const { error } = await supabase
        .from("user_settings")
        .update({
          settings: validatedSettings,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)

      if (error) throw error
    } else {
      // Create new settings
      const { error } = await supabase.from("user_settings").insert({
        user_id: user.id,
        settings_type: "notifications",
        settings: validatedSettings,
      })

      if (error) throw error
    }

    revalidatePath("/ai-suite/settings")
    return { success: true, data: validatedSettings }
  } catch (error) {
    console.error("Error updating notification settings:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update settings",
    }
  }
}

// Update security settings
export async function updateSecuritySettings(settings: SecuritySettings) {
  const supabase = await createServerSupabaseClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Validate settings
    const validatedSettings = SecuritySettingsSchema.parse(settings)

    // Check if settings exist
    const { data: existing } = await supabase
      .from("user_settings")
      .select("id")
      .eq("user_id", user.id)
      .eq("settings_type", "security")
      .maybeSingle()

    if (existing) {
      // Update existing settings
      const { error } = await supabase
        .from("user_settings")
        .update({
          settings: validatedSettings,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)

      if (error) throw error
    } else {
      // Create new settings
      const { error } = await supabase.from("user_settings").insert({
        user_id: user.id,
        settings_type: "security",
        settings: validatedSettings,
      })

      if (error) throw error
    }

    revalidatePath("/ai-suite/settings")
    return { success: true, data: validatedSettings }
  } catch (error) {
    console.error("Error updating security settings:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update settings",
    }
  }
}

// Get all active sessions
export async function getActiveSessions() {
  const supabase = await createServerSupabaseClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Get user sessions from auth
    const { data, error } = await supabase.auth.admin.listUserSessions(user.id)

    if (error) throw error

    return { success: true, data: data || [] }
  } catch (error) {
    console.error("Error fetching sessions:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch sessions",
    }
  }
}

// Revoke a session
export async function revokeSession(sessionId: string) {
  const supabase = await createServerSupabaseClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    const { error } = await supabase.auth.admin.deleteSession(sessionId)

    if (error) throw error

    revalidatePath("/ai-suite/settings")
    return { success: true }
  } catch (error) {
    console.error("Error revoking session:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to revoke session",
    }
  }
}
