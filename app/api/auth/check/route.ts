import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  const googleTokens = cookies().get("google_tokens")

  return NextResponse.json({
    authenticated: !!googleTokens,
  })
}