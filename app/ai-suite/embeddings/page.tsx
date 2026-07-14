import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { EmbeddingsClient } from "./embeddings-client"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AI Embeddings Management",
  description: "Manage your AI embeddings and RAG settings",
}

export const dynamic = "force-dynamic"

export default async function EmbeddingsPage() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: embeddings, error: embeddingsError } = await supabase
    .from("data_embeddings")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (embeddingsError) {
    console.error("Error fetching embeddings:", embeddingsError)
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
    .order("name", { ascending: true })

  if (aiAgentsError) {
    console.error("Error fetching AI agents:", aiAgentsError)
  }

  const { data: embeddingJobs, error: jobsError } = await supabase
    .from("embedding_jobs")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10)

  if (jobsError) {
    console.error("Error fetching embedding jobs:", jobsError)
  }

  const { data: userSettings, error: settingsError } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", user.id)
    .eq("settings_type", "embeddings")
    .maybeSingle()

  if (settingsError) {
    console.error("Error fetching user settings:", settingsError)
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Embeddings Management
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage AI embeddings, RAG configurations, and vector search settings
        </p>
      </div>

      <EmbeddingsClient
        user={user}
        embeddings={embeddings || []}
        aiModels={aiModels || []}
        aiAgents={aiAgents || []}
        embeddingJobs={embeddingJobs || []}
        userSettings={userSettings?.settings || null}
      />
    </div>
  )
}
