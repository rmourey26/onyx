import type React from "react"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function CrmLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    const supabase = await createServerSupabaseClient()

    // Check if supabase client and auth are properly initialized
    if (!supabase || !supabase.auth) {
      console.error("[v0] CrmLayout: Supabase client or auth is undefined")
      redirect("/login")
      return null
    }

    // Get the current user with error handling
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    // Handle auth errors
    if (error) {
      console.error("[v0] CrmLayout: Auth error:", error.message)
      redirect("/login")
      return null
    }

    // If no user, redirect to login
    if (!user) {
      console.log("[v0] CrmLayout: No user found, redirecting to login")
      redirect("/login")
      return null
    }

    console.log("[v0] CrmLayout: User authenticated successfully")
    return <div className="min-h-screen bg-background">{children}</div>
  } catch (error) {
    console.error("[v0] CrmLayout: Failed to initialize Supabase client:", error)
    redirect("/login")
    return null
  }
}
