"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, DatabaseIcon, AlertCircle, Loader2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { CreateDatabaseForm } from "@/components/ai-suite/managed-databases/create-database-form"
import { ManagedDatabasesList } from "@/components/ai-suite/managed-databases/managed-databases-list"
import {
  createSupabaseProjectForUser,
  getManagedSupabaseProjectsForUser,
  addManagedDbToConnections,
} from "@/app/actions/ai-actions"
import type { CreateSupabaseProjectFormValues } from "@/lib/types/database"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function ManagedDatabasesClient() {
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const {
    data: managedDatabases = [],
    isLoading: isLoadingDatabases,
    error: fetchError,
  } = useQuery({
    queryKey: ["userManagedSupabaseProjects"],
    queryFn: getManagedSupabaseProjectsForUser,
  })

  const createProjectMutation = useMutation({
    mutationFn: createSupabaseProjectForUser,
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["userManagedSupabaseProjects"] })
        setIsCreateFormOpen(false)
        toast({
          title: "Database Provisioning Started",
          description: result.message || `Database ${result.data?.display_name} is being created.`,
        })
      } else {
        toast({
          title: "Creation Failed",
          description: result.error || "Could not start database creation.",
          variant: "destructive",
        })
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      })
    },
  })

  const addToConnectionsMutation = useMutation({
    mutationFn: addManagedDbToConnections,
    onSuccess: (result) => {
      if (result.success) {
        toast({ title: "Success", description: result.message })
        queryClient.invalidateQueries({ queryKey: ["database-connections"] }) // To refresh the main data sources list
      } else {
        toast({ title: "Failed", description: result.error, variant: "destructive" })
      }
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    },
  })

  const handleCreateSubmit = (values: CreateSupabaseProjectFormValues) => {
    createProjectMutation.mutate(values)
  }

  const handleAddToConnections = (projectId: string) => {
    addToConnectionsMutation.mutate(projectId)
  }

  if (fetchError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load managed databases: {fetchError.message}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Managed Databases</h1>
          <p className="text-muted-foreground mt-2">
            Provision and manage dedicated Supabase instances for your AI tasks.
          </p>
        </div>
        <Button onClick={() => setIsCreateFormOpen(true)} disabled={createProjectMutation.isPending}>
          {createProjectMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          Create New Database
        </Button>
      </div>

      <Alert>
        <DatabaseIcon className="h-4 w-4" />
        <AlertTitle>Supabase Integration</AlertTitle>
        <AlertDescription>
          Databases created here are full Supabase projects. You are responsible for any costs incurred on Supabase
          beyond the free tier. You can manage your projects directly on the{" "}
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-primary"
          >
            Supabase Dashboard <ExternalLink className="inline-block h-3 w-3 ml-0.5" />
          </a>
          .
          <br />
          <strong className="text-amber-600 dark:text-amber-400">Note:</strong> API calls to Supabase Management are
          simulated in this environment.
        </AlertDescription>
      </Alert>

      {isCreateFormOpen && (
        <CreateDatabaseForm
          onSubmit={handleCreateSubmit}
          onCancel={() => setIsCreateFormOpen(false)}
          isLoading={createProjectMutation.isPending}
        />
      )}

      <ManagedDatabasesList
        databases={managedDatabases}
        isLoading={isLoadingDatabases}
        onAddToConnections={handleAddToConnections}
        isAddingToConnectionsId={addToConnectionsMutation.isPending ? addToConnectionsMutation.variables : null}
      />
    </div>
  )
}
