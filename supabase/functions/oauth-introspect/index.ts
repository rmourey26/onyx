/**
 * Resend-It Supabase Edge Function: OAuth Token Introspection
 * RFC 7662 compliant token introspection
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Deno } from "https://deno.land/std@0.168.0/runtime.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const formData = await req.formData()
    const token = formData.get("token") as string
    const tokenTypeHint = formData.get("token_type_hint") as string

    if (!token) {
      return new Response(JSON.stringify({ active: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Check access tokens first (or if hinted)
    if (!tokenTypeHint || tokenTypeHint === "access_token") {
      const { data: accessToken } = await supabase
        .from("oauth_access_tokens")
        .select("*, oauth_clients(name)")
        .eq("token", token)
        .single()

      if (accessToken) {
        const isActive = new Date(accessToken.expires_at) > new Date()

        return new Response(
          JSON.stringify({
            active: isActive,
            scope: accessToken.scope,
            client_id: accessToken.client_id,
            username: accessToken.user_id,
            token_type: "Bearer",
            exp: Math.floor(new Date(accessToken.expires_at).getTime() / 1000),
            iat: Math.floor(new Date(accessToken.created_at).getTime() / 1000),
            sub: accessToken.user_id,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        )
      }
    }

    // Check refresh tokens
    if (!tokenTypeHint || tokenTypeHint === "refresh_token") {
      const { data: refreshToken } = await supabase.from("oauth_refresh_tokens").select("*").eq("token", token).single()

      if (refreshToken) {
        const isActive = new Date(refreshToken.expires_at) > new Date()

        return new Response(
          JSON.stringify({
            active: isActive,
            scope: refreshToken.scope,
            client_id: refreshToken.client_id,
            token_type: "refresh_token",
            exp: Math.floor(new Date(refreshToken.expires_at).getTime() / 1000),
            sub: refreshToken.user_id,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        )
      }
    }

    return new Response(JSON.stringify({ active: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("[oauth-introspect] Error:", error)

    return new Response(JSON.stringify({ active: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
