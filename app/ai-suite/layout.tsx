import type React from "react"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { AISuiteProviders } from "@/components/ai-suite/providers"
import { DashboardSidebar } from "@/components/ai-suite/dashboard-sidebar"
import { DashboardHeader } from "@/components/ai-suite/dashboard-header"
import type { Metadata } from "next"
import {
  getAIModels,
  getAIAgents,
  getAIWorkflows,
  getAssets,
  getDataEmbeddings,
  getSystemAIAgents,
  getDashboardMetrics,
  getIoTSensorData,
  getAIWorkflowRuns,
  getAIRequestLogs,
  getSystemWorkflowTemplates,
  getAssetAnalytics,
  getAssetIntelligenceLearning,
  getAIRequestVolumeData,
  // AetherNet queries
  getAetherNetConnections,
  getAetherNetMetrics,
  // Tokenization queries
  getTokenizedAssets,
  getTokenizationMetrics,
  // Voice Agent queries
  getVoiceExecutionLogs,
  getVoiceAgentMetrics,
  // A2A Protocol queries
  getA2AAgentCards,
  getA2ATasks,
  // IoT Fleet queries
  getIoTFleetDevices,
  getIoTFleetMetrics,
  getIoTFleetAlerts,
  // ROI Analytics queries
  getROIAssessments,
} from "@/lib/queries/ai-suite"
import { cache } from "react"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "AI Business Suite - Kronova",
  description: "Advanced AI analytics and agent management platform with real-time data",
}

const prefetchAISuiteData = cache(async (supabase: any, userId: string) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
      },
    },
  })

  await Promise.all([
    queryClient.prefetchQuery(getAIModels(supabase)),
    queryClient.prefetchQuery(getAIAgents(supabase, userId)),
    queryClient.prefetchQuery(getAIWorkflows(supabase, userId)),
    queryClient.prefetchQuery(getAssets(supabase, userId)),
    queryClient.prefetchQuery(getDataEmbeddings(supabase, userId)),
    queryClient.prefetchQuery(getSystemAIAgents(supabase)),
    queryClient.prefetchQuery(getDashboardMetrics(supabase, userId)),
    queryClient.prefetchQuery(getIoTSensorData(supabase, userId)),
    queryClient.prefetchQuery(getAIWorkflowRuns(supabase, userId)),
    queryClient.prefetchQuery(getAIRequestLogs(supabase, userId)),
    queryClient.prefetchQuery(getSystemWorkflowTemplates(supabase)),
    queryClient.prefetchQuery(getAssetAnalytics(supabase, userId)),
    queryClient.prefetchQuery(getAssetIntelligenceLearning(supabase, userId)),
    queryClient.prefetchQuery(getAIRequestVolumeData(supabase, userId)),
    // AetherNet prefetch
    queryClient.prefetchQuery(getAetherNetConnections(supabase, userId)),
    queryClient.prefetchQuery(getAetherNetMetrics(supabase, userId)),
    // Tokenization prefetch
    queryClient.prefetchQuery(getTokenizedAssets(supabase, userId)),
    queryClient.prefetchQuery(getTokenizationMetrics(supabase, userId)),
    // Voice Agent prefetch
    queryClient.prefetchQuery(getVoiceExecutionLogs(supabase, userId)),
    queryClient.prefetchQuery(getVoiceAgentMetrics(supabase, userId)),
    // A2A Protocol prefetch
    queryClient.prefetchQuery(getA2AAgentCards(supabase, userId)),
    queryClient.prefetchQuery(getA2ATasks(supabase, userId)),
    // IoT Fleet prefetch
    queryClient.prefetchQuery(getIoTFleetDevices(supabase, userId)),
    queryClient.prefetchQuery(getIoTFleetMetrics(supabase, userId)),
    queryClient.prefetchQuery(getIoTFleetAlerts(supabase, userId)),
    // ROI Analytics prefetch
    queryClient.prefetchQuery(getROIAssessments(supabase, userId)),
  ])

  return queryClient
})

export default async function AISuiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let supabase
  try {
    supabase = await createServerSupabaseClient()
  } catch (error) {
    redirect("/login")
  }

  if (!supabase) {
    redirect("/login")
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/login")
    }

    const queryClient = await prefetchAISuiteData(supabase, user.id)

    return (
      <HydrationBoundary state={dehydrate(queryClient)}>
        <AISuiteProviders
          user={user}
          initialData={{
            aiModels: [],
            agents: [],
            workflows: [],
            systemAgentTemplates: [],
            systemWorkflowTemplates: [],
            assets: [],
            assetAnalytics: [],
          }}
        >
          <div className="flex h-screen bg-background overflow-hidden">
            <DashboardSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <DashboardHeader user={user} />
              <main className="flex-1 overflow-y-auto">{children}</main>
            </div>
          </div>
        </AISuiteProviders>
      </HydrationBoundary>
    )
  } catch (error) {
    console.error("[v0] AISuiteLayout: Error accessing Supabase:", error)
    redirect("/login")
  }
}
