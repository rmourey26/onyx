"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, DollarSign, Package, Activity, AlertTriangle, CheckCircle, Zap, BarChart3 } from "lucide-react"
import { getComprehensiveAnalytics, getAssetTrends, getInsightsByPriority } from "@/app/actions/asset-analytics-actions"

interface AnalyticsDashboardProps {
  userId: string
}

export function AssetAnalyticsDashboard({ userId }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<any>(null)
  const [trends, setTrends] = useState<any[]>([])
  const [insightsPriority, setInsightsPriority] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [userId])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      const [analyticsResult, trendsResult, priorityResult] = await Promise.all([
        getComprehensiveAnalytics(),
        getAssetTrends(30),
        getInsightsByPriority(),
      ])

      if (analyticsResult.success) {
        setAnalytics(analyticsResult.data)
      }
      if (trendsResult.success) {
        setTrends(trendsResult.data || [])
      }
      if (priorityResult.success) {
        setInsightsPriority(priorityResult.data)
      }
    } catch (error) {
      console.error("Error loading analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
    )
  }

  const { overview, typeBreakdown, insightSummary, costByEventType, recentEvents } = analytics

  // Calculate utilization rate
  const utilizationRate = overview.total_assets > 0 ? (overview.active_assets / overview.total_assets) * 100 : 0

  // Calculate IoT adoption rate
  const iotAdoptionRate = overview.total_assets > 0 ? (overview.iot_enabled_assets / overview.total_assets) * 100 : 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.total_assets}</div>
            <p className="text-xs text-muted-foreground">
              {overview.active_assets} active • {overview.maintenance_assets} in maintenance
            </p>
            <Progress value={utilizationRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">{utilizationRate.toFixed(1)}% utilization</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${overview.total_asset_value?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              Avg: ${overview.avg_asset_value?.toLocaleString() || 0} per asset
            </p>
            <div className="flex items-center mt-2 text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>Portfolio value tracking</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Insights</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.total_insights}</div>
            <p className="text-xs text-muted-foreground">{insightSummary.length} insight types generated</p>
            {insightsPriority && (
              <div className="flex gap-1 mt-2">
                {insightsPriority.critical && (
                  <Badge variant="destructive" className="text-xs">
                    {insightsPriority.critical.active} Critical
                  </Badge>
                )}
                {insightsPriority.high && (
                  <Badge variant="secondary" className="text-xs">
                    {insightsPriority.high.active} High
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">IoT Integration</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.iot_enabled_assets}</div>
            <p className="text-xs text-muted-foreground">Connected devices</p>
            <Progress value={iotAdoptionRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">{iotAdoptionRate.toFixed(1)}% adoption rate</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="breakdown" className="space-y-4">
        <TabsList>
          <TabsTrigger value="breakdown">Asset Breakdown</TabsTrigger>
          <TabsTrigger value="insights">Insight Analysis</TabsTrigger>
          <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
          <TabsTrigger value="events">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="breakdown" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assets by Type</CardTitle>
              <CardDescription>Distribution of assets across different categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(typeBreakdown).map(([type, data]: [string, any]) => (
                  <div key={type} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="capitalize font-medium">{type}</div>
                        <Badge variant="outline">{data.count} assets</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">${data.value.toLocaleString()}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={(data.active / data.count) * 100} className="flex-1" />
                      <span className="text-xs text-muted-foreground w-12 text-right">
                        {data.active}/{data.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Insight Summary</CardTitle>
              <CardDescription>AI-generated insights by type and priority</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insightSummary.map((insight: any) => (
                  <div key={insight.insight_type} className="border-l-2 border-blue-500 pl-4 py-2">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium capitalize">{insight.insight_type.replace(/_/g, " ")}</h4>
                      <Badge variant="outline">{insight.count} insights</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">High Priority</p>
                        <p className="font-medium">{insight.high_priority_count}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Avg Confidence</p>
                        <p className="font-medium">{(insight.avg_confidence * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                ))}
                {insightSummary.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No insights generated yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          {insightsPriority && (
            <Card>
              <CardHeader>
                <CardTitle>Insights by Priority</CardTitle>
                <CardDescription>Current status of insights across priority levels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(insightsPriority).map(([priority, data]: [string, any]) => (
                    <div key={priority} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            priority === "critical"
                              ? "bg-red-500"
                              : priority === "high"
                                ? "bg-orange-500"
                                : priority === "medium"
                                  ? "bg-yellow-500"
                                  : "bg-blue-500"
                          }`}
                        />
                        <div>
                          <p className="font-medium capitalize">{priority}</p>
                          <p className="text-xs text-muted-foreground">{data.total} total insights</p>
                        </div>
                      </div>
                      <div className="flex gap-4 text-sm">
                        <div className="text-center">
                          <p className="font-medium text-orange-600">{data.active}</p>
                          <p className="text-xs text-muted-foreground">Active</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium text-green-600">{data.resolved}</p>
                          <p className="text-xs text-muted-foreground">Resolved</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="costs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cost Analysis by Event Type</CardTitle>
              <CardDescription>Breakdown of costs across different lifecycle events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(costByEventType).map(([eventType, data]: [string, any]) => (
                  <div key={eventType} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="capitalize font-medium">{eventType.replace(/_/g, " ")}</div>
                      <div className="text-sm font-medium">${data.total_cost.toLocaleString()}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={
                          (data.total_cost /
                            Math.max(...Object.values(costByEventType).map((d: any) => d.total_cost), 1)) *
                          100
                        }
                        className="flex-1"
                      />
                      <span className="text-xs text-muted-foreground w-16 text-right">{data.count} events</span>
                    </div>
                  </div>
                ))}
                {Object.keys(costByEventType).length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No cost data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Lifecycle Events</CardTitle>
              <CardDescription>Latest asset lifecycle activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentEvents.map((event: any, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div
                      className={`p-2 rounded-lg ${
                        event.event_type === "maintenance"
                          ? "bg-yellow-100"
                          : event.event_type === "repair"
                            ? "bg-red-100"
                            : "bg-blue-100"
                      }`}
                    >
                      {event.event_type === "maintenance" ? (
                        <AlertTriangle className="h-4 w-4" />
                      ) : event.event_type === "repair" ? (
                        <Activity className="h-4 w-4" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium capitalize">{event.event_type.replace(/_/g, " ")}</p>
                      <p className="text-sm text-muted-foreground">{new Date(event.event_date).toLocaleDateString()}</p>
                      {event.cost && <p className="text-sm font-medium mt-1">${event.cost.toLocaleString()}</p>}
                    </div>
                  </div>
                ))}
                {recentEvents.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No recent events</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
