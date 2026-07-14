import { createServerSupabaseClient } from "@/lib/supabase/server"
import { AgentSystem } from "@/lib/ai/agent-system"
import { formatAssetContext } from "@/lib/utils/asset-context-formatter"
import type { Intent } from "@/lib/voice/nlp-intent-classifier"

export interface CommandContext {
  userId: string
  sessionId: string
  conversationHistory: Array<{
    role: "user" | "assistant"
    content: string
  }>
  assetIds?: string[]
  currentAgent?: string
  currentWorkflow?: string
}

export interface CommandResult {
  success: boolean
  response: string
  data?: any
  followUpActions?: string[]
  error?: string
}

export class CommandRouter {
  private supabase: any
  private agentSystem: AgentSystem

  constructor() {
    this.agentSystem = new AgentSystem()
  }

  async initialize() {
    this.supabase = await createServerSupabaseClient()
  }

  async routeCommand(intent: Intent, context: CommandContext): Promise<CommandResult> {
    if (!this.supabase) {
      await this.initialize()
    }

    console.log(`[CommandRouter] Routing action: ${intent.action}`)

    // Low confidence check
    if (intent.confidence < 0.4) {
      return {
        success: false,
        response: intent.suggestedResponse || "I'm not sure I understood that. Could you rephrase your request?",
        followUpActions: ["help", "repeat"],
      }
    }

    try {
      switch (intent.action) {
        case "execute_agent":
          return await this.handleExecuteAgent(intent, context)

        case "query_assets":
          return await this.handleQueryAssets(intent, context)

        case "create_agent":
          return await this.handleCreateAgent(intent, context)

        case "update_agent":
          return await this.handleUpdateAgent(intent, context)

        case "delete_agent":
          return await this.handleDeleteAgent(intent, context)

        case "tokenize_asset":
          return await this.handleTokenizeAsset(intent, context)

        case "create_workflow":
          return await this.handleCreateWorkflow(intent, context)

        case "execute_workflow":
          return await this.handleExecuteWorkflow(intent, context)

        case "get_dashboard_metrics":
          return await this.handleGetDashboardMetrics(intent, context)

        case "generate_report":
          return await this.handleGenerateReport(intent, context)

        case "update_asset":
          return await this.handleUpdateAsset(intent, context)

        case "add_asset":
          return await this.handleAddAsset(intent, context)

        case "get_asset_insights":
          return await this.handleGetAssetInsights(intent, context)

        case "manage_integrations":
          return await this.handleManageIntegrations(intent, context)

        case "voice_settings":
          return await this.handleVoiceSettings(intent, context)

        case "help":
          return await this.handleHelp(intent, context)

        default:
          return {
            success: false,
            response: `I understand you want to ${intent.action}, but I'm not sure how to help with that yet. Try asking in a different way.`,
            followUpActions: ["help"],
          }
      }
    } catch (error) {
      console.error(`[CommandRouter] Error routing ${intent.action}:`, error)
      return {
        success: false,
        response: "I encountered an error processing your command. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  private async handleExecuteAgent(intent: Intent, context: CommandContext): Promise<CommandResult> {
    const agentName = intent.entities.agent_name || intent.entities.agent || context.currentAgent
    const prompt = intent.entities.prompt || intent.entities.query || intent.entities.question

    if (!agentName) {
      return {
        success: false,
        response: "Which agent would you like me to run?",
        followUpActions: ["list_agents"],
      }
    }

    if (!prompt) {
      return {
        success: false,
        response: `What would you like the ${agentName} agent to do?`,
      }
    }

    // Find agent
    const { data: agent } = await this.supabase
      .from("ai_agents")
      .select("*")
      .eq("user_id", context.userId)
      .ilike("name", `%${agentName}%`)
      .eq("is_active", true)
      .maybeSingle()

    if (!agent) {
      return {
        success: false,
        response: `I couldn't find an active agent named "${agentName}". Would you like to see your available agents?`,
        followUpActions: ["list_agents", "create_agent"],
      }
    }

    // Build prompt with context
    let fullPrompt = prompt
    if (context.assetIds && context.assetIds.length > 0) {
      const assetContext = await formatAssetContext(context.assetIds, context.userId)
      fullPrompt = `${assetContext}\n\n${prompt}`
    }

    // Execute agent
    const result = await this.agentSystem.executeAgent(agent.id, fullPrompt)

    return {
      success: true,
      response: `${agent.name} says: ${result.finalResponse}`,
      data: result,
      followUpActions: ["execute_again", "modify_prompt"],
    }
  }

  private async handleQueryAssets(intent: Intent, context: CommandContext): Promise<CommandResult> {
    const searchTerm = intent.entities.asset_name || intent.entities.search || intent.entities.query
    const status = intent.entities.status
    const assetType = intent.entities.asset_type

    let query = this.supabase
      .from("assets")
      .select("id, name, asset_type, status, current_value, purchase_cost")
      .eq("user_id", context.userId)

    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%,asset_type.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
    }

    if (status) {
      query = query.eq("status", status)
    }

    if (assetType) {
      query = query.ilike("asset_type", `%${assetType}%`)
    }

    const { data: assets, error } = await query.limit(10)

    if (error) {
      return {
        success: false,
        response: "I encountered an error searching for assets.",
        error: error.message,
      }
    }

    if (!assets || assets.length === 0) {
      return {
        success: true,
        response: searchTerm
          ? `I couldn't find any assets matching "${searchTerm}".`
          : "You don't have any assets yet. Would you like to add one?",
        followUpActions: ["add_asset"],
      }
    }

    const assetList = assets
      .map((a) => {
        const value = a.current_value ? `$${a.current_value.toLocaleString()}` : "N/A"
        return `${a.name} (${a.asset_type}) - Status: ${a.status}, Value: ${value}`
      })
      .join("; ")

    return {
      success: true,
      response: `I found ${assets.length} asset${assets.length > 1 ? "s" : ""}: ${assetList}`,
      data: assets,
      followUpActions: ["get_asset_details", "get_asset_insights"],
    }
  }

  private async handleGetDashboardMetrics(intent: Intent, context: CommandContext): Promise<CommandResult> {
    const metricType = intent.entities.metric_type || "all"

    const [assetsResult, agentsResult, workflowsResult, tokensResult] = await Promise.all([
      this.supabase.from("assets").select("id, current_value", { count: "exact" }).eq("user_id", context.userId),
      this.supabase.from("ai_agents").select("id", { count: "exact" }).eq("user_id", context.userId),
      this.supabase.from("ai_workflows").select("id", { count: "exact" }).eq("user_id", context.userId),
      this.supabase.from("asset_tokens").select("id, token_supply", { count: "exact" }).eq("user_id", context.userId),
    ])

    const totalAssetValue = assetsResult.data?.reduce((sum, asset) => sum + (asset.current_value || 0), 0) || 0

    const metrics = {
      assets: assetsResult.count || 0,
      agents: agentsResult.count || 0,
      workflows: workflowsResult.count || 0,
      tokens: tokensResult.count || 0,
      totalAssetValue,
    }

    let response = ""
    if (metricType === "all") {
      response = `Here's your dashboard overview: You have ${metrics.assets} assets worth $${totalAssetValue.toLocaleString()}, ${metrics.agents} AI agents, ${metrics.workflows} workflows, and ${metrics.tokens} tokenized assets.`
    } else if (metricType === "assets") {
      response = `You have ${metrics.assets} assets with a total value of $${totalAssetValue.toLocaleString()}.`
    } else if (metricType === "agents") {
      response = `You have ${metrics.agents} AI agents configured.`
    } else {
      response = `Your ${metricType} metrics: ${JSON.stringify(metrics)}`
    }

    return {
      success: true,
      response,
      data: metrics,
      followUpActions: ["generate_report", "view_dashboard"],
    }
  }

  private async handleHelp(intent: Intent, context: CommandContext): Promise<CommandResult> {
    const helpTopic = intent.entities.topic || "general"

    const helpMessages = {
      general: `I can help you with: executing AI agents, managing assets, creating workflows, tokenizing assets, viewing dashboard metrics, and generating reports. What would you like to do?`,
      agents: `For AI agents, you can say: "Run my Asset Analyzer agent", "Create a new agent", "Show my agents", or "Delete the Market Trends agent".`,
      assets: `For assets, try: "Show my assets", "Add a new asset", "What's the status of my warehouse equipment?", or "Get insights for asset X".`,
      workflows: `For workflows: "Create a workflow", "Run my inventory workflow", or "Show my workflows".`,
      tokenization: `For tokenization: "Tokenize my warehouse asset", "Show my tokens", or "Create fractional tokens for asset X".`,
    }

    return {
      success: true,
      response: helpMessages[helpTopic as keyof typeof helpMessages] || helpMessages.general,
      followUpActions: ["try_command"],
    }
  }

  private async handleCreateAgent(intent: Intent, context: CommandContext): Promise<CommandResult> {
    return {
      success: false,
      response: "Creating agents via voice is in development. Please use the web dashboard to create agents for now.",
      followUpActions: ["open_dashboard"],
    }
  }

  private async handleUpdateAgent(intent: Intent, context: CommandContext): Promise<CommandResult> {
    return {
      success: false,
      response: "Updating agents via voice is in development. Please use the web dashboard.",
      followUpActions: ["open_dashboard"],
    }
  }

  private async handleDeleteAgent(intent: Intent, context: CommandContext): Promise<CommandResult> {
    return {
      success: false,
      response: "Deleting agents via voice requires confirmation. Please use the web dashboard for this action.",
      followUpActions: ["open_dashboard"],
    }
  }

  private async handleTokenizeAsset(intent: Intent, context: CommandContext): Promise<CommandResult> {
    return {
      success: false,
      response: "Asset tokenization via voice is in development. Please use the tokenization dashboard.",
      followUpActions: ["open_tokenization"],
    }
  }

  private async handleCreateWorkflow(intent: Intent, context: CommandContext): Promise<CommandResult> {
    return {
      success: false,
      response: "Creating workflows via voice is in development. Please use the workflows dashboard.",
      followUpActions: ["open_workflows"],
    }
  }

  private async handleExecuteWorkflow(intent: Intent, context: CommandContext): Promise<CommandResult> {
    return {
      success: false,
      response: "Executing workflows via voice is coming soon. Please use the workflows dashboard for now.",
      followUpActions: ["open_workflows"],
    }
  }

  private async handleGenerateReport(intent: Intent, context: CommandContext): Promise<CommandResult> {
    return {
      success: false,
      response: "Report generation via voice is in development. Please use the analytics dashboard.",
      followUpActions: ["open_analytics"],
    }
  }

  private async handleUpdateAsset(intent: Intent, context: CommandContext): Promise<CommandResult> {
    return {
      success: false,
      response: "Updating assets via voice is in development. Please use the asset management interface.",
      followUpActions: ["open_assets"],
    }
  }

  private async handleAddAsset(intent: Intent, context: CommandContext): Promise<CommandResult> {
    return {
      success: false,
      response: "Adding assets via voice is in development. Please use the asset creation form.",
      followUpActions: ["open_assets"],
    }
  }

  private async handleGetAssetInsights(intent: Intent, context: CommandContext): Promise<CommandResult> {
    const assetName = intent.entities.asset_name

    if (!assetName) {
      return {
        success: false,
        response: "Which asset would you like insights for?",
      }
    }

    const { data: asset } = await this.supabase
      .from("assets")
      .select("id, name")
      .eq("user_id", context.userId)
      .ilike("name", `%${assetName}%`)
      .maybeSingle()

    if (!asset) {
      return {
        success: false,
        response: `I couldn't find an asset named "${assetName}".`,
        followUpActions: ["query_assets"],
      }
    }

    const { data: insights } = await this.supabase
      .from("asset_intelligence_insights")
      .select("*")
      .eq("asset_id", asset.id)
      .order("created_at", { ascending: false })
      .limit(3)

    if (!insights || insights.length === 0) {
      return {
        success: true,
        response: `I don't have any AI insights for ${asset.name} yet. Would you like me to generate some?`,
        followUpActions: ["generate_insights"],
      }
    }

    const insightSummary = insights.map((i) => `${i.insight_type}: ${i.priority} priority`).join("; ")

    return {
      success: true,
      response: `Here are the latest insights for ${asset.name}: ${insightSummary}`,
      data: insights,
      followUpActions: ["view_full_insights", "generate_new_insights"],
    }
  }

  private async handleManageIntegrations(intent: Intent, context: CommandContext): Promise<CommandResult> {
    return {
      success: false,
      response: "Managing integrations via voice is in development. Please use the integrations dashboard.",
      followUpActions: ["open_integrations"],
    }
  }

  private async handleVoiceSettings(intent: Intent, context: CommandContext): Promise<CommandResult> {
    return {
      success: false,
      response: "Voice settings configuration is in development. Please use the settings page.",
      followUpActions: ["open_settings"],
    }
  }
}

export async function routeVoiceCommand(intent: Intent, context: CommandContext): Promise<CommandResult> {
  const router = new CommandRouter()
  return await router.routeCommand(intent, context)
}
