"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Network,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  Inbox,
  Settings,
  Activity,
  TrendingUp,
  MessageSquare,
  Zap,
} from "lucide-react"
import { AetherNetConnectionDialog } from "@/components/ai-suite/aethernet-connection-dialog"
import { cn } from "@/lib/utils"

interface Connection {
  id: string
  connection_name: string
  aethernet_address: string
  network_type: string
  connection_status: string
  last_active: string | null
  created_at: string
}

interface Message {
  id: string
  subject: string
  body: string
  priority: string
  encrypted: boolean
  status: string
  sent_at: string
  sender: {
    id: string
    full_name: string
    avatar_url: string | null
  }
}

interface ProtocolSettings {
  id: string
  encryption_enabled: boolean
  default_priority: string
  auto_retry: boolean
  max_retries: number
}

interface AetherNetDashboardClientProps {
  connections: Connection[]
  messages: Message[]
  protocolSettings: ProtocolSettings | null
  userId: string
}

export function AetherNetDashboardClient({
  connections,
  messages,
  protocolSettings,
  userId,
}: AetherNetDashboardClientProps) {
  const [showConnectionDialog, setShowConnectionDialog] = useState(false)
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "text-green-500"
      case "pending":
        return "text-yellow-500"
      case "error":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle2 className="h-4 w-4" />
      case "pending":
        return <Clock className="h-4 w-4" />
      case "error":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Network className="h-4 w-4" />
    }
  }

  const stats = [
    {
      label: "Active Connections",
      value: connections.filter((c) => c.connection_status === "connected").length,
      icon: Network,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Messages Sent",
      value: messages.length,
      icon: Send,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Network Health",
      value: "Excellent",
      icon: Activity,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      label: "Encryption",
      value: protocolSettings?.encryption_enabled ? "Enabled" : "Disabled",
      icon: Zap,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
  ]

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20">
              <Network className="h-6 w-6 text-pink-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">AetherNet Dashboard</h1>
              <p className="text-sm text-muted-foreground">Decentralized P2P messaging network</p>
            </div>
          </div>
          <Button onClick={() => setShowConnectionDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Connection
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={cn("p-3 rounded-lg", stat.bgColor)}>
                    <Icon className={cn("h-5 w-5", stat.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Tabs defaultValue="connections" className="space-y-6">
        <TabsList>
          <TabsTrigger value="connections" className="flex items-center gap-2">
            <Network className="h-4 w-4" />
            Connections
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Connections Tab */}
        <TabsContent value="connections" className="space-y-6">
          {connections.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Network className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No AetherNet Connections</h3>
                <p className="text-sm text-muted-foreground mb-4">Create your first connection to get started</p>
                <Button onClick={() => setShowConnectionDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Connection
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {connections.map((connection) => (
                <Card key={connection.id} className="hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20">
                          <Network className="h-5 w-5 text-pink-500" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{connection.connection_name}</CardTitle>
                          <CardDescription className="text-xs mt-1">{connection.aethernet_address}</CardDescription>
                        </div>
                      </div>
                      <div className={cn("flex items-center gap-1", getStatusColor(connection.connection_status))}>
                        {getStatusIcon(connection.connection_status)}
                        <span className="text-xs font-medium capitalize">{connection.connection_status}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Network</p>
                        <Badge variant="secondary">{connection.network_type}</Badge>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Last Active</p>
                        <p className="text-xs">
                          {connection.last_active ? new Date(connection.last_active).toLocaleString() : "Never"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                        Test Connection
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                        Configure
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Messages</CardTitle>
              <CardDescription>Messages sent via AetherNet protocol</CardDescription>
            </CardHeader>
            <CardContent>
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">No messages yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                            {message.sender.full_name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{message.subject}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(message.sent_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {message.encrypted && (
                            <Badge variant="secondary" className="text-xs">
                              Encrypted
                            </Badge>
                          )}
                          <Badge variant="secondary" className="text-xs capitalize">
                            {message.priority}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{message.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Network Performance</CardTitle>
                <CardDescription>Message delivery and latency metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Success Rate</span>
                      <span className="text-sm font-semibold">99.2%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: "99.2%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Avg Latency</span>
                      <span className="text-sm font-semibold">45ms</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: "75%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Connection Uptime</span>
                      <span className="text-sm font-semibold">99.9%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500" style={{ width: "99.9%" }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage Statistics</CardTitle>
                <CardDescription>Message volume and bandwidth</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Messages</span>
                    <span className="text-2xl font-bold">{messages.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">This Month</span>
                    <span className="text-2xl font-bold">847</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Bandwidth Used</span>
                    <span className="text-2xl font-bold">2.4 GB</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Protocol Settings</CardTitle>
              <CardDescription>Configure AetherNet protocol behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>End-to-End Encryption</Label>
                    <p className="text-xs text-muted-foreground">Encrypt all messages by default</p>
                  </div>
                  <Badge variant={protocolSettings?.encryption_enabled ? "default" : "secondary"}>
                    {protocolSettings?.encryption_enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Default Priority</Label>
                <div className="flex gap-2">
                  {["low", "normal", "high", "critical"].map((priority) => (
                    <Badge
                      key={priority}
                      variant={protocolSettings?.default_priority === priority ? "default" : "outline"}
                      className="cursor-pointer capitalize"
                    >
                      {priority}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto Retry</Label>
                    <p className="text-xs text-muted-foreground">Automatically retry failed messages</p>
                  </div>
                  <Badge variant={protocolSettings?.auto_retry ? "default" : "secondary"}>
                    {protocolSettings?.auto_retry ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-retries">Max Retries</Label>
                <Input id="max-retries" type="number" value={protocolSettings?.max_retries || 3} className="max-w-xs" />
              </div>

              <Button>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Connection Dialog */}
      <AetherNetConnectionDialog open={showConnectionDialog} onOpenChange={setShowConnectionDialog} />
    </div>
  )
}
