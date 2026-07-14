"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

/**
 * Create OAuth 2.1 enabled AI agent
 */
export async function createOAuthAgent(params: {
  name: string
  description: string
  system_prompt: string
  tools: string[]
  model_id?: string
  oauth_scopes?: string[]
  redirect_uris?: string[]
}) {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    // Create OAuth client for the agent
    const { data: oauthClient, error: oauthError } = await supabase.rpc("register_oauth_client", {
      p_client_name: `AI Agent: ${params.name}`,
      p_client_description: params.description,
      p_redirect_uris: params.redirect_uris || [`${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/callback`],
      p_allowed_scopes: params.oauth_scopes || ["read", "write", "execute"],
    })

    if (oauthError) {
      console.error("[v0] Error creating OAuth client:", oauthError)
      return { success: false, error: oauthError.message }
    }

    // Create AI agent
    const { data: agent, error: agentError } = await supabase
      .from("ai_agents")
      .insert({
        user_id: user.id,
        name: params.name,
        description: params.description,
        system_prompt: params.system_prompt,
        tools: params.tools,
        model_id: params.model_id || "gpt-4o",
        parameters: {
          temperature: 0.7,
          max_tokens: 2000,
          oauth_client_id: oauthClient.client_id,
        },
        is_active: true,
      })
      .select()
      .single()

    if (agentError) {
      console.error("[v0] Error creating agent:", agentError)
      return { success: false, error: agentError.message }
    }

    revalidatePath("/ai-suite/agents")
    return { success: true, data: { agent, oauthClient } }
  } catch (error: any) {
    console.error("[v0] Exception in createOAuthAgent:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Add context to AI agent
 */
export async function addAgentContext(params: {
  agent_id: string
  context_type: "mcp" | "api" | "cloud_native" | "sui" | "canton" | "ethereum" | "bitcoin" | "solana" | "aethernet"
  context_name: string
  context_config: Record<string, any>
  oauth_client_id?: string
}) {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    const { data: context, error } = await supabase
      .from("ai_agent_contexts")
      .insert({
        user_id: user.id,
        agent_id: params.agent_id,
        context_type: params.context_type,
        context_name: params.context_name,
        context_config: params.context_config,
        oauth_client_id: params.oauth_client_id,
        connection_status: "pending",
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error adding agent context:", error)
      return { success: false, error: error.message }
    }

    revalidatePath(`/ai-suite/agents/${params.agent_id}`)
    return { success: true, data: context }
  } catch (error: any) {
    console.error("[v0] Exception in addAgentContext:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Connect blockchain to agent context
 */
export async function connectBlockchain(params: {
  blockchain_type: "sui" | "canton" | "ethereum" | "bitcoin" | "solana"
  network: string
  connection_name: string
  wallet_address?: string
  rpc_endpoint?: string
  connection_config?: Record<string, any>
}) {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    const { data: connection, error } = await supabase
      .from("blockchain_connections")
      .insert({
        user_id: user.id,
        blockchain_type: params.blockchain_type,
        network: params.network,
        connection_name: params.connection_name,
        wallet_address: params.wallet_address,
        rpc_endpoint: params.rpc_endpoint,
        connection_config: params.connection_config || {},
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error connecting blockchain:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/ai-suite/settings/contexts")
    return { success: true, data: connection }
  } catch (error: any) {
    console.error("[v0] Exception in connectBlockchain:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Connect to AetherNet
 */
export async function connectAetherNet(params: {
  connection_name: string
  aethernet_address: string
  network_type?: string
}) {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    // Generate keypair for AetherNet (in real implementation, use proper crypto)
    const publicKey = `aether_pub_${Math.random().toString(36).substring(7)}`
    const privateKeyEncrypted = `aether_priv_${Math.random().toString(36).substring(7)}_encrypted`

    const { data: connection, error } = await supabase
      .from("aethernet_connections")
      .insert({
        user_id: user.id,
        connection_name: params.connection_name,
        aethernet_address: params.aethernet_address,
        public_key: publicKey,
        private_key_encrypted: privateKeyEncrypted,
        network_type: params.network_type || "mainnet",
        connection_status: "pending",
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error connecting to AetherNet:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/ai-suite/settings/aethernet")
    return { success: true, data: connection }
  } catch (error: any) {
    console.error("[v0] Exception in connectAetherNet:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Test AetherNet connection
 */
export async function testAetherNetConnection(connectionId: string) {
  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase.rpc("test_aethernet_connection", {
      p_connection_id: connectionId,
    })

    if (error) {
      console.error("[v0] Error testing AetherNet connection:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/ai-suite/settings/aethernet")
    return { success: true, data }
  } catch (error: any) {
    console.error("[v0] Exception in testAetherNetConnection:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Get agent contexts
 */
export async function getAgentContexts(agentId: string) {
  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from("ai_agent_contexts")
      .select("*")
      .eq("agent_id", agentId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching agent contexts:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error("[v0] Exception in getAgentContexts:", error)
    return { success: false, error: error.message }
  }
}
