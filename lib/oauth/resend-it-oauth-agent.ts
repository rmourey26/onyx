/**
 * Kronova OAuth 2.1 AI Agent System
 * Enables platform, marketplace, and users to build AI native apps
 * with OAuth-connected integrations
 */

import { createServerSupabaseClient } from "@/lib/supabase/server"

/** @deprecated Use KronovaOAuthConfig instead. */
export type ResendItOAuthConfig = KronovaOAuthConfig

export class KronovaOAuthAgent {
  private supabase: any
  private config: KronovaOAuthConfig

  constructor(config: KronovaOAuthConfig) {
    this.config = config
  }

  async initialize() {
    this.supabase = await createServerSupabaseClient()
  }

  /**
   * Register OAuth application for AI agent
   */
  async registerApplication(params: {
    name: string
    description: string
    icon_url?: string
  }) {
    const { data, error } = await this.supabase.rpc("register_oauth_client", {
      p_client_name: params.name,
      p_client_description: params.description,
      p_redirect_uris: this.config.redirectUris,
      p_allowed_scopes: this.config.scopes,
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
   * Request authorization from user
   */
  async requestAuthorization(params: {
    userId: string
    scope: string[]
    state?: string
    codeChallenge: string
  }) {
    const { data, error } = await this.supabase.rpc("create_authorization_code", {
      p_client_id: this.config.clientId,
      p_user_id: params.userId,
      p_redirect_uri: this.config.redirectUris[0],
      p_scope: params.scope,
      p_code_challenge: params.codeChallenge,
      p_code_challenge_method: "S256",
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
  async exchangeCode(params: { code: string; codeVerifier: string }) {
    const { data, error } = await this.supabase.rpc("exchange_authorization_code", {
      p_code: params.code,
      p_client_id: this.config.clientId,
      p_redirect_uri: this.config.redirectUris[0],
      p_code_verifier: params.codeVerifier,
    })

    if (error) {
      throw new Error(`Failed to exchange authorization code: ${error.message}`)
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
  }) {
    // Agent execution with OAuth context is handled by the main agent system
    // This method prepares the OAuth context for the agent

    return {
      agent_id: params.agentId,
      query: params.query,
      oauth_context: {
        access_token: params.accessToken,
        client_id: this.config.clientId,
        scopes: this.config.scopes,
      },
    }
  }

  /**
   * Get available context sources for agent
   */
  async getAvailableContexts(agentId: string) {
    const { data, error } = await this.supabase
      .from("ai_agent_contexts")
      .select("*")
      .eq("agent_id", agentId)
      .eq("is_active", true)

    if (error) {
      throw new Error(`Failed to fetch agent contexts: ${error.message}`)
    }

    return data
  }
}

/**
 * Helper functions for OAuth agent integration
 */

export async function createMarketplaceOAuthApp(params: {
  name: string
  description: string
  developer_id: string
  category: string
}) {
  const supabase = await createServerSupabaseClient()

  // Create OAuth client
  const { data: oauthClient, error: oauthError } = await supabase.rpc("register_oauth_client", {
    p_client_name: params.name,
    p_client_description: params.description,
    p_redirect_uris: [`${process.env.NEXT_PUBLIC_APP_URL}/marketplace/oauth/callback`],
    p_allowed_scopes: ["marketplace.read", "marketplace.execute", "user.profile"],
  })

  if (oauthError) {
    throw new Error(`Failed to create OAuth client: ${oauthError.message}`)
  }

  // Create marketplace listing
  const { data: listing, error: listingError } = await supabase.from("marketplace_agents").insert({
    name: params.name,
    description: params.description,
    developer_id: params.developer_id,
    category: params.category,
    oauth_client_id: oauthClient.client_id,
    status: "pending",
  })

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

export async function connectOAuthApp(params: {
  userId: string
  clientId: string
  scopes: string[]
}) {
  const agent = new KronovaOAuthAgent({
    clientId: params.clientId,
    clientSecret: "", // Not needed for user-side connection
    redirectUris: [`${process.env.NEXT_PUBLIC_APP_URL}/oauth/callback`],
    scopes: params.scopes,
  })

  await agent.initialize()

  // Generate PKCE challenge
  const codeVerifier = generateCodeVerifier()
  const codeChallenge = await generateCodeChallenge(codeVerifier)

  const authResult = await agent.requestAuthorization({
    userId: params.userId,
    scope: params.scopes,
    codeChallenge,
  })

  return {
    authorization_url: `${process.env.NEXT_PUBLIC_APP_URL}/oauth/authorize?code=${authResult.code}`,
    code_verifier: codeVerifier,
  }
}

// PKCE helpers
function generateCodeVerifier(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "")
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const digest = await crypto.subtle.digest("SHA-256", data)
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "")
}
