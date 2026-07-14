/**
 * Kronova OAuth 2.1 AI Agent System
 * Enterprise-grade OAuth for platform, marketplace, and AI-native apps
 * with MCP and AetherNet integration
 */

import { createServerSupabaseClient } from "@/lib/supabase/server"

export interface KronovaOAuthConfig {
  clientId: string
  clientSecret?: string
  redirectUris: string[]
  scopes: string[]
  agentId?: string
  clientType?: "public" | "confidential"
}

export interface OAuthAuthorizationRequest {
  userId: string
  scope: string[]
  state?: string
  codeChallenge: string
  nonce?: string
}

export interface OAuthTokenResponse {
  access_token: string
  token_type: "Bearer"
  expires_in: number
  refresh_token?: string
  scope: string
  id_token?: string
}

export class KronovaOAuthAgent {
  private supabase: any
  private config: KronovaOAuthConfig
  private initialized = false

  constructor(config: KronovaOAuthConfig) {
    this.config = config
  }

  async initialize(): Promise<void> {
    if (this.initialized) return
    this.supabase = await createServerSupabaseClient()
    this.initialized = true
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error("KronovaOAuthAgent not initialized. Call initialize() first.")
    }
  }

  /**
   * Register OAuth application for AI agent
   */
  async registerApplication(params: {
    name: string
    description: string
    icon_url?: string
    website_url?: string
    privacy_policy_url?: string
    terms_of_service_url?: string
  }): Promise<{
    client_id: string
    client_secret: string | null
    redirect_uris: string[]
    allowed_scopes: string[]
  }> {
    this.ensureInitialized()

    const { data, error } = await this.supabase.rpc("register_oauth_client", {
      p_client_name: params.name,
      p_client_description: params.description,
      p_redirect_uris: this.config.redirectUris,
      p_allowed_scopes: this.config.scopes,
      p_client_type: this.config.clientType || "public",
      p_icon_url: params.icon_url,
      p_website_url: params.website_url,
      p_privacy_policy_url: params.privacy_policy_url,
      p_terms_of_service_url: params.terms_of_service_url,
    })

    if (error) {
      throw new Error(`Failed to register OAuth application: ${error.message}`)
    }

    return {
      client_id: data.client_id,
      client_secret: data.client_secret,
      redirect_uris: data.redirect_uris,
      allowed_scopes: data.allowed_scopes,
    }
  }

  /**
   * Request authorization from user with PKCE
   */
  async requestAuthorization(params: OAuthAuthorizationRequest): Promise<{
    code: string
    redirect_uri: string
    state?: string
  }> {
    this.ensureInitialized()

    const { data, error } = await this.supabase.rpc("create_authorization_code", {
      p_client_id: this.config.clientId,
      p_user_id: params.userId,
      p_redirect_uri: this.config.redirectUris[0],
      p_scope: params.scope,
      p_code_challenge: params.codeChallenge,
      p_code_challenge_method: "S256",
      p_nonce: params.nonce,
    })

    if (error) {
      throw new Error(`Failed to create authorization code: ${error.message}`)
    }

    return {
      code: data,
      redirect_uri: this.config.redirectUris[0],
      state: params.state,
    }
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCode(params: {
    code: string
    codeVerifier: string
  }): Promise<OAuthTokenResponse> {
    this.ensureInitialized()

    const { data, error } = await this.supabase.rpc("exchange_authorization_code", {
      p_code: params.code,
      p_client_id: this.config.clientId,
      p_client_secret: this.config.clientSecret,
      p_redirect_uri: this.config.redirectUris[0],
      p_code_verifier: params.codeVerifier,
    })

    if (error) {
      throw new Error(`Failed to exchange authorization code: ${error.message}`)
    }

    return data
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<OAuthTokenResponse> {
    this.ensureInitialized()

    const { data, error } = await this.supabase.rpc("refresh_oauth_token", {
      p_refresh_token: refreshToken,
      p_client_id: this.config.clientId,
      p_client_secret: this.config.clientSecret,
    })

    if (error) {
      throw new Error(`Failed to refresh token: ${error.message}`)
    }

    return data
  }

  /**
   * Revoke token (access or refresh)
   */
  async revokeToken(token: string, tokenTypeHint?: "access_token" | "refresh_token"): Promise<void> {
    this.ensureInitialized()

    const { error } = await this.supabase.rpc("revoke_oauth_token", {
      p_token: token,
      p_token_type_hint: tokenTypeHint,
      p_client_id: this.config.clientId,
    })

    if (error) {
      throw new Error(`Failed to revoke token: ${error.message}`)
    }
  }

  /**
   * Introspect token to get metadata
   */
  async introspectToken(token: string): Promise<{
    active: boolean
    scope?: string
    client_id?: string
    username?: string
    exp?: number
    iat?: number
    sub?: string
  }> {
    this.ensureInitialized()

    const { data, error } = await this.supabase.rpc("introspect_oauth_token", {
      p_token: token,
      p_client_id: this.config.clientId,
      p_client_secret: this.config.clientSecret,
    })

    if (error) {
      return { active: false }
    }

    return data
  }

  /**
   * Execute agent with OAuth context
   */
  async executeWithOAuth(params: {
    agentId: string
    query: string
    accessToken: string
    mcpContext?: Record<string, any>
  }): Promise<{
    agent_id: string
    query: string
    oauth_context: {
      access_token: string
      client_id: string
      scopes: string[]
    }
    mcp_context?: Record<string, any>
  }> {
    return {
      agent_id: params.agentId,
      query: params.query,
      oauth_context: {
        access_token: params.accessToken,
        client_id: this.config.clientId,
        scopes: this.config.scopes,
      },
      mcp_context: params.mcpContext,
    }
  }

  /**
   * Get available MCP context sources for agent
   */
  async getMCPContextSources(agentId: string): Promise<any[]> {
    this.ensureInitialized()

    const { data, error } = await this.supabase
      .from("ai_agent_contexts")
      .select("*")
      .eq("agent_id", agentId)
      .eq("is_active", true)

    if (error) {
      throw new Error(`Failed to fetch MCP contexts: ${error.message}`)
    }

    return data || []
  }

  /**
   * Send message via AetherNet with OAuth authentication
   */
  async sendAetherNetMessage(params: {
    accessToken: string
    recipients: string[]
    subject: string
    body: string
    priority?: "low" | "normal" | "high" | "critical"
    encrypted?: boolean
  }): Promise<{ messageId: string }> {
    this.ensureInitialized()

    // Verify token first
    const tokenInfo = await this.introspectToken(params.accessToken)
    if (!tokenInfo.active) {
      throw new Error("Invalid or expired access token")
    }

    // Check for aethernet:write scope
    const scopes = tokenInfo.scope?.split(" ") || []
    if (!scopes.includes("aethernet:write")) {
      throw new Error("Token does not have aethernet:write scope")
    }

    const { data, error } = await this.supabase.rpc("send_aethernet_message", {
      p_subject: params.subject,
      p_body: params.body,
      p_recipients: params.recipients,
      p_priority: params.priority || "normal",
      p_encrypted: params.encrypted || true,
      p_oauth_client_id: this.config.clientId,
    })

    if (error) {
      throw new Error(`Failed to send AetherNet message: ${error.message}`)
    }

    return { messageId: data }
  }
}

/**
 * PKCE Helper Functions
 */
export function generateCodeVerifier(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "")
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const digest = await crypto.subtle.digest("SHA-256", data)
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "")
}

/**
 * Factory function to create marketplace OAuth app
 */
export async function createMarketplaceOAuthApp(params: {
  name: string
  description: string
  developer_id: string
  category: string
  icon_url?: string
}): Promise<{
  listing: any
  oauth_credentials: {
    client_id: string
    client_secret: string | null
  }
}> {
  const supabase = await createServerSupabaseClient()
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || ""

  const { data: oauthClient, error: oauthError } = await supabase.rpc("register_oauth_client", {
    p_client_name: params.name,
    p_client_description: params.description,
    p_redirect_uris: [`${baseUrl}/marketplace/oauth/callback`],
    p_allowed_scopes: ["marketplace.read", "marketplace.execute", "user.profile", "mcp:execute"],
    p_client_type: "confidential",
    p_icon_url: params.icon_url,
  })

  if (oauthError) {
    throw new Error(`Failed to create OAuth client: ${oauthError.message}`)
  }

  const { data: listing, error: listingError } = await supabase
    .from("marketplace_agents")
    .insert({
      name: params.name,
      description: params.description,
      developer_id: params.developer_id,
      category: params.category,
      oauth_client_id: oauthClient.client_id,
      status: "pending",
    })
    .select()
    .single()

  if (listingError) {
    throw new Error(`Failed to create marketplace listing: ${listingError.message}`)
  }

  return {
    listing,
    oauth_credentials: {
      client_id: oauthClient.client_id,
      client_secret: oauthClient.client_secret,
    },
  }
}

/**
 * Connect user to OAuth app with PKCE flow
 */
export async function connectOAuthApp(params: {
  userId: string
  clientId: string
  scopes: string[]
}): Promise<{
  authorization_url: string
  code_verifier: string
}> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || ""

  const agent = new KronovaOAuthAgent({
    clientId: params.clientId,
    redirectUris: [`${baseUrl}/oauth/callback`],
    scopes: params.scopes,
  })

  await agent.initialize()

  const codeVerifier = generateCodeVerifier()
  const codeChallenge = await generateCodeChallenge(codeVerifier)

  const authResult = await agent.requestAuthorization({
    userId: params.userId,
    scope: params.scopes,
    codeChallenge,
  })

  const authUrl = new URL(`${baseUrl}/api/v1/oauth/authorize`)
  authUrl.searchParams.set("client_id", params.clientId)
  authUrl.searchParams.set("redirect_uri", `${baseUrl}/oauth/callback`)
  authUrl.searchParams.set("response_type", "code")
  authUrl.searchParams.set("scope", params.scopes.join(" "))
  authUrl.searchParams.set("code_challenge", codeChallenge)
  authUrl.searchParams.set("code_challenge_method", "S256")

  return {
    authorization_url: authUrl.toString(),
    code_verifier: codeVerifier,
  }
}
