"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Activity, Bot, Workflow, Lightbulb, RefreshCw, CheckCircle, XCircle, Clock, Zap } from "lucide-react"
import {
  getAssetIntelligenceAnalytics,
  getRealtimeExecutionMetrics,
} from "@/app/actions/asset-intelligence-analytics-actions"
import { getSupabaseClient } from "@/lib/supabase/singleton"

interface AssetIntelligenceAnalyticsDashboardProps {
  userId: string
}

export function AssetIntelligenceAnalyticsDashboard({ userId }: AssetIntelligenceAnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<any>(null)
  const [realtimeMetrics, setRealtimeMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("30")
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    loadAnalytics()
    loadRealtimeMetrics()

    const supabase = getSupabaseClient()
    const channel = supabase
      .channel("asset-intelligence-analytics")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "asset_workflow_executions",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          console.log("[v0] Workflow execution changed, refreshing metrics")
          loadRealtimeMetrics()
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "asset_intelligence_insights",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          console.log("[v0] Insight changed, refreshing analytics")
          loadAnalytics()
        },
      )
      .subscribe()

    // Auto-refresh every 30 seconds
    const interval = autoRefresh
      ? setInterval(() => {
          loadRealtimeMetrics()
        }, 30000)
      : null

    return () => {
      supabase.removeChannel(channel)
      if (interval) clearInterval(interval)
    }
  }, [userId, timeRange, autoRefresh])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      const result = await getAssetIntelligenceAnalytics(Number.parseInt(timeRange))
      if (result.success) {
        setAnalytics(result.data)
      }
    } catch (error) {
      console.error("Error loading analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadRealtimeMetrics = async () => {
    try {
      const result = await getRealtimeExecutionMetrics()
      if (result.success) {
        setRealtimeMetrics(result.data)
      }
    } catch (error) {
      console.error("Error loading realtime metrics:", error)
    }
  }

  if (loading || !analytics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    )
  }

  const { overview, agentMetrics, workflowMetrics, executionTrends, insightsByType, recentActivity } = analytics

  // Safe data with fallbacks
  const safeAgentMetrics = Array.isArray(agentMetrics) ? agentMetrics : []
  const safeWorkflowMetrics = Array.isArray(workflowMetrics) ? workflowMetrics : []
  const safeExecutionTrends = Array.isArray(executionTrends) ? executionTrends : []
  const safeInsightsByType = Array.isArray(insightsByType) ? insightsByType : []
  const safeRecentActivity = Array.isArray(recentActivity) ? recentActivity : []

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Real-time Status Banner */}
      {realtimeMetrics && (
        <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-950/20">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm sm:text-base">Real-time Execution Status</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Last updated: {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">{realtimeMetrics.running} Running</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">{realtimeMetrics.completed} Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium">{realtimeMetrics.failed} Failed</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setAutoRefresh(!autoRefresh)} className="h-8">
                  <RefreshCw className={`h-4 w-4 ${autoRefresh ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Active Agents</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{overview.active_agents}</div>
            <p className="text-xs text-muted-foreground">of {overview.total_agents} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Active Workflows</CardTitle>
            <Workflow className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{overview.active_workflows}</div>
            <p className="text-xs text-muted-foreground">of {overview.total_workflows} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Executions Today</CardTitle>
            <Zap className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-orange-600">{overview.total_executions_today}</div>
            <p className="text-xs text-muted-foreground">Automated processes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Insights Generated</CardTitle>
            <Lightbulb className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{overview.total_insights_generated}</div>
            <p className="text-xs text-muted-foreground">
              Avg confidence: {(overview.avg_confidence_score * 100).toFixed(0)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Time Range Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-lg font-semibold">Performance Analytics</h3>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="trends" className="space-y-4">
        <div className="overflow-x-auto">
          <TabsList className="grid w-full grid-cols-4 min-w-[400px] sm:min-w-0">
            <TabsTrigger value="trends" className="text-xs sm:text-sm">
              Trends
            </TabsTrigger>
            <TabsTrigger value="agents" className="text-xs sm:text-sm">
              Agents
            </TabsTrigger>
            <TabsTrigger value="workflows" className="text-xs sm:text-sm">
              Workflows
            </TabsTrigger>
            <TabsTrigger value="insights" className="text-xs sm:text-sm">
              Insights
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Execution Trends</CardTitle>
              <CardDescription>Agent and workflow execution activity over time</CardDescription>
            </CardHeader>
            <CardContent>
              {safeExecutionTrends.length > 0 ? (
                <ChartContainer
                  config={{
                    agent_executions: {
                      label: "Agent Executions",
                      color: "hsl(var(--chart-1))",
                    },
                    workflow_executions: {
                      label: "Workflow Executions",
                      color: "hsl(var(--chart-2))",
                    },
                    insights_generated: {
                      label: "Insights Generated",
                      color: "hsl(var(--chart-3))",
                    },
                  }}
                  className="h-[300px] sm:h-[400px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={safeExecutionTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" fontSize={12} />
                      <YAxis fontSize={12} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="agent_executions"
                        stackId="1"
                        stroke="var(--color-agent_executions)"
                        fill="var(--color-agent_executions)"
                        fillOpacity={0.6}
                      />
                      <Area
                        type="monotone"
                        dataKey="workflow_executions"
                        stackId="1"
                        stroke="var(--color-workflow_executions)"
                        fill="var(--color-workflow_executions)"
                        fillOpacity={0.6}
                      />
                      <Area
                        type="monotone"
                        dataKey="insights_generated"
                        stackId="1"
                        stroke="var(--color-insights_generated)"
                        fill="var(--color-insights_generated)"
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No execution trend data available for the selected time range
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Agent Success Rates</CardTitle>
                <CardDescription>Performance metrics by agent</CardDescription>
              </CardHeader>
              <CardContent>
                {safeAgentMetrics.length > 0 ? (
                  <ChartContainer
                    config={{
                      success_rate: {
                        label: "Success Rate",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={safeAgentMetrics.slice(0, 5)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="agent_name" fontSize={10} angle={-45} textAnchor="end" height={80} />
                        <YAxis domain={[0, 100]} fontSize={12} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="success_rate" fill="var(--color-success_rate)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No agent performance data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Agent Execution Volume</CardTitle>
                <CardDescription>Total executions per agent</CardDescription>
              </CardHeader>
              <CardContent>
                {safeAgentMetrics.length > 0 ? (
                  <ChartContainer
                    config={{
                      total_executions: {
                        label: "Total Executions",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={safeAgentMetrics.slice(0, 5)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="agent_name" fontSize={10} angle={-45} textAnchor="end" height={80} />
                        <YAxis fontSize={12} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="total_executions" fill="var(--color-total_executions)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No agent execution data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Agent Performance Details</CardTitle>
              <CardDescription>Comprehensive metrics for all agents</CardDescription>
            </CardHeader>
            <CardContent>
              {safeAgentMetrics.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Agent Name</th>
                        <th className="text-right p-2">Executions</th>
                        <th className="text-right p-2">Success Rate</th>
                        <th className="text-right p-2">Failed</th>
                        <th className="text-left p-2">Last Execution</th>
                      </tr>
                    </thead>
                    <tbody>
                      {safeAgentMetrics.map((agent: any) => (
                        <tr key={agent.agent_id} className="border-b">
                          <td className="p-2 font-medium">{agent.agent_name}</td>
                          <td className="text-right p-2">{agent.total_executions}</td>
                          <td className="text-right p-2">
                            <Badge variant={agent.success_rate >= 90 ? "default" : "secondary"}>
                              {agent.success_rate.toFixed(1)}%
                            </Badge>
                          </td>
                          <td className="text-right p-2 text-red-600">{agent.failed_executions}</td>
                          <td className="p-2 text-muted-foreground">
                            {agent.last_execution ? new Date(agent.last_execution).toLocaleDateString() : "Never"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">No agent metrics available</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Workflow Success Rates</CardTitle>
                <CardDescription>Completion rates by workflow</CardDescription>
              </CardHeader>
              <CardContent>
                {safeWorkflowMetrics.length > 0 ? (
                  <ChartContainer
                    config={{
                      success_rate: {
                        label: "Success Rate",
                        color: "hsl(var(--chart-3))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={safeWorkflowMetrics.slice(0, 5)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="workflow_name" fontSize={10} angle={-45} textAnchor="end" height={80} />
                        <YAxis domain={[0, 100]} fontSize={12} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="success_rate" fill="var(--color-success_rate)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No workflow performance data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average Execution Time</CardTitle>
                <CardDescription>Performance by workflow (seconds)</CardDescription>
              </CardHeader>
              <CardContent>
                {safeWorkflowMetrics.length > 0 ? (
                  <ChartContainer
                    config={{
                      avg_execution_time: {
                        label: "Avg Time (s)",
                        color: "hsl(var(--chart-4))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={safeWorkflowMetrics.slice(0, 5)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="workflow_name" fontSize={10} angle={-45} textAnchor="end" height={80} />
                        <YAxis fontSize={12} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar
                          dataKey="avg_execution_time"
                          fill="var(--color-avg_execution_time)"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No workflow execution time data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Workflow Performance Details</CardTitle>
              <CardDescription>Comprehensive metrics for all workflows</CardDescription>
            </CardHeader>
            <CardContent>
              {safeWorkflowMetrics.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Workflow Name</th>
                        <th className="text-right p-2">Executions</th>
                        <th className="text-right p-2">Success Rate</th>
                        <th className="text-right p-2">Avg Time (s)</th>
                        <th className="text-left p-2">Last Execution</th>
                      </tr>
                    </thead>
                    <tbody>
                      {safeWorkflowMetrics.map((workflow: any) => (
                        <tr key={workflow.workflow_id} className="border-b">
                          <td className="p-2 font-medium">{workflow.workflow_name}</td>
                          <td className="text-right p-2">{workflow.total_executions}</td>
                          <td className="text-right p-2">
                            <Badge variant={workflow.success_rate >= 90 ? "default" : "secondary"}>
                              {workflow.success_rate.toFixed(1)}%
                            </Badge>
                          </td>
                          <td className="text-right p-2">{workflow.avg_execution_time.toFixed(2)}</td>
                          <td className="p-2 text-muted-foreground">
                            {workflow.last_execution ? new Date(workflow.last_execution).toLocaleDateString() : "Never"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">No workflow metrics available</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Insights by Type</CardTitle>
                <CardDescription>Distribution of generated insights</CardDescription>
              </CardHeader>
              <CardContent>
                {safeInsightsByType.length > 0 ? (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={safeInsightsByType}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ insight_type, percent }) =>
                            `${insight_type.replace(/_/g, " ")}: ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {safeInsightsByType.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No insight distribution data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Confidence Scores by Type</CardTitle>
                <CardDescription>Average confidence per insight category</CardDescription>
              </CardHeader>
              <CardContent>
                {safeInsightsByType.length > 0 ? (
                  <ChartContainer
                    config={{
                      avg_confidence: {
                        label: "Avg Confidence",
                        color: "hsl(var(--chart-5))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={safeInsightsByType}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="insight_type" fontSize={10} angle={-45} textAnchor="end" height={80} />
                        <YAxis domain={[0, 1]} fontSize={12} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="avg_confidence" fill="var(--color-avg_confidence)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No confidence score data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest agent and workflow executions</CardDescription>
            </CardHeader>
            <CardContent>
              {safeRecentActivity.length > 0 ? (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {safeRecentActivity.map((activity: any) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div
                        className={`p-2 rounded-lg ${
                          activity.type === "agent"
                            ? "bg-blue-100 dark:bg-blue-900"
                            : activity.type === "workflow"
                              ? "bg-purple-100 dark:bg-purple-900"
                              : "bg-yellow-100 dark:bg-yellow-900"
                        }`}
                      >
                        {activity.type === "agent" ? (
                          <Bot className="h-4 w-4" />
                        ) : activity.type === "workflow" ? (
                          <Workflow className="h-4 w-4" />
                        ) : (
                          <Lightbulb className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-sm truncate">{activity.name}</p>
                          <Badge
                            variant={
                              activity.status === "completed" || activity.status === "active"
                                ? "default"
                                : activity.status === "failed"
                                  ? "destructive"
                                  : "secondary"
                            }
                            className="flex-shrink-0"
                          >
                            {activity.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{new Date(activity.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">No recent activity to display</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
