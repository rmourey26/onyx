import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AssetTokenizationDashboard } from "@/components/tokenization/asset-tokenization-dashboard"

export const dynamic = "force-dynamic"

export default async function TokenizationPage() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto p-4 lg:p-6">
      <AssetTokenizationDashboard userId={user.id} />
    </div>
  )
}
