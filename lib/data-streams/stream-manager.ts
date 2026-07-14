import { createServerSupabaseClient } from "@/lib/supabase/server"

export type DataStreamType = "agents" | "workflows" | "assets" | "iot_sensors" | "ai_analysis"
export type StreamFormat = "sse" | "polling"

export interface StreamOptions {
  userId: string
  type: DataStreamType
  format: StreamFormat
  filters?: Record<string, any>
  limit?: number
}

export interface StreamEvent {
  id: string
  type: DataStreamType
  data: any
  timestamp: string
}

export class DataStreamManager {
  private subscriptions = new Map<string, () => void>()

  /**
   * Get subscription tier and rate limits
   */
  async getSubscriptionLimits(userId: string) {
    const supabase = await createServerSupabaseClient()

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("plan_tier, has_api_access")
      .eq("user_id", userId)
      .eq("status", "active")
      .single()

    const tier = subscription?.plan_tier || "free"

    // Define tier-based limits
    const limits = {
      free: {
        format: "polling" as StreamFormat,
        rateLimit: 60, // requests per hour
        maxStreams: 1,
        pollInterval: 30000, // 30 seconds
      },
      lite: {
        format: "polling" as StreamFormat,
        rateLimit: 180,
        maxStreams: 2,
        pollInterval: 15000, // 15 seconds
      },
      pro: {
        format: "sse" as StreamFormat,
        rateLimit: 1000,
        maxStreams: 10,
        pollInterval: 1000, // 1 second fallback
      },
      enterprise: {
        format: "sse" as StreamFormat,
        rateLimit: -1, // unlimited
        maxStreams: -1, // unlimited
        pollInterval: 1000,
      },
    }

    return limits[tier as keyof typeof limits] || limits.free
  }

  /**
   * Create a Server-Sent Events stream
   */
  createSSEStream(options: StreamOptions): ReadableStream {
    const encoder = new TextEncoder()

    return new ReadableStream({
      async start(controller) {
        console.log("[v0] [DataStream] Starting SSE stream", { type: options.type, userId: options.userId })

        try {
          const supabase = await createServerSupabaseClient()

          // Send initial connection message
          const connectionMsg = `data: ${JSON.stringify({
            type: "connection",
            status: "connected",
            streamType: options.type,
            timestamp: new Date().toISOString(),
          })}\n\n`
          controller.enqueue(encoder.encode(connectionMsg))

          // Set up real-time subscription based on stream type
          let channel: any

          if (options.type === "agents") {
            channel = supabase
              .channel(`ai_analysis_results:${options.userId}`)
              .on(
                "postgres_changes",
                {
                  event: "INSERT",
                  schema: "public",
                  table: "ai_analysis_results",
                  filter: `user_id=eq.${options.userId}`,
                },
                (payload) => {
                  const event: StreamEvent = {
                    id: payload.new.id,
                    type: "agents",
                    data: payload.new,
                    timestamp: new Date().toISOString(),
                  }
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
                },
              )
              .subscribe()
          } else if (options.type === "workflows") {
            channel = supabase
              .channel(`ai_workflow_runs:${options.userId}`)
              .on(
                "postgres_changes",
                {
                  event: "*",
                  schema: "public",
                  table: "ai_workflow_runs",
                  filter: `user_id=eq.${options.userId}`,
                },
                (payload) => {
                  const event: StreamEvent = {
                    id: payload.new.id,
                    type: "workflows",
                    data: payload.new,
                    timestamp: new Date().toISOString(),
                  }
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
                },
              )
              .subscribe()
          } else if (options.type === "iot_sensors") {
            channel = supabase
              .channel(`iot_sensor_readings:${options.userId}`)
              .on(
                "postgres_changes",
                {
                  event: "INSERT",
                  schema: "public",
                  table: "iot_sensor_readings",
                  filter: `user_id=eq.${options.userId}`,
                },
                (payload) => {
                  const event: StreamEvent = {
                    id: payload.new.id,
                    type: "iot_sensors",
                    data: payload.new,
                    timestamp: new Date().toISOString(),
                  }
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
                },
              )
              .subscribe()
          }

          // Keep-alive ping every 30 seconds
          const keepAliveInterval = setInterval(() => {
            controller.enqueue(encoder.encode(": keep-alive\n\n"))
          }, 30000)

          // Cleanup on disconnect
          return () => {
            console.log("[v0] [DataStream] Closing SSE stream", { type: options.type })
            clearInterval(keepAliveInterval)
            if (channel) {
              supabase.removeChannel(channel)
            }
          }
        } catch (error) {
          console.error("[v0] [DataStream] SSE stream error:", error)
          controller.error(error)
        }
      },

      cancel() {
        console.log("[v0] [DataStream] Client cancelled SSE stream")
      },
    })
  }

  /**
   * Get polling data snapshot
   */
  async getPollingData(options: StreamOptions): Promise<StreamEvent[]> {
    const supabase = await createServerSupabaseClient()
    const limit = options.limit || 50

    try {
      if (options.type === "agents") {
        const { data, error } = await supabase
          .from("ai_analysis_results")
          .select("*, ai_agents!inner(name)")
          .eq("user_id", options.userId)
          .order("created_at", { ascending: false })
          .limit(limit)

        if (error) throw error

        return (
          data?.map((item: any) => ({
            id: item.id,
            type: "agents" as DataStreamType,
            data: {
              ...item,
              agent_name: item.ai_agents.name,
            },
            timestamp: item.created_at,
          })) || []
        )
      } else if (options.type === "workflows") {
        const { data, error } = await supabase
          .from("ai_workflow_runs")
          .select("*, ai_workflows!inner(name)")
          .eq("user_id", options.userId)
          .order("created_at", { ascending: false })
          .limit(limit)

        if (error) throw error

        return (
          data?.map((item: any) => ({
            id: item.id,
            type: "workflows" as DataStreamType,
            data: {
              ...item,
              workflow_name: item.ai_workflows.name,
            },
            timestamp: item.created_at,
          })) || []
        )
      } else if (options.type === "iot_sensors") {
        const { data, error } = await supabase
          .from("iot_sensor_readings")
          .select("*")
          .eq("user_id", options.userId)
          .order("timestamp", { ascending: false })
          .limit(limit)

        if (error) throw error

        return (
          data?.map((item: any) => ({
            id: item.id,
            type: "iot_sensors" as DataStreamType,
            data: item,
            timestamp: item.timestamp,
          })) || []
        )
      }

      return []
    } catch (error) {
      console.error("[v0] [DataStream] Polling error:", error)
      throw error
    }
  }
}

export const dataStreamManager = new DataStreamManager()
