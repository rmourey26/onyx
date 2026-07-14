"use client"

import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/crm/data-table"
import { useCrmDeals } from "@/lib/hooks/use-crm"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDistanceToNow } from "date-fns"

interface DealsTableProps {
  connectionId?: string
}

export function DealsTable({ connectionId }: DealsTableProps) {
  const { data: deals, isLoading, error } = useCrmDeals(connectionId)

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Deal Name",
      },
      {
        accessorKey: "stage",
        header: "Stage",
        cell: ({ row }) => {
          const stage = row.getValue("stage") as string
          if (!stage) return null

          let badgeClass = ""
          if (stage.toLowerCase().includes("closed won")) {
            badgeClass = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
          } else if (stage.toLowerCase().includes("closed lost")) {
            badgeClass = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
          } else if (stage.toLowerCase().includes("negotiation")) {
            badgeClass = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
          } else if (stage.toLowerCase().includes("proposal")) {
            badgeClass = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
          }

          return <Badge className={badgeClass}>{stage}</Badge>
        },
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => {
          const amount = row.getValue("amount") as number
          const currency = row.original.currency || "USD"
          if (!amount) return null

          return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency,
          }).format(amount)
        },
      },
      {
        accessorKey: "probability",
        header: "Probability",
        cell: ({ row }) => {
          const probability = row.getValue("probability") as number
          if (probability === null || probability === undefined) return null

          return `${probability}%`
        },
      },
      {
        accessorKey: "close_date",
        header: "Close Date",
        cell: ({ row }) => {
          const closeDate = row.getValue("close_date") as string
          if (!closeDate) return "Not set"
          return formatDistanceToNow(new Date(closeDate), { addSuffix: true })
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
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error loading deals</h3>
            <div className="mt-2 text-sm text-red-700 dark:text-red-200">
              <p>There was an error loading the deals. Please try again.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <DataTable columns={columns} data={deals || []} searchColumn="name" exportData exportFilename="crm-deals" />
}
