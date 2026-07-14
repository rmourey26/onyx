import type { Metadata } from "next"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AgentDashboard } from "@/components/agents/agent-dashboard"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Agent Dashboard - AI Agent Management",
  description: "Monitor and manage your deployed AI agents with real-time performance metrics.",
}

export default async function AgentDashboardPage() {
  let supabase
  try {
    supabase = await createServerSupabaseClient()
  } catch (error) {
    console.log("[v0] AgentDashboardPage: Failed to create Supabase client:", error)
    redirect("/login")
  }

  if (!supabase) {
    console.log("[v0] AgentDashboardPage: Supabase client not available, redirecting to login")
    redirect("/login")
  }

  try {
    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // If no user, redirect to login
    if (!user) {
      redirect("/login")
    }

    // Fetch user's deployed agents with performance metrics
    const { data: deployedAgents, error: agentsError } = await supabase
      .from("deployed_agents")
      .select(`
        *,
        ai_agents (
          id,
          name,
          description,
          system_prompt,
          model_id,
          ai_models (
            name,
            provider
          )
        ),
        agent_metrics (
          total_requests,
          successful_requests,
          failed_requests,
          avg_response_time,
          last_request_at,
          created_at
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (agentsError) {
      console.error("Error fetching deployed agents:", agentsError)
    }

    // Fetch recent agent activity
    const { data: recentActivity, error: activityError } = await supabase
      .from("agent_activity_logs")
      .select(`
        *,
        deployed_agents (
          agent_name,
          ai_agents (
            name
          )
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50)

    if (activityError) {
      console.error("Error fetching agent activity:", activityError)
    }

    return (
      <div className="min-h-screen bg-background">
        <AgentDashboard deployedAgents={deployedAgents || []} recentActivity={recentActivity || []} user={user} />
      </div>
    )
  } catch (error) {
    console.error("[v0] AgentDashboardPage: Error accessing Supabase:", error)
    redirect("/login")
  }
}
