"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ConnectionForm } from "@/components/crm/connection-form"
import { useCrmConnections, useDeleteCrmConnection, useSyncCrmData } from "@/lib/hooks/use-crm"
import { MoreHorizontal, RefreshCw, Trash2, Edit, Plus } from "lucide-react"
import type { CrmConnection } from "@/lib/schemas/crm"

export function ConnectionsList() {
  const router = useRouter()
  const { data: connections, isLoading, error } = useCrmConnections()
  const deleteMutation = useDeleteCrmConnection()
  const syncMutation = useSyncCrmData()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editConnection, setEditConnection] = useState<CrmConnection | null>(null)
  const [deleteConnectionId, setDeleteConnectionId] = useState<string | null>(null)

  const handleAddSuccess = () => {
    setIsAddDialogOpen(false)
    setEditConnection(null)
  }

  const handleDeleteConnection = async () => {
    if (deleteConnectionId) {
      await deleteMutation.mutateAsync(deleteConnectionId)
      setDeleteConnectionId(null)
    }
  }

  const handleSyncData = async (connectionId: string) => {
    await syncMutation.mutateAsync(connectionId)
  }

  const handleViewData = (connectionId: string) => {
    router.push(`/admin/crm/${connectionId}`)
  }

  const getProviderLabel = (provider: string) => {
    switch (provider) {
      case "salesforce":
        return "Salesforce"
      case "crmone":
        return "CrmOne"
      case "netsuite":
        return "NetSuite"
      default:
        return provider
    }
  }

  const getProviderBadgeColor = (provider: string) => {
    switch (provider) {
      case "salesforce":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "crmone":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "netsuite":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">CRM Connections</h2>
          <Skeleton className="h-10 w-32" />
        </div>
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-60" />
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">CRM Connections</h2>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Connection
          </Button>
        </div>
        <Card className="bg-red-50 dark:bg-red-900/20">
          <CardHeader>
            <CardTitle>Error Loading Connections</CardTitle>
            <CardDescription>There was an error loading your CRM connections. Please try again.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardFooter>
        </Card>

        {/* Add Connection Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <ConnectionForm onSuccess={handleAddSuccess} />
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">CRM Connections</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Connection
        </Button>
      </div>

      {connections && connections.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {connections.map((connection) => (
            <Card key={connection.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{connection.name}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleViewData(connection.id)}>View Data</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSyncData(connection.id)}>Sync Data</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setEditConnection(connection)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600 dark:text-red-400"
                        onClick={() => setDeleteConnectionId(connection.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription>{connection.instance_url || "No instance URL provided"}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <Badge className={getProviderBadgeColor(connection.provider)}>
                    {getProviderLabel(connection.provider)}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSyncData(connection.id)}
                    disabled={syncMutation.isPending && syncMutation.variables === connection.id}
                  >
                    <RefreshCw
                      className={`mr-2 h-3 w-3 ${
                        syncMutation.isPending && syncMutation.variables === connection.id ? "animate-spin" : ""
                      }`}
                    />
                    {syncMutation.isPending && syncMutation.variables === connection.id ? "Syncing..." : "Sync Data"}
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/50 p-2">
                <div className="w-full text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Last synced:</span>
                    <span>
                      {connection.last_sync_at ? new Date(connection.last_sync_at).toLocaleString() : "Never"}
                    </span>
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No CRM Connections</CardTitle>
            <CardDescription>
              You haven't connected any CRM providers yet. Add a connection to get started.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Connection
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Add Connection Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <ConnectionForm onSuccess={handleAddSuccess} />
        </DialogContent>
      </Dialog>

      {/* Edit Connection Dialog */}
      <Dialog open={!!editConnection} onOpenChange={(open) => !open && setEditConnection(null)}>
        <DialogContent className="sm:max-w-[600px]">
          {editConnection && <ConnectionForm initialData={editConnection} onSuccess={() => setEditConnection(null)} />}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConnectionId} onOpenChange={(open) => !open && setDeleteConnectionId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this CRM connection? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConnectionId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConnection} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
