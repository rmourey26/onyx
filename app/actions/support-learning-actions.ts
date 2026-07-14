"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface SupportConversation {
  id: string
  user_id: string
  session_id: string
  channel: string
  status: string
  sentiment_score: number | null
  resolution_time_seconds: number | null
  customer_satisfaction_score: number | null
  tags: string[]
  metadata: any
  created_at: string
  resolved_at: string | null
  updated_at: string
}

export interface IntentPattern {
  id: string
  intent_name: string
  confidence_score: number
  occurrence_count: number
  avg_resolution_time: number
  success_rate: number
  last_detected_at: string
}

export interface KnowledgeGap {
  id: string
  topic: string
  query_count: number
  avg_confidence: number
  priority: "high" | "medium" | "low"
  suggested_content: string | null
  created_at: string
}

export interface LearningMetrics {
  activeConversations: number
  avgResolutionTime: number
  customerSatisfaction: number
  knowledgeBaseGrowth: number
  periodComparison: {
    activeConversations: number
    avgResolutionTime: number
    customerSatisfaction: number
    knowledgeBaseGrowth: number
  }
}

/**
 * Get learning metrics for the support dashboard
 */
export async function getSupportLearningMetrics(
  userId: string,
  timeRange: "24h" | "7d" | "30d" | "90d" = "7d"
): Promise<{ data: LearningMetrics | null; error: string | null }> {
  try {
    const supabase = await createClient()

    // Calculate date range
    const now = new Date()
    const startDate = new Date()
    const previousStartDate = new Date()

    switch (timeRange) {
      case "24h":
        startDate.setHours(now.getHours() - 24)
        previousStartDate.setHours(now.getHours() - 48)
        break
      case "7d":
        startDate.setDate(now.getDate() - 7)
        previousStartDate.setDate(now.getDate() - 14)
        break
      case "30d":
        startDate.setDate(now.getDate() - 30)
        previousStartDate.setDate(now.getDate() - 60)
        break
      case "90d":
        startDate.setDate(now.getDate() - 90)
        previousStartDate.setDate(now.getDate() - 180)
        break
    }

    // Get current period metrics
    const { data: currentConversations, error: convError } = await supabase
      .from("support_conversations")
      .select("*")
      .gte("created_at", startDate.toISOString())
      .lte("created_at", now.toISOString())

    if (convError) throw convError

    // Get previous period metrics for comparison
    const { data: previousConversations } = await supabase
      .from("support_conversations")
      .select("*")
      .gte("created_at", previousStartDate.toISOString())
      .lt("created_at", startDate.toISOString())

    // Calculate metrics
    const activeConversations = currentConversations?.filter((c) => c.status !== "resolved").length || 0
    const prevActiveConversations = previousConversations?.filter((c) => c.status !== "resolved").length || 0

    const resolvedCurrent = currentConversations?.filter((c) => c.status === "resolved") || []
    const avgResolutionTime =
      resolvedCurrent.length > 0
        ? resolvedCurrent.reduce((sum, c) => sum + (c.resolution_time_seconds || 0), 0) /
          resolvedCurrent.length /
          60
        : 0

    const resolvedPrevious = previousConversations?.filter((c) => c.status === "resolved") || []
    const prevAvgResolutionTime =
      resolvedPrevious.length > 0
        ? resolvedPrevious.reduce((sum, c) => sum + (c.resolution_time_seconds || 0), 0) /
          resolvedPrevious.length /
          60
        : 0

    const satisfactionScores =
      currentConversations?.filter((c) => c.customer_satisfaction_score !== null) || []
    const customerSatisfaction =
      satisfactionScores.length > 0
        ? (satisfactionScores.reduce((sum, c) => sum + (c.customer_satisfaction_score || 0), 0) /
            satisfactionScores.length) *
          100
        : 0

    const prevSatisfactionScores =
      previousConversations?.filter((c) => c.customer_satisfaction_score !== null) || []
    const prevCustomerSatisfaction =
      prevSatisfactionScores.length > 0
        ? (prevSatisfactionScores.reduce((sum, c) => sum + (c.customer_satisfaction_score || 0), 0) /
            prevSatisfactionScores.length) *
          100
        : 0

    // Get knowledge base growth
    const { data: kbArticles } = await supabase
      .from("support_kb_learning")
      .select("*")
      .gte("created_at", startDate.toISOString())
      .lte("created_at", now.toISOString())

    const { data: prevKbArticles } = await supabase
      .from("support_kb_learning")
      .select("*")
      .gte("created_at", previousStartDate.toISOString())
      .lt("created_at", startDate.toISOString())

    const knowledgeBaseGrowth = kbArticles?.length || 0
    const prevKnowledgeBaseGrowth = prevKbArticles?.length || 0

    return {
      data: {
        activeConversations,
        avgResolutionTime,
        customerSatisfaction,
        knowledgeBaseGrowth,
        periodComparison: {
          activeConversations:
            prevActiveConversations > 0
              ? ((activeConversations - prevActiveConversations) / prevActiveConversations) * 100
              : 0,
          avgResolutionTime:
            prevAvgResolutionTime > 0
              ? ((avgResolutionTime - prevAvgResolutionTime) / prevAvgResolutionTime) * 100
              : 0,
          customerSatisfaction:
            prevCustomerSatisfaction > 0
              ? ((customerSatisfaction - prevCustomerSatisfaction) / prevCustomerSatisfaction) * 100
              : 0,
          knowledgeBaseGrowth:
            prevKnowledgeBaseGrowth > 0
              ? ((knowledgeBaseGrowth - prevKnowledgeBaseGrowth) / prevKnowledgeBaseGrowth) * 100
              : 0,
        },
      },
      error: null,
    }
  } catch (error) {
    console.error("[v0] Error fetching support learning metrics:", error)
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to fetch support learning metrics",
    }
  }
}

/**
 * Get top intent patterns
 */
export async function getIntentPatterns(
  userId: string,
  limit: number = 10
): Promise<{ data: IntentPattern[] | null; error: string | null }> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("support_intent_training")
      .select("*")
      .order("occurrence_count", { ascending: false })
      .limit(limit)

    if (error) throw error

    return { data: data as IntentPattern[], error: null }
  } catch (error) {
    console.error("[v0] Error fetching intent patterns:", error)
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to fetch intent patterns",
    }
  }
}

/**
 * Get knowledge gaps
 */
export async function getKnowledgeGaps(
  userId: string,
  limit: number = 10
): Promise<{ data: KnowledgeGap[] | null; error: string | null }> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("support_learning_patterns")
      .select("*")
      .eq("pattern_type", "knowledge_gap")
      .order("frequency", { ascending: false })
      .limit(limit)

    if (error) throw error

    // Transform data to match KnowledgeGap interface
    const knowledgeGaps: KnowledgeGap[] =
      data?.map((item) => ({
        id: item.id,
        topic: item.pattern_name,
        query_count: item.frequency,
        avg_confidence: item.confidence_score || 0,
        priority:
          item.confidence_score < 0.7
            ? "high"
            : item.confidence_score < 0.8
              ? "medium"
              : "low",
        suggested_content: item.insights?.suggested_content || null,
        created_at: item.created_at,
      })) || []

    return { data: knowledgeGaps, error: null }
  } catch (error) {
    console.error("[v0] Error fetching knowledge gaps:", error)
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to fetch knowledge gaps",
    }
  }
}

/**
 * Get recent support conversations
 */
export async function getSupportConversations(
  userId: string,
  limit: number = 50
): Promise<{ data: SupportConversation[] | null; error: string | null }> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("support_conversations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) throw error

    return { data: data as SupportConversation[], error: null }
  } catch (error) {
    console.error("[v0] Error fetching support conversations:", error)
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to fetch support conversations",
    }
  }
}

/**
 * Create a new support conversation
 */
export async function createSupportConversation(
  userId: string,
  data: {
    channel: string
    metadata?: any
  }
): Promise<{ data: SupportConversation | null; error: string | null }> {
  try {
    const supabase = await createClient()

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const { data: conversation, error } = await supabase
      .from("support_conversations")
      .insert({
        user_id: userId,
        session_id: sessionId,
        channel: data.channel,
        status: "active",
        metadata: data.metadata || {},
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath("/ai-suite/support-learning")

    return { data: conversation as SupportConversation, error: null }
  } catch (error) {
    console.error("[v0] Error creating support conversation:", error)
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to create support conversation",
    }
  }
}

/**
 * Update support conversation status and metrics
 */
export async function updateSupportConversation(
  conversationId: string,
  data: {
    status?: string
    sentiment_score?: number
    resolution_time_seconds?: number
    customer_satisfaction_score?: number
    tags?: string[]
  }
): Promise<{ data: SupportConversation | null; error: string | null }> {
  try {
    const supabase = await createClient()

    const updateData: any = { ...data }
    if (data.status === "resolved") {
      updateData.resolved_at = new Date().toISOString()
    }

    const { data: conversation, error } = await supabase
      .from("support_conversations")
      .update(updateData)
      .eq("id", conversationId)
      .select()
      .single()

    if (error) throw error

    revalidatePath("/ai-suite/support-learning")

    return { data: conversation as SupportConversation, error: null }
  } catch (error) {
    console.error("[v0] Error updating support conversation:", error)
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to update support conversation",
    }
  }
}

/**
 * Add a message to a support conversation
 */
export async function addSupportMessage(
  conversationId: string,
  data: {
    sender_type: "user" | "agent" | "bot"
    message_text: string
    intent_detected?: string
    confidence_score?: number
    metadata?: any
  }
): Promise<{ data: any | null; error: string | null }> {
  try {
    const supabase = await createClient()

    const { data: message, error } = await supabase
      .from("support_messages")
      .insert({
        conversation_id: conversationId,
        ...data,
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath("/ai-suite/support-learning")

    return { data: message, error: null }
  } catch (error) {
    console.error("[v0] Error adding support message:", error)
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to add support message",
    }
  }
}

/**
 * Train intent classification with new data
 */
export async function trainIntentClassification(
  userId: string,
  data: {
    intent_name: string
    training_examples: string[]
    metadata?: any
  }
): Promise<{ data: any | null; error: string | null }> {
  try {
    const supabase = await createClient()

    // Check if intent already exists
    const { data: existingIntent } = await supabase
      .from("support_intent_training")
      .select("*")
      .eq("intent_name", data.intent_name)
      .single()

    if (existingIntent) {
      // Update existing intent
      const { data: updated, error } = await supabase
        .from("support_intent_training")
        .update({
          occurrence_count: existingIntent.occurrence_count + data.training_examples.length,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingIntent.id)
        .select()
        .single()

      if (error) throw error

      revalidatePath("/ai-suite/support-learning")
      return { data: updated, error: null }
    }

    // Create new intent
    const { data: newIntent, error } = await supabase
      .from("support_intent_training")
      .insert({
        intent_name: data.intent_name,
        confidence_score: 0.5, // Initial confidence
        occurrence_count: data.training_examples.length,
        avg_resolution_time: 0,
        success_rate: 0,
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath("/ai-suite/support-learning")

    return { data: newIntent, error: null }
  } catch (error) {
    console.error("[v0] Error training intent classification:", error)
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to train intent classification",
    }
  }
}
