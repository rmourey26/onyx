import { toast } from "react-toastify"
import { templates } from "@/app/data/templates"
import {
  selectedTemplate,
  selectedModel,
  selectedAssets,
  agentName,
  agentDescription,
  enableAutoInsights,
  notificationLevel,
  customInstructions,
  onAgentCreated,
} from "@/app/state"

const handleDeploy = async () => {
  if (!selectedTemplate || !selectedModel || selectedAssets.length === 0) {
    toast({
      title: "Missing Information",
      description: "Please select a template, model, and at least one asset",
      variant: "destructive",
    })
    return
  }

  setIsDeploying(true)
  try {
    const { createAssetAgent } = await import("@/app/actions/asset-agent-actions")

    const result = await createAssetAgent({
      template_id: selectedTemplate,
      name: agentName || templates.find((t) => t.id === selectedTemplate)?.name || "Asset Agent",
      description: agentDescription,
      model_id: selectedModel,
      parameters: {
        temperature: 0.7,
        max_tokens: 1000,
      },
      target_assets: selectedAssets,
      auto_insights: enableAutoInsights,
      notification_threshold: notificationLevel as "low" | "medium" | "high",
      custom_instructions: customInstructions,
    })

    if (result.success) {
      toast({
        title: "Agent Deployed",
        description: "Your asset intelligence agent has been deployed successfully.",
      })
      onAgentCreated(result.data)
    } else {
      toast({
        title: "Deployment Failed",
        description: result.error || "Failed to deploy agent",
        variant: "destructive",
      })
    }
  } catch (error) {
    console.error("Error deploying agent:", error)
    toast({
      title: "Error",
      description: "An unexpected error occurred while deploying the agent",
      variant: "destructive",
    })
  } finally {
    setIsDeploying(false)
  }
}

const setIsDeploying = (value: boolean) => {
  // Implementation of setIsDeploying
}
