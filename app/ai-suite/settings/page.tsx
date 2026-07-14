import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SettingsClient } from "./settings-client"
import { getProfile } from "@/app/actions/profile"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const profile = await getProfile(user.id)

  return <SettingsClient user={user} profile={profile} />
}
