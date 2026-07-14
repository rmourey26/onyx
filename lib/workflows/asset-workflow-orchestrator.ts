import { WorkflowSystem, type WorkflowStep, type WorkflowContext } from "./workflow-system"
import { AssetIntelligenceSystem } from "../asset-intelligence/asset-system"
import { AgentSystem } from "../ai/agent-system"
import { EmbeddingSystem } from "../embeddings/embedding-system"
import { createClient } from "@supabase/supabase-js"

export interface AssetWorkflowTrigger {
  id: string
  name: string
  description: string
  trigger_type: "insight_generated" | "threshold_exceeded" | "schedule" | "manual" | "agent_recommendation"
  conditions: {
    asset_types?: string[]
    insight_types?: string[]
    priority_levels?: string[]
    threshold_field?: string
    threshold_operator?: ">" | "<" | ">=" | "<=" | "==" | "!="
    threshold_value?: number
    schedule_cron?: string
  }
  workflow_template_id: string
  auto_execute: boolean
  requires_approval: boolean
  created_by_agent?: string
}

export interface AgenticWorkflowStep extends WorkflowStep {
  agent_decision_point?: {
    decision_agent_id: string
    decision_criteria: string[]
    fallback_action: "continue" | "pause" | "abort" | "retry"
    max_decision_time_ms: number
  }
  adaptive_parameters?: {
    learning_enabled: boolean
    performance_metrics: string[]
    optimization_target: "speed" | "accuracy" | "cost" | "quality"
  }
}

export interface WorkflowOrchestrationContext extends WorkflowContext {
  asset_context?: {
    target_assets: string[]
    assets: any[]
    asset_insights: any[]
    lifecycle_events: any[]
    related_workflows: string[]
  }
  agent_decisions: Record<string, any>
  performance_metrics: {
    execution_time: number
    accuracy_score?: number
    cost_impact?: number
    user_satisfaction?: number
  }
  learning_data: {
    decision_outcomes: any[]
    optimization_suggestions: any[]
  }
}

export class AssetWorkflowOrchestrator extends WorkflowSystem {
  private assetSystem: AssetIntelligenceSystem
  private agentSystem: AgentSystem
  private embeddingSystem: EmbeddingSystem
  private supabase: any
  private activeTriggers: Map<string, AssetWorkflowTrigger> = new Map()
  private runningWorkflows: Map<string, WorkflowOrchestrationContext> = new Map()

  constructor(supabaseUrl?: string, supabaseKey?: string) {
    const url = supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = supabaseKey || process.env.SUPABASE_SERVIC_ROLE_KEY!

    super(url, key)
    this.assetSystem = new AssetIntelligenceSystem(createClient(url, key))
    this.agentSystem = new AgentSystem(url, key)
    this.embeddingSystem = new EmbeddingSystem(url, key)
    this.supabase = createClient(url, key)
    this.initializeOrchestrator()
  }

  private async initializeOrchestrator() {
    // Load active triggers from database
    await this.loadActiveTriggers()

    // Start monitoring for trigger conditions
    this.startTriggerMonitoring()

    // Initialize learning system
    this.initializeLearningSystem()
  }

  async createAssetWorkflowTemplate(template: {
    name: string
    description: string
    category: "maintenance" | "optimization" | "compliance" | "analytics" | "emergency"
    steps: AgenticWorkflowStep[]
    triggers: AssetWorkflowTrigger[]
    success_criteria: any[]
    user_id: string
  }) {
    const workflowTemplate = await this.createWorkflow({
      name: template.name,
      description: template.description,
      steps: template.steps,
      user_id: template.user_id,
      category: template.category,
      is_template: true,
      metadata: {
        success_criteria: template.success_criteria,
        asset_specific: true,
        agentic: true,
      },
    })

    // Register triggers
    for (const trigger of template.triggers) {
      await this.registerWorkflowTrigger({
        ...trigger,
        workflow_template_id: workflowTemplate.id,
      })
    }

    return workflowTemplate
  }

  async registerWorkflowTrigger(trigger: AssetWorkflowTrigger) {
    const { data, error } = await this.supabase.from("asset_workflow_triggers").insert(trigger).select().single()

    if (error) throw error

    this.activeTriggers.set(data.id, data)
    return data
  }

  async executeAgenticWorkflow(
    workflowId: string,
    userId: string,
    input: Record<string, any> = {},
    orchestrationOptions: {
      autonomous_mode?: boolean
      learning_enabled?: boolean
      max_execution_time?: number
      approval_required?: boolean
    } = {},
  ): Promise<any> {
    const startTime = Date.now()

    try {
      // Create enhanced orchestration context
      const context: WorkflowOrchestrationContext = {
        workflow_id: workflowId,
        run_id: `run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: userId,
        input,
        results: {},
        current_step: "",
        completed_steps: [],
        agent_decisions: {},
        performance_metrics: {
          execution_time: 0,
        },
        learning_data: {
          decision_outcomes: [],
          optimization_suggestions: [],
        },
      }

      // Load asset context if applicable
      if (input.asset_ids) {
        context.asset_context = await this.loadAssetContext(input.asset_ids, userId)
      }

      this.runningWorkflows.set(context.run_id, context)

      // Get workflow with agentic steps
      const workflow = await this.getWorkflow(workflowId, userId)
      const agenticSteps = workflow.steps as AgenticWorkflowStep[]

      // Execute workflow with autonomous decision-making
      const result = await this.executeAgenticWorkflowSteps(agenticSteps, context, orchestrationOptions)

      // Calculate final performance metrics
      context.performance_metrics.execution_time = Date.now() - startTime

      // Store learning data if enabled
      if (orchestrationOptions.learning_enabled) {
        await this.storeLearningData(context)
      }

      // Clean up
      this.runningWorkflows.delete(context.run_id)

      return {
        ...result,
        orchestration_metrics: context.performance_metrics,
        agent_decisions: context.agent_decisions,
        learning_insights: orchestrationOptions.learning_enabled ? context.learning_data : undefined,
      }
    } catch (error) {
      console.error("Agentic workflow execution failed:", error)
      throw error
    }
  }

  private async executeAgenticWorkflowSteps(
    steps: AgenticWorkflowStep[],
    context: WorkflowOrchestrationContext,
    options: any,
  ): Promise<any> {
    const firstStep = steps.find((step) => !steps.some((s) => s.next_steps.includes(step.id)))
    if (!firstStep) throw new Error("No starting step found")

    context.current_step = firstStep.id
    return await this.executeAgenticStep(steps, context, options)
  }

  private async executeAgenticStep(
    steps: AgenticWorkflowStep[],
    context: WorkflowOrchestrationContext,
    options: any,
  ): Promise<any> {
    const currentStep = steps.find((step) => step.id === context.current_step)
    if (!currentStep) throw new Error(`Step not found: ${context.current_step}`)

    try {
      // Pre-step agent decision point
      if (currentStep.agent_decision_point) {
        const decision = await this.executeAgentDecision(currentStep, context)
        context.agent_decisions[currentStep.id] = decision

        if (decision.action === "skip") {
          context.completed_steps.push(currentStep.id)
          return this.proceedToNextStep(steps, currentStep, context, options)
        } else if (decision.action === "abort") {
          throw new Error(`Workflow aborted by agent decision: ${decision.reason}`)
        } else if (decision.action === "modify") {
          // Apply agent modifications to step configuration
          Object.assign(currentStep.config, decision.modifications)
        }
      }

      // Execute the step with potential adaptive parameters
      let stepResult: any

      if (currentStep.adaptive_parameters?.learning_enabled) {
        stepResult = await this.executeAdaptiveStep(currentStep, context)
      } else {
        stepResult = await this.executeStandardStep(currentStep, context)
      }

      // Store step result and performance data
      context.results[currentStep.id] = stepResult
      context.completed_steps.push(currentStep.id)

      // Post-step learning and optimization
      if (currentStep.adaptive_parameters?.learning_enabled) {
        await this.recordStepPerformance(currentStep, stepResult, context)
      }

      // Proceed to next step
      return this.proceedToNextStep(steps, currentStep, context, options)
    } catch (error) {
      console.error(`Error in agentic step ${currentStep.id}:`, error)

      // Attempt autonomous error recovery
      if (options.autonomous_mode) {
        const recovery = await this.attemptAutonomousRecovery(currentStep, error, context)
        if (recovery.success) {
          return this.executeAgenticStep(steps, context, options)
        }
      }

      throw error
    }
  }

  private async executeAgentDecision(step: AgenticWorkflowStep, context: WorkflowOrchestrationContext): Promise<any> {
    const { decision_agent_id, decision_criteria, max_decision_time_ms } = step.agent_decision_point!

    const decisionPrompt = `
    You are an autonomous workflow orchestration agent. Analyze the current workflow context and make a decision about the next step.
    
    Current Step: ${step.name}
    Step Description: ${step.description}
    
    Context:
    - Workflow Results So Far: ${JSON.stringify(context.results, null, 2)}
    - Asset Context: ${JSON.stringify(context.asset_context, null, 2)}
    - Previous Decisions: ${JSON.stringify(context.agent_decisions, null, 2)}
    
    Decision Criteria:
    ${decision_criteria.map((criteria) => `- ${criteria}`).join("\n")}
    
    Available Actions:
    - continue: Proceed with the step as configured
    - skip: Skip this step and move to the next
    - modify: Modify step parameters before execution
    - abort: Stop the workflow execution
    - retry: Retry a previous step
    
    Respond with a JSON object containing:
    {
      "action": "continue|skip|modify|abort|retry",
      "reason": "explanation for the decision",
      "confidence": 0.0-1.0,
      "modifications": {} // only if action is "modify"
    }
    `

    try {
      const decision = await Promise.race([
        this.agentSystem.executeAgent(decision_agent_id, decisionPrompt, { maxIterations: 1 }),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Decision timeout")), max_decision_time_ms)),
      ])

      return typeof decision === "string" ? JSON.parse(decision) : decision
    } catch (error) {
      console.warn("Agent decision failed, using fallback:", error)
      return {
        action: step.agent_decision_point!.fallback_action,
        reason: "Agent decision failed, using fallback action",
        confidence: 0.5,
      }
    }
  }

  private async executeAdaptiveStep(step: AgenticWorkflowStep, context: WorkflowOrchestrationContext): Promise<any> {
    const { optimization_target, performance_metrics } = step.adaptive_parameters!

    // Load historical performance data for this step
    const historicalData = await this.getStepPerformanceHistory(step.id, context.user_id)

    // Optimize step parameters based on historical data and target
    if (historicalData.length > 0) {
      const optimizedConfig = await this.optimizeStepParameters(step.config, historicalData, optimization_target)
      step.config = { ...step.config, ...optimizedConfig }
    }

    // Execute the step
    const startTime = Date.now()
    const result = await this.executeStandardStep(step, context)
    const executionTime = Date.now() - startTime

    // Record performance metrics
    const performanceData = {
      step_id: step.id,
      execution_time: executionTime,
      success: true,
      optimization_target,
      config_used: step.config,
      result_quality: await this.assessResultQuality(result, step),
    }

    context.learning_data.decision_outcomes.push(performanceData)

    return result
  }

  private async executeStandardStep(step: AgenticWorkflowStep, context: WorkflowOrchestrationContext): Promise<any> {
    // Enhanced step execution with asset-specific logic
    switch (step.type) {
      case "agent":
        return this.executeAssetAgentStep(step, context)
      case "asset_analysis":
        return this.executeAssetAnalysisStep(step, context)
      case "maintenance_scheduling":
        return this.executeMaintenanceSchedulingStep(step, context)
      case "compliance_check":
        return this.executeComplianceCheckStep(step, context)
      case "cost_optimization":
        return this.executeCostOptimizationStep(step, context)
      default:
        // Fall back to parent class implementation
        return super.executeWorkflowStep([step], context as WorkflowContext)
    }
  }

  private async executeAssetAgentStep(step: AgenticWorkflowStep, context: WorkflowOrchestrationContext): Promise<any> {
    const { agent_config, target_assets } = step.config
    const assets = target_assets || context.asset_context?.assets || []

    const results = []
    for (const asset of assets) {
      const assetId = asset.asset_id
      const assetName = asset.name

      const agentPrompt = `
      Analyze asset: ${assetName} (${assetId})
      Type: ${asset.asset_type}
      Status: ${asset.status}
      Current Value: $${asset.current_value}
      
      Task: ${step.description}
      
      Provide specific recommendations and actions for this asset.
      `

      const agentResult = await this.agentSystem.executeAgent(agent_config.agent_id, agentPrompt, agent_config.options)

      results.push({
        asset_id: assetId,
        asset_name: assetName,
        analysis: agentResult,
      })
    }

    return { asset_analyses: results }
  }

  private async executeAssetAnalysisStep(
    step: AgenticWorkflowStep,
    context: WorkflowOrchestrationContext,
  ): Promise<any> {
    const { analysis_type, target_assets } = step.config
    const assets = target_assets || context.asset_context?.assets || []

    const results = []
    for (const asset of assets) {
      const assetId = asset.asset_id
      const insights = await this.assetSystem.generateAssetInsights(assetId, context.user_id)
      results.push({
        asset_id: assetId,
        insights: insights.filter((insight) => !analysis_type || insight.insight_type === analysis_type),
      })
    }

    return { analysis_results: results }
  }

  private async executeMaintenanceSchedulingStep(
    step: AgenticWorkflowStep,
    context: WorkflowOrchestrationContext,
  ): Promise<any> {
    const { scheduling_criteria, target_assets } = step.config
    const assets = target_assets || context.asset_context?.assets || []

    const maintenanceSchedule = []
    for (const asset of assets) {
      const assetId = asset.asset_id
      const insights = await this.assetSystem.getAssetInsights(assetId, context.user_id)

      const maintenanceInsights = insights.filter((i) => i.insight_type === "predictive_maintenance")

      for (const insight of maintenanceInsights) {
        if (insight.priority === "high" || insight.priority === "critical") {
          maintenanceSchedule.push({
            asset_id: assetId,
            asset_name: asset.name,
            priority: insight.priority,
            recommended_date: new Date(
              Date.now() + insight.insight_data.predicted_next_maintenance_days * 24 * 60 * 60 * 1000,
            ),
            estimated_cost: insight.recommendations[0]?.estimated_cost,
            description: insight.recommendations[0]?.action,
          })
        }
      }
    }

    return { maintenance_schedule: maintenanceSchedule }
  }

  private async executeComplianceCheckStep(
    step: AgenticWorkflowStep,
    context: WorkflowOrchestrationContext,
  ): Promise<any> {
    const { compliance_standards, target_assets } = step.config
    const assets = target_assets || context.asset_context?.assets || []

    const complianceResults = []
    for (const asset of assets) {
      const complianceScore = this.calculateComplianceScore(asset, compliance_standards)
      const issues = this.identifyComplianceIssues(asset, compliance_standards)

      complianceResults.push({
        asset_id: asset.asset_id,
        asset_name: asset.name,
        compliance_score: complianceScore,
        issues: issues,
        status: complianceScore >= 80 ? "compliant" : complianceScore >= 60 ? "warning" : "non_compliant",
      })
    }

    return { compliance_results: complianceResults }
  }

  private async executeCostOptimizationStep(
    step: AgenticWorkflowStep,
    context: WorkflowOrchestrationContext,
  ): Promise<any> {
    const { optimization_targets, target_assets } = step.config
    const assets = target_assets || context.asset_context?.assets || []

    const optimizationResults = []
    for (const asset of assets) {
      const assetId = asset.asset_id
      const insights = await this.assetSystem.getAssetInsights(assetId, context.user_id)
      const costInsights = insights.filter((i) => i.insight_type === "cost_optimization")

      for (const insight of costInsights) {
        optimizationResults.push({
          asset_id: assetId,
          optimization_type: insight.insight_data.optimization_area,
          potential_savings: insight.insight_data.potential_savings,
          recommendations: insight.recommendations,
          priority: insight.priority,
        })
      }
    }

    return { optimization_opportunities: optimizationResults }
  }

  private async attemptAutonomousRecovery(
    step: AgenticWorkflowStep,
    error: any,
    context: WorkflowOrchestrationContext,
  ): Promise<{ success: boolean; action?: string }> {
    const recoveryPrompt = `
    An error occurred during workflow execution. Analyze the error and suggest a recovery action.
    
    Step: ${step.name}
    Error: ${error.message}
    Context: ${JSON.stringify(context.results, null, 2)}
    
    Available recovery actions:
    - retry: Retry the step with same parameters
    - modify_and_retry: Modify step parameters and retry
    - skip: Skip this step and continue
    - alternative_approach: Use a different approach for this step
    
    Respond with JSON: {"action": "...", "modifications": {}, "reason": "..."}
    `

    try {
      const recoveryDecision = await this.agentSystem.executeAgent("error-recovery-agent", recoveryPrompt, {
        maxIterations: 1,
      })

      const decision = typeof recoveryDecision === "string" ? JSON.parse(recoveryDecision) : recoveryDecision

      switch (decision.action) {
        case "retry":
          return { success: true, action: "retry" }
        case "modify_and_retry":
          Object.assign(step.config, decision.modifications)
          return { success: true, action: "retry" }
        case "skip":
          context.completed_steps.push(step.id)
          return { success: true, action: "skip" }
        default:
          return { success: false }
      }
    } catch (recoveryError) {
      console.error("Autonomous recovery failed:", recoveryError)
      return { success: false }
    }
  }

  private startTriggerMonitoring() {
    // Monitor for asset insights that should trigger workflows
    setInterval(async () => {
      try {
        await this.checkInsightTriggers()
        await this.checkThresholdTriggers()
        await this.checkScheduledTriggers()
      } catch (error) {
        console.error("Trigger monitoring error:", error)
      }
    }, 30000) // Check every 30 seconds
  }

  private async checkInsightTriggers() {
    for (const [triggerId, trigger] of this.activeTriggers) {
      if (trigger.trigger_type !== "insight_generated") continue

      // Check for new insights that match trigger conditions
      const { data: recentInsights } = await this.supabase
        .from("asset_intelligence_insights")
        .select("*")
        .gte("created_at", new Date(Date.now() - 60000).toISOString()) // Last minute
        .in("insight_type", trigger.conditions.insight_types || [])
        .in("priority", trigger.conditions.priority_levels || [])

      for (const insight of recentInsights || []) {
        if (trigger.auto_execute) {
          await this.executeTriggeredWorkflow(trigger, { insight })
        } else {
          await this.notifyWorkflowTrigger(trigger, { insight })
        }
      }
    }
  }

  private async executeTriggeredWorkflow(trigger: AssetWorkflowTrigger, context: any) {
    try {
      console.log(`Auto-executing workflow for trigger: ${trigger.name}`)

      await this.executeAgenticWorkflow(
        trigger.workflow_template_id,
        context.insight?.user_id || "system",
        {
          trigger_id: trigger.id,
          trigger_context: context,
        },
        {
          autonomous_mode: true,
          learning_enabled: true,
        },
      )
    } catch (error) {
      console.error(`Failed to execute triggered workflow: ${trigger.name}`, error)
    }
  }

  private async loadAssetContext(assetIds: string[], userId: string) {
    const assets = await Promise.all(assetIds.map((id) => this.assetSystem.getAssetById(id, userId)))

    const insights = await Promise.all(assetIds.map((id) => this.assetSystem.getAssetInsights(id, userId)))

    // Load lifecycle events for each asset
    const lifecycleEvents = await Promise.all(
      assetIds.map(async (id) => {
        const { data } = await this.supabase
          .from("asset_lifecycle_events")
          .select("*")
          .eq("asset_id", id)
          .eq("user_id", userId)
          .order("event_date", { ascending: false })
          .limit(10)
        return { asset_id: id, events: data || [] }
      }),
    )

    // Load related workflow history
    const { data: relatedWorkflows } = await this.supabase
      .from("workflow_runs")
      .select("id, workflow_id, status, created_at")
      .contains("input", { asset_ids: assetIds })
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5)

    return {
      target_assets: assetIds,
      assets: assets.filter(Boolean),
      asset_insights: insights.flat(),
      lifecycle_events: lifecycleEvents,
      related_workflows: relatedWorkflows || [],
    }
  }

  private async loadActiveTriggers() {
    const { data: triggers } = await this.supabase.from("asset_workflow_triggers").select("*").eq("active", true)

    for (const trigger of triggers || []) {
      this.activeTriggers.set(trigger.id, trigger)
    }
  }

  private calculateComplianceScore(asset: any, standards: string[]): number {
    // Simplified compliance scoring logic
    let score = 100

    if (!asset.compliance_data.certifications) score -= 20
    if (!asset.maintenance_schedule.length) score -= 15
    if (asset.status === "maintenance") score -= 10
    if (!asset.esg_metrics.energy_efficiency) score -= 15

    return Math.max(0, score)
  }

  private identifyComplianceIssues(asset: any, standards: string[]): string[] {
    const issues = []

    if (!asset.compliance_data.certifications) {
      issues.push("Missing required certifications")
    }
    if (!asset.maintenance_schedule.length) {
      issues.push("No maintenance schedule defined")
    }
    if (asset.status === "maintenance") {
      issues.push("Asset currently under maintenance")
    }

    return issues
  }

  private async proceedToNextStep(
    steps: AgenticWorkflowStep[],
    currentStep: AgenticWorkflowStep,
    context: WorkflowOrchestrationContext,
    options: any,
  ): Promise<any> {
    const nextStepId = this.findNextStep(currentStep, context as WorkflowContext)

    if (nextStepId) {
      context.current_step = nextStepId
      return this.executeAgenticStep(steps, context, options)
    }

    return context.results
  }

  private async storeLearningData(context: WorkflowOrchestrationContext) {
    await this.supabase.from("workflow_learning_data").insert({
      workflow_id: context.workflow_id,
      run_id: context.run_id,
      user_id: context.user_id,
      decision_outcomes: context.learning_data.decision_outcomes,
      performance_metrics: context.performance_metrics,
      optimization_suggestions: context.learning_data.optimization_suggestions,
    })
  }

  private async getStepPerformanceHistory(stepId: string, userId: string) {
    const { data } = await this.supabase
      .from("workflow_learning_data")
      .select("decision_outcomes")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50)

    return (data || [])
      .flatMap((record) => record.decision_outcomes || [])
      .filter((outcome) => outcome.step_id === stepId)
  }

  private async optimizeStepParameters(
    currentConfig: any,
    historicalData: any[],
    optimizationTarget: string,
  ): Promise<any> {
    // Simplified parameter optimization based on historical performance
    const optimizations: any = {}

    if (optimizationTarget === "speed" && historicalData.length > 0) {
      const avgExecutionTime =
        historicalData.reduce((sum, data) => sum + data.execution_time, 0) / historicalData.length
      if (avgExecutionTime > 5000) {
        // If average > 5 seconds
        optimizations.timeout_ms = Math.max(1000, currentConfig.timeout_ms * 0.8)
      }
    }

    return optimizations
  }

  private async assessResultQuality(result: any, step: AgenticWorkflowStep): Promise<number> {
    // Simplified result quality assessment
    if (!result) return 0

    if (typeof result === "object" && result.success === false) return 0.2
    if (typeof result === "object" && result.error) return 0.3
    if (Array.isArray(result) && result.length === 0) return 0.5

    return 0.8 // Default good quality score
  }

  private initializeLearningSystem() {
    // Initialize the learning system for continuous improvement
    console.log("Asset Workflow Orchestrator learning system initialized")
  }

  private async checkThresholdTriggers() {
    // Implementation for threshold-based triggers
  }

  private async checkScheduledTriggers() {
    // Implementation for scheduled triggers
  }

  private async notifyWorkflowTrigger(trigger: AssetWorkflowTrigger, context: any) {
    // Implementation for workflow trigger notifications
  }
}
