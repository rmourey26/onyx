"use client"

import { DialogFooter } from "@/components/ui/dialog"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { createAsset } from "@/app/actions/asset-intelligence-actions"
import type { CreateAsset } from "@/lib/schemas/asset-intelligence"
import { RefreshCw, Package, DollarSign, MapPin, Activity, Wrench, Settings, Bot, Brain } from "lucide-react"

function generateAssetId(assetType: string): string {
  const prefix = assetType.toUpperCase().slice(0, 3)
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

interface ComprehensiveAssetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAssetCreated?: () => void
  userId: string
}

export function ComprehensiveAssetDialog({
  open,
  onOpenChange,
  onAssetCreated,
  userId,
}: ComprehensiveAssetDialogProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [assetForm, setAssetForm] = useState<CreateAsset>({
    // Basic Information (Required)
    name: "",
    asset_id: "",
    asset_type: "equipment",
    user_id: userId,

    // Basic Information (Optional)
    description: "",
    category: "",
    status: "active",

    // Financial Information
    purchase_cost: 0,
    purchase_date: "",
    current_value: 0,
    depreciation_rate: 0,

    // Location & Tracking
    location_id: "",
    current_location: {},
    location: {},
    iot_sensor_id: "",
    nfc_tag_id: "",
    qr_code: "",

    // Operational Status
    operational_status: "",
    battery_level: null,
    speed: null,
    payload_capacity: null,
    total_runtime_hours: null,
    error_count: null,
    task_progress: null,
    current_task: {},
    task_queue: {},

    // Maintenance
    last_maintenance_date: "",
    next_maintenance_date: "",
    maintenance_schedule: [],

    // Specifications & Capabilities
    specifications: {},
    capabilities: {},
    sensors: [],
    special_tools: [],
    workflow_settings: {},
    ai_agent_config: {},

    // Compliance & ESG
    compliance_data: {},
    esg_metrics: {},

    // Analytics & AI
    embedding_vector: "",
    predictive_data: {},
    risk_score: null,

    // Metadata
    metadata: {},
  })

  const handleGenerateAssetId = () => {
    const newId = generateAssetId(assetForm.asset_type)
    handleFormChange("asset_id", newId)
  }

  const handleFormChange = (field: keyof CreateAsset, value: any) => {
    setAssetForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const parseJSONField = (value: string, fallback: any = {}) => {
    if (!value || value.trim() === "") return fallback
    try {
      return JSON.parse(value)
    } catch (e) {
      console.error("Failed to parse JSON:", e)
      return fallback
    }
  }

  const handleSubmit = async () => {
    try {
      // Validation
      if (!assetForm.name || !assetForm.name.trim()) {
        toast({
          title: "Validation Error",
          description: "Asset name is required",
          variant: "destructive",
        })
        return
      }

      if (!assetForm.asset_type) {
        toast({
          title: "Validation Error",
          description: "Asset type is required",
          variant: "destructive",
        })
        return
      }

      setIsSubmitting(true)

      const finalAssetId = assetForm.asset_id?.trim() || generateAssetId(assetForm.asset_type)

      // Process JSON fields
      const processedForm = {
        ...assetForm,
        asset_id: finalAssetId,
        user_id: userId,
        specifications:
          typeof assetForm.specifications === "string"
            ? parseJSONField(assetForm.specifications)
            : assetForm.specifications,
        metadata: typeof assetForm.metadata === "string" ? parseJSONField(assetForm.metadata) : assetForm.metadata,
        current_location:
          typeof assetForm.current_location === "string"
            ? parseJSONField(assetForm.current_location)
            : assetForm.current_location,
        location: typeof assetForm.location === "string" ? parseJSONField(assetForm.location) : assetForm.location,
        compliance_data:
          typeof assetForm.compliance_data === "string"
            ? parseJSONField(assetForm.compliance_data)
            : assetForm.compliance_data,
        esg_metrics:
          typeof assetForm.esg_metrics === "string" ? parseJSONField(assetForm.esg_metrics) : assetForm.esg_metrics,
        capabilities:
          typeof assetForm.capabilities === "string" ? parseJSONField(assetForm.capabilities) : assetForm.capabilities,
        workflow_settings:
          typeof assetForm.workflow_settings === "string"
            ? parseJSONField(assetForm.workflow_settings)
            : assetForm.workflow_settings,
        ai_agent_config:
          typeof assetForm.ai_agent_config === "string"
            ? parseJSONField(assetForm.ai_agent_config)
            : assetForm.ai_agent_config,
        current_task:
          typeof assetForm.current_task === "string" ? parseJSONField(assetForm.current_task) : assetForm.current_task,
        task_queue:
          typeof assetForm.task_queue === "string" ? parseJSONField(assetForm.task_queue) : assetForm.task_queue,
        predictive_data:
          typeof assetForm.predictive_data === "string"
            ? parseJSONField(assetForm.predictive_data)
            : assetForm.predictive_data,
        maintenance_schedule:
          typeof assetForm.maintenance_schedule === "string"
            ? parseJSONField(assetForm.maintenance_schedule, [])
            : assetForm.maintenance_schedule,
        sensors:
          typeof assetForm.sensors === "string"
            ? assetForm.sensors
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : assetForm.sensors,
        special_tools:
          typeof assetForm.special_tools === "string"
            ? assetForm.special_tools
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : assetForm.special_tools,
      }

      const result = await createAsset(processedForm)

      if (result.success) {
        toast({
          title: "Asset Created",
          description: "New asset has been added to your inventory with complete tracking capabilities.",
        })
        onOpenChange(false)
        onAssetCreated?.()

        // Reset form
        setAssetForm({
          name: "",
          asset_id: "",
          asset_type: "equipment",
          user_id: userId,
          description: "",
          category: "",
          status: "active",
          purchase_cost: 0,
          purchase_date: "",
          current_value: 0,
          depreciation_rate: 0,
          location_id: "",
          current_location: {},
          location: {},
          iot_sensor_id: "",
          nfc_tag_id: "",
          qr_code: "",
          operational_status: "",
          battery_level: null,
          speed: null,
          payload_capacity: null,
          total_runtime_hours: null,
          error_count: null,
          task_progress: null,
          current_task: {},
          task_queue: {},
          last_maintenance_date: "",
          next_maintenance_date: "",
          maintenance_schedule: [],
          specifications: {},
          capabilities: {},
          sensors: [],
          special_tools: [],
          workflow_settings: {},
          ai_agent_config: {},
          compliance_data: {},
          esg_metrics: {},
          embedding_vector: "",
          predictive_data: {},
          risk_score: null,
          metadata: {},
        })
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
        description: "An unexpected error occurred while creating the asset",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="space-y-2 flex-shrink-0 px-4 sm:px-6 pt-4 sm:pt-6">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Package className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
            <span className="line-clamp-2">Create New Asset - Complete Profile</span>
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Add a new asset with comprehensive tracking, analytics, and AI capabilities (44-field schema aligned with
            Supabase)
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6">
          <Tabs defaultValue="basic" className="w-full h-full flex flex-col">
            <div className="w-full overflow-x-auto overflow-y-hidden pb-2 mb-4 flex-shrink-0 -mx-4 px-4 sm:mx-0 sm:px-0">
              <TabsList className="w-max min-w-full h-auto inline-flex sm:grid sm:grid-cols-4 md:grid-cols-7 gap-1">
                <TabsTrigger
                  value="basic"
                  className="flex items-center justify-center gap-1 sm:gap-2 min-w-[60px] sm:min-w-0 px-2 sm:px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap"
                >
                  <Package className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden sm:inline text-xs">Basic</span>
                </TabsTrigger>
                <TabsTrigger
                  value="financial"
                  className="flex items-center justify-center gap-1 sm:gap-2 min-w-[60px] sm:min-w-0 px-2 sm:px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap"
                >
                  <DollarSign className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden sm:inline text-xs">Financial</span>
                </TabsTrigger>
                <TabsTrigger
                  value="tracking"
                  className="flex items-center justify-center gap-1 sm:gap-2 min-w-[60px] sm:min-w-0 px-2 sm:px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap"
                >
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden sm:inline text-xs">Tracking</span>
                </TabsTrigger>
                <TabsTrigger
                  value="operational"
                  className="flex items-center justify-center gap-1 sm:gap-2 min-w-[60px] sm:min-w-0 px-2 sm:px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap"
                >
                  <Activity className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden sm:inline text-xs">Operational</span>
                </TabsTrigger>
                <TabsTrigger
                  value="maintenance"
                  className="flex items-center justify-center gap-1 sm:gap-2 min-w-[60px] sm:min-w-0 px-2 sm:px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap"
                >
                  <Wrench className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden sm:inline text-xs">Maintenance</span>
                </TabsTrigger>
                <TabsTrigger
                  value="ai-tasks"
                  className="flex items-center justify-center gap-1 sm:gap-2 min-w-[60px] sm:min-w-0 px-2 sm:px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap"
                >
                  <Brain className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden sm:inline text-xs">AI & Tasks</span>
                </TabsTrigger>
                <TabsTrigger
                  value="advanced"
                  className="flex items-center justify-center gap-1 sm:gap-2 min-w-[60px] sm:min-w-0 px-2 sm:px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap"
                >
                  <Settings className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden sm:inline text-xs">Advanced</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 min-h-0 pb-4">
              {/* Basic Information Tab */}
              <TabsContent value="basic" className="mt-0 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Label htmlFor="name" className="text-sm sm:text-base">
                      Asset Name *
                    </Label>
                    <Input
                      id="name"
                      placeholder="Enter asset name"
                      value={assetForm.name}
                      onChange={(e) => handleFormChange("name", e.target.value)}
                      className="h-10 sm:h-11 text-base"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Label htmlFor="asset_id" className="text-sm sm:text-base">
                      Asset ID (auto-generated if empty)
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="asset_id"
                        placeholder="Leave empty to auto-generate"
                        value={assetForm.asset_id}
                        onChange={(e) => handleFormChange("asset_id", e.target.value)}
                        className="flex-1 h-10 sm:h-11 text-base"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleGenerateAssetId}
                        title="Generate Asset ID"
                        className="h-10 w-10 sm:h-11 sm:w-11 flex-shrink-0 bg-transparent"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="asset_type" className="text-sm sm:text-base">
                      Asset Type *
                    </Label>
                    <Select
                      value={assetForm.asset_type}
                      onValueChange={(value) => handleFormChange("asset_type", value)}
                    >
                      <SelectTrigger className="h-10 sm:h-11">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
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
                  </div>

                  <div>
                    <Label htmlFor="status" className="text-sm sm:text-base">
                      Status
                    </Label>
                    <Select value={assetForm.status} onValueChange={(value) => handleFormChange("status", value)}>
                      <SelectTrigger className="h-10 sm:h-11">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="retired">Retired</SelectItem>
                        <SelectItem value="lost">Lost</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="sm:col-span-2">
                    <Label htmlFor="category" className="text-sm sm:text-base">
                      Category
                    </Label>
                    <Input
                      id="category"
                      placeholder="e.g., Heavy Machinery, IT Equipment"
                      value={assetForm.category || ""}
                      onChange={(e) => handleFormChange("category", e.target.value)}
                      className="h-10 sm:h-11 text-base"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Label htmlFor="description" className="text-sm sm:text-base">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Detailed asset description..."
                      value={assetForm.description || ""}
                      onChange={(e) => handleFormChange("description", e.target.value)}
                      rows={3}
                      className="text-base resize-none"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Financial Information Tab */}
              <TabsContent value="financial" className="mt-0 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="purchase_cost" className="text-sm sm:text-base">
                      Purchase Cost ($)
                    </Label>
                    <Input
                      id="purchase_cost"
                      type="number"
                      placeholder="0.00"
                      value={assetForm.purchase_cost || ""}
                      onChange={(e) => handleFormChange("purchase_cost", Number.parseFloat(e.target.value) || 0)}
                      className="h-10 sm:h-11 text-base"
                    />
                  </div>

                  <div>
                    <Label htmlFor="current_value" className="text-sm sm:text-base">
                      Current Value ($)
                    </Label>
                    <Input
                      id="current_value"
                      type="number"
                      placeholder="0.00"
                      value={assetForm.current_value || ""}
                      onChange={(e) => handleFormChange("current_value", Number.parseFloat(e.target.value) || 0)}
                      className="h-10 sm:h-11 text-base"
                    />
                  </div>

                  <div>
                    <Label htmlFor="purchase_date" className="text-sm sm:text-base">
                      Purchase Date
                    </Label>
                    <Input
                      id="purchase_date"
                      type="date"
                      value={assetForm.purchase_date || ""}
                      onChange={(e) => handleFormChange("purchase_date", e.target.value)}
                      className="h-10 sm:h-11 text-base"
                    />
                  </div>

                  <div>
                    <Label htmlFor="depreciation_rate" className="text-sm sm:text-base">
                      Depreciation Rate (%)
                    </Label>
                    <Input
                      id="depreciation_rate"
                      type="number"
                      placeholder="0"
                      min="0"
                      max="100"
                      step="0.1"
                      value={assetForm.depreciation_rate || ""}
                      onChange={(e) => handleFormChange("depreciation_rate", Number.parseFloat(e.target.value) || 0)}
                      className="h-10 sm:h-11 text-base"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Tracking & Location Tab */}
              <TabsContent value="tracking" className="mt-0 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="iot_sensor_id">IoT Sensor ID</Label>
                    <Input
                      id="iot_sensor_id"
                      placeholder="e.g., IOT-12345"
                      value={assetForm.iot_sensor_id || ""}
                      onChange={(e) => handleFormChange("iot_sensor_id", e.target.value)}
                      className="h-10 sm:h-11 text-base"
                    />
                  </div>

                  <div>
                    <Label htmlFor="nfc_tag_id">NFC Tag ID</Label>
                    <Input
                      id="nfc_tag_id"
                      placeholder="e.g., NFC-67890"
                      value={assetForm.nfc_tag_id || ""}
                      onChange={(e) => handleFormChange("nfc_tag_id", e.target.value)}
                      className="h-10 sm:h-11 text-base"
                    />
                  </div>

                  <div>
                    <Label htmlFor="qr_code">QR Code</Label>
                    <Input
                      id="qr_code"
                      placeholder="QR code data"
                      value={assetForm.qr_code || ""}
                      onChange={(e) => handleFormChange("qr_code", e.target.value)}
                      className="h-10 sm:h-11 text-base"
                    />
                  </div>

                  <div>
                    <Label htmlFor="location_id">Location ID</Label>
                    <Input
                      id="location_id"
                      placeholder="e.g., WAREHOUSE-A"
                      value={assetForm.location_id || ""}
                      onChange={(e) => handleFormChange("location_id", e.target.value)}
                      className="h-10 sm:h-11 text-base"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Label htmlFor="current_location">Current Location (JSON)</Label>
                    <Textarea
                      id="current_location"
                      placeholder='{"latitude": 40.7128, "longitude": -74.0060, "address": "New York, NY"}'
                      value={
                        typeof assetForm.current_location === "string"
                          ? assetForm.current_location
                          : JSON.stringify(assetForm.current_location || {}, null, 2)
                      }
                      onChange={(e) => handleFormChange("current_location", e.target.value)}
                      rows={3}
                      className="text-base resize-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Label htmlFor="location">Registered Location (JSON)</Label>
                    <Textarea
                      id="location"
                      placeholder='{"facility": "Main Warehouse", "zone": "A", "rack": "12", "shelf": "3"}'
                      value={
                        typeof assetForm.location === "string"
                          ? assetForm.location
                          : JSON.stringify(assetForm.location || {}, null, 2)
                      }
                      onChange={(e) => handleFormChange("location", e.target.value)}
                      rows={3}
                      className="text-base resize-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Label htmlFor="sensors">Sensors (comma-separated)</Label>
                    <Input
                      id="sensors"
                      placeholder="temperature, humidity, pressure, gps, accelerometer"
                      value={Array.isArray(assetForm.sensors) ? assetForm.sensors.join(", ") : assetForm.sensors || ""}
                      onChange={(e) => handleFormChange("sensors", e.target.value)}
                      className="h-10 sm:h-11 text-base"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Operational Status Tab */}
              <TabsContent value="operational" className="mt-0 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="operational_status">Operational Status</Label>
                    <Select
                      value={assetForm.operational_status || ""}
                      onValueChange={(value) => handleFormChange("operational_status", value)}
                    >
                      <SelectTrigger className="h-10 sm:h-11">
                        <SelectValue placeholder="Select operational status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="running">Running</SelectItem>
                        <SelectItem value="idle">Idle</SelectItem>
                        <SelectItem value="standby">Standby</SelectItem>
                        <SelectItem value="offline">Offline</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                        <SelectItem value="charging">Charging</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="battery_level">Battery Level (%)</Label>
                    <Input
                      id="battery_level"
                      type="number"
                      placeholder="0-100"
                      min="0"
                      max="100"
                      value={assetForm.battery_level || ""}
                      onChange={(e) => handleFormChange("battery_level", Number.parseFloat(e.target.value) || null)}
                      className="h-10 sm:h-11 text-base"
                    />
                  </div>

                  <div>
                    <Label htmlFor="speed">Speed (units/hr)</Label>
                    <Input
                      id="speed"
                      type="number"
                      placeholder="0"
                      value={assetForm.speed || ""}
                      onChange={(e) => handleFormChange("speed", Number.parseFloat(e.target.value) || null)}
                      className="h-10 sm:h-11 text-base"
                    />
                  </div>

                  <div>
                    <Label htmlFor="payload_capacity">Payload Capacity (kg)</Label>
                    <Input
                      id="payload_capacity"
                      type="number"
                      placeholder="0"
                      value={assetForm.payload_capacity || ""}
                      onChange={(e) => handleFormChange("payload_capacity", Number.parseFloat(e.target.value) || null)}
                      className="h-10 sm:h-11 text-base"
                    />
                  </div>

                  <div>
                    <Label htmlFor="total_runtime_hours">Total Runtime (hours)</Label>
                    <Input
                      id="total_runtime_hours"
                      type="number"
                      placeholder="0"
                      value={assetForm.total_runtime_hours || ""}
                      onChange={(e) =>
                        handleFormChange("total_runtime_hours", Number.parseFloat(e.target.value) || null)
                      }
                      className="h-10 sm:h-11 text-base"
                    />
                  </div>

                  <div>
                    <Label htmlFor="error_count">Error Count</Label>
                    <Input
                      id="error_count"
                      type="number"
                      placeholder="0"
                      value={assetForm.error_count || ""}
                      onChange={(e) => handleFormChange("error_count", Number.parseInt(e.target.value) || null)}
                      className="h-10 sm:h-11 text-base"
                    />
                  </div>

                  <div>
                    <Label htmlFor="task_progress">Task Progress (%)</Label>
                    <Input
                      id="task_progress"
                      type="number"
                      placeholder="0-100"
                      min="0"
                      max="100"
                      value={assetForm.task_progress || ""}
                      onChange={(e) => handleFormChange("task_progress", Number.parseFloat(e.target.value) || null)}
                      className="h-10 sm:h-11 text-base"
                    />
                  </div>

                  <div>
                    <Label htmlFor="risk_score">Risk Score (0-100)</Label>
                    <Input
                      id="risk_score"
                      type="number"
                      placeholder="0-100"
                      min="0"
                      max="100"
                      value={assetForm.risk_score || ""}
                      onChange={(e) => handleFormChange("risk_score", Number.parseFloat(e.target.value) || null)}
                      className="h-10 sm:h-11 text-base"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Maintenance Tab */}
              <TabsContent value="maintenance" className="mt-0 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="last_maintenance_date">Last Maintenance Date</Label>
                    <Input
                      id="last_maintenance_date"
                      type="date"
                      value={assetForm.last_maintenance_date || ""}
                      onChange={(e) => handleFormChange("last_maintenance_date", e.target.value)}
                      className="h-10 sm:h-11 text-base"
                    />
                  </div>

                  <div>
                    <Label htmlFor="next_maintenance_date">Next Maintenance Date</Label>
                    <Input
                      id="next_maintenance_date"
                      type="date"
                      value={assetForm.next_maintenance_date || ""}
                      onChange={(e) => handleFormChange("next_maintenance_date", e.target.value)}
                      className="h-10 sm:h-11 text-base"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Label htmlFor="maintenance_schedule">Maintenance Schedule (JSON Array)</Label>
                    <Textarea
                      id="maintenance_schedule"
                      placeholder='[{"type": "oil_change", "frequency": "monthly", "last_done": "2024-01-15"}]'
                      value={
                        typeof assetForm.maintenance_schedule === "string"
                          ? assetForm.maintenance_schedule
                          : JSON.stringify(assetForm.maintenance_schedule || [], null, 2)
                      }
                      onChange={(e) => handleFormChange("maintenance_schedule", e.target.value)}
                      rows={4}
                      className="text-base resize-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Label htmlFor="special_tools">Special Tools Required (comma-separated)</Label>
                    <Input
                      id="special_tools"
                      placeholder="torque wrench, diagnostic scanner, lift"
                      value={
                        Array.isArray(assetForm.special_tools)
                          ? assetForm.special_tools.join(", ")
                          : assetForm.special_tools || ""
                      }
                      onChange={(e) => handleFormChange("special_tools", e.target.value)}
                      className="h-10 sm:h-11 text-base"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* AI & Tasks Tab */}
              <TabsContent value="ai-tasks" className="mt-0 space-y-4">
                <div className="space-y-4">
                  <div className="p-3 bg-muted/50 rounded-lg border">
                    <h4 className="font-medium flex items-center gap-2 mb-2">
                      <Bot className="h-4 w-4" />
                      Task Management
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Configure current tasks and task queue for automated processing
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="current_task">Current Task (JSON)</Label>
                    <Textarea
                      id="current_task"
                      placeholder='{"task_id": "TASK-001", "name": "Inventory Scan", "status": "in_progress", "started_at": "2024-01-15T10:00:00Z"}'
                      value={
                        typeof assetForm.current_task === "string"
                          ? assetForm.current_task
                          : JSON.stringify(assetForm.current_task || {}, null, 2)
                      }
                      onChange={(e) => handleFormChange("current_task", e.target.value)}
                      rows={4}
                      className="text-base resize-none"
                    />
                  </div>

                  <div>
                    <Label htmlFor="task_queue">Task Queue (JSON)</Label>
                    <Textarea
                      id="task_queue"
                      placeholder='{"pending": [{"task_id": "TASK-002", "name": "Maintenance Check", "priority": "high"}], "completed": []}'
                      value={
                        typeof assetForm.task_queue === "string"
                          ? assetForm.task_queue
                          : JSON.stringify(assetForm.task_queue || {}, null, 2)
                      }
                      onChange={(e) => handleFormChange("task_queue", e.target.value)}
                      rows={4}
                      className="text-base resize-none"
                    />
                  </div>

                  <div className="p-3 bg-muted/50 rounded-lg border">
                    <h4 className="font-medium flex items-center gap-2 mb-2">
                      <Brain className="h-4 w-4" />
                      AI & Predictive Analytics
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Configure AI agent and predictive analytics settings
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="ai_agent_config">AI Agent Configuration (JSON)</Label>
                    <Textarea
                      id="ai_agent_config"
                      placeholder='{"predictive_maintenance": true, "anomaly_detection": true, "auto_alerts": true, "model": "gemini-3-pro"}'
                      value={
                        typeof assetForm.ai_agent_config === "string"
                          ? assetForm.ai_agent_config
                          : JSON.stringify(assetForm.ai_agent_config || {}, null, 2)
                      }
                      onChange={(e) => handleFormChange("ai_agent_config", e.target.value)}
                      rows={4}
                      className="text-base resize-none"
                    />
                  </div>

                  <div>
                    <Label htmlFor="predictive_data">Predictive Data (JSON)</Label>
                    <Textarea
                      id="predictive_data"
                      placeholder='{"failure_probability": 0.12, "next_failure_estimate": "2024-06-15", "confidence": 0.85, "factors": ["age", "usage_hours"]}'
                      value={
                        typeof assetForm.predictive_data === "string"
                          ? assetForm.predictive_data
                          : JSON.stringify(assetForm.predictive_data || {}, null, 2)
                      }
                      onChange={(e) => handleFormChange("predictive_data", e.target.value)}
                      rows={4}
                      className="text-base resize-none"
                    />
                  </div>

                  <div>
                    <Label htmlFor="embedding_vector">Embedding Vector (for semantic search)</Label>
                    <Input
                      id="embedding_vector"
                      placeholder="Auto-generated by AI system"
                      value={assetForm.embedding_vector || ""}
                      onChange={(e) => handleFormChange("embedding_vector", e.target.value)}
                      disabled
                      className="bg-muted h-10 sm:h-11 text-base"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      This field is automatically populated by the AI system for semantic search capabilities
                    </p>
                  </div>
                </div>
              </TabsContent>

              {/* Advanced Tab */}
              <TabsContent value="advanced" className="mt-0 space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="specifications">Specifications (JSON)</Label>
                    <Textarea
                      id="specifications"
                      placeholder='{"weight": "500kg", "dimensions": "2x2x3m", "power": "220V", "manufacturer": "ACME"}'
                      value={
                        typeof assetForm.specifications === "string"
                          ? assetForm.specifications
                          : JSON.stringify(assetForm.specifications || {}, null, 2)
                      }
                      onChange={(e) => handleFormChange("specifications", e.target.value)}
                      rows={3}
                      className="text-base resize-none"
                    />
                  </div>

                  <div>
                    <Label htmlFor="capabilities">Capabilities (JSON)</Label>
                    <Textarea
                      id="capabilities"
                      placeholder='{"max_load": 1000, "features": ["GPS", "temperature_control", "remote_access"]}'
                      value={
                        typeof assetForm.capabilities === "string"
                          ? assetForm.capabilities
                          : JSON.stringify(assetForm.capabilities || {}, null, 2)
                      }
                      onChange={(e) => handleFormChange("capabilities", e.target.value)}
                      rows={3}
                      className="text-base resize-none"
                    />
                  </div>

                  <div>
                    <Label htmlFor="compliance_data">Compliance Data (JSON)</Label>
                    <Textarea
                      id="compliance_data"
                      placeholder='{"certifications": ["ISO9001", "CE", "UL"], "expiry": "2025-12-31", "inspector": "John Doe"}'
                      value={
                        typeof assetForm.compliance_data === "string"
                          ? assetForm.compliance_data
                          : JSON.stringify(assetForm.compliance_data || {}, null, 2)
                      }
                      onChange={(e) => handleFormChange("compliance_data", e.target.value)}
                      rows={3}
                      className="text-base resize-none"
                    />
                  </div>

                  <div>
                    <Label htmlFor="esg_metrics">ESG Metrics (JSON)</Label>
                    <Textarea
                      id="esg_metrics"
                      placeholder='{"carbon_footprint": 120, "energy_efficiency": 85, "recyclability": 90, "waste_reduction": 75}'
                      value={
                        typeof assetForm.esg_metrics === "string"
                          ? assetForm.esg_metrics
                          : JSON.stringify(assetForm.esg_metrics || {}, null, 2)
                      }
                      onChange={(e) => handleFormChange("esg_metrics", e.target.value)}
                      rows={3}
                      className="text-base resize-none"
                    />
                  </div>

                  <div>
                    <Label htmlFor="workflow_settings">Workflow Settings (JSON)</Label>
                    <Textarea
                      id="workflow_settings"
                      placeholder='{"auto_maintenance": true, "alert_threshold": 80, "notification_channels": ["email", "slack"]}'
                      value={
                        typeof assetForm.workflow_settings === "string"
                          ? assetForm.workflow_settings
                          : JSON.stringify(assetForm.workflow_settings || {}, null, 2)
                      }
                      onChange={(e) => handleFormChange("workflow_settings", e.target.value)}
                      rows={3}
                      className="text-base resize-none"
                    />
                  </div>

                  <div>
                    <Label htmlFor="metadata">Additional Metadata (JSON)</Label>
                    <Textarea
                      id="metadata"
                      placeholder='{"manufacturer": "ACME Corp", "model": "X-2000", "serial": "SN123456", "warranty_expires": "2026-01-01"}'
                      value={
                        typeof assetForm.metadata === "string"
                          ? assetForm.metadata
                          : JSON.stringify(assetForm.metadata || {}, null, 2)
                      }
                      onChange={(e) => handleFormChange("metadata", e.target.value)}
                      rows={3}
                      className="text-base resize-none"
                    />
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <DialogFooter className="flex-shrink-0 px-4 sm:px-6 pb-4 sm:pb-6 pt-4 border-t bg-background gap-2 flex-col sm:flex-row">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="h-10 sm:h-11 w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="h-10 sm:h-11 w-full sm:w-auto">
            {isSubmitting ? "Creating..." : "Create Asset"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
