"use server"

import { stripe } from "@/lib/stripe"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { headers } from "next/headers"
import { getTokenUsageForPeriod, backfillUnsentMeterEvents } from "@/lib/stripe/metering"

export async function createCheckoutSession(priceId: string) {
  try {
    console.log("[v0] Creating checkout session for price:", priceId)
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.log("[v0] User not authenticated")
      return { error: "Unauthorized", url: null }
    }

    console.log("[v0] User authenticated:", user.id)
    const { data: profile } = await supabase.from("profiles").select("stripe_customer_id").eq("id", user.id).single()

    let customerId = profile?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        name: user.user_metadata?.full_name,
        metadata: { userId: user.id },
      })
      customerId = customer.id
      await supabase.from("profiles").update({ stripe_customer_id: customerId }).eq("id", user.id)
    }

    const headersList = await headers()
    // Prefer the forwarded host (set by Vercel edge) over the raw origin header
    // so the success/cancel URLs resolve to the correct production domain even
    // when the action is called from within the v0 preview iframe.
    const host = headersList.get("x-forwarded-host") || headersList.get("host")
    const proto = headersList.get("x-forwarded-proto") || "https"
    const origin = host ? `${proto}://${host}` : "http://localhost:3000"

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer: customerId,
      line_items: [
        {
          price: priceId,
          // quantity must be omitted for metered prices — usage is reported via Stripe meter events
        },
      ],
      mode: "subscription",
      success_url: `${origin}/ai-suite/subscriptions?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/ai-suite/subscriptions?canceled=true`,
      metadata: { userId: user.id },
    })

    if (session.url) {
      return { url: session.url, error: null }
    }

    return { error: "Failed to create checkout session", url: null }
  } catch (error: any) {
    console.error("Error creating checkout session:", error)
    return { error: error.message || "Failed to create checkout session", url: null }
  }
}

export async function createStripePortalSession() {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Unauthorized", url: "/login" }
    }

    const { data: profile } = await supabase.from("profiles").select("stripe_customer_id").eq("id", user.id).single()

    if (!profile?.stripe_customer_id) {
      console.error("User does not have a billing account.")
      return { error: "No billing account found" }
    }

    const headersList = await headers()
    const origin = headersList.get("origin") || "http://localhost:3000"
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${origin}/ai-suite/subscriptions`,
    })

    if (portalSession.url) {
      return { url: portalSession.url }
    }

    return { error: "Failed to create portal session" }
  } catch (error: any) {
    console.error("Error creating portal session:", error)
    return { error: error.message || "Failed to create portal session" }
  }
}

/**
 * Returns the current-period AI token usage for the authenticated user.
 * Uses the active subscription's current_period_start/end for the window,
 * falling back to the current calendar month if no active subscription exists.
 */
export async function getUsageForCurrentPeriod(): Promise<{
  totalTokens: number
  promptTokens: number
  completionTokens: number
  operationCount: number
  periodStart: string
  periodEnd: string
  error?: string
}> {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return {
        totalTokens: 0,
        promptTokens: 0,
        completionTokens: 0,
        operationCount: 0,
        periodStart: "",
        periodEnd: "",
        error: "Unauthorized",
      }
    }

    // Prefer subscription period if available
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("current_period_start, current_period_end")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created", { ascending: false })
      .limit(1)
      .single()

    const now = new Date()
    const periodStart = subscription?.current_period_start
      ? new Date(subscription.current_period_start)
      : new Date(now.getFullYear(), now.getMonth(), 1)

    const periodEnd = subscription?.current_period_end
      ? new Date(subscription.current_period_end)
      : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    const usage = await getTokenUsageForPeriod(user.id, periodStart, periodEnd)

    return {
      ...usage,
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
    }
  } catch (error: any) {
    console.error("Error fetching usage for period:", error)
    return {
      totalTokens: 0,
      promptTokens: 0,
      completionTokens: 0,
      operationCount: 0,
      periodStart: "",
      periodEnd: "",
      error: error.message,
    }
  }
}

/**
 * Admin-only: Retry sending Stripe meter events for rows where stripe_meter_sent = false.
 * Safe to call multiple times — idempotency keys prevent duplicate charges.
 */
export async function triggerMeterEventBackfill(): Promise<{
  processed: number
  succeeded: number
  failed: number
  error?: string
}> {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { processed: 0, succeeded: 0, failed: 0, error: "Unauthorized" }

    const result = await backfillUnsentMeterEvents()
    return result
  } catch (error: any) {
    console.error("Error triggering meter backfill:", error)
    return { processed: 0, succeeded: 0, failed: 0, error: error.message }
  }
}
