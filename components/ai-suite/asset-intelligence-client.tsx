"use client"

import { Separator } from "@/components/ui/separator"

import type React from "react"
import { getAssets, getAssetAgents } from "@/app/actions/asset-intelligence-actions"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { TooltipProvider } from "@/components/ui/tooltip"
import { toast } from "@/hooks/use-toast"
import {
  createAsset,
  deleteAsset,
  generateAssetInsights,
  getAssetInsights,
  updateAgent,
  deleteAgent,
  executeAgent,
  executeWorkflow,
  updateInsightsAgentModel,
  getAllUserInsights, // Imported getAllUserInsights
} from "@/app/actions/asset-intelligence-actions"

import type { CreateAsset } from "@/lib/schemas/asset-intelligence"
import { getActiveWorkflows } from "@/app/actions/asset-workflow-actions"
import { saveToLearningLayer } from "@/app/actions/learning-layer-actions"
import { ComprehensiveAssetDialog } from "@/components/asset-intelligence/comprehensive-asset-dialog"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Plus,
  Search,
  MoreVertical,
  Brain,
  Settings,
  RefreshCw,
  Trash2,
  Building,
  Truck,
  Server,
  Smartphone,
  Activity,
  Package,
  Home,
  Box,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Sparkles,
  Eye,
  Lightbulb,
  TrendingUp,
  Shield,
  Leaf,
  Clock,
  Wrench,
  ChevronUp,
  ChevronDown,
} from "lucide-react"

interface Asset {
  id: string
  asset_id: string
  name: string
  description?: string
  asset_type: "equipment" | "vehicle" | "container" | "device" | "infrastructure" | "inventory" | "digital" | "building"
  category?: string
  status: "active" | "inactive" | "maintenance" | "retired" | "lost"
  current_value?: number
  iot_sensor_id?: string
  created_at: string
  updated_at: string
  purchase_date?: string
  purchase_cost?: number
  depreciation_rate?: number
  location_id?: string
  current_location?: Record<string, any>
  specifications?: Record<string, any>
  nfc_tag_id?: string
  qr_code?: string
  maintenance_schedule?: any[]
  compliance_data?: Record<string, any>
  esg_metrics?: Record<string, any>
  metadata?: Record<string, any>
  user_id?: string
}

interface AssetInsight {
  id: string
  insight_type: string
  priority: "low" | "medium" | "high" | "critical"
  insight_data: any
  recommendations: any[]
  status: string
  created_at: string
  assets?: { name?: string } // Added assets to interface for clarity
}

interface AssetIntelligenceAgent {
  id: string
  name: string
  description: string
  model_id: string
  model_name?: string
  temperature: number
  max_tokens: number
  tools: string[]
  status: "active" | "paused"
  assets_monitored: number
  created_at: string
  is_active?: boolean
  system_prompt?: string
  category?: string
}

interface RunningWorkflow {
  id: string
  name: string
  type: string
  progress: number
  status: "running" | "completed" | "failed"
  assets_processed: number
  total_assets: number
}

interface AssetIntelligenceClientProps {
  initialAssets?: any[]
  user: any
  aiModels: any[]
  aiAgents?: any[]
  workflows?: any[]
}

export function AssetIntelligenceClient({
  initialAssets = [],
  user,
  aiModels = [],
  aiAgents = [],
  workflows = [],
}: AssetIntelligenceClientProps) {
  const [assets, setAssets] = useState<Asset[]>([])
  const [insights, setInsights] = useState<AssetInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAssetType, setSelectedAssetType] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [activeTab, setActiveTab] = useState("assets")
  const [selectedAsset, setSelectedAsset] = useState<any>(null)
  const [generatingInsights, setGeneratingInsights] = useState<string | null>(null)
  const [selectedAgent, setSelectedAgent] = useState<any>(null)
  const [showEditAgentDialog, setShowEditAgentDialog] = useState(false)
  const [selectedWorkflow, setSelectedWorkflow] = useState<any>(null)
  const [selectedAIModel, setSelectedAIModel] = useState<any>(null)
  const [showCreateWorkflowDialog, setShowCreateWorkflowDialog] = useState(false)
  const [insightsLoading, setInsightsLoading] = useState(false)
  const [expandedInsightId, setExpandedInsightId] = useState<string | null>(null)
  const [editFormData, setEditFormData] = useState<any>({
    name: "",
    description: "",
    system_prompt: "",
    model_id: "",
    temperature: 0.7,
    max_tokens: 1000,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTools, setSelectedTools] = useState<string[]>([])
  const [isEditingAgent, setIsEditingAgent] = useState(false)
  const [executionPrompt, setExecutionPrompt] = useState("")
  const [executionResult, setExecutionResult] = useState<any>(null)
  const [selectedAssets, setSelectedAssets] = useState<string[]>([])
  const [selectedTables, setSelectedTables] = useState<string[]>([])
  const [selectedEndpoints, setSelectedEndpoints] = useState<string[]>([])
  const [includeLearningData, setIncludeLearningData] = useState(false)
  const [selectedDataStreams, setSelectedDataStreams] = useState<string[]>([])
  const [isExecutingAgent, setIsExecutingAgent] = useState(false)
  const [saveToLearning, setSaveToLearning] = useState(false)
  const [assetsLoading, setAssetsLoading] = useState(false)
  const [assetsError, setAssetsError] = useState<string | null>(null)
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([])
  const [agents, setAgents] = useState<AssetIntelligenceAgent[]>([])
  const [allInsights, setAllInsights] = useState<AssetInsight[]>([])
  const [workflowsLoading, setWorkflowsLoading] = useState(false)
  const [userWorkflows, setUserWorkflows] = useState<any[]>([])
  const [activeAgents, setActiveAgents] = useState<AssetIntelligenceAgent[]>([])
  const [isExecutingWorkflow, setIsExecutingWorkflow] = useState(false)
  const [executingWorkflow, setExecutingWorkflow] = useState<string | null>(null)
  const [selectedWorkflowAssets, setSelectedWorkflowAssets] = useState<string[]>([])
  const [assetForm, setAssetForm] = useState<CreateAsset>({
    name: "",
    description: "",
    asset_type: "equipment",
    status: "active",
    current_value: 0,
    purchase_date: "",
    purchase_cost: 0,
    depreciation_rate: 0,
    location_id: "",
    current_location: {},
    specifications: {},
    iot_sensor_id: "",
    nfc_tag_id: "",
    qr_code: "",
    maintenance_schedule: [],
    compliance_data: {},
    esg_metrics: {},
    metadata: {},
    asset_id: "",
    user_id: user?.id || "",
  })
  const [isCreating, setIsCreating] = useState(false)
  const [showWorkflowDialog, setShowWorkflowDialog] = useState(false)
  const [insightsAgentModelId, setInsightsAgentModelId] = useState<string>("gemini-2.5-pro")

  const router = useRouter()

  // Helper function to format currency
  const formatCurrency = (amount: number | undefined | null): string => {
    if (amount === undefined || amount === null) return "$0.00"
    return `$${amount.toFixed(2)}`
  }

  const getAssetTypeIcon = (type: string) => {
    switch (type) {
      case "equipment":
        return <Building className="h-4 w-4" />
      case "vehicle":
        return <Truck className="h-4 w-4" />
      case "container":
        return <Package className="h-4 w-4" />
      case "device":
        return <Smartphone className="h-4 w-4" />
      case "infrastructure":
        return <Server className="h-4 w-4" />
      case "inventory":
        return <Box className="h-4 w-4" />
      case "digital":
        return <Activity className="h-4 w-4" />
      case "building":
        return <Home className="h-4 w-4" />
      default:
        return <Box className="h-4 w-4" />
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "predictive_maintenance":
        return <Wrench className="h-4 w-4" />
      case "cost_optimization":
        return <DollarSign className="h-4 w-4" />
      case "utilization_analysis":
        return <TrendingUp className="h-4 w-4" />
      case "compliance_risk":
        return <Shield className="h-4 w-4" />
      case "esg_impact":
        return <Leaf className="h-4 w-4" />
      case "lifecycle_prediction":
        return <Clock className="h-4 w-4" />
      default:
        return <Lightbulb className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatInsightType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "maintenance":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "retired":
        return "bg-red-100 text-red-800 border-red-200"
      case "lost":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleEditSelectChange = (name: string, value: string) => {
    setEditFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleEditSliderChange = (name: string, value: number[]) => {
    setEditFormData((prev) => ({ ...prev, [name]: value[0] }))
  }

  const handleUpdateAssetAgent = async () => {
    if (!selectedAgent) return

    setIsLoading(true)
    try {
      console.log("[v0] Updating agent with tools:", selectedTools)

      const validTools = selectedTools.filter(
        (tool): tool is string => tool !== null && tool !== undefined && typeof tool === "string" && tool.trim() !== "",
      )

      console.log("[v0] Valid tools after filtering:", validTools)

      const result = await updateAgent({
        id: selectedAgent.id,
        name: editFormData.name,
        description: editFormData.description,
        system_prompt: editFormData.system_prompt,
        model_id: editFormData.model_id,
        temperature: editFormData.temperature,
        max_tokens: editFormData.max_tokens,
        tools: validTools,
      })

      if (result.success) {
        toast({
          title: "Agent Updated",
          description: "Your asset intelligence agent has been updated successfully.",
        })
        setIsEditingAgent(false)
        setSelectedAgent(null)
        setEditFormData({
          name: "",
          description: "",
          system_prompt: "",
          model_id: "",
          temperature: 0.7,
          max_tokens: 1000,
        })
        setSelectedTools([])
        // Reload agents
        window.location.reload()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update agent",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Error updating agent:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleExecuteAgent = async (agent: AssetIntelligenceAgent) => {
    console.log("[v0] Executing agent:", agent.id)

    setSelectedAgent(agent)
    setExecutionPrompt("")
    setExecutionResult(null)
    setSelectedAssets([])
    setSelectedTables([])
    setSelectedEndpoints([])
    setIncludeLearningData(false)
    setSelectedDataStreams([])
    setIsExecutingAgent(true)
    setSaveToLearning(false)

    setAssetsLoading(true)
    setAssetsError(null)
    try {
      const result = await getAssets()
      if (result.success && result.data) {
        setAvailableAssets(result.data)
      } else {
        setAssetsError(result.error || "Failed to load assets")
      }
    } catch (error) {
      console.error("[v0] Error loading assets:", error)
      setAssetsError("Failed to load assets")
    } finally {
      setAssetsLoading(false)
    }
  }

  const handleEditAgent = (agent: AssetIntelligenceAgent) => {
    console.log("[v0] Editing agent:", agent.id)
    console.log("[v0] Agent tools raw:", agent.tools)

    setSelectedAgent(agent)
    setEditFormData({
      name: agent.name,
      description: agent.description || "",
      system_prompt: agent.system_prompt || "",
      model_id: agent.model_id,
      temperature: agent.temperature,
      max_tokens: agent.max_tokens,
    })

    let toolNames: string[] = []
    if (agent.tools && Array.isArray(agent.tools)) {
      toolNames = agent.tools
        .map((tool: any) => {
          if (typeof tool === "string") {
            return tool
          } else if (tool && typeof tool === "object") {
            return tool.name || tool.tool_name || null
          }
          return null
        })
        .filter((name): name is string => name !== null && name !== undefined)
    }

    console.log("[v0] Extracted tool names:", toolNames)
    setSelectedTools(toolNames)
    setIsEditingAgent(true)
  }

  const handleDeleteAgent = async (agentId: string) => {
    console.log("[v0] Delete agent requested:", agentId)

    const confirmed = window.confirm("Are you sure you want to delete this agent? This action cannot be undone.")

    if (!confirmed) {
      console.log("[v0] Delete cancelled by user")
      return
    }

    setLoading(true)

    try {
      console.log("[v0] Deleting agent:", agentId)

      const result = await deleteAgent(agentId)

      if (result.success) {
        toast({
          title: "Agent Deleted",
          description: "The agent has been removed successfully.",
        })
        setAgents(agents.filter((a) => a.id !== agentId))
      } else {
        toast({
          title: "Delete Failed",
          description: result.error || "Failed to delete agent. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Error deleting agent:", error)
      toast({
        title: "Delete Failed",
        description: "Failed to delete agent. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const runAgent = async () => {
    if (!selectedAgent || !executionPrompt.trim()) return

    setLoading(true)
    setExecutionResult(null)

    try {
      const context: any = {}
      if (selectedAssets.length > 0) {
        context.assetIds = selectedAssets
      }
      if (selectedTables.length > 0) {
        context.tables = selectedTables
      }
      if (selectedEndpoints.length > 0) {
        context.endpoints = selectedEndpoints
      }
      if (includeLearningData) {
        context.includeLearningData = true
      }
      if (selectedDataStreams.length > 0) {
        context.dataStreamIds = selectedDataStreams
      }

      const result = await executeAgent({
        agentId: selectedAgent.id,
        prompt: executionPrompt,
        ...context,
      })

      if (result.success) {
        setExecutionResult(result.data)

        if (saveToLearning && result.data) {
          const learningResult = await saveToLearningLayer({
            name: `Asset Intelligence Agent: ${selectedAgent.name}`,
            description: `Execution of asset intelligence agent ${selectedAgent.name} with prompt: ${executionPrompt.substring(0, 100)}...`,
            executionType: "agent",
            executionId: selectedAgent.id,
            executionName: selectedAgent.name,
            assetIds: selectedAssets.length > 0 ? selectedAssets : undefined,
            executionInput: {
              prompt: executionPrompt,
              assetIds: selectedAssets,
              tables: selectedTables,
              endpoints: selectedEndpoints,
              dataStreams: selectedDataStreams,
            },
            executionOutput: {
              response: result.data.finalResponse,
              toolCalls: result.data.toolCalls || [],
            },
            executionMetrics: {
              tokens: result.data.tokens,
              elapsedMs: result.data.elapsedMs,
              iterations: result.data.iterations,
            },
            tags: ["asset-intelligence-agent", selectedAgent.name, ...selectedTables, ...selectedEndpoints],
          })

          if (learningResult.success) {
            toast({
              title: "Saved to Learning Layer",
              description: "This execution has been saved for future AI optimization.",
            })
          }
        }

        toast({
          title: "Agent Executed Successfully",
          description: `${selectedAgent.name} completed the task.`,
        })
      } else {
        toast({
          title: "Execution Failed",
          description: result.error || "Failed to execute agent",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Error executing agent:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadAllInsights = async () => {
    setInsightsLoading(true)
    try {
      const result = await getAllUserInsights()
      if (result.success) {
        setAllInsights(result.data || [])
      } else {
        console.error("[v0] Failed to load insights:", result.error)
      }
    } catch (error) {
      console.error("[v0] Error loading insights:", error)
    } finally {
      setInsightsLoading(false)
    }
  }

  useEffect(() => {
    console.log("[v0] AssetIntelligenceClient mounted")
    loadAssets()
    loadActiveAgents()
    loadUserWorkflows()
    loadAllInsights() // Load insights on mount
  }, [selectedAssetType, selectedStatus, searchQuery])

  const loadAssets = async () => {
    try {
      console.log("[v0] Loading assets...")
      setLoading(true)
      const result = await getAssets({
        asset_type: selectedAssetType !== "all" ? (selectedAssetType as any) : undefined,
        status: selectedStatus !== "all" ? (selectedStatus as any) : undefined,
        search_query: searchQuery || undefined,
      })

      console.log("[v0] Assets result:", result)

      if (result.success) {
        setAssets(result.data || [])
        console.log("[v0] Assets loaded:", result.data?.length || 0)
      } else {
        console.error("[v0] Failed to load assets:", result.error)
        toast({
          title: "Error",
          description: result.error || "Failed to load assets",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Error loading assets:", error)
      toast({
        title: "Error",
        description: "Failed to load assets",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadUserWorkflows = async () => {
    setWorkflowsLoading(true)
    try {
      const result = await getActiveWorkflows()
      if (result.success) {
        setUserWorkflows(result.data || [])
      } else {
        console.error("Failed to load workflows:", result.error)
        toast({
          title: "Error",
          description: result.error || "Failed to load workflows",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading workflows:", error)
      toast({
        title: "Error",
        description: "Failed to load workflows",
        variant: "destructive",
      })
    } finally {
      setWorkflowsLoading(false)
    }
  }

  const loadActiveAgents = async () => {
    if (!user?.id) return

    try {
      console.log("[v0] Fetching asset agents from database...")
      const result = await getAssetAgents(user.id)

      if (result.success && result.data) {
        console.log("[v0] Asset agents fetched successfully:", result.data.length)
        setAgents(result.data)
        setActiveAgents(result.data.filter((agent) => agent.is_active))
      } else {
        console.error("[v0] Failed to fetch asset agents:", result.error)
        toast({
          title: "Error",
          description: "Failed to load deployed agents",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Error loading active agents:", error)
      toast({
        title: "Error",
        description: "An error occurred while loading agents",
        variant: "destructive",
      })
    }
  }

  const loadInsights = async () => {
    try {
      console.log("[v0] Loading insights...")

      if (assets.length === 0) {
        console.log("[v0] No assets available for insights")
        setInsights([])
        return
      }

      const targetAsset = selectedAsset || assets[0]
      const targetAssetId = targetAsset?.id

      if (!targetAssetId) {
        console.log("[v0] No valid asset ID for insights")
        setInsights([])
        return
      }

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(targetAssetId)) {
        console.error("[v0] Invalid asset ID format:", targetAssetId)
        console.error("[v0] Target asset data:", targetAsset)
        toast({
          title: "Error",
          description: "Invalid asset ID format. Please refresh the page.",
          variant: "destructive",
        })
        return
      }

      console.log("[v0] Loading insights for asset:", targetAssetId)
      const result = await getAssetInsights(targetAssetId)
      if (result.success) {
        setInsights(result.data || [])
        console.log("[v0] Insights loaded:", result.data?.length || 0)
      } else {
        console.error("[v0] Failed to load insights:", result.error)
        toast({
          title: "Error",
          description: result.error || "Failed to load insights",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Error loading insights:", error)
      toast({
        title: "Error",
        description: "Failed to load insights",
        variant: "destructive",
      })
    }
  }

  const handleExecuteWorkflow = async (workflowId: string, assetIds: string[]) => {
    try {
      setIsExecutingWorkflow(true)
      const formData = new FormData()
      formData.append("workflowId", workflowId)
      formData.append("input", JSON.stringify({ asset_ids: assetIds }))
      formData.append("options", JSON.stringify({ autonomous_mode: true, learning_enabled: true }))

      const result = await executeWorkflow(formData)

      if (result.success) {
        toast({
          title: "Workflow Executed",
          description: "Workflow has been started successfully.",
        })
        setExecutingWorkflow(null)
        setSelectedWorkflowAssets([])
        loadUserWorkflows()
      } else {
        toast({
          title: "Execution Failed",
          description: result.error || "Failed to execute workflow",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error executing workflow:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsExecutingWorkflow(false)
    }
  }

  const handleCreateAsset = async () => {
    try {
      const result = await createAsset({
        ...assetForm,
        user_id: user?.id || "",
      })

      if (result.success) {
        toast({
          title: "Asset Created",
          description: "Your new asset has been added to the inventory.",
        })
        setShowCreateDialog(false)
        setAssetForm({
          name: "",
          description: "",
          asset_type: "equipment",
          status: "active",
          current_value: 0,
          purchase_date: "",
          purchase_cost: 0,
          depreciation_rate: 0,
          location_id: "",
          current_location: {},
          specifications: {},
          iot_sensor_id: "",
          nfc_tag_id: "",
          qr_code: "",
          maintenance_schedule: [],
          compliance_data: {},
          esg_metrics: {},
          metadata: {},
          asset_id: "",
          user_id: user?.id || "",
        })
        loadAssets()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create asset",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating asset:", error)
      toast({
        title: "Error",
        description: "Failed to create asset",
        variant: "destructive",
      })
    }
  }

  const handleGenerateInsights = async (assetId: string) => {
    try {
      setGeneratingInsights(assetId)
      const result = await generateAssetInsights({
        asset_id: assetId,
        analysis_types: [
          "predictive_maintenance",
          "cost_optimization",
          "utilization_analysis",
          "compliance_risk",
          "esg_impact",
          "lifecycle_prediction",
        ],
      })

      if (result.success) {
        toast({
          title: "Generating Insights",
          description: "AI analysis is running for this asset. Results will appear shortly.",
        })
        const insightsResult = await getAssetInsights(assetId)
        if (insightsResult.success) {
          setInsights(insightsResult.data || [])
        }
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to generate insights",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Error generating insights:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate insights",
        variant: "destructive",
      })
    } finally {
      setGeneratingInsights(null)
    }
  }

  const handleDeleteAsset = async (assetId: string) => {
    if (!confirm("Are you sure you want to delete this asset?")) return

    try {
      const result = await deleteAsset(assetId)

      if (result.success) {
        toast({
          title: "Asset Deleted",
          description: "Asset has been removed from your inventory.",
        })
        loadAssets()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete asset",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting asset:", error)
      toast({
        title: "Error",
        description: "Failed to delete asset",
        variant: "destructive",
      })
    }
  }

  const handleCreateAgent = (agent: any) => {
    toast({
      title: "Agent created",
      description: "Your asset intelligence agent has been created successfully.",
    })
    setIsCreating(false)
    window.location.reload()
  }

  const handleStartWorkflow = async (workflowType: string) => {
    const selectedAssetIds = assets.map((asset) => asset.id)

    if (selectedAssetIds.length === 0) {
      toast({
        title: "No Assets",
        description: "Please add some assets before starting a workflow.",
        variant: "destructive",
      })
      return
    }

    const matchingWorkflow = userWorkflows.find(
      (w) =>
        w.name.toLowerCase().includes(workflowType.toLowerCase()) ||
        w.category === workflowType.toLowerCase().replace(" ", "_"),
    )

    if (matchingWorkflow) {
      await handleExecuteWorkflow(matchingWorkflow.id, selectedAssetIds)
    } else {
      toast({
        title: "Workflow Started",
        description: `${workflowType} workflow has been initiated and will process all relevant assets.`,
      })
    }
    setShowWorkflowDialog(false)
  }

  const handleFormChange = (field: keyof CreateAsset, value: any) => {
    setAssetForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const filteredAssets = assets.filter((asset) => {
    if (selectedAssetType !== "all" && asset.asset_type !== selectedAssetType) return false
    if (selectedStatus !== "all" && asset.status !== selectedStatus) return false
    if (searchQuery && !asset.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const loadInsightsAgent = useCallback(async () => {
    try {
      const insightsAgent = agents.find(
        (agent) => agent.name === "Asset Insights Generator" && agent.category === "system",
      )
      if (insightsAgent) {
        setInsightsAgentModelId(insightsAgent.model_id || "gemini-2.5-pro")
      }
    } catch (error) {
      console.error("[v0] Error loading insights agent:", error)
    }
  }, [agents])

  useEffect(() => {
    loadInsightsAgent()
  }, [agents, loadInsightsAgent])

  const handleUpdateInsightsAgentModel = async (newModelId: string) => {
    try {
      const result = await updateInsightsAgentModel(newModelId)

      if (result.success) {
        setInsightsAgentModelId(newModelId)
        toast({
          title: "Model Updated",
          description: "Asset insights will now use the selected AI model",
        })
        await loadActiveAgents()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update model",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Error updating insights agent model:", error)
      toast({
        title: "Error",
        description: "Failed to update AI model configuration",
        variant: "destructive",
      })
    }
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Asset Intelligence
            </h1>
            <p className="text-muted-foreground mt-1">
              AI-powered asset lifecycle management with predictive analytics
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Asset</span>
            </Button>
            <Button variant="outline" onClick={loadAssets} disabled={loading} className="gap-2 bg-transparent">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="enterprise-card group relative overflow-hidden hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] border border-border/50 bg-card/80 backdrop-blur-sm">
            <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/20 via-transparent to-accent/20" />
            </div>
            <CardContent className="p-4 sm:p-5 relative z-10">
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary to-accent opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
                  <Package className="h-6 w-6 text-primary relative z-10" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="dashboard-metric-label text-xs sm:text-sm mb-1">Total Assets</p>
                  <p className="dashboard-metric-value text-xl sm:text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    {assets.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="enterprise-card group relative overflow-hidden hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] border border-border/50 bg-card/80 backdrop-blur-sm">
            <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-green-500/20 via-transparent to-emerald-500/20" />
            </div>
            <CardContent className="p-4 sm:p-5 relative z-10">
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 via-green-500/10 to-emerald-500/20 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 relative z-10" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="dashboard-metric-label text-xs sm:text-sm mb-1">Active</p>
                  <p className="dashboard-metric-value text-xl sm:text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    {assets.filter((a) => a.status === "active").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="enterprise-card group relative overflow-hidden hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] border border-border/50 bg-card/80 backdrop-blur-sm">
            <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-yellow-500/20 via-transparent to-orange-500/20" />
            </div>
            <CardContent className="p-4 sm:p-5 relative z-10">
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500/20 via-yellow-500/10 to-orange-500/20 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
                  <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400 relative z-10" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="dashboard-metric-label text-xs sm:text-sm mb-1">Maintenance</p>
                  <p className="dashboard-metric-value text-xl sm:text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    {assets.filter((a) => a.status === "maintenance").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="enterprise-card group relative overflow-hidden hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] border border-border/50 bg-card/80 backdrop-blur-sm">
            <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-500/20 via-transparent to-cyan-500/20" />
            </div>
            <CardContent className="p-4 sm:p-5 relative z-10">
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 via-blue-500/10 to-cyan-500/20 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
                  <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400 relative z-10" />
                </div>
                <div className="flex-1 min-w-0 overflow-hidden">
                  <p className="dashboard-metric-label text-xs sm:text-sm mb-1 whitespace-nowrap">Total Value</p>
                  <p className="dashboard-metric-value text-base sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent truncate">
                    {formatCurrency(assets.reduce((sum, a) => sum + (a.current_value || 0), 0))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
            <TabsTrigger value="assets" className="gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Assets</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="gap-2">
              <Lightbulb className="h-4 w-4" />
              <span className="hidden sm:inline">Insights</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Assets Tab */}
          <TabsContent value="assets" className="space-y-4">
            {/* Search and Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search assets..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select value={selectedAssetType} onValueChange={setSelectedAssetType}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="equipment">Equipment</SelectItem>
                        <SelectItem value="vehicle">Vehicle</SelectItem>
                        <SelectItem value="container">Container</SelectItem>
                        <SelectItem value="device">Device</SelectItem>
                        <SelectItem value="infrastructure">Infrastructure</SelectItem>
                        <SelectItem value="inventory">Inventory</SelectItem>
                        <SelectItem value="digital">Digital</SelectItem>
                        <SelectItem value="building">Building</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="retired">Retired</SelectItem>
                        <SelectItem value="lost">Lost</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Assets Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4 space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-20 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredAssets.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Assets Found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || selectedAssetType !== "all" || selectedStatus !== "all"
                      ? "No assets match your current filters."
                      : "Get started by adding your first asset."}
                  </p>
                  <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Asset
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAssets.map((asset) => (
                  <Card
                    key={asset.id}
                    className="enterprise-card group relative overflow-hidden hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] border border-border/50 bg-card/80 backdrop-blur-sm"
                  >
                    {/* Holographic border effect */}
                    <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/20 via-transparent to-accent/20" />
                    </div>

                    {/* Animated gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <CardHeader className="pb-3 relative z-10">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="relative flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary to-accent opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
                            <div className="relative z-10">{getAssetTypeIcon(asset.asset_type)}</div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base sm:text-lg font-bold line-clamp-1 break-words bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                              {asset.name}
                            </CardTitle>
                            <Badge
                              variant="outline"
                              className="mt-1.5 text-xs font-semibold border-primary/30 bg-primary/10 text-primary capitalize"
                            >
                              {asset.asset_type}
                            </Badge>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 relative z-10 hover:bg-primary/10 hover:text-primary transition-all duration-300"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedAsset(asset)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleGenerateInsights(asset.id)}
                              disabled={generatingInsights === asset.id}
                            >
                              <Sparkles className="h-4 w-4 mr-2" />
                              {generatingInsights === asset.id ? "Generating..." : "Generate Insights"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDeleteAsset(asset.id)} className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>

                    <CardContent className="pb-3 relative z-10 space-y-3">
                      {asset.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                          {asset.description}
                        </p>
                      )}

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/30 backdrop-blur-sm border border-border/50">
                          <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                            <Activity className="h-3.5 w-3.5 text-primary" />
                            Status
                          </span>
                          <Badge
                            variant={asset.status === "active" ? "default" : "secondary"}
                            className="text-xs capitalize"
                          >
                            {asset.status}
                          </Badge>
                        </div>

                        {asset.current_value !== undefined && asset.current_value !== null && (
                          <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/30 backdrop-blur-sm border border-border/50">
                            <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                              <DollarSign className="h-3.5 w-3.5 text-accent" />
                              Current Value
                            </span>
                            <span className="font-bold text-foreground">{formatCurrency(asset.current_value)}</span>
                          </div>
                        )}

                        {asset.purchase_date && (
                          <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/30 backdrop-blur-sm border border-border/50">
                            <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                              <Clock className="h-3.5 w-3.5 text-secondary" />
                              Purchased
                            </span>
                            <span className="font-medium text-foreground">
                              {new Date(asset.purchase_date).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>

                    <CardFooter className="flex justify-between gap-2 pt-3 border-t border-border/50 bg-muted/20 relative z-10">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => setSelectedAsset(asset)}
                        className="flex-1 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 font-semibold"
                      >
                        <Eye className="h-3.5 w-3.5 mr-1.5" />
                        View Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleGenerateInsights(asset.id)}
                        disabled={generatingInsights === asset.id}
                        className="bg-card/50 backdrop-blur-sm border-border/50 hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all duration-300"
                      >
                        {generatingInsights === asset.id ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">AI-Generated Insights</h2>
                <p className="text-sm text-muted-foreground">
                  Predictive analytics and recommendations for your assets
                </p>
              </div>
              <Button
                variant="outline"
                onClick={loadAllInsights}
                disabled={insightsLoading}
                className="gap-2 bg-transparent"
              >
                <RefreshCw className={`h-4 w-4 ${insightsLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>

            {insightsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2 mb-4" />
                      <Skeleton className="h-20 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : allInsights.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Insights Yet</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
                    Generate AI insights for your assets to see predictive maintenance alerts, cost optimization
                    opportunities, and more.
                  </p>
                  <Button onClick={() => setActiveTab("assets")} className="gap-2">
                    <Package className="h-4 w-4" />
                    View Assets
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allInsights.map(
                  (
                    insight: AssetInsight, // Changed to AssetInsight type
                  ) => {
                    const isExpanded = expandedInsightId === insight.id
                    return (
                      <Card
                        key={insight.id}
                        className="hover:shadow-md transition-all cursor-pointer group"
                        onClick={() => setExpandedInsightId(isExpanded ? null : insight.id)}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                {getInsightIcon(insight.insight_type)}
                              </div>
                              <div>
                                <CardTitle className="text-sm font-medium">
                                  {formatInsightType(insight.insight_type)}
                                </CardTitle>
                                <CardDescription className="text-xs">
                                  {insight.assets?.name || "Unknown Asset"}
                                </CardDescription>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={getPriorityColor(insight.priority)}>
                                {insight.priority}
                              </Badge>
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-2">
                          {insight.insight_data && (
                            <div className="space-y-2">
                              {insight.insight_data.summary && (
                                <p className="text-sm text-muted-foreground">{insight.insight_data.summary}</p>
                              )}
                              {insight.insight_data.score !== undefined && (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">Score:</span>
                                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-primary rounded-full"
                                      style={{ width: `${Math.min(insight.insight_data.score, 100)}%` }}
                                    />
                                  </div>
                                  <span className="text-xs font-medium">{insight.insight_data.score?.toFixed(1)}%</span>
                                </div>
                              )}

                              {/* Collapsed view - show limited recommendations */}
                              {!isExpanded && insight.recommendations && insight.recommendations.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs font-medium text-muted-foreground mb-1">
                                    Recommendations ({insight.recommendations.length}):
                                  </p>
                                  <ul className="text-xs space-y-1">
                                    {insight.recommendations.slice(0, 2).map((rec: any, idx: number) => (
                                      <li key={idx} className="flex items-start gap-1">
                                        <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 shrink-0" />
                                        <span className="line-clamp-1">
                                          {typeof rec === "string" ? rec : rec.text || rec.action}
                                        </span>
                                      </li>
                                    ))}
                                    {insight.recommendations.length > 2 && (
                                      <li className="text-xs text-primary font-medium">
                                        +{insight.recommendations.length - 2} more...
                                      </li>
                                    )}
                                  </ul>
                                </div>
                              )}

                              {/* Expanded view - show full details */}
                              {isExpanded && (
                                <div className="mt-4 space-y-4 animate-in fade-in-50 duration-300">
                                  <Separator />

                                  {/* Full Recommendations */}
                                  {insight.recommendations && insight.recommendations.length > 0 && (
                                    <div>
                                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-primary" />
                                        All Recommendations ({insight.recommendations.length})
                                      </h4>
                                      <ul className="text-sm space-y-2">
                                        {insight.recommendations.map((rec: any, idx: number) => (
                                          <li key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-muted/50">
                                            <span className="text-primary font-semibold shrink-0">{idx + 1}.</span>
                                            <span>{typeof rec === "string" ? rec : rec.text || rec.action}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {/* Full Insight Data */}
                                  {insight.insight_data && (
                                    <div>
                                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                        <Brain className="h-4 w-4 text-primary" />
                                        Detailed Analysis
                                      </h4>
                                      <div className="space-y-2 text-sm">
                                        {Object.entries(insight.insight_data).map(([key, value]) => {
                                          if (key === "summary" || value === null || value === undefined) return null
                                          return (
                                            <div key={key} className="flex flex-col gap-1 p-2 rounded-lg bg-muted/30">
                                              <span className="text-xs font-medium text-muted-foreground capitalize">
                                                {key.replace(/_/g, " ")}:
                                              </span>
                                              <span className="text-foreground">
                                                {typeof value === "object"
                                                  ? JSON.stringify(value, null, 2)
                                                  : String(value)}
                                              </span>
                                            </div>
                                          )
                                        })}
                                      </div>
                                    </div>
                                  )}

                                  {/* Metadata */}
                                  <div>
                                    <h4 className="text-sm font-semibold mb-2">Metadata</h4>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                      <div className="p-2 rounded-lg bg-muted/30">
                                        <span className="text-muted-foreground">Created:</span>
                                        <p className="font-medium">
                                          {new Date(insight.created_at).toLocaleString()}
                                        </p>
                                      </div>
                                      <div className="p-2 rounded-lg bg-muted/30">
                                        <span className="text-muted-foreground">Status:</span>
                                        <p className="font-medium capitalize">{insight.status}</p>
                                      </div>
                                      <div className="p-2 rounded-lg bg-muted/30">
                                        <span className="text-muted-foreground">Priority:</span>
                                        <p className="font-medium capitalize">{insight.priority}</p>
                                      </div>
                                      <div className="p-2 rounded-lg bg-muted/30">
                                        <span className="text-muted-foreground">Type:</span>
                                        <p className="font-medium">{formatInsightType(insight.insight_type)}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {!isExpanded && (
                            <div className="flex items-center justify-between mt-3 pt-2 border-t">
                              <span className="text-xs text-muted-foreground">
                                {new Date(insight.created_at).toLocaleDateString()}
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                {insight.status}
                              </Badge>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  },
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Asset Analytics</h2>
                <p className="text-sm text-muted-foreground">
                  Performance metrics and trends across your asset portfolio
                </p>
              </div>
            </div>

            {/* Analytics Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    Portfolio Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {assets.length > 0
                      ? Math.round((assets.filter((a) => a.status === "active").length / assets.length) * 100)
                      : 0}
                    %
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {assets.filter((a) => a.status === "active").length} of {assets.length} assets active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-600" />
                    Total Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{allInsights.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {allInsights.filter((i) => i.priority === "high" || i.priority === "critical").length} high priority
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    Maintenance Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">
                    {assets.filter((a) => a.status === "maintenance").length}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Assets requiring attention</p>
                </CardContent>
              </Card>
            </div>

            {/* Asset Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Asset Distribution by Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      "equipment",
                      "vehicle",
                      "infrastructure",
                      "device",
                      "digital",
                      "building",
                      "container",
                      "inventory",
                    ]
                      .map((type) => {
                        const count = assets.filter((a) => a.asset_type === type).length
                        const percentage = assets.length > 0 ? (count / assets.length) * 100 : 0
                        if (count === 0) return null
                        return (
                          <div key={type} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                              {getAssetTypeIcon(type)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm capitalize">{type}</span>
                                <span className="text-sm text-muted-foreground">{count}</span>
                              </div>
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full" style={{ width: `${percentage}%` }} />
                              </div>
                            </div>
                          </div>
                        )
                      })
                      .filter(Boolean)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Insights by Priority</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {["critical", "high", "medium", "low"].map((priority) => {
                      const count = allInsights.filter((i) => i.priority === priority).length
                      const percentage = allInsights.length > 0 ? (count / allInsights.length) * 100 : 0
                      return (
                        <div key={priority} className="flex items-center gap-3">
                          <Badge variant="outline" className={`${getPriorityColor(priority)} w-20 justify-center`}>
                            {priority}
                          </Badge>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden mr-2">
                                <div
                                  className={`h-full rounded-full ${
                                    priority === "critical"
                                      ? "bg-red-500"
                                      : priority === "high"
                                        ? "bg-orange-500"
                                        : priority === "medium"
                                          ? "bg-yellow-500"
                                          : "bg-green-500"
                                  }`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-sm text-muted-foreground w-8 text-right">{count}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Value Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Portfolio Value by Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {["active", "inactive", "maintenance", "retired", "lost"].map((status) => {
                    const statusAssets = assets.filter((a) => a.status === status)
                    const totalValue = statusAssets.reduce((sum, a) => sum + (a.current_value || 0), 0)
                    return (
                      <div key={status} className="text-center p-3 rounded-lg bg-muted/50">
                        <Badge variant="outline" className={`${getStatusColor(status)} mb-2`}>
                          {status}
                        </Badge>
                        <p className="text-lg font-bold">{formatCurrency(totalValue)}</p>
                        <p className="text-xs text-muted-foreground">{statusAssets.length} assets</p>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  AI Model Configuration
                </CardTitle>
                <CardDescription>Configure the AI model used for asset insights generation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Asset Insights Generator Model</Label>
                  <Select
                    value={insightsAgentModelId || "gemini-2.5-pro"}
                    onValueChange={handleUpdateInsightsAgentModel}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select AI Model" />
                    </SelectTrigger>
                    <SelectContent>
                      {aiModels.map((model) => (
                        <SelectItem key={model.model_id || model.id} value={model.model_id || model.id}>
                          {model.name}
                        </SelectItem>
                      ))}
                      {aiModels.length === 0 && (
                        <>
                          <SelectItem value="gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
                          <SelectItem value="gemini-3-pro">Gemini 3 Pro</SelectItem>
                          <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                          <SelectItem value="claude-3.5-sonnet">Claude 3.5 Sonnet</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    This model will be used to generate predictive maintenance, cost optimization, and other AI-powered
                    insights for your assets.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Analysis Types
                </CardTitle>
                <CardDescription>Configure which types of analysis to run on your assets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      id: "predictive_maintenance",
                      label: "Predictive Maintenance",
                      description: "Predict equipment failures before they occur",
                    },
                    {
                      id: "cost_optimization",
                      label: "Cost Optimization",
                      description: "Identify opportunities to reduce costs",
                    },
                    {
                      id: "utilization_analysis",
                      label: "Utilization Analysis",
                      description: "Analyze asset utilization patterns",
                    },
                    {
                      id: "compliance_risk",
                      label: "Compliance Risk",
                      description: "Identify compliance and regulatory risks",
                    },
                    { id: "esg_impact", label: "ESG Impact", description: "Environmental, Social, Governance metrics" },
                    {
                      id: "lifecycle_prediction",
                      label: "Lifecycle Prediction",
                      description: "Predict asset lifecycle stages",
                    },
                  ].map((analysis) => (
                    <div key={analysis.id} className="flex items-start gap-3 p-3 rounded-lg border">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">{analysis.label}</p>
                        <p className="text-xs text-muted-foreground">{analysis.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Asset Dialog - Comprehensive 44-field form */}
        <ComprehensiveAssetDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onAssetCreated={() => {
            loadAssets()
            loadAllInsights()
          }}
          userId={user?.id || ""}
        />

        {/* Asset Details Dialog */}
        <Dialog open={!!selectedAsset} onOpenChange={() => setSelectedAsset(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedAsset && getAssetTypeIcon(selectedAsset.asset_type)}
                {selectedAsset?.name}
              </DialogTitle>
              <DialogDescription>Asset details and information</DialogDescription>
            </DialogHeader>
            {selectedAsset && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="font-medium capitalize">{selectedAsset.asset_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant="outline" className={getStatusColor(selectedAsset.status)}>
                      {selectedAsset.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Current Value</p>
                    <p className="font-medium">{formatCurrency(selectedAsset.current_value)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Asset ID</p>
                    <p className="font-mono text-sm">{selectedAsset.asset_id}</p>
                  </div>
                </div>
                {selectedAsset.description && (
                  <div>
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="text-sm">{selectedAsset.description}</p>
                  </div>
                )}
                <div className="pt-4 border-t flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 gap-2 bg-transparent"
                    onClick={() => {
                      handleGenerateInsights(selectedAsset.id)
                      setSelectedAsset(null)
                    }}
                  >
                    <Sparkles className="h-4 w-4" />
                    Generate Insights
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
