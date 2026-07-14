"use client"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Bot, Star } from "lucide-react"
import { AgentChatInterface } from "./agent-chat-interface"

interface PurchasedAgent {
  id: string
  name: string
  description: string
  avatar_url?: string
  category: string
  rating: number
  price: number
  creator_name: string
  capabilities: string[]
  purchase_date: string
  last_interaction?: string
  total_interactions: number
}

interface AgentInteractionDashboardProps {
  purchasedAgents: PurchasedAgent[]
  user: any
}

export function AgentInteractionDashboard({ purchasedAgents, user }: AgentInteractionDashboardProps) {
  const [selectedAgent, setSelectedAgent] = useState<PurchasedAgent | null>(null)

  if (purchasedAgents.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-12">
          <Bot className="h-16 w-16 mb-4 text-muted-foreground" />
          <CardTitle className="text-xl mb-2">No Agents Purchased</CardTitle>
          <CardDescription className="text-center mb-4">
            You haven't purchased any agents yet. Browse the marketplace to find AI agents that can help with your
            tasks.
          </CardDescription>
          <Button>Browse Marketplace</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My AI Agents</h1>
          <p className="text-muted-foreground">Interact with your purchased AI agents</p>
        </div>
        <Badge variant="secondary" className="text-lg px-3 py-1">
          {purchasedAgents.length} Agent{purchasedAgents.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="chat">Chat Interface</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Agent Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
                <Bot className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{purchasedAgents.length}</div>
                <p className="text-xs text-muted-foreground">Purchased agents</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Interactions</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {purchasedAgents.reduce((sum, agent) => sum + agent.total_interactions, 0)}
                </div>
                <p className="text-xs text-muted-foreground">Across all agents</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(purchasedAgents.reduce((sum, agent) => sum + agent.rating, 0) / purchasedAgents.length).toFixed(1)}
                </div>
                <p className="text-xs text-muted-foreground">Of your agents</p>
              </CardContent>
            </Card>
          </div>

          {/* Agent Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {purchasedAgents.map((agent) => (
              <Card key={agent.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={agent.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback>
                        <Bot className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{agent.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {agent.category}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs">{agent.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">{agent.description}</p>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Interactions:</span>
                      <span className="font-medium">{agent.total_interactions}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Purchased:</span>
                      <span className="font-medium">{new Date(agent.purchase_date).toLocaleDateString()}</span>
                    </div>
                    {agent.last_interaction && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Last used:</span>
                        <span className="font-medium">{new Date(agent.last_interaction).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Capabilities:</p>
                    <div className="flex flex-wrap gap-1">
                      {agent.capabilities.slice(0, 3).map((capability, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {capability}
                        </Badge>
                      ))}
                      {agent.capabilities.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{agent.capabilities.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => {
                      setSelectedAgent(agent)
                      // Switch to chat tab
                      const chatTab = document.querySelector('[value="chat"]') as HTMLElement
                      chatTab?.click()
                    }}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Start Chat
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="chat" className="space-y-6">
          {selectedAgent ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => setSelectedAgent(null)}>
                  ← Back to Dashboard
                </Button>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={selectedAgent.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback>
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">Chatting with {selectedAgent.name}</span>
                </div>
              </div>
              <AgentChatInterface agent={selectedAgent} user={user} isPurchased={true} />
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-12">
                <MessageSquare className="h-16 w-16 mb-4 text-muted-foreground" />
                <CardTitle className="text-xl mb-2">Select an Agent to Chat</CardTitle>
                <CardDescription className="text-center mb-4">
                  Choose an agent from your dashboard to start a conversation.
                </CardDescription>
                <Button
                  variant="outline"
                  onClick={() => {
                    const dashboardTab = document.querySelector('[value="dashboard"]') as HTMLElement
                    dashboardTab?.click()
                  }}
                >
                  Go to Dashboard
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
