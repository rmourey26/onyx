/**
 * Kronova v1 OAuth 2.1 Authorization Endpoint
 * MCP-compliant OAuth authorization server
 */

import type { NextRequest } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import crypto from "crypto"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const clientId = searchParams.get("client_id")
  const redirectUri = searchParams.get("redirect_uri")
  const responseType = searchParams.get("response_type")
  const scope = searchParams.get("scope") || ""
  const state = searchParams.get("state")
  const codeChallenge = searchParams.get("code_challenge")
  const codeChallengeMethod = searchParams.get("code_challenge_method")

  // Validate required parameters
  if (!clientId || !redirectUri || !responseType) {
    return Response.json(
      {
        error: "invalid_request",
        error_description: "Missing required parameters: client_id, redirect_uri, response_type",
      },
      { status: 400 },
    )
  }

  if (responseType !== "code") {
    return Response.json(
      {
        error: "unsupported_response_type",
        error_description: "Only 'code' response type is supported",
      },
      { status: 400 },
    )
  }

  // PKCE is required for OAuth 2.1
  if (!codeChallenge || codeChallengeMethod !== "S256") {
    return Response.json(
      {
        error: "invalid_request",
        error_description: "PKCE with S256 code challenge method is required",
      },
      { status: 400 },
    )
  }

  const supabase = await createServerSupabaseClient()

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
        error_description: "Unknown or inactive client",
      },
      { status: 401 },
    )
  }

  // Validate redirect URI
  const allowedUris = client.redirect_uris || []
  if (!allowedUris.includes(redirectUri)) {
    return Response.json(
      {
        error: "invalid_request",
        error_description: "Invalid redirect_uri",
      },
      { status: 400 },
    )
  }

  // Check user session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    // Store auth request and redirect to login
    const authRequestId = crypto.randomUUID()

    await supabase.from("oauth_auth_requests").insert({
      id: authRequestId,
      client_id: clientId,
      redirect_uri: redirectUri,
      scope,
      state,
      code_challenge: codeChallenge,
      code_challenge_method: codeChallengeMethod,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 min
    })

    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("oauth_request", authRequestId)

    return redirect(loginUrl.toString())
  }

  // Generate authorization code
  const authCode = crypto.randomBytes(32).toString("hex")

  await supabase.from("oauth_authorization_codes").insert({
    code: authCode,
    client_id: clientId,
    user_id: user.id,
    redirect_uri: redirectUri,
    scope,
    code_challenge: codeChallenge,
    code_challenge_method: codeChallengeMethod,
    expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 min
  })

  const callbackUrl = new URL(redirectUri)
  callbackUrl.searchParams.set("code", authCode)
  if (state) {
    callbackUrl.searchParams.set("state", state)
  }

  return redirect(callbackUrl.toString())
}
