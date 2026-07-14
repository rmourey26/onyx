"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"

export interface AssetAnalytics {
  total_assets: number
  active_assets: number
  maintenance_assets: number
  iot_enabled_assets: number
  total_asset_value: number
  avg_asset_value: number
  total_insights: number
  total_lifecycle_events: number
  asset_type?: string
  user_id: string
}

export interface AssetTrend {
  date: string
  total_assets: number
  active_assets: number
  total_value: number
}

export interface InsightSummary {
  insight_type: string
  count: number
  high_priority_count: number
  avg_confidence: number
}

export async function getComprehensiveAnalytics() {
  const supabase = await createServerSupabaseClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    // Fetch analytics from the view
    const { data: analyticsRows, error: analyticsError } = await supabase
      .from("asset_analytics")
      .select("*")
      .eq("user_id", user.id)

    if (analyticsError) {
      console.error("Error fetching analytics:", analyticsError)
      return { success: false, error: analyticsError.message }
    }

    const analytics =
      analyticsRows && analyticsRows.length > 0
        ? analyticsRows.reduce(
            (acc, row) => ({
              total_assets: (acc.total_assets || 0) + (row.total_assets || 0),
              active_assets: (acc.active_assets || 0) + (row.active_assets || 0),
              maintenance_assets: (acc.maintenance_assets || 0) + (row.maintenance_assets || 0),
              iot_enabled_assets: (acc.iot_enabled_assets || 0) + (row.iot_enabled_assets || 0),
              total_asset_value: (acc.total_asset_value || 0) + (row.total_asset_value || 0),
              avg_asset_value: 0, // Will calculate after aggregation
              total_insights: (acc.total_insights || 0) + (row.total_insights || 0),
              total_lifecycle_events: (acc.total_lifecycle_events || 0) + (row.total_lifecycle_events || 0),
              user_id: user.id,
            }),
            {
              total_assets: 0,
              active_assets: 0,
              maintenance_assets: 0,
              iot_enabled_assets: 0,
              total_asset_value: 0,
              avg_asset_value: 0,
              total_insights: 0,
              total_lifecycle_events: 0,
              user_id: user.id,
            },
          )
        : null

    if (analytics && analytics.total_assets > 0) {
      analytics.avg_asset_value = analytics.total_asset_value / analytics.total_assets
    }

    // Fetch asset type breakdown
    const { data: assetsByType, error: typeError } = await supabase
      .from("assets")
      .select("asset_type, status, current_value")
      .eq("user_id", user.id)

    if (typeError) {
      console.error("Error fetching assets by type:", typeError)
    }

    // Calculate type breakdown
    const typeBreakdown = (assetsByType || []).reduce(
      (acc, asset) => {
        const type = asset.asset_type
        if (!acc[type]) {
          acc[type] = { count: 0, value: 0, active: 0 }
        }
        acc[type].count++
        acc[type].value += asset.current_value || 0
        if (asset.status === "active") acc[type].active++
        return acc
      },
      {} as Record<string, { count: number; value: number; active: number }>,
    )

    // Fetch insight summary
    const { data: insights, error: insightsError } = await supabase
      .from("asset_intelligence_insights")
      .select("insight_type, priority, confidence_score, status")
      .eq("user_id", user.id)

    if (insightsError) {
      console.error("Error fetching insights:", insightsError)
    }

    // Calculate insight summary
    const insightSummary = (insights || []).reduce(
      (acc, insight) => {
        const type = insight.insight_type
        if (!acc[type]) {
          acc[type] = {
            count: 0,
            high_priority_count: 0,
            total_confidence: 0,
          }
        }
        acc[type].count++
        if (insight.priority === "high" || insight.priority === "critical") {
          acc[type].high_priority_count++
        }
        acc[type].total_confidence += insight.confidence_score || 0
        return acc
      },
      {} as Record<string, { count: number; high_priority_count: number; total_confidence: number }>,
    )

    const insightSummaryArray: InsightSummary[] = Object.entries(insightSummary).map(([type, data]) => ({
      insight_type: type,
      count: data.count,
      high_priority_count: data.high_priority_count,
      avg_confidence: data.count > 0 ? data.total_confidence / data.count : 0,
    }))

    // Fetch lifecycle events for trends
    const { data: lifecycleEvents, error: eventsError } = await supabase
      .from("asset_lifecycle_events")
      .select("event_type, event_date, cost")
      .eq("user_id", user.id)
      .order("event_date", { ascending: false })
      .limit(100)

    if (eventsError) {
      console.error("Error fetching lifecycle events:", eventsError)
    }

    // Calculate cost trends
    const costByEventType = (lifecycleEvents || []).reduce(
      (acc, event) => {
        const type = event.event_type
        if (!acc[type]) {
          acc[type] = { count: 0, total_cost: 0 }
        }
        acc[type].count++
        acc[type].total_cost += event.cost || 0
        return acc
      },
      {} as Record<string, { count: number; total_cost: number }>,
    )

    return {
      success: true,
      data: {
        overview: analytics || {
          total_assets: 0,
          active_assets: 0,
          maintenance_assets: 0,
          iot_enabled_assets: 0,
          total_asset_value: 0,
          avg_asset_value: 0,
          total_insights: 0,
          total_lifecycle_events: 0,
          user_id: user.id,
        },
        typeBreakdown,
        insightSummary: insightSummaryArray,
        costByEventType,
        recentEvents: lifecycleEvents?.slice(0, 10) || [],
      },
    }
  } catch (error) {
    console.error("Error in getComprehensiveAnalytics:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function getAssetTrends(days = 30) {
  const supabase = await createServerSupabaseClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Fetch assets created over time
    const { data: assets, error } = await supabase
      .from("assets")
      .select("created_at, status, current_value")
      .eq("user_id", user.id)
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching asset trends:", error)
      return { success: false, error: error.message }
    }

    // Group by date
    const trendsByDate = (assets || []).reduce(
      (acc, asset) => {
        const date = new Date(asset.created_at).toISOString().split("T")[0]
        if (!acc[date]) {
          acc[date] = {
            date,
            total_assets: 0,
            active_assets: 0,
            total_value: 0,
          }
        }
        acc[date].total_assets++
        if (asset.status === "active") acc[date].active_assets++
        acc[date].total_value += asset.current_value || 0
        return acc
      },
      {} as Record<string, AssetTrend>,
    )

    const trends = Object.values(trendsByDate).sort((a, b) => a.date.localeCompare(b.date))

    return { success: true, data: trends }
  } catch (error) {
    console.error("Error in getAssetTrends:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function getInsightsByPriority() {
  const supabase = await createServerSupabaseClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    const { data: insights, error } = await supabase
      .from("asset_intelligence_insights")
      .select("priority, status, insight_type, created_at")
      .eq("user_id", user.id)

    if (error) {
      console.error("Error fetching insights by priority:", error)
      return { success: false, error: error.message }
    }

    const priorityBreakdown = (insights || []).reduce(
      (acc, insight) => {
        const priority = insight.priority
        if (!acc[priority]) {
          acc[priority] = { total: 0, active: 0, resolved: 0 }
        }
        acc[priority].total++
        if (insight.status === "active") acc[priority].active++
        if (insight.status === "resolved") acc[priority].resolved++
        return acc
      },
      {} as Record<string, { total: number; active: number; resolved: number }>,
    )

    return { success: true, data: priorityBreakdown }
  } catch (error) {
    console.error("Error in getInsightsByPriority:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
