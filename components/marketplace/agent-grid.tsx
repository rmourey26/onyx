"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Download, Eye, Zap, Shield, Clock, Link2, Sparkles } from "lucide-react"
import { useState } from "react"

interface Agent {
  id: string
  name: string
  description: string
  category: string
  price: number
  rating: number
  downloads: number
  image: string
  developer: string
  features: string[]
  status: "online" | "processing" | "offline"
  lastUpdated: string
  oauthEnabled?: boolean
  featured?: boolean
}

export function AgentGrid() {
  const [agents] = useState<Agent[]>([
    {
      id: "oauth-1",
      name: "OAuth Integration Suite",
      description:
        "Enterprise-grade OAuth 2.1 agent enabling seamless connections to Salesforce, HubSpot, and 50+ business apps with automatic token management.",
      category: "OAuth & Integration",
      price: 199,
      rating: 4.9,
      downloads: 8400,
      image: "/oauth-integration-dashboard.jpg",
      developer: "Kronova Labs",
      features: ["OAuth 2.1", "Auto Token Refresh", "50+ Integrations"],
      status: "online",
      lastUpdated: "1 day ago",
      oauthEnabled: true,
      featured: true,
    },
    {
      id: "oauth-2",
      name: "Multi-Chain OAuth Agent",
      description:
        "Connect and execute across Sui, Ethereum, and Solana blockchains with OAuth-secured wallet access and cross-chain transaction capabilities.",
      category: "OAuth & Blockchain",
      price: 249,
      rating: 4.8,
      downloads: 5200,
      image: "/blockchain-oauth-network.jpg",
      developer: "Kronova Labs",
      features: ["Multi-Chain Support", "OAuth Wallet Access", "Smart Contracts"],
      status: "online",
      lastUpdated: "3 hours ago",
      oauthEnabled: true,
      featured: true,
    },
    {
      id: "oauth-3",
      name: "AetherNet OAuth Connector",
      description:
        "Connect to AetherNet with OAuth authentication for decentralized messaging and secure communication across the Kronova platform.",
      category: "OAuth & Communication",
      price: 149,
      rating: 4.7,
      downloads: 3800,
      image: "/decentralized-network-communication.jpg",
      developer: "Kronova Labs",
      features: ["OAuth Authentication", "End-to-End Encryption", "AetherNet Protocol"],
      status: "online",
      lastUpdated: "2 days ago",
      oauthEnabled: true,
      featured: true,
    },
    {
      id: "1",
      name: "DataAnalyzer Pro",
      description:
        "Advanced data analysis and visualization agent with machine learning capabilities for business intelligence.",
      category: "Analytics",
      price: 99,
      rating: 4.8,
      downloads: 12500,
      image: "/data-analytics-dashboard.png",
      developer: "TechCorp AI",
      features: ["Real-time Processing", "API Integration", "Custom Training"],
      status: "online",
      lastUpdated: "2 days ago",
    },
    {
      id: "2",
      name: "ContentCreator AI",
      description:
        "Generate high-quality content across multiple formats including blogs, social media, and marketing copy.",
      category: "Content Creation",
      price: 79,
      rating: 4.6,
      downloads: 8900,
      image: "/content-creation-writing.png",
      developer: "CreativeAI Labs",
      features: ["Multi-language Support", "SEO Optimization", "Brand Voice"],
      status: "online",
      lastUpdated: "1 day ago",
    },
    {
      id: "3",
      name: "CustomerSupport Bot",
      description: "Intelligent customer service agent with natural language processing and sentiment analysis.",
      category: "Customer Service",
      price: 149,
      rating: 4.9,
      downloads: 15600,
      image: "/customer-service-chatbot.png",
      developer: "ServiceAI Inc",
      features: ["24/7 Availability", "Multi-channel", "Escalation Logic"],
      status: "online",
      lastUpdated: "3 hours ago",
    },
    {
      id: "4",
      name: "TaskAutomator",
      description:
        "Streamline repetitive tasks and workflows with intelligent automation and decision-making capabilities.",
      category: "Automation",
      price: 129,
      rating: 4.7,
      downloads: 9800,
      image: "/placeholder.svg?key=0t6zj",
      developer: "AutoFlow Systems",
      features: ["Workflow Builder", "Integration Hub", "Smart Triggers"],
      status: "processing",
      lastUpdated: "5 days ago",
    },
    {
      id: "5",
      name: "SecurityGuard AI",
      description: "Advanced threat detection and response agent for cybersecurity monitoring and incident management.",
      category: "Security",
      price: 299,
      rating: 4.9,
      downloads: 5400,
      image: "/placeholder.svg?key=cybsec",
      developer: "SecureAI Corp",
      features: ["Threat Detection", "Real-time Alerts", "Compliance Reports"],
      status: "online",
      lastUpdated: "1 hour ago",
    },
    {
      id: "6",
      name: "ProductivityAssistant",
      description: "Personal productivity agent that manages schedules, prioritizes tasks, and optimizes workflows.",
      category: "Productivity",
      price: 59,
      rating: 4.5,
      downloads: 18200,
      image: "/placeholder.svg?key=prodass",
      developer: "ProductiveAI",
      features: ["Calendar Integration", "Task Prioritization", "Time Tracking"],
      status: "online",
      lastUpdated: "6 hours ago",
    },
  ])

  const getStatusColor = (status: Agent["status"]) => {
    switch (status) {
      case "online":
        return "bg-accent/10 text-accent border-accent/30"
      case "processing":
        return "bg-primary/10 text-primary border-primary/30"
      case "offline":
        return "bg-muted/50 text-muted-foreground border-border/50"
    }
  }

  const getStatusIcon = (status: Agent["status"]) => {
    switch (status) {
      case "online":
        return <Zap className="h-3 w-3" />
      case "processing":
        return <Clock className="h-3 w-3" />
      case "offline":
        return <Shield className="h-3 w-3" />
    }
  }

  const oauthAgents = agents.filter((a) => a.oauthEnabled)
  const regularAgents = agents.filter((a) => !a.oauthEnabled)

  return (
    <div className="space-y-8">
      {oauthAgents.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold">OAuth-Enabled Agents</h2>
            </div>
            <Badge variant="secondary" className="oauth-badge">
              <Sparkles className="h-3 w-3" />
              Premium
            </Badge>
          </div>
          <p className="text-muted-foreground">Connect your apps and services securely with OAuth 2.1 authentication</p>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {oauthAgents.map((agent) => (
              <Card key={agent.id} className="oauth-card group">
                <CardHeader className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={agent.image || "/placeholder.svg"}
                      alt={agent.name}
                      className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <Badge variant="secondary" className="text-xs backdrop-blur-sm">
                        {agent.category}
                      </Badge>
                      {agent.featured && (
                        <Badge className="featured-badge backdrop-blur-sm">
                          <Sparkles className="h-3 w-3" />
                          Featured
                        </Badge>
                      )}
                    </div>
                    <div className="absolute top-3 right-3">
                      <div className={`status-indicator ${agent.status} text-xs backdrop-blur-sm`}>
                        {getStatusIcon(agent.status)}
                        <span className="capitalize">{agent.status}</span>
                      </div>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <div className="oauth-badge backdrop-blur-md">
                        <Link2 className="h-3 w-3" />
                        OAuth 2.1
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-5 space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg text-balance leading-tight group-hover:text-primary transition-colors">
                      {agent.name}
                    </h3>
                    <p className="text-sm text-muted-foreground text-pretty line-clamp-2">{agent.description}</p>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Avatar className="h-5 w-5 ring-2 ring-primary/20">
                      <AvatarImage
                        src={`/.jpg?key=gpij2&height=20&width=20&query=${agent.developer}`}
                      />
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {agent.developer
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{agent.developer}</span>
                    <span>•</span>
                    <span>Updated {agent.lastUpdated}</span>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{agent.rating}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Download className="h-4 w-4" />
                      <span>{agent.downloads.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {agent.features.map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </CardContent>

                <CardFooter className="p-5 pt-0 flex items-center justify-between border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-primary">${agent.price}</span>
                    <span className="text-sm text-muted-foreground">/month</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="hover:bg-primary/5 bg-transparent">
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    <Button size="sm" className="enterprise-button">
                      Deploy
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">All Agents</h2>
            <p className="text-sm text-muted-foreground">{regularAgents.length} agents available</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Sort by: Popular
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {regularAgents.map((agent) => (
            <Card key={agent.id} className="marketplace-card group">
              <CardHeader className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={agent.image || "/placeholder.svg"}
                    alt={agent.name}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge variant="secondary" className="text-xs">
                      {agent.category}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    <div className={`status-indicator ${agent.status} text-xs`}>
                      {getStatusIcon(agent.status)}
                      <span className="capitalize">{agent.status}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4 space-y-3">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg text-balance leading-tight">{agent.name}</h3>
                  <p className="text-sm text-muted-foreground text-pretty line-clamp-2">{agent.description}</p>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Avatar className="h-5 w-5">
                    <AvatarImage
                      src={`/.jpg?key=bzcgi&height=20&width=20&query=${agent.developer}`}
                    />
                    <AvatarFallback className="text-xs">
                      {agent.developer
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span>{agent.developer}</span>
                  <span>•</span>
                  <span>Updated {agent.lastUpdated}</span>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{agent.rating}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Download className="h-4 w-4" />
                    <span>{agent.downloads.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {agent.features.slice(0, 2).map((feature, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                  {agent.features.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{agent.features.length - 2} more
                    </Badge>
                  )}
                </div>
              </CardContent>

              <CardFooter className="p-4 pt-0 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-primary">${agent.price}</span>
                  <span className="text-sm text-muted-foreground">/month</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                  <Button size="sm" className="enterprise-button">
                    Deploy
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex justify-center pt-8">
        <Button variant="outline" size="lg" className="hover:bg-primary/5 hover:border-primary/30 bg-transparent">
          Load More Agents
        </Button>
      </div>
    </div>
  )
}
