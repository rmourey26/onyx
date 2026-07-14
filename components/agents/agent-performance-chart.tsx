"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"
import { useState } from "react"

interface AgentPerformanceChartProps {
  deployedAgents: any[]
}

export function AgentPerformanceChart({ deployedAgents }: AgentPerformanceChartProps) {
  const [timeRange, setTimeRange] = useState("7d")
  const [selectedMetric, setSelectedMetric] = useState("requests")

  // Generate mock performance data for demonstration
  const generatePerformanceData = () => {
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90
    const data = []

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)

      data.push({
        date: date.toLocaleDateString(),
        requests: Math.floor(Math.random() * 1000) + 500,
        responseTime: Math.floor(Math.random() * 200) + 100,
        successRate: Math.floor(Math.random() * 10) + 90,
        errors: Math.floor(Math.random() * 50) + 10,
      })
    }

    return data
  }

  const performanceData = generatePerformanceData()

  const getChartConfig = () => {
    switch (selectedMetric) {
      case "requests":
        return {
          dataKey: "requests",
          stroke: "hsl(var(--primary))",
          name: "Total Requests",
        }
      case "responseTime":
        return {
          dataKey: "responseTime",
          stroke: "hsl(var(--accent))",
          name: "Response Time (ms)",
        }
      case "successRate":
        return {
          dataKey: "successRate",
          stroke: "hsl(var(--secondary))",
          name: "Success Rate (%)",
        }
      case "errors":
        return {
          dataKey: "errors",
          stroke: "hsl(var(--destructive))",
          name: "Error Count",
        }
      default:
        return {
          dataKey: "requests",
          stroke: "hsl(var(--primary))",
          name: "Total Requests",
        }
    }
  }

  const chartConfig = getChartConfig()

  return (
    <div className="space-y-6">
      <Card className="enterprise-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Performance Overview</CardTitle>
              <CardDescription>Monitor your agents' performance metrics over time</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="requests">Total Requests</SelectItem>
                  <SelectItem value="responseTime">Response Time</SelectItem>
                  <SelectItem value="successRate">Success Rate</SelectItem>
                  <SelectItem value="errors">Error Count</SelectItem>
                </SelectContent>
              </Select>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey={chartConfig.dataKey}
                  stroke={chartConfig.stroke}
                  strokeWidth={2}
                  name={chartConfig.name}
                  dot={{ fill: chartConfig.stroke, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: chartConfig.stroke, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Agent Comparison Chart */}
      <Card className="enterprise-card">
        <CardHeader>
          <CardTitle>Agent Comparison</CardTitle>
          <CardDescription>Compare performance across all your deployed agents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deployedAgents.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="agent_name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="agent_metrics[0].total_requests"
                  fill="hsl(var(--primary))"
                  name="Total Requests"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="agent_metrics[0].successful_requests"
                  fill="hsl(var(--accent))"
                  name="Successful Requests"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
