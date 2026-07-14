// =====================================================
// Execute Agent Edge Function
// Wraps AgentSystem for serverless execution
// =====================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Deno } from "https://deno.land/std@0.168.0/runtime.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      throw new Error("Missing authorization header")
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    })

    // Get user from token
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      throw new Error("Unauthorized")
    }

    // Parse request body
    const {
      agentId,
      prompt,
      assetIds = [],
      tables = [],
      endpoints = [],
      includeLearningData = false,
      dataStreamIds = [],
    } = await req.json()

    if (!agentId || !prompt) {
      throw new Error("Missing required fields: agentId and prompt")
    }

    console.log(`[execute-agent] Starting execution for agent ${agentId}`)

    // Log execution start
    const { data: logId } = await supabase.rpc("log_agent_execution", {
      p_agent_id: agentId,
      p_user_id: user.id,
      p_status: "running",
      p_input: prompt,
    })

    const startTime = Date.now()

    try {
      // Call the app's execute agent endpoint
      const appUrl = Deno.env.get("NEXT_PUBLIC_APP_URL") || "https://app.resend-it.com"
      const executeResponse = await fetch(`${appUrl}/api/v1/agents/${agentId}/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify({
          prompt,
          assetIds,
          tables,
          endpoints,
          includeLearningData,
          dataStreamIds,
        }),
      })

      if (!executeResponse.ok) {
        throw new Error(`Agent execution failed: ${executeResponse.statusText}`)
      }

      const result = await executeResponse.json()
      const executionTime = Date.now() - startTime

      console.log(`[execute-agent] Execution completed in ${executionTime}ms`)

      // Log successful execution
      await supabase.rpc("log_agent_execution", {
        p_agent_id: agentId,
        p_user_id: user.id,
        p_status: "completed",
        p_input: prompt,
        p_output: JSON.stringify(result),
        p_execution_time: executionTime,
      })

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      })
    } catch (executionError) {
      const executionTime = Date.now() - startTime

      console.error(`[execute-agent] Execution failed:`, executionError)

      // Log failed execution
      await supabase.rpc("log_agent_execution", {
        p_agent_id: agentId,
        p_user_id: user.id,
        p_status: "failed",
        p_input: prompt,
        p_error: executionError.message,
        p_execution_time: executionTime,
      })

      throw executionError
    }
  } catch (error) {
    console.error("[execute-agent] Error:", error)

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    )
  }
})
