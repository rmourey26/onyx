"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { WorkflowSystem } from "@/lib/workflows/workflow-system"
import { revalidatePath } from "next/cache"
import { saveToLearningLayer } from "./learning-layer-actions"

// Initialize the workflow system
const getWorkflowSystem = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return new WorkflowSystem(supabaseUrl, supabaseKey)
}

const validateWorkflowData = (data: any) => {
  if (!data.name || typeof data.name !== "string") {
    throw new Error("Workflow name is required and must be a string")
  }
  if (!data.steps || !Array.isArray(data.steps)) {
    throw new Error("Workflow steps are required and must be an array")
  }
  if (!data.user_id || typeof data.user_id !== "string") {
    throw new Error("User ID is required and must be a string")
  }
  return true
}

// Create a new workflow
export async function createWorkflow(data: {
  name: string
  description?: string
  steps: any[]
  trigger_type?: string
  trigger_config?: Record<string, any>
  is_active?: boolean
  user_id: string
}) {
  try {
    console.log("[v0] createWorkflow called with data:", JSON.stringify(data, null, 2))

    const supabase = await createServerSupabaseClient()

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    const workflowData = {
      name: data.name,
      description: data.description || null,
      steps: data.steps,
      trigger_type: data.trigger_type || null,
      trigger_config: data.trigger_config || {},
      is_active: data.is_active ?? true,
      user_id: user.id,
    }

    console.log("[v0] Prepared workflow data:", JSON.stringify(workflowData, null, 2))

    try {
      validateWorkflowData(workflowData)
      console.log("[v0] Manual validation successful")
    } catch (validationError) {
      console.error("[v0] Manual validation failed:", validationError)
      throw validationError
    }

    // Create the workflow using WorkflowSystem
    const workflowSystem = getWorkflowSystem()
    const workflow = await workflowSystem.createWorkflow(workflowData)

    revalidatePath("/ai-suite")
    return { success: true, data: workflow }
  } catch (error) {
    console.error("[v0] Error creating workflow:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create workflow",
    }
  }
}

// Update an existing workflow
export async function updateWorkflow(data: {
  id: string
  name: string
  description?: string
  steps: any[]
  trigger_type?: string
  trigger_config?: Record<string, any>
  is_active?: boolean
  user_id: string
}) {
  try {
    const supabase = await createServerSupabaseClient()

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    // Ensure the user owns the workflow
    if (data.user_id !== user.id) {
      return { success: false, error: "Unauthorized" }
    }

    validateWorkflowData(data)

    // Update the workflow using WorkflowSystem
    const workflowSystem = getWorkflowSystem()
    const workflow = await workflowSystem.updateWorkflow(data.id, user.id, data)

    revalidatePath("/ai-suite")
    return { success: true, data: workflow }
  } catch (error) {
    console.error("Error updating workflow:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update workflow",
    }
  }
}

// Delete a workflow
export async function deleteWorkflow(workflowId: string) {
  try {
    const supabase = await createServerSupabaseClient()

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    // Verify ownership before deletion
    const { data: workflow, error: fetchError } = await supabase
      .from("ai_workflows")
      .select("user_id")
      .eq("id", workflowId)
      .single()

    if (fetchError || !workflow) {
      return { success: false, error: "Workflow not found" }
    }

    if (workflow.user_id !== user.id) {
      return { success: false, error: "Unauthorized" }
    }

    // Delete the workflow using WorkflowSystem
    const workflowSystem = getWorkflowSystem()
    await workflowSystem.deleteWorkflow(workflowId, user.id)

    revalidatePath("/ai-suite")
    return { success: true }
  } catch (error) {
    console.error("Error deleting workflow:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete workflow",
    }
  }
}

// Execute a workflow
export async function executeWorkflow(data: {
  workflowId: string
  input?: Record<string, any>
}) {
  try {
    const supabase = await createServerSupabaseClient()

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    // Verify ownership before execution
    const { data: workflow, error: fetchError } = await supabase
      .from("ai_workflows")
      .select("user_id")
      .eq("id", data.workflowId)
      .single()

    if (fetchError || !workflow) {
      return { success: false, error: "Workflow not found" }
    }

    if (workflow.user_id !== user.id) {
      return { success: false, error: "Unauthorized" }
    }

    const input = data.input || {}

    if (input.asset_ids && Array.isArray(input.asset_ids) && input.asset_ids.length > 0) {
      console.log(`[v0] Fetching asset context for ${input.asset_ids.length} asset(s)`)

      // Fetch asset data from database
      const { data: assets, error: assetsError } = await supabase
        .from("assets")
        .select("*")
        .in("id", input.asset_ids)
        .eq("user_id", user.id)

      if (assetsError) {
        console.error("[v0] Error fetching assets:", assetsError)
      } else if (assets && assets.length > 0) {
        console.log(`[v0] Successfully fetched ${assets.length} asset(s) for workflow context`)

        // Format asset data into a readable context string
        const assetContext = assets
          .map((asset, index) => {
            const details = []
            details.push(`Asset ${index + 1}: ${asset.name}`)
            details.push(`Type: ${asset.asset_type || "N/A"}`)
            details.push(`Category: ${asset.category || "N/A"}`)

            if (asset.description) details.push(`Description: ${asset.description}`)
            if (asset.location) details.push(`Location: ${asset.location}`)
            if (asset.battery_level !== null && asset.battery_level !== undefined) {
              details.push(`Battery Level: ${asset.battery_level}%`)
            }
            if (asset.operational_status) details.push(`Status: ${asset.operational_status}`)
            if (asset.task_queue) details.push(`Task Queue: ${JSON.stringify(asset.task_queue)}`)
            if (asset.capabilities) details.push(`Capabilities: ${JSON.stringify(asset.capabilities)}`)
            if (asset.maintenance_schedule) {
              details.push(`Maintenance Schedule: ${JSON.stringify(asset.maintenance_schedule)}`)
            }
            if (asset.performance_metrics) {
              details.push(`Performance Metrics: ${JSON.stringify(asset.performance_metrics)}`)
            }

            return details.join("\n")
          })
          .join("\n\n")

        // Add formatted asset context to input
        input.asset_context = assetContext
        input.assets_data = assets

        console.log(`[v0] Asset context added to workflow input:\n${assetContext}`)
      } else {
        console.warn("[v0] No assets found for the provided asset_ids")
      }
    }

    // Execute the workflow using WorkflowSystem
    const workflowSystem = getWorkflowSystem()
    const result = await workflowSystem.executeWorkflow(data.workflowId, user.id, input)

    // Save workflow execution to learning layer
    await saveWorkflowToLearningLayer({
      workflowId: data.workflowId,
      workflowName: workflow.name,
      executionResult: result,
      userId: user.id,
      executionInput: input,
    })

    revalidatePath("/ai-suite")
    return { success: true, data: result }
  } catch (error) {
    console.error("Error executing workflow:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to execute workflow",
    }
  }
}

// Get workflow runs for a workflow
export async function getWorkflowRuns(workflowId: string) {
  try {
    const supabase = await createServerSupabaseClient()

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    // Get workflow runs using WorkflowSystem
    const workflowSystem = getWorkflowSystem()
    const runs = await workflowSystem.getWorkflowRuns(workflowId, user.id)

    return { success: true, data: runs }
  } catch (error) {
    console.error("Error fetching workflow runs:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch workflow runs",
    }
  }
}

// Get a specific workflow run
export async function getWorkflowRun(runId: string) {
  try {
    const supabase = await createServerSupabaseClient()

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    // Get workflow run using WorkflowSystem
    const workflowSystem = getWorkflowSystem()
    const run = await workflowSystem.getWorkflowRun(runId, user.id)

    return { success: true, data: run }
  } catch (error) {
    console.error("Error fetching workflow run:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch workflow run",
    }
  }
}

// Delete a workflow run
export async function deleteWorkflowRun(runId: string) {
  try {
    const supabase = await createServerSupabaseClient()

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    // Delete workflow run using WorkflowSystem
    const workflowSystem = getWorkflowSystem()
    await workflowSystem.deleteWorkflowRun(runId, user.id)

    revalidatePath("/ai-suite")
    return { success: true }
  } catch (error) {
    console.error("Error deleting workflow run:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete workflow run",
    }
  }
}

// Save workflow execution to learning layer
export async function saveWorkflowToLearningLayer(data: {
  workflowId?: string
  workflowName: string
  executionResult: any
  userId: string
  name?: string
  description?: string
  executionType?: string
  executionId?: string
  executionName?: string
  assetIds?: string[]
  executionInput?: any
  executionOutput?: any
  executionMetrics?: any
  tags?: string[]
}) {
  try {
    const supabase = await createServerSupabaseClient()

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    // Prepare learning layer input
    const learningInput = {
      name: data.name || `Workflow Execution: ${data.workflowName}`,
      description: data.description || `Execution of workflow ${data.workflowName}`,
      executionType: (data.executionType as "agent" | "workflow") || "workflow",
      executionId: data.executionId || data.workflowId || "",
      executionName: data.executionName || data.workflowName,
      assetIds: data.assetIds,
      executionInput: data.executionInput || {},
      executionOutput: data.executionOutput || data.executionResult,
      executionMetrics: data.executionMetrics,
      tags: data.tags || ["workflow", data.workflowName],
    }

    // Save to learning layer
    const result = await saveToLearningLayer(learningInput)

    return result
  } catch (error) {
    console.error("Error saving workflow to learning layer:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save to learning layer",
    }
  }
}
