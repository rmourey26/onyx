"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import {
  createResendItVoiceClient,
  type ResendItVoiceConfig,
  type TranscriptionResult,
  type SpeechSynthesisResult,
} from "@/lib/voice/elevenlabs-client"
import {
  NLPIntentClassifier,
  type Intent,
  type IntentClassificationOptions,
  type EntityExtractionResult,
} from "@/lib/voice/nlp-intent-classifier"
import { CommandRouter, type CommandContext, type CommandResult } from "@/lib/voice/command-router"
import {
  processVoiceCommand,
  type VoiceProcessingContext,
  type VoiceCommandResult,
} from "@/lib/voice/voice-agent-processor"

// ============================================================================
// VOICE TRANSCRIPTION ACTIONS
// ============================================================================

export async function transcribeAudioAction(audioData: ArrayBuffer, language?: string): Promise<TranscriptionResult> {
  try {
    const client = await createResendItVoiceClient()
    return await client.transcribeAudio(audioData, language)
  } catch (error) {
    console.error("[Voice Actions] Transcription error:", error)
    throw new Error("Failed to transcribe audio")
  }
}

export async function transcribeAudioWithCloudUrlAction(
  cloudUrl: string,
  language?: string,
): Promise<TranscriptionResult> {
  try {
    const client = await createResendItVoiceClient()
    return await client.transcribeAudio(cloudUrl, language)
  } catch (error) {
    console.error("[Voice Actions] Cloud transcription error:", error)
    throw new Error("Failed to transcribe audio from cloud URL")
  }
}

// ============================================================================
// VOICE SYNTHESIS ACTIONS
// ============================================================================

export async function synthesizeSpeechAction(
  text: string,
  config: ResendItVoiceConfig,
): Promise<SpeechSynthesisResult> {
  try {
    const client = await createResendItVoiceClient()
    return await client.synthesizeSpeech(text, config)
  } catch (error) {
    console.error("[Voice Actions] Synthesis error:", error)
    throw new Error("Failed to synthesize speech")
  }
}

export async function getAvailableVoicesAction(): Promise<Array<{ voice_id: string; name: string; category: string }>> {
  try {
    const client = await createResendItVoiceClient()
    return await client.getAvailableVoices()
  } catch (error) {
    console.error("[Voice Actions] Get voices error:", error)
    throw new Error("Failed to retrieve available voices")
  }
}

// ============================================================================
// VOICE COMMAND PROCESSING ACTIONS
// ============================================================================

export async function processVoiceCommandAction(
  audioData: ArrayBuffer,
  context: VoiceProcessingContext,
): Promise<VoiceCommandResult> {
  try {
    return await processVoiceCommand(audioData, context)
  } catch (error) {
    console.error("[Voice Actions] Command processing error:", error)
    throw new Error("Failed to process voice command")
  }
}

// ============================================================================
// NLP INTENT CLASSIFICATION ACTIONS
// ============================================================================

export async function classifyIntentAction(
  text: string,
  context?: Record<string, any>,
  options?: IntentClassificationOptions,
): Promise<Intent> {
  try {
    const classifier = new NLPIntentClassifier()
    return await classifier.classifyIntent(text, context, options)
  } catch (error) {
    console.error("[Voice Actions] Intent classification error:", error)
    throw new Error("Failed to classify intent")
  }
}

export async function extractEntitiesAction(text: string, entityTypes: string[]): Promise<EntityExtractionResult[]> {
  try {
    const classifier = new NLPIntentClassifier()
    return await classifier.extractEntities(text, entityTypes)
  } catch (error) {
    console.error("[Voice Actions] Entity extraction error:", error)
    throw new Error("Failed to extract entities")
  }
}

// ============================================================================
// COMMAND ROUTING ACTIONS
// ============================================================================

export async function routeCommandAction(intent: Intent, context: CommandContext): Promise<CommandResult> {
  try {
    const router = new CommandRouter()
    return await router.routeCommand(intent, context)
  } catch (error) {
    console.error("[Voice Actions] Command routing error:", error)
    throw new Error("Failed to route command")
  }
}

// ============================================================================
// VOICE SESSION MANAGEMENT ACTIONS
// ============================================================================

export async function createVoiceSessionAction(userId: string): Promise<{ sessionId: string; expiresAt: string }> {
  try {
    const supabase = await createServerSupabaseClient()
    const sessionId = `voice_${Date.now()}_${Math.random().toString(36).substring(7)}`
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes

    const { data, error } = await supabase
      .from("voice_sessions")
      .insert({
        session_id: sessionId,
        user_id: userId,
        expires_at: expiresAt.toISOString(),
        status: "active",
      })
      .select()
      .single()

    if (error) throw error

    return {
      sessionId,
      expiresAt: expiresAt.toISOString(),
    }
  } catch (error) {
    console.error("[Voice Actions] Session creation error:", error)
    throw new Error("Failed to create voice session")
  }
}

export async function getVoiceSessionAction(sessionId: string): Promise<any> {
  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from("voice_sessions")
      .select("*")
      .eq("session_id", sessionId)
      .eq("status", "active")
      .single()

    if (error) throw error

    // Check if session is expired
    if (new Date(data.expires_at) < new Date()) {
      await supabase.from("voice_sessions").update({ status: "expired" }).eq("session_id", sessionId)
      throw new Error("Session expired")
    }

    return data
  } catch (error) {
    console.error("[Voice Actions] Get session error:", error)
    throw new Error("Failed to retrieve voice session")
  }
}

export async function endVoiceSessionAction(sessionId: string): Promise<void> {
  try {
    const supabase = await createServerSupabaseClient()

    await supabase.from("voice_sessions").update({ status: "ended" }).eq("session_id", sessionId)
  } catch (error) {
    console.error("[Voice Actions] End session error:", error)
    throw new Error("Failed to end voice session")
  }
}

// ============================================================================
// VOICE EXECUTION LOGS ACTIONS
// ============================================================================

export async function getVoiceExecutionLogsAction(
  userId: string,
  limit = 50,
): Promise<
  Array<{
    id: string
    created_at: string
    transcription: string
    intent_action: string
    response_text: string
    confidence: number
  }>
> {
  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from("voice_execution_logs")
      .select("id, created_at, transcription, intent_action, response_text, confidence")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) throw error

    return data || []
  } catch (error) {
    console.error("[Voice Actions] Get logs error:", error)
    throw new Error("Failed to retrieve voice execution logs")
  }
}

// ============================================================================
// VOICE ANALYTICS ACTIONS
// ============================================================================

export async function getVoiceAnalyticsAction(
  userId: string,
  startDate?: string,
  endDate?: string,
): Promise<{
  totalCommands: number
  successRate: number
  averageConfidence: number
  topIntents: Array<{ intent: string; count: number }>
  commandsByDay: Array<{ date: string; count: number }>
}> {
  try {
    const supabase = await createServerSupabaseClient()

    let query = supabase
      .from("voice_execution_logs")
      .select("intent_action, confidence, status, created_at")
      .eq("user_id", userId)

    if (startDate) {
      query = query.gte("created_at", startDate)
    }
    if (endDate) {
      query = query.lte("created_at", endDate)
    }

    const { data, error } = await query

    if (error) throw error

    const logs = data || []
    const totalCommands = logs.length
    const successfulCommands = logs.filter((log) => log.status === "completed").length
    const successRate = totalCommands > 0 ? (successfulCommands / totalCommands) * 100 : 0
    const averageConfidence = logs.reduce((sum, log) => sum + (log.confidence || 0), 0) / (totalCommands || 1)

    // Calculate top intents
    const intentCounts = logs.reduce(
      (acc, log) => {
        acc[log.intent_action] = (acc[log.intent_action] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const topIntents = Object.entries(intentCounts)
      .map(([intent, count]) => ({ intent, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Calculate commands by day
    const commandsByDay = logs.reduce(
      (acc, log) => {
        const date = new Date(log.created_at).toISOString().split("T")[0]
        const existing = acc.find((item) => item.date === date)
        if (existing) {
          existing.count++
        } else {
          acc.push({ date, count: 1 })
        }
        return acc
      },
      [] as Array<{ date: string; count: number }>,
    )

    return {
      totalCommands,
      successRate: Math.round(successRate * 100) / 100,
      averageConfidence: Math.round(averageConfidence * 100) / 100,
      topIntents,
      commandsByDay: commandsByDay.sort((a, b) => a.date.localeCompare(b.date)),
    }
  } catch (error) {
    console.error("[Voice Actions] Get analytics error:", error)
    throw new Error("Failed to retrieve voice analytics")
  }
}
