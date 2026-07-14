import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AetherNetOAuthMCPDashboard } from "@/components/aethernet/aethernet-oauth-mcp-dashboard"

export default async function AetherNetOAuthMCPPage() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/signin")
  }

  const { data: oauthClients } = await supabase
    .from("oauth_clients")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const { data: oauthAgents } = await supabase
    .from("ai_agents")
    .select("*, ai_agent_contexts(*)")
    .eq("user_id", user.id)
    .contains("parameters", { oauth_client_id: "" })
    .order("created_at", { ascending: false })

  const { data: aethernetConnections } = await supabase
    .from("aethernet_connections")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const { data: executionStats } = await supabase
    .from("agent_executions")
    .select("status, created_at")
    .eq("user_id", user.id)
    .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

  const { data: aethernetMessages } = await supabase
    .from("aethernet_messages")
    .select("*")
    .eq("sender_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50)

  return (
    <AetherNetOAuthMCPDashboard
      user={user}
      oauthClients={oauthClients || []}
      oauthAgents={oauthAgents || []}
      aethernetConnections={aethernetConnections || []}
      executionStats={executionStats || []}
      aethernetMessages={aethernetMessages || []}
    />
  )
}
