import { type NextRequest, NextResponse } from "next/server"
import { validateDualAuth } from "@/lib/auth/dual-auth"
import { dataStreamManager, type DataStreamType } from "@/lib/data-streams/stream-manager"

export const runtime = "nodejs"

// GET /api/v1/data-streams - Main endpoint with SSE or polling based on tier
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const validation = await validateDualAuth(request)
    if (!validation.authenticated || !validation.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = validation.userId
    const searchParams = request.nextUrl.searchParams
    const type = (searchParams.get("type") || "agents") as DataStreamType
    const format = searchParams.get("format") // optional: 'sse' or 'polling'

    console.log("[v0] [DataStream API] Request received", { userId, type, format })

    // Get subscription limits
    const limits = await dataStreamManager.getSubscriptionLimits(userId)
    const streamFormat = format || limits.format

    console.log("[v0] [DataStream API] User limits", {
      userId,
      tier: limits,
      requestedFormat: format,
      actualFormat: streamFormat,
    })

    if (streamFormat === "sse") {
      // Server-Sent Events stream
      const stream = dataStreamManager.createSSEStream({
        userId,
        type,
        format: "sse",
      })

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
          "X-Accel-Buffering": "no", // Disable nginx buffering
          "Access-Control-Allow-Origin": "*",
        },
      })
    } else {
      // HTTP Polling - return snapshot
      const data = await dataStreamManager.getPollingData({
        userId,
        type,
        format: "polling",
        limit: 50,
      })

      return NextResponse.json({
        format: "polling",
        pollInterval: limits.pollInterval,
        rateLimit: limits.rateLimit,
        data,
        timestamp: new Date().toISOString(),
      })
    }
  } catch (error) {
    console.error("[v0] [DataStream API] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
