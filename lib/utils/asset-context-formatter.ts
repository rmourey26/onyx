"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"

/**
 * Comprehensive asset context formatter that includes all 29 asset fields
 * for optimal AI agent and workflow performance
 */
export async function formatAssetContext(assetIds: string[], userId: string): Promise<string> {
  if (!assetIds || assetIds.length === 0) {
    return ""
  }

  const supabase = await createServerSupabaseClient()

  // Removed asset_maintenance_records and asset_compliance_records as they don't exist
  // Maintenance data is in maintenance_schedule JSON field, compliance in compliance_data JSON field
  const { data: assets, error } = await supabase
    .from("assets")
    .select(
      `
      *,
      asset_lifecycle_events(*),
      asset_intelligence_insights(*)
    `,
    )
    .in("id", assetIds)
    .eq("user_id", userId)

  if (error || !assets || assets.length === 0) {
    console.error("[Asset Context] Error fetching assets:", error)
    return ""
  }

  let context = "\n\n=== COMPREHENSIVE ASSET CONTEXT ===\n"
  context += `You have been provided with ${assets.length} asset(s) for detailed analysis.\n`
  context += `Each asset includes complete specifications, lifecycle data, and intelligence insights.\n\n`

  assets.forEach((asset, index) => {
    context += `━━━ ASSET ${index + 1}: ${asset.name} ━━━\n\n`

    // Core Identification (Fields 1-4)
    context += `📋 IDENTIFICATION:\n`
    context += `  • Asset ID: ${asset.asset_id}\n`
    context += `  • Internal ID: ${asset.id}\n`
    context += `  • Type: ${asset.asset_type}\n`
    context += `  • Category: ${asset.category || "Uncategorized"}\n`
    context += `  • Status: ${asset.status}\n\n`

    // Description & Specifications (Fields 5-7)
    context += `📝 DESCRIPTION & SPECIFICATIONS:\n`
    context += `  • Description: ${asset.description || "No description provided"}\n`
    if (asset.specifications) {
      context += `  • Specifications:\n`
      const specs = typeof asset.specifications === "string" ? JSON.parse(asset.specifications) : asset.specifications
      Object.entries(specs).forEach(([key, value]) => {
        context += `    - ${key}: ${value}\n`
      })
    }
    context += `\n`

    // Financial Data (Fields 8-11)
    context += `💰 FINANCIAL INFORMATION:\n`
    context += `  • Purchase Cost: ${asset.purchase_cost ? `$${asset.purchase_cost.toLocaleString()}` : "N/A"}\n`
    context += `  • Current Value: ${asset.current_value ? `$${asset.current_value.toLocaleString()}` : "N/A"}\n`
    context += `  • Purchase Date: ${asset.purchase_date ? new Date(asset.purchase_date).toLocaleDateString() : "N/A"}\n`
    context += `  • Depreciation Rate: ${asset.depreciation_rate ? `${asset.depreciation_rate}%` : "N/A"}\n\n`

    // Location Data (Fields 12-13)
    context += `📍 LOCATION:\n`
    context += `  • Location ID: ${asset.location_id || "Not assigned"}\n`
    if (asset.current_location) {
      const location =
        typeof asset.current_location === "string" ? JSON.parse(asset.current_location) : asset.current_location
      context += `  • Current Location: ${JSON.stringify(location)}\n`
    }
    context += `\n`

    // Tracking & Identification (Fields 14-16)
    context += `🔍 TRACKING:\n`
    context += `  • QR Code: ${asset.qr_code || "Not generated"}\n`
    context += `  • NFC Tag ID: ${asset.nfc_tag_id || "Not assigned"}\n`
    context += `  • IoT Sensor ID: ${asset.iot_sensor_id || "Not connected"}\n\n`

    // Maintenance & Schedule (Field 17)
    if (asset.maintenance_schedule) {
      context += `🔧 MAINTENANCE SCHEDULE:\n`
      const schedule =
        typeof asset.maintenance_schedule === "string"
          ? JSON.parse(asset.maintenance_schedule)
          : asset.maintenance_schedule
      context += `  ${JSON.stringify(schedule, null, 2)}\n\n`
    }

    // Risk & Compliance (Fields 18-19)
    context += `⚠️ RISK & COMPLIANCE:\n`
    context += `  • Risk Score: ${asset.risk_score !== null ? `${asset.risk_score}/100` : "Not assessed"}\n`
    if (asset.compliance_data) {
      const compliance =
        typeof asset.compliance_data === "string" ? JSON.parse(asset.compliance_data) : asset.compliance_data
      context += `  • Compliance Status: ${JSON.stringify(compliance)}\n`
    }
    context += `\n`

    // ESG & Sustainability (Field 20)
    if (asset.esg_metrics) {
      context += `🌱 ESG METRICS:\n`
      const esg = typeof asset.esg_metrics === "string" ? JSON.parse(asset.esg_metrics) : asset.esg_metrics
      context += `  ${JSON.stringify(esg, null, 2)}\n\n`
    }

    // AI & Predictive Data (Fields 21-23)
    context += `🤖 AI & PREDICTIVE ANALYTICS:\n`
    if (asset.ai_agent_config) {
      const aiConfig =
        typeof asset.ai_agent_config === "string" ? JSON.parse(asset.ai_agent_config) : asset.ai_agent_config
      context += `  • AI Agent Config: ${JSON.stringify(aiConfig)}\n`
    }
    if (asset.predictive_data) {
      const predictive =
        typeof asset.predictive_data === "string" ? JSON.parse(asset.predictive_data) : asset.predictive_data
      context += `  • Predictive Data: ${JSON.stringify(predictive)}\n`
    }
    if (asset.workflow_settings) {
      const workflow =
        typeof asset.workflow_settings === "string" ? JSON.parse(asset.workflow_settings) : asset.workflow_settings
      context += `  • Workflow Settings: ${JSON.stringify(workflow)}\n`
    }
    context += `\n`

    // Vector Embeddings (Field 24)
    if (asset.embedding_vector) {
      context += `🔢 EMBEDDINGS:\n`
      context += `  • Vector embedding available for semantic search\n\n`
    }

    // Metadata (Field 25)
    if (asset.metadata) {
      context += `📊 ADDITIONAL METADATA:\n`
      const metadata = typeof asset.metadata === "string" ? JSON.parse(asset.metadata) : asset.metadata
      context += `  ${JSON.stringify(metadata, null, 2)}\n\n`
    }

    // Timestamps (Fields 26-27)
    context += `⏰ TIMESTAMPS:\n`
    context += `  • Created: ${new Date(asset.created_at).toLocaleString()}\n`
    context += `  • Last Updated: ${new Date(asset.updated_at).toLocaleString()}\n\n`

    // Lifecycle Events
    if (asset.asset_lifecycle_events && asset.asset_lifecycle_events.length > 0) {
      context += `📅 LIFECYCLE EVENTS (${asset.asset_lifecycle_events.length} total):\n`
      asset.asset_lifecycle_events.slice(0, 10).forEach((event: any) => {
        context += `  • [${new Date(event.event_date).toLocaleDateString()}] ${event.event_type}: ${event.description || "No description"}\n`
        if (event.cost) {
          context += `    Cost: $${event.cost.toLocaleString()}\n`
        }
        if (event.metadata) {
          context += `    Details: ${JSON.stringify(event.metadata)}\n`
        }
      })
      if (asset.asset_lifecycle_events.length > 10) {
        context += `  ... and ${asset.asset_lifecycle_events.length - 10} more events\n`
      }
      context += `\n`
    }

    // Intelligence Insights
    if (asset.asset_intelligence_insights && asset.asset_intelligence_insights.length > 0) {
      context += `💡 INTELLIGENCE INSIGHTS (${asset.asset_intelligence_insights.length} total):\n`
      asset.asset_intelligence_insights.slice(0, 5).forEach((insight: any) => {
        context += `  • [${insight.priority}] ${insight.insight_type}:\n`
        const insightData =
          typeof insight.insight_data === "string" ? JSON.parse(insight.insight_data) : insight.insight_data
        context += `    ${JSON.stringify(insightData)}\n`
        if (insight.confidence_score) {
          context += `    Confidence: ${(insight.confidence_score * 100).toFixed(1)}%\n`
        }
        if (insight.recommendations) {
          const recs =
            typeof insight.recommendations === "string" ? JSON.parse(insight.recommendations) : insight.recommendations
          context += `    Recommendations: ${JSON.stringify(recs)}\n`
        }
      })
      if (asset.asset_intelligence_insights.length > 5) {
        context += `  ... and ${asset.asset_intelligence_insights.length - 5} more insights\n`
      }
      context += `\n`
    }

    context += `\n`
  })

  context += "=== END ASSET CONTEXT ===\n\n"
  context += `INSTRUCTIONS: Use this comprehensive asset data to provide informed, data-driven analysis and recommendations. `
  context += `All ${assets.length} asset(s) include complete specifications, financial data, location tracking, maintenance schedules, `
  context += `risk assessments, ESG metrics, AI configurations, lifecycle events, and intelligence insights.\n\n`

  return context
}
