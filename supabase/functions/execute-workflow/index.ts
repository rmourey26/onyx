// =====================================================
// Execute Workflow Edge Function
// Wraps WorkflowSystem for serverless execution
// =====================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Deno } from "https://deno.land/std@0.168.0/node/global.ts"

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
    const { workflowId, input = {} } = await req.json()

    if (!workflowId) {
      throw new Error("Missing required field: workflowId")
    }

    console.log(`[execute-workflow] Starting execution for workflow ${workflowId}`)

    let workflow: any // Changed from const to let
    const { data: workflowData, error: workflowError } = await supabase
      .from("ai_workflows")
      .select("*")
      .eq("id", workflowId)
      .eq("user_id", user.id)
      .single()

    if (workflowError || !workflowData) {
      // Try asset_workflows table
      const { data: assetWorkflowData, error: assetWorkflowError } = await supabase
        .from("asset_workflows")
        .select("*")
        .eq("id", workflowId)
        .eq("user_id", user.id)
        .single()

      if (assetWorkflowError || !assetWorkflowData) {
        throw new Error("Workflow not found or access denied")
      }

      // Use asset workflow
      workflow = assetWorkflowData
    } else {
      workflow = workflowData
    }

    // Log execution start
    const { data: logId } = await supabase.rpc("log_workflow_execution", {
      p_workflow_id: workflowId,
      p_user_id: user.id,
      p_status: "running",
      p_input: input,
    })

    const startTime = Date.now()

    try {
      // Call the app's execute workflow endpoint
      const appUrl = Deno.env.get("NEXT_PUBLIC_APP_URL") || "https://app.kronova.io"
      const executeResponse = await fetch(`${appUrl}/api/v1/workflows/${workflowId}/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify({
          input,
          ai_model: workflow.ai_model || "gemini-3-pro-20251115",
        }),
      })

      if (!executeResponse.ok) {
        throw new Error(`Workflow execution failed: ${executeResponse.statusText}`)
      }

      const result = await executeResponse.json()
      const executionTime = Date.now() - startTime

      console.log(`[execute-workflow] Execution completed in ${executionTime}ms`)

      await supabase.rpc("increment_workflow_execution", {
        p_workflow_id: workflowId,
      })

      // Log successful execution
      await supabase.rpc("log_workflow_execution", {
        p_workflow_id: workflowId,
        p_user_id: user.id,
        p_status: "completed",
        p_input: input,
        p_output: result,
        p_execution_time: executionTime,
      })

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      })
    } catch (executionError) {
      const executionTime = Date.now() - startTime

      console.error(`[execute-workflow] Execution failed:`, executionError)

      // Log failed execution
      await supabase.rpc("log_workflow_execution", {
        p_workflow_id: workflowId,
        p_user_id: user.id,
        p_status: "failed",
        p_input: input,
        p_error: executionError.message,
        p_execution_time: executionTime,
      })

      throw executionError
    }
  } catch (error) {
    console.error("[execute-workflow] Error:", error)

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
