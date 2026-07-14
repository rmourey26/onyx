import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AgentChatInterface } from "@/components/marketplace/agent-chat-interface"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Agent Chat - AI Marketplace",
  description: "Chat with your purchased AI agent",
}

interface AgentChatPageProps {
  params: Promise<{ id: string }>
}

export default async function AgentChatPage({ params }: AgentChatPageProps) {
  const resolvedParams = await params
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login")
  }

  // Fetch the agent details
  const { data: agent, error: agentError } = await supabase
    .from("marketplace_agents")
    .select("*")
    .eq("id", resolvedParams.id)
    .single()

  if (agentError || !agent) {
    return redirect("/marketplace")
  }

  // Check if user has purchased this agent
  const { data: purchase } = await supabase
    .from("agent_purchases")
    .select("*")
    .eq("user_id", user.id)
    .eq("agent_id", resolvedParams.id)
    .single()

  const isPurchased = !!purchase

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <AgentChatInterface
        agent={agent}
        user={user}
        isPurchased={isPurchased}
        onPurchase={(agentId) => {
          // Handle purchase logic - redirect to checkout
          window.location.href = `/marketplace/agents/${agentId}/purchase`
        }}
      />
    </div>
  )
}
