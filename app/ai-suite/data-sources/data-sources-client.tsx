"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Database, AlertCircle, CheckCircle, Activity, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DatabaseConnectionsList } from "@/components/ai-suite/data-sources/database-connections-list"
import { DatabaseConnectionForm } from "@/components/ai-suite/data-sources/database-connection-form"
import {
  getDatabaseConnections,
  createDbConnection,
  updateDbConnection,
  deleteDbConnection,
  testDbConnection,
} from "@/app/actions/ai-actions"
import { useToast } from "@/hooks/use-toast"
import type {
  DatabaseConnection,
  CreateDatabaseConnectionInput,
  UpdateDatabaseConnectionInput,
} from "@/lib/types/database"
import { ManagedDatabasesClient as UserManagedDatabasesFeatureClient } from "../managed-databases/managed-databases-client"

export function DataSourcesClient() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingConnection, setEditingConnection] = useState<DatabaseConnection | null>(null)
  const [activeTab, setActiveTab] = useState("external_connections")
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Fetch database connections
  const {
    data: connections = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["database-connections"],
    queryFn: getDatabaseConnections,
  })

  // Create connection mutation
  const createMutation = useMutation({
    mutationFn: createDbConnection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["database-connections"] })
      setIsFormOpen(false)
      toast({
        title: "Success",
        description: "Database connection created successfully",
      })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create database connection",
        variant: "destructive",
      })
    },
  })

  // Update connection mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDatabaseConnectionInput }) =>
      updateDbConnection({ id, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["database-connections"] })
      setEditingConnection(null)
      setIsFormOpen(false)
      toast({
        title: "Success",
        description: "Database connection updated successfully",
      })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update database connection",
        variant: "destructive",
      })
    },
  })

  // Delete connection mutation
  const deleteMutation = useMutation({
    mutationFn: deleteDbConnection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["database-connections"] })
      toast({
        title: "Success",
        description: "Database connection deleted successfully",
      })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete database connection",
        variant: "destructive",
      })
    },
  })

  // Test connection mutation
  const testMutation = useMutation({
    mutationFn: testDbConnection,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["database-connections"] })
      toast({
        title: result.success ? "Connection Successful" : "Connection Failed",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      })
    },
    onError: (error) => {
      toast({
        title: "Test Failed",
        description: error.message || "Failed to test database connection",
        variant: "destructive",
      })
    },
  })

  const handleCreate = (data: CreateDatabaseConnectionInput) => {
    createMutation.mutate(data)
  }

  const handleUpdate = (id: string, data: UpdateDatabaseConnectionInput) => {
    updateMutation.mutate({ id, data })
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this database connection?")) {
      deleteMutation.mutate(id)
    }
  }

  const handleTest = (id: string) => {
    testMutation.mutate(id)
  }

  const handleEdit = (connection: DatabaseConnection) => {
    setEditingConnection(connection)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingConnection(null)
  }

  const getConnectionStats = () => {
    const total = connections.length
    const active = connections.filter((c) => c.is_active).length
    const successful = connections.filter((c) => c.last_test_status === "success").length
    const failed = connections.filter((c) => c.last_test_status === "failed").length

    return { total, active, successful, failed }
  }

  const stats = getConnectionStats()

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load database connections. Please try again.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold enterprise-text-gradient">Data Sources</h1>
          <p className="text-muted-foreground mt-2">
            Connect external databases or provision new managed databases for your AI workflows.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="dashboard-metric-label">Total Connections</CardTitle>
            <div className="p-2 rounded-lg bg-primary/10">
              <Database className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="dashboard-metric-value">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="dashboard-metric-label">Active</CardTitle>
            <div className="p-2 rounded-lg bg-green-500/10">
              <Activity className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="dashboard-metric-value text-green-600 dark:text-green-400">{stats.active}</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="dashboard-metric-label">Successful Tests</CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="dashboard-metric-value text-emerald-600 dark:text-emerald-400">{stats.successful}</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="dashboard-metric-label">Failed Tests</CardTitle>
            <div className="p-2 rounded-lg bg-red-500/10">
              <XCircle className="h-4 w-4 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="dashboard-metric-value text-red-600 dark:text-red-400">{stats.failed}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/50 backdrop-blur-sm">
          <TabsTrigger
            value="external_connections"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            External Connections
          </TabsTrigger>
          <TabsTrigger
            value="managed_databases"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Managed Databases
          </TabsTrigger>
        </TabsList>

        <TabsContent value="external_connections" className="space-y-6">
          <Card className="enterprise-card glass-morphism">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>External Database Connections</CardTitle>
                <CardDescription>Connect to your existing databases</CardDescription>
              </div>
              <Button onClick={() => setIsFormOpen(true)} className="enterprise-button gap-2">
                <Plus className="h-4 w-4" />
                Add Connection
              </Button>
            </CardHeader>
            <CardContent>
              <DatabaseConnectionsList
                connections={connections}
                isLoading={isLoading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onTest={handleTest}
                isDeleting={deleteMutation.isPending}
                isTesting={testMutation.isPending}
              />
            </CardContent>
          </Card>

          {isFormOpen && (
            <Card className="enterprise-card glass-morphism">
              <CardHeader>
                <CardTitle>{editingConnection ? "Edit Connection" : "New Connection"}</CardTitle>
                <CardDescription>
                  {editingConnection ? "Update your database connection details" : "Add a new database connection"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DatabaseConnectionForm
                  initialData={editingConnection || undefined}
                  onSubmit={(data) => {
                    if (editingConnection) {
                      handleUpdate(editingConnection.id, data)
                    } else {
                      handleCreate(data as CreateDatabaseConnectionInput)
                    }
                  }}
                  onCancel={handleCloseForm}
                  isSubmitting={createMutation.isPending || updateMutation.isPending}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="managed_databases" className="space-y-6">
          <UserManagedDatabasesFeatureClient />
        </TabsContent>
      </Tabs>
    </div>
  )
}
