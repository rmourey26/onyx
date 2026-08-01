"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import {
  X, Send, ChevronDown, Loader2, Bot,
  Mic, MicOff, Settings2, ChevronRight, Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import {
  sendSupportMessage,
  closeSupportConversation,
  transcribeSupportAudio,
} from "@/app/actions/support-chat-actions"
import { getAIModelsByType } from "@/app/actions/ai-model-actions"
import Image from "next/image"

// ---------------------------------------------------------------------------
// Fallback model list — used when DB fetch fails
// ---------------------------------------------------------------------------
const FALLBACK_MODELS = [
  { id: "openai/gpt-5",           label: "GPT-5",           provider: "OpenAI",    badge: "Flagship" },
  { id: "openai/gpt-5-mini",      label: "GPT-5 Mini",      provider: "OpenAI",    badge: "Fast" },
  { id: "anthropic/claude-sonnet-5", label: "Claude Sonnet 5", provider: "Anthropic", badge: "Balanced" },
  { id: "google/gemini-3-5-flash","label": "Gemini 3.5 Flash", provider: "Google",  badge: "Fast" },
  { id: "x-ai/grok-4-5",         label: "Grok 4.5",        provider: "xAI",       badge: null },
]

function badgeForModel(name: string, provider: string, index: number): string | null {
  const n = name.toLowerCase()
  if (index === 0) return "Recommended"
  if (n.includes("mini") || n.includes("flash") || n.includes("haiku") || n.includes("fast")) return "Fast"
  if (n.includes("pro") || n.includes("opus") || n.includes("o3") || n.includes("sol") || n.includes("fable")) return "Powerful"
  if (n.includes("balanced") || n.includes("sonnet") || n.includes("terra") || n.includes("balanced")) return "Balanced"
  return null
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type InputMode = "text" | "voice"

interface ModelOption {
  id: string
  label: string
  provider: string
  badge: string | null
}

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: Date
  inputMode?: InputMode
}

interface SupportChatWidgetProps {
  externalOpen?: boolean
  onExternalClose?: () => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function SupportChatWidget({ externalOpen, onExternalClose }: SupportChatWidgetProps = {}) {
  const [isOpen, setIsOpen]               = useState(false)
  const [isMinimized, setIsMinimized]     = useState(false)
  const [messages, setMessages]           = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi, I'm Kairo — Kronova's support assistant. Ask me anything about the platform, AetherNet QUAS, agent orchestration, or the Enterprise Pilot Program.",
      timestamp: new Date(),
    },
  ])
  const [input, setInput]                 = useState("")
  const [isLoading, setIsLoading]         = useState(false)
  const [unread, setUnread]               = useState(0)
  const [models, setModels]               = useState<ModelOption[]>(FALLBACK_MODELS)
  const [modelsLoading, setModelsLoading] = useState(true)
  const [selectedModel, setSelectedModel] = useState<ModelOption>(FALLBACK_MODELS[0])
  const [inputMode, setInputMode]         = useState<InputMode>("text")
  const [conversationId, setConversationId] = useState<string | null>(null)

  // Voice state
  const [isRecording, setIsRecording]       = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [recordingTime, setRecordingTime]   = useState(0)
  const mediaRecorderRef                    = useRef<MediaRecorder | null>(null)
  const audioChunksRef                      = useRef<Blob[]>([])
  const recordingTimerRef                   = useRef<NodeJS.Timeout | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef    = useRef<HTMLTextAreaElement>(null)

  // ------------------------------------------------------------------
  // Fetch live models from ai_models table on first open
  // ------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false
    async function fetchModels() {
      setModelsLoading(true)
      try {
        const result = await getAIModelsByType("chat")
        if (cancelled) return
        if (result.success && result.data && result.data.length > 0) {
          const mapped: ModelOption[] = result.data.map((m: any, i: number) => ({
            id: `${m.provider.toLowerCase()}/${m.model_id}`,
            label: m.name,
            provider: m.provider,
            badge: badgeForModel(m.name, m.provider, i),
          }))
          setModels(mapped)
          setSelectedModel(mapped[0])
        }
      } catch {
        // Keep fallback models
      } finally {
        if (!cancelled) setModelsLoading(false)
      }
    }
    fetchModels()
    return () => { cancelled = true }
  }, [])

  // Sync external open signal (from UnifiedFAB / support page)
  useEffect(() => {
    if (externalOpen) {
      setIsOpen(true)
      setIsMinimized(false)
    }
  }, [externalOpen])

  // Close conversation on unmount
  useEffect(() => {
    return () => {
      if (conversationId) closeSupportConversation(conversationId)
    }
  }, [conversationId])

  // ------------------------------------------------------------------
  // Scroll
  // ------------------------------------------------------------------
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom()
      setUnread(0)
    }
  }, [messages, isOpen, isMinimized, scrollToBottom])

  // ------------------------------------------------------------------
  // Recording timer
  // ------------------------------------------------------------------
  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000)
    } else {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current)
      setRecordingTime(0)
    }
    return () => { if (recordingTimerRef.current) clearInterval(recordingTimerRef.current) }
  }, [isRecording])

  // ------------------------------------------------------------------
  // Send message
  // ------------------------------------------------------------------
  const sendMessage = useCallback(async (text: string, mode: InputMode) => {
    if (!text.trim() || isLoading) return

    const userMsg: Message = { role: "user", content: text.trim(), timestamp: new Date(), inputMode: mode }
    setMessages(prev => [...prev, userMsg])
    setIsLoading(true)

    try {
      const history = messages
        .filter((_, i) => i > 0)
        .map(({ role, content }) => ({ role, content }))

      const result = await sendSupportMessage(
        conversationId,
        [...history, { role: "user", content: text.trim() }],
        selectedModel.id,
        mode,
      )

      if (result.conversationId && !conversationId) {
        setConversationId(result.conversationId)
      }

      const replyContent = result.success && result.reply
        ? result.reply
        : "I'm having trouble connecting right now. Please try again or visit https://kronova.io/enterprise-pilot."

      setMessages(prev => [...prev, { role: "assistant", content: replyContent, timestamp: new Date() }])
      if (!isOpen || isMinimized) setUnread(n => n + 1)
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Something went wrong. Please try again.", timestamp: new Date() }])
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, messages, selectedModel, conversationId, isOpen, isMinimized])

  // ------------------------------------------------------------------
  // Text submit
  // ------------------------------------------------------------------
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    const text = input.trim()
    if (!text) return
    setInput("")
    await sendMessage(text, "text")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      handleSubmit()
    }
  }

  // ------------------------------------------------------------------
  // Voice recording
  // ------------------------------------------------------------------
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = e => audioChunksRef.current.push(e.data)
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        await processVoiceAudio(audioBlob)
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch {
      alert("Microphone access denied. Please enable microphone permissions in your browser.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const processVoiceAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true)
    setMessages(prev => [...prev, { role: "user", content: "Processing voice...", timestamp: new Date(), inputMode: "voice" }])

    try {
      const arrayBuffer = await audioBlob.arrayBuffer()
      const result = await transcribeSupportAudio(arrayBuffer)

      if (!result.success || !result.text) throw new Error(result.error ?? "Transcription returned empty")

      const transcribed = result.text
      setMessages(prev => {
        const next = [...prev]
        next[next.length - 1] = { role: "user", content: transcribed, timestamp: new Date(), inputMode: "voice" }
        return next
      })

      setIsTranscribing(false)
      await sendMessage(transcribed, "voice")
    } catch {
      setMessages(prev => {
        const next = [...prev]
        next[next.length - 1] = { role: "user", content: "(Voice command failed)", timestamp: new Date(), inputMode: "voice" }
        return [...next, { role: "assistant", content: "Sorry, I couldn't process that voice command. Please try again or switch to text input.", timestamp: new Date() }]
      })
      setIsTranscribing(false)
    }
  }

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`

  // ------------------------------------------------------------------
  // Open / close
  // ------------------------------------------------------------------
  const handleClose = () => {
    setIsOpen(false)
    onExternalClose?.()
  }

  if (!isOpen) return null

  return (
    <div className={cn(
      "fixed flex flex-col border border-primary/20 shadow-2xl shadow-primary/10 transition-all duration-200 z-50",
      "inset-x-2 bottom-[88px] sm:inset-x-auto sm:right-6 sm:bottom-[88px]",
      "rounded-2xl overflow-hidden",
      // Enterprise glassmorphism container
      "bg-background/80 backdrop-blur-xl",
      isMinimized
        ? "h-14 sm:w-80"
        : "h-[70dvh] sm:h-[540px] sm:w-[400px]",
    )}>

      {/* Subtle gradient top border */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent pointer-events-none" />

      {/* Header — glass-morphism */}
      <div className="flex shrink-0 items-center gap-3 border-b border-primary/15 bg-gradient-to-r from-primary/8 via-background/60 to-accent/5 px-4 py-3 backdrop-blur-sm">
        <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/20">
          <Image
            src="https://quantumone.b-cdn.net/kronova/kronova-svg-icon.svg"
            alt="Kairo"
            width={20}
            height={20}
            className="h-5 w-5"
          />
          {/* Online indicator */}
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-background" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold leading-none enterprise-text-gradient">Kairo</p>
            <Sparkles className="h-3 w-3 text-primary/60" />
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {modelsLoading ? "Loading models..." : selectedModel.label}
            {inputMode === "voice" && <span className="ml-1.5 text-primary">· Voice</span>}
          </p>
        </div>

        {/* Model selector */}
        {!isMinimized && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                aria-label="Change AI model"
                disabled={modelsLoading}
              >
                {modelsLoading
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <Settings2 className="h-3.5 w-3.5" />
                }
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 glass-morphism border-primary/20">
              <DropdownMenuLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                AI Model
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border/40" />
              {models.map(m => (
                <DropdownMenuItem
                  key={m.id}
                  className={cn(
                    "flex items-center justify-between cursor-pointer rounded-lg transition-colors",
                    selectedModel.id === m.id
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-primary/5",
                  )}
                  onSelect={() => setSelectedModel(m)}
                >
                  <div>
                    <span className="text-sm font-medium">{m.label}</span>
                    <span className="text-xs text-muted-foreground ml-1.5">{m.provider}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {m.badge && (
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[10px] px-1.5 py-0 h-4",
                          m.badge === "Recommended" && "bg-primary/15 text-primary border-primary/20",
                          m.badge === "Fast" && "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
                          m.badge === "Powerful" && "bg-purple-500/15 text-purple-400 border-purple-500/20",
                        )}
                      >
                        {m.badge}
                      </Badge>
                    )}
                    {selectedModel.id === m.id && <ChevronRight className="h-3 w-3 text-primary" />}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          onClick={() => setIsMinimized(v => !v)}
          aria-label={isMinimized ? "Expand chat" : "Minimize chat"}
        >
          <ChevronDown className={cn("h-4 w-4 transition-transform", isMinimized && "rotate-180")} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          onClick={handleClose}
          aria-label="Close chat"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={cn("flex gap-2.5", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
                {msg.role === "assistant" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/20 mt-0.5">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  </div>
                )}
                <div className={cn(
                  "max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                  msg.role === "user"
                    // Enterprise gradient user bubble
                    ? "bg-gradient-to-br from-primary to-accent text-white rounded-tr-sm shadow-sm shadow-primary/20"
                    : "bg-card/80 border border-border/40 text-foreground rounded-tl-sm backdrop-blur-sm",
                )}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  {msg.inputMode === "voice" && (
                    <div className="flex items-center gap-1 mt-1 opacity-60">
                      <Mic className="h-2.5 w-2.5" />
                      <span className="text-[10px]">voice</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {(isLoading || isTranscribing) && (
              <div className="flex gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/20 mt-0.5">
                  <Bot className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="bg-card/80 border border-border/40 rounded-2xl rounded-tl-sm px-3.5 py-3 flex items-center gap-2 backdrop-blur-sm">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  <span className="text-xs text-muted-foreground">{isTranscribing ? "Transcribing..." : "Thinking..."}</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="shrink-0 border-t border-primary/15 bg-background/60 backdrop-blur-sm p-3 space-y-2">
            {/* Voice active — recording controls */}
            {inputMode === "voice" && (
              <div className="flex flex-col gap-2">
                {isRecording ? (
                  <div className="flex items-center gap-3 w-full">
                    <Badge variant="destructive" className="gap-1.5 animate-pulse shrink-0">
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      {formatTime(recordingTime)}
                    </Badge>
                    <Button variant="destructive" className="flex-1 gap-2" onClick={stopRecording}>
                      <MicOff className="h-4 w-4" />
                      Stop &amp; Send
                    </Button>
                  </div>
                ) : (
                  <Button
                    className="w-full gap-2 enterprise-button"
                    onClick={startRecording}
                    disabled={isLoading || isTranscribing}
                  >
                    {isTranscribing
                      ? <><Loader2 className="h-4 w-4 animate-spin" /> Transcribing...</>
                      : <><Mic className="h-4 w-4" /> Tap to speak</>
                    }
                  </Button>
                )}
                <p className="text-[11px] text-muted-foreground text-center">
                  Voice is transcribed then sent to {selectedModel.label}
                </p>
              </div>
            )}

            {/* Text input row */}
            <form onSubmit={handleSubmit} className="flex items-end gap-2">
              <Textarea
                ref={textareaRef}
                placeholder={inputMode === "voice" ? "Or type here instead..." : "Ask anything about Kronova..."}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                className="flex-1 min-h-[38px] max-h-[120px] resize-none text-sm py-2 bg-background/60 border-border/40 focus:border-primary/40 transition-colors"
                disabled={isLoading}
              />
              <Button
                type="button"
                size="icon"
                variant={inputMode === "voice" ? "default" : "outline"}
                className={cn(
                  "h-9 w-9 shrink-0 transition-all",
                  inputMode === "voice"
                    ? "enterprise-button border-0"
                    : "border-border/40 hover:border-primary/40 hover:text-primary hover:bg-primary/5",
                )}
                onClick={() => setInputMode(m => m === "voice" ? "text" : "voice")}
                aria-label={inputMode === "voice" ? "Switch to text input" : "Switch to voice input"}
              >
                {inputMode === "voice" ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </Button>
              <Button
                type="submit"
                size="icon"
                className="h-9 w-9 shrink-0 enterprise-button border-0"
                disabled={isLoading || !input.trim()}
                aria-label="Send message"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </div>
        </>
      )}
    </div>
  )
}
