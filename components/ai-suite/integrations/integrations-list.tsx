"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShopifyIcon, WixIcon } from "@/components/ui/icons"
import { MoreHorizontal, Trash2, RefreshCw, Settings, ExternalLink, Loader2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { formatDistanceToNow } from "date-fns"
import type { ExternalIntegration } from "@/lib/types/database"
import { useState } from "react"

interface IntegrationsListProps {
  integrations: ExternalIntegration[]
  onResync: (id: string) => void
  onDelete: (id: string) => void
}

export function IntegrationsList({ integrations, onResync, onDelete }: IntegrationsListProps) {
  const [syncingId, setSyncingId] = useState<string | null>(null)

  const handleSync = async (id: string) => {
    setSyncingId(id)
    await onResync(id)
    // We don't set syncingId to null immediately, to give time for revalidation
    // A more robust solution would use polling or websockets to get the real status
    setTimeout(() => setSyncingId(null), 10000)
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default"
      case "revoked":
      case "error":
        return "destructive"
      case "pending":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getSyncStatusBadge = (status: ExternalIntegration["sync_status"]) => {
    switch (status) {
      case "syncing":
        return (
          <Badge variant="secondary">
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            Syncing
          </Badge>
        )
      case "completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Completed</Badge>
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">Idle</Badge>
    }
  }

  const getIcon = (provider: string) => {
    switch (provider) {
      case "shopify":
        return <ShopifyIcon className="h-5 w-5 sm:h-6 sm:w-6" />
      case "wix":
        return <WixIcon className="h-5 w-5 sm:h-6 sm:w-6" />
      default:
        return <ExternalLink className="h-5 w-5 sm:h-6 sm:w-6" />
    }
  }

  if (integrations.length === 0) {
    return (
      <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">Active Integrations</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Your connected platforms will appear here once you connect them.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8 sm:py-12">
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-muted rounded-full flex items-center justify-center">
              <ExternalLink className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <p className="text-base sm:text-lg font-medium text-muted-foreground">No integrations yet</p>
              <p className="text-sm sm:text-base text-muted-foreground">
                Connect a platform above to start syncing your data and unlock powerful insights.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl">Active Integrations</CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Manage your connected platforms and data sync settings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Mobile View */}
        <div className="block sm:hidden space-y-4">
          {integrations.map((integration) => (
            <Card key={integration.id} className="border">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getIcon(integration.provider)}
                    <span className="font-medium capitalize">{integration.provider}</span>
                  </div>
                  <Badge variant={getStatusVariant(integration.status)}>{integration.status}</Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Store/Site: </span>
                    <span>{integration.provider_shop_id || integration.provider_site_id}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Sync: </span>
                    <span>
                      {integration.last_sync_at
                        ? `${formatDistanceToNow(new Date(integration.last_sync_at), { addSuffix: true })}`
                        : "Never"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Sync Status: </span>
                    {getSyncStatusBadge(integration.sync_status)}
                  </div>
                </div>

                <div className="flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem disabled>
                        <Settings className="mr-2 h-4 w-4" />
                        Manage Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleSync(integration.id)}
                        disabled={syncingId === integration.id}
                      >
                        {syncingId === integration.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="mr-2 h-4 w-4" />
                        )}
                        Sync Now
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onDelete(integration.id)} className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Disconnect
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Desktop View */}
        <div className="hidden sm:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Platform</TableHead>
                <TableHead>Store / Site</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Sync</TableHead>
                <TableHead>Sync Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {integrations.map((integration) => (
                <TableRow key={integration.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {getIcon(integration.provider)}
                      <span className="capitalize">{integration.provider}</span>
                    </div>
                  </TableCell>
                  <TableCell>{integration.provider_shop_id || integration.provider_site_id}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(integration.status)}>{integration.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {integration.last_sync_at
                      ? `${formatDistanceToNow(new Date(integration.last_sync_at), { addSuffix: true })}`
                      : "Never"}
                  </TableCell>
                  <TableCell>{getSyncStatusBadge(integration.sync_status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem disabled>
                          <Settings className="mr-2 h-4 w-4" />
                          Manage Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleSync(integration.id)}
                          disabled={syncingId === integration.id}
                        >
                          {syncingId === integration.id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="mr-2 h-4 w-4" />
                          )}
                          Sync Now
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onDelete(integration.id)} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Disconnect
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
