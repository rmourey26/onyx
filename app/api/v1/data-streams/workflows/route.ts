import { type NextRequest, NextResponse } from "next/server"
import { validateDualAuth } from "@/lib/auth/dual-auth"
import { dataStreamManager } from "@/lib/data-streams/stream-manager"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    const validation = await validateDualAuth(request)
    if (!validation.authenticated || !validation.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const limits = await dataStreamManager.getSubscriptionLimits(validation.userId)
    const format = request.nextUrl.searchParams.get("format") || limits.format

    if (format === "sse") {
      const stream = dataStreamManager.createSSEStream({
        userId: validation.userId,
        type: "workflows",
        format: "sse",
      })

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
          "X-Accel-Buffering": "no",
        },
      })
    } else {
      const data = await dataStreamManager.getPollingData({
        userId: validation.userId,
        type: "workflows",
        format: "polling",
      })

      return NextResponse.json({
        format: "polling",
        pollInterval: limits.pollInterval,
        data,
      })
    }
  } catch (error) {
    console.error("[v0] [Workflows Stream] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
