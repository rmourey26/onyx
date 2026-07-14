import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MarketplaceSubscriptionsClient } from "./subscriptions-client"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Marketplace Subscriptions - AI Agent Marketplace",
  description: "Subscribe to premium AI agents and unlock advanced marketplace features.",
}

export default async function MarketplaceSubscriptionsPage() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login")
  }

  // Fetch current subscription
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*, prices(*, products(*))")
    .eq("user_id", user.id)
    .in("status", ["trialing", "active"])
    .maybeSingle()

  // Fetch marketplace-specific products
  const { data: products } = await supabase
    .from("products")
    .select("*, prices(*)")
    .eq("active", true)
    .or("metadata->>category.eq.marketplace,metadata->>category.eq.agents")
    .order("metadata->index")

  // Fetch user's purchased agents
  const { data: purchasedAgents } = await supabase
    .from("agent_purchases")
    .select("*, marketplace_agents(*)")
    .eq("user_id", user.id)
    .eq("status", "completed")

  // Fetch user's deployed agents count
  const { count: deployedAgents } = await supabase
    .from("ai_agents")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_active", true)

  return (
    <MarketplaceSubscriptionsClient
      user={user}
      subscription={subscription}
      products={products || []}
      purchasedAgents={purchasedAgents || []}
      deployedAgents={deployedAgents || 0}
    />
  )
}
