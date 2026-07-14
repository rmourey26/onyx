"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bot, Workflow, Calendar, CheckCircle2, XCircle, Clock } from "lucide-react"

interface DataStream {
  id: string
  name: string
  type: "agent" | "workflow"
  status: "completed" | "failed" | "running"
  created_at: string
  results?: any
  has_output: boolean
}

interface DataStreamSelectorProps {
  selectedStreams: string[]
  onStreamsChange: (streams: string[]) => void
  mode?: "input" | "output"
}

export function DataStreamSelector({ selectedStreams, onStreamsChange, mode = "input" }: DataStreamSelectorProps) {
  const [agentStreams, setAgentStreams] = useState<DataStream[]>([])
  const [workflowStreams, setWorkflowStreams] = useState<DataStream[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const safeSelectedStreams = Array.isArray(selectedStreams) ? selectedStreams : []

  useEffect(() => {
    loadDataStreams()
  }, [])

  const loadDataStreams = async () => {
    setIsLoading(true)
    try {
      // Load agent execution results
      const agentResponse = await fetch("/api/data-streams/agents")
      if (agentResponse.ok) {
        const agentData = await agentResponse.json()
        setAgentStreams(Array.isArray(agentData) ? agentData : [])
      }

      // Load workflow execution results
      const workflowResponse = await fetch("/api/data-streams/workflows")
      if (workflowResponse.ok) {
        const workflowData = await workflowResponse.json()
        setWorkflowStreams(Array.isArray(workflowData) ? workflowData : [])
      }
    } catch (error) {
      console.error("Failed to load data streams:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStreamToggle = (streamId: string) => {
    if (safeSelectedStreams.includes(streamId)) {
      onStreamsChange(safeSelectedStreams.filter((id) => id !== streamId))
    } else {
      onStreamsChange([...safeSelectedStreams, streamId])
    }
  }

  const renderStreamList = (streams: DataStream[], type: "agent" | "workflow") => {
    const safeStreams = Array.isArray(streams) ? streams : []
    const filteredStreams = safeStreams.filter((stream) => {
      if (mode === "input") {
        return stream.status === "completed" && stream.has_output
      }
      return true
    })

    if (filteredStreams.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="text-muted-foreground mb-2">
            {type === "agent" ? (
              <Bot className="h-8 w-8 mx-auto mb-2" />
            ) : (
              <Workflow className="h-8 w-8 mx-auto mb-2" />
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            No {type} {mode === "input" ? "outputs" : "executions"} available
          </p>
        </div>
      )
    }

    return (
      <div className="space-y-2">
        {filteredStreams.map((stream) => (
          <div
            key={stream.id}
            className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => handleStreamToggle(stream.id)}
          >
            <Checkbox
              id={`stream-${stream.id}`}
              checked={safeSelectedStreams.includes(stream.id)}
              onCheckedChange={() => handleStreamToggle(stream.id)}
              className="mt-1"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium truncate">{stream.name}</p>
                {getStatusBadge(stream.status)}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(stream.created_at)}</span>
                {getStatusIcon(stream.status)}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Data Streams (Optional)</CardTitle>
        <CardDescription className="text-xs">
          {mode === "input"
            ? "Select outputs from previous agent or workflow executions to use as context"
            : "Select data streams to receive outputs from this execution"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="agents" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="agents" className="text-xs sm:text-sm">
              <Bot className="h-4 w-4 mr-1.5" />
              Agent Outputs
              {agentStreams.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {
                    (Array.isArray(agentStreams) ? agentStreams : []).filter(
                      (s) => s.status === "completed" && s.has_output,
                    ).length
                  }
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="workflows" className="text-xs sm:text-sm">
              <Workflow className="h-4 w-4 mr-1.5" />
              Workflow Outputs
              {workflowStreams.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {
                    (Array.isArray(workflowStreams) ? workflowStreams : []).filter(
                      (s) => s.status === "completed" && s.has_output,
                    ).length
                  }
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="agents" className="mt-4">
            <ScrollArea className="h-[200px] sm:h-[250px]">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-sm text-muted-foreground">Loading agent outputs...</div>
                </div>
              ) : (
                renderStreamList(agentStreams, "agent")
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="workflows" className="mt-4">
            <ScrollArea className="h-[200px] sm:h-[250px]">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-sm text-muted-foreground">Loading workflow outputs...</div>
                </div>
              ) : (
                renderStreamList(workflowStreams, "workflow")
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {safeSelectedStreams.length > 0 && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              {safeSelectedStreams.length} data stream{safeSelectedStreams.length !== 1 ? "s" : ""} selected
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Helper functions at module level
const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />
    case "failed":
      return <XCircle className="h-4 w-4 text-red-500" />
    case "running":
      return <Clock className="h-4 w-4 text-yellow-500" />
    default:
      return null
  }
}

const getStatusBadge = (status: string) => {
  const variants: Record<string, "default" | "secondary" | "destructive"> = {
    completed: "default",
    failed: "destructive",
    running: "secondary",
  }
  return (
    <Badge variant={variants[status] || "secondary"} className="text-xs">
      {status}
    </Badge>
  )
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}
