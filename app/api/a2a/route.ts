/**
 * Kronova A2A Protocol API Endpoint
 * Implements the Agent2Agent (A2A) Protocol for agent interoperability
 * 
 * This endpoint handles:
 * - Agent Card discovery (GET /.well-known/agent.json)
 * - Message sending (POST /a2a/message/send)
 * - Task management (GET/POST /a2a/tasks/*)
 * 
 * Reference: https://a2a-protocol.org/latest/specification/
 */

import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { 
  createKronovaA2AClient,
  type SendMessageRequest,
  type GetTaskRequest,
  type ListTasksRequest,
  type CancelTaskRequest,
  A2AError,
  TaskNotFoundError,
} from "@/lib/a2a/kronova-a2a-client"

const PROTOCOL_VERSION = "1.0"
const SUPPORTED_VERSIONS = ["0.3", "1.0"]

/**
 * Handle GET requests - Agent Card discovery
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const agentId = searchParams.get("agentId")
    const action = searchParams.get("action")

    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Check A2A-Version header
    const requestedVersion = request.headers.get("A2A-Version")
    if (requestedVersion && !SUPPORTED_VERSIONS.includes(requestedVersion)) {
      return NextResponse.json(
        { 
          error: "VersionNotSupportedError", 
          message: `Version ${requestedVersion} not supported. Supported: ${SUPPORTED_VERSIONS.join(", ")}` 
        },
        { status: 400 }
      )
    }

    // Agent Card discovery (public endpoint)
    if (action === "discover" || !user) {
      const { data: publicCards, error } = await supabase
        .from("a2a_agent_cards")
        .select("*")
        .eq("is_public", true)
        .eq("is_active", true)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      const cards = (publicCards || []).map(card => ({
        agentId: card.agent_id,
        name: card.name,
        description: card.description,
        url: card.url,
        protocolVersions: card.protocol_versions,
        capabilities: card.capabilities,
        skills: card.skills,
        defaultInputModes: card.default_input_modes,
        defaultOutputModes: card.default_output_modes,
        provider: card.provider,
        documentationUrl: card.documentation_url,
      }))

      return NextResponse.json({ 
        agents: cards,
        protocolVersion: PROTOCOL_VERSION,
      })
    }

    // Authenticated endpoints
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = createKronovaA2AClient({
      supabase,
      userId: user.id,
    })

    // Get specific agent card
    if (agentId) {
      const card = await client.getAgentCard(agentId)
      if (!card) {
        return NextResponse.json({ error: "Agent not found" }, { status: 404 })
      }
      return NextResponse.json(card)
    }

    // List user's agent cards
    if (action === "list-cards") {
      const { data: cards, error } = await supabase
        .from("a2a_agent_cards")
        .select("*")
        .eq("user_id", user.id)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ cards })
    }

    // Get task by ID
    const taskId = searchParams.get("taskId")
    if (taskId) {
      const historyLength = searchParams.get("historyLength")
      const task = await client.getTask({
        taskId,
        historyLength: historyLength ? parseInt(historyLength, 10) : undefined,
      })
      return NextResponse.json(task)
    }

    // List tasks
    if (action === "list-tasks") {
      const listRequest: ListTasksRequest = {
        contextId: searchParams.get("contextId") || undefined,
        status: searchParams.get("status") as any || undefined,
        pageSize: searchParams.get("pageSize") ? parseInt(searchParams.get("pageSize")!, 10) : undefined,
        pageToken: searchParams.get("pageToken") || undefined,
        historyLength: searchParams.get("historyLength") ? parseInt(searchParams.get("historyLength")!, 10) : undefined,
        includeArtifacts: searchParams.get("includeArtifacts") === "true",
      }

      const response = await client.listTasks(listRequest)
      return NextResponse.json(response)
    }

    return NextResponse.json({ 
      error: "Invalid request. Use ?action=discover, ?action=list-cards, ?action=list-tasks, ?agentId=..., or ?taskId=..." 
    }, { status: 400 })

  } catch (error) {
    console.error("[A2A API] GET error:", error)
    if (error instanceof TaskNotFoundError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: 404 })
    }
    if (error instanceof A2AError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * Handle POST requests - Message sending and task management
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check A2A-Version header
    const requestedVersion = request.headers.get("A2A-Version")
    if (requestedVersion && !SUPPORTED_VERSIONS.includes(requestedVersion)) {
      return NextResponse.json(
        { 
          error: "VersionNotSupportedError", 
          message: `Version ${requestedVersion} not supported. Supported: ${SUPPORTED_VERSIONS.join(", ")}` 
        },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { action, ...params } = body

    const client = createKronovaA2AClient({
      supabase,
      userId: user.id,
    })

    switch (action) {
      case "message/send": {
        const sendRequest: SendMessageRequest = {
          message: params.message,
          configuration: params.configuration,
          metadata: params.metadata,
        }
        const result = await client.sendMessage(sendRequest)
        return NextResponse.json(result)
      }

      case "tasks/get": {
        const getRequest: GetTaskRequest = {
          taskId: params.taskId,
          historyLength: params.historyLength,
        }
        const task = await client.getTask(getRequest)
        return NextResponse.json(task)
      }

      case "tasks/list": {
        const listRequest: ListTasksRequest = params
        const response = await client.listTasks(listRequest)
        return NextResponse.json(response)
      }

      case "tasks/cancel": {
        const cancelRequest: CancelTaskRequest = {
          taskId: params.taskId,
        }
        const task = await client.cancelTask(cancelRequest)
        return NextResponse.json(task)
      }

      case "tasks/updateStatus": {
        const task = await client.updateTaskStatus(params.taskId, params.status)
        return NextResponse.json(task)
      }

      case "tasks/addArtifact": {
        const artifact = await client.addArtifact(params.taskId, params.artifact)
        return NextResponse.json(artifact)
      }

      case "agentCard/create": {
        const card = await client.createAgentCard(params.card)
        return NextResponse.json(card)
      }

      case "aethernet/send": {
        const result = await client.sendViaAetherNet(params.targetAddress, params.request)
        return NextResponse.json(result)
      }

      default:
        return NextResponse.json({ 
          error: `Unknown action: ${action}. Valid actions: message/send, tasks/get, tasks/list, tasks/cancel, tasks/updateStatus, tasks/addArtifact, agentCard/create, aethernet/send` 
        }, { status: 400 })
    }

  } catch (error) {
    console.error("[A2A API] POST error:", error)
    if (error instanceof TaskNotFoundError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: 404 })
    }
    if (error instanceof A2AError) {
      return NextResponse.json({ error: error.message, code: error.code, details: error.details }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * Handle OPTIONS for CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, A2A-Version, A2A-Extensions",
    },
  })
}
