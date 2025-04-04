import { type NextRequest, NextResponse } from "next/server"
import { getTokens } from "@/lib/google-auth"
import { cookies } from "next/headers"
import { encrypt } from "@/lib/encryption"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")

  if (!code) {
    return NextResponse.redirect(new URL("/error?message=No_authorization_code", request.url))
  }

  try {
    // Exchange the code for tokens
    const tokens = await getTokens(code)

    // Encrypt tokens before storing in cookie
    const encryptedTokens = await encrypt(JSON.stringify(tokens))

    // Store tokens in a secure cookie
    cookies().set("google_tokens", encryptedTokens, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
      sameSite: "lax",
    })

    // Redirect to the scheduling page
    return NextResponse.redirect(new URL("/schedule", request.url))
  } catch (error) {
    console.error("Error getting tokens:", error)
    return NextResponse.redirect(new URL("/error?message=Authentication_failed", request.url))
  }
}

