// =====================================================
// Standard Voice WebSocket Edge Function
// Multi-context voice agent without AetherNet
// =====================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Deno } from "https://deno.land/std@0.168.0/runtime.ts" // Declare Deno variable

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, upgrade",
}

interface VoiceContext {
  contextId: string
  contextType: "agent" | "asset" | "workflow" | "analytics" | "general"
  metadata: Record<string, any>
  active: boolean
}

interface WebSocketMessage {
  type: "audio_chunk" | "command" | "context_switch" | "ping"
  data: any
  contextId?: string
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  // WebSocket upgrade
  if (req.headers.get("upgrade") !== "websocket") {
    return new Response("Expected WebSocket upgrade", { status: 426 })
  }

  try {
    // Initialize Supabase client
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      return new Response("Missing authorization", { status: 401, headers: corsHeaders })
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    })

    // Verify user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return new Response("Unauthorized", { status: 401, headers: corsHeaders })
    }

    console.log(`[voice-websocket] User ${user.id} connecting...`)

    // Create voice session
    const { data: session, error: sessionError } = await supabase
      .from("voice_sessions")
      .insert({
        user_id: user.id,
        session_name: `Voice Session ${new Date().toISOString()}`,
        context_type: "standard",
        is_active: true,
      })
      .select()
      .single()

    if (sessionError || !session) {
      console.error("[voice-websocket] Session creation error:", sessionError)
      return new Response("Failed to create session", { status: 500, headers: corsHeaders })
    }

    const sessionId = session.id

    // WebSocket upgrade
    const { socket, response } = Deno.upgradeWebSocket(req)

    // Multi-context manager
    const contexts = new Map<string, VoiceContext>()
    let currentContextId: string | null = null
    let audioBuffer: Uint8Array[] = []
    let isProcessing = false

    // Initialize default context
    const defaultContextId = crypto.randomUUID()
    contexts.set(defaultContextId, {
      contextId: defaultContextId,
      contextType: "general",
      metadata: {},
      active: true,
    })
    currentContextId = defaultContextId

    // Create initial context snapshot
    await supabase.rpc("create_voice_context_snapshot", {
      p_session_id: sessionId,
      p_snapshot_type: "general",
      p_context_data: { initialized: true },
    })

    socket.onopen = () => {
      console.log(`[voice-websocket] Connection established for session ${sessionId}`)
      socket.send(
        JSON.stringify({
          type: "connected",
          sessionId,
          contextId: currentContextId,
          message: "Voice agent ready. Speak your command.",
        }),
      )
    }

    socket.onmessage = async (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data)

        switch (message.type) {
          case "audio_chunk":
            // Buffer audio chunks
            if (message.data && message.data.audio) {
              const audioData = Uint8Array.from(atob(message.data.audio), (c) => c.charCodeAt(0))
              audioBuffer.push(audioData)

              // Send acknowledgment
              socket.send(
                JSON.stringify({
                  type: "chunk_received",
                  contextId: currentContextId,
                  bufferSize: audioBuffer.length,
                }),
              )
            }
            break

          case "command":
            if (message.data.action === "process_audio" && !isProcessing) {
              isProcessing = true

              // Combine audio buffer
              const totalLength = audioBuffer.reduce((sum, chunk) => sum + chunk.length, 0)
              const combinedAudio = new Uint8Array(totalLength)
              let offset = 0
              for (const chunk of audioBuffer) {
                combinedAudio.set(chunk, offset)
                offset += chunk.length
              }

              // Clear buffer
              audioBuffer = []

              // Send to processing endpoint
              socket.send(
                JSON.stringify({
                  type: "processing",
                  contextId: currentContextId,
                  message: "Processing your voice command...",
                }),
              )

              try {
                const appUrl = Deno.env.get("NEXT_PUBLIC_APP_URL") || "https://app.kronova.io"
                const processResponse = await fetch(`${appUrl}/api/v1/voice/process`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: authHeader,
                  },
                  body: JSON.stringify({
                    audioData: btoa(String.fromCharCode(...combinedAudio)),
                    sessionId,
                    contextId: currentContextId,
                    contextType: contexts.get(currentContextId)?.contextType,
                  }),
                })

                if (!processResponse.ok) {
                  throw new Error(`Processing failed: ${processResponse.statusText}`)
                }

                const result = await processResponse.json()

                // Send result back
                socket.send(
                  JSON.stringify({
                    type: "result",
                    contextId: currentContextId,
                    data: result,
                  }),
                )
              } catch (error) {
                console.error("[voice-websocket] Processing error:", error)
                socket.send(
                  JSON.stringify({
                    type: "error",
                    contextId: currentContextId,
                    error: error.message,
                  }),
                )
              } finally {
                isProcessing = false
              }
            }
            break

          case "context_switch":
            // Switch active context
            const newContextId = message.data.contextId
            if (contexts.has(newContextId)) {
              // Deactivate current context
              if (currentContextId) {
                const current = contexts.get(currentContextId)!
                current.active = false
                contexts.set(currentContextId, current)
              }

              // Activate new context
              const newContext = contexts.get(newContextId)!
              newContext.active = true
              contexts.set(newContextId, newContext)
              currentContextId = newContextId

              // Create context snapshot
              await supabase.rpc("create_voice_context_snapshot", {
                p_session_id: sessionId,
                p_snapshot_type: newContext.contextType,
                p_context_data: newContext.metadata,
              })

              socket.send(
                JSON.stringify({
                  type: "context_switched",
                  contextId: newContextId,
                  contextType: newContext.contextType,
                }),
              )
            } else if (message.data.create) {
              // Create new context
              const contextId = crypto.randomUUID()
              contexts.set(contextId, {
                contextId,
                contextType: message.data.contextType || "general",
                metadata: message.data.metadata || {},
                active: false,
              })

              socket.send(
                JSON.stringify({
                  type: "context_created",
                  contextId,
                }),
              )
            }
            break

          case "ping":
            socket.send(JSON.stringify({ type: "pong" }))
            break

          default:
            socket.send(
              JSON.stringify({
                type: "error",
                error: `Unknown message type: ${message.type}`,
              }),
            )
        }
      } catch (error) {
        console.error("[voice-websocket] Message handling error:", error)
        socket.send(
          JSON.stringify({
            type: "error",
            error: error.message || "Failed to process message",
          }),
        )
      }
    }

    socket.onerror = (error) => {
      console.error("[voice-websocket] WebSocket error:", error)
    }

    socket.onclose = async () => {
      console.log(`[voice-websocket] Connection closed for session ${sessionId}`)

      // Mark session as inactive
      await supabase
        .from("voice_sessions")
        .update({ is_active: false, ended_at: new Date().toISOString() })
        .eq("id", sessionId)
    }

    return response
  } catch (error) {
    console.error("[voice-websocket] Connection error:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
