"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClientSupabaseClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"
import {
  createCrmConnection,
  updateCrmConnection,
  deleteCrmConnection,
  syncCrmData,
  authenticateCrmProvider,
} from "@/app/actions/crm"
import type { CrmConnection, CreateCrmConnection, UpdateCrmConnection, CrmAuth } from "@/lib/schemas/crm"

// Hook for fetching CRM connections
export function useCrmConnections() {
  const supabase = createClientSupabaseClient()

  return useQuery({
    queryKey: ["crm-connections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_connections")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        throw new Error(error.message)
      }

      return data as CrmConnection[]
    },
  })
}

// Hook for fetching a single CRM connection
export function useCrmConnection(connectionId: string | null) {
  const supabase = createClientSupabaseClient()

  return useQuery({
    queryKey: ["crm-connection", connectionId],
    queryFn: async () => {
      if (!connectionId) return null

      const { data, error } = await supabase.from("crm_connections").select("*").eq("id", connectionId).single()

      if (error) {
        throw new Error(error.message)
      }

      return data as CrmConnection
    },
    enabled: !!connectionId,
  })
}

// Hook for creating a CRM connection
export function useCreateCrmConnection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (connectionData: CreateCrmConnection) => {
      const result = await createCrmConnection(connectionData)
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-connections"] })
      toast({
        title: "Connection created",
        description: "CRM connection has been created successfully.",
      })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create CRM connection.",
        variant: "destructive",
      })
    },
  })
}

// Hook for updating a CRM connection
export function useUpdateCrmConnection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (connectionData: UpdateCrmConnection) => {
      const result = await updateCrmConnection(connectionData)
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["crm-connections"] })
      queryClient.invalidateQueries({ queryKey: ["crm-connection", variables.id] })
      toast({
        title: "Connection updated",
        description: "CRM connection has been updated successfully.",
      })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update CRM connection.",
        variant: "destructive",
      })
    },
  })
}

// Hook for deleting a CRM connection
export function useDeleteCrmConnection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (connectionId: string) => {
      const result = await deleteCrmConnection(connectionId)
      if (!result.success) {
        throw new Error(result.error)
      }
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-connections"] })
      toast({
        title: "Connection deleted",
        description: "CRM connection has been deleted successfully.",
      })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete CRM connection.",
        variant: "destructive",
      })
    },
  })
}

// Hook for authenticating with a CRM provider
export function useAuthenticateCrmProvider() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (authData: CrmAuth) => {
      const result = await authenticateCrmProvider(authData)
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-connections"] })
      toast({
        title: "Authentication successful",
        description: "Successfully authenticated with CRM provider.",
      })
    },
    onError: (error) => {
      toast({
        title: "Authentication failed",
        description: error.message || "Failed to authenticate with CRM provider.",
        variant: "destructive",
      })
    },
  })
}

// Hook for syncing CRM data
export function useSyncCrmData() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (connectionId: string) => {
      const result = await syncCrmData(connectionId)
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data
    },
    onSuccess: (_, connectionId) => {
      queryClient.invalidateQueries({ queryKey: ["crm-connections"] })
      queryClient.invalidateQueries({ queryKey: ["crm-connection", connectionId] })
      queryClient.invalidateQueries({ queryKey: ["crm-contacts"] })
      queryClient.invalidateQueries({ queryKey: ["crm-deals"] })
      queryClient.invalidateQueries({ queryKey: ["crm-activities"] })
      toast({
        title: "Data synced",
        description: "CRM data has been synced successfully.",
      })
    },
    onError: (error) => {
      toast({
        title: "Sync failed",
        description: error.message || "Failed to sync CRM data.",
        variant: "destructive",
      })
    },
  })
}

// Hook for fetching CRM contacts
export function useCrmContacts(connectionId?: string) {
  const supabase = createClientSupabaseClient()

  return useQuery({
    queryKey: ["crm-contacts", connectionId],
    queryFn: async () => {
      let query = supabase.from("crm_contacts").select("*")

      if (connectionId) {
        query = query.eq("connection_id", connectionId)
      }

      const { data, error } = await query.order("created_at", { ascending: false })

      if (error) {
        throw new Error(error.message)
      }

      return data
    },
  })
}

// Hook for fetching CRM deals
export function useCrmDeals(connectionId?: string) {
  const supabase = createClientSupabaseClient()

  return useQuery({
    queryKey: ["crm-deals", connectionId],
    queryFn: async () => {
      let query = supabase.from("crm_deals").select("*")

      if (connectionId) {
        query = query.eq("connection_id", connectionId)
      }

      const { data, error } = await query.order("created_at", { ascending: false })

      if (error) {
        throw new Error(error.message)
      }

      return data
    },
  })
}

// Hook for fetching CRM activities
export function useCrmActivities(connectionId?: string) {
  const supabase = createClientSupabaseClient()

  return useQuery({
    queryKey: ["crm-activities", connectionId],
    queryFn: async () => {
      let query = supabase.from("crm_activities").select("*")

      if (connectionId) {
        query = query.eq("connection_id", connectionId)
      }

      const { data, error } = await query.order("created_at", { ascending: false })

      if (error) {
        throw new Error(error.message)
      }

      return data
    },
  })
}
