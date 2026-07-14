"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DataSourceSelector } from "./data-source-selector"
import {
  Plus,
  Settings,
  Zap,
  Clock,
  AlertTriangle,
  BookTemplate as FileTemplate,
  Wrench,
  BarChart3,
  Shield,
  Leaf,
  Wifi,
  DollarSign,
} from "lucide-react"
import { createAssetWorkflowTemplate } from "@/app/actions/asset-workflow-actions"
import { getAIModelsByType } from "@/app/actions/ai-model-actions"
import { toast } from "@/hooks/use-toast"
import {
  assetIntelligenceWorkflowTemplates,
  type AssetIntelligenceWorkflowTemplate,
} from "@/lib/workflows/asset-intelligence-workflow-templates"

interface WorkflowStep {
  id: string
  type: string
  name: string
  description?: string
  config: Record<string, any>
  next_steps: string[]
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

interface WorkflowTrigger {
  id: string
  name: string
  description: string
  trigger_type: "insight_generated" | "threshold_exceeded" | "schedule" | "manual" | "agent_recommendation"
  conditions: Record<string, any>
  auto_execute: boolean
  requires_approval: boolean
}

interface WorkflowCreationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onWorkflowCreated: () => void
  assets: any[]
  agents: any[]
  initialTemplate?: AssetIntelligenceWorkflowTemplate | null
}

const STEP_TYPES = [
  { value: "agent", label: "AI Agent Analysis", icon: Zap },
  { value: "asset_analysis", label: "Asset Analysis", icon: Settings },
  { value: "maintenance_scheduling", label: "Maintenance Scheduling", icon: Clock },
  { value: "compliance_check", label: "Compliance Check", icon: AlertTriangle },
  { value: "cost_optimization", label: "Cost Optimization", icon: Settings },
]

const TRIGGER_TYPES = [
  { value: "insight_generated", label: "When Insight Generated" },
  { value: "threshold_exceeded", label: "When Threshold Exceeded" },
  { value: "schedule", label: "On Schedule" },
  { value: "manual", label: "Manual Trigger" },
  { value: "agent_recommendation", label: "Agent Recommendation" },
]

const categoryIcons: Record<string, any> = {
  "Predictive Maintenance": Wrench,
  "Lifecycle Management": BarChart3,
  "Performance Optimization": BarChart3,
  "Risk Management": Shield,
  Sustainability: Leaf,
  "IoT Intelligence": Wifi,
  "Cost Optimization": DollarSign,
  Compliance: Shield,
  Security: Shield,
}

export function WorkflowCreationDialog({
  open,
  onOpenChange,
  onWorkflowCreated,
  assets,
  agents,
  initialTemplate = null,
}: WorkflowCreationDialogProps) {
  const [loading, setLoading] = useState(false)
  const [currentTab, setCurrentTab] = useState("source")
  const [creationMode, setCreationMode] = useState<"template" | "manual">("template")
  const [selectedTemplate, setSelectedTemplate] = useState<AssetIntelligenceWorkflowTemplate | null>(initialTemplate)

  const [selectedAssetContext, setSelectedAssetContext] = useState<string[]>([])

  const [selectedInputTables, setSelectedInputTables] = useState<string[]>([])
  const [selectedInputEndpoints, setSelectedInputEndpoints] = useState<string[]>([])
  const [selectedOutputTables, setSelectedOutputTables] = useState<string[]>([])
  const [selectedOutputEndpoints, setSelectedOutputEndpoints] = useState<string[]>([])
  const [includeLearningData, setIncludeLearningData] = useState(false)

  const [aiModels, setAiModels] = useState<any[]>([])
  const [loadingModels, setLoadingModels] = useState(true)
  const [selectedModelId, setSelectedModelId] = useState<string>("")

  // Basic workflow info
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<"maintenance" | "optimization" | "compliance" | "analytics" | "emergency">(
    "maintenance",
  )

  // Steps
  const [steps, setSteps] = useState<WorkflowStep[]>([])
  const [editingStep, setEditingStep] = useState<WorkflowStep | null>(null)

  // Triggers
  const [triggers, setTriggers] = useState<WorkflowTrigger[]>([])
  const [editingTrigger, setEditingTrigger] = useState<WorkflowTrigger | null>(null)

  // Success criteria
  const [successCriteria, setSuccessCriteria] = useState<Record<string, any>[]>([])

  useEffect(() => {
    const loadModels = async () => {
      setLoadingModels(true)
      const result = await getAIModelsByType("chat")
      if (result.success && result.data) {
        setAiModels(result.data)
        // Set default model if available
        if (result.data.length > 0 && !selectedModelId) {
          setSelectedModelId(result.data[0].id)
        }
      }
      setLoadingModels(false)
    }
    loadModels()
  }, [])

  useEffect(() => {
    if (open) {
      if (initialTemplate) {
        setSelectedTemplate(initialTemplate)
        setCreationMode("template")
        setCurrentTab("basic")
        loadTemplateData(initialTemplate)
      } else {
        setCurrentTab("source")
      }
    } else {
      // Reset form when dialog closes
      resetForm()
    }
  }, [open, initialTemplate])

  const resetForm = () => {
    setName("")
    setDescription("")
    setCategory("maintenance")
    setSteps([])
    setTriggers([])
    setSuccessCriteria([])
    setSelectedTemplate(null)
    setCreationMode("template")
    setCurrentTab("source")
    setSelectedAssetContext([])
    setSelectedInputTables([])
    setSelectedInputEndpoints([])
    setSelectedOutputTables([])
    setSelectedOutputEndpoints([])
    setIncludeLearningData(false)
    if (aiModels.length > 0) {
      setSelectedModelId(aiModels[0].id)
    }
  }

  const loadTemplateData = (template: AssetIntelligenceWorkflowTemplate) => {
    setName(template.name)
    setDescription(template.description)
    setCategory(template.category.toLowerCase().replace(" ", "_") as any)
    setSteps(
      template.steps.map((step) => ({
        ...step,
        id: `step_${Date.now()}_${Math.random()}`,
      })),
    )

    // Convert template trigger to workflow trigger format
    const templateTrigger: WorkflowTrigger = {
      id: `trigger_${Date.now()}`,
      name: `${template.trigger_type} trigger`,
      description: `Automatically triggered ${template.trigger_type}`,
      trigger_type: template.trigger_type as any,
      conditions: template.trigger_config,
      auto_execute: template.trigger_type !== "manual",
      requires_approval: template.difficulty === "advanced",
    }
    setTriggers([templateTrigger])
  }

  const handleTemplateSelect = (template: AssetIntelligenceWorkflowTemplate) => {
    setSelectedTemplate(template)
    loadTemplateData(template)
    setCurrentTab("basic")
  }

  const handleAddStep = () => {
    const newStep: WorkflowStep = {
      id: `step_${Date.now()}`,
      type: "agent",
      name: "New Step",
      description: "",
      config: {},
      next_steps: [],
    }
    setSteps([...steps, newStep])
    setEditingStep(newStep)
  }

  const handleUpdateStep = (updatedStep: WorkflowStep) => {
    setSteps(steps.map((step) => (step.id === updatedStep.id ? updatedStep : step)))
    setEditingStep(null)
  }

  const handleDeleteStep = (stepId: string) => {
    setSteps(steps.filter((step) => step.id !== stepId))
    // Remove references to this step from other steps
    setSteps((prevSteps) =>
      prevSteps.map((step) => ({
        ...step,
        next_steps: step.next_steps.filter((id) => id !== stepId),
      })),
    )
  }

  const handleAddTrigger = () => {
    const newTrigger: WorkflowTrigger = {
      id: `trigger_${Date.now()}`,
      name: "New Trigger",
      description: "",
      trigger_type: "manual",
      conditions: {},
      auto_execute: false,
      requires_approval: true,
    }
    setTriggers([...triggers, newTrigger])
    setEditingTrigger(newTrigger)
  }

  const handleUpdateTrigger = (updatedTrigger: WorkflowTrigger) => {
    setTriggers(triggers.map((trigger) => (trigger.id === updatedTrigger.id ? updatedTrigger : trigger)))
    setEditingTrigger(null)
  }

  const handleDeleteTrigger = (triggerId: string) => {
    setTriggers(triggers.filter((trigger) => trigger.id !== triggerId))
  }

  const handleCreateWorkflow = async () => {
    if (!name.trim() || !description.trim() || steps.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields and add at least one step.",
        variant: "destructive",
      })
      return
    }

    if (!selectedModelId) {
      toast({
        title: "Validation Error",
        description: "Please select an AI model.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("description", description)
      formData.append("category", category)
      formData.append("model_id", selectedModelId)
      formData.append("steps", JSON.stringify(steps))
      formData.append("triggers", JSON.stringify(triggers))
      formData.append("success_criteria", JSON.stringify(successCriteria))

      const workflowMetadata = {
        asset_context: selectedAssetContext,
        data_sources: {
          input_tables: selectedInputTables,
          input_endpoints: selectedInputEndpoints,
          output_tables: selectedOutputTables,
          output_endpoints: selectedOutputEndpoints,
          include_learning_data: includeLearningData,
        },
      }

      if (selectedAssetContext.length > 0) {
        formData.append("asset_context", JSON.stringify(workflowMetadata))
      }

      if (selectedTemplate) {
        formData.append("template_id", selectedTemplate.id)
        formData.append("is_template_deployment", "true")
      }

      const result = await createAssetWorkflowTemplate(formData)

      if (result.success) {
        toast({
          title: "Success",
          description: selectedTemplate
            ? `Workflow created from ${selectedTemplate.name} template!`
            : "Workflow template created successfully!",
        })
        onWorkflowCreated()
        onOpenChange(false)
        resetForm()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create workflow",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating workflow:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const compatibleTemplates = assetIntelligenceWorkflowTemplates.filter((template) => {
    if (assets.length === 0) return true
    const assetTypes = assets.map((asset) => asset.asset_type)
    return template.assetTypes.some((type) => type === "all-assets" || assetTypes.includes(type))
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[96vw] sm:max-w-5xl max-h-[96vh] sm:max-h-[90vh] overflow-hidden p-5 sm:p-6">
        <DialogHeader className="space-y-2 sm:space-y-3 pb-2">
          <DialogTitle className="text-lg sm:text-xl line-clamp-2 leading-snug pr-8">
            {selectedTemplate ? `Create Workflow from ${selectedTemplate.name}` : "Create Asset Intelligence Workflow"}
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-sm leading-relaxed">
            {selectedTemplate
              ? "Customize and deploy this workflow template for your assets."
              : "Build an intelligent workflow from a template or create one from scratch."}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className={`grid w-full h-auto ${selectedTemplate ? "grid-cols-5" : "grid-cols-6"} gap-1 p-1`}>
            {!selectedTemplate && (
              <TabsTrigger value="source" className="text-xs sm:text-sm py-3 sm:py-2 font-medium">
                Source
              </TabsTrigger>
            )}
            <TabsTrigger value="basic" className="text-xs sm:text-sm py-3 sm:py-2 font-medium">
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="data" className="text-xs sm:text-sm py-3 sm:py-2 font-medium">
              Data
            </TabsTrigger>
            <TabsTrigger value="steps" className="text-xs sm:text-sm py-3 sm:py-2 font-medium">
              Steps
            </TabsTrigger>
            <TabsTrigger value="triggers" className="text-xs sm:text-sm py-3 sm:py-2 font-medium">
              Triggers
            </TabsTrigger>
            <TabsTrigger value="criteria" className="text-xs sm:text-sm py-3 sm:py-2 font-medium">
              Criteria
            </TabsTrigger>
          </TabsList>

          {!selectedTemplate && (
            <TabsContent value="source" className="space-y-4 sm:space-y-4 mt-4">
              <div className="space-y-4 sm:space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-4">
                  <Card
                    className={`flex-1 cursor-pointer transition-all touch-manipulation active:scale-[0.98] ${creationMode === "template" ? "ring-2 ring-primary shadow-lg" : "hover:shadow-md"}`}
                    onClick={() => setCreationMode("template")}
                  >
                    <CardHeader className="text-center p-5 sm:p-6">
                      <FileTemplate className="h-8 w-8 sm:h-8 sm:w-8 mx-auto mb-3 text-primary" />
                      <CardTitle className="text-base sm:text-lg">Start from Template</CardTitle>
                      <CardDescription className="text-sm sm:text-sm mt-2">
                        Choose from pre-built workflow templates
                      </CardDescription>
                    </CardHeader>
                  </Card>

                  <Card
                    className={`flex-1 cursor-pointer transition-all touch-manipulation active:scale-[0.98] ${creationMode === "manual" ? "ring-2 ring-primary shadow-lg" : "hover:shadow-md"}`}
                    onClick={() => setCreationMode("manual")}
                  >
                    <CardHeader className="text-center p-5 sm:p-6">
                      <Plus className="h-8 w-8 sm:h-8 sm:w-8 mx-auto mb-3 text-primary" />
                      <CardTitle className="text-base sm:text-lg">Create from Scratch</CardTitle>
                      <CardDescription className="text-sm sm:text-sm mt-2">Build a custom workflow</CardDescription>
                    </CardHeader>
                  </Card>
                </div>

                {creationMode === "template" && (
                  <div className="space-y-4 sm:space-y-4">
                    <h3 className="text-base sm:text-lg font-semibold">Choose a Template</h3>
                    <ScrollArea className="h-[calc(96vh-400px)] sm:h-[400px]">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-4 pr-2 sm:pr-4 pb-4">
                        {compatibleTemplates.map((template) => {
                          const IconComponent = categoryIcons[template.category] || BarChart3

                          return (
                            <Card
                              key={template.id}
                              className="cursor-pointer hover:shadow-md transition-all touch-manipulation active:scale-[0.98]"
                              onClick={() => handleTemplateSelect(template)}
                            >
                              <CardHeader className="pb-3 p-4 sm:pb-3 sm:p-6">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                                      <IconComponent className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <CardTitle className="text-sm sm:text-sm font-medium line-clamp-2 leading-snug">
                                        {template.name}
                                      </CardTitle>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                  <Badge variant="outline" className="text-xs px-2 py-0.5">
                                    {template.category}
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs px-2 py-0.5">
                                    {template.difficulty}
                                  </Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="pt-0 p-4 sm:pt-0 sm:p-6">
                                <CardDescription className="text-xs line-clamp-3 mb-3 leading-relaxed">
                                  {template.description}
                                </CardDescription>
                                <div className="space-y-2 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-3 w-3 flex-shrink-0" />
                                    <span className="truncate">{template.estimated_time}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <BarChart3 className="h-3 w-3 flex-shrink-0" />
                                    <span className="truncate">{template.businessValue}</span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>
            </TabsContent>
          )}

          <TabsContent value="basic" className="space-y-4 sm:space-y-4 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Workflow Name *
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Predictive Maintenance"
                  className="h-12 sm:h-10 text-base sm:text-sm px-4"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium">
                  Category *
                </Label>
                <Select value={category} onValueChange={(value: any) => setCategory(value)}>
                  <SelectTrigger className="h-12 sm:h-10 text-base sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="optimization">Optimization</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="analytics">Analytics</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="workflow-ai-model" className="text-sm font-medium">
                AI Model *
              </Label>
              <Select value={selectedModelId} onValueChange={setSelectedModelId} disabled={loadingModels}>
                <SelectTrigger className="h-12 sm:h-10 text-base sm:text-sm">
                  <SelectValue placeholder={loadingModels ? "Loading models..." : "Select AI model"} />
                </SelectTrigger>
                <SelectContent>
                  {aiModels.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex items-center justify-between w-full gap-2">
                        <span className="font-medium">{model.name}</span>
                        <span className="text-xs text-muted-foreground">{model.provider}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedModelId && (
                <p className="text-xs text-muted-foreground">
                  {aiModels.find((m) => m.id === selectedModelId)?.description || ""}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description *
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this workflow does..."
                rows={3}
                className="text-base sm:text-sm resize-none min-h-[100px]"
              />
            </div>

            {assets.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Asset Context (Optional)</Label>
                <p className="text-xs text-muted-foreground mb-2">Select assets to provide context for this workflow</p>
                <ScrollArea className="h-56 border rounded-md p-3">
                  <div className="space-y-2">
                    {assets.map((asset) => (
                      <div
                        key={asset.id}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors touch-manipulation active:bg-muted"
                      >
                        <input
                          type="checkbox"
                          id={`workflow-context-asset-${asset.id}`}
                          checked={selectedAssetContext.includes(asset.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAssetContext([...selectedAssetContext, asset.id])
                            } else {
                              setSelectedAssetContext(selectedAssetContext.filter((id) => id !== asset.id))
                            }
                          }}
                          className="rounded w-5 h-5 sm:w-4 sm:h-4 flex-shrink-0"
                        />
                        <label htmlFor={`workflow-context-asset-${asset.id}`} className="flex-1 cursor-pointer">
                          <div>
                            <p className="text-sm font-medium leading-snug">{asset.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {asset.asset_type} {asset.category && `• ${asset.category}`}
                            </p>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                {selectedAssetContext.length > 0 && (
                  <p className="text-xs text-muted-foreground text-center sm:text-left">
                    {selectedAssetContext.length} asset{selectedAssetContext.length !== 1 ? "s" : ""} selected
                  </p>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="data" className="space-y-4 sm:space-y-4 mt-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-2">Input Data Sources</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Select tables and endpoints to read data from during workflow execution
                </p>
                <DataSourceSelector
                  selectedTables={selectedInputTables}
                  selectedEndpoints={selectedInputEndpoints}
                  includeLearningData={includeLearningData}
                  onTablesChange={setSelectedInputTables}
                  onEndpointsChange={setSelectedInputEndpoints}
                  onLearningDataChange={setIncludeLearningData}
                  mode="input"
                />
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-2">Output Data Sources</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Select tables and endpoints to write results to after workflow execution
                </p>
                <DataSourceSelector
                  selectedTables={selectedOutputTables}
                  selectedEndpoints={selectedOutputEndpoints}
                  includeLearningData={false}
                  onTablesChange={setSelectedOutputTables}
                  onEndpointsChange={setSelectedOutputEndpoints}
                  onLearningDataChange={() => {}}
                  mode="output"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="steps" className="space-y-3 sm:space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base sm:text-lg font-semibold">Workflow Steps ({steps.length})</h3>
              <Button onClick={handleAddStep} size="sm" className="h-9 sm:h-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add Step
              </Button>
            </div>

            <ScrollArea className="h-[calc(95vh-300px)] sm:h-[400px]"></ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 sm:gap-0 pt-4 border-t -mx-5 px-5 sm:mx-0 sm:px-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto h-12 sm:h-10 text-base sm:text-sm font-medium"
          >
            Cancel
          </Button>
          {selectedTemplate && (
            <Button
              variant="outline"
              onClick={() => {
                setSelectedTemplate(null)
                setCurrentTab("source")
                resetForm()
              }}
              className="w-full sm:w-auto h-12 sm:h-10 text-base sm:text-sm font-medium"
            >
              Change Template
            </Button>
          )}
          <Button
            onClick={handleCreateWorkflow}
            disabled={loading || (!selectedTemplate && creationMode === "template" && currentTab === "source")}
            className="w-full sm:w-auto h-12 sm:h-10 text-base sm:text-sm font-medium"
          >
            {loading ? "Creating..." : selectedTemplate ? "Deploy Workflow" : "Create Workflow"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
