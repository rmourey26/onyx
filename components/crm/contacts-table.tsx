"use client"

import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/crm/data-table"
import { useCrmContacts } from "@/lib/hooks/use-crm"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDistanceToNow } from "date-fns"

interface ContactsTableProps {
  connectionId?: string
}

export function ContactsTable({ connectionId }: ContactsTableProps) {
  const { data: contacts, isLoading, error } = useCrmContacts(connectionId)

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "first_name",
        header: "First Name",
      },
      {
        accessorKey: "last_name",
        header: "Last Name",
      },
      {
        accessorKey: "email",
        header: "Email",
      },
      {
        accessorKey: "phone",
        header: "Phone",
      },
      {
        accessorKey: "company",
        header: "Company",
      },
      {
        accessorKey: "job_title",
        header: "Job Title",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as string
          if (!status) return null

          let badgeClass = ""
          if (status.toLowerCase() === "active") {
            badgeClass = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
          } else if (status.toLowerCase() === "inactive") {
            badgeClass = "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
          }

          return <Badge className={badgeClass}>{status}</Badge>
        },
      },
      {
        accessorKey: "last_contacted",
        header: "Last Contacted",
        cell: ({ row }) => {
          const lastContacted = row.getValue("last_contacted") as string
          if (!lastContacted) return "Never"
          return formatDistanceToNow(new Date(lastContacted), { addSuffix: true })
        },
      },
      {
        accessorKey: "tags",
        header: "Tags",
        cell: ({ row }) => {
          const tags = row.getValue("tags") as string[]
          if (!tags || !tags.length) return null

          return (
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{tags.length - 3}
                </Badge>
              )}
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
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error loading contacts</h3>
            <div className="mt-2 text-sm text-red-700 dark:text-red-200">
              <p>There was an error loading the contacts. Please try again.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <DataTable columns={columns} data={contacts || []} searchColumn="email" exportData exportFilename="crm-contacts" />
  )
}
