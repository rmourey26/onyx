import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AgentManagementDashboard } from "./agent-dashboard"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "My AI Agents - AI Marketplace",
  description: "Manage and interact with your purchased AI agents",
}

export default async function MyAgentsPage() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login")
  }

  // Fetch user's purchased agents
  const { data: purchases, error } = await supabase
    .from("agent_purchases")
    .select(`
      *,
      marketplace_agents (
        id,
        name,
        description,
        avatar_url,
        category,
        rating,
        price,
        creator_name,
        capabilities
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching purchased agents:", error)
  }

  const purchasedAgents =
    purchases?.map((purchase) => ({
      ...purchase.marketplace_agents,
      purchase_date: purchase.created_at,
      last_interaction: purchase.last_interaction,
      total_interactions: purchase.total_interactions || 0,
    })) || []

  return <AgentManagementDashboard />
}
