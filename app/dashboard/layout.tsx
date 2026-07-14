import type React from "react"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let supabase
  try {
    supabase = await createServerSupabaseClient()
  } catch (error) {
    console.log("[v0] DashboardLayout: Error creating Supabase client:", error)
    redirect("/login")
  }

  if (!supabase) {
    console.log("[v0] DashboardLayout: Supabase client not available, redirecting to login")
    redirect("/login")
  }

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If no user, redirect to login
  if (!user) {
    redirect("/login")
  }

  return <div className="min-h-screen bg-background">{children}</div>
}
