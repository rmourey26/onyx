import { handleShopifyCallback } from "@/app/actions/integration-actions"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const shop = searchParams.get("shop")

  if (!code || !shop) {
    return NextResponse.redirect(new URL("/ai-suite/integrations?error=invalid_callback", request.url))
  }

  const result = await handleShopifyCallback(code, shop)

  if (result.success) {
    return NextResponse.redirect(new URL("/ai-suite/integrations?success=shopify_connected", request.url))
  } else {
    return NextResponse.redirect(new URL(`/ai-suite/integrations?error=${result.error}`, request.url))
  }
}
