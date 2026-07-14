import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardClient } from "./dashboard-client"
import { Navbar } from "@/components/navbar"
import { getProfile } from "@/app/actions/profile"

// Add export const dynamic = 'force-dynamic' to prevent static prerendering
export const dynamic = "force-dynamic"

export const revalidate = 0

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If no user, redirect to login
  if (!user) {
    redirect("/login")
  }

  try {
    // Get the user's profile
    const profile = await getProfile(user.id)

    // Get the user's NFTs
    const { data: nfts, error: nftsError } = await supabase
      .from("nfts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (nftsError) {
      console.error("Error fetching NFTs:", nftsError)
    }

    // Get the user's Sui NFTs
    const { data: suiNfts, error: suiNftsError } = await supabase
      .from("sui_nfts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (suiNftsError) {
      console.error("Error fetching Sui NFTs:", suiNftsError)
    }

    return (
      <div className="min-h-screen flex flex-col">
       
        <main className="flex-1 container mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
          <DashboardClient user={user} profile={profile} nfts={nfts || []} suiNfts={suiNfts || []} />
        </main>
      </div>
    )
  } catch (error) {
    console.error("Error in dashboard page:", error)
    return (
      <div className="min-h-screen flex flex-col">
        
        <main className="flex-1 container mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
          <div className="bg-red-100 p-4 rounded-md">
            <p className="text-red-800">
              An error occurred while loading your dashboard. Please try refreshing the page.
            </p>
          </div>
        </main>
      </div>
    )
  }
}
