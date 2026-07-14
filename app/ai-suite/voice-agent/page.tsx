import { createServerSupabaseClient } from "@/lib/supabase/server"
import { VoiceAgentDashboard } from "@/components/voice/voice-agent-dashboard"
import { redirect } from "next/navigation"

export default async function VoiceAgentPage() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get user's voice sessions
  const { data: sessions } = await supabase
    .from("voice_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10)

  // Get AetherNet connection status
  const { data: aethernetConnection } = await supabase
    .from("aethernet_connections")
    .select("*")
    .eq("user_id", user.id)
    .eq("connection_status", "active")
    .maybeSingle()

  return (
    <VoiceAgentDashboard
      userId={user.id}
      initialSessions={sessions || []}
      hasAetherNet={!!aethernetConnection}
      aethernetConnection={aethernetConnection}
    />
  )
}
