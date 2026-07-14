import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { OAuthSettingsClient } from "./oauth-settings-client"

export default async function OAuthSettingsPage() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/signin")
  }

  const { data: oauthClients, error } = await supabase.rpc("get_user_oauth_clients")

  if (error) {
    console.error("[v0] Error fetching OAuth clients:", error)
  }

  return <OAuthSettingsClient oauthClients={oauthClients || []} userId={user.id} />
}
