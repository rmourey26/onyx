/**
 * Stripe Billing Metering Service
 *
 * Sends usage meter events to Stripe for metered billing on AI token consumption.
 * Uses Stripe's Billing Meters API (v1/billing/meter_events) to report usage
 * with idempotency keys to prevent double-counting.
 *
 * Meter event_name values must match the meters created in the Stripe Dashboard.
 * The canonical event name for this platform is: "ai_tokens"
 */

import { stripe } from "@/lib/stripe"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"

// ============================================================================
// Constants
// ============================================================================

/** Must match the meter event_name configured in Stripe Dashboard */
export const STRIPE_METER_EVENT_NAMES = {
  AI_TOKENS: "ai_tokens",
  EMBEDDINGS: "embeddings",
  VOICE: "voice_seconds",
} as const

export type StripeMeterEventName = (typeof STRIPE_METER_EVENT_NAMES)[keyof typeof STRIPE_METER_EVENT_NAMES]

// ============================================================================
// Types
// ============================================================================

export interface MeterEventPayload {
  /** Stripe customer ID (cus_...) */
  stripeCustomerId: string
  /** The meter event_name as configured in Stripe Dashboard */
  eventName: StripeMeterEventName
  /** The quantity of units consumed (e.g., number of tokens) */
  value: number
  /**
   * Idempotency key to prevent duplicate meter events.
   * Should be unique per operation (e.g., `agent-exec-${executionId}`).
   * Stripe deduplicates events with the same key within a 24h window.
   */
  idempotencyKey: string
  /** Unix timestamp (seconds). Defaults to now. Max 5 minutes in the past. */
  timestamp?: number
}

export interface MeterEventResult {
  success: boolean
  meterEventId?: string
  error?: string
}

export interface RecordTokenUsageParams {
  userId: string
  /** Total tokens consumed across prompt + completion */
  totalTokens: number
  promptTokens?: number
  completionTokens?: number
  /** Source of the AI call, used to build the idempotency key */
  operationId: string
  operationType: "agent" | "embedding" | "voice" | "workflow" | "analysis"
  modelId?: string
  agentId?: string
  workflowId?: string
}

// ============================================================================
// Core Metering Function
// ============================================================================

/**
 * Send a meter event to Stripe.
 * This is a fire-and-forget operation — errors are logged but never throw,
 * so they cannot interrupt the user's primary AI operation.
 */
export async function sendStripeMeterEvent(payload: MeterEventPayload): Promise<MeterEventResult> {
  if (!process.env.STRIPE_SECRET_KEY) {
    return { success: false, error: "STRIPE_SECRET_KEY not configured" }
  }

  if (payload.value <= 0) {
    return { success: false, error: "Meter event value must be > 0" }
  }

  try {
    const event = await stripe.billing.meterEvents.create(
      {
        event_name: payload.eventName,
        payload: {
          stripe_customer_id: payload.stripeCustomerId,
          value: String(payload.value),
        },
        timestamp: payload.timestamp ?? Math.floor(Date.now() / 1000),
      },
      {
        idempotencyKey: payload.idempotencyKey,
      },
    )

    return { success: true, meterEventId: event.identifier }
  } catch (error: any) {
    // Log but do not rethrow — metering must never break the AI pipeline
    console.error("[StripeMeter] Failed to send meter event:", {
      eventName: payload.eventName,
      customerId: payload.stripeCustomerId,
      value: payload.value,
      error: error?.message,
      code: error?.code,
    })
    return { success: false, error: error?.message ?? "Unknown Stripe metering error" }
  }
}

// ============================================================================
// High-Level Token Usage Recorder
// ============================================================================

/**
 * Record AI token usage: persists to Supabase and sends a Stripe meter event.
 * Call this after every AI model invocation that produces a token count.
 *
 * Steps:
 *  1. Look up the user's Stripe customer ID from profiles.
 *  2. Upsert a row into `ai_token_usage` for reporting & quota enforcement.
 *  3. Send a Stripe billing meter event (event_name = "ai_tokens").
 */
export async function recordTokenUsage(params: RecordTokenUsageParams): Promise<{
  success: boolean
  meterEventId?: string
  dbRowId?: string
  error?: string
}> {
  const supabase = createAdminSupabaseClient()

  try {
    // 1. Fetch stripe_customer_id from profiles
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", params.userId)
      .single()

    if (profileError || !profile) {
      console.warn("[StripeMeter] No profile found for userId:", params.userId)
    }

    const stripeCustomerId = profile?.stripe_customer_id

    // 2. Persist usage to our own DB for quota tracking and analytics
    const { data: usageRow, error: dbError } = await supabase
      .from("ai_token_usage")
      .insert({
        user_id: params.userId,
        operation_id: params.operationId,
        operation_type: params.operationType,
        total_tokens: params.totalTokens,
        prompt_tokens: params.promptTokens ?? 0,
        completion_tokens: params.completionTokens ?? 0,
        model_id: params.modelId,
        agent_id: params.agentId,
        workflow_id: params.workflowId,
        stripe_meter_sent: false,
        created_at: new Date().toISOString(),
      })
      .select("id")
      .single()

    if (dbError) {
      console.error("[StripeMeter] Failed to insert ai_token_usage row:", dbError.message)
    }

    // 3. Send Stripe meter event only if the customer has a Stripe ID
    //    (free-tier or unauthenticated users skip metering)
    let meterResult: MeterEventResult = { success: false, error: "No Stripe customer ID" }

    if (stripeCustomerId) {
      const idempotencyKey = `${params.operationType}-${params.operationId}-${params.userId}`

      meterResult = await sendStripeMeterEvent({
        stripeCustomerId,
        eventName: STRIPE_METER_EVENT_NAMES.AI_TOKENS,
        value: params.totalTokens,
        idempotencyKey,
      })

      // Update DB row to reflect Stripe event was sent
      if (meterResult.success && usageRow?.id) {
        await supabase
          .from("ai_token_usage")
          .update({
            stripe_meter_sent: true,
            stripe_meter_event_id: meterResult.meterEventId,
          })
          .eq("id", usageRow.id)
      }
    }

    return {
      success: true,
      meterEventId: meterResult.meterEventId,
      dbRowId: usageRow?.id,
    }
  } catch (error: any) {
    console.error("[StripeMeter] Unexpected error in recordTokenUsage:", error)
    return { success: false, error: error?.message }
  }
}

// ============================================================================
// Quota Enforcement Helper
// ============================================================================

/**
 * Returns current token usage for a user within the current billing period.
 * Used to enforce soft/hard token limits before executing AI operations.
 */
export async function getTokenUsageForPeriod(
  userId: string,
  periodStart: Date,
  periodEnd: Date,
): Promise<{
  totalTokens: number
  promptTokens: number
  completionTokens: number
  operationCount: number
}> {
  const supabase = createAdminSupabaseClient()

  const { data, error } = await supabase
    .from("ai_token_usage")
    .select("total_tokens, prompt_tokens, completion_tokens")
    .eq("user_id", userId)
    .gte("created_at", periodStart.toISOString())
    .lte("created_at", periodEnd.toISOString())

  if (error || !data) {
    return { totalTokens: 0, promptTokens: 0, completionTokens: 0, operationCount: 0 }
  }

  return {
    totalTokens: data.reduce((sum, r) => sum + (r.total_tokens || 0), 0),
    promptTokens: data.reduce((sum, r) => sum + (r.prompt_tokens || 0), 0),
    completionTokens: data.reduce((sum, r) => sum + (r.completion_tokens || 0), 0),
    operationCount: data.length,
  }
}

// ============================================================================
// Backfill Utility — resend unsent meter events
// ============================================================================

/**
 * Retries sending Stripe meter events for rows where stripe_meter_sent = false.
 * Intended to be called from a cron job or admin endpoint.
 */
export async function backfillUnsentMeterEvents(): Promise<{
  processed: number
  succeeded: number
  failed: number
}> {
  const supabase = createAdminSupabaseClient()

  const { data: unsent, error } = await supabase
    .from("ai_token_usage")
    .select("id, user_id, operation_id, operation_type, total_tokens, created_at")
    .eq("stripe_meter_sent", false)
    .limit(100) // Process in batches of 100

  if (error || !unsent || unsent.length === 0) {
    return { processed: 0, succeeded: 0, failed: 0 }
  }

  let succeeded = 0
  let failed = 0

  for (const row of unsent) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", row.user_id)
      .single()

    if (!profile?.stripe_customer_id) {
      failed++
      continue
    }

    const idempotencyKey = `${row.operation_type}-${row.operation_id}-${row.user_id}`
    const timestamp = Math.floor(new Date(row.created_at).getTime() / 1000)

    const result = await sendStripeMeterEvent({
      stripeCustomerId: profile.stripe_customer_id,
      eventName: STRIPE_METER_EVENT_NAMES.AI_TOKENS,
      value: row.total_tokens,
      idempotencyKey,
      timestamp,
    })

    if (result.success) {
      await supabase
        .from("ai_token_usage")
        .update({ stripe_meter_sent: true, stripe_meter_event_id: result.meterEventId })
        .eq("id", row.id)
      succeeded++
    } else {
      failed++
    }
  }

  return { processed: unsent.length, succeeded, failed }
}
