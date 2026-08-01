import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AIAgentsList } from "@/components/ai-suite/ai-agents-list"
import { ErrorBoundary } from "@/components/error-boundary"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "AI Agents - Kronova",
  description: "Manage your AI agents",
}

export default async function AIAgentsPage() {
  let supabase
  try {
    supabase = await createServerSupabaseClient()
  } catch (error) {
    console.log("[v0] AIAgentsPage: Failed to create Supabase client:", error)
    redirect("/login")
  }

  if (!supabase) {
    console.log("[v0] AIAgentsPage: Supabase client not available, redirecting to login")
    redirect("/login")
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/login")
    }

    const { data: aiModels, error: aiModelsError } = await supabase
      .from("ai_models")
      .select("*")
      .order("name", { ascending: true })

    if (aiModelsError) {
      console.error("Error fetching AI models:", aiModelsError)
    }

    const { data: aiAgents, error: aiAgentsError } = await supabase
      .from("ai_agents")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (aiAgentsError) {
      console.error("Error fetching AI agents:", aiAgentsError)
    }

    const { data: assets, error: assetsError } = await supabase
      .from("assets")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (assetsError) {
      console.error("[v0] AIAgentsPage: Error fetching assets:", assetsError)
    }

    console.log("[v0] AIAgentsPage: Assets fetched on server:", {
      count: assets?.length || 0,
      error: assetsError,
    })

    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 container mx-auto py-8 px-4">
          <ErrorBoundary fallbackMessage="Failed to load AI Agents">
            <AIAgentsList agents={aiAgents || []} user={user} aiModels={aiModels || []} initialAssets={assets || []} />
          </ErrorBoundary>
        </main>
      </div>
    )
  } catch (error) {
    console.error("[v0] AIAgentsPage: Error accessing Supabase:", error)
    redirect("/login")
  }
}
