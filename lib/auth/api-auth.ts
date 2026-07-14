/**
 * Resend-It Enterprise API Authentication Module
 * Provides standardized authentication for all v1 API endpoints
 */

import { createServerSupabaseClient } from "@/lib/supabase/server"
import type { NextRequest } from "next/server"

export interface APIAuthResult {
  authenticated: boolean
  userId?: string
  apiKeyId?: string
  authMethod: "session" | "api_key"
  error?: string
  status?: number
  scopes?: string[]
}

/**
 * Validate API authentication with scope checking
 */
export async function validateAPIAuth(request: NextRequest, requiredScopes?: string[]): Promise<APIAuthResult> {
  const supabase = await createServerSupabaseClient()

  // Try session auth first
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (user && !userError) {
      return {
        authenticated: true,
        userId: user.id,
        authMethod: "session",
        scopes: ["*"],
      }
    }
  } catch {
    // Session auth failed, try API key
  }

  // Try API key auth
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

  try {
    const { data: validationResult, error: validationError } = await supabase.rpc("validate_api_key", {
      api_key: apiKey,
    })

    if (validationError || !validationResult || validationResult.length === 0) {
      return {
        authenticated: false,
        authMethod: "api_key",
        error: "Invalid API key",
        status: 401,
      }
    }

    const result = validationResult[0]

    if (!result.valid) {
      return {
        authenticated: false,
        authMethod: "api_key",
        error: "Invalid or expired API key",
        status: 401,
      }
    }

    // Check required scopes
    const keyScopes = result.scopes || []
    if (requiredScopes && requiredScopes.length > 0) {
      const hasWildcard =
        keyScopes.includes("*") ||
        keyScopes.some((s: string) => requiredScopes.some((rs) => s === `${rs.split(":")[0]}:*`))
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

    return {
      authenticated: true,
      userId: result.user_id,
      apiKeyId: result.api_key_id,
      authMethod: "api_key",
      scopes: keyScopes,
    }
  } catch (error) {
    console.error("[API Auth] Validation error:", error)
    return {
      authenticated: false,
      authMethod: "api_key",
      error: "Authentication failed",
      status: 500,
    }
  }
}

/**
 * Standard error response helper
 */
export function apiError(message: string, status: number, details?: any) {
  return Response.json(
    {
      success: false,
      error: message,
      details,
      timestamp: new Date().toISOString(),
    },
    { status },
  )
}

/**
 * Standard success response helper
 */
export function apiSuccess(data: any, status = 200) {
  return Response.json(
    {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    },
    { status },
  )
}

export { validateAPIAuth as validateAPIRequest }
