/**
 * Resend-It Supabase Edge Function: Tokenize Asset
 * Blockchain tokenization processing
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Deno } from "https://deno.land/std@0.168.0/node/global.ts" // Declare Deno variable

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      throw new Error("Missing authorization header")
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error("Unauthorized")
    }

    const { assetId, walletAddress, enableFractionalization, totalFractions, pricePerFraction } = await req.json()

    if (!assetId || !walletAddress) {
      throw new Error("Missing required fields: assetId, walletAddress")
    }

    console.log(`[tokenize-asset] Tokenizing asset ${assetId} for user ${user.id}`)

    // Call the app's tokenization endpoint
    const appUrl = Deno.env.get("NEXT_PUBLIC_APP_URL") || "https://app.resend-it.com"

    const response = await fetch(`${appUrl}/api/v1/tokenization`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        assetId,
        walletAddress,
        enableFractionalization,
        totalFractions,
        pricePerFraction,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || "Tokenization failed")
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("[tokenize-asset] Error:", error)

    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    })
  }
})
