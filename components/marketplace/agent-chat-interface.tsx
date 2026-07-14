"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Loader2, Send, Bot, User, Star, Shield, Zap } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

interface MarketplaceAgent {
  id: string
  name: string
  description: string
  avatar_url?: string
  category: string
  rating: number
  price: number
  creator_name: string
  capabilities: string[]
}

interface Message {
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  agent_id?: string
}

interface AgentChatInterfaceProps {
  agent: MarketplaceAgent
  user: any
  onPurchase?: (agentId: string) => void
  isPurchased?: boolean
}

export function AgentChatInterface({ agent, user, onPurchase, isPurchased = false }: AgentChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content: `Hello! I'm ${agent.name}. ${agent.description} How can I help you today?`,
      timestamp: new Date(),
      agent_id: agent.id,
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    if (!isPurchased) {
      toast({
        title: "Purchase Required",
        description: "You need to purchase this agent to interact with it.",
        variant: "destructive",
      })
      return
    }

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Simulate agent response - in real implementation, this would call the agent execution API
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const agentResponse: Message = {
        role: "assistant",
        content: `I understand you're asking about "${input}". As ${agent.name}, I can help you with ${agent.capabilities.slice(0, 2).join(" and ")}. Let me provide you with a detailed response based on my specialized knowledge in ${agent.category}.`,
        timestamp: new Date(),
        agent_id: agent.id,
      }

      setMessages((prev) => [...prev, agentResponse])
    } catch (error) {
      console.error("Error generating agent response:", error)
      toast({
        title: "Error",
        description: "Failed to get response from agent. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handlePurchase = () => {
    if (onPurchase) {
      onPurchase(agent.id)
    }
  }

  return (
    <div className="flex flex-col h-[600px]">
      {/* Agent Header */}
      <Card className="mb-4">
        <CardHeader className="pb-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={agent.avatar_url || "/placeholder.svg"} />
              <AvatarFallback>
                <Bot className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-xl">{agent.name}</CardTitle>
                <Badge variant="secondary">{agent.category}</Badge>
                {isPurchased && (
                  <Badge variant="default" className="bg-green-500">
                    <Shield className="h-3 w-3 mr-1" />
                    Owned
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground text-sm mb-2">{agent.description}</p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{agent.rating.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="h-4 w-4 text-blue-500" />
                  <span>${agent.price}</span>
                </div>
                <span className="text-muted-foreground">by {agent.creator_name}</span>
              </div>
            </div>
            {!isPurchased && (
              <Button onClick={handlePurchase} className="shrink-0">
                Purchase ${agent.price}
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Chat Interface */}
      <Card className="flex-1 flex flex-col">
        <CardContent className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-start gap-3 rounded-lg p-4",
                  message.role === "user"
                    ? "bg-primary/10 ml-10"
                    : message.role === "assistant"
                      ? "bg-muted mr-10"
                      : "bg-muted/50 italic text-muted-foreground text-sm",
                )}
              >
                {message.role === "user" ? (
                  <Avatar>
                    <AvatarImage src={user?.user_metadata?.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback>
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <Avatar>
                    <AvatarImage src={agent.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback className="bg-primary">
                      <Bot className="h-5 w-5 text-primary-foreground" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className="flex-1 overflow-hidden">
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{message.timestamp.toLocaleTimeString()}</div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3 rounded-lg p-4 bg-muted mr-10">
                <Avatar>
                  <AvatarImage src={agent.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="bg-primary">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">{agent.name} is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
        <CardFooter className="border-t p-4">
          {isPurchased ? (
            <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
              <Textarea
                placeholder={`Ask ${agent.name} anything...`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 min-h-[60px] max-h-[200px]"
                disabled={isLoading}
              />
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          ) : (
            <div className="w-full text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-muted-foreground mb-2">Purchase this agent to start chatting</p>
              <Button onClick={handlePurchase} size="lg">
                Purchase ${agent.price}
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
