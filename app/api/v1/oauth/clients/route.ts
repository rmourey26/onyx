/**
 * Kronova v1 OAuth Client Management API
 */

import type { NextRequest } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { validateAPIAuth, apiError, apiSuccess } from "@/lib/auth/api-auth"
import crypto from "crypto"

export async function GET(request: NextRequest) {
  try {
    const auth = await validateAPIAuth(request, ["read:oauth"])

    if (!auth.authenticated) {
      return apiError(auth.error || "Authentication failed", auth.status || 401)
    }

    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from("oauth_clients")
      .select("id, client_id, name, description, redirect_uris, scope, client_type, is_active, created_at")
      .eq("user_id", auth.userId!)
      .order("created_at", { ascending: false })

    if (error) {
      return apiError("Failed to fetch OAuth clients", 500)
    }

    return apiSuccess({ clients: data || [] })
  } catch (error) {
    console.error("[OAuth Clients API] Error:", error)
    return apiError("Internal server error", 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await validateAPIAuth(request, ["write:oauth"])

    if (!auth.authenticated) {
      return apiError(auth.error || "Authentication failed", auth.status || 401)
    }

    const body = await request.json()
    const { name, description, redirectUris, scope = "read:assets read:agents", clientType = "public" } = body

    if (!name || !redirectUris || !Array.isArray(redirectUris) || redirectUris.length === 0) {
      return apiError("Missing required fields: name, redirectUris", 400)
    }

    const clientId = `kronova_${crypto.randomBytes(16).toString("hex")}`
    const clientSecret = clientType === "confidential" ? crypto.randomBytes(32).toString("hex") : null

    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from("oauth_clients")
      .insert({
        client_id: clientId,
        client_secret: clientSecret,
        name,
        description,
        redirect_uris: redirectUris,
        scope,
        client_type: clientType,
        user_id: auth.userId,
        is_active: true,
      })
      .select("id, client_id, name, description, redirect_uris, scope, client_type, created_at")
      .single()

    if (error) {
      return apiError("Failed to create OAuth client", 500)
    }

    return apiSuccess(
      {
        ...data,
        client_secret: clientSecret, // Only returned on creation
      },
      201,
    )
  } catch (error) {
    console.error("[OAuth Clients API] Error:", error)
    return apiError("Internal server error", 500)
  }
}
