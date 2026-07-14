/**
 * Kronova AI Request Logging Utilities
 * Comprehensive logging for all AI interactions (voice and non-voice)
 * 
 * Note: This module provides type definitions only.
 * Actual logging is performed via server actions.
 */

import type { SupabaseClient } from "@supabase/supabase-js"

export interface LogAIRequestParams {
  userId: string
  agentId?: string
  modelId?: string
  prompt: string
  parameters?: Record<string, any>
  context?: Record<string, any>
  requestType: 'text' | 'voice' | 'workflow' | 'tool_execution'
  metadata?: Record<string, any>
}

export interface LogAIResultParams {
  requestId: string
  userId: string
  agentId?: string
  response: string
  tokensUsed?: number
  executionTimeMs?: number
  confidence?: number
  analysis?: Record<string, any>
  metadata?: Record<string, any>
}

export interface LogVoiceRequestParams {
  userId: string
  agentId?: string
  audioUrl?: string
  transcription: string
  duration?: number
  languageCode?: string
  metadata?: Record<string, any>
}

export interface LogVoiceResultParams {
  requestId: string
  userId: string
  agentId?: string
  response: string
  audioResponseUrl?: string
  executionTimeMs?: number
  analysis?: Record<string, any>
  metadata?: Record<string, any>
}

export interface SaveAgentContextParams {
  agentId: string
  userId: string
  contextType: 'system' | 'user' | 'assistant' | 'tool' | 'workflow'
  content: string
  metadata?: Record<string, any>
  permissions?: string[]
}

export interface SaveVoiceContextParams {
  voiceRequestId: string
  agentId: string
  userId: string
  contextData: Record<string, any>
  metadata?: Record<string, any>
}

/**
 * Log an AI request to ai_request_logs table
 */
export async function logAIRequest(supabase: SupabaseClient, params: LogAIRequestParams) {
  try {
    
    const { data, error } = await supabase
      .from('ai_request_logs')
      .insert({
        user_id: params.userId,
        agent_id: params.agentId,
        model_id: params.modelId,
        prompt: params.prompt,
        parameters: params.parameters,
        context: params.context,
        request_type: params.requestType,
        metadata: params.metadata,
        created_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (error) {
      console.error('[Kronova] Failed to log AI request:', error)
      return { success: false, error: error.message }
    }

    return { success: true, requestId: data.id }
  } catch (error) {
    console.error('[Kronova] Error logging AI request:', error)
    return { success: false, error: String(error) }
  }
}

/**
 * Log AI analysis result to ai_analysis_results table
 */
export async function logAIResult(supabase: SupabaseClient, params: LogAIResultParams) {
  try {
    
    const { error } = await supabase
      .from('ai_analysis_results')
      .insert({
        request_id: params.requestId,
        user_id: params.userId,
        agent_id: params.agentId,
        response: params.response,
        tokens_used: params.tokensUsed,
        execution_time_ms: params.executionTimeMs,
        confidence_score: params.confidence,
        analysis_data: params.analysis,
        metadata: params.metadata,
        created_at: new Date().toISOString(),
      })

    if (error) {
      console.error('[Kronova] Failed to log AI result:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('[Kronova] Error logging AI result:', error)
    return { success: false, error: String(error) }
  }
}

/**
 * Log a voice execution request to voice_execution_logs table
 */
export async function logVoiceRequest(supabase: SupabaseClient, params: LogVoiceRequestParams) {
  try {
    
    const { data, error } = await supabase
      .from('voice_execution_logs')
      .insert({
        user_id: params.userId,
        agent_id: params.agentId,
        audio_url: params.audioUrl,
        transcription: params.transcription,
        duration_seconds: params.duration,
        language_code: params.languageCode || 'en-US',
        metadata: params.metadata,
        created_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (error) {
      console.error('[Kronova] Failed to log voice request:', error)
      return { success: false, error: error.message }
    }

    return { success: true, requestId: data.id }
  } catch (error) {
    console.error('[Kronova] Error logging voice request:', error)
    return { success: false, error: String(error) }
  }
}

/**
 * Log voice analysis result to voice_analysis_results table
 */
export async function logVoiceResult(supabase: SupabaseClient, params: LogVoiceResultParams) {
  try {
    
    const { error } = await supabase
      .from('voice_analysis_results')
      .insert({
        request_id: params.requestId,
        user_id: params.userId,
        agent_id: params.agentId,
        response: params.response,
        audio_response_url: params.audioResponseUrl,
        execution_time_ms: params.executionTimeMs,
        analysis_data: params.analysis,
        metadata: params.metadata,
        created_at: new Date().toISOString(),
      })

    if (error) {
      console.error('[Kronova] Failed to log voice result:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('[Kronova] Error logging voice result:', error)
    return { success: false, error: String(error) }
  }
}

/**
 * Save voice context snapshot to voice_context_snapshots table
 */
export async function saveVoiceContextSnapshot(supabase: SupabaseClient, params: SaveVoiceContextParams) {
  try {
    
    const { error } = await supabase
      .from('voice_context_snapshots')
      .insert({
        voice_request_id: params.voiceRequestId,
        user_id: params.userId,
        agent_id: params.agentId,
        context_data: params.contextData,
        created_at: new Date().toISOString(),
      })

    if (error) {
      console.error('[Kronova] Failed to store voice context snapshot:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('[Kronova] Error storing voice context snapshot:', error)
    return { success: false, error: String(error) }
  }
}
