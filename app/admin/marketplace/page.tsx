import type { Metadata } from "next"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MarketplaceAdminDashboard } from "./marketplace-admin-dashboard"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Marketplace Admin - AI Agent Marketplace",
  description: "Admin dashboard for managing the AI agent marketplace",
}

export default async function MarketplaceAdminPage() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Check if user is admin (you can implement your own admin check logic)
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || !profile.is_admin) {
    redirect("/")
  }

  // Fetch marketplace statistics
  const [
    { data: agents, count: totalAgents },
    { data: users, count: totalUsers },
    { data: purchases, count: totalPurchases },
    { data: reviews, count: totalReviews },
  ] = await Promise.all([
    supabase.from("marketplace_agents").select("*", { count: "exact" }),
    supabase.from("profiles").select("*", { count: "exact" }),
    supabase.from("agent_purchases").select("*", { count: "exact" }),
    supabase.from("agent_reviews").select("*", { count: "exact" }),
  ])

  const { data: allUsers } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, is_admin, created_at, avatar_url")
    .order("created_at", { ascending: false })

  // Calculate revenue
  const { data: revenueData } = await supabase.from("agent_purchases").select("amount").not("amount", "is", null)

  const totalRevenue = revenueData?.reduce((sum, purchase) => sum + (purchase.amount || 0), 0) || 0

  // Get recent activity
  const { data: recentPurchases } = await supabase
    .from("agent_purchases")
    .select(`
      *,
      profiles (full_name, email),
      marketplace_agents (name)
    `)
    .order("created_at", { ascending: false })
    .limit(10)

  const { data: pendingAgents } = await supabase
    .from("marketplace_agents")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto py-8 px-4 max-w-7xl">
        <MarketplaceAdminDashboard
          stats={{
            totalAgents: totalAgents || 0,
            totalUsers: totalUsers || 0,
            totalPurchases: totalPurchases || 0,
            totalReviews: totalReviews || 0,
            totalRevenue,
          }}
          agents={agents || []}
          recentPurchases={recentPurchases || []}
          pendingAgents={pendingAgents || []}
          allUsers={allUsers || []}
          user={user}
        />
      </main>
    </div>
  )
}
