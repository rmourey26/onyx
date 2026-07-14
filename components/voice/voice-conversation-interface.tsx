"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Mic, MicOff, Loader2, Network, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: string
  metadata?: {
    transcriptionConfidence?: number
    intentAction?: string
    intentConfidence?: number
  }
}

interface VoiceConversationInterfaceProps {
  userId: string
  isAetherNetMode: boolean
  aethernetConnection?: any
}

export function VoiceConversationInterface({
  userId,
  isAetherNetMode,
  aethernetConnection,
}: VoiceConversationInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [isSessionReady, setIsSessionReady] = useState(false)
  const [sessionError, setSessionError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const initializeSession = async () => {
      try {
        setSessionError(null)

        // Create a new voice session using HTTP - session auth via cookies
        const response = await fetch("/api/v1/voice/sessions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Include cookies for session auth
          body: JSON.stringify({
            sessionName: `Voice Session ${new Date().toLocaleString()}`,
            contextType: isAetherNetMode ? "aethernet" : "standard",
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || errorData.error || "Failed to create session")
        }

        const data = await response.json()
        setSessionId(data.session.id)
        setIsSessionReady(true)
        console.log("[v0] Voice session created:", data.session.id, "Auth:", data.authMethod)
      } catch (error) {
        console.error("[v0] Session initialization error:", error)
        setSessionError(error instanceof Error ? error.message : "Failed to initialize session")

        // Generate a temporary session ID for fallback
        const tempSessionId = `temp-${userId}-${Date.now()}`
        setSessionId(tempSessionId)
        setIsSessionReady(true)
        console.log("[v0] Using temporary session ID:", tempSessionId)
      }
    }

    initializeSession()
  }, [isAetherNetMode, userId])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  // Update recording timer
  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
      }
      setRecordingTime(0)
    }

    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
      }
    }
  }, [isRecording])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)

      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        await processAudio(audioBlob)

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error("[v0] Error starting recording:", error)
      alert("Microphone access denied. Please enable microphone permissions.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true)

    // Add user message placeholder immediately
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: "Processing voice command...",
        timestamp: new Date().toISOString(),
      },
    ])

    try {
      console.log("[v0] [Voice Interface] Starting audio processing")
      console.log("[v0] [Voice Interface] Audio blob size:", audioBlob.size)
      console.log("[v0] [Voice Interface] Audio blob type:", audioBlob.type)

      const uploadFormData = new FormData()
      uploadFormData.append("audio", audioBlob, "audio.wav")
      uploadFormData.append("sessionId", sessionId || `temp-${userId}-${Date.now()}`)

      console.log("[v0] [Voice Interface] Uploading audio to storage")

      const uploadResponse = await fetch("/api/v1/voice/upload", {
        method: "POST",
        credentials: "include",
        body: uploadFormData,
      })

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json()
        console.error("[v0] [Voice Interface] Upload failed:", errorData)
        throw new Error(errorData.error || "Failed to upload audio to storage")
      }

      const { signedUrl, filePath } = await uploadResponse.json()
      console.log("[v0] [Voice Interface] Upload successful, processing voice command")

      const response = await fetch("/api/v1/voice/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          cloudUrl: signedUrl, // Use signed URL from Supabase Storage
          filePath, // Store for cleanup
          sessionId: sessionId || `temp-${userId}-${Date.now()}`,
          contextType: isAetherNetMode ? "aethernet" : "standard",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("[v0] [Voice Interface] Processing failed:", errorData)
        throw new Error(errorData.message || errorData.error || "Voice processing failed")
      }

      const result = await response.json()
      console.log("[v0] [Voice Interface] Processing successful")

      // Update user message with transcription
      setMessages((prev) => {
        const newMessages = [...prev]
        newMessages[newMessages.length - 1] = {
          role: "user",
          content: result.transcription.text,
          timestamp: new Date().toISOString(),
          metadata: {
            transcriptionConfidence: result.transcription.confidence,
            intentAction: result.intent.action,
            intentConfidence: result.intent.confidence,
          },
        }
        return newMessages
      })

      // Add assistant response
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: result.result.response,
          timestamp: new Date().toISOString(),
        },
      ])

      setIsProcessing(false)
    } catch (error) {
      console.error("[v0] Audio processing error:", error)
      setMessages((prev) => {
        const newMessages = [...prev]
        // Update the last user message to show error
        newMessages[newMessages.length - 1] = {
          role: "user",
          content: "(Voice command failed)",
          timestamp: new Date().toISOString(),
        }
        return [
          ...newMessages,
          {
            role: "assistant",
            content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`,
            timestamp: new Date().toISOString(),
          },
        ]
      })
      setIsProcessing(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <Card className="flex-1 flex flex-col enterprise-card min-h-0">
        <CardContent className="flex-1 flex flex-col p-0 min-h-0">
          {/* Messages Area */}
          <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 md:p-6 max-h-[50vh] md:max-h-none overflow-y-auto">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center">
                <div className="space-y-3">
                  <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mic className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Start a Conversation</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Click the microphone button below to start speaking with your AI assistant
                  </p>
                  {isSessionReady && (
                    <Badge variant="secondary" className="gap-1.5">
                      <CheckCircle2 className="h-3 w-3" />
                      Session Ready
                    </Badge>
                  )}
                  {sessionError && (
                    <Badge variant="outline" className="gap-1.5 text-yellow-600">
                      Using temporary session
                    </Badge>
                  )}
                  {isAetherNetMode && (
                    <Badge variant="secondary" className="gap-1.5">
                      <Network className="h-3 w-3" />
                      AetherNet Mode (Coming Soon)
                    </Badge>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn("flex gap-3", message.role === "assistant" ? "justify-start" : "justify-end")}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-lg p-4 space-y-2",
                        message.role === "assistant"
                          ? "bg-muted text-foreground"
                          : "bg-primary text-primary-foreground",
                      )}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      {message.metadata && (
                        <div className="flex items-center gap-2 text-xs opacity-70">
                          {message.metadata.intentAction && (
                            <Badge variant="outline" className="text-xs">
                              {message.metadata.intentAction}
                            </Badge>
                          )}
                          {message.metadata.intentConfidence !== undefined && (
                            <span>{Math.round(message.metadata.intentConfidence * 100)}% confident</span>
                          )}
                        </div>
                      )}
                      <p className="text-xs opacity-60">{new Date(message.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}

                {isProcessing && (
                  <div className="flex justify-start gap-3">
                    <div className="bg-muted text-foreground rounded-lg p-4 flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Processing...</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Control Panel */}
          <div className="sticky bottom-0 border-t bg-background backdrop-blur-sm p-4 md:p-6 shadow-lg md:shadow-none">
            <div className="flex flex-col md:flex-row items-center gap-3 justify-center">
              {isRecording ? (
                <>
                  <Badge variant="destructive" className="gap-1.5 px-3 py-1.5 animate-pulse">
                    <div className="h-2 w-2 rounded-full bg-white" />
                    Recording {formatTime(recordingTime)}
                  </Badge>

                  <Button
                    size="lg"
                    variant="destructive"
                    onClick={stopRecording}
                    className="gap-2 px-8 w-full md:w-auto"
                  >
                    <MicOff className="h-5 w-5" />
                    Stop Recording
                  </Button>
                </>
              ) : (
                <Button
                  size="lg"
                  onClick={startRecording}
                  disabled={isProcessing || !isSessionReady}
                  className="gap-2 px-8 bg-primary hover:bg-primary/90 w-full md:w-auto"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : !isSessionReady ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Initializing...
                    </>
                  ) : (
                    <>
                      <Mic className="h-5 w-5" />
                      Start Recording
                    </>
                  )}
                </Button>
              )}
            </div>

            <p className="text-xs text-center text-muted-foreground mt-3">
              Press and hold to speak. Release to send your command.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
