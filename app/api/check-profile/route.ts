import { createServerSupabaseClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const public_id = searchParams.get("public_id")

  if (!public_id) {
    return NextResponse.json({ exists: false, error: "No public_id provided" }, { status: 400 })
  }

  try {
    const supabase = await createServerSupabaseClient()

    // Check if profile exists with this public_id
    const { data, error } = await supabase.from("profiles").select("id").eq("public_id", public_id).maybeSingle()

    if (error) {
      console.error("Error checking profile existence:", error)
      return NextResponse.json({ exists: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ exists: !!data, profile_id: data?.id })
  } catch (error) {
    console.error("Unexpected error in check-profile API:", error)
    return NextResponse.json({ exists: false, error: "An unexpected error occurred" }, { status: 500 })
  }
}
