import { AIClient } from "./ai-client"

export interface LearningDataInput {
  name: string
  description?: string
  executionType: "agent" | "workflow"
  executionId: string
  executionName: string
  assetIds?: string[]
  assetContext?: Record<string, any>
  executionInput: Record<string, any>
  executionOutput: Record<string, any>
  executionMetrics?: Record<string, any>
  successScore?: number
  qualityRating?: number
  userFeedback?: string
  metadata?: Record<string, any>
  tags?: string[]
}

export interface LearningDataResult {
  id: string
  name: string
  description?: string
  executionType: string
  executionName: string
  executionOutput: Record<string, any>
  assetContext?: Record<string, any>
  similarity: number
  createdAt: string
}

export class LearningLayerSystem {
  private supabase: any
  private aiClient: AIClient
  private embeddingModel: string

  constructor(supabase: any) {
    this.supabase = supabase
    this.aiClient = new AIClient("openai", process.env.OPENAI_API_KEY || "", "text-embedding-3-small")
    this.embeddingModel = "text-embedding-3-small"
  }

  /**
   * Save execution results to the learning layer with vector embedding
   */
  async saveToLearningLayer(
    input: LearningDataInput,
    userId: string,
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      // Generate a comprehensive text representation for embedding
      const embeddingText = this.generateEmbeddingText(input)

      // Generate vector embedding
      const embeddingResponse = await this.aiClient.createEmbedding({
        model: this.embeddingModel,
        input: embeddingText,
      })

      const vectorData = embeddingResponse.data[0].embedding

      // Insert into learning layer
      const { data, error } = await this.supabase
        .from("asset_intelligence_learning")
        .insert({
          name: input.name,
          description: input.description,
          execution_type: input.executionType,
          execution_id: input.executionId,
          execution_name: input.executionName,
          asset_ids: input.assetIds || [],
          asset_context: input.assetContext || {},
          execution_input: input.executionInput,
          execution_output: input.executionOutput,
          execution_metrics: input.executionMetrics || {},
          success_score: input.successScore,
          quality_rating: input.qualityRating,
          user_feedback: input.userFeedback,
          embedding_model: this.embeddingModel,
          vector_data: vectorData,
          metadata: input.metadata || {},
          tags: input.tags || [],
          user_id: userId,
        })
        .select("id")
        .single()

      if (error) {
        console.error("[v0] Error saving to learning layer:", error)
        return { success: false, error: error.message }
      }

      return { success: true, id: data.id }
    } catch (error: any) {
      console.error("[v0] Error in saveToLearningLayer:", error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Search for similar execution results in the learning layer
   */
  async searchLearningLayer(
    query: string,
    userId: string,
    options: {
      limit?: number
      threshold?: number
      executionType?: "agent" | "workflow"
      assetIds?: string[]
    } = {},
  ): Promise<{ success: boolean; data?: LearningDataResult[]; error?: string }> {
    try {
      const { limit = 5, threshold = 0.7, executionType, assetIds } = options

      // Generate embedding for the query
      const embeddingResponse = await this.aiClient.createEmbedding({
        model: this.embeddingModel,
        input: query,
      })

      const queryEmbedding = embeddingResponse.data[0].embedding

      // Search for similar learning data
      const { data, error } = await this.supabase.rpc("match_learning_data", {
        query_embedding: queryEmbedding,
        match_threshold: threshold,
        match_count: limit,
        filter_user_id: userId,
        filter_execution_type: executionType || null,
        filter_asset_ids: assetIds || null,
      })

      if (error) {
        console.error("[v0] Error searching learning layer:", error)
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error: any) {
      console.error("[v0] Error in searchLearningLayer:", error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Get learning layer statistics for a user
   */
  async getLearningStats(userId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from("asset_intelligence_learning_stats")
        .select("*")
        .eq("user_id", userId)

      if (error) {
        console.error("[v0] Error fetching learning stats:", error)
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error: any) {
      console.error("[v0] Error in getLearningStats:", error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Generate comprehensive text for embedding from execution data
   */
  private generateEmbeddingText(input: LearningDataInput): string {
    const parts: string[] = []

    // Add name and description
    parts.push(`Execution: ${input.name}`)
    if (input.description) {
      parts.push(`Description: ${input.description}`)
    }

    // Add execution type and name
    parts.push(`Type: ${input.executionType}`)
    parts.push(`Name: ${input.executionName}`)

    // Add input context
    if (Object.keys(input.executionInput).length > 0) {
      parts.push(`Input: ${JSON.stringify(input.executionInput)}`)
    }

    // Add output (most important for learning)
    if (Object.keys(input.executionOutput).length > 0) {
      parts.push(`Output: ${JSON.stringify(input.executionOutput)}`)
    }

    // Add asset context if available
    if (input.assetContext && Object.keys(input.assetContext).length > 0) {
      parts.push(`Asset Context: ${JSON.stringify(input.assetContext)}`)
    }

    // Add tags
    if (input.tags && input.tags.length > 0) {
      parts.push(`Tags: ${input.tags.join(", ")}`)
    }

    // Add user feedback if available
    if (input.userFeedback) {
      parts.push(`Feedback: ${input.userFeedback}`)
    }

    return parts.join("\n")
  }
}
