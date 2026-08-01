import { createServerSupabaseClient } from "@/lib/supabase/server"
import { createResendItVoiceClient, type TranscriptionResult } from "@/lib/voice/elevenlabs-client"
import { AgentSystem } from "@/lib/ai/agent-system"
import { formatAssetContext } from "@/lib/utils/asset-context-formatter"

export interface VoiceProcessingContext {
  userId: string
  sessionId: string
  agentId?: string
  assetIds?: string[]
  conversationHistory: Array<{
    role: "user" | "assistant"
    content: string
    timestamp: string
    audioMetadata?: {
      duration: number
      confidence: number
      language: string
    }
  }>
  contextType: "standard" | "aethernet"
  aethernetMetadata?: {
    connectionId: string
    peerId: string
    networkType: string
  }
}

export interface VoiceCommandResult {
  success: boolean
  transcription: TranscriptionResult
  nlpIntent: {
    action: string
    entities: Record<string, any>
    confidence: number
  }
  executionResult?: any
  responseText: string
  error?: string
}

export async function processVoiceCommand(
  audioDataOrUrl: ArrayBuffer | string,
  context: VoiceProcessingContext,
): Promise<VoiceCommandResult> {
  try {
    const supabase = await createServerSupabaseClient()
    const voiceClient = await createResendItVoiceClient()

    // Step 1: Transcribe audio to text
    const transcription = await voiceClient.transcribeAudio(audioDataOrUrl, "en")

    console.log("[v0] Voice transcription:", transcription.text)

    // Step 2: Extract intent using NLP
    const intent = await extractIntentFromText(transcription.text, context)

    console.log("[v0] Extracted intent:", intent)

    // Step 3: Log voice execution
    const { data: voiceLog } = await supabase
      .from("voice_execution_logs")
      .insert({
        user_id: context.userId,
        session_id: context.sessionId,
        agent_id: context.agentId,
        transcription: transcription.text,
        confidence: transcription.confidence,
        language: transcription.language,
        audio_duration: transcription.duration,
        intent_action: intent.action,
        intent_confidence: intent.confidence,
        context_type: context.contextType,
        aethernet_metadata: context.aethernetMetadata,
      })
      .select()
      .single()

    // Step 4: Execute the command based on intent
    let executionResult
    let responseText = ""

    switch (intent.action) {
      case "execute_agent":
        executionResult = await executeAgentViaVoice(intent.entities, context)
        responseText = executionResult.response
        break

      case "query_assets":
        executionResult = await queryAssetsViaVoice(intent.entities, context)
        responseText = executionResult.response
        break

      case "create_agent":
        executionResult = await createAgentViaVoice(intent.entities, context)
        responseText = executionResult.response
        break

      case "tokenize_asset":
        executionResult = await tokenizeAssetViaVoice(intent.entities, context)
        responseText = executionResult.response
        break

      case "get_dashboard_metrics":
        executionResult = await getDashboardMetricsViaVoice(intent.entities, context)
        responseText = executionResult.response
        break

      default:
        responseText = `I understood "${transcription.text}", but I'm not sure how to help with that. Could you rephrase your request?`
    }

    // Step 5: Update voice log with results
    await supabase
      .from("voice_execution_logs")
      .update({
        execution_result: executionResult,
        response_text: responseText,
        status: "completed",
      })
      .eq("id", voiceLog.id)

    return {
      success: true,
      transcription,
      nlpIntent: intent,
      executionResult,
      responseText,
    }
  } catch (error) {
    console.error("[v0] Voice command processing error:", error)
    return {
      success: false,
      transcription: { text: "", confidence: 0, language: "en", duration: 0 },
      nlpIntent: { action: "unknown", entities: {}, confidence: 0 },
      responseText: "I encountered an error processing your voice command. Please try again.",
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

async function extractIntentFromText(
  text: string,
  context: VoiceProcessingContext,
): Promise<{ action: string; entities: Record<string, any>; confidence: number }> {
  const agentSystem = new AgentSystem()

  const intentPrompt = `
You are an NLP intent classifier for the Kronova Asset Intelligence Platform.
Analyze the following user voice command and extract:
1. The primary action/intent
2. All relevant entities (asset names, agent names, numbers, etc.)
3. Confidence score (0-1)

Available actions:
- execute_agent: Run an AI agent
- query_assets: Search or get information about assets
- create_agent: Create a new AI agent
- tokenize_asset: Tokenize an asset on blockchain
- get_dashboard_metrics: Get dashboard statistics
- manage_workflow: Create or execute workflows
- update_asset: Update asset information
- generate_report: Generate analytics reports

User command: "${text}"

Conversation history:
${context.conversationHistory
  .slice(-3)
  .map((msg) => `${msg.role}: ${msg.content}`)
  .join("\n")}

Return ONLY a JSON object with this structure:
{
  "action": "action_name",
  "entities": { "key": "value" },
  "confidence": 0.95
}
`

  try {
    // Use a fast model for intent classification
    const result = await agentSystem.executeAgent("intent-classifier", intentPrompt, {
      maxIterations: 1,
      timeoutMs: 5000,
    })

    const parsed = JSON.parse(result.finalResponse)
    return {
      action: parsed.action || "unknown",
      entities: parsed.entities || {},
      confidence: parsed.confidence || 0.5,
    }
  } catch (error) {
    console.error("[v0] Intent extraction error:", error)
    return {
      action: "unknown",
      entities: {},
      confidence: 0.1,
    }
  }
}

async function executeAgentViaVoice(
  entities: Record<string, any>,
  context: VoiceProcessingContext,
): Promise<{ response: string; data?: any }> {
  try {
    const agentName = entities.agent_name || entities.agent
    const prompt = entities.prompt || entities.query || entities.question

    if (!agentName || !prompt) {
      return {
        response: "I need both an agent name and a question to execute. Could you provide both?",
      }
    }

    const supabase = await createServerSupabaseClient()

    // Find agent by name
    const { data: agent } = await supabase
      .from("ai_agents")
      .select("*")
      .eq("user_id", context.userId)
      .ilike("name", `%${agentName}%`)
      .maybeSingle()

    if (!agent) {
      return {
        response: `I couldn't find an agent named "${agentName}". Would you like me to list your available agents?`,
      }
    }

    // Build context if asset IDs provided
    let fullPrompt = prompt
    if (context.assetIds && context.assetIds.length > 0) {
      const assetContext = await formatAssetContext(context.assetIds, context.userId)
      fullPrompt = `${assetContext}\n\n${prompt}`
    }

    // Execute agent
    const agentSystem = new AgentSystem()
    const result = await agentSystem.executeAgent(agent.id, fullPrompt)

    return {
      response: `Here's what ${agent.name} found: ${result.finalResponse}`,
      data: result,
    }
  } catch (error) {
    console.error("[v0] Execute agent via voice error:", error)
    return {
      response: "I encountered an error executing that agent. Please try again.",
    }
  }
}

async function queryAssetsViaVoice(
  entities: Record<string, any>,
  context: VoiceProcessingContext,
): Promise<{ response: string; data?: any }> {
  try {
    const supabase = await createServerSupabaseClient()
    const searchTerm = entities.asset_name || entities.search || entities.query

    if (!searchTerm) {
      // Get asset count
      const { count } = await supabase
        .from("assets")
        .select("*", { count: "exact", head: true })
        .eq("user_id", context.userId)

      return {
        response: `You have ${count || 0} assets in your inventory. Would you like me to search for specific assets?`,
      }
    }

    // Search for assets
    const { data: assets } = await supabase
      .from("assets")
      .select("id, name, asset_type, status, current_value")
      .eq("user_id", context.userId)
      .or(`name.ilike.%${searchTerm}%,asset_type.ilike.%${searchTerm}%`)
      .limit(5)

    if (!assets || assets.length === 0) {
      return {
        response: `I couldn't find any assets matching "${searchTerm}". Try a different search term.`,
      }
    }

    const assetList = assets.map((a) => `${a.name} (${a.asset_type}) - Status: ${a.status}`).join(", ")

    return {
      response: `I found ${assets.length} asset(s): ${assetList}. Would you like more details about any of these?`,
      data: assets,
    }
  } catch (error) {
    console.error("[v0] Query assets via voice error:", error)
    return {
      response: "I encountered an error searching for assets. Please try again.",
    }
  }
}

async function createAgentViaVoice(
  entities: Record<string, any>,
  context: VoiceProcessingContext,
): Promise<{ response: string; data?: any }> {
  return {
    response:
      "Creating agents via voice is currently in development. Please use the web interface to create new agents.",
  }
}

async function tokenizeAssetViaVoice(
  entities: Record<string, any>,
  context: VoiceProcessingContext,
): Promise<{ response: string; data?: any }> {
  return {
    response:
      "Asset tokenization via voice is currently in development. Please use the tokenization dashboard for now.",
  }
}

async function getDashboardMetricsViaVoice(
  entities: Record<string, any>,
  context: VoiceProcessingContext,
): Promise<{ response: string; data?: any }> {
  try {
    const supabase = await createServerSupabaseClient()

    // Get quick metrics
    const [assetsCount, agentsCount, workflowsCount] = await Promise.all([
      supabase.from("assets").select("*", { count: "exact", head: true }).eq("user_id", context.userId),
      supabase.from("ai_agents").select("*", { count: "exact", head: true }).eq("user_id", context.userId),
      supabase.from("ai_workflows").select("*", { count: "exact", head: true }).eq("user_id", context.userId),
    ])

    return {
      response: `You have ${assetsCount.count || 0} assets, ${agentsCount.count || 0} AI agents, and ${workflowsCount.count || 0} workflows in your dashboard.`,
      data: {
        assets: assetsCount.count,
        agents: agentsCount.count,
        workflows: workflowsCount.count,
      },
    }
  } catch (error) {
    console.error("[v0] Get dashboard metrics error:", error)
    return {
      response: "I couldn't retrieve your dashboard metrics right now. Please try again.",
    }
  }
}
