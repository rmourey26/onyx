"use client"

import type React from "react"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { createContext, useContext, useState, useEffect } from "react"
import { getSupabaseClient } from "@/lib/supabase/singleton"
import type { User } from "@supabase/supabase-js"

interface AISuiteContextType {
  user: User
  supabase: ReturnType<typeof getSupabaseClient>
  initialData: {
    aiModels: any[]
    agents: any[]
    workflows: any[]
    embeddings: any[]
  }
}

const AISuiteContext = createContext<AISuiteContextType | null>(null)

export function useAISuite() {
  const context = useContext(AISuiteContext)
  if (!context) {
    throw new Error("useAISuite must be used within AISuiteProviders")
  }
  return context
}

interface AISuiteProvidersProps {
  children: React.ReactNode
  user: User
  initialData: {
    aiModels: any[]
    agents: any[]
    workflows: any[]
    embeddings: any[]
  }
}

export function AISuiteProviders({ children, user, initialData }: AISuiteProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 2,
            gcTime: 1000 * 60 * 10,
            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
            retry: 3,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
          mutations: {
            retry: 2,
            onError: (error) => {
              console.error("[v0] Mutation error:", error)
            },
          },
        },
      }),
  )

  const supabase = getSupabaseClient()

  useEffect(() => {
    console.log("[v0] Setting up real-time subscriptions for AI Suite")

    const channels = [
      // AI Agents subscription
      supabase
        .channel("ai-agents-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "ai_agents",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log("[v0] AI Agents change:", payload)
            queryClient.invalidateQueries({ queryKey: ["ai-agents"] })
            queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] })
          },
        )
        .subscribe(),

      // AI Workflows subscription
      supabase
        .channel("ai-workflows-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "ai_workflows",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log("[v0] AI Workflows change:", payload)
            queryClient.invalidateQueries({ queryKey: ["ai-workflows"] })
            queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] })
          },
        )
        .subscribe(),

      // AI Workflow Runs subscription
      supabase
        .channel("ai-workflow-runs-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "ai_workflow_runs",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log("[v0] AI Workflow Runs change:", payload)
            queryClient.invalidateQueries({ queryKey: ["ai-workflow-runs"] })
            queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] })
          },
        )
        .subscribe(),

      // Assets subscription
      supabase
        .channel("assets-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "assets",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log("[v0] Assets change:", payload)
            queryClient.invalidateQueries({ queryKey: ["assets"] })
            queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] })
          },
        )
        .subscribe(),

      // AI Analysis Results subscription
      supabase
        .channel("ai-analysis-results-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "ai_analysis_results",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log("[v0] AI Analysis Results change:", payload)
            queryClient.invalidateQueries({ queryKey: ["ai-analysis-results"] })
            queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] })
          },
        )
        .subscribe(),

      // Data Embeddings subscription
      supabase
        .channel("data-embeddings-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "data_embeddings",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log("[v0] Data Embeddings change:", payload)
            queryClient.invalidateQueries({ queryKey: ["data-embeddings"] })
            queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] })
          },
        )
        .subscribe(),
    ]

    return () => {
      console.log("[v0] Cleaning up real-time subscriptions")
      channels.forEach((channel) => {
        supabase.removeChannel(channel)
      })
    }
  }, [supabase, user.id, queryClient])

  const contextValue: AISuiteContextType = {
    user,
    supabase,
    initialData,
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AISuiteContext.Provider value={contextValue}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </AISuiteContext.Provider>
    </QueryClientProvider>
  )
}
