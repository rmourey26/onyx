import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { validateDualAuth } from "@/lib/auth/dual-auth"

// POST /api/v1/voice/sessions - Create new voice session
export async function POST(request: NextRequest) {
  try {
    const validation = await validateDualAuth(request, ["voice:execute"])

    if (!validation.authenticated) {
      return NextResponse.json(
        {
          error: validation.error,
          message:
            validation.authMethod === "session"
              ? "Please log in to create voice sessions"
              : "Provide API key: Authorization: Bearer <your-api-key>",
        },
        { status: validation.status || 401 },
      )
    }

    const body = await request.json()
    const { sessionName, contextType = "standard", aethernetConnectionId } = body

    const supabase = await createServerSupabaseClient()

    const { data: session, error } = await supabase
      .from("voice_sessions")
      .insert({
        user_id: validation.userId,
        session_name: sessionName || `Voice Session ${new Date().toISOString()}`,
        context_type: contextType,
        aethernet_connection_id: aethernetConnectionId,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Create session error:", error)
      return NextResponse.json({ error: "Failed to create session" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      authMethod: validation.authMethod,
      session: {
        id: session.id,
        sessionName: session.session_name,
        contextType: session.context_type,
        createdAt: session.created_at,
      },
    })
  } catch (error) {
    console.error("[v0] Create session error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET /api/v1/voice/sessions - List voice sessions
export async function GET(request: NextRequest) {
  try {
    const validation = await validateDualAuth(request, ["voice:execute"])

    if (!validation.authenticated) {
      return NextResponse.json(
        {
          error: validation.error,
          message:
            validation.authMethod === "session"
              ? "Please log in to view voice sessions"
              : "Provide API key: Authorization: Bearer <your-api-key>",
        },
        { status: validation.status || 401 },
      )
    }

    const searchParams = request.nextUrl.searchParams
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const isActive = searchParams.get("active") === "true"

    const supabase = await createServerSupabaseClient()

    let query = supabase
      .from("voice_sessions")
      .select("*")
      .eq("user_id", validation.userId)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (isActive !== null) {
      query = query.eq("is_active", isActive)
    }

    const { data: sessions, error } = await query

    if (error) {
      return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      authMethod: validation.authMethod,
      sessions,
      count: sessions?.length || 0,
    })
  } catch (error) {
    console.error("[v0] List sessions error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
