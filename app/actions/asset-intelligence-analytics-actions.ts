"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"

export interface AgentExecutionMetrics {
  agent_id: string
  agent_name: string
  total_executions: number
  successful_executions: number
  failed_executions: number
  avg_execution_time: number
  last_execution: string | null
  success_rate: number
}

export interface WorkflowExecutionMetrics {
  workflow_id: string
  workflow_name: string
  total_executions: number
  successful_executions: number
  failed_executions: number
  avg_execution_time: number
  last_execution: string | null
  success_rate: number
}

export interface AssetIntelligenceAnalytics {
  overview: {
    total_agents: number
    active_agents: number
    total_workflows: number
    active_workflows: number
    total_executions_today: number
    total_insights_generated: number
    avg_confidence_score: number
  }
  agentMetrics: AgentExecutionMetrics[]
  workflowMetrics: WorkflowExecutionMetrics[]
  executionTrends: Array<{
    date: string
    agent_executions: number
    workflow_executions: number
    insights_generated: number
  }>
  insightsByType: Array<{
    insight_type: string
    count: number
    avg_confidence: number
  }>
  recentActivity: Array<{
    id: string
    type: "agent" | "workflow" | "insight"
    name: string
    status: string
    timestamp: string
  }>
}

export async function getAssetIntelligenceAnalytics(days = 30) {
  const supabase = await createServerSupabaseClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get agent metrics
    const { data: agents, error: agentsError } = await supabase
      .from("ai_agents")
      .select(`
        id,
        name,
        is_active,
        created_at,
        asset_agent_configs!inner(id)
      `)
      .eq("user_id", user.id)

    if (agentsError) {
      console.error("Error fetching agents:", agentsError)
    }

    // Get workflow metrics
    const { data: workflows, error: workflowsError } = await supabase
      .from("asset_workflows")
      .select("*")
      .eq("user_id", user.id)

    if (workflowsError) {
      console.error("Error fetching workflows:", workflowsError)
    }

    // Get workflow executions
    const { data: workflowExecutions, error: executionsError } = await supabase
      .from("asset_workflow_executions")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: false })

    if (executionsError) {
      console.error("Error fetching workflow executions:", executionsError)
    }

    // Get insights
    const { data: insights, error: insightsError } = await supabase
      .from("asset_intelligence_insights")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: false })

    if (insightsError) {
      console.error("Error fetching insights:", insightsError)
    }

    // Calculate agent metrics
    const agentMetrics: AgentExecutionMetrics[] = (agents || []).map((agent) => {
      const agentInsights = (insights || []).filter((i) => i.agent_id === agent.id)
      return {
        agent_id: agent.id,
        agent_name: agent.name,
        total_executions: agentInsights.length,
        successful_executions: agentInsights.filter((i) => i.status === "active" || i.status === "resolved").length,
        failed_executions: agentInsights.filter((i) => i.status === "failed").length,
        avg_execution_time: 0, // Would need execution time tracking
        last_execution: agentInsights[0]?.created_at || null,
        success_rate:
          agentInsights.length > 0
            ? (agentInsights.filter((i) => i.status === "active" || i.status === "resolved").length /
                agentInsights.length) *
              100
            : 0,
      }
    })

    // Calculate workflow metrics
    const workflowMetrics: WorkflowExecutionMetrics[] = (workflows || []).map((workflow) => {
      const wfExecutions = (workflowExecutions || []).filter((e) => e.workflow_id === workflow.id)
      const successfulExecutions = wfExecutions.filter((e) => e.status === "completed").length
      const failedExecutions = wfExecutions.filter((e) => e.status === "failed").length

      // Calculate average execution time
      const executionsWithTime = wfExecutions.filter((e) => e.start_time && e.end_time)
      const avgTime =
        executionsWithTime.length > 0
          ? executionsWithTime.reduce((sum, e) => {
              const start = new Date(e.start_time!).getTime()
              const end = new Date(e.end_time!).getTime()
              return sum + (end - start)
            }, 0) / executionsWithTime.length
          : 0

      return {
        workflow_id: workflow.id,
        workflow_name: workflow.name,
        total_executions: wfExecutions.length,
        successful_executions: successfulExecutions,
        failed_executions: failedExecutions,
        avg_execution_time: avgTime / 1000, // Convert to seconds
        last_execution: wfExecutions[0]?.created_at || null,
        success_rate: wfExecutions.length > 0 ? (successfulExecutions / wfExecutions.length) * 100 : 0,
      }
    })

    // Calculate execution trends by day
    const trendsByDate: Record<
      string,
      { agent_executions: number; workflow_executions: number; insights_generated: number }
    > = {}

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      const dateStr = date.toISOString().split("T")[0]
      trendsByDate[dateStr] = {
        agent_executions: 0,
        workflow_executions: 0,
        insights_generated: 0,
      }
    }
    ;(insights || []).forEach((insight) => {
      const dateStr = new Date(insight.created_at).toISOString().split("T")[0]
      if (trendsByDate[dateStr]) {
        trendsByDate[dateStr].agent_executions++
        trendsByDate[dateStr].insights_generated++
      }
    })
    ;(workflowExecutions || []).forEach((execution) => {
      const dateStr = new Date(execution.created_at).toISOString().split("T")[0]
      if (trendsByDate[dateStr]) {
        trendsByDate[dateStr].workflow_executions++
      }
    })

    const executionTrends = Object.entries(trendsByDate)
      .map(([date, data]) => ({
        date,
        ...data,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Calculate insights by type
    const insightsByTypeMap: Record<string, { count: number; total_confidence: number }> = {}
    ;(insights || []).forEach((insight) => {
      if (!insightsByTypeMap[insight.insight_type]) {
        insightsByTypeMap[insight.insight_type] = { count: 0, total_confidence: 0 }
      }
      insightsByTypeMap[insight.insight_type].count++
      insightsByTypeMap[insight.insight_type].total_confidence += insight.confidence_score || 0
    })

    const insightsByType = Object.entries(insightsByTypeMap).map(([type, data]) => ({
      insight_type: type,
      count: data.count,
      avg_confidence: data.count > 0 ? data.total_confidence / data.count : 0,
    }))

    // Get recent activity
    const recentActivity: Array<{
      id: string
      type: "agent" | "workflow" | "insight"
      name: string
      status: string
      timestamp: string
    }> = []
    ;(insights || []).slice(0, 10).forEach((insight) => {
      const agent = agents?.find((a) => a.id === insight.agent_id)
      recentActivity.push({
        id: insight.id,
        type: "insight",
        name: agent?.name || "Unknown Agent",
        status: insight.status,
        timestamp: insight.created_at,
      })
    })
    ;(workflowExecutions || []).slice(0, 10).forEach((execution) => {
      const workflow = workflows?.find((w) => w.id === execution.workflow_id)
      recentActivity.push({
        id: execution.id,
        type: "workflow",
        name: workflow?.name || "Unknown Workflow",
        status: execution.status,
        timestamp: execution.created_at,
      })
    })

    recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Calculate today's executions
    const today = new Date().toISOString().split("T")[0]
    const todayExecutions =
      (workflowExecutions || []).filter((e) => e.created_at.startsWith(today)).length +
      (insights || []).filter((i) => i.created_at.startsWith(today)).length

    // Calculate average confidence score
    const avgConfidence =
      (insights || []).length > 0
        ? (insights || []).reduce((sum, i) => sum + (i.confidence_score || 0), 0) / (insights || []).length
        : 0

    const analytics: AssetIntelligenceAnalytics = {
      overview: {
        total_agents: agents?.length || 0,
        active_agents: agents?.filter((a) => a.is_active).length || 0,
        total_workflows: workflows?.length || 0,
        active_workflows: workflows?.filter((w) => w.is_active).length || 0,
        total_executions_today: todayExecutions,
        total_insights_generated: insights?.length || 0,
        avg_confidence_score: avgConfidence,
      },
      agentMetrics,
      workflowMetrics,
      executionTrends,
      insightsByType,
      recentActivity: recentActivity.slice(0, 20),
    }

    return { success: true, data: analytics }
  } catch (error) {
    console.error("Error in getAssetIntelligenceAnalytics:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function getRealtimeExecutionMetrics() {
  const supabase = await createServerSupabaseClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    // Get executions from the last hour
    const oneHourAgo = new Date()
    oneHourAgo.setHours(oneHourAgo.getHours() - 1)

    const { data: recentExecutions, error } = await supabase
      .from("asset_workflow_executions")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", oneHourAgo.toISOString())
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching realtime metrics:", error)
      return { success: false, error: error.message }
    }

    const runningExecutions = (recentExecutions || []).filter((e) => e.status === "running").length
    const completedExecutions = (recentExecutions || []).filter((e) => e.status === "completed").length
    const failedExecutions = (recentExecutions || []).filter((e) => e.status === "failed").length

    return {
      success: true,
      data: {
        running: runningExecutions,
        completed: completedExecutions,
        failed: failedExecutions,
        total: recentExecutions?.length || 0,
      },
    }
  } catch (error) {
    console.error("Error in getRealtimeExecutionMetrics:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
