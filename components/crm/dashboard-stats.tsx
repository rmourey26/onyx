"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCrmContacts, useCrmDeals, useCrmActivities } from "@/lib/hooks/use-crm"
import { Skeleton } from "@/components/ui/skeleton"
import { Users, DollarSign, BarChart, Calendar } from "lucide-react"

interface DashboardStatsProps {
  connectionId?: string
}

export function DashboardStats({ connectionId }: DashboardStatsProps) {
  const { data: contacts, isLoading: contactsLoading } = useCrmContacts(connectionId)
  const { data: deals, isLoading: dealsLoading } = useCrmDeals(connectionId)
  const { data: activities, isLoading: activitiesLoading } = useCrmActivities(connectionId)

  const isLoading = contactsLoading || dealsLoading || activitiesLoading

  const stats = useMemo(() => {
    if (!contacts || !deals || !activities) {
      return {
        totalContacts: 0,
        totalDeals: 0,
        totalValue: 0,
        upcomingActivities: 0,
      }
    }

    // Calculate total deal value
    const totalValue = deals.reduce((sum, deal) => {
      return sum + (deal.amount || 0)
    }, 0)

    // Count upcoming activities (due in the future)
    const now = new Date()
    const upcomingActivities = activities.filter((activity) => {
      if (!activity.due_date) return false
      const dueDate = new Date(activity.due_date)
      return dueDate > now && (!activity.completed_date || new Date(activity.completed_date) > now)
    }).length

    return {
      totalContacts: contacts.length,
      totalDeals: deals.length,
      totalValue,
      upcomingActivities,
    }
  }, [contacts, deals, activities])

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <Skeleton className="h-4 w-24" />
              </CardTitle>
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-4 w-32 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalContacts}</div>
          <p className="text-xs text-muted-foreground">
            {contacts && contacts.length > 0
              ? `${contacts.filter((c) => c.status?.toLowerCase() === "active").length} active contacts`
              : "No contacts yet"}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Deals</CardTitle>
          <BarChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalDeals}</div>
          <p className="text-xs text-muted-foreground">
            {deals && deals.length > 0
              ? `${deals.filter((d) => d.stage?.toLowerCase().includes("closed won")).length} won deals`
              : "No deals yet"}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              maximumFractionDigits: 0,
            }).format(stats.totalValue)}
          </div>
          <p className="text-xs text-muted-foreground">
            {deals && deals.length > 0
              ? `Avg. ${new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: 0,
                }).format(stats.totalValue / stats.totalDeals)} per deal`
              : "No deals yet"}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Upcoming Activities</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.upcomingActivities}</div>
          <p className="text-xs text-muted-foreground">
            {activities && activities.length > 0
              ? `${activities.filter((a) => a.status?.toLowerCase() === "completed").length} completed activities`
              : "No activities yet"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
