"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Bot,
  Settings,
  TrendingUp,
  Link2,
  Pause,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Agent {
  id: string
  name: string
  category: string
  status: "active" | "paused" | "error"
  lastRun: string
  totalRuns: number
  successRate: number
  avgResponseTime: number
  oauthConnections: number
  isOAuthEnabled: boolean
}

export function AgentManagementDashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false)

  const [agents] = useState<Agent[]>([
    {
      id: "1",
      name: "Salesforce OAuth Sync",
      category: "CRM Integration",
      status: "active",
      lastRun: "2 minutes ago",
      totalRuns: 1247,
      successRate: 98.5,
      avgResponseTime: 1.2,
      oauthConnections: 3,
      isOAuthEnabled: true,
    },
    {
      id: "2",
      name: "Multi-Chain Asset Tracker",
      category: "Blockchain",
      status: "active",
      lastRun: "15 minutes ago",
      totalRuns: 892,
      successRate: 99.1,
      avgResponseTime: 2.4,
      oauthConnections: 5,
      isOAuthEnabled: true,
    },
    {
      id: "3",
      name: "Data Analytics Pro",
      category: "Analytics",
      status: "active",
      lastRun: "1 hour ago",
      totalRuns: 3421,
      successRate: 97.8,
      avgResponseTime: 0.8,
      oauthConnections: 0,
      isOAuthEnabled: false,
    },
    {
      id: "4",
      name: "Customer Support Bot",
      category: "Customer Service",
      status: "paused",
      lastRun: "2 days ago",
      totalRuns: 5632,
      successRate: 96.2,
      avgResponseTime: 1.5,
      oauthConnections: 0,
      isOAuthEnabled: false,
    },
    {
      id: "5",
      name: "AetherNet Messenger",
      category: "Communication",
      status: "error",
      lastRun: "1 day ago",
      totalRuns: 234,
      successRate: 94.3,
      avgResponseTime: 3.1,
      oauthConnections: 1,
      isOAuthEnabled: true,
    },
  ])

  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === "all" || agent.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusIcon = (status: Agent["status"]) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4" />
      case "paused":
        return <Pause className="h-4 w-4" />
      case "error":
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: Agent["status"]) => {
    switch (status) {
      case "active":
        return "bg-accent/10 text-accent border-accent/30"
      case "paused":
        return "bg-muted text-muted-foreground border-border"
      case "error":
        return "bg-destructive/10 text-destructive border-destructive/30"
    }
  }

  // Calculate summary stats
  const totalAgents = agents.length
  const activeAgents = agents.filter((a) => a.status === "active").length
  const totalRuns = agents.reduce((sum, a) => sum + a.totalRuns, 0)
  const avgSuccessRate = agents.reduce((sum, a) => sum + a.successRate, 0) / agents.length

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="marketplace-hero">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-balance">
                Agent <span className="enterprise-text-gradient">Management</span>
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Monitor, configure, and optimize your deployed marketplace agents
              </p>
            </div>
            <Button className="enterprise-button" size="lg">
              <Bot className="h-5 w-5 mr-2" />
              Deploy New Agent
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Summary Stats */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card className="enterprise-card">
            <CardHeader className="pb-3">
              <CardDescription>Total Agents</CardDescription>
              <CardTitle className="text-3xl">{totalAgents}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Bot className="h-4 w-4" />
                <span>{activeAgents} active</span>
              </div>
            </CardContent>
          </Card>

          <Card className="enterprise-card">
            <CardHeader className="pb-3">
              <CardDescription>Total Executions</CardDescription>
              <CardTitle className="text-3xl">{totalRuns.toLocaleString()}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-accent">
                <TrendingUp className="h-4 w-4" />
                <span>+12% this week</span>
              </div>
            </CardContent>
          </Card>

          <Card className="enterprise-card">
            <CardHeader className="pb-3">
              <CardDescription>Success Rate</CardDescription>
              <CardTitle className="text-3xl">{avgSuccessRate.toFixed(1)}%</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4" />
                <span>Excellent</span>
              </div>
            </CardContent>
          </Card>

          <Card className="enterprise-card">
            <CardHeader className="pb-3">
              <CardDescription>OAuth Agents</CardDescription>
              <CardTitle className="text-3xl">{agents.filter((a) => a.isOAuthEnabled).length}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-primary">
                <Link2 className="h-4 w-4" />
                <span>Connected</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search agents by name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 enterprise-input"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-48 enterprise-input">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Agents</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="paused">Paused Only</SelectItem>
              <SelectItem value="error">Errors Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Agents Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAgents.map((agent) => (
            <Card key={agent.id} className={agent.isOAuthEnabled ? "oauth-card" : "marketplace-card"}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl flex items-center gap-2">
                      {agent.name}
                      {agent.isOAuthEnabled && (
                        <Badge className="oauth-badge">
                          <Link2 className="h-3 w-3" />
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-2">{agent.category}</CardDescription>
                  </div>
                  <Badge className={`${getStatusColor(agent.status)} flex items-center gap-1`}>
                    {getStatusIcon(agent.status)}
                    {agent.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Total Runs</p>
                    <p className="text-lg font-bold">{agent.totalRuns.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Success Rate</p>
                    <p className="text-lg font-bold">{agent.successRate}%</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Avg Response</p>
                    <p className="text-sm font-medium">{agent.avgResponseTime}s</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Last Run</p>
                    <p className="text-sm font-medium">{agent.lastRun}</p>
                  </div>
                </div>

                {agent.isOAuthEnabled && (
                  <div className="pt-3 border-t border-border/50">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">OAuth Connections</span>
                      <span className="font-semibold text-primary">{agent.oauthConnections} active</span>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-transparent"
                  onClick={() => {
                    setSelectedAgent(agent)
                    setIsConfigDialogOpen(true)
                  }}
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Configure
                </Button>
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Analytics
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredAgents.length === 0 && (
          <Card className="enterprise-card">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bot className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No agents found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery || filterStatus !== "all"
                  ? "Try adjusting your filters"
                  : "Deploy your first agent to get started"}
              </p>
              {!searchQuery && filterStatus === "all" && (
                <Button className="enterprise-button">Browse Marketplace</Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Configuration Dialog */}
      <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Configure Agent</DialogTitle>
            <DialogDescription>Manage settings and OAuth connections for {selectedAgent?.name}</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="general" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="oauth">OAuth</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="agent-name">Agent Name</Label>
                <Input id="agent-name" defaultValue={selectedAgent?.name} className="enterprise-input" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select defaultValue={selectedAgent?.category}>
                  <SelectTrigger id="category" className="enterprise-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CRM Integration">CRM Integration</SelectItem>
                    <SelectItem value="Blockchain">Blockchain</SelectItem>
                    <SelectItem value="Analytics">Analytics</SelectItem>
                    <SelectItem value="Customer Service">Customer Service</SelectItem>
                    <SelectItem value="Communication">Communication</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-start on Deploy</Label>
                  <p className="text-sm text-muted-foreground">Automatically start agent after deployment</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Monitoring</Label>
                  <p className="text-sm text-muted-foreground">Send performance alerts and notifications</p>
                </div>
                <Switch defaultChecked />
              </div>
            </TabsContent>

            <TabsContent value="oauth" className="space-y-4 mt-4">
              {selectedAgent?.isOAuthEnabled ? (
                <>
                  <div className="space-y-3">
                    <Label>Connected Applications</Label>
                    <div className="space-y-2">
                      {["Salesforce", "HubSpot", "Stripe"].map((app, i) => (
                        <div
                          key={app}
                          className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <Link2 className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{app}</p>
                              <p className="text-xs text-muted-foreground">
                                Connected {i + 1} day{i !== 0 ? "s" : ""} ago
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" className="bg-transparent">
                            Disconnect
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button className="w-full enterprise-button">
                    <Link2 className="h-4 w-4 mr-2" />
                    Add OAuth Connection
                  </Button>
                </>
              ) : (
                <div className="text-center py-8">
                  <Link2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h4 className="text-lg font-semibold mb-2">OAuth Not Enabled</h4>
                  <p className="text-sm text-muted-foreground mb-4">This agent doesn't support OAuth integrations</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="max-concurrent">Max Concurrent Runs</Label>
                <Input id="max-concurrent" type="number" defaultValue="5" className="enterprise-input" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeout">Execution Timeout (seconds)</Label>
                <Input id="timeout" type="number" defaultValue="30" className="enterprise-input" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="retry">Retry Attempts</Label>
                <Input id="retry" type="number" defaultValue="3" className="enterprise-input" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Rate Limiting</Label>
                  <p className="text-sm text-muted-foreground">Limit executions to prevent quota overuse</p>
                </div>
                <Switch />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsConfigDialogOpen(false)} className="bg-transparent">
              Cancel
            </Button>
            <Button className="enterprise-button" onClick={() => setIsConfigDialogOpen(false)}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
