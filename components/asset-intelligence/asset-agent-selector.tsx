"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataSourceSelector } from "./data-source-selector"
import {
  Wrench,
  RefreshCw,
  TrendingUp,
  Shield,
  Leaf,
  CheckCircle,
  Activity,
  DollarSign,
  Bot,
  Settings,
  Zap,
  Brain,
} from "lucide-react"
import { getAssetAgentTemplates, type AgentTemplate } from "@/lib/ai/asset-agent-templates"
import { createAssetAgent } from "@/app/actions/asset-agent-actions"
import { getAIModelsByType } from "@/app/actions/ai-model-actions"
import { toast } from "@/components/ui/use-toast"

interface AssetAgentSelectorProps {
  userId: string
  assets?: Array<{ id: string; name: string; asset_type: string; category?: string }>
  onAgentCreated?: (agent: any) => void
  onCancel?: () => void
}

const assetIconMap = {
  wrench: Wrench,
  "refresh-cw": RefreshCw,
  "trending-up": TrendingUp,
  shield: Shield,
  leaf: Leaf,
  "check-circle": CheckCircle,
  activity: Activity,
  "dollar-sign": DollarSign,
  bot: Bot,
}

export function AssetAgentSelector({ userId, assets = [], onAgentCreated, onCancel }: AssetAgentSelectorProps) {
  const [activeTab, setActiveTab] = useState("templates")
  const [selectedTemplate, setSelectedTemplate] = useState<AgentTemplate | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  const [aiModels, setAiModels] = useState<any[]>([])
  const [loadingModels, setLoadingModels] = useState(true)

  const safeAssets = assets || []

  const [agentConfig, setAgentConfig] = useState({
    name: "",
    description: "",
    model_id: "",
    temperature: 0.3,
    max_tokens: 2000,
    target_assets: [] as string[],
    auto_insights: true,
    notification_threshold: "medium" as "low" | "medium" | "high",
    custom_instructions: "",
  })

  const [filteredTemplates, setFilteredTemplates] = useState<AgentTemplate[]>([])

  const [selectedInputTables, setSelectedInputTables] = useState<string[]>([])
  const [selectedInputEndpoints, setSelectedInputEndpoints] = useState<string[]>([])
  const [includeLearningData, setIncludeLearningData] = useState(false)

  useEffect(() => {
    const loadModels = async () => {
      setLoadingModels(true)
      const result = await getAIModelsByType("chat")
      if (result.success && result.data) {
        setAiModels(result.data)
        if (result.data.length > 0 && !agentConfig.model_id) {
          setAgentConfig((prev) => ({ ...prev, model_id: result.data[0].id }))
        }
      }
      setLoadingModels(false)
    }
    loadModels()
  }, [])

  useEffect(() => {
    const loadTemplates = async () => {
      const templates = await getAssetAgentTemplates()
      setFilteredTemplates(templates)
    }
    loadTemplates()
  }, [])

  const handleTemplateSelect = (template: AgentTemplate) => {
    setSelectedTemplate(template)
    setAgentConfig((prev) => ({
      ...prev,
      name: template.name,
      description: template.description,
      temperature: template.parameters.temperature,
      max_tokens: template.parameters.max_tokens,
    }))
    setActiveTab("configure")
  }

  const handleAssetToggle = (assetId: string) => {
    setAgentConfig((prev) => ({
      ...prev,
      target_assets: prev.target_assets.includes(assetId)
        ? prev.target_assets.filter((id) => id !== assetId)
        : [...prev.target_assets, assetId],
    }))
  }

  const handleCreateAgent = async () => {
    if (!selectedTemplate) return

    if (!userId) {
      toast({
        title: "Authentication Error",
        description: "User authentication required to create agents.",
        variant: "destructive",
      })
      return
    }

    if (!agentConfig.model_id) {
      toast({
        title: "Validation Error",
        description: "Please select an AI model.",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)
    try {
      const result = await createAssetAgent({
        template_id: selectedTemplate.id,
        name: agentConfig.name,
        description: agentConfig.description,
        model_id: agentConfig.model_id,
        parameters: {
          temperature: agentConfig.temperature,
          max_tokens: agentConfig.max_tokens,
          data_sources: {
            input_tables: selectedInputTables,
            input_endpoints: selectedInputEndpoints,
            include_learning_data: includeLearningData,
          },
        },
        target_assets: agentConfig.target_assets,
        auto_insights: agentConfig.auto_insights,
        notification_threshold: agentConfig.notification_threshold,
        custom_instructions: agentConfig.custom_instructions,
      })

      if (result.success) {
        toast({
          title: "Agent Created",
          description: `${agentConfig.name} has been created successfully.`,
        })
        onAgentCreated?.(result.data)
      } else {
        const errorMessage = result.error || "Failed to create agent"
        console.error("Agent creation failed:", result)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating agent:", error)
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Card className="border-2 hover:border-primary/30 transition-all duration-300">
      <CardHeader className="p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl sm:text-2xl font-bold">Create Asset Intelligence Agent</CardTitle>
            <CardDescription className="text-sm sm:text-base mt-1">
              Select and configure an AI agent specialized for asset management and intelligence.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 pt-0 sm:pt-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 h-auto gap-1">
            <TabsTrigger value="templates" className="text-sm sm:text-base py-3 sm:py-2.5 font-medium">
              Select Template
            </TabsTrigger>
            <TabsTrigger
              value="configure"
              disabled={!selectedTemplate}
              className="text-sm sm:text-base py-3 sm:py-2.5 font-medium"
            >
              Configure Agent
            </TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-4 sm:space-y-4 mt-4 sm:mt-6">
            <div className="flex gap-2 sm:gap-4">
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 h-11 sm:h-11 text-base sm:text-sm px-4"
              />
            </div>

            <div className="grid gap-4 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-h-[55vh] sm:max-h-[600px] overflow-y-auto pr-2">
              {filteredTemplates.map((template) => {
                const IconComponent = assetIconMap[template.icon as keyof typeof assetIconMap] || Bot
                return (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-all duration-300 touch-manipulation active:scale-[0.98] border-2 ${
                      selectedTemplate?.id === template.id
                        ? "ring-2 ring-primary shadow-lg border-primary"
                        : "hover:shadow-md hover:border-primary/50"
                    }`}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <CardHeader className="pb-3 p-5 sm:p-6 sm:pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="p-2.5 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex-shrink-0">
                            <IconComponent className="h-5 w-5 text-primary" />
                          </div>
                          <CardTitle className="text-base sm:text-lg line-clamp-2 leading-snug">
                            {template.name}
                          </CardTitle>
                        </div>
                        <Badge
                          variant="secondary"
                          className="bg-primary/10 text-primary text-xs flex-shrink-0 px-2.5 py-1"
                        >
                          Asset
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-3 text-sm leading-relaxed mt-2">
                        {template.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0 p-5 sm:p-6 sm:pt-0">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium mb-2">Capabilities:</p>
                          <div className="flex flex-wrap gap-2">
                            {template.tools.slice(0, 3).map((tool) => (
                              <span key={tool} className="tool-badge">
                                {tool.replace("_", " ")}
                              </span>
                            ))}
                            {template.tools.length > 3 && (
                              <span className="tool-badge tool-badge-more">+{template.tools.length - 3}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground pt-2 border-t">
                          <span className="font-medium">Temp: {template.parameters.temperature}</span>
                          <span className="font-medium">Tokens: {template.parameters.max_tokens}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <p className="text-sm text-muted-foreground">No templates found matching your search.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="configure" className="space-y-5 sm:space-y-6 mt-4 sm:mt-6">
            {selectedTemplate && (
              <>
                <Card className="border-2">
                  <CardHeader className="p-5 sm:p-6">
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                      <Settings className="h-5 w-5 flex-shrink-0" />
                      Agent Configuration
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base mt-1.5">
                      Customize your {selectedTemplate.name} agent
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5 sm:space-y-5 p-5 sm:p-6 pt-0 sm:pt-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="agent-name" className="text-sm font-medium">
                          Agent Name
                        </Label>
                        <Input
                          id="agent-name"
                          value={agentConfig.name}
                          onChange={(e) => setAgentConfig((prev) => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter agent name"
                          className="h-11 sm:h-11 text-base sm:text-sm px-4"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notification-threshold" className="text-sm font-medium">
                          Notification Threshold
                        </Label>
                        <Select
                          value={agentConfig.notification_threshold}
                          onValueChange={(value: "low" | "medium" | "high") =>
                            setAgentConfig((prev) => ({ ...prev, notification_threshold: value }))
                          }
                        >
                          <SelectTrigger className="h-11 sm:h-11 text-base sm:text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low - All insights</SelectItem>
                            <SelectItem value="medium">Medium - Important</SelectItem>
                            <SelectItem value="high">High - Critical only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ai-model" className="text-sm font-medium">
                        AI Model *
                      </Label>
                      <Select
                        value={agentConfig.model_id}
                        onValueChange={(value) => setAgentConfig((prev) => ({ ...prev, model_id: value }))}
                        disabled={loadingModels}
                      >
                        <SelectTrigger className="h-11 sm:h-11 text-base sm:text-sm">
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
                      {agentConfig.model_id && (
                        <p className="text-xs text-muted-foreground mt-1.5">
                          {aiModels.find((m) => m.id === agentConfig.model_id)?.description || ""}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="agent-description" className="text-sm font-medium">
                        Description
                      </Label>
                      <Textarea
                        id="agent-description"
                        value={agentConfig.description}
                        onChange={(e) => setAgentConfig((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe what this agent will do"
                        rows={3}
                        className="text-base sm:text-sm resize-none min-h-[100px]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-5">
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Temperature: {agentConfig.temperature}</Label>
                        <Slider
                          value={[agentConfig.temperature]}
                          onValueChange={(value) => setAgentConfig((prev) => ({ ...prev, temperature: value[0] }))}
                          min={0}
                          max={1}
                          step={0.1}
                          className="touch-manipulation py-3"
                        />
                        <p className="text-xs text-muted-foreground">Lower = focused, Higher = creative</p>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Max Tokens: {agentConfig.max_tokens}</Label>
                        <Slider
                          value={[agentConfig.max_tokens]}
                          onValueChange={(value) => setAgentConfig((prev) => ({ ...prev, max_tokens: value[0] }))}
                          min={500}
                          max={4000}
                          step={100}
                          className="touch-manipulation py-3"
                        />
                        <p className="text-xs text-muted-foreground">Maximum response length</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-4 px-4 bg-muted/50 rounded-lg touch-manipulation">
                      <div className="space-y-0.5 flex-1 pr-4">
                        <Label className="text-sm font-medium">Auto-generate Insights</Label>
                        <p className="text-xs text-muted-foreground">Automatically analyze assets</p>
                      </div>
                      <Switch
                        checked={agentConfig.auto_insights}
                        onCheckedChange={(checked) => setAgentConfig((prev) => ({ ...prev, auto_insights: checked }))}
                        className="touch-manipulation scale-110 sm:scale-100"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="custom-instructions" className="text-sm font-medium">
                        Custom Instructions (Optional)
                      </Label>
                      <Textarea
                        id="custom-instructions"
                        value={agentConfig.custom_instructions}
                        onChange={(e) => setAgentConfig((prev) => ({ ...prev, custom_instructions: e.target.value }))}
                        placeholder="Add specific instructions for how the agent should behave"
                        rows={3}
                        className="text-base sm:text-sm resize-none min-h-[100px]"
                      />
                    </div>
                  </CardContent>
                </Card>

                <DataSourceSelector
                  selectedTables={selectedInputTables}
                  selectedEndpoints={selectedInputEndpoints}
                  includeLearningData={includeLearningData}
                  onTablesChange={setSelectedInputTables}
                  onEndpointsChange={setSelectedInputEndpoints}
                  onLearningDataChange={setIncludeLearningData}
                  mode="input"
                />

                <Card className="border-2">
                  <CardHeader className="p-5 sm:p-6">
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                      <Zap className="h-5 w-5 flex-shrink-0" />
                      Target Assets
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base mt-1.5">
                      Select assets for this agent to monitor
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-5 sm:p-6 pt-0 sm:pt-0">
                    <div className="space-y-2 max-h-72 sm:max-h-60 overflow-y-auto">
                      {safeAssets.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-6 text-center">
                          No assets available. Create assets first.
                        </p>
                      ) : (
                        safeAssets.map((asset) => (
                          <div
                            key={asset.id}
                            className={`flex items-center justify-between p-3 sm:p-3 rounded-lg border-2 transition-all cursor-pointer touch-manipulation ${
                              agentConfig.target_assets.includes(asset.id)
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50"
                            }`}
                            onClick={() => handleAssetToggle(asset.id)}
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div
                                className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                  agentConfig.target_assets.includes(asset.id) ? "bg-primary/20" : "bg-muted"
                                }`}
                              >
                                <CheckCircle
                                  className={`h-5 w-5 ${
                                    agentConfig.target_assets.includes(asset.id)
                                      ? "text-primary"
                                      : "text-muted-foreground"
                                  }`}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{asset.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{asset.asset_type}</p>
                              </div>
                            </div>
                            <Badge
                              variant={agentConfig.target_assets.includes(asset.id) ? "default" : "outline"}
                              className="ml-2"
                            >
                              {agentConfig.target_assets.includes(asset.id) ? "Selected" : "Select"}
                            </Badge>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-3 pt-2">
                  {onCancel && (
                    <Button
                      variant="outline"
                      onClick={onCancel}
                      disabled={isCreating}
                      className="flex-1 h-11 sm:h-11 text-base sm:text-sm font-medium bg-transparent"
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    onClick={handleCreateAgent}
                    disabled={isCreating || !agentConfig.name || !agentConfig.model_id}
                    className="flex-1 h-11 sm:h-11 text-base sm:text-sm font-medium shadow-lg hover:shadow-xl transition-shadow"
                  >
                    {isCreating ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Create Agent
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
