"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Database, Edit, Trash2, TestTube, CheckCircle, XCircle, Clock, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import type { DatabaseConnection } from "@/lib/types/database"

interface DatabaseConnectionsListProps {
  connections: DatabaseConnection[]
  isLoading: boolean
  onEdit: (connection: DatabaseConnection) => void
  onDelete: (id: string) => void
  onTest: (id: string) => void
  isTestingId: string | null
}

export function DatabaseConnectionsList({
  connections,
  isLoading,
  onEdit,
  onDelete,
  onTest,
  isTestingId,
}: DatabaseConnectionsListProps) {
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Connected
          </Badge>
        )
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  const getDatabaseIcon = (type: string) => {
    // You can customize icons based on database type
    return <Database className="h-5 w-5" />
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (connections.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Database className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Database Connections</h3>
          <p className="text-muted-foreground text-center mb-4">
            Get started by adding your first database connection to integrate with AI features.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (viewMode === "table") {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Database Connections</CardTitle>
            <CardDescription>Manage your external database connections</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setViewMode("grid")}>
              Grid View
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Tested</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {connections.map((connection) => (
                <TableRow key={connection.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getDatabaseIcon(connection.connection_type)}
                      <div>
                        <div className="font-medium">{connection.name}</div>
                        {connection.description && (
                          <div className="text-sm text-muted-foreground">{connection.description}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{connection.connection_type.toUpperCase()}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(connection.last_test_status)}
                      {getStatusBadge(connection.last_test_status)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {connection.last_tested_at ? (
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(connection.last_tested_at), { addSuffix: true })}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">Never</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onTest(connection.id)}>
                          <TestTube className="h-4 w-4 mr-2" />
                          Test Connection
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(connection)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onDelete(connection.id)} className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Database Connections</h2>
          <p className="text-muted-foreground">Manage your external database connections</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setViewMode("table")}>
          Table View
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {connections.map((connection) => (
          <Card key={connection.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getDatabaseIcon(connection.connection_type)}
                  <div>
                    <CardTitle className="text-lg">{connection.name}</CardTitle>
                    <Badge variant="outline" className="mt-1">
                      {connection.connection_type.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onTest(connection.id)} disabled={isTestingId === connection.id}>
                      <TestTube className="h-4 w-4 mr-2" />
                      {isTestingId === connection.id ? "Testing..." : "Test Connection"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(connection)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onDelete(connection.id)} className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {connection.description && <CardDescription>{connection.description}</CardDescription>}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(connection.last_test_status)}
                  {getStatusBadge(connection.last_test_status)}
                </div>
                <div className="flex items-center gap-1">
                  {connection.is_active ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                <div>Host: {connection.host || "Not specified"}</div>
                <div>Database: {connection.database_name || "Not specified"}</div>
                <div>
                  Last tested:{" "}
                  {connection.last_tested_at
                    ? formatDistanceToNow(new Date(connection.last_tested_at), { addSuffix: true })
                    : "Never"}
                </div>
              </div>

              {connection.last_test_error && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{connection.last_test_error}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
