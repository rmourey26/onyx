"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAIRequestLogs, useVoiceExecutionLogs, useAILogsStatistics } from "@/lib/hooks/use-ai-suite"
import { Activity, Mic, Zap, Clock, TrendingUp, BarChart3 } from "lucide-react"
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"

export function AILogsDashboard() {
  const { data: aiLogs, isLoading: aiLoading } = useAIRequestLogs(50)
  const { data: voiceLogs, isLoading: voiceLoading } = useVoiceExecutionLogs(50)
  const { data: statistics, isLoading: statsLoading } = useAILogsStatistics()

  // Process data for charts
  const requestsByDay = aiLogs?.reduce((acc: Record<string, number>, log: any) => {
    const date = new Date(log.created_at).toLocaleDateString()
    acc[date] = (acc[date] || 0) + 1
    return acc
  }, {})

  const chartData = Object.entries(requestsByDay || {})
    .slice(-7)
    .map(([date, count]) => ({ date, requests: count }))

  const requestTypeData = aiLogs?.reduce((acc: Record<string, number>, log: any) => {
    acc[log.request_type] = (acc[log.request_type] || 0) + 1
    return acc
  }, {})

  const typeChartData = Object.entries(requestTypeData || {}).map(([type, count]) => ({
    type,
    count,
  }))

  if (statsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics?.totalAIRequests.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Total non-voice AI requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Voice Requests</CardTitle>
            <Mic className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics?.totalVoiceRequests.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Total voice AI requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tokens Used</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics?.totalTokensUsed.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Total tokens consumed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics?.avgExecutionTimeMs || 0}ms</div>
            <p className="text-xs text-muted-foreground">Average execution time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Results</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics?.totalAIResults.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Completed analyses</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Request Trends (Last 7 Days)</CardTitle>
            <CardDescription>Daily AI request volume</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="requests"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#colorRequests)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No request data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Requests by Type</CardTitle>
            <CardDescription>Distribution of AI request types</CardDescription>
          </CardHeader>
          <CardContent>
            {typeChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={typeChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="type" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No type data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Request Logs Tables */}
      <Tabs defaultValue="ai" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="ai">AI Requests</TabsTrigger>
          <TabsTrigger value="voice">Voice Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent AI Requests</CardTitle>
              <CardDescription>Latest non-voice AI interactions</CardDescription>
            </CardHeader>
            <CardContent>
              {aiLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : aiLogs && aiLogs.length > 0 ? (
                <div className="space-y-3">
                  {aiLogs.slice(0, 10).map((log: any) => (
                    <div
                      key={log.id}
                      className="flex items-start justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{log.request_type}</Badge>
                          {log.ai_agents && (
                            <span className="text-sm font-medium">{log.ai_agents.name}</span>
                          )}
                          {log.ai_models && (
                            <span className="text-xs text-muted-foreground">
                              {log.ai_models.provider} / {log.ai_models.name}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{log.prompt}</p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No AI requests logged yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="voice" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Voice Requests</CardTitle>
              <CardDescription>Latest voice AI interactions</CardDescription>
            </CardHeader>
            <CardContent>
              {voiceLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : voiceLogs && voiceLogs.length > 0 ? (
                <div className="space-y-3">
                  {voiceLogs.slice(0, 10).map((log: any) => (
                    <div
                      key={log.id}
                      className="flex items-start justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Mic className="h-4 w-4 text-primary" />
                          {log.ai_agents && (
                            <span className="text-sm font-medium">{log.ai_agents.name}</span>
                          )}
                          {log.duration_seconds && (
                            <Badge variant="secondary">{log.duration_seconds}s</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{log.transcription}</p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No voice requests logged yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
