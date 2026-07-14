import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { decision, authorization_id } = body

    if (!authorization_id) {
      return NextResponse.json({ error: "Missing authorization_id" }, { status: 400 })
    }

    if (decision !== "approve" && decision !== "deny") {
      return NextResponse.json({ error: "Invalid decision" }, { status: 400 })
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: async () => (await cookies()).getAll(),
          setAll: async (cookiesToSet) => {
            const cookieStore = await cookies()
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          },
        },
      },
    )

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Use Supabase's native OAuth methods
    if (decision === "approve") {
      const { data, error } = await supabase.auth.oauth.approveAuthorization(authorization_id)

      if (error) {
        console.error("[v0] Error approving authorization:", error)
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      // Return the redirect URL to send user back to client app
      return NextResponse.json({ success: true, redirect_to: data.redirect_to })
    } else {
      const { data, error } = await supabase.auth.oauth.denyAuthorization(authorization_id)

      if (error) {
        console.error("[v0] Error denying authorization:", error)
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      // Return the redirect URL with error parameter
      return NextResponse.json({ success: true, redirect_to: data.redirect_to })
    }
  } catch (error: any) {
    console.error("[v0] Exception in OAuth decision:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
