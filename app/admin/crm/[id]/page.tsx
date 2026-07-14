import type { Metadata } from "next"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ContactsTable } from "@/components/crm/contacts-table"
import { DealsTable } from "@/components/crm/deals-table"
import { ActivitiesTable } from "@/components/crm/activities-table"
import { DashboardStats } from "@/components/crm/dashboard-stats"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "CRM Connection Details - Resend-It",
  description: "View and manage data for a specific CRM connection",
}

export default async function CrmConnectionPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const supabase = await createServerSupabaseClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If no user, redirect to login
  if (!user) {
    redirect("/login")
  }

  // Get the CRM connection
  const { data: connection, error } = await supabase
    .from("crm_connections")
    .select("*")
    .eq("id", resolvedParams.id)
    .eq("user_id", user.id)
    .single()

  // If connection not found or error, redirect to CRM dashboard
  if (error || !connection) {
    redirect("/admin/crm")
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar showAuth={true} isLoggedIn={true} />

      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="flex items-center mb-8">
          <Button variant="outline" size="sm" asChild className="mr-4 bg-transparent">
            <Link href="/admin/crm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">{connection.name}</h1>
        </div>

        <div className="space-y-8">
          <DashboardStats connectionId={resolvedParams.id} />

          <Tabs defaultValue="contacts" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="contacts">Contacts</TabsTrigger>
              <TabsTrigger value="deals">Deals</TabsTrigger>
              <TabsTrigger value="activities">Activities</TabsTrigger>
            </TabsList>
            <TabsContent value="contacts" className="py-4">
              <ContactsTable connectionId={resolvedParams.id} />
            </TabsContent>
            <TabsContent value="deals" className="py-4">
              <DealsTable connectionId={resolvedParams.id} />
            </TabsContent>
            <TabsContent value="activities" className="py-4">
              <ActivitiesTable connectionId={resolvedParams.id} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
