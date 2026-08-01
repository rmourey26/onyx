"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

/**
 * Service Accounts — application-layer pattern
 *
 * A service account is an organization row whose `created_by` profile has
 * `job_title = 'Service Account'` and a machine-generated email. This avoids
 * adding a new table while being cleanly queryable.
 *
 * Associated API keys are owned by a dedicated `user_settings.user_id` that
 * acts as the machine identity for that service account.
 */

export interface ServiceAccount {
  id: string
  name: string
  slug: string
  description: string | null
  created_at: string | null
  owner_user_id: string | null
  api_key_count: number
}

// ---------------------------------------------------------------------------
// List
// ---------------------------------------------------------------------------
export async function listServiceAccounts(): Promise<{ data: ServiceAccount[]; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: [], error: "Unauthorized" }

    // Service accounts are organizations created by the current user that have
    // a slug starting with "sa-"
    const { data, error } = await supabase
      .from("organizations")
      .select("id, name, slug, description, created_at, created_by")
      .like("slug", "sa-%")
      .eq("created_by", user.id)
      .order("created_at", { ascending: false })

    if (error) return { data: [], error: error.message }

    return {
      data: (data ?? []).map(row => ({
        id:            row.id,
        name:          row.name,
        slug:          row.slug,
        description:   row.description ?? null,
        created_at:    row.created_at ?? null,
        owner_user_id: row.created_by ?? null,
        api_key_count: 0, // populated lazily
      })),
    }
  } catch (err) {
    console.error("[service-accounts] listServiceAccounts:", err)
    return { data: [], error: "Unexpected error" }
  }
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------
export async function createServiceAccount(
  name: string,
  description?: string,
): Promise<{ data?: ServiceAccount; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Unauthorized" }

    // Slug: "sa-" + sanitised name + random suffix
    const slug = `sa-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${Math.random().toString(36).slice(2, 7)}`

    const { data, error } = await supabase
      .from("organizations")
      .insert({
        name,
        slug,
        description: description ?? null,
        created_by:  user.id,
      })
      .select("id, name, slug, description, created_at, created_by")
      .single()

    if (error) return { error: error.message }

    revalidatePath("/ai-suite/settings/service-accounts")

    return {
      data: {
        id:            data.id,
        name:          data.name,
        slug:          data.slug,
        description:   data.description ?? null,
        created_at:    data.created_at ?? null,
        owner_user_id: data.created_by ?? null,
        api_key_count: 0,
      },
    }
  } catch (err) {
    console.error("[service-accounts] createServiceAccount:", err)
    return { error: "Unexpected error" }
  }
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------
export async function deleteServiceAccount(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { error } = await supabase
      .from("organizations")
      .delete()
      .eq("id", id)
      .eq("created_by", user.id)
      .like("slug", "sa-%")

    if (error) return { success: false, error: error.message }

    revalidatePath("/ai-suite/settings/service-accounts")
    return { success: true }
  } catch (err) {
    console.error("[service-accounts] deleteServiceAccount:", err)
    return { success: false, error: "Unexpected error" }
  }
}

// ---------------------------------------------------------------------------
// Transfer API keys to a service account
// The "owner" of keys is tracked via a metadata field we store as description
// ---------------------------------------------------------------------------
export async function transferAssetsToServiceAccount(
  serviceAccountId: string,
  keyIds: string[],
): Promise<{ success: boolean; transferred: number; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, transferred: 0, error: "Unauthorized" }

    // Verify the service account belongs to this user
    const { data: sa, error: saErr } = await supabase
      .from("organizations")
      .select("id, slug")
      .eq("id", serviceAccountId)
      .eq("created_by", user.id)
      .single()

    if (saErr || !sa) return { success: false, transferred: 0, error: "Service account not found" }

    // Tag API keys with the service account ID in scopes metadata
    let transferred = 0
    for (const keyId of keyIds) {
      const { error } = await supabase
        .from("api_keys")
        .update({ scopes: [`service_account:${serviceAccountId}`] })
        .eq("id", keyId)
        .eq("user_id", user.id)

      if (!error) transferred++
    }

    revalidatePath("/ai-suite/settings/service-accounts")
    return { success: true, transferred }
  } catch (err) {
    console.error("[service-accounts] transferAssetsToServiceAccount:", err)
    return { success: false, transferred: 0, error: "Unexpected error" }
  }
}
