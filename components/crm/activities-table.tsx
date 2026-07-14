"use client"

import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/crm/data-table"
import { useCrmActivities } from "@/lib/hooks/use-crm"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDistanceToNow } from "date-fns"
import { Calendar, Mail, Phone, CheckSquare } from "lucide-react"

interface ActivitiesTableProps {
  connectionId?: string
}

export function ActivitiesTable({ connectionId }: ActivitiesTableProps) {
  const { data: activities, isLoading, error } = useCrmActivities(connectionId)

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
          const type = row.getValue("type") as string
          if (!type) return null

          let icon = null
          let badgeClass = ""

          switch (type.toLowerCase()) {
            case "call":
              icon = <Phone className="h-3 w-3 mr-1" />
              badgeClass = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
              break
            case "email":
              icon = <Mail className="h-3 w-3 mr-1" />
              badgeClass = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
              break
            case "meeting":
              icon = <Calendar className="h-3 w-3 mr-1" />
              badgeClass = "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
              break
            case "task":
              icon = <CheckSquare className="h-3 w-3 mr-1" />
              badgeClass = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
              break
            default:
              badgeClass = "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
          }

          return (
            <Badge className={`flex items-center ${badgeClass}`}>
              {icon}
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Badge>
          )
        },
      },
      {
        accessorKey: "subject",
        header: "Subject",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as string
          if (!status) return null

          let badgeClass = ""
          if (status.toLowerCase() === "completed") {
            badgeClass = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
          } else if (status.toLowerCase() === "pending") {
            badgeClass = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
          }

          return <Badge className={badgeClass}>{status}</Badge>
        },
      },
      {
        accessorKey: "priority",
        header: "Priority",
        cell: ({ row }) => {
          const priority = row.getValue("priority") as string
          if (!priority) return null

          let badgeClass = ""
          if (priority.toLowerCase() === "high") {
            badgeClass = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
          } else if (priority.toLowerCase() === "medium") {
            badgeClass = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
          } else if (priority.toLowerCase() === "low") {
            badgeClass = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
          }

          return <Badge className={badgeClass}>{priority}</Badge>
        },
      },
      {
        accessorKey: "due_date",
        header: "Due Date",
        cell: ({ row }) => {
          const dueDate = row.getValue("due_date") as string
          if (!dueDate) return "Not set"
          return formatDistanceToNow(new Date(dueDate), { addSuffix: true })
        },
      },
      {
        accessorKey: "completed_date",
        header: "Completed",
        cell: ({ row }) => {
          const completedDate = row.getValue("completed_date") as string
          if (!completedDate) return "Not completed"
          return formatDistanceToNow(new Date(completedDate), { addSuffix: true })
        },
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => {
          const description = row.getValue("description") as string
          if (!description) return null

          return (
            <div className="max-w-xs truncate" title={description}>
              {description}
            </div>
          )
        },
      },
      {
        accessorKey: "created_at",
        header: "Created",
        cell: ({ row }) => {
          const created = row.getValue("created_at") as string
          return formatDistanceToNow(new Date(created), { addSuffix: true })
        },
      },
    ],
    [],
  )

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full max-w-sm" />
        <Skeleton className="h-[300px] w-full rounded-md" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error loading activities</h3>
            <div className="mt-2 text-sm text-red-700 dark:text-red-200">
              <p>There was an error loading the activities. Please try again.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <DataTable
      columns={columns}
      data={activities || []}
      searchColumn="subject"
      exportData
      exportFilename="crm-activities"
    />
  )
}
