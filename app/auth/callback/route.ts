import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const redirect = requestUrl.searchParams.get("redirect") || requestUrl.searchParams.get("next") || "/ai-suite"
  const next = redirect; // Declare the next variable

  if (code) {
    const supabase = await createServerSupabaseClient()
    
    const { data: { user }, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (!exchangeError && user) {
      // Check if profile exists, create if not
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single()

      if (profileError && profileError.code === "PGRST116") {
        // Profile doesn't exist, create it
        await supabase.from("profiles").insert({
          id: user.id,
          user_id: user.id,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || "",
          email: user.email || "",
          company: user.user_metadata?.company || "",
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || "",
          username: (user.user_metadata?.preferred_username || user.email?.split("@")[0] || "user")
            .toLowerCase()
            .replace(/\s+/g, "_"),
          updated_at: new Date().toISOString(),
        })
      }

      return NextResponse.redirect(new URL(next, requestUrl.origin))
    }
  }

  // Return to login page if exchange failed
  return NextResponse.redirect(new URL("/login?error=auth_failed", requestUrl.origin))
}
