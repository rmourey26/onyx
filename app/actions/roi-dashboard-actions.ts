"use server"

/**
 * ROI Dashboard Server Actions
 * 
 * Server-side actions for fetching and analyzing ROI assessments data
 * from the org_roi_baseline_data table in the public schema.
 */

import { createServerSupabaseClient } from "@/lib/supabase/server"

// ============================================================================
// Types
// ============================================================================

export interface ROIAssessment {
  id: string
  assessment_reference: string
  company_name: string | null
  company_size: string
  industry: string
  employees: number
  email: string | null
  
  // Financial Metrics
  current_annual_cost: number
  kronova_annual_cost: number
  annual_savings: number
  three_year_savings: number
  five_year_value: number
  roi_percentage: number
  payback_months: number
  
  // Cost Breakdowns
  operational_savings: number
  productivity_gain: number
  quality_savings: number
  error_reduction: number
  hidden_cost_reduction: number
  strategic_value: number
  compliance_costs: number
  maintenance_costs: number | null
  training_costs: number | null
  security_costs: number | null
  data_preparation_costs: number | null
  
  // Operational Metrics
  manual_hours_per_week: number
  avg_salary: number
  error_rate_percentage: number
  system_downtime_percentage: number
  legacy_system_age_years: number
  
  // Readiness Scores (0-100)
  ai_maturity_score: number
  data_quality_score: number
  cloud_readiness_score: number
  change_readiness_score: number
  executive_support_score: number
  competitive_pressure_score: number
  
  // Risk Scores (0-100, higher = more risk)
  adoption_risk: number
  data_quality_risk: number
  implementation_risk: number
  integration_complexity: number
  
  // Timeline
  time_to_value_months: number
  selected_plan: string
  
  // Tracking
  source: string | null
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  is_demo: boolean | null
  consent_follow_up: boolean | null
  consent_marketing: boolean | null
  pdf_generated_count: number | null
  last_pdf_generated_at: string | null
  
  // Timestamps
  created_at: string | null
  updated_at: string | null
  user_id: string | null
}

export interface ROIDashboardStats {
  totalAssessments: number
  totalAnnualSavings: number
  avgROIPercentage: number
  avgPaybackMonths: number
  totalFiveYearValue: number
  byIndustry: Record<string, number>
  byCompanySize: Record<string, number>
  byPlan: Record<string, number>
  avgReadinessScore: number
  avgRiskScore: number
}

export interface ROITrendData {
  date: string
  assessments: number
  avgROI: number
  totalSavings: number
}

// ============================================================================
// Server Actions
// ============================================================================

/**
 * Get all ROI assessments with optional filters
 */
export async function getROIAssessments(options: {
  limit?: number
  offset?: number
  industry?: string
  companySize?: string
  minROI?: number
  startDate?: string
  endDate?: string
  isDemo?: boolean
  userId?: string
} = {}): Promise<{ success: boolean; data: ROIAssessment[]; total: number; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient()
    
    let query = supabase
      .from("org_roi_baseline_data")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })

    // Apply filters
    if (options.industry) {
      query = query.eq("industry", options.industry)
    }
    if (options.companySize) {
      query = query.eq("company_size", options.companySize)
    }
    if (options.minROI !== undefined) {
      query = query.gte("roi_percentage", options.minROI)
    }
    if (options.startDate) {
      query = query.gte("created_at", options.startDate)
    }
    if (options.endDate) {
      query = query.lte("created_at", options.endDate)
    }
    if (options.isDemo !== undefined) {
      query = query.eq("is_demo", options.isDemo)
    }
    if (options.userId) {
      query = query.eq("user_id", options.userId)
    }

    // Apply pagination
    if (options.limit) {
      query = query.limit(options.limit)
    }
    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 100) - 1)
    }

    const { data, count, error } = await query

    if (error) throw error

    return {
      success: true,
      data: (data || []) as ROIAssessment[],
      total: count || 0,
    }
  } catch (error) {
    console.error("[ROI Dashboard] Error fetching assessments:", error)
    return {
      success: false,
      data: [],
      total: 0,
      error: String(error),
    }
  }
}

/**
 * Get a single ROI assessment by ID or reference
 */
export async function getROIAssessmentById(
  idOrReference: string
): Promise<{ success: boolean; data: ROIAssessment | null; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient()

    // Try by ID first, then by reference
    let { data, error } = await supabase
      .from("org_roi_baseline_data")
      .select("*")
      .eq("id", idOrReference)
      .single()

    if (error || !data) {
      // Try by assessment_reference
      const result = await supabase
        .from("org_roi_baseline_data")
        .select("*")
        .eq("assessment_reference", idOrReference)
        .single()
      
      data = result.data
      error = result.error
    }

    if (error) throw error

    return {
      success: true,
      data: data as ROIAssessment,
    }
  } catch (error) {
    console.error("[ROI Dashboard] Error fetching assessment:", error)
    return {
      success: false,
      data: null,
      error: String(error),
    }
  }
}

/**
 * Get aggregated dashboard statistics
 */
export async function getROIDashboardStats(options: {
  startDate?: string
  endDate?: string
  isDemo?: boolean
} = {}): Promise<{ success: boolean; data: ROIDashboardStats | null; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient()

    let query = supabase.from("org_roi_baseline_data").select("*")

    if (options.startDate) {
      query = query.gte("created_at", options.startDate)
    }
    if (options.endDate) {
      query = query.lte("created_at", options.endDate)
    }
    if (options.isDemo !== undefined) {
      query = query.eq("is_demo", options.isDemo)
    }

    const { data, error } = await query

    if (error) throw error

    if (!data || data.length === 0) {
      return {
        success: true,
        data: {
          totalAssessments: 0,
          totalAnnualSavings: 0,
          avgROIPercentage: 0,
          avgPaybackMonths: 0,
          totalFiveYearValue: 0,
          byIndustry: {},
          byCompanySize: {},
          byPlan: {},
          avgReadinessScore: 0,
          avgRiskScore: 0,
        },
      }
    }

    // Calculate aggregations
    const totalAssessments = data.length
    const totalAnnualSavings = data.reduce((sum, a) => sum + (a.annual_savings || 0), 0)
    const avgROIPercentage = data.reduce((sum, a) => sum + (a.roi_percentage || 0), 0) / totalAssessments
    const avgPaybackMonths = data.reduce((sum, a) => sum + (a.payback_months || 0), 0) / totalAssessments
    const totalFiveYearValue = data.reduce((sum, a) => sum + (a.five_year_value || 0), 0)

    // Count by industry
    const byIndustry: Record<string, number> = {}
    data.forEach(a => {
      byIndustry[a.industry] = (byIndustry[a.industry] || 0) + 1
    })

    // Count by company size
    const byCompanySize: Record<string, number> = {}
    data.forEach(a => {
      byCompanySize[a.company_size] = (byCompanySize[a.company_size] || 0) + 1
    })

    // Count by plan
    const byPlan: Record<string, number> = {}
    data.forEach(a => {
      byPlan[a.selected_plan] = (byPlan[a.selected_plan] || 0) + 1
    })

    // Calculate average readiness score
    const avgReadinessScore = data.reduce((sum, a) => {
      const readinessAvg = (
        (a.ai_maturity_score || 0) +
        (a.data_quality_score || 0) +
        (a.cloud_readiness_score || 0) +
        (a.change_readiness_score || 0) +
        (a.executive_support_score || 0)
      ) / 5
      return sum + readinessAvg
    }, 0) / totalAssessments

    // Calculate average risk score
    const avgRiskScore = data.reduce((sum, a) => {
      const riskAvg = (
        (a.adoption_risk || 0) +
        (a.data_quality_risk || 0) +
        (a.implementation_risk || 0) +
        (a.integration_complexity || 0)
      ) / 4
      return sum + riskAvg
    }, 0) / totalAssessments

    return {
      success: true,
      data: {
        totalAssessments,
        totalAnnualSavings,
        avgROIPercentage: Math.round(avgROIPercentage * 10) / 10,
        avgPaybackMonths: Math.round(avgPaybackMonths * 10) / 10,
        totalFiveYearValue,
        byIndustry,
        byCompanySize,
        byPlan,
        avgReadinessScore: Math.round(avgReadinessScore),
        avgRiskScore: Math.round(avgRiskScore),
      },
    }
  } catch (error) {
    console.error("[ROI Dashboard] Error fetching stats:", error)
    return {
      success: false,
      data: null,
      error: String(error),
    }
  }
}

/**
 * Get ROI trend data over time
 */
export async function getROITrendData(options: {
  days?: number
  groupBy?: "day" | "week" | "month"
} = {}): Promise<{ success: boolean; data: ROITrendData[]; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient()
    const days = options.days || 30

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabase
      .from("org_roi_baseline_data")
      .select("created_at, roi_percentage, annual_savings")
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: true })

    if (error) throw error

    // Group by date
    const groupedData: Record<string, { count: number; totalROI: number; totalSavings: number }> = {}
    
    data?.forEach(item => {
      const date = new Date(item.created_at!).toISOString().split("T")[0]
      if (!groupedData[date]) {
        groupedData[date] = { count: 0, totalROI: 0, totalSavings: 0 }
      }
      groupedData[date].count++
      groupedData[date].totalROI += item.roi_percentage || 0
      groupedData[date].totalSavings += item.annual_savings || 0
    })

    const trendData: ROITrendData[] = Object.entries(groupedData).map(([date, stats]) => ({
      date,
      assessments: stats.count,
      avgROI: Math.round(stats.totalROI / stats.count),
      totalSavings: stats.totalSavings,
    }))

    return {
      success: true,
      data: trendData,
    }
  } catch (error) {
    console.error("[ROI Dashboard] Error fetching trend data:", error)
    return {
      success: false,
      data: [],
      error: String(error),
    }
  }
}

/**
 * Get top performing assessments by ROI
 */
export async function getTopROIAssessments(
  limit: number = 10
): Promise<{ success: boolean; data: ROIAssessment[]; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from("org_roi_baseline_data")
      .select("*")
      .order("roi_percentage", { ascending: false })
      .limit(limit)

    if (error) throw error

    return {
      success: true,
      data: (data || []) as ROIAssessment[],
    }
  } catch (error) {
    console.error("[ROI Dashboard] Error fetching top assessments:", error)
    return {
      success: false,
      data: [],
      error: String(error),
    }
  }
}

/**
 * Get industry benchmarks
 */
export async function getIndustryBenchmarks(): Promise<{
  success: boolean
  data: Record<string, {
    avgROI: number
    avgPayback: number
    avgSavings: number
    count: number
  }>
  error?: string
}> {
  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from("org_roi_baseline_data")
      .select("industry, roi_percentage, payback_months, annual_savings")

    if (error) throw error

    const benchmarks: Record<string, {
      totalROI: number
      totalPayback: number
      totalSavings: number
      count: number
    }> = {}

    data?.forEach(item => {
      if (!benchmarks[item.industry]) {
        benchmarks[item.industry] = { totalROI: 0, totalPayback: 0, totalSavings: 0, count: 0 }
      }
      benchmarks[item.industry].totalROI += item.roi_percentage || 0
      benchmarks[item.industry].totalPayback += item.payback_months || 0
      benchmarks[item.industry].totalSavings += item.annual_savings || 0
      benchmarks[item.industry].count++
    })

    const result: Record<string, {
      avgROI: number
      avgPayback: number
      avgSavings: number
      count: number
    }> = {}

    Object.entries(benchmarks).forEach(([industry, stats]) => {
      result[industry] = {
        avgROI: Math.round(stats.totalROI / stats.count),
        avgPayback: Math.round(stats.totalPayback / stats.count * 10) / 10,
        avgSavings: Math.round(stats.totalSavings / stats.count),
        count: stats.count,
      }
    })

    return {
      success: true,
      data: result,
    }
  } catch (error) {
    console.error("[ROI Dashboard] Error fetching industry benchmarks:", error)
    return {
      success: false,
      data: {},
      error: String(error),
    }
  }
}
