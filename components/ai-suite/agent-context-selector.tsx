"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Cloud, Code, Link2, Layers, Bitcoin, Network, CheckCircle2, Circle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface AgentContextSelectorProps {
  agentId: string
  selectedContexts: string[]
  onContextsChange: (contexts: string[]) => void
}

const contextTypes = [
  {
    id: "mcp",
    name: "Model Context Protocol (MCP)",
    description: "Connect to MCP servers for enhanced context",
    icon: Layers,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    id: "api",
    name: "API Endpoints",
    description: "Connect to external APIs for data",
    icon: Link2,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    id: "cloud_native",
    name: "Cloud Native Services",
    description: "AWS, GCP, Azure, Vercel, Cloudflare",
    icon: Cloud,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    id: "sui",
    name: "Sui Blockchain",
    description: "Query Sui network for blockchain data",
    icon: Network,
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
  },
  {
    id: "canton",
    name: "Canton Network",
    description: "Enterprise blockchain network",
    icon: Code,
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
  },
  {
    id: "ethereum",
    name: "Ethereum",
    description: "Connect to Ethereum mainnet and L2s",
    icon: Bitcoin,
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
  },
  {
    id: "bitcoin",
    name: "Bitcoin",
    description: "Bitcoin network integration",
    icon: Bitcoin,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    id: "solana",
    name: "Solana",
    description: "High-performance blockchain",
    icon: Network,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    id: "aethernet",
    name: "AetherNet",
    description: "P2P messaging network",
    icon: Network,
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
  },
]

export function AgentContextSelector({ agentId, selectedContexts, onContextsChange }: AgentContextSelectorProps) {
  const safeSelectedContexts = Array.isArray(selectedContexts) ? selectedContexts : []

  const [connections, setConnections] = useState<Record<string, "connected" | "disconnected" | "error">>({
    mcp: "disconnected",
    api: "disconnected",
    cloud_native: "disconnected",
    sui: "connected",
    canton: "disconnected",
    ethereum: "disconnected",
    bitcoin: "disconnected",
    solana: "disconnected",
    aethernet: "disconnected",
  })

  const handleContextToggle = (contextId: string) => {
    const newContexts = safeSelectedContexts.includes(contextId)
      ? safeSelectedContexts.filter((id) => id !== contextId)
      : [...safeSelectedContexts, contextId]
    onContextsChange(newContexts)
  }

  const getConnectionIcon = (status: "connected" | "disconnected" | "error") => {
    switch (status) {
      case "connected":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Context Sources</CardTitle>
        <CardDescription>
          Select the context sources this agent can access. Each context type enables different capabilities and data
          sources.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {contextTypes.map((context) => {
            const Icon = context.icon
            const isSelected = safeSelectedContexts.includes(context.id)
            const connectionStatus = connections[context.id]

            return (
              <div
                key={context.id}
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-4 transition-all cursor-pointer hover:border-primary/50",
                  isSelected ? "border-primary bg-primary/5" : "border-border",
                )}
                onClick={() => handleContextToggle(context.id)}
              >
                <Checkbox checked={isSelected} onCheckedChange={() => handleContextToggle(context.id)} />

                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={cn("p-2 rounded-md", context.bgColor)}>
                      <Icon className={cn("h-4 w-4", context.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Label className="text-sm font-medium cursor-pointer">{context.name}</Label>
                    </div>
                    {getConnectionIcon(connectionStatus)}
                  </div>
                  <p className="text-xs text-muted-foreground">{context.description}</p>
                  {isSelected && connectionStatus === "disconnected" && (
                    <Button variant="outline" size="sm" className="w-full mt-2 bg-transparent">
                      Configure
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Selected contexts:</span>
            <Badge variant="secondary">
              {safeSelectedContexts.length} / {contextTypes.length}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
