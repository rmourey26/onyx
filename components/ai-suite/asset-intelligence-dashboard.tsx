"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Plus,
  Upload,
  BarChart3,
  TrendingUp,
  Clock,
  DollarSign,
  Wrench,
  Shield,
  Leaf,
  Brain,
  Zap,
  Activity,
  Settings,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Download,
  Home,
  Building,
  Truck,
  Server,
  Smartphone,
  AlertTriangle,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { AssetAgentSelector } from "@/components/asset-intelligence/asset-agent-selector"
import { AssetWorkflowTemplateSelector } from "@/components/asset-intelligence/asset-workflow-template-selector"
import { AssetRAGSearch } from "@/components/asset-intelligence/asset-rag-search"
import { AssetIntelligenceClient } from "./asset-intelligence-client"
import { getAssets, getAssetAnalytics, getAssetInsights } from "@/app/actions/asset-intelligence-actions"
import useSWR from "swr"
import { ComprehensiveAssetDialog } from "@/components/asset-intelligence/comprehensive-asset-dialog"

interface Asset {
  id: string
  name: string
  asset_type: string
  category: string | null
  status: string
  current_value: number | null
  created_at: string | null
  description: string | null
  asset_id: string
  user_id: string
}

interface AssetInsight {
  id: string
  insight_type: string
  priority: string
  asset_id: string
  insight_data: any
  confidence_score: number | null
  status: string
  created_at: string | null
  recommendations: any
}

interface AssetAnalytics {
  total_assets: number | null
  active_assets: number | null
  maintenance_assets: number | null
  total_asset_value: number | null
  avg_asset_value: number | null
  total_insights: number | null
  iot_enabled_assets: number | null
  total_lifecycle_events: number | null
}

const fetcher = async (url: string) => {
  if (url === "assets") {
    const result = await getAssets()
    if (result.success) return result.data
    throw new Error(result.error)
  }
  if (url === "analytics") {
    const result = await getAssetAnalytics()
    if (result.success) return result.data?.[0] || {}
    throw new Error(result.error)
  }
  if (url.startsWith("insights-")) {
    const assetId = url.substring("insights-".length)
    const result = await getAssetInsights(assetId)
    if (result.success) return result.data
    throw new Error(result.error)
  }
  return null
}

export function AssetIntelligenceDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAssetType, setSelectedAssetType] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [showCreateAsset, setShowCreateAsset] = useState(false)
  const [showImportAssets, setShowImportAssets] = useState(false)
  const [showAgentSelector, setShowAgentSelector] = useState(false)
  const [showWorkflowSelector, setShowWorkflowSelector] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedAssets, setSelectedAssets] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")
  const [isLoading, setIsLoading] = useState(false)

  const { data: assets = [], error: assetsError, mutate: mutateAssets } = useSWR<Asset[]>("assets", fetcher)
  const {
    data: analytics = {},
    error: analyticsError,
    mutate: mutateAnalytics,
  } = useSWR<AssetAnalytics>("analytics", fetcher)
  const { data: allInsights = [], error: insightsError } = useSWR<AssetInsight[]>(
    assets.length > 0 ? `insights-${assets[0]?.id}` : null,
    fetcher,
  )

  const metrics = {
    total_assets: analytics.total_assets || assets.length || 0,
    active_assets: analytics.active_assets || assets.filter((a) => a.status === "active").length || 0,
    maintenance_due: analytics.maintenance_assets || assets.filter((a) => a.status === "maintenance").length || 0,
    total_value: analytics.total_asset_value || assets.reduce((sum, a) => sum + (a.current_value || 0), 0) || 0,
    avg_utilization: 78, // This would need to be calculated from IoT data
    cost_savings: 125000, // This would come from insights analysis
    esg_score: 82, // This would come from ESG metrics
    insights_generated: analytics.total_insights || allInsights.length || 0,
  }

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (asset.description && asset.description.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesType = selectedAssetType === "all" || asset.asset_type === selectedAssetType
    const matchesStatus = selectedStatus === "all" || asset.status === selectedStatus
    return matchesSearch && matchesType && matchesStatus
  })

  const handleAssetSelect = (assetId: string) => {
    setSelectedAssets((prev) => (prev.includes(assetId) ? prev.filter((id) => id !== assetId) : [...prev, assetId]))
  }

  const handleSelectAll = () => {
    if (selectedAssets.length === filteredAssets.length) {
      setSelectedAssets([])
    } else {
      setSelectedAssets(filteredAssets.map((asset) => asset.id))
    }
  }

  const handleRefreshData = async () => {
    setIsLoading(true)
    try {
      await Promise.all([mutateAssets(), mutateAnalytics()])
      toast({
        title: "Data Refreshed",
        description: "Asset intelligence data has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!assets && !assetsError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading asset intelligence data...</span>
        </div>
      </div>
    )
  }

  if (assetsError || analyticsError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
          <h3 className="text-lg font-semibold mb-1">Failed to Load Data</h3>
          <p className="text-muted-foreground mb-4">
            {assetsError?.message || analyticsError?.message || "An error occurred while loading asset data."}
          </p>
          <Button onClick={handleRefreshData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    )
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
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "predictive_maintenance":
        return <Wrench className="h-4 w-4" />
      case "cost_optimization":
        return <DollarSign className="h-4 w-4" />
      case "utilization_analysis":
        return <BarChart3 className="h-4 w-4" />
      case "compliance_risk":
        return <Shield className="h-4 w-4" />
      case "esg_impact":
        return <Leaf className="h-4 w-4" />
      default:
        return <Brain className="h-4 w-4" />
    }
  }

  const handleCreateAsset = () => {
    setShowCreateAsset(true)
  }

  const handleImportAssets = () => {
    setShowImportAssets(true)
  }

  const getAssetTypeIcon = (type: string) => {
    switch (type) {
      case "equipment":
        return <Building className="h-4 w-4" />
      case "vehicle":
        return <Truck className="h-4 w-4" />
      case "infrastructure":
        return <Server className="h-4 w-4" />
      case "device":
        return <Smartphone className="h-4 w-4" />
      case "digital":
        return <Activity className="h-4 w-4" />
      case "building":
        return <Building className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const handleBulkAction = (action: string) => {
    if (selectedAssets.length === 0) {
      toast({
        title: "No Assets Selected",
        description: "Please select assets to perform bulk actions.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: `Bulk ${action}`,
      description: `${action} applied to ${selectedAssets.length} assets.`,
    })
    setSelectedAssets([])
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-8">
          <div className="space-y-3 sm:space-y-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard" className="flex items-center gap-1">
                    <Home className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/ai-suite" className="hidden sm:inline">
                    AI Suite
                  </BreadcrumbLink>
                  <BreadcrumbLink href="/ai-suite" className="sm:hidden">
                    Suite
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="hidden sm:inline">Asset Intelligence</BreadcrumbPage>
                  <BreadcrumbPage className="sm:hidden">Assets</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent leading-tight">
                  Asset Intelligence Dashboard
                </h1>
                <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base lg:text-lg leading-relaxed">
                  Comprehensive asset lifecycle management with AI-powered insights and predictive analytics
                </p>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleRefreshData}
                      variant="outline"
                      disabled={isLoading}
                      size="sm"
                      className="flex-1 sm:flex-none bg-transparent"
                    >
                      <RefreshCw className={`h-4 w-4 sm:mr-2 ${isLoading ? "animate-spin" : ""}`} />
                      <span className="hidden sm:inline">Refresh</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Refresh asset data and insights</p>
                  </TooltipContent>
                </Tooltip>

                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1 sm:flex-none bg-transparent">
                      <Brain className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">AI Agents</span>
                      <span className="sm:hidden">Agents</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
                    <SheetHeader className="pb-4">
                      <SheetTitle>AI Agent Management</SheetTitle>
                      <SheetDescription>
                        Configure and deploy AI agents for automated asset intelligence
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6">
                      <AssetAgentSelector
                        userId="demo-user"
                        assets={assets}
                        onAgentCreated={() => {}}
                        onCancel={() => {}}
                      />
                    </div>
                  </SheetContent>
                </Sheet>

                <Button
                  onClick={() => setShowWorkflowSelector(true)}
                  variant="outline"
                  size="sm"
                  className="flex-1 sm:flex-none"
                >
                  <Zap className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Workflows</span>
                  <span className="sm:hidden">Flows</span>
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
            <HoverCard>
              <HoverCardTrigger asChild>
                <Card
                  className="enterprise-card cursor-pointer hover:scale-105 transition-all duration-200 hover:shadow-lg"
                  onClick={handleCreateAsset}
                >
                  <CardContent className="p-3 sm:p-6 text-center">
                    <div className="w-8 h-8 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4">
                      <Plus className="h-4 w-4 sm:h-6 sm:w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-xs sm:text-base mb-1 sm:mb-2">Create Asset</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                      Add new assets to your inventory
                    </p>
                  </CardContent>
                </Card>
              </HoverCardTrigger>
              <HoverCardContent className="w-80 hidden sm:block">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Create New Asset</h4>
                  <p className="text-sm text-muted-foreground">
                    Quickly add individual assets with comprehensive metadata, tracking capabilities, and AI-powered
                    insights.
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>

            <HoverCard>
              <HoverCardTrigger asChild>
                <Card
                  className="enterprise-card cursor-pointer hover:scale-105 transition-all duration-200 hover:shadow-lg"
                  onClick={handleImportAssets}
                >
                  <CardContent className="p-3 sm:p-6 text-center">
                    <div className="w-8 h-8 sm:w-12 sm:h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4">
                      <Upload className="h-4 w-4 sm:h-6 sm:w-6 text-accent" />
                    </div>
                    <h3 className="font-semibold text-xs sm:text-base mb-1 sm:mb-2">Import Assets</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                      Bulk import from CSV or Excel
                    </p>
                  </CardContent>
                </Card>
              </HoverCardTrigger>
              <HoverCardContent className="w-80 hidden sm:block">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Bulk Asset Import</h4>
                  <p className="text-sm text-muted-foreground">
                    Import hundreds of assets at once using CSV or Excel files. Supports data validation and duplicate
                    detection.
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>

            <Card className="enterprise-card cursor-pointer hover:scale-105 transition-all duration-200 hover:shadow-lg">
              <CardContent className="p-3 sm:p-6 text-center">
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4">
                  <Download className="h-4 w-4 sm:h-6 sm:w-6 text-secondary" />
                </div>
                <h3 className="font-semibold text-xs sm:text-base mb-1 sm:mb-2">Export Report</h3>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                  Generate comprehensive analytics
                </p>
              </CardContent>
            </Card>

            <Card className="enterprise-card cursor-pointer hover:scale-105 transition-all duration-200 hover:shadow-lg">
              <CardContent className="p-3 sm:p-6 text-center">
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-enterprise-teal/10 rounded-full flex items-center justify-center flex-shrink-0 ml-2">
                  <Settings className="h-4 w-4 sm:h-6 sm:w-6 text-enterprise-teal" />
                </div>
                <h3 className="font-semibold text-xs sm:text-base mb-1 sm:mb-2">Configure</h3>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Customize dashboard settings</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <Card className="dashboard-metric-card">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="dashboard-metric-label text-xs sm:text-sm">Total Assets</p>
                    <p className="dashboard-metric-value text-xl sm:text-2xl lg:text-3xl">{metrics.total_assets}</p>
                    <div className="flex items-center gap-1 mt-1 sm:mt-2">
                      <ArrowUpRight className="h-2 w-2 sm:h-3 sm:w-3 text-green-600 flex-shrink-0" />
                      <span className="text-[10px] sm:text-xs text-green-600 font-medium truncate">
                        +12% from last month
                      </span>
                    </div>
                  </div>
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 ml-2">
                    <Activity className="h-4 w-4 sm:h-6 sm:w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="dashboard-metric-card">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="dashboard-metric-label text-xs sm:text-sm">Total Value</p>
                    <p className="dashboard-metric-value text-xl sm:text-2xl lg:text-3xl">
                      ${(metrics.total_value / 1000000).toFixed(1)}M
                    </p>
                    <div className="flex items-center gap-1 mt-1 sm:mt-2">
                      <ArrowUpRight className="h-2 w-2 sm:h-3 sm:w-3 text-green-600 flex-shrink-0" />
                      <span className="text-[10px] sm:text-xs text-green-600 font-medium truncate">
                        +8% from last month
                      </span>
                    </div>
                  </div>
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0 ml-2">
                    <DollarSign className="h-4 w-4 sm:h-6 sm:w-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="dashboard-metric-card">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="dashboard-metric-label text-xs sm:text-sm">Active Assets</p>
                    <p className="dashboard-metric-value text-xl sm:text-2xl lg:text-3xl">{metrics.active_assets}</p>
                    <div className="flex items-center gap-1 mt-1 sm:mt-2">
                      <ArrowDownRight className="h-2 w-2 sm:h-3 sm:w-3 text-red-600 flex-shrink-0" />
                      <span className="text-[10px] sm:text-xs text-red-600 font-medium truncate">
                        -3% from last month
                      </span>
                    </div>
                  </div>
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0 ml-2">
                    <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 text-secondary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="dashboard-metric-card">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="dashboard-metric-label text-xs sm:text-sm">Insights Generated</p>
                    <p className="dashboard-metric-value text-xl sm:text-2xl lg:text-3xl">
                      {metrics.insights_generated}
                    </p>
                    <div className="flex items-center gap-1 mt-1 sm:mt-2">
                      <Minus className="h-2 w-2 sm:h-3 sm:w-3 text-gray-600 flex-shrink-0" />
                      <span className="text-[10px] sm:text-xs text-gray-600 font-medium truncate">No change</span>
                    </div>
                  </div>
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-enterprise-teal/10 rounded-full flex items-center justify-center flex-shrink-0 ml-2">
                    <Leaf className="h-4 w-4 sm:h-6 sm:w-6 text-enterprise-teal" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="overflow-x-auto flex-1">
                <TabsList className="grid w-full grid-cols-3 min-w-[400px] sm:min-w-0">
                  <TabsTrigger value="overview" className="text-xs sm:text-sm">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="assets" className="text-xs sm:text-sm">
                    Assets
                  </TabsTrigger>
                  <TabsTrigger value="insights" className="text-xs sm:text-sm">
                    Insights
                  </TabsTrigger>
                </TabsList>
              </div>

              <Button onClick={() => setShowCreateAsset(true)} size="sm" className="flex-shrink-0">
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Create Asset</span>
              </Button>
            </div>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <Card className="enterprise-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Assets</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl sm:text-3xl font-bold">{metrics.total_assets}</div>
                    <p className="text-xs text-muted-foreground mt-1">Across all locations</p>
                  </CardContent>
                </Card>

                <Card className="enterprise-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Active Assets</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl sm:text-3xl font-bold">{metrics.active_assets}</div>
                    <p className="text-xs text-muted-foreground mt-1">Currently operational</p>
                  </CardContent>
                </Card>

                <Card className="enterprise-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl sm:text-3xl font-bold">${(metrics.total_value / 1000).toFixed(0)}K</div>
                    <p className="text-xs text-muted-foreground mt-1">Asset portfolio value</p>
                  </CardContent>
                </Card>

                <Card className="enterprise-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl sm:text-3xl font-bold">{metrics.insights_generated}</div>
                    <p className="text-xs text-muted-foreground mt-1">AI-generated</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <Card className="enterprise-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Asset Distribution
                    </CardTitle>
                    <CardDescription>Assets by type and status</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(
                      assets.reduce(
                        (acc, asset) => {
                          acc[asset.asset_type] = (acc[asset.asset_type] || 0) + 1
                          return acc
                        },
                        {} as Record<string, number>,
                      ),
                    ).map(([type, count]) => (
                      <div key={type} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="capitalize flex items-center gap-2">
                            {getAssetTypeIcon(type)}
                            {type}
                          </span>
                          <span className="font-medium">{count}</span>
                        </div>
                        <Progress value={(count / assets.length) * 100} className="h-2" />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="enterprise-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Maintenance Schedule
                    </CardTitle>
                    <CardDescription>Upcoming maintenance activities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {assets
                        .filter((a) => a.created_at)
                        .slice(0, 3)
                        .map((asset) => (
                          <div key={asset.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                              <div>
                                <p className="font-medium">{asset.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {asset.description || "No location specified"}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">
                                {asset.created_at ? new Date(asset.created_at).toLocaleDateString() : "N/A"}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {asset.asset_type}
                              </Badge>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="assets" className="space-y-4">
              <AssetIntelligenceClient
                assets={filteredAssets}
                selectedAssets={selectedAssets}
                onAssetSelect={handleAssetSelect}
                onSelectAll={handleSelectAll}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedAssetType={selectedAssetType}
                onAssetTypeChange={setSelectedAssetType}
                selectedStatus={selectedStatus}
                onStatusChange={setSelectedStatus}
                showFilters={showFilters}
                onToggleFilters={() => setShowFilters(!showFilters)}
                onRefresh={handleRefreshData}
                isLoading={isLoading}
              />
            </TabsContent>

            <TabsContent value="insights" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {allInsights.length === 0 ? (
                  <Card className="lg:col-span-3">
                    <CardContent className="flex flex-col items-center justify-center p-8 sm:p-12">
                      <Brain className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Insights Yet</h3>
                      <p className="text-muted-foreground mb-4 text-sm text-center">
                        AI-generated insights will appear here as your assets are analyzed
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  allInsights.map((insight) => (
                    <Card key={insight.id} className="enterprise-card">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              {getInsightIcon(insight.insight_type)}
                            </div>
                            <div>
                              <CardTitle className="text-base">
                                {insight.insight_data?.title || insight.insight_type}
                              </CardTitle>
                              <CardDescription className="text-sm">{insight.asset_id}</CardDescription>
                            </div>
                          </div>
                          <Badge className={`text-xs ${getPriorityColor(insight.priority)}`}>{insight.priority}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          {insight.insight_data?.description ||
                            insight.recommendations?.[0]?.description ||
                            "No description available"}
                        </p>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground">Confidence: {insight.confidence_score || 0}%</span>
                          <span className="text-muted-foreground">
                            {insight.created_at ? new Date(insight.created_at).toLocaleDateString() : "N/A"}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                            View Details
                          </Button>
                          <Button size="sm" className="flex-1">
                            Take Action
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="search">
              <AssetRAGSearch userId="demo-user" assets={assets} />
            </TabsContent>
          </Tabs>

          {/* Dialogs */}
          {showAgentSelector && (
            <AssetAgentSelector
              userId="demo-user"
              assets={assets}
              onAgentCreated={() => setShowAgentSelector(false)}
              onCancel={() => setShowAgentSelector(false)}
            />
          )}

          {showWorkflowSelector && (
            <AssetWorkflowTemplateSelector
              open={showWorkflowSelector}
              onOpenChange={setShowWorkflowSelector}
              onTemplateSelected={() => setShowWorkflowSelector(false)}
              assets={assets}
            />
          )}

          {/* Create Asset Dialog */}
          <ComprehensiveAssetDialog
            open={showCreateAsset}
            onOpenChange={setShowCreateAsset}
            onAssetCreated={handleRefreshData}
            userId="demo-user"
          />

          {/* Import Assets Dialog */}
          <Dialog open={showImportAssets} onOpenChange={setShowImportAssets}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Assets</DialogTitle>
                <DialogDescription>Upload a CSV or Excel file to bulk import your assets.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">Drag and drop your file here, or click to browse</p>
                  <Button variant="outline">Choose File</Button>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowImportAssets(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      setShowImportAssets(false)
                      toast({
                        title: "Import Started",
                        description: "Your assets are being imported in the background.",
                      })
                    }}
                  >
                    Import Assets
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </TooltipProvider>
  )
}
