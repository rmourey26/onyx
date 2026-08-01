"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { storeSecret } from "@/app/actions/vault-actions"

export interface APIKey {
  id: string
  user_id: string
  name: string
  key_prefix: string
  last_used_at: string | null
  expires_at: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  scopes?: string[]
  total_requests?: number
  last_request_at?: string | null
}

// Generate a secure random API key using Web Crypto API
function generateAPIKey(): string {
  const prefix = "sk_live_"
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  const randomPart = Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")
  return `${prefix}${randomPart}`
}

// Hash the API key for storage using Web Crypto API
async function hashAPIKey(key: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(key)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("")
}

// Get the key prefix for display (first 12 chars)
function getKeyPrefix(key: string): string {
  return key.substring(0, 12)
}

export async function createAPIKey(name: string, expiresInDays?: number, scopes?: string[]) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Unauthorized" }
    }

    // Generate the API key
    const apiKey = generateAPIKey()
    const keyHash = await hashAPIKey(apiKey)
    const keyPrefix = getKeyPrefix(apiKey)

    // Calculate expiration date if provided
    let expiresAt = null
    if (expiresInDays) {
      const expirationDate = new Date()
      expirationDate.setDate(expirationDate.getDate() + expiresInDays)
      expiresAt = expirationDate.toISOString()
    }

    const { data, error } = await supabase.rpc("create_api_key", {
      p_user_id: user.id,
      p_name: name,
      p_key_prefix: keyPrefix,
      p_key_hash: keyHash,
      p_expires_at: expiresAt,
      p_scopes: scopes || [],
    })

    if (error) {
      console.error("Error creating API key:", error)
      return { error: "Failed to create API key" }
    }

    // Store raw key in Vault for short-term admin recovery (30-day window)
    if (data?.[0]?.id) {
      await storeSecret(`api_key_raw_${data[0].id}`, apiKey)
    }

    // Return the full key only once (it won't be stored in plain text)
    return { data: { ...(data[0] || {}), key: apiKey } }
  } catch (error) {
    console.error("Error in createAPIKey:", error)
    return { error: "An error occurred while creating the API key" }
  }
}

export async function getAPIKeys() {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Unauthorized" }
    }

    const { data, error } = await supabase.rpc("get_user_api_keys", {
      p_user_id: user.id,
      p_limit: 100,
    })

    if (error) {
      console.error("Error fetching API keys:", error)
      return { error: "Failed to fetch API keys" }
    }

    return { data }
  } catch (error) {
    console.error("Error in getAPIKeys:", error)
    return { error: "An error occurred while fetching API keys" }
  }
}

export async function revokeAPIKey(keyId: string) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Unauthorized" }
    }

    const { error } = await supabase.rpc("update_api_key", {
      p_key_id: keyId,
      p_is_active: false,
    })

    if (error) {
      console.error("Error revoking API key:", error)
      return { error: "Failed to revoke API key" }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in revokeAPIKey:", error)
    return { error: "An error occurred while revoking the API key" }
  }
}

export async function deleteAPIKey(keyId: string) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Unauthorized" }
    }

    const { data, error } = await supabase.rpc("delete_api_key", {
      p_key_id: keyId,
    })

    if (error) {
      console.error("Error deleting API key:", error)
      return { error: "Failed to delete API key" }
    }

    if (!data) {
      return { error: "API key not found or unauthorized" }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in deleteAPIKey:", error)
    return { error: "An error occurred while deleting the API key" }
  }
}

export async function updateAPIKeyName(keyId: string, name: string) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Unauthorized" }
    }

    const { error } = await supabase.rpc("update_api_key", {
      p_key_id: keyId,
      p_name: name,
    })

    if (error) {
      console.error("Error updating API key name:", error)
      return { error: "Failed to update API key name" }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in updateAPIKeyName:", error)
    return { error: "An error occurred while updating the API key name" }
  }
}

export interface APIKeyValidationResult {
  valid: boolean
  key?: APIKey
  error?: string
}

// Added function to validate API key for authentication
export async function validateAPIKeyWithContext(providedKey: string): Promise<APIKeyValidationResult> {
  try {
    const supabase = await createServerSupabaseClient()

    // Call the Postgres validation function that sets RLS context
    const { data, error } = await supabase.rpc("validate_api_key", {
      api_key: providedKey,
    })

    if (error) {
      console.error("Error validating API key:", error)
      return { valid: false, error: "Failed to validate API key" }
    }

    if (!data || data.length === 0 || !data[0].valid) {
      return { valid: false, error: "Invalid API key" }
    }

    const result = data[0]

    // Fetch the full key record for return
    const { data: keyData } = await supabase.from("api_keys").select("*").eq("id", result.api_key_id).single()

    return { valid: true, key: keyData }
  } catch (error) {
    console.error("Error in validateAPIKeyWithContext:", error)
    return { valid: false, error: "An error occurred while validating the API key" }
  }
}

export async function updateAPIKeyScopes(keyId: string, scopes: string[]) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Unauthorized" }
    }

    // Note: We need to create update_api_key_scopes stored procedure or extend update_api_key
    // For now, using direct update as fallback
    const { error } = await supabase.from("api_keys").update({ scopes }).eq("id", keyId).eq("user_id", user.id)

    if (error) {
      console.error("Error updating API key scopes:", error)
      return { error: "Failed to update API key scopes" }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in updateAPIKeyScopes:", error)
    return { error: "An error occurred while updating the API key scopes" }
  }
}

export async function rotateAPIKey(keyId: string) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Unauthorized" }
    }

    // Get the existing key to preserve name and expiration
    const { data: keys } = await supabase.rpc("get_user_api_keys", {
      p_user_id: user.id,
      p_limit: 100,
    })

    const existingKey = keys?.find((k: any) => k.id === keyId)

    if (!existingKey) {
      return { error: "API key not found" }
    }

    // Generate new key
    const newApiKey = generateAPIKey()
    const newKeyHash = await hashAPIKey(newApiKey)
    const newKeyPrefix = getKeyPrefix(newApiKey)

    // Delete old key and create new one with same properties
    await supabase.rpc("delete_api_key", { p_key_id: keyId })

    const { data, error } = await supabase.rpc("create_api_key", {
      p_user_id: user.id,
      p_name: existingKey.name,
      p_key_prefix: newKeyPrefix,
      p_key_hash: newKeyHash,
      p_expires_at: existingKey.expires_at,
      p_scopes: existingKey.scopes || [],
    })

    if (error) {
      console.error("Error rotating API key:", error)
      return { error: "Failed to rotate API key" }
    }

    return { data: { ...(data[0] || {}), key: newApiKey } }
  } catch (error) {
    console.error("Error in rotateAPIKey:", error)
    return { error: "An error occurred while rotating the API key" }
  }
}
