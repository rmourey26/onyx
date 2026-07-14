import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { TeamsClient } from "./teams-client"

export default async function TeamsPage() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const adminClient = createAdminClient()

  const { data: memberships } = await adminClient
    .from("organization_members")
    .select("*")
    .eq("user_id", user.id)
    .order("joined_at", { ascending: false })

  let organizations = []
  if (memberships && memberships.length > 0) {
    const orgIds = memberships.map((m) => m.organization_id)
    const { data: orgs } = await adminClient
      .from("organizations")
      .select("*")
      .in("id", orgIds)
      .order("created_at", { ascending: false })

    organizations = orgs || []
  }

  const currentMembership = memberships?.[0] || null
  const organization = organizations?.[0] || null

  // Fetch all members if user is part of an organization
  let members = []
  if (currentMembership?.organization_id) {
    const { data: orgMembers } = await adminClient
      .from("organization_members")
      .select("*, profiles:user_id(id, email, full_name, avatar_url)")
      .eq("organization_id", currentMembership.organization_id)
      .order("joined_at", { ascending: false })

    members = orgMembers || []
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("company, full_name, email")
    .eq("id", user.id)
    .maybeSingle()

  return (
    <TeamsClient
      user={user}
      organization={organization}
      organizations={organizations}
      currentMembership={currentMembership}
      members={members}
      userProfile={profile}
    />
  )
}
