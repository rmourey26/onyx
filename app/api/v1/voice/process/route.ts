import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { validateDualAuth } from "@/lib/auth/dual-auth"
import { transcribeAudioWithCloudUrlAction, transcribeAudioAction } from "@/app/actions/voice-actions"
import { classifyIntentAction } from "@/app/actions/voice-actions"
import { routeCommandAction } from "@/app/actions/voice-actions"
import { deleteVoiceAudio } from "@/lib/voice/voice-storage"
import type { CommandContext } from "@/lib/voice/command-router"

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const validation = await validateDualAuth(request, ["voice:execute"])

    if (!validation.authenticated) {
      return NextResponse.json(
        {
          error: validation.error,
          message:
            validation.authMethod === "session"
              ? "Please log in to use voice features"
              : "Provide API key: Authorization: Bearer <your-api-key>",
        },
        { status: validation.status || 401 },
      )
    }

    const userId = validation.userId!
    const supabase = await createServerSupabaseClient()

    // Parse request body
    const body = await request.json()
    const { cloudUrl, audioData, filePath, sessionId, contextId, contextType = "standard", aethernetMetadata } = body

    if (!cloudUrl && !audioData) {
      return NextResponse.json(
        {
          error: "Missing required field: cloudUrl or audioData",
          message: "Either cloudUrl (Supabase signed URL) or audioData (base64) must be provided",
        },
        { status: 400 },
      )
    }

    if (!sessionId) {
      return NextResponse.json(
        {
          error: "Missing required field: sessionId",
          message: "sessionId must be provided",
        },
        { status: 400 },
      )
    }

    console.log(
      `[v0] Processing voice command for session ${sessionId} (auth: ${validation.authMethod}, method: ${cloudUrl ? "cloud" : "direct"})`,
    )

    // Step 1: Transcribe audio
    let transcription
    if (cloudUrl) {
      transcription = await transcribeAudioWithCloudUrlAction(cloudUrl, "en")
    } else {
      const audioBuffer = Uint8Array.from(atob(audioData), (c) => c.charCodeAt(0))
      transcription = await transcribeAudioAction(audioBuffer.buffer, "en")
    }

    console.log(`[v0] Transcription: "${transcription.text}"`)

    // Step 2: Get conversation history
    const { data: recentLogs } = await supabase
      .from("voice_execution_logs")
      .select("transcription, response_text, created_at")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false })
      .limit(5)

    const conversationHistory =
      recentLogs?.flatMap((log: any) => [
        { role: "user" as const, content: log.transcription },
        { role: "assistant" as const, content: log.response_text },
      ]) || []

    // Step 3: Classify intent
    const intent = await classifyIntentAction(transcription.text, {
      conversationHistory,
      contextType,
    })

    console.log(`[v0] Intent: ${intent.action} (confidence: ${intent.confidence})`)

    // Step 4: Build command context
    const commandContext: CommandContext = {
      userId,
      sessionId,
      conversationHistory,
    }

    // Step 5: Route command
    const commandResult = await routeCommandAction(intent, commandContext)

    // Step 6: Log execution
    try {
      const { data: voiceLog } = await supabase
        .from("voice_execution_logs")
        .insert({
          user_id: userId,
          session_id: sessionId,
          transcription: transcription.text,
          confidence: transcription.confidence,
          language: transcription.language,
          audio_duration: transcription.duration,
          intent_action: intent.action,
          intent_confidence: intent.confidence,
          intent_entities: intent.entities,
          execution_result: commandResult.data,
          response_text: commandResult.response,
          status: commandResult.success ? "completed" : "failed",
          error: commandResult.error,
          context_type: contextType,
          aethernet_metadata: aethernetMetadata,
          auth_method: validation.authMethod,
          api_key_id: validation.apiKeyId,
        })
        .select()
        .single()

      if (filePath) {
        try {
          await deleteVoiceAudio(filePath)
          console.log(`[v0] Cleaned up audio file: ${filePath}`)
        } catch (cleanupError) {
          console.error("[v0] Failed to cleanup audio file:", cleanupError)
          // Don't fail the request if cleanup fails
        }
      }

      const executionTime = Date.now() - startTime

      return NextResponse.json({
        success: commandResult.success,
        executionId: voiceLog?.id,
        sessionId,
        authMethod: validation.authMethod,
        transcription: {
          text: transcription.text,
          confidence: transcription.confidence,
          language: transcription.language,
        },
        intent: {
          action: intent.action,
          confidence: intent.confidence,
          entities: intent.entities,
        },
        result: {
          response: commandResult.response,
          data: commandResult.data,
          followUpActions: commandResult.followUpActions,
        },
        executionTime,
        timestamp: new Date().toISOString(),
      })
    } catch (logError) {
      console.error("[v0] Failed to log voice execution:", logError)
      // Continue processing even if logging fails
    }

    const executionTime = Date.now() - startTime

    return NextResponse.json({
      success: commandResult.success,
      sessionId,
      authMethod: validation.authMethod,
      transcription: {
        text: transcription.text,
        confidence: transcription.confidence,
        language: transcription.language,
      },
      intent: {
        action: intent.action,
        confidence: intent.confidence,
        entities: intent.entities,
      },
      result: {
        response: commandResult.response,
        data: commandResult.data,
        followUpActions: commandResult.followUpActions,
      },
      executionTime,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Voice processing error:", error)
    return NextResponse.json(
      {
        error: "Voice processing failed",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
