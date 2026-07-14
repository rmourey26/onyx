"use server"

export interface AITool {
  name: string
  description: string
  category: "data" | "blockchain" | "code" | "search" | "optimization" | "analysis"
  parameters: Record<string, any>
  icon: string
  requiresAuth?: boolean
  premium?: boolean
}

export const AVAILABLE_AI_TOOLS: AITool[] = [
  {
    name: "web_search",
    description: "Search the web for current information and data",
    category: "search",
    icon: "search",
    parameters: {
      query: { type: "string", required: true },
      num_results: { type: "number", default: 5 },
    },
  },
  {
    name: "query_database",
    description: "Query Supabase database tables with SQL",
    category: "data",
    icon: "database",
    parameters: {
      table: { type: "string", required: true },
      query: { type: "string", required: true },
    },
    requiresAuth: true,
  },
  {
    name: "analyze_data",
    description: "Analyze data from various sources with statistical methods",
    category: "analysis",
    icon: "bar-chart",
    parameters: {
      data_source: { type: "string", required: true },
      analysis_type: { type: "string", enum: ["summary", "trends", "anomalies", "forecast"] },
    },
  },
  {
    name: "generate_code",
    description: "Generate code in multiple programming languages",
    category: "code",
    icon: "code",
    parameters: {
      language: { type: "string", enum: ["javascript", "typescript", "python", "sql", "html", "css"] },
      description: { type: "string", required: true },
    },
  },
  {
    name: "optimize_packaging",
    description: "Optimize packaging for shipments using bin-packing algorithms",
    category: "optimization",
    icon: "package",
    parameters: {
      items: { type: "array", required: true },
      constraints: { type: "object" },
    },
  },
  {
    name: "estimate_shipping_cost",
    description: "Estimate shipping costs based on origin, destination, and package details",
    category: "optimization",
    icon: "truck",
    parameters: {
      origin: { type: "string", required: true },
      destination: { type: "string", required: true },
      weight: { type: "number", required: true },
      service_level: { type: "string", enum: ["standard", "express", "overnight"] },
    },
  },
  {
    name: "search_embeddings",
    description: "Search for similar documents using vector embeddings",
    category: "search",
    icon: "search",
    parameters: {
      query: { type: "string", required: true },
      similarity_threshold: { type: "number", default: 0.7 },
    },
    requiresAuth: true,
  },
  {
    name: "query_sui_blockchain",
    description: "Query data from the Sui blockchain",
    category: "blockchain",
    icon: "blocks",
    parameters: {
      query_type: { type: "string", enum: ["objects", "transactions", "address", "nfts"] },
      address: { type: "string" },
    },
  },
  {
    name: "analyze_nfts",
    description: "Analyze NFTs with ownership, value, and activity analysis",
    category: "blockchain",
    icon: "image",
    parameters: {
      nft_id: { type: "string", required: true },
      analysis_type: { type: "string", enum: ["ownership", "value", "activity", "metadata"] },
    },
  },
  // Extended tools for asset intelligence
  {
    name: "generate_insights",
    description: "Generate analytical insights from data",
    category: "analysis",
    icon: "lightbulb",
    parameters: {
      data_source: { type: "string", required: true },
      insight_type: { type: "string" },
    },
    premium: true,
  },
  {
    name: "financial_analysis",
    description: "Conduct financial analysis and TCO calculations",
    category: "analysis",
    icon: "dollar-sign",
    parameters: {
      data: { type: "object", required: true },
      analysis_type: { type: "string", enum: ["tco", "roi", "npv", "irr"] },
    },
    premium: true,
  },
  {
    name: "real_time_monitoring",
    description: "Monitor assets in real-time with alerts",
    category: "analysis",
    icon: "activity",
    parameters: {
      asset_id: { type: "string", required: true },
      metrics: { type: "array" },
    },
    premium: true,
    requiresAuth: true,
  },
  {
    name: "risk_modeling",
    description: "Perform risk analysis and modeling",
    category: "analysis",
    icon: "alert-triangle",
    parameters: {
      risk_factors: { type: "array", required: true },
      model_type: { type: "string" },
    },
    premium: true,
  },
  {
    name: "sustainability_metrics",
    description: "Track sustainability and ESG metrics",
    category: "analysis",
    icon: "leaf",
    parameters: {
      metric_type: { type: "string", enum: ["carbon", "water", "waste", "energy"] },
      time_period: { type: "string" },
    },
    premium: true,
  },
  {
    name: "compliance_tracking",
    description: "Monitor compliance requirements and regulations",
    category: "analysis",
    icon: "file-check",
    parameters: {
      regulation_type: { type: "string", required: true },
      jurisdiction: { type: "string" },
    },
    premium: true,
  },
  {
    name: "iot_analytics",
    description: "Analyze IoT device data and sensor readings",
    category: "analysis",
    icon: "wifi",
    parameters: {
      device_id: { type: "string", required: true },
      metric: { type: "string" },
    },
    premium: true,
    requiresAuth: true,
  },
  {
    name: "security_monitoring",
    description: "Monitor security aspects and threats",
    category: "analysis",
    icon: "shield",
    parameters: {
      asset_id: { type: "string", required: true },
      threat_level: { type: "string" },
    },
    premium: true,
    requiresAuth: true,
  },
  {
    name: "inventory_analytics",
    description: "Analyze inventory levels and optimization",
    category: "optimization",
    icon: "package",
    parameters: {
      warehouse_id: { type: "string" },
      analysis_type: { type: "string", enum: ["levels", "turnover", "forecast"] },
    },
    premium: true,
  },
  {
    name: "generate_asset_insights",
    description: "Generate asset-specific insights and recommendations",
    category: "analysis",
    icon: "zap",
    parameters: {
      asset_id: { type: "string", required: true },
      insight_category: { type: "string" },
    },
    premium: true,
    requiresAuth: true,
  },
  {
    name: "predictive_maintenance_analysis",
    description: "AI-powered predictive maintenance with failure probability modeling",
    category: "analysis",
    icon: "wrench",
    parameters: {
      asset_id: { type: "string", required: true },
      analysis_depth: { type: "string", enum: ["quick_scan", "detailed", "comprehensive"] },
    },
    premium: true,
    requiresAuth: true,
  },
  {
    name: "asset_utilization_optimizer",
    description: "Optimize asset utilization and reduce idle time",
    category: "optimization",
    icon: "trending-up",
    parameters: {
      scope: { type: "string", enum: ["single_asset", "department", "facility", "organization"] },
      optimization_goal: { type: "string" },
    },
    premium: true,
    requiresAuth: true,
  },
  {
    name: "voice_data_entry_processor",
    description: "Process voice commands for hands-free asset management",
    category: "optimization",
    icon: "mic",
    parameters: {
      voice_command: { type: "string", required: true },
      context: { type: "string" },
    },
    premium: true,
    requiresAuth: true,
  },
  {
    name: "compliance_monitoring_system",
    description: "Automated compliance monitoring against OSHA, FDA, EPA regulations",
    category: "analysis",
    icon: "shield-check",
    parameters: {
      asset_id: { type: "string" },
      regulation_types: { type: "array" },
    },
    premium: true,
    requiresAuth: true,
  },
  {
    name: "asset_tokenization_engine",
    description: "Tokenize assets on Sui blockchain with fractional ownership",
    category: "blockchain",
    icon: "coins",
    parameters: {
      asset_id: { type: "string", required: true },
      tokenization_type: { type: "string", enum: ["full_ownership", "fractional", "revenue_share"] },
    },
    premium: true,
    requiresAuth: true,
  },
  {
    name: "provenance_verification_system",
    description: "Verify asset provenance using blockchain and AI anomaly detection",
    category: "blockchain",
    icon: "shield",
    parameters: {
      asset_id: { type: "string", required: true },
      verification_depth: { type: "string", enum: ["basic", "standard", "comprehensive"] },
    },
    premium: true,
    requiresAuth: true,
  },
  {
    name: "financial_data_integration_engine",
    description: "Integrate Plaid, Stripe, and financial data with real-time TCO calculations",
    category: "analysis",
    icon: "dollar-sign",
    parameters: {
      asset_id: { type: "string", required: true },
      analysis_type: { type: "string", enum: ["tco", "roi", "cash_flow", "cost_breakdown"] },
    },
    premium: true,
    requiresAuth: true,
  },
]

export async function getToolsByCategory(category: AITool["category"]): Promise<AITool[]> {
  return AVAILABLE_AI_TOOLS.filter((tool) => tool.category === category)
}

export async function getToolByName(name: string): Promise<AITool | undefined> {
  return AVAILABLE_AI_TOOLS.find((tool) => tool.name === name)
}

export async function getCoreTools(): Promise<AITool[]> {
  return AVAILABLE_AI_TOOLS.filter((tool) => !tool.premium)
}

export async function getPremiumTools(): Promise<AITool[]> {
  return AVAILABLE_AI_TOOLS.filter((tool) => tool.premium)
}
