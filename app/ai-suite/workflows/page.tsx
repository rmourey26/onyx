import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AIWorkflowsList } from "@/components/ai-suite/ai-workflows-list"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "AI Workflows - Resend-It",
  description: "Manage your AI workflows",
}

export default async function AIWorkflowsPage() {
  let supabase
  try {
    supabase = await createServerSupabaseClient()
  } catch (error) {
    console.log("AIWorkflowsPage: Failed to create Supabase client:", error)
    redirect("/login")
  }

  if (!supabase) {
    console.log("AIWorkflowsPage: Supabase client not available, redirecting to login")
    redirect("/login")
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/login")
    }

    const { data: workflows, error: workflowsError } = await supabase
      .from("ai_workflows")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (workflowsError) {
      console.error("Error fetching workflows:", workflowsError)
    }

    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 container mx-auto py-8 px-4">
          <AIWorkflowsList workflows={workflows || []} user={user} />
        </main>
      </div>
    )
  } catch (error) {
    console.error("AIWorkflowsPage: Error accessing Supabase:", error)
    redirect("/login")
  }
}
