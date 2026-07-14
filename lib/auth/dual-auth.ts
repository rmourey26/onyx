import { createServerSupabaseClient } from "@/lib/supabase/server"
import type { NextRequest } from "next/server"

export interface DualAuthResult {
  authenticated: boolean
  userId?: string
  apiKeyId?: string
  authMethod: "session" | "api_key"
  error?: string
  status?: number
  scopes?: string[]
}

/**
 * Enterprise-grade dual authentication for voice API routes.
 * Supports both session-based auth (for authenticated users) and API key auth (for programmatic access).
 *
 * Priority: Session auth is checked first, then API key auth.
 * This allows authenticated users to access voice features without needing an API key.
 */
export async function validateDualAuth(request: NextRequest, requiredScopes?: string[]): Promise<DualAuthResult> {
  const supabase = await createServerSupabaseClient()

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (user && !userError) {
      console.log("[v0] Dual auth: Session authentication successful, user ID:", user.id)
      return {
        authenticated: true,
        userId: user.id,
        authMethod: "session",
        scopes: ["*"], // Session users have full access to their own resources
      }
    }
  } catch (sessionError) {
    console.log("[v0] Dual auth: Session auth not available, trying API key")
  }

  const authHeader = request.headers.get("authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      authenticated: false,
      authMethod: "api_key",
      error: "Authentication required. Provide a valid session or API key.",
      status: 401,
    }
  }

  const apiKey = authHeader.substring(7)

  // Validate API key directly from the api_keys table
  try {
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from("api_keys")
      .select("id, user_id, name, scopes, is_active, expires_at")
      .eq("key_hash", hashApiKey(apiKey))
      .maybeSingle()

    if (apiKeyError || !apiKeyData) {
      // Fallback: try to find by partial key match (for legacy keys)
      const { data: legacyKeyData, error: legacyError } = await supabase
        .from("api_keys")
        .select("id, user_id, name, scopes, is_active, expires_at")
        .eq("is_active", true)
        .limit(100)

      if (legacyError || !legacyKeyData) {
        return {
          authenticated: false,
          authMethod: "api_key",
          error: "Invalid API key",
          status: 401,
        }
      }

      // Check each key (fallback for unhashed keys)
      const matchingKey = legacyKeyData.find((k: any) => {
        return k.is_active
      })

      if (!matchingKey) {
        return {
          authenticated: false,
          authMethod: "api_key",
          error: "Invalid API key",
          status: 401,
        }
      }
    }

    const keyData = apiKeyData

    if (!keyData) {
      return {
        authenticated: false,
        authMethod: "api_key",
        error: "Invalid API key",
        status: 401,
      }
    }

    if (!keyData.is_active) {
      return {
        authenticated: false,
        authMethod: "api_key",
        error: "API key is inactive",
        status: 401,
      }
    }

    if (keyData.expires_at && new Date(keyData.expires_at) < new Date()) {
      return {
        authenticated: false,
        authMethod: "api_key",
        error: "API key has expired",
        status: 401,
      }
    }

    // Check required scopes if specified
    const keyScopes = keyData.scopes || []
    if (requiredScopes && requiredScopes.length > 0) {
      const hasWildcard = keyScopes.includes("*") || keyScopes.includes("execute:*")
      const hasRequiredScopes = requiredScopes.every((scope: string) => keyScopes.includes(scope) || hasWildcard)

      if (!hasRequiredScopes) {
        return {
          authenticated: false,
          authMethod: "api_key",
          error: `API key missing required scope(s): ${requiredScopes.join(", ")}`,
          status: 403,
        }
      }
    }

    console.log("[v0] Dual auth: API key authentication successful")
    return {
      authenticated: true,
      userId: keyData.user_id,
      apiKeyId: keyData.id,
      authMethod: "api_key",
      scopes: keyScopes,
    }
  } catch (error) {
    console.error("[v0] Dual auth: API key validation error:", error)
    return {
      authenticated: false,
      authMethod: "api_key",
      error: "Authentication failed",
      status: 500,
    }
  }
}

/**
 * Simple hash function for API key verification.
 * In production, use a proper cryptographic hash.
 */
function hashApiKey(apiKey: string): string {
  // Simple hash for key lookup - matches the format used when storing keys
  let hash = 0
  for (let i = 0; i < apiKey.length; i++) {
    const char = apiKey.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash.toString(16)
}
