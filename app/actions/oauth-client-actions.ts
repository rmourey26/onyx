"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createOAuthClient(data: {
  clientName: string
  clientDescription?: string
  redirectUris: string[]
  allowedScopes: string[]
}) {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Unauthorized" }
  }

  const { data: result, error } = await supabase.rpc("register_oauth_client", {
    p_client_name: data.clientName,
    p_client_description: data.clientDescription || null,
    p_redirect_uris: data.redirectUris,
    p_allowed_scopes: data.allowedScopes,
  })

  if (error) {
    console.error("[v0] Error creating OAuth client:", error)
    return { error: error.message }
  }

  revalidatePath("/ai-suite/settings/oauth")
  return { data: result }
}

export async function updateOAuthClient(
  clientId: string,
  updates: {
    clientName?: string
    clientDescription?: string
    redirectUris?: string[]
    allowedScopes?: string[]
    isActive?: boolean
  },
) {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Unauthorized" }
  }

  const { data, error } = await supabase.rpc("update_oauth_client", {
    p_client_id: clientId,
    p_client_name: updates.clientName || null,
    p_client_description: updates.clientDescription || null,
    p_redirect_uris: updates.redirectUris || null,
    p_allowed_scopes: updates.allowedScopes || null,
    p_is_active: updates.isActive ?? null,
  })

  if (error) {
    console.error("[v0] Error updating OAuth client:", error)
    return { error: error.message }
  }

  revalidatePath("/ai-suite/settings/oauth")
  return { data }
}

export async function deleteOAuthClient(clientId: string) {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Unauthorized" }
  }

  const { data, error } = await supabase.rpc("delete_oauth_client", {
    p_client_id: clientId,
  })

  if (error) {
    console.error("[v0] Error deleting OAuth client:", error)
    return { error: error.message }
  }

  revalidatePath("/ai-suite/settings/oauth")
  return { success: data }
}

export async function rotateOAuthClientSecret(clientId: string) {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Unauthorized" }
  }

  const { data, error } = await supabase.rpc("rotate_oauth_client_secret", {
    p_client_id: clientId,
  })

  if (error) {
    console.error("[v0] Error rotating OAuth client secret:", error)
    return { error: error.message }
  }

  revalidatePath("/ai-suite/settings/oauth")
  return { data }
}
