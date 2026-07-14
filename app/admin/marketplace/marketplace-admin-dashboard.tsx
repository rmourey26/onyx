"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Bot,
  Users,
  ShoppingCart,
  Star,
  DollarSign,
  TrendingUp,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Shield,
  UserCog,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface MarketplaceStats {
  totalAgents: number
  totalUsers: number
  totalPurchases: number
  totalReviews: number
  totalRevenue: number
}

interface MarketplaceAgent {
  id: string
  name: string
  description: string
  category: string
  price: number
  rating: number
  status: "active" | "pending" | "rejected"
  creator_name: string
  created_at: string
}

interface RecentPurchase {
  id: string
  amount: number
  created_at: string
  profiles: { full_name: string; email: string }
  marketplace_agents: { name: string }
}

interface UserProfile {
  id: string
  full_name: string | null
  email: string | null
  role: "admin" | "editor" | "viewer" | null
  is_admin: boolean | null
  created_at: string
  avatar_url: string | null
}

interface MarketplaceAdminDashboardProps {
  stats: MarketplaceStats
  agents: MarketplaceAgent[]
  recentPurchases: RecentPurchase[]
  pendingAgents: MarketplaceAgent[]
  allUsers: UserProfile[]
  user: any
}

export function MarketplaceAdminDashboard({
  stats,
  agents,
  recentPurchases,
  pendingAgents,
  allUsers,
  user,
}: MarketplaceAdminDashboardProps) {
  const [selectedAgent, setSelectedAgent] = useState<MarketplaceAgent | null>(null)
  const [isViewingAgent, setIsViewingAgent] = useState(false)
  const [isEditingAgent, setIsEditingAgent] = useState(false)
  const { toast } = useToast()

  const handleApproveAgent = async (agentId: string) => {
    try {
      // In a real implementation, this would call an API to approve the agent
      toast({
        title: "Agent Approved",
        description: "The agent has been approved and is now live in the marketplace.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve agent. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleRejectAgent = async (agentId: string) => {
    try {
      // In a real implementation, this would call an API to reject the agent
      toast({
        title: "Agent Rejected",
        description: "The agent has been rejected and will not appear in the marketplace.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject agent. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAgent = async (agentId: string) => {
    if (!confirm("Are you sure you want to delete this agent? This action cannot be undone.")) {
      return
    }

    try {
      // In a real implementation, this would call an API to delete the agent
      toast({
        title: "Agent Deleted",
        description: "The agent has been permanently deleted from the marketplace.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete agent. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getRoleBadgeVariant = (role: string | null, isAdmin: boolean | null) => {
    if (isAdmin) return "default"
    if (role === "admin") return "default"
    if (role === "editor") return "secondary"
    return "outline"
  }

  const getRoleDisplay = (role: string | null, isAdmin: boolean | null) => {
    if (isAdmin) return "Super Admin"
    if (role === "admin") return "Admin"
    if (role === "editor") return "Editor"
    if (role === "viewer") return "Viewer"
    return "User"
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Marketplace Admin</h1>
          <p className="text-muted-foreground">Manage the AI agent marketplace</p>
        </div>
        <Badge variant="secondary" className="text-lg px-3 py-1">
          Admin Dashboard
        </Badge>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAgents}</div>
            <p className="text-xs text-muted-foreground">Active marketplace agents</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPurchases}</div>
            <p className="text-xs text-muted-foreground">Agent purchases</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReviews}</div>
            <p className="text-xs text-muted-foreground">User reviews</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Marketplace revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingAgents.length})</TabsTrigger>
          <TabsTrigger value="purchases">Purchases</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Recent Purchases */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Purchases</CardTitle>
                <CardDescription>Latest agent purchases in the marketplace</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentPurchases.slice(0, 5).map((purchase) => (
                    <div key={purchase.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{purchase.marketplace_agents.name}</p>
                        <p className="text-sm text-muted-foreground">{purchase.profiles.full_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${purchase.amount}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(purchase.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pending Approvals */}
            <Card>
              <CardHeader>
                <CardTitle>Pending Approvals</CardTitle>
                <CardDescription>Agents waiting for admin approval</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingAgents.slice(0, 5).map((agent) => (
                    <div key={agent.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{agent.name}</p>
                        <p className="text-sm text-muted-foreground">{agent.creator_name}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleApproveAgent(agent.id)}>
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleRejectAgent(agent.id)}>
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>Manage all registered users and their roles</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allUsers.map((userProfile) => (
                    <TableRow key={userProfile.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={userProfile.avatar_url || undefined} />
                            <AvatarFallback>
                              {userProfile.full_name
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{userProfile.full_name || "Unknown"}</p>
                            <p className="text-xs text-muted-foreground">ID: {userProfile.id.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{userProfile.email || "No email"}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(userProfile.role, userProfile.is_admin)}>
                          {userProfile.is_admin && <Shield className="h-3 w-3 mr-1" />}
                          {getRoleDisplay(userProfile.role, userProfile.is_admin)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {new Date(userProfile.created_at).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <UserCog className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Agents</CardTitle>
              <CardDescription>Manage all agents in the marketplace</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agents.map((agent) => (
                    <TableRow key={agent.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{agent.name}</p>
                          <p className="text-sm text-muted-foreground">{agent.creator_name}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{agent.category}</Badge>
                      </TableCell>
                      <TableCell>${agent.price}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{agent.rating.toFixed(1)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            agent.status === "active"
                              ? "default"
                              : agent.status === "pending"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {agent.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedAgent(agent)
                              setIsViewingAgent(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedAgent(agent)
                              setIsEditingAgent(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteAgent(agent.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Agents</CardTitle>
              <CardDescription>Review and approve agents submitted to the marketplace</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {pendingAgents.map((agent) => (
                  <Card key={agent.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{agent.name}</CardTitle>
                          <CardDescription>{agent.creator_name}</CardDescription>
                        </div>
                        <Badge variant="secondary">{agent.category}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-3">{agent.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">${agent.price}</span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(agent.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button className="flex-1" onClick={() => handleApproveAgent(agent.id)}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 bg-transparent"
                          onClick={() => handleRejectAgent(agent.id)}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="purchases" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Purchase History</CardTitle>
              <CardDescription>All agent purchases in the marketplace</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Agent</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentPurchases.map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{purchase.profiles.full_name}</p>
                          <p className="text-sm text-muted-foreground">{purchase.profiles.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{purchase.marketplace_agents.name}</TableCell>
                      <TableCell>${purchase.amount}</TableCell>
                      <TableCell>{new Date(purchase.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>Marketplace revenue over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                  <TrendingUp className="h-8 w-8 mr-2" />
                  Revenue chart would go here
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Popular Categories</CardTitle>
                <CardDescription>Most popular agent categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["Customer Support", "Data Analysis", "Content Creation", "Code Generation"].map(
                    (category, index) => (
                      <div key={category} className="flex items-center justify-between">
                        <span>{category}</span>
                        <Badge variant="secondary">{Math.floor(Math.random() * 50) + 10} agents</Badge>
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* View Agent Dialog */}
      <Dialog open={isViewingAgent} onOpenChange={setIsViewingAgent}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedAgent?.name}</DialogTitle>
            <DialogDescription>Agent details and information</DialogDescription>
          </DialogHeader>
          {selectedAgent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Creator</label>
                  <p className="text-sm text-muted-foreground">{selectedAgent.creator_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <p className="text-sm text-muted-foreground">{selectedAgent.category}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Price</label>
                  <p className="text-sm text-muted-foreground">${selectedAgent.price}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Rating</label>
                  <p className="text-sm text-muted-foreground">{selectedAgent.rating.toFixed(1)}/5</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <p className="text-sm text-muted-foreground mt-1">{selectedAgent.description}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewingAgent(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
