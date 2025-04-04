import { type NextRequest, NextResponse } from "next/server"
import { getAuthUrl } from "@/lib/google-auth"

export async function GET(request: NextRequest) {
  const authUrl = await getAuthUrl()
  return NextResponse.redirect(authUrl)
}
