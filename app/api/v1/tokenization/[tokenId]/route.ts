/**
 * Kronova v1 Token Detail API
 */

import type { NextRequest } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { validateAPIAuth, apiError, apiSuccess } from "@/lib/auth/api-auth"

export async function GET(request: NextRequest, { params }: { params: { tokenId: string } }) {
  try {
    const auth = await validateAPIAuth(request, ["read:tokenization"])

    if (!auth.authenticated) {
      return apiError(auth.error || "Authentication failed", auth.status || 401)
    }

    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from("asset_tokens")
      .select(`
        *,
        assets (*),
        fractionalization_pools (*)
      `)
      .eq("id", params.tokenId)
      .eq("user_id", auth.userId!)
      .single()

    if (error || !data) {
      return apiError("Token not found", 404)
    }

    return apiSuccess(data)
  } catch (error) {
    console.error("[Token Detail API] Error:", error)
    return apiError("Internal server error", 500)
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { tokenId: string } }) {
  try {
    const auth = await validateAPIAuth(request, ["write:tokenization"])

    if (!auth.authenticated) {
      return apiError(auth.error || "Authentication failed", auth.status || 401)
    }

    const body = await request.json()
    const { status, metadata } = body

    const supabase = await createServerSupabaseClient()

    const { data: existing } = await supabase
      .from("asset_tokens")
      .select("metadata")
      .eq("id", params.tokenId)
      .eq("user_id", auth.userId!)
      .single()

    if (!existing) {
      return apiError("Token not found", 404)
    }

    const updates: any = {}
    if (status !== undefined) updates.status = status
    if (metadata !== undefined) {
      updates.metadata = { ...existing.metadata, ...metadata }
    }

    const { data, error } = await supabase
      .from("asset_tokens")
      .update(updates)
      .eq("id", params.tokenId)
      .eq("user_id", auth.userId!)
      .select()
      .single()

    if (error) {
      return apiError("Failed to update token", 500)
    }

    return apiSuccess(data)
  } catch (error) {
    console.error("[Token Detail API] Error:", error)
    return apiError("Internal server error", 500)
  }
}
