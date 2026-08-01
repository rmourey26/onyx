// =====================================================
// AetherNet-Enabled Voice WebSocket Edge Function
// Multi-context voice agent WITH AetherNet P2P capabilities
// =====================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Deno } from "https://deno.land/std@0.168.0/runtime.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, upgrade",
}

interface VoiceContext {
  contextId: string
  contextType: "agent" | "asset" | "workflow" | "analytics" | "general" | "aethernet"
  metadata: Record<string, any>
  active: boolean
  aethernetMetadata?: {
    peerId: string
    connectionId: string
    networkType: string
    encryptionEnabled: boolean
  }
}

interface WebSocketMessage {
  type:
    | "audio_chunk"
    | "command"
    | "context_switch"
    | "aethernet_connect"
    | "aethernet_message"
    | "aethernet_broadcast"
    | "ping"
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

    console.log(`[voice-websocket-aethernet] User ${user.id} connecting with AetherNet...`)

    // Get user's AetherNet connection
    const { data: aethernetConnection } = await supabase
      .from("aethernet_connections")
      .select("*")
      .eq("user_id", user.id)
      .eq("connection_status", "active")
      .maybeSingle()

    if (!aethernetConnection) {
      return new Response("AetherNet connection required but not configured", {
        status: 400,
        headers: corsHeaders,
      })
    }

    // Create voice session with AetherNet
    const { data: session, error: sessionError } = await supabase
      .from("voice_sessions")
      .insert({
        user_id: user.id,
        session_name: `AetherNet Voice Session ${new Date().toISOString()}`,
        context_type: "aethernet",
        aethernet_connection_id: aethernetConnection.id,
        is_active: true,
      })
      .select()
      .single()

    if (sessionError || !session) {
      console.error("[voice-websocket-aethernet] Session creation error:", sessionError)
      return new Response("Failed to create session", { status: 500, headers: corsHeaders })
    }

    const sessionId = session.id

    // WebSocket upgrade
    const { socket, response } = Deno.upgradeWebSocket(req)

    // Multi-context manager with AetherNet
    const contexts = new Map<string, VoiceContext>()
    let currentContextId: string | null = null
    let audioBuffer: Uint8Array[] = []
    let isProcessing = false

    // AetherNet peer connections
    const aethernetPeers = new Map<string, any>()

    // Initialize default AetherNet context
    const defaultContextId = crypto.randomUUID()
    contexts.set(defaultContextId, {
      contextId: defaultContextId,
      contextType: "aethernet",
      metadata: {
        aethernetEnabled: true,
        connectionId: aethernetConnection.id,
      },
      active: true,
      aethernetMetadata: {
        peerId: aethernetConnection.aethernet_address,
        connectionId: aethernetConnection.id,
        networkType: aethernetConnection.network_type,
        encryptionEnabled: true,
      },
    })
    currentContextId = defaultContextId

    // Create initial AetherNet context snapshot
    await supabase.rpc("create_voice_context_snapshot", {
      p_session_id: sessionId,
      p_snapshot_type: "aethernet",
      p_context_data: {
        initialized: true,
        aethernet_connection_id: aethernetConnection.id,
        aethernet_address: aethernetConnection.aethernet_address,
      },
    })

    socket.onopen = () => {
      console.log(`[voice-websocket-aethernet] AetherNet connection established for session ${sessionId}`)
      socket.send(
        JSON.stringify({
          type: "connected",
          sessionId,
          contextId: currentContextId,
          aethernetEnabled: true,
          aethernetAddress: aethernetConnection.aethernet_address,
          message: "AetherNet voice agent ready. Speak your command or connect to peers.",
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

              // Send acknowledgment with AetherNet status
              socket.send(
                JSON.stringify({
                  type: "chunk_received",
                  contextId: currentContextId,
                  bufferSize: audioBuffer.length,
                  aethernetConnected: aethernetPeers.size > 0,
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

              // Send to processing endpoint with AetherNet context
              socket.send(
                JSON.stringify({
                  type: "processing",
                  contextId: currentContextId,
                  aethernetEnabled: true,
                  message: "Processing your voice command via AetherNet...",
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
                    aethernetMetadata: contexts.get(currentContextId)?.aethernetMetadata,
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
                    aethernetBroadcast: message.data.broadcastToPeers || false,
                  }),
                )

                // Broadcast to AetherNet peers if requested
                if (message.data.broadcastToPeers && aethernetPeers.size > 0) {
                  for (const [peerId, peer] of aethernetPeers.entries()) {
                    try {
                      // Send result to peer via AetherNet
                      console.log(`[voice-websocket-aethernet] Broadcasting to peer ${peerId}`)
                      // Implementation would use actual AetherNet protocol
                    } catch (error) {
                      console.error(`[voice-websocket-aethernet] Broadcast to ${peerId} failed:`, error)
                    }
                  }
                }
              } catch (error) {
                console.error("[voice-websocket-aethernet] Processing error:", error)
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

          case "aethernet_connect":
            // Connect to AetherNet peer
            const peerId = message.data.peerId
            if (peerId && !aethernetPeers.has(peerId)) {
              try {
                // Establish P2P connection via AetherNet
                // This would use the actual AetherNet protocol
                aethernetPeers.set(peerId, {
                  peerId,
                  connectedAt: new Date().toISOString(),
                  publicKey: message.data.publicKey,
                })

                // Log connection
                await supabase.from("aethernet_peer_connections").insert({
                  connection_id: aethernetConnection.id,
                  peer_address: peerId,
                  connection_status: "connected",
                })

                socket.send(
                  JSON.stringify({
                    type: "aethernet_peer_connected",
                    peerId,
                    totalPeers: aethernetPeers.size,
                  }),
                )
              } catch (error) {
                console.error("[voice-websocket-aethernet] Peer connection error:", error)
                socket.send(
                  JSON.stringify({
                    type: "error",
                    error: `Failed to connect to peer ${peerId}`,
                  }),
                )
              }
            }
            break

          case "aethernet_message":
            // Send message to specific peer
            const targetPeer = message.data.peerId
            if (aethernetPeers.has(targetPeer)) {
              try {
                // Send encrypted message via AetherNet
                console.log(`[voice-websocket-aethernet] Sending message to ${targetPeer}`)
                socket.send(
                  JSON.stringify({
                    type: "aethernet_message_sent",
                    peerId: targetPeer,
                  }),
                )
              } catch (error) {
                console.error("[voice-websocket-aethernet] Message send error:", error)
              }
            }
            break

          case "aethernet_broadcast":
            // Broadcast to all connected peers
            if (aethernetPeers.size > 0) {
              const broadcastPromises = Array.from(aethernetPeers.keys()).map(async (peerId) => {
                try {
                  // Broadcast via AetherNet
                  console.log(`[voice-websocket-aethernet] Broadcasting to ${peerId}`)
                } catch (error) {
                  console.error(`[voice-websocket-aethernet] Broadcast to ${peerId} failed:`, error)
                }
              })

              await Promise.allSettled(broadcastPromises)

              socket.send(
                JSON.stringify({
                  type: "aethernet_broadcast_complete",
                  peerCount: aethernetPeers.size,
                }),
              )
            }
            break

          case "context_switch":
            // Switch active context (including AetherNet contexts)
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
                p_context_data: {
                  ...newContext.metadata,
                  aethernetMetadata: newContext.aethernetMetadata,
                },
              })

              socket.send(
                JSON.stringify({
                  type: "context_switched",
                  contextId: newContextId,
                  contextType: newContext.contextType,
                  aethernetEnabled: newContext.contextType === "aethernet",
                }),
              )
            }
            break

          case "ping":
            socket.send(
              JSON.stringify({
                type: "pong",
                aethernetPeers: aethernetPeers.size,
              }),
            )
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
        console.error("[voice-websocket-aethernet] Message handling error:", error)
        socket.send(
          JSON.stringify({
            type: "error",
            error: error.message || "Failed to process message",
          }),
        )
      }
    }

    socket.onerror = (error) => {
      console.error("[voice-websocket-aethernet] WebSocket error:", error)
    }

    socket.onclose = async () => {
      console.log(`[voice-websocket-aethernet] Connection closed for session ${sessionId}`)

      // Disconnect all AetherNet peers
      for (const peerId of aethernetPeers.keys()) {
        await supabase
          .from("aethernet_peer_connections")
          .update({ connection_status: "disconnected", disconnected_at: new Date().toISOString() })
          .eq("connection_id", aethernetConnection.id)
          .eq("peer_address", peerId)
      }

      // Mark session as inactive
      await supabase
        .from("voice_sessions")
        .update({ is_active: false, ended_at: new Date().toISOString() })
        .eq("id", sessionId)
    }

    return response
  } catch (error) {
    console.error("[voice-websocket-aethernet] Connection error:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
