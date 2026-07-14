import type { SupabaseClient } from "@supabase/supabase-js"
import { AgentSystem } from "@/lib/ai/agent-system"
import { WorkflowSystem } from "@/lib/workflows/workflow-system"
import { EmbeddingSystem } from "@/lib/embeddings/embedding-system"

export interface Asset {
  id: string
  asset_id: string
  name: string
  description?: string | null
  asset_type: string // Use string to accept all valid asset types from DB including digital, building, etc.
  category?: string | null
  status: string // Use string to accept all valid statuses from DB
  location_id?: string | null
  current_location?: Record<string, any> | null
  specifications?: Record<string, any> | null
  purchase_date?: string | null
  purchase_cost?: number | null
  depreciation_rate?: number | null
  current_value?: number | null
  last_maintenance_date?: string | null
  next_maintenance_date?: string | null
  maintenance_schedule?: Record<string, any> | null
  compliance_data?: Record<string, any> | null
  esg_metrics?: Record<string, any> | null
  iot_sensor_id?: string | null
  nfc_tag_id?: string | null
  qr_code?: string | null
  operational_status?: string | null
  battery_level?: number | null
  current_task?: Record<string, any> | null
  task_queue?: Record<string, any> | null
  task_progress?: number | null
  speed?: number | null
  payload_capacity?: number | null
  sensors?: string[] | null
  capabilities?: Record<string, any> | null
  workflow_settings?: Record<string, any> | null
  ai_agent_config?: Record<string, any> | null
  predictive_data?: Record<string, any> | null
  risk_score?: number | null
  error_count?: number | null
  total_runtime_hours?: number | null
  special_tools?: string[] | null
  location?: Record<string, any> | null
  embedding_vector?: string | null
  metadata?: Record<string, any> | null
  user_id: string
  created_at?: string | null
  updated_at?: string | null
}

export interface AssetLifecycleEvent {
  id: string
  asset_id: string
  event_type: string // Use string to accept all valid event types from DB
  event_status: string // Use string to accept all valid statuses from DB
  event_date: string
  location?: Record<string, any> | null
  cost?: number | null
  description?: string | null
  performed_by?: string | null
  documentation?: Record<string, any> | null
  ai_analysis_id?: string | null
  metadata?: Record<string, any> | null
  user_id: string
  created_at?: string | null
}

export interface AssetIntelligenceInsight {
  id: string
  asset_id: string
  insight_type: string // Use string to accept all valid insight types from DB
  confidence_score: number
  insight_data: Record<string, any>
  recommendations: any[]
  priority: string // Use string to accept all valid priorities from DB
  status: string // Use string to accept all valid statuses from DB
  ai_agent_id?: string | null
  workflow_run_id?: string | null
  expires_at?: string | null
  user_id: string
  created_at?: string | null
  updated_at?: string | null
}

export class AssetIntelligenceSystem {
  private supabase: SupabaseClient
  private agentSystem: AgentSystem
  private workflowSystem: WorkflowSystem
  private embeddingSystem: EmbeddingSystem

  constructor(supabaseClient?: SupabaseClient) {
    this.supabase = supabaseClient || this.createSupabaseClient()

    try {
      this.agentSystem = new AgentSystem(this.supabase)
    } catch {
      this.agentSystem = new AgentSystem()
    }

    try {
      this.workflowSystem = new WorkflowSystem(this.supabase)
    } catch {
      this.workflowSystem = {} as WorkflowSystem
    }

    try {
      this.embeddingSystem = new EmbeddingSystem(this.supabase)
    } catch {
      this.embeddingSystem = {} as EmbeddingSystem
    }
  }

  private createSupabaseClient(): SupabaseClient {
    // Placeholder for creating Supabase client
    return {} as SupabaseClient
  }

  // Asset Management
  async createAsset(assetData: Partial<Asset>): Promise<Asset> {
    const { data, error } = await this.supabase
      .from("assets")
      .insert([
        {
          ...assetData,
          asset_id: assetData.asset_id || this.generateAssetId(),
          qr_code: assetData.qr_code || this.generateQRCode(),
          specifications: assetData.specifications || {},
          maintenance_schedule: assetData.maintenance_schedule || {},
          compliance_data: assetData.compliance_data || {},
          esg_metrics: assetData.esg_metrics || {},
          metadata: assetData.metadata || {},
        },
      ])
      .select()
      .single()

    if (error) throw error

    // Create initial lifecycle event
    await this.createLifecycleEvent({
      asset_id: data.id,
      event_type: "created",
      event_status: "completed",
      description: `Asset ${data.name} created`,
      user_id: data.user_id,
    })

    return data
  }

  async getAssets(
    userId: string,
    filters?: {
      asset_type?: string
      status?: string
      category?: string
      has_iot?: boolean
    },
  ): Promise<Asset[]> {
    let query = this.supabase.from("assets").select("*").eq("user_id", userId).order("created_at", { ascending: false })

    if (filters?.asset_type) {
      query = query.eq("asset_type", filters.asset_type)
    }
    if (filters?.status) {
      query = query.eq("status", filters.status)
    }
    if (filters?.category) {
      query = query.eq("category", filters.category)
    }
    if (filters?.has_iot) {
      query = filters.has_iot ? query.not("iot_sensor_id", "is", null) : query.is("iot_sensor_id", null)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  }

  async getAssetById(assetId: string, userId: string): Promise<Asset | null> {
    const { data, error } = await this.supabase
      .from("assets")
      .select("*")
      .eq("id", assetId)
      .eq("user_id", userId)
      .single()

    if (error && error.code !== "PGRST116") throw error
    return data
  }

  async updateAsset(assetId: string, updates: Partial<Asset>, userId: string): Promise<Asset> {
    const { data, error } = await this.supabase
      .from("assets")
      .update(updates)
      .eq("id", assetId)
      .eq("user_id", userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async deleteAsset(assetId: string, userId: string): Promise<void> {
    const { error } = await this.supabase.from("assets").delete().eq("id", assetId).eq("user_id", userId)

    if (error) throw error
  }

  // Lifecycle Event Management
  async createLifecycleEvent(eventData: Partial<AssetLifecycleEvent>): Promise<AssetLifecycleEvent> {
    const { data, error } = await this.supabase
      .from("asset_lifecycle_events")
      .insert([
        {
          ...eventData,
          documentation: eventData.documentation || {},
          metadata: eventData.metadata || {},
        },
      ])
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getAssetLifecycleEvents(assetId: string, userId: string): Promise<AssetLifecycleEvent[]> {
    const { data, error } = await this.supabase
      .from("asset_lifecycle_events")
      .select("*")
      .eq("asset_id", assetId)
      .eq("user_id", userId)
      .order("event_date", { ascending: false })

    if (error) throw error
    return data || []
  }

  // Intelligence & Analytics
  async generateAssetInsights(assetId: string, userId: string): Promise<AssetIntelligenceInsight[]> {
    try {
      console.log("[v0] generateAssetInsights STEP 1: Starting with assetId:", assetId, "userId:", userId)

      const asset = await this.getAssetById(assetId, userId)
      console.log("[v0] generateAssetInsights STEP 2: Asset fetched:", asset ? asset.name : "null")

      if (!asset) throw new Error("Asset not found")

      console.log("[v0] generateAssetInsights STEP 3: Fetching lifecycle events")
      const lifecycleEvents = await this.getAssetLifecycleEvents(assetId, userId)
      console.log("[v0] generateAssetInsights STEP 4: Lifecycle events count:", lifecycleEvents?.length || 0)

      const insights: Partial<AssetIntelligenceInsight>[] = []

      // Predictive Maintenance Analysis
      console.log("[v0] generateAssetInsights STEP 5: Checking IoT sensor:", asset.iot_sensor_id)
      if (asset.iot_sensor_id) {
        console.log("[v0] generateAssetInsights STEP 5a: Running predictive maintenance")
        const maintenanceInsight = await this.analyzePredictiveMaintenance(asset, lifecycleEvents)
        console.log(
          "[v0] generateAssetInsights STEP 5b: Maintenance insight:",
          maintenanceInsight ? "generated" : "null",
        )
        if (maintenanceInsight) insights.push(maintenanceInsight)
      }

      // Cost Optimization Analysis
      console.log("[v0] generateAssetInsights STEP 6: Running cost optimization")
      const costInsight = await this.analyzeCostOptimization(asset, lifecycleEvents)
      console.log("[v0] generateAssetInsights STEP 6b: Cost insight:", costInsight ? "generated" : "null")
      if (costInsight) insights.push(costInsight)

      // Utilization Analysis
      console.log("[v0] generateAssetInsights STEP 7: Running utilization analysis")
      const utilizationInsight = await this.analyzeUtilization(asset, lifecycleEvents)
      console.log("[v0] generateAssetInsights STEP 7b: Utilization insight:", utilizationInsight ? "generated" : "null")
      if (utilizationInsight) insights.push(utilizationInsight)

      // ESG Impact Analysis
      console.log("[v0] generateAssetInsights STEP 8: Running ESG analysis")
      const esgInsight = await this.analyzeESGImpact(asset, lifecycleEvents)
      console.log("[v0] generateAssetInsights STEP 8b: ESG insight:", esgInsight ? "generated" : "null")
      if (esgInsight) insights.push(esgInsight)

      // Save insights to database
      console.log("[v0] generateAssetInsights STEP 9: Saving", insights.length, "insights to database")
      const savedInsights: AssetIntelligenceInsight[] = []
      for (const insight of insights) {
        const { data, error } = await this.supabase
          .from("asset_intelligence_insights")
          .insert([
            {
              ...insight,
              asset_id: assetId,
              user_id: userId,
            },
          ])
          .select()
          .single()

        if (!error) savedInsights.push(data)
      }

      console.log("[v0] generateAssetInsights STEP 10: Complete. Saved:", savedInsights.length, "insights")
      return savedInsights
    } catch (error) {
      console.error("[v0] generateAssetInsights ERROR at unknown step:", error)
      throw error
    }
  }

  async getAssetInsights(assetId: string, userId: string): Promise<AssetIntelligenceInsight[]> {
    const { data, error } = await this.supabase
      .from("asset_intelligence_insights")
      .select("*")
      .eq("asset_id", assetId)
      .eq("user_id", userId)
      .eq("status", "active")
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  }

  // AI-Powered Analysis Methods
  private async analyzePredictiveMaintenance(
    asset: Asset,
    events: AssetLifecycleEvent[],
  ): Promise<Partial<AssetIntelligenceInsight> | null> {
    if (!Array.isArray(events)) {
      console.error("[v0] analyzePredictiveMaintenance: events is not an array:", typeof events, events)
      return null
    }

    const maintenanceEvents = events.filter((e) => {
      if (!e || typeof e !== "object") {
        console.error("[v0] Invalid event in filter:", e)
        return false
      }
      return e.event_type === "maintenance" || e.event_type === "repair"
    })

    if (maintenanceEvents.length < 2) return null

    // Calculate maintenance intervals
    const intervals = []
    for (let i = 1; i < maintenanceEvents.length; i++) {
      const current = new Date(maintenanceEvents[i].event_date)
      const previous = new Date(maintenanceEvents[i - 1].event_date)
      intervals.push(Math.abs(current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24))
    }

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
    const lastMaintenance = new Date(maintenanceEvents[0].event_date)
    const daysSinceLastMaintenance = (Date.now() - lastMaintenance.getTime()) / (1000 * 60 * 60 * 24)

    const nextMaintenanceDue = avgInterval - daysSinceLastMaintenance
    const urgency = nextMaintenanceDue <= 7 ? "high" : nextMaintenanceDue <= 30 ? "medium" : "low"

    return {
      insight_type: "predictive_maintenance",
      confidence_score: 0.85,
      priority: urgency as any,
      insight_data: {
        average_maintenance_interval_days: Math.round(avgInterval),
        days_since_last_maintenance: Math.round(daysSinceLastMaintenance),
        predicted_next_maintenance_days: Math.round(nextMaintenanceDue),
        maintenance_history_count: maintenanceEvents.length,
      },
      recommendations: [
        {
          action: nextMaintenanceDue <= 0 ? "Schedule immediate maintenance" : "Schedule preventive maintenance",
          priority: urgency,
          estimated_cost: asset.current_value ? asset.current_value * 0.05 : null,
        },
      ],
    }
  }

  private async analyzeCostOptimization(
    asset: Asset,
    events: AssetLifecycleEvent[],
  ): Promise<Partial<AssetIntelligenceInsight> | null> {
    if (!Array.isArray(events)) {
      console.error("[v0] analyzeCostOptimization: events is not an array:", typeof events, events)
      return null
    }

    const costEvents = events.filter((e) => {
      if (!e || typeof e !== "object") {
        console.error("[v0] Invalid event in filter:", e)
        return false
      }
      return e.cost && e.cost > 0
    })

    if (costEvents.length === 0) return null

    const totalCosts = costEvents.reduce((sum, e) => sum + (e.cost || 0), 0)
    const avgMonthlyCost =
      totalCosts / Math.max(1, (Date.now() - new Date(asset.created_at || "").getTime()) / (1000 * 60 * 60 * 24 * 30))

    const recommendations = []
    if (avgMonthlyCost > (asset.current_value || 0) * 0.1) {
      recommendations.push({
        action: "Consider asset replacement - high maintenance costs",
        priority: "high",
        potential_savings: avgMonthlyCost * 12 * 0.3,
      })
    }

    return {
      insight_type: "cost_optimization",
      confidence_score: 0.75,
      priority: "medium",
      insight_data: {
        total_maintenance_costs: totalCosts,
        average_monthly_cost: avgMonthlyCost,
        cost_to_value_ratio: (asset.current_value || 0) > 0 ? totalCosts / asset.current_value : 0,
      },
      recommendations,
    }
  }

  private async analyzeUtilization(
    asset: Asset,
    events: AssetLifecycleEvent[],
  ): Promise<Partial<AssetIntelligenceInsight> | null> {
    if (!Array.isArray(events)) {
      console.error("[v0] analyzeUtilization: events is not an array:", typeof events, events)
      return null
    }

    const deploymentEvents = events.filter((e) => {
      if (!e || typeof e !== "object") {
        console.error("[v0] Invalid event in filter:", e)
        return false
      }
      return e.event_type === "deployed" || e.event_type === "moved"
    })

    const maintenanceEvents = events.filter((e) => {
      if (!e || typeof e !== "object") {
        console.error("[v0] Invalid event in filter:", e)
        return false
      }
      return e.event_type === "maintenance"
    })

    const totalDays = (Date.now() - new Date(asset.created_at || "").getTime()) / (1000 * 60 * 60 * 24)
    const maintenanceDays = maintenanceEvents.length * 2 // Assume 2 days per maintenance
    const utilizationRate = Math.max(0, (totalDays - maintenanceDays) / totalDays)

    return {
      insight_type: "utilization_analysis",
      confidence_score: 0.7,
      priority: utilizationRate < 0.5 ? "high" : "low",
      insight_data: {
        utilization_rate: utilizationRate,
        total_deployments: deploymentEvents.length,
        downtime_days: maintenanceDays,
        active_days: totalDays - maintenanceDays,
      },
      recommendations:
        utilizationRate < 0.5
          ? [
              {
                action: "Optimize asset utilization - currently underutilized",
                priority: "medium",
                potential_value: (asset.current_value || 0) * 0.2,
              },
            ]
          : [],
    }
  }

  private async analyzeESGImpact(
    asset: Asset,
    events: AssetLifecycleEvent[],
  ): Promise<Partial<AssetIntelligenceInsight> | null> {
    const esgScore = this.calculateESGScore(asset, events)

    return {
      insight_type: "esg_impact",
      confidence_score: 0.65,
      priority: esgScore < 50 ? "high" : "low",
      insight_data: {
        esg_score: esgScore,
        carbon_footprint_estimate: this.estimateCarbonFootprint(asset),
        circular_economy_score: this.calculateCircularEconomyScore(asset, events),
        sustainability_rating:
          esgScore >= 80 ? "excellent" : esgScore >= 60 ? "good" : esgScore >= 40 ? "fair" : "poor",
      },
      recommendations:
        esgScore < 60
          ? [
              {
                action: "Implement sustainability improvements",
                priority: "medium",
                impact: "Improve ESG compliance and reporting",
              },
            ]
          : [],
    }
  }

  // Utility Methods
  private generateAssetId(): string {
    return `AST-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
  }

  private generateQRCode(): string {
    return `QR-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`
  }

  private calculateESGScore(asset: Asset, events: AssetLifecycleEvent[]): number {
    let score = 50 // Base score

    if (!Array.isArray(events)) {
      console.error("[v0] calculateESGScore: events is not an array:", typeof events, events)
      return score
    }

    // Environmental factors
    if (asset.esg_metrics?.energy_efficiency) score += 15
    if (asset.esg_metrics?.recyclable_materials) score += 10
    if (asset.esg_metrics?.carbon_neutral) score += 20

    // Social factors
    const maintenanceEvents = events.filter((e) => {
      if (!e || typeof e !== "object") return false
      return e.event_type === "maintenance"
    })
    if (maintenanceEvents.length > 0) score += 10 // Regular maintenance shows responsibility

    // Governance factors
    if (asset.compliance_data?.certifications) score += 15
    const hasComplianceCheck = events.some((e) => {
      if (!e || typeof e !== "object") return false
      return e.event_type === "compliance_check"
    })
    if (hasComplianceCheck) score += 10

    return Math.min(100, Math.max(0, score))
  }

  private estimateCarbonFootprint(asset: Asset): number {
    // Simplified carbon footprint estimation based on asset type and age
    const baseFootprint = {
      equipment: 500,
      vehicle: 2000,
      container: 100,
      device: 50,
      infrastructure: 1000,
      inventory: 10,
    }

    const assetAge = (Date.now() - new Date(asset.created_at || "").getTime()) / (1000 * 60 * 60 * 24 * 365)
    return (baseFootprint[asset.asset_type] || 100) * Math.max(1, assetAge)
  }

  private calculateCircularEconomyScore(asset: Asset, events: AssetLifecycleEvent[]): number {
    let score = 0

    if (!Array.isArray(events)) {
      console.error("[v0] calculateCircularEconomyScore: events is not an array:", typeof events, events)
      return score
    }

    // Reuse events
    const reuseEvents = events.filter((e) => {
      if (!e || typeof e !== "object") return false
      return e.event_type === "deployed" || e.event_type === "moved"
    })
    score += Math.min(40, reuseEvents.length * 5)

    // Maintenance extends lifecycle
    const maintenanceEvents = events.filter((e) => {
      if (!e || typeof e !== "object") return false
      return e.event_type === "maintenance" || e.event_type === "repair"
    })
    score += Math.min(30, maintenanceEvents.length * 3)

    // Material recyclability
    if (asset.specifications?.recyclable_percentage) {
      score += (asset.specifications.recyclable_percentage / 100) * 30
    }

    return Math.min(100, score)
  }

  // Integration with existing systems
  async executeAssetWorkflow(workflowId: string, assetId: string, userId: string): Promise<any> {
    const asset = await this.getAssetById(assetId, userId)
    if (!asset) throw new Error("Asset not found")

    // Execute workflow with asset context
    const context = {
      asset,
      lifecycle_events: await this.getAssetLifecycleEvents(assetId, userId),
      insights: await this.getAssetInsights(assetId, userId),
    }

    return await this.workflowSystem.executeWorkflow(workflowId, context, userId)
  }

  async searchAssetsByEmbedding(query: string, userId: string): Promise<Asset[]> {
    // Use embedding system to find similar assets based on descriptions
    const assets = await this.getAssets(userId)

    // Create embeddings for asset descriptions and search
    const assetTexts = assets.map((a) => `${a.name} ${a.description || ""} ${a.category || ""}`)

    // This would use the embedding system to find similar assets
    // For now, return simple text search
    return assets.filter(
      (a) =>
        a.name.toLowerCase().includes(query.toLowerCase()) ||
        (a.description && a.description.toLowerCase().includes(query.toLowerCase())),
    )
  }
}
