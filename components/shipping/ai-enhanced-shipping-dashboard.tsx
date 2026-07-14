"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, Loader2, Zap, AlertTriangle, TrendingUp } from "lucide-react"
import { ShippingAnalyticsComponent } from "./shipping-analytics"
import { ShippingTable } from "./shipping-table"
import { PackagesTable } from "./packages-table"
import { SmartPackageRecommendation } from "@/components/shipping/smart-package-recommendation"
import { PredictiveAnalytics } from "@/components/shipping/predictive-analytics"
import { RouteOptimization } from "@/components/shipping/route-optimization"
import { AnomalyDetection } from "@/components/shipping/anomaly-detection"
import {
  getShippingData,
  getReusablePackages,
  getShippingAnalytics,
  getPackageUtilization,
} from "@/app/actions/shipping"
import { optimizeSupplyChain } from "@/app/actions/ai-actions"
import { useToast } from "@/components/ui/use-toast"
import { IoTSensorAnalytics } from "./iot-sensor-analytics"

export function AIEnhancedShippingDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [shippingData, setShippingData] = useState<any[]>([])
  const [packagesData, setPackagesData] = useState<any[]>([])
  const [analyticsData, setAnalyticsData] = useState<any[]>([])
  const [utilizationData, setUtilizationData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [optimizing, setOptimizing] = useState(false)
  const [aiInsights, setAiInsights] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        // Fetch shipping data first
        const shippingResult = await getShippingData()
        if (shippingResult.success) {
          setShippingData(shippingResult.data || [])
        } else {
          console.error("Error fetching shipping data:", shippingResult.error)
          toast({
            title: "Error",
            description: "Failed to load shipping data: " + shippingResult.error,
            variant: "destructive",
          })
        }

        // Fetch packages data
        const packagesResult = await getReusablePackages()
        if (packagesResult.success) {
          setPackagesData(packagesResult.data || [])
        } else {
          console.error("Error fetching packages data:", packagesResult.error)
        }

        // Fetch analytics with error handling
        try {
          const analyticsResult = await getShippingAnalytics()
          if (analyticsResult.success) {
            setAnalyticsData(analyticsResult.data || [])
          } else {
            console.error("Error fetching analytics:", analyticsResult.error)
          }
        } catch (analyticsError) {
          console.error("Exception fetching analytics:", analyticsError)
          // Set empty analytics data to prevent UI errors
          setAnalyticsData([])
        }

        // Fetch utilization with error handling
        try {
          const utilizationResult = await getPackageUtilization()
          if (utilizationResult.success) {
            setUtilizationData(utilizationResult.data || [])
          } else {
            console.error("Error fetching utilization:", utilizationResult.error)
          }
        } catch (utilizationError) {
          console.error("Exception fetching utilization:", utilizationError)
          // Set empty utilization data to prevent UI errors
          setUtilizationData([])
        }
      } catch (error) {
        console.error("Error in fetchData:", error)
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const runSupplyChainOptimization = async () => {
    setOptimizing(true)
    try {
      // Prepare data for optimization
      const items = JSON.stringify(
        shippingData.map((shipment) => ({
          id: shipment.id,
          weight: shipment.weight || 0,
          dimensions: shipment.dimensions || { length: 0, width: 0, height: 0, unit: "cm" },
          origin: shipment.origin_address,
          destination: shipment.destination_address,
          priority: shipment.status === "delayed" ? "high" : "normal",
        })),
      )

      const packages = JSON.stringify(
        packagesData
          .filter((pkg) => pkg.status === "available")
          .map((pkg) => ({
            id: pkg.id,
            name: pkg.name,
            dimensions: pkg.dimensions,
            weight_capacity: pkg.weight_capacity,
            reuse_count: pkg.reuse_count,
          })),
      )

      // Use a sample origin and destination for optimization
      const origin = JSON.stringify(
        shippingData[0]?.origin_address || {
          name: "Warehouse",
          street: "123 Main St",
          city: "San Francisco",
          state: "CA",
          zip: "94105",
          country: "USA",
        },
      )

      const destination = JSON.stringify(
        shippingData[0]?.destination_address || {
          name: "Customer",
          street: "456 Market St",
          city: "Los Angeles",
          state: "CA",
          zip: "90001",
          country: "USA",
        },
      )

      const result = await optimizeSupplyChain({
        items,
        packages,
        origin,
        destination,
      })

      if (result.success) {
        setAiInsights(result.data)
        toast({
          title: "Optimization Complete",
          description: "Supply chain optimization completed successfully.",
        })
      } else {
        toast({
          title: "Optimization Failed",
          description: result.error || "Failed to optimize supply chain.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error optimizing supply chain:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred during optimization.",
        variant: "destructive",
      })
    } finally {
      setOptimizing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading shipping data...</span>
      </div>
    )
  }

  const delayedShipments = shippingData.filter((shipment) => shipment.status === "delayed").length
  const activePackages = packagesData.filter((pkg) => pkg.status === "in_use").length
  const totalShipments = shippingData.length
  const availablePackages = packagesData.filter((pkg) => pkg.status === "available").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">AI-Enhanced Shipping Dashboard</h2>
        <Button
          onClick={runSupplyChainOptimization}
          disabled={optimizing}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
        >
          {optimizing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Optimizing...
            </>
          ) : (
            <>
              <Brain className="mr-2 h-4 w-4" />
              Run AI Optimization
            </>
          )}
        </Button>
      </div>

      {/* AI Insights Banner */}
      {aiInsights && (
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200 dark:from-indigo-950/30 dark:to-purple-950/30 dark:border-indigo-800">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-indigo-700 dark:text-indigo-400">
              <Zap className="mr-2 h-5 w-5" />
              AI Optimization Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-medium text-sm text-indigo-600 dark:text-indigo-400">Optimized Routes</h4>
                <p className="text-lg font-bold">{aiInsights.optimizedRoutes?.length || 0} Routes</p>
                <p className="text-sm text-muted-foreground">
                  Potential savings of {aiInsights.potentialSavings?.toFixed(2) || 0}%
                </p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-indigo-600 dark:text-indigo-400">Package Recommendations</h4>
                <p className="text-lg font-bold">{aiInsights.packageRecommendations?.length || 0} Packages</p>
                <p className="text-sm text-muted-foreground">
                  Utilization improved by {aiInsights.utilizationImprovement?.toFixed(2) || 0}%
                </p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-indigo-600 dark:text-indigo-400">Carbon Footprint</h4>
                <p className="text-lg font-bold">{aiInsights.carbonReduction?.toFixed(2) || 0}% Reduction</p>
                <p className="text-sm text-muted-foreground">
                  Equivalent to {aiInsights.treesEquivalent || 0} trees planted
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:text-indigo-400 dark:border-indigo-800 dark:hover:bg-indigo-950/50"
            >
              Apply Recommendations
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Shipments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalShipments}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {delayedShipments > 0 && (
                <Badge variant="destructive" className="mr-1">
                  {delayedShipments} delayed
                </Badge>
              )}
              {shippingData.filter((s) => s.status === "in_transit").length} in transit
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Reusable Packages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{packagesData.length}</div>
            <div className="text-xs text-muted-foreground mt-1">
              <Badge variant="outline" className="mr-1">
                {availablePackages} available
              </Badge>
              <Badge variant="secondary">{activePackages} in use</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">On-Time Delivery Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalShipments > 0 ? (((totalShipments - delayedShipments) / totalShipments) * 100).toFixed(1) : 100}%
            </div>
            <div className="text-xs text-muted-foreground mt-1 flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>Compared to last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Potential Disruptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <div className="text-xs text-muted-foreground mt-1 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1 text-red-500" />
              <span>Possible delays on critical routes</span>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Add this component to the dashboard layout */}
      <div className="col-span-1 lg:col-span-2">
        <IoTSensorAnalytics shipmentData={shippingData} isLoading={loading} />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="shipments">Shipments</TabsTrigger>
          <TabsTrigger value="packages">Packages</TabsTrigger>
          <TabsTrigger value="smart-package">Smart Packaging</TabsTrigger>
          <TabsTrigger value="predictive">Predictive Analytics</TabsTrigger>
          <TabsTrigger value="route-optimization">Route Optimization</TabsTrigger>
          <TabsTrigger value="anomaly-detection">Anomaly Detection</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div>A high-level overview of your shipping operations.</div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <ShippingAnalyticsComponent analyticsData={analyticsData} utilizationData={utilizationData} />
        </TabsContent>
        <TabsContent value="shipments" className="space-y-4">
          <ShippingTable shippingData={shippingData} />
        </TabsContent>
        <TabsContent value="packages" className="space-y-4">
          <PackagesTable packagesData={packagesData} />
        </TabsContent>
        <TabsContent value="smart-package" className="space-y-4">
          <SmartPackageRecommendation availablePackages={packagesData.filter((pkg) => pkg.status === "available")} />
        </TabsContent>
        <TabsContent value="predictive" className="space-y-4">
          <PredictiveAnalytics />
        </TabsContent>
        <TabsContent value="route-optimization" className="space-y-4">
          <RouteOptimization />
        </TabsContent>
        <TabsContent value="anomaly-detection" className="space-y-4">
          <AnomalyDetection />
        </TabsContent>
      </Tabs>
    </div>
  )
}
