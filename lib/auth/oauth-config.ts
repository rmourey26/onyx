/**
 * OAuth 2.1 Configuration
 * Supports both Custom and Supabase Native OAuth implementations
 */

export type OAuthMode = "custom" | "supabase"

export interface OAuthConfig {
  mode: OAuthMode
  customEndpoints?: {
    authorize: string
    token: string
    revoke: string
    discovery: string
  }
  supabaseEndpoints?: {
    authorize: string
    token: string
    jwks: string
    discovery: string
  }
}

/**
 * Get the current OAuth mode from environment or default to Supabase
 */
export function getOAuthMode(): OAuthMode {
  const mode = process.env.NEXT_PUBLIC_AUTH_PROVIDER as OAuthMode
  return mode === "custom" ? "custom" : "supabase"
}

/**
 * Get OAuth configuration based on current mode
 */
export function getOAuthConfig(): OAuthConfig {
  const mode = getOAuthMode()
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""

  if (mode === "custom") {
    return {
      mode: "custom",
      customEndpoints: {
        authorize: `${baseUrl}/api/v1/oauth/authorize`,
        token: `${baseUrl}/api/v1/oauth/token`,
        revoke: `${baseUrl}/api/v1/oauth/revoke`,
        discovery: `${baseUrl}/.well-known/oauth-authorization-server`,
      },
    }
  }

  return {
    mode: "supabase",
    supabaseEndpoints: {
      authorize: `${supabaseUrl}/auth/v1/oauth/authorize`,
      token: `${supabaseUrl}/auth/v1/oauth/token`,
      jwks: `${supabaseUrl}/auth/v1/.well-known/jwks.json`,
      discovery: `${supabaseUrl}/.well-known/oauth-authorization-server/auth/v1`,
    },
  }
}

/**
 * Get authorization endpoint URL based on current mode
 */
export function getAuthorizationEndpoint(): string {
  const config = getOAuthConfig()
  if (config.mode === "custom") {
    return config.customEndpoints!.authorize
  }
  return config.supabaseEndpoints!.authorize
}

/**
 * Get token endpoint URL based on current mode
 */
export function getTokenEndpoint(): string {
  const config = getOAuthConfig()
  if (config.mode === "custom") {
    return config.customEndpoints!.token
  }
  return config.supabaseEndpoints!.token
}

/**
 * Get discovery endpoint URL based on current mode
 */
export function getDiscoveryEndpoint(): string {
  const config = getOAuthConfig()
  if (config.mode === "custom") {
    return config.customEndpoints!.discovery
  }
  return config.supabaseEndpoints!.discovery
}

/**
 * Build authorization URL with proper endpoint based on mode
 */
export function buildAuthorizationURL(params: {
  client_id: string
  redirect_uri: string
  scope: string[]
  state?: string
  code_challenge: string
  code_challenge_method: "S256"
}): string {
  const authEndpoint = getAuthorizationEndpoint()
  const url = new URL(authEndpoint)

  url.searchParams.set("client_id", params.client_id)
  url.searchParams.set("redirect_uri", params.redirect_uri)
  url.searchParams.set("response_type", "code")
  url.searchParams.set("scope", params.scope.join(" "))
  url.searchParams.set("code_challenge", params.code_challenge)
  url.searchParams.set("code_challenge_method", params.code_challenge_method)

  if (params.state) {
    url.searchParams.set("state", params.state)
  }

  return url.toString()
}

/**
 * Exchange authorization code for access token
 * Works with both OAuth modes
 */
export async function exchangeCodeForTokens(params: {
  code: string
  client_id: string
  client_secret?: string
  redirect_uri: string
  code_verifier: string
}): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const tokenEndpoint = getTokenEndpoint()

    const response = await fetch(tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code: params.code,
        client_id: params.client_id,
        client_secret: params.client_secret,
        redirect_uri: params.redirect_uri,
        code_verifier: params.code_verifier,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error_description || data.error || "Token exchange failed",
      }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error("[v0] Exception exchanging code for tokens:", error)
    return { success: false, error: error.message }
  }
}
