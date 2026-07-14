import crypto from "crypto"
import { createServerSupabaseClient } from "@/lib/supabase/server"

interface DeliverWebhookParams {
  url: string
  event: string
  payload: any
  userId: string
  webhookId?: string
  secret?: string
}

export async function deliverWebhook({
  url,
  event,
  payload,
  userId,
  webhookId,
  secret,
}: DeliverWebhookParams): Promise<boolean> {
  const supabase = await createServerSupabaseClient()

  try {
    const webhookPayload = {
      event,
      data: payload,
      timestamp: new Date().toISOString(),
    }

    let signature = ""
    if (secret) {
      const hmac = crypto.createHmac("sha256", secret)
      hmac.update(JSON.stringify(webhookPayload))
      signature = hmac.digest("hex")
    }

    const maxRetries = 3
    let attempt = 0
    let success = false
    let lastError = ""

    while (attempt < maxRetries && !success) {
      attempt++

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Webhook-Signature": signature,
            "X-Webhook-Event": event,
            "User-Agent": "ResendIt-Webhooks/1.0",
          },
          body: JSON.stringify(webhookPayload),
        })

        if (response.ok) {
          success = true
        } else {
          lastError = `HTTP ${response.status}: ${response.statusText}`
        }
      } catch (error) {
        lastError = error instanceof Error ? error.message : "Unknown error"
      }

      if (!success && attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000))
      }
    }

    if (webhookId) {
      await supabase.from("webhook_logs").insert({
        webhook_id: webhookId,
        event,
        payload: webhookPayload,
        status: success ? "success" : "failed",
        response_status: success ? 200 : null,
        error_message: success ? null : lastError,
        delivered_at: success ? new Date().toISOString() : null,
        attempts: attempt,
      })

      if (success) {
        await supabase
          .from("webhooks")
          .update({
            last_triggered_at: new Date().toISOString(),
            last_status: "success",
            failure_count: 0,
          })
          .eq("id", webhookId)
      } else {
        await supabase
          .from("webhooks")
          .update({
            last_triggered_at: new Date().toISOString(),
            last_status: "failed",
            failure_count: supabase.rpc("increment", { x: 1 }),
          })
          .eq("id", webhookId)
      }
    }

    return success
  } catch (error) {
    console.error("Error delivering webhook:", error)
    return false
  }
}
