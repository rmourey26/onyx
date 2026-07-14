import type { Metadata } from "next"
import { ManagedDatabasesClient } from "./managed-databases-client"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Managed Databases - AI Business Suite",
  description: "Create and manage your dedicated Supabase databases for the Resend-It ecosystem.",
}

export default async function ManagedDatabasesPage() {
  try {
    const supabase = await createServerSupabaseClient()
    
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.log("[v0] ManagedDatabasesPage: User not authenticated, redirecting to login")
      redirect("/login")
    }

    return <ManagedDatabasesClient />
  } catch (error) {
    console.log("[v0] ManagedDatabasesPage: Error in page:", error)
    redirect("/login")
  }
}
