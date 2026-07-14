"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bot, Plus, Settings } from "lucide-react"

interface MCPAgentConfiguratorProps {
  agents: any[]
  oauthClients: any[]
  userId: string
}

export function MCPAgentConfigurator({ agents, oauthClients, userId }: MCPAgentConfiguratorProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">MCP-Enabled AI Agents</h2>
          <p className="text-sm text-muted-foreground">Configure agents with OAuth 2.1 authentication</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create MCP Agent
        </Button>
      </div>

      {agents.length === 0 ? (
        <Card className="enterprise-card">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Bot className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No MCP Agents</h3>
            <p className="text-sm text-muted-foreground mb-4 text-center">
              Create your first OAuth-enabled AI agent with MCP support
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create MCP Agent
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {agents.map((agent) => (
            <Card key={agent.id} className="enterprise-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{agent.name}</CardTitle>
                    <CardDescription className="mt-1">{agent.description}</CardDescription>
                  </div>
                  <Badge variant={agent.is_active ? "default" : "secondary"}>
                    {agent.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Model</p>
                    <Badge variant="outline">{agent.model_id}</Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">OAuth Client</p>
                    <Badge variant="outline">{agent.parameters?.oauth_client_id || "Not configured"}</Badge>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-2">
                    MCP Contexts ({agent.ai_agent_contexts?.length || 0})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {agent.ai_agent_contexts?.map((context: any) => (
                      <Badge key={context.id} variant="secondary" className="capitalize">
                        {context.context_type}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure
                  </Button>
                  <Button variant="outline" size="sm">
                    Test Agent
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
