"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Activity, TrendingUp, CheckCircle2, XCircle } from "lucide-react"

interface OAuthAgentAnalyticsProps {
  executionStats: any[]
  agents: any[]
  messages: any[]
  connections: any[]
}

export function OAuthAgentAnalytics({ executionStats, agents, messages, connections }: OAuthAgentAnalyticsProps) {
  // Calculate success/failure stats
  const successCount = executionStats.filter((s) => s.status === "success").length
  const failureCount = executionStats.filter((s) => s.status === "error").length
  const successRate = executionStats.length > 0 ? (successCount / executionStats.length) * 100 : 0

  // Group executions by day for chart
  const executionsByDay = executionStats.reduce((acc: any, stat) => {
    const date = new Date(stat.created_at).toLocaleDateString()
    if (!acc[date]) {
      acc[date] = { date, success: 0, failure: 0 }
    }
    if (stat.status === "success") {
      acc[date].success++
    } else {
      acc[date].failure++
    }
    return acc
  }, {})

  const chartData = Object.values(executionsByDay).slice(-7) // Last 7 days

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Analytics & Performance</h2>
        <p className="text-sm text-muted-foreground">Read-only OAuth orchestration metrics — execution and settlement data is reported exclusively through AetherNet QUAS</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="enterprise-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Success Rate</p>
                <p className="text-3xl font-bold">{successRate.toFixed(1)}%</p>
              </div>
              <div className="p-3 rounded-xl bg-green-500/10">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Executions</p>
                <p className="text-3xl font-bold">{executionStats.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10">
                <Activity className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Agents</p>
                <p className="text-3xl font-bold">{agents.filter((a) => a.is_active).length}</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/10">
                <TrendingUp className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Failed Executions</p>
                <p className="text-3xl font-bold">{failureCount}</p>
              </div>
              <div className="p-3 rounded-xl bg-red-500/10">
                <XCircle className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Execution Chart */}
      <Card className="enterprise-card">
        <CardHeader>
          <CardTitle>Execution History</CardTitle>
          <CardDescription>Agent execution success and failure rates over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
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
              <Bar dataKey="success" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="failure" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
