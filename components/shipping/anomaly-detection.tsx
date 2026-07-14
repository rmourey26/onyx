"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, Clock, Loader2, PackageSearch, TrendingDown, TrendingUp } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function AnomalyDetection() {
  const [isLoading, setIsLoading] = useState(false)
  const [anomalies, setAnomalies] = useState<any>(null)
  const { toast } = useToast()

  const detectAnomalies = async () => {
    setIsLoading(true)
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock anomaly detection results
      setAnomalies({
        highRisk: [
          {
            id: "anomaly-1",
            type: "delay",
            severity: "high",
            description: "Unusual delay pattern detected in Seattle to Portland route",
            affectedShipments: 3,
            potentialImpact: "Delivery delays of 24-48 hours",
            recommendation: "Reroute through alternative distribution center",
            confidence: 92,
          },
          {
            id: "anomaly-2",
            type: "cost",
            severity: "high",
            description: "Unexpected cost increase for overnight shipments to East Coast",
            affectedShipments: 8,
            potentialImpact: "$1,240 additional costs this month",
            recommendation: "Review carrier contracts and negotiate rates",
            confidence: 87,
          },
        ],
        mediumRisk: [
          {
            id: "anomaly-3",
            type: "damage",
            severity: "medium",
            description: "Higher than normal package damage rate from Chicago warehouse",
            affectedShipments: 12,
            potentialImpact: "Increased returns and customer complaints",
            recommendation: "Inspect packaging procedures at Chicago facility",
            confidence: 78,
          },
          {
            id: "anomaly-4",
            type: "weather",
            severity: "medium",
            description: "Potential weather disruption affecting Midwest deliveries",
            affectedShipments: 17,
            potentialImpact: "Possible 1-2 day delays for ground shipments",
            recommendation: "Proactively notify customers and offer alternatives",
            confidence: 82,
          },
        ],
        lowRisk: [
          {
            id: "anomaly-5",
            type: "volume",
            severity: "low",
            description: "Unusual spike in shipping volume to Florida",
            affectedShipments: 24,
            potentialImpact: "Potential resource constraints at Miami hub",
            recommendation: "Monitor closely and prepare additional capacity",
            confidence: 68,
          },
          {
            id: "anomaly-6",
            type: "pattern",
            severity: "low",
            description: "Delivery attempt pattern suggests suboptimal timing",
            affectedShipments: 31,
            potentialImpact: "Increased delivery attempts and operational costs",
            recommendation: "Adjust delivery windows based on recipient availability",
            confidence: 72,
          },
        ],
        summary: {
          totalAnomalies: 6,
          highRiskCount: 2,
          mediumRiskCount: 2,
          lowRiskCount: 2,
          estimatedCostImpact: 1840,
          estimatedTimeImpact: 76,
        },
      })

      toast({
        title: "Anomaly detection complete",
        description: "Found 6 potential issues in your shipping operations",
      })
    } catch (error) {
      console.error("Error in anomaly detection:", error)
      toast({
        title: "Detection failed",
        description: "An error occurred during anomaly detection",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getAnomalySeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
      case "medium":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
      case "low":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
    }
  }

  const getAnomalyTypeIcon = (type: string) => {
    switch (type) {
      case "delay":
        return <Clock className="h-4 w-4" />
      case "cost":
        return <TrendingUp className="h-4 w-4" />
      case "damage":
        return <AlertTriangle className="h-4 w-4" />
      case "weather":
        return <TrendingDown className="h-4 w-4" />
      case "volume":
        return <PackageSearch className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Anomaly Detection</h2>
          <p className="text-muted-foreground">
            Identify unusual patterns and potential issues in your shipping operations
          </p>
        </div>

        <Button onClick={detectAnomalies} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <AlertTriangle className="mr-2 h-4 w-4" />
              Detect Anomalies
            </>
          )}
        </Button>
      </div>

      {!anomalies ? (
        <Card>
          <CardHeader>
            <CardTitle>Anomaly Detection</CardTitle>
            <CardDescription>
              AI-powered analysis to detect unusual patterns and potential issues in your shipping operations
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <PackageSearch className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No anomalies detected yet</h3>
            <p className="text-muted-foreground max-w-md">
              Click the "Detect Anomalies" button to analyze your shipping data and identify potential issues that may
              impact your operations.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Summary Card */}
          <Card className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-950/30 dark:to-blue-950/30">
            <CardHeader>
              <CardTitle>Anomaly Detection Results</CardTitle>
              <CardDescription>Summary of detected anomalies in your shipping operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                <div className="space-y-1">
                  <div className="text-2xl font-bold">{anomalies.summary.totalAnomalies}</div>
                  <div className="text-xs text-muted-foreground">Total Anomalies</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {anomalies.summary.highRiskCount}
                  </div>
                  <div className="text-xs text-muted-foreground">High Risk</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {anomalies.summary.mediumRiskCount}
                  </div>
                  <div className="text-xs text-muted-foreground">Medium Risk</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {anomalies.summary.lowRiskCount}
                  </div>
                  <div className="text-xs text-muted-foreground">Low Risk</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    ${anomalies.summary.estimatedCostImpact}
                  </div>
                  <div className="text-xs text-muted-foreground">Potential Impact</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Anomalies */}
          <Tabs defaultValue="high-risk">
            <TabsList>
              <TabsTrigger value="high-risk">High Risk ({anomalies.highRisk.length})</TabsTrigger>
              <TabsTrigger value="medium-risk">Medium Risk ({anomalies.mediumRisk.length})</TabsTrigger>
              <TabsTrigger value="low-risk">Low Risk ({anomalies.lowRisk.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="high-risk" className="space-y-4 mt-4">
              {anomalies.highRisk.map((anomaly: any) => (
                <Card key={anomaly.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        {getAnomalyTypeIcon(anomaly.type)}
                        <CardTitle className="text-base">{anomaly.description}</CardTitle>
                      </div>
                      <Badge className={getAnomalySeverityColor(anomaly.severity)}>
                        {anomaly.severity.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium">Impact</p>
                        <p className="text-sm text-muted-foreground">{anomaly.potentialImpact}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Affected Shipments</p>
                        <p className="text-sm text-muted-foreground">{anomaly.affectedShipments} shipments</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Confidence</p>
                        <p className="text-sm text-muted-foreground">{anomaly.confidence}% certainty</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <p className="text-sm">
                      <span className="font-medium">Recommendation:</span> {anomaly.recommendation}
                    </p>
                    <Button size="sm">Take Action</Button>
                  </CardFooter>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="medium-risk" className="space-y-4 mt-4">
              {anomalies.mediumRisk.map((anomaly: any) => (
                <Card key={anomaly.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        {getAnomalyTypeIcon(anomaly.type)}
                        <CardTitle className="text-base">{anomaly.description}</CardTitle>
                      </div>
                      <Badge className={getAnomalySeverityColor(anomaly.severity)}>
                        {anomaly.severity.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium">Impact</p>
                        <p className="text-sm text-muted-foreground">{anomaly.potentialImpact}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Affected Shipments</p>
                        <p className="text-sm text-muted-foreground">{anomaly.affectedShipments} shipments</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Confidence</p>
                        <p className="text-sm text-muted-foreground">{anomaly.confidence}% certainty</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <p className="text-sm">
                      <span className="font-medium">Recommendation:</span> {anomaly.recommendation}
                    </p>
                    <Button size="sm" variant="outline">
                      Monitor
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="low-risk" className="space-y-4 mt-4">
              {anomalies.lowRisk.map((anomaly: any) => (
                <Card key={anomaly.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        {getAnomalyTypeIcon(anomaly.type)}
                        <CardTitle className="text-base">{anomaly.description}</CardTitle>
                      </div>
                      <Badge className={getAnomalySeverityColor(anomaly.severity)}>
                        {anomaly.severity.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium">Impact</p>
                        <p className="text-sm text-muted-foreground">{anomaly.potentialImpact}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Affected Shipments</p>
                        <p className="text-sm text-muted-foreground">{anomaly.affectedShipments} shipments</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Confidence</p>
                        <p className="text-sm text-muted-foreground">{anomaly.confidence}% certainty</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <p className="text-sm">
                      <span className="font-medium">Recommendation:</span> {anomaly.recommendation}
                    </p>
                    <Button size="sm" variant="ghost">
                      Dismiss
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}
