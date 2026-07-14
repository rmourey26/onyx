/**
 * Resend-It v1 OAuth 2.1 Token Endpoint
 */

import type { NextRequest } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const body = await request.formData()

    const grantType = body.get("grant_type") as string
    const clientId = body.get("client_id") as string
    const clientSecret = body.get("client_secret") as string
    const code = body.get("code") as string
    const redirectUri = body.get("redirect_uri") as string
    const codeVerifier = body.get("code_verifier") as string
    const refreshToken = body.get("refresh_token") as string

    const supabase = await createServerSupabaseClient()

    if (grantType === "authorization_code") {
      if (!code || !redirectUri || !codeVerifier || !clientId) {
        return Response.json(
          {
            error: "invalid_request",
            error_description: "Missing required parameters",
          },
          { status: 400 },
        )
      }

      // Validate client
      const { data: client, error: clientError } = await supabase
        .from("oauth_clients")
        .select("*")
        .eq("client_id", clientId)
        .eq("is_active", true)
        .single()

      if (clientError || !client) {
        return Response.json(
          {
            error: "invalid_client",
          },
          { status: 401 },
        )
      }

      // For confidential clients, verify secret
      if (client.client_type === "confidential") {
        if (!clientSecret || clientSecret !== client.client_secret) {
          return Response.json(
            {
              error: "invalid_client",
            },
            { status: 401 },
          )
        }
      }

      // Get and validate authorization code
      const { data: authCode, error: authCodeError } = await supabase
        .from("oauth_authorization_codes")
        .select("*")
        .eq("code", code)
        .eq("client_id", clientId)
        .single()

      if (authCodeError || !authCode) {
        return Response.json(
          {
            error: "invalid_grant",
            error_description: "Invalid authorization code",
          },
          { status: 400 },
        )
      }

      // Check expiration
      if (new Date(authCode.expires_at) < new Date()) {
        await supabase.from("oauth_authorization_codes").delete().eq("code", code)
        return Response.json(
          {
            error: "invalid_grant",
            error_description: "Authorization code expired",
          },
          { status: 400 },
        )
      }

      // Verify redirect URI
      if (authCode.redirect_uri !== redirectUri) {
        return Response.json(
          {
            error: "invalid_grant",
            error_description: "Redirect URI mismatch",
          },
          { status: 400 },
        )
      }

      // Verify PKCE
      const challengeHash = crypto.createHash("sha256").update(codeVerifier).digest("base64url")

      if (challengeHash !== authCode.code_challenge) {
        return Response.json(
          {
            error: "invalid_grant",
            error_description: "Code verifier mismatch",
          },
          { status: 400 },
        )
      }

      // Delete used authorization code
      await supabase.from("oauth_authorization_codes").delete().eq("code", code)

      // Generate tokens
      const accessToken = crypto.randomBytes(32).toString("hex")
      const newRefreshToken = crypto.randomBytes(32).toString("hex")
      const expiresIn = 3600 // 1 hour

      await supabase.from("oauth_access_tokens").insert({
        token: accessToken,
        client_id: clientId,
        user_id: authCode.user_id,
        scope: authCode.scope,
        expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
      })

      await supabase.from("oauth_refresh_tokens").insert({
        token: newRefreshToken,
        client_id: clientId,
        user_id: authCode.user_id,
        scope: authCode.scope,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      })

      return Response.json({
        access_token: accessToken,
        token_type: "Bearer",
        expires_in: expiresIn,
        refresh_token: newRefreshToken,
        scope: authCode.scope,
      })
    } else if (grantType === "refresh_token") {
      if (!refreshToken || !clientId) {
        return Response.json(
          {
            error: "invalid_request",
            error_description: "Missing required parameters",
          },
          { status: 400 },
        )
      }

      const { data: storedToken, error: tokenError } = await supabase
        .from("oauth_refresh_tokens")
        .select("*")
        .eq("token", refreshToken)
        .eq("client_id", clientId)
        .single()

      if (tokenError || !storedToken) {
        return Response.json(
          {
            error: "invalid_grant",
            error_description: "Invalid refresh token",
          },
          { status: 400 },
        )
      }

      if (new Date(storedToken.expires_at) < new Date()) {
        await supabase.from("oauth_refresh_tokens").delete().eq("token", refreshToken)
        return Response.json(
          {
            error: "invalid_grant",
            error_description: "Refresh token expired",
          },
          { status: 400 },
        )
      }

      // Rotate refresh token
      await supabase.from("oauth_refresh_tokens").delete().eq("token", refreshToken)

      const accessToken = crypto.randomBytes(32).toString("hex")
      const newRefreshToken = crypto.randomBytes(32).toString("hex")
      const expiresIn = 3600

      await supabase.from("oauth_access_tokens").insert({
        token: accessToken,
        client_id: clientId,
        user_id: storedToken.user_id,
        scope: storedToken.scope,
        expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
      })

      await supabase.from("oauth_refresh_tokens").insert({
        token: newRefreshToken,
        client_id: clientId,
        user_id: storedToken.user_id,
        scope: storedToken.scope,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })

      return Response.json({
        access_token: accessToken,
        token_type: "Bearer",
        expires_in: expiresIn,
        refresh_token: newRefreshToken,
        scope: storedToken.scope,
      })
    } else {
      return Response.json(
        {
          error: "unsupported_grant_type",
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("[OAuth Token] Error:", error)
    return Response.json(
      {
        error: "server_error",
      },
      { status: 500 },
    )
  }
}
