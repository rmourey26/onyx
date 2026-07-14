"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Send, Bot, User, Settings, Sparkles } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { generateAIResponse } from "@/app/actions/ai-actions" // Import the action
import type { AIModel } from "@/lib/types/database"

interface AIChatProps {
  user: any
  aiModels: AIModel[]
}

interface Message {
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
}

export function AIChat({ user, aiModels }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content: "I am an AI assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState<string>(
    (() => {
      if (!aiModels || aiModels.length === 0) return "gpt-4o"

      return (
        aiModels.find((m) => m.model_id === "gpt-5")?.model_id ||
        aiModels.find((m) => m.model_id === "gpt-4.1")?.model_id ||
        aiModels.find((m) => m.model_id === "gpt-4o")?.model_id ||
        aiModels[0]?.model_id ||
        "gpt-4o"
      )
    })(),
  )
  const [temperature, setTemperature] = useState(0.7)
  const [showSettings, setShowSettings] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Remove all references to environment variables from client component
  // All API key handling will be done on the server

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const result = await generateAIResponse({
        messages: messages
          .filter((msg) => msg.role !== "system")
          .concat(userMessage)
          .map(({ role, content }) => ({ role, content })),
        model: selectedModel,
        temperature,
      })

      if (result.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: result.response,
            timestamp: new Date(),
          },
        ])
      } else {
        console.error("Error from AI response:", result.error)
        toast({
          title: "Error",
          description: result.error || "Failed to generate response",
          variant: "destructive",
        })

        // Add a more user-friendly error message in the chat
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `I'm sorry, I encountered an error: ${result.error || "Failed to generate response"}. ${
              selectedModel.includes("llama")
                ? "There might be an issue with the Meta Llama model. Please try another model."
                : "Please try again."
            }`,
            timestamp: new Date(),
          },
        ])
      }
    } catch (error) {
      console.error("Error generating AI response:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })

      // Add a more user-friendly error message in the chat
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `I'm sorry, I encountered an unexpected error. ${
            selectedModel.includes("llama")
              ? "There might be an issue with the Meta Llama model. Please try another model."
              : "Please try again."
          }`,
          timestamp: new Date(),
        },
      ])
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

  return (
    <div className="flex flex-col h-[calc(100vh-16rem)]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">AI Chat Assistant</h2>
        <Button variant="outline" size="icon" onClick={() => setShowSettings(!showSettings)}>
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {showSettings && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Chat Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">AI Model</label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {aiModels
                    .filter((model) => model.capabilities.includes("text"))
                    .sort((a, b) => {
                      const modelPriority = (model: string) => {
                        if (model.includes("gpt-5")) return 1000
                        if (model.includes("gpt-4.1")) return 900
                        if (model.includes("gpt-4o")) return 800
                        if (model.includes("gpt-4")) return 700
                        if (model.includes("claude-3.5")) return 600
                        if (model.includes("claude-3")) return 500
                        return 0
                      }
                      return modelPriority(b.model_id) - modelPriority(a.model_id)
                    })
                    .map((model) => (
                      <SelectItem key={model.model_id} value={model.model_id}>
                        {model.name}
                        {(model.model_id.includes("gpt-5") || model.model_id.includes("gpt-4.1")) && (
                          <span className="ml-2 text-xs bg-green-100 text-green-800 px-1 rounded">NEW</span>
                        )}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Temperature: {temperature}</label>
              </div>
              <Slider
                value={[temperature]}
                min={0}
                max={1}
                step={0.1}
                onValueChange={(value) => setTemperature(value[0])}
              />
              <p className="text-xs text-muted-foreground">
                Lower values produce more predictable responses, higher values produce more creative ones.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

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
                    <AvatarImage src={user.user_metadata?.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback>
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                ) : message.role === "assistant" ? (
                  <Avatar>
                    <AvatarFallback className="bg-primary">
                      <Bot className="h-5 w-5 text-primary-foreground" />
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <Avatar>
                    <AvatarFallback className="bg-muted-foreground/20">
                      <Sparkles className="h-5 w-5 text-muted-foreground" />
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
                  <AvatarFallback className="bg-primary">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">AI is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
        <CardFooter className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
            <Textarea
              placeholder="Type your message..."
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
        </CardFooter>
      </Card>
    </div>
  )
}
