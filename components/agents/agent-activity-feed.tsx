"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Activity, CheckCircle, XCircle, AlertTriangle, Clock, Bot, Play, Pause, Settings } from "lucide-react"

interface AgentActivityFeedProps {
  recentActivity: any[]
}

export function AgentActivityFeed({ recentActivity }: AgentActivityFeedProps) {
  const getActivityIcon = (type: string, status?: string) => {
    switch (type) {
      case "request":
        return status === "success" ? (
          <CheckCircle className="h-4 w-4 text-accent" />
        ) : (
          <XCircle className="h-4 w-4 text-destructive" />
        )
      case "deployment":
        return <Bot className="h-4 w-4 text-primary" />
      case "status_change":
        return status === "active" ? (
          <Play className="h-4 w-4 text-accent" />
        ) : (
          <Pause className="h-4 w-4 text-yellow-500" />
        )
      case "configuration":
        return <Settings className="h-4 w-4 text-secondary" />
      case "error":
        return <AlertTriangle className="h-4 w-4 text-destructive" />
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getActivityColor = (type: string, status?: string) => {
    switch (type) {
      case "request":
        return status === "success" ? "text-accent" : "text-destructive"
      case "deployment":
        return "text-primary"
      case "status_change":
        return status === "active" ? "text-accent" : "text-yellow-600"
      case "configuration":
        return "text-secondary"
      case "error":
        return "text-destructive"
      default:
        return "text-muted-foreground"
    }
  }

  // Generate mock activity data if none provided
  const mockActivity =
    recentActivity.length === 0
      ? [
          {
            id: "1",
            type: "deployment",
            status: "success",
            message: 'Agent "Customer Support Bot" deployed successfully',
            created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            deployed_agents: {
              agent_name: "Customer Support Bot",
              ai_agents: { name: "Customer Support Bot" },
            },
          },
          {
            id: "2",
            type: "request",
            status: "success",
            message: "Processed customer inquiry about product features",
            created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
            deployed_agents: {
              agent_name: "Customer Support Bot",
              ai_agents: { name: "Customer Support Bot" },
            },
          },
          {
            id: "3",
            type: "status_change",
            status: "active",
            message: "Agent status changed to active",
            created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
            deployed_agents: {
              agent_name: "Data Analyzer",
              ai_agents: { name: "Data Analyzer" },
            },
          },
          {
            id: "4",
            type: "request",
            status: "error",
            message: "Request failed due to rate limit exceeded",
            created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
            deployed_agents: {
              agent_name: "Content Generator",
              ai_agents: { name: "Content Generator" },
            },
          },
          {
            id: "5",
            type: "configuration",
            status: "success",
            message: "Agent configuration updated successfully",
            created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
            deployed_agents: {
              agent_name: "Task Automator",
              ai_agents: { name: "Task Automator" },
            },
          },
        ]
      : recentActivity

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  return (
    <Card className="enterprise-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>Real-time feed of your agents' activities and status changes</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {mockActivity.map((activity, index) => (
              <div
                key={activity.id || index}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-shrink-0 mt-1">{getActivityIcon(activity.type, activity.status)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium truncate">
                      {activity.deployed_agents?.agent_name ||
                        activity.deployed_agents?.ai_agents?.name ||
                        "Unknown Agent"}
                    </p>
                    <Badge variant="outline" className={`text-xs ${getActivityColor(activity.type, activity.status)}`}>
                      {activity.type.replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{activity.message}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{formatTimeAgo(activity.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
