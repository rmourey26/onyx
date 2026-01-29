"use client"

import React from "react"

import { useState, useRef, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Bot, User, Send, Sparkles, Zap, Shield, Brain } from "lucide-react"
import { cn } from "@/lib/utils"

const suggestedQuestions = [
  { icon: Zap, text: "How does Onyx handle digital identity?", category: "Identity" },
  { icon: Shield, text: "What security features does Onyx provide?", category: "Security" },
  { icon: Brain, text: "How do AI agents work in Onyx?", category: "AI" },
]

export default function ChatPage() {
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  })

  const isLoading = status === "streaming" || status === "submitted"

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    sendMessage({ text: input })
    setInput("")
  }

  const handleSuggestionClick = (text: string) => {
    sendMessage({ text })
  }

  const getMessageText = (parts: typeof messages[0]["parts"]) => {
    return parts
      ?.filter((part): part is { type: "text"; text: string } => part.type === "text")
      .map((part) => part.text)
      .join("") || ""
  }

  return (
    <div className="min-h-screen py-10">
      <div className="container-tech max-w-4xl">
        {/* Header */}
        <div className="text-center mb-10">
          <Badge className="badge-tech mb-4">AI Assistant</Badge>
          <h1 className="text-4xl font-bold heading-gradient mb-4">Chat with Onyx AI</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Your intelligent assistant for blockchain, security, AI agents, and everything Onyx.
          </p>
        </div>

        {/* Chat Container */}
        <Card className="glass-panel min-h-[600px] flex flex-col">
          <CardHeader className="border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center">
                <Bot className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">Onyx AI</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {isLoading ? "Thinking..." : "Ready to help"}
                </p>
              </div>
              <div className="ml-auto">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-[450px]" ref={scrollRef}>
              <div className="p-6">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/20 to-cyan-500/20 flex items-center justify-center mb-6">
                      <Sparkles className="h-10 w-10 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Welcome to Onyx AI</h2>
                    <p className="text-muted-foreground text-center max-w-md mb-8">
                      I can help you understand blockchain technology, security best practices, AI agents, and everything about the Onyx platform.
                    </p>
                    
                    <div className="grid gap-3 w-full max-w-lg">
                      {suggestedQuestions.map((question, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(question.text)}
                          className="enterprise-card p-4 text-left flex items-center gap-4 hover:border-primary/50 transition-colors group"
                        >
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <question.icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{question.text}</p>
                            <p className="text-xs text-muted-foreground">{question.category}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex gap-4",
                          message.role === "user" ? "justify-end" : "justify-start"
                        )}
                      >
                        {message.role === "assistant" && (
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center flex-shrink-0">
                            <Bot className="h-5 w-5 text-primary-foreground" />
                          </div>
                        )}
                        <div
                          className={cn(
                            "max-w-[75%] rounded-2xl px-5 py-3",
                            message.role === "user"
                              ? "bg-primary text-primary-foreground rounded-br-md"
                              : "bg-muted rounded-bl-md"
                          )}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {getMessageText(message.parts)}
                          </p>
                        </div>
                        {message.role === "user" && (
                          <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                            <User className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex gap-4">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center">
                          <Bot className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <div className="bg-muted rounded-2xl rounded-bl-md px-5 py-4">
                          <div className="flex gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="h-2.5 w-2.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="h-2.5 w-2.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>

          {/* Input Area */}
          <div className="p-4 border-t border-border/50">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Onyx AI anything..."
                className="flex-1 input-tech h-12"
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="btn-tech h-12 px-6"
              >
                <Send className="h-5 w-5" />
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Powered by Vercel AI Gateway. Responses may vary.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
