"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"

/**
 * Supabase Vault helpers
 * Secrets are stored via the vault.create_secret / vault.update_secret RPCs.
 * Reading uses vault.decrypted_secrets — the decryption key is held by Vault,
 * never exposed to the app layer.
 */

export async function storeSecret(name: string, value: string): Promise<{ id: string | null; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase.rpc("vault_store_secret" as any, {
      p_name:   name,
      p_secret: value,
    })

    if (error) {
      // Fallback: try the direct vault schema call
      const { data: d2, error: e2 } = await supabase.rpc("create_secret" as any, {
        new_secret: value,
        new_name:   name,
      })
      if (e2) return { id: null, error: e2.message }
      return { id: d2 as string }
    }

    return { id: data as string }
  } catch (err) {
    console.error("[vault] storeSecret error:", err)
    return { id: null, error: "Failed to store secret in Vault" }
  }
}

export async function readSecret(name: string): Promise<{ value: string | null; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from("decrypted_secrets" as any)
      .select("decrypted_secret")
      .eq("name", name)
      .maybeSingle()

    if (error) return { value: null, error: error.message }
    if (!data) return { value: null, error: "Secret not found" }

    return { value: (data as any).decrypted_secret as string }
  } catch (err) {
    console.error("[vault] readSecret error:", err)
    return { value: null, error: "Failed to read secret from Vault" }
  }
}

export async function deleteSecret(name: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient()

    const { error } = await supabase.rpc("delete_secret" as any, { secret_name: name })

    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (err) {
    console.error("[vault] deleteSecret error:", err)
    return { success: false, error: "Failed to delete secret from Vault" }
  }
}
