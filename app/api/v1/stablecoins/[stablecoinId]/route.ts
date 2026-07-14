import { type NextRequest, NextResponse } from "next/server"
import { validateAPIRequest } from "@/lib/auth/api-auth"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { createStablecoinManager } from "@/lib/blockchain/private-stablecoin"

// GET /api/v1/stablecoins/[stablecoinId] - Get stablecoin details
export async function GET(request: NextRequest, { params }: { params: Promise<{ stablecoinId: string }> }) {
  try {
    const { stablecoinId } = await params
    const auth = await validateAPIRequest(request, ["stablecoins:read"])
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const supabase = await createServerSupabaseClient()
    const manager = createStablecoinManager(supabase)

    const stablecoin = await manager.getStablecoin(stablecoinId)

    if (!stablecoin) {
      return NextResponse.json({ success: false, error: "Stablecoin not found" }, { status: 404 })
    }

    // Verify ownership
    if (stablecoin.user_id !== auth.userId) {
      return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 })
    }

    const holders = await manager.getHolders(stablecoinId)
    const operations = await manager.getOperationHistory(stablecoinId, 20)

    return NextResponse.json({
      success: true,
      data: {
        ...stablecoin,
        holders,
        recentOperations: operations,
      },
    })
  } catch (error) {
    console.error("[API] Get stablecoin error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch stablecoin" }, { status: 500 })
  }
}
