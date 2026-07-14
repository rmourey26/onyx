"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Network, MessageSquare, Database } from "lucide-react"

interface AetherNetMonitorProps {
  connections: any[]
  messages: any[]
  userId: string
}

export function AetherNetMonitor({ connections, messages, userId }: AetherNetMonitorProps) {
  const activeConnections = connections.filter((c) => c.connection_status === "connected")
  const messagesThisMonth = messages.filter((m) => {
    const created = new Date(m.created_at)
    const now = new Date()
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">AetherNet QUAS Network</h2>
        <p className="text-sm text-muted-foreground">Canton settlement layer, KVS agent state, and post-quantum secure communication</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="enterprise-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Network Status
            </CardTitle>
            <CardDescription>Active QUAS settlement connections and health metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Active Connections</span>
              <span className="text-2xl font-bold">{activeConnections.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Connections</span>
              <span className="text-2xl font-bold">{connections.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Network Health</span>
              <Badge variant="default" className="bg-green-500/10 text-green-700 dark:text-green-400">
                Excellent
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              AetherNet KVS
            </CardTitle>
            <CardDescription>Distributed key-value store for agent state and workflow checkpointing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">KVS Namespaces</span>
              <span className="text-2xl font-bold text-muted-foreground">—</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Checkpointed Workflows</span>
              <span className="text-2xl font-bold text-muted-foreground">—</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant="outline" className="border-amber-500/50 text-amber-600 dark:text-amber-400">
                Enterprise Pilot
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Settlement Activity
            </CardTitle>
            <CardDescription>QUAS Canton settlement and message metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Messages</span>
              <span className="text-2xl font-bold">{messages.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">This Month</span>
              <span className="text-2xl font-bold">{messagesThisMonth.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Encryption</span>
              <Badge variant="default" className="bg-blue-500/10 text-blue-700 dark:text-blue-400">
                Enabled (E2EE)
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="enterprise-card">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest settlement events via AetherNet QUAS protocol</CardDescription>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">No messages yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.slice(0, 10).map((message) => (
                <div
                  key={message.id}
                  className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{message.subject}</p>
                    <p className="text-xs text-muted-foreground">{new Date(message.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {message.encrypted && (
                      <Badge variant="secondary" className="text-xs">
                        E2EE
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs capitalize">
                      {message.priority || "normal"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
