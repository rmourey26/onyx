import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SubscriptionsClient } from "./subscriptions-client"
import { getUsageForCurrentPeriod } from "@/app/actions/stripe-actions"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Subscription Management - Kronova Asset Intelligence",
  description: "Manage your Kronova subscription, view usage, and upgrade your plan.",
}

export default async function SubscriptionsPage() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login")
  }

  // Fetch current subscription with usage data
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*, prices(*, products(*))")
    .eq("user_id", user.id)
    .in("status", ["trialing", "active"])
    .maybeSingle()

  // Fetch all available products and prices
  const { data: products } = await supabase
    .from("products")
    .select("*, prices(*)")
    .eq("active", true)
    .order("metadata->index")

  // Fetch user's asset count
  const { count: assetsCount } = await supabase
    .from("assets")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  // Fetch user's active workflows count
  const { count: workflowsCount } = await supabase
    .from("ai_workflows")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_active", true)

  // Fetch live metered token usage for current billing period
  const tokenUsage = await getUsageForCurrentPeriod()

  return (
    <SubscriptionsClient
      user={user}
      subscription={subscription}
      products={products || []}
      assetsCount={assetsCount || 0}
      workflowsCount={workflowsCount || 0}
      tokenUsage={tokenUsage}
    />
  )
}
