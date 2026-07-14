import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getProfile } from "../actions/profile"
import ProfileForm from "./ProfileForm"
import { Navbar } from "@/components/navbar"

// Add export const dynamic = 'force-dynamic' to prevent static prerendering
export const dynamic = "force-dynamic"

export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient()

  // Wrap the auth check in a try/catch to handle potential errors
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/login")
    }

    // Get profile with error handling
    let profile
    try {
      profile = await getProfile(user.id)
      console.log("Retrieved profile:", profile)
    } catch (error) {
      console.error("Error fetching profile:", error)
      // Create a default profile
      profile = {
        id: user.id,
        name: user.user_metadata?.name || "",
        email: user.email || "",
        company: user.user_metadata?.company || "",
        website: user.user_metadata?.website || "",
      }
    }

    return (
      <div className="flex flex-col min-h-screen">
        

        <main className="flex-1 container py-8 px-4 md:px-6">
          <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
          <ProfileForm initialData={profile} userId={user.id} />
        </main>
      </div>
    )
  } catch (error) {
    console.error("Authentication error:", error)
    redirect("/login")
  }
}
