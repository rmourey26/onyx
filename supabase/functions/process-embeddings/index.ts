/**
 * Resend-It Supabase Edge Function: Process Embeddings
 * Background processing for embedding generation
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Deno } from "https://deno.land/std@0.168.0/node/global.ts"

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

    const { jobId } = await req.json()

    if (!jobId) {
      throw new Error("Missing jobId")
    }

    // Get job details
    const { data: job, error: jobError } = await supabase.from("embedding_jobs").select("*").eq("id", jobId).single()

    if (jobError || !job) {
      throw new Error("Job not found")
    }

    // Update status
    await supabase.from("embedding_jobs").update({ status: "processing" }).eq("id", jobId)

    console.log(`[process-embeddings] Processing job ${jobId}`)

    // Call the app's embedding endpoint
    const appUrl = Deno.env.get("NEXT_PUBLIC_APP_URL") || "https://app.resend-it.com"

    const response = await fetch(`${appUrl}/api/internal/embeddings/process`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Service-Key": supabaseKey,
      },
      body: JSON.stringify({
        jobId,
        parameters: job.parameters,
        userId: job.user_id,
      }),
    })

    if (!response.ok) {
      throw new Error(`Processing failed: ${response.statusText}`)
    }

    const result = await response.json()

    await supabase
      .from("embedding_jobs")
      .update({
        status: "completed",
        result,
      })
      .eq("id", jobId)

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("[process-embeddings] Error:", error)

    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    })
  }
})
