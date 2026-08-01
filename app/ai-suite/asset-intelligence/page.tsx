import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from 'next/navigation'
import { AssetIntelligenceClient } from "@/components/ai-suite/asset-intelligence-client"
import { ErrorBoundary } from "@/components/error-boundary"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Asset Intelligence - Kronova",
  description: "AI-powered asset lifecycle management with real-time tracking and predictive analytics",
}

export default async function AssetIntelligencePage() {
  let supabase
  try {
    supabase = await createServerSupabaseClient()
  } catch (error) {
    console.log("[v0] AssetIntelligencePage: Failed to create Supabase client:", error)
    redirect("/login")
  }

  if (!supabase) {
    console.log("[v0] AssetIntelligencePage: Supabase client not available, redirecting to login")
    redirect("/login")
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/login")
    }

    const { data: assets, error: assetsError } = await supabase
      .from("assets")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (assetsError) {
      console.error("[v0] AssetIntelligencePage: Error fetching assets:", assetsError)
    }

    const { data: aiModels, error: aiModelsError } = await supabase
      .from("ai_models")
      .select("*")
      .order("name", { ascending: true })

    if (aiModelsError) {
      console.error("[v0] AssetIntelligencePage: Error fetching AI models:", aiModelsError)
    }

    const { data: aiAgents, error: aiAgentsError } = await supabase
      .from("ai_agents")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (aiAgentsError) {
      console.error("[v0] AssetIntelligencePage: Error fetching AI agents:", aiAgentsError)
    }

    const { data: workflows, error: workflowsError } = await supabase
      .from("ai_workflows")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (workflowsError) {
      console.error("[v0] AssetIntelligencePage: Error fetching workflows:", workflowsError)
    }

    console.log("[v0] AssetIntelligencePage: Data fetched on server:", {
      assetsCount: assets?.length || 0,
      modelsCount: aiModels?.length || 0,
      agentsCount: aiAgents?.length || 0,
      workflowsCount: workflows?.length || 0,
    })

    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <main className="flex-1 container mx-auto py-8 px-4">
          <ErrorBoundary fallbackMessage="Failed to load Asset Intelligence">
            <AssetIntelligenceClient
              initialAssets={assets || []}
              user={user}
              aiModels={aiModels || []}
              aiAgents={aiAgents || []}
              workflows={workflows || []}
            />
          </ErrorBoundary>
        </main>
      </div>
    )
  } catch (error) {
    console.error("[v0] AssetIntelligencePage: Error accessing Supabase:", error)
    redirect("/login")
  }
}
