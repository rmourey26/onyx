"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ConnectionsList } from "@/components/crm/connections-list"
import { ContactsTable } from "@/components/crm/contacts-table"
import { DealsTable } from "@/components/crm/deals-table"
import { ActivitiesTable } from "@/components/crm/activities-table"
import { DashboardStats } from "@/components/crm/dashboard-stats"

export function CrmDashboardClient() {
  return (
    <div className="space-y-8">
      <ConnectionsList />

      <DashboardStats />

      <Tabs defaultValue="contacts" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="deals">Deals</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
        </TabsList>
        <TabsContent value="contacts" className="py-4">
          <ContactsTable />
        </TabsContent>
        <TabsContent value="deals" className="py-4">
          <DealsTable />
        </TabsContent>
        <TabsContent value="activities" className="py-4">
          <ActivitiesTable />
        </TabsContent>
      </Tabs>
    </div>
  )
}
