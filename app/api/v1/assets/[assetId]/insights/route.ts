/**
 * Kronova v1 Asset Insights API
 * AI-powered asset analysis
 */

import type { NextRequest } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { validateAPIAuth, apiError, apiSuccess } from "@/lib/auth/api-auth"
import { generateText } from "ai"

export async function POST(request: NextRequest, { params }: { params: { assetId: string } }) {
  try {
    const auth = await validateAPIAuth(request, ["execute:agents"])

    if (!auth.authenticated) {
      return apiError(auth.error || "Authentication failed", auth.status || 401)
    }

    const body = await request.json()
    const { insightType = "comprehensive" } = body

    const supabase = await createServerSupabaseClient()

    // Get asset
    const { data: asset, error: assetError } = await supabase
      .from("assets")
      .select("*")
      .eq("id", params.assetId)
      .eq("user_id", auth.userId!)
      .single()

    if (assetError || !asset) {
      return apiError("Asset not found", 404)
    }

    // Get IoT data if available
    let iotData = null
    if (asset.iot_sensor_id) {
      const { data: sensorData } = await supabase
        .from("iot_sensor_data")
        .select("*")
        .eq("sensor_id", asset.iot_sensor_id)
        .order("timestamp", { ascending: false })
        .limit(100)

      iotData = sensorData
    }

    // Generate insights
    const prompt = `Analyze the following asset and provide ${insightType} insights:

Asset Information:
- Name: ${asset.name}
- Type: ${asset.asset_type}
- Status: ${asset.status}
- Purchase Cost: $${asset.purchase_cost || 0}
- Current Value: $${asset.current_value || 0}
- Location: ${JSON.stringify(asset.location || {})}
- Specifications: ${JSON.stringify(asset.specifications || {})}
- ESG Metrics: ${JSON.stringify(asset.esg_metrics || {})}

${iotData ? `Recent IoT Data (last 100 readings): ${JSON.stringify(iotData.slice(0, 10))}` : "No IoT data available"}

Provide insights including:
1. Maintenance recommendations
2. Value optimization opportunities
3. Risk assessment
4. ESG improvement suggestions
5. Utilization optimization`

    const { text } = await generateText({
      model: "google/gemini-2.0-flash",
      prompt,
      maxTokens: 2000,
    })

    // Store insights
    const { data: insightRecord } = await supabase
      .from("ai_analysis_results")
      .insert({
        user_id: auth.userId,
        prompt: `Asset insights for ${asset.name}`,
        result: text,
        metadata: {
          asset_id: params.assetId,
          insight_type: insightType,
          generated_via: "api",
        },
      })
      .select()
      .single()

    return apiSuccess({
      assetId: params.assetId,
      assetName: asset.name,
      insightType,
      insights: text,
      analysisId: insightRecord?.id,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[Asset Insights API] Error:", error)
    return apiError("Internal server error", 500)
  }
}
