import type React from "react"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function MarketplaceAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Check if user is admin
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()

  if (!profile?.is_admin) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold">Admin Panel</h2>
            <div className="flex space-x-4 text-sm">
              <a href="/admin/marketplace" className="text-primary hover:underline">
                Marketplace
              </a>
              <a href="/admin/crm" className="text-muted-foreground hover:text-primary">
                CRM
              </a>
              <a href="/admin/feedback" className="text-muted-foreground hover:text-primary">
                Feedback
              </a>
            </div>
          </nav>
        </div>
      </div>
      {children}
    </div>
  )
}
