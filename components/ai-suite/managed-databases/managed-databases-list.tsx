"use client"

import { DatabaseIcon, AlertCircle, CheckCircle, Clock, Loader2, ExternalLink, LinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import type { UserManagedSupabaseProject } from "@/lib/types/database"
import { formatDistanceToNow } from "date-fns"

interface ManagedDatabasesListProps {
  databases: UserManagedSupabaseProject[]
  isLoading: boolean
  onAddToConnections: (projectId: string) => void
  isAddingToConnectionsId: string | null
}

export function ManagedDatabasesList({
  databases,
  isLoading,
  onAddToConnections,
  isAddingToConnectionsId,
}: ManagedDatabasesListProps) {
  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "ACTIVE":
      case "ACTIVE_HEALTHY":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1 inline-block" />
            Active
          </Badge>
        )
      case "PROVISIONING":
      case "COMING_UP":
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1 inline-block" />
            Provisioning
          </Badge>
        )
      case "CREATION_FAILED":
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1 inline-block" />
            Failed
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-1/3" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (databases.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <DatabaseIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Managed Databases Found</h3>
          <p className="text-muted-foreground text-center">Create your first Supabase database to get started.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Managed Databases</CardTitle>
        <CardDescription>List of Supabase projects provisioned through this platform.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Display Name</TableHead>
              <TableHead>Project Ref</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {databases.map((db) => (
              <TableRow key={db.id}>
                <TableCell className="font-medium">{db.display_name}</TableCell>
                <TableCell>
                  <a
                    href={`https://supabase.com/dashboard/project/${db.supabase_project_ref}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-primary flex items-center"
                  >
                    {db.supabase_project_ref} <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </TableCell>
                <TableCell>{db.supabase_region}</TableCell>
                <TableCell>{getStatusBadge(db.status)}</TableCell>
                <TableCell>{formatDistanceToNow(new Date(db.created_at), { addSuffix: true })}</TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onAddToConnections(db.id)}
                    disabled={db.status !== "ACTIVE" || isAddingToConnectionsId === db.id}
                  >
                    {isAddingToConnectionsId === db.id && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    <LinkIcon className="h-3 w-3 mr-1" /> Use as Data Source
                  </Button>
                  {/* Future actions: View Details, Delete (with Supabase API call) */}
                </TableCell>
              </TableRow>
            ))}
            {databases.map(
              (db) =>
                db.status === "CREATION_FAILED" &&
                db.error_message && (
                  <TableRow key={`${db.id}-error`} className="bg-red-50 dark:bg-red-900/30">
                    <TableCell colSpan={6} className="text-red-700 dark:text-red-400 text-xs p-2">
                      <strong>Error for {db.display_name}:</strong> {db.error_message}
                    </TableCell>
                  </TableRow>
                ),
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
