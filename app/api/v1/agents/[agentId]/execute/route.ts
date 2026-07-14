import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { AgentSystem } from "@/lib/ai/agent-system"
import { deliverWebhook } from "@/lib/webhooks/webhook-delivery"
import { formatAssetContext } from "@/lib/utils/asset-context-formatter"

async function validateAPIKeyForExecution(apiKey: string) {
  const supabase = await createServerSupabaseClient()

  const { data: validationResult, error: validationError } = await supabase.rpc("validate_api_key", {
    api_key: apiKey,
  })

  if (validationError || !validationResult || validationResult.length === 0) {
    return { valid: false, error: "Invalid API key", status: 401 }
  }

  const result = validationResult[0]

  if (!result.valid) {
    return { valid: false, error: "Invalid or expired API key", status: 401 }
  }

  // Check if key has execute:agents scope
  const scopes = result.scopes || []
  if (!scopes.includes("execute:agents") && !scopes.includes("execute:*")) {
    return {
      valid: false,
      error: "API key does not have permission to execute agents. Required scope: execute:agents",
      status: 403,
    }
  }

  return { valid: true, userId: result.user_id, apiKeyId: result.api_key_id }
}

export async function POST(request: NextRequest, { params }: { params: { agentId: string } }) {
  const startTime = Date.now()

  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          error: "Missing or invalid Authorization header",
          message: "Please provide a valid API key in the format: Authorization: Bearer <your-api-key>",
        },
        { status: 401 },
      )
    }

    const apiKey = authHeader.substring(7)
    const validation = await validateAPIKeyForExecution(apiKey)

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: validation.status })
    }

    const userId = validation.userId!
    const apiKeyId = validation.apiKeyId!
    const supabase = await createServerSupabaseClient()

    const body = await request.json()
    const { prompt, assetIds = [], dataStreamIds = [], webhookUrl, metadata = {} } = body

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        {
          error: "Missing or invalid required field: prompt",
          message: "The 'prompt' field must be a non-empty string",
        },
        { status: 400 },
      )
    }

    if (assetIds && !Array.isArray(assetIds)) {
      return NextResponse.json(
        {
          error: "Invalid field: assetIds",
          message: "The 'assetIds' field must be an array",
        },
        { status: 400 },
      )
    }

    const { data: agent, error: agentError } = await supabase
      .from("ai_agents")
      .select("*")
      .eq("id", params.agentId)
      .eq("user_id", userId)
      .maybeSingle()

    if (agentError) {
      console.error("Error fetching agent:", agentError)
      return NextResponse.json(
        {
          error: "Failed to fetch agent",
          message: "An error occurred while retrieving the agent",
        },
        { status: 500 },
      )
    }

    if (!agent) {
      return NextResponse.json(
        {
          error: "Agent not found or access denied",
          message: `No agent found with ID ${params.agentId} for your account`,
        },
        { status: 404 },
      )
    }

    if (!agent.is_active) {
      return NextResponse.json(
        {
          error: "Agent is not active",
          message: "This agent has been deactivated and cannot be executed",
        },
        { status: 403 },
      )
    }

    let assetContext = ""
    if (assetIds && assetIds.length > 0) {
      try {
        assetContext = await formatAssetContext(assetIds, userId)
      } catch (error) {
        console.error("Error formatting asset context:", error)
        return NextResponse.json(
          {
            error: "Failed to fetch asset context",
            message: "One or more asset IDs are invalid or inaccessible",
          },
          { status: 400 },
        )
      }
    }

    const agentSystem = new AgentSystem(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const fullPrompt = assetContext ? `${assetContext}\n\n${prompt}` : prompt

    let result
    try {
      result = await agentSystem.executeAgent(params.agentId, fullPrompt)
    } catch (error) {
      console.error("Agent execution error:", error)

      await supabase.from("ai_analysis_results").insert({
        user_id: userId,
        agent_id: params.agentId,
        prompt: prompt,
        result: `Execution failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        metadata: {
          assetIds,
          dataStreamIds,
          executedViaApi: true,
          apiKeyId,
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error",
          ...metadata,
        },
      })

      return NextResponse.json(
        {
          error: "Agent execution failed",
          message: error instanceof Error ? error.message : "An unknown error occurred during execution",
        },
        { status: 500 },
      )
    }

    const executionTime = Date.now() - startTime

    const { data: executionRecord } = await supabase
      .from("ai_analysis_results")
      .insert({
        user_id: userId,
        agent_id: params.agentId,
        prompt: prompt,
        result: result.finalResponse,
        metadata: {
          assetIds,
          dataStreamIds,
          executedViaApi: true,
          apiKeyId,
          status: "completed",
          executionTimeMs: executionTime,
          iterations: result.iterations,
          toolCalls: result.toolCalls?.length || 0,
          tokens: result.tokens,
          ...metadata,
        },
      })
      .select()
      .single()

    await supabase
      .from("ai_agents")
      .update({
        last_executed_at: new Date().toISOString(),
        execution_count: (agent.execution_count || 0) + 1,
      })
      .eq("id", params.agentId)

    const webhookDeliveryPromises = []

    if (webhookUrl) {
      webhookDeliveryPromises.push(
        deliverWebhook({
          url: webhookUrl,
          event: "agent.execution.completed",
          payload: {
            agentId: params.agentId,
            agentName: agent.name,
            executionId: executionRecord?.id,
            result: result.finalResponse,
            executionTime: executionTime,
            timestamp: new Date().toISOString(),
          },
          userId,
        }),
      )
    }

    // Trigger registered webhooks
    const { data: webhooks } = await supabase
      .from("webhooks")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .contains("events", ["agent.execution.completed"])

    if (webhooks && webhooks.length > 0) {
      for (const webhook of webhooks) {
        webhookDeliveryPromises.push(
          deliverWebhook({
            url: webhook.url,
            event: "agent.execution.completed",
            payload: {
              agentId: params.agentId,
              agentName: agent.name,
              executionId: executionRecord?.id,
              result: result.finalResponse,
              executionTime: executionTime,
              timestamp: new Date().toISOString(),
            },
            userId,
            webhookId: webhook.id,
            secret: webhook.secret,
          }),
        )
      }
    }

    // Don't wait for webhooks to complete
    Promise.allSettled(webhookDeliveryPromises).catch(console.error)

    return NextResponse.json({
      success: true,
      executionId: executionRecord?.id,
      agentId: params.agentId,
      agentName: agent.name,
      result: result.finalResponse,
      executionTime: executionTime,
      iterations: result.iterations,
      toolCalls: result.toolCalls?.length || 0,
      tokens: result.tokens,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error executing agent via API:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "An unexpected error occurred",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
