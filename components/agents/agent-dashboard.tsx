"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Activity,
  Bot,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  Settings,
  BarChart3,
} from "lucide-react"
import { AgentPerformanceChart } from "./agent-performance-chart"
import { AgentActivityFeed } from "./agent-activity-feed"
import { AgentConfigPanel } from "./agent-config-panel"
import { useState } from "react"

interface AgentDashboardProps {
  deployedAgents: any[]
  recentActivity: any[]
  user: any
}

export function AgentDashboard({ deployedAgents, recentActivity, user }: AgentDashboardProps) {
  const [selectedAgent, setSelectedAgent] = useState<any>(null)

  // Calculate overall metrics
  const totalAgents = deployedAgents.length
  const activeAgents = deployedAgents.filter((agent) => agent.status === "active").length
  const totalRequests = deployedAgents.reduce((sum, agent) => sum + (agent.agent_metrics?.[0]?.total_requests || 0), 0)
  const avgResponseTime =
    deployedAgents.length > 0
      ? deployedAgents.reduce((sum, agent) => sum + (agent.agent_metrics?.[0]?.avg_response_time || 0), 0) /
        deployedAgents.length
      : 0

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-accent/10 text-accent border-accent/30"
      case "paused":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/30"
      case "error":
        return "bg-destructive/10 text-destructive border-destructive/30"
      default:
        return "bg-muted/50 text-muted-foreground border-border/50"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-3 w-3" />
      case "paused":
        return <Pause className="h-3 w-3" />
      case "error":
        return <XCircle className="h-3 w-3" />
      default:
        return <AlertTriangle className="h-3 w-3" />
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Agent Dashboard</h1>
          <p className="text-muted-foreground mt-1">Monitor and manage your deployed AI agents</p>
        </div>
        <Button>
          <Bot className="h-4 w-4 mr-2" />
          Deploy New Agent
        </Button>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="enterprise-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Total Agents</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{totalAgents}</p>
                  <span className="text-xs px-2 py-1 rounded-full bg-accent/10 text-accent">{activeAgents} active</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Activity className="h-5 w-5 text-accent" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Total Requests</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{totalRequests.toLocaleString()}</p>
                  <span className="text-xs px-2 py-1 rounded-full bg-accent/10 text-accent">+12%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary/10">
                <Clock className="h-5 w-5 text-secondary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{avgResponseTime.toFixed(0)}ms</p>
                  <span className="text-xs px-2 py-1 rounded-full bg-accent/10 text-accent">-5%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">98.5%</p>
                  <span className="text-xs px-2 py-1 rounded-full bg-accent/10 text-accent">+0.3%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="agents" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="agents">Deployed Agents</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="activity">Activity Feed</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="space-y-6">
          <div className="grid gap-6">
            {deployedAgents.length === 0 ? (
              <Card className="enterprise-card">
                <CardContent className="flex flex-col items-center justify-center p-12">
                  <Bot className="h-12 w-12 mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No Deployed Agents</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    You haven't deployed any agents yet. Deploy your first agent to start monitoring.
                  </p>
                  <Button>
                    <Bot className="h-4 w-4 mr-2" />
                    Deploy Agent
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {deployedAgents.map((agent) => (
                  <Card key={agent.id} className="enterprise-card">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Bot className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{agent.agent_name || agent.ai_agents?.name}</CardTitle>
                            <CardDescription>
                              {agent.ai_agents?.description || "No description available"}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`status-indicator ${agent.status}`}>
                            {getStatusIcon(agent.status)}
                            <span className="capitalize">{agent.status}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {agent.ai_agents?.ai_models?.name || "Unknown Model"}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Performance Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">
                            {agent.agent_metrics?.[0]?.total_requests || 0}
                          </p>
                          <p className="text-xs text-muted-foreground">Total Requests</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-accent">
                            {agent.agent_metrics?.[0]?.successful_requests || 0}
                          </p>
                          <p className="text-xs text-muted-foreground">Successful</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-destructive">
                            {agent.agent_metrics?.[0]?.failed_requests || 0}
                          </p>
                          <p className="text-xs text-muted-foreground">Failed</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-secondary">
                            {agent.agent_metrics?.[0]?.avg_response_time || 0}ms
                          </p>
                          <p className="text-xs text-muted-foreground">Avg Response</p>
                        </div>
                      </div>

                      {/* Success Rate Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Success Rate</span>
                          <span>
                            {agent.agent_metrics?.[0]?.total_requests > 0
                              ? Math.round(
                                  (agent.agent_metrics[0].successful_requests / agent.agent_metrics[0].total_requests) *
                                    100,
                                )
                              : 0}
                            %
                          </span>
                        </div>
                        <Progress
                          value={
                            agent.agent_metrics?.[0]?.total_requests > 0
                              ? (agent.agent_metrics[0].successful_requests / agent.agent_metrics[0].total_requests) *
                                100
                              : 0
                          }
                          className="h-2"
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="text-xs text-muted-foreground">
                          Last request:{" "}
                          {agent.agent_metrics?.[0]?.last_request_at
                            ? new Date(agent.agent_metrics[0].last_request_at).toLocaleString()
                            : "Never"}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <BarChart3 className="h-4 w-4 mr-1" />
                            Analytics
                          </Button>
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4 mr-1" />
                            Configure
                          </Button>
                          <Button variant={agent.status === "active" ? "outline" : "default"} size="sm">
                            {agent.status === "active" ? (
                              <>
                                <Pause className="h-4 w-4 mr-1" />
                                Pause
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4 mr-1" />
                                Resume
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <AgentPerformanceChart deployedAgents={deployedAgents} />
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <AgentActivityFeed recentActivity={recentActivity} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <AgentConfigPanel user={user} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
