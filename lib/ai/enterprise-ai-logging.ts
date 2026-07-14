/**
 * Enterprise AI Logging Service
 * 
 * Comprehensive logging for all AI operations with automatic integration
 * to the Asset Intelligence Learning Layer. Every AI request, response,
 * and analysis is tracked and fed into the learning system for continuous
 * improvement and pattern recognition.
 */

import type { SupabaseClient } from "@supabase/supabase-js"
import { LearningLayerSystem } from "./learning-layer-system"

// ============================================================================
// Types
// ============================================================================

export interface AIRequestLogEntry {
  userId: string
  agentId?: string
  modelId?: string
  workflowId?: string
  requestType: "text" | "voice" | "workflow" | "tool_execution" | "analysis" | "embedding"
  inputLength?: number
  outputLength?: number
  tokensUsed?: number
  costUsd?: number
  responseTimeMs?: number
  status: "pending" | "success" | "error"
  errorMessage?: string
  metadata?: Record<string, any>
}

export interface AIOperationContext {
  userId: string
  agentId?: string
  workflowId?: string
  assetIds?: string[]
  assetContext?: Record<string, any>
  operationType: string
  operationName: string
  input: Record<string, any>
  tags?: string[]
  metadata?: Record<string, any>
}

export interface AIOperationResult {
  success: boolean
  output: Record<string, any>
  tokensUsed?: number
  costUsd?: number
  responseTimeMs?: number
  confidenceScore?: number
  qualityScore?: number
  errorMessage?: string
  analysis?: Record<string, any>
}

export interface EnterpriseLogResult {
  success: boolean
  requestLogId?: string
  learningLayerId?: string
  error?: string
}

// ============================================================================
// Enterprise AI Logging Service
// ============================================================================

export class EnterpriseAILoggingService {
  private supabase: SupabaseClient
  private learningLayer: LearningLayerSystem

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
    this.learningLayer = new LearningLayerSystem(supabase)
  }

  /**
   * Log an AI operation and automatically feed data to the learning layer
   * This is the primary method for logging all AI operations in an enterprise-grade manner
   */
  async logAIOperation(
    context: AIOperationContext,
    result: AIOperationResult
  ): Promise<EnterpriseLogResult> {
    const startTime = Date.now()
    
    try {
      // 1. Log to ai_request_logs table
      const requestLogResult = await this.logToRequestLogs({
        userId: context.userId,
        agentId: context.agentId,
        workflowId: context.workflowId,
        requestType: this.mapOperationTypeToRequestType(context.operationType),
        inputLength: JSON.stringify(context.input).length,
        outputLength: JSON.stringify(result.output).length,
        tokensUsed: result.tokensUsed,
        costUsd: result.costUsd,
        responseTimeMs: result.responseTimeMs,
        status: result.success ? "success" : "error",
        errorMessage: result.errorMessage,
        metadata: {
          ...context.metadata,
          operationType: context.operationType,
          operationName: context.operationName,
          assetIds: context.assetIds,
          confidenceScore: result.confidenceScore,
          qualityScore: result.qualityScore,
        },
      })

      if (!requestLogResult.success) {
        console.error("[EnterpriseAILogging] Failed to log to ai_request_logs:", requestLogResult.error)
      }

      // 2. Feed successful operations to the learning layer
      let learningLayerResult: { success: boolean; id?: string; error?: string } = { success: false }
      
      if (result.success && context.assetIds && context.assetIds.length > 0) {
        learningLayerResult = await this.learningLayer.saveToLearningLayer(
          {
            name: `${context.operationType}: ${context.operationName}`,
            description: `AI operation executed for ${context.assetIds.length} asset(s)`,
            executionType: context.agentId ? "agent" : "workflow",
            executionId: requestLogResult.requestId || crypto.randomUUID(),
            executionName: context.operationName,
            assetIds: context.assetIds,
            assetContext: context.assetContext,
            executionInput: context.input,
            executionOutput: result.output,
            executionMetrics: {
              tokensUsed: result.tokensUsed,
              costUsd: result.costUsd,
              responseTimeMs: result.responseTimeMs,
              loggingTimeMs: Date.now() - startTime,
            },
            successScore: result.success ? (result.qualityScore || 1.0) : 0,
            qualityRating: result.qualityScore,
            metadata: {
              ...context.metadata,
              confidenceScore: result.confidenceScore,
              analysis: result.analysis,
            },
            tags: context.tags || [],
          },
          context.userId
        )

        if (!learningLayerResult.success) {
          console.error("[EnterpriseAILogging] Failed to save to learning layer:", learningLayerResult.error)
        }
      }

      return {
        success: true,
        requestLogId: requestLogResult.requestId,
        learningLayerId: learningLayerResult.id,
      }
    } catch (error: any) {
      console.error("[EnterpriseAILogging] Error in logAIOperation:", error)
      return {
        success: false,
        error: error.message,
      }
    }
  }

  /**
   * Log a voice operation with transcript and audio data
   */
  async logVoiceOperation(
    context: AIOperationContext & {
      audioUrl?: string
      transcription: string
      durationSeconds?: number
      languageCode?: string
    },
    result: AIOperationResult & {
      audioResponseUrl?: string
    }
  ): Promise<EnterpriseLogResult> {
    try {
      // 1. Log to voice_execution_logs
      const { data: voiceLog, error: voiceError } = await this.supabase
        .from("voice_execution_logs")
        .insert({
          user_id: context.userId,
          agent_id: context.agentId,
          audio_url: context.audioUrl,
          transcription: context.transcription,
          duration_seconds: context.durationSeconds,
          language_code: context.languageCode || "en-US",
          metadata: {
            ...context.metadata,
            operationType: context.operationType,
            operationName: context.operationName,
          },
        })
        .select("id")
        .single()

      if (voiceError) {
        console.error("[EnterpriseAILogging] Failed to log voice execution:", voiceError)
      }

      // 2. Log voice analysis result if successful
      if (result.success && voiceLog) {
        await this.supabase.from("voice_analysis_results").insert({
          request_id: voiceLog.id,
          user_id: context.userId,
          agent_id: context.agentId,
          response: JSON.stringify(result.output),
          audio_response_url: result.audioResponseUrl,
          execution_time_ms: result.responseTimeMs,
          analysis_data: result.analysis,
          metadata: {
            confidenceScore: result.confidenceScore,
            qualityScore: result.qualityScore,
          },
        })
      }

      // 3. Also log to standard AI request logs for unified tracking
      const aiLogResult = await this.logAIOperation(
        {
          ...context,
          operationType: "voice",
          input: {
            transcription: context.transcription,
            audioUrl: context.audioUrl,
            durationSeconds: context.durationSeconds,
          },
        },
        result
      )

      return {
        success: true,
        requestLogId: voiceLog?.id || aiLogResult.requestLogId,
        learningLayerId: aiLogResult.learningLayerId,
      }
    } catch (error: any) {
      console.error("[EnterpriseAILogging] Error in logVoiceOperation:", error)
      return {
        success: false,
        error: error.message,
      }
    }
  }

  /**
   * Log a tool execution with detailed metrics
   */
  async logToolExecution(
    context: AIOperationContext & {
      toolId: string
      toolName: string
      toolVersion?: string
    },
    result: AIOperationResult & {
      toolOutputType?: string
    }
  ): Promise<EnterpriseLogResult> {
    return this.logAIOperation(
      {
        ...context,
        operationType: "tool_execution",
        operationName: `${context.toolName} v${context.toolVersion || "1.0"}`,
        metadata: {
          ...context.metadata,
          toolId: context.toolId,
          toolName: context.toolName,
          toolVersion: context.toolVersion,
          toolOutputType: result.toolOutputType,
        },
      },
      result
    )
  }

  /**
   * Log a workflow execution with step-by-step tracking
   */
  async logWorkflowExecution(
    context: AIOperationContext & {
      workflowSteps?: string[]
      completedSteps?: string[]
    },
    result: AIOperationResult & {
      stepResults?: Record<string, any>
    }
  ): Promise<EnterpriseLogResult> {
    return this.logAIOperation(
      {
        ...context,
        operationType: "workflow",
        metadata: {
          ...context.metadata,
          workflowSteps: context.workflowSteps,
          completedSteps: context.completedSteps,
          stepResults: result.stepResults,
        },
      },
      result
    )
  }

  /**
   * Get aggregated statistics for AI operations
   */
  async getOperationStatistics(
    userId: string,
    options: {
      startDate?: string
      endDate?: string
      operationType?: string
      agentId?: string
    } = {}
  ): Promise<{
    success: boolean
    data?: {
      totalRequests: number
      successfulRequests: number
      failedRequests: number
      totalTokensUsed: number
      totalCostUsd: number
      avgResponseTimeMs: number
      byRequestType: Record<string, number>
      learningDataPoints: number
    }
    error?: string
  }> {
    try {
      let query = this.supabase
        .from("ai_request_logs")
        .select("*", { count: "exact" })
        .eq("user_id", userId)

      if (options.startDate) {
        query = query.gte("created_at", options.startDate)
      }
      if (options.endDate) {
        query = query.lte("created_at", options.endDate)
      }
      if (options.agentId) {
        query = query.eq("agent_id", options.agentId)
      }

      const { data: logs, count, error } = await query

      if (error) throw error

      // Calculate statistics
      const successfulRequests = logs?.filter(l => l.status === "success").length || 0
      const failedRequests = logs?.filter(l => l.status === "error").length || 0
      const totalTokensUsed = logs?.reduce((sum, l) => sum + (l.tokens_used || 0), 0) || 0
      const totalCostUsd = logs?.reduce((sum, l) => sum + (l.cost_usd || 0), 0) || 0
      
      const responseTimes = logs?.filter(l => l.response_time_ms).map(l => l.response_time_ms!) || []
      const avgResponseTimeMs = responseTimes.length > 0 
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
        : 0

      // Count by request type
      const byRequestType: Record<string, number> = {}
      logs?.forEach(l => {
        byRequestType[l.request_type] = (byRequestType[l.request_type] || 0) + 1
      })

      // Get learning layer count
      const { count: learningCount } = await this.supabase
        .from("asset_intelligence_learning")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)

      return {
        success: true,
        data: {
          totalRequests: count || 0,
          successfulRequests,
          failedRequests,
          totalTokensUsed,
          totalCostUsd,
          avgResponseTimeMs: Math.round(avgResponseTimeMs),
          byRequestType,
          learningDataPoints: learningCount || 0,
        },
      }
    } catch (error: any) {
      console.error("[EnterpriseAILogging] Error getting statistics:", error)
      return {
        success: false,
        error: error.message,
      }
    }
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private async logToRequestLogs(entry: AIRequestLogEntry): Promise<{
    success: boolean
    requestId?: string
    error?: string
  }> {
    try {
      const { data, error } = await this.supabase
        .from("ai_request_logs")
        .insert({
          user_id: entry.userId,
          agent_id: entry.agentId,
          model_id: entry.modelId,
          workflow_id: entry.workflowId,
          request_type: entry.requestType,
          input_length: entry.inputLength,
          output_length: entry.outputLength,
          tokens_used: entry.tokensUsed,
          cost_usd: entry.costUsd,
          response_time_ms: entry.responseTimeMs,
          status: entry.status,
          error_message: entry.errorMessage,
          metadata: entry.metadata,
          created_at: new Date().toISOString(),
        })
        .select("id")
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, requestId: data.id }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  private mapOperationTypeToRequestType(
    operationType: string
  ): "text" | "voice" | "workflow" | "tool_execution" {
    const mapping: Record<string, "text" | "voice" | "workflow" | "tool_execution"> = {
      voice: "voice",
      workflow: "workflow",
      tool: "tool_execution",
      tool_execution: "tool_execution",
      agent: "text",
      analysis: "text",
      embedding: "text",
      text: "text",
    }
    return mapping[operationType.toLowerCase()] || "text"
  }
}

// ============================================================================
// Singleton Instance Factory
// ============================================================================

let loggingServiceInstance: EnterpriseAILoggingService | null = null

export function getEnterpriseAILoggingService(supabase: SupabaseClient): EnterpriseAILoggingService {
  if (!loggingServiceInstance) {
    loggingServiceInstance = new EnterpriseAILoggingService(supabase)
  }
  return loggingServiceInstance
}

// ============================================================================
// Convenience Functions for Quick Logging
// ============================================================================

/**
 * Quick function to log an AI operation with minimal parameters
 */
export async function logAIOperationQuick(
  supabase: SupabaseClient,
  userId: string,
  operationName: string,
  input: Record<string, any>,
  output: Record<string, any>,
  options: {
    agentId?: string
    assetIds?: string[]
    tokensUsed?: number
    responseTimeMs?: number
    tags?: string[]
  } = {}
): Promise<EnterpriseLogResult> {
  const service = getEnterpriseAILoggingService(supabase)
  return service.logAIOperation(
    {
      userId,
      agentId: options.agentId,
      assetIds: options.assetIds,
      operationType: "text",
      operationName,
      input,
      tags: options.tags,
    },
    {
      success: true,
      output,
      tokensUsed: options.tokensUsed,
      responseTimeMs: options.responseTimeMs,
    }
  )
}
