"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { AlertTriangle, TrendingUp, Calendar } from "lucide-react"

interface PredictiveAnalyticsProps {
  shippingData: any[]
  analyticsData: any[]
}

export function PredictiveAnalytics({ shippingData, analyticsData }: PredictiveAnalyticsProps) {
  const [timeframe, setTimeframe] = useState("week")
  const [isLoading, setIsLoading] = useState(false)
  const [predictions, setPredictions] = useState<any>(null)

  // Generate forecast data
  const generateForecast = async () => {
    setIsLoading(true)
    try {
      // In a real implementation, this would call an AI endpoint
      // For demo purposes, we'll simulate a response after a delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Generate some sample forecast data
      const today = new Date()
      const forecastData = {
        volumeForecast: Array.from({ length: timeframe === "week" ? 7 : 30 }, (_, i) => {
          const date = new Date(today)
          date.setDate(date.getDate() + i)
          const dayName = date.toLocaleDateString("en-US", { weekday: "short" })
          const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" })

          // Generate some realistic looking data with weekly patterns
          let baseVolume = 20 + Math.floor(Math.random() * 10)

          // Add weekly pattern (weekends lower)
          const dayOfWeek = date.getDay()
          if (dayOfWeek === 0 || dayOfWeek === 6) {
            baseVolume *= 0.6
          } else if (dayOfWeek === 1 || dayOfWeek === 5) {
            baseVolume *= 0.9
          } else if (dayOfWeek === 3) {
            baseVolume *= 1.2
          }

          return {
            date: dateStr,
            day: dayName,
            volume: Math.round(baseVolume),
            predicted: true,
          }
        }),

        costForecast: Array.from({ length: timeframe === "week" ? 7 : 30 }, (_, i) => {
          const date = new Date(today)
          date.setDate(date.getDate() + i)
          const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" })

          // Base cost with some randomness
          const baseCost = 15 + Math.random() * 5

          return {
            date: dateStr,
            avgCost: Number.parseFloat(baseCost.toFixed(2)),
            predicted: true,
          }
        }),

        delayRiskForecast: Array.from({ length: timeframe === "week" ? 7 : 30 }, (_, i) => {
          const date = new Date(today)
          date.setDate(date.getDate() + i)
          const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" })

          // Generate delay risk with some patterns
          let baseRisk = 5 + Math.random() * 10

          // Higher risk on certain days
          const dayOfWeek = date.getDay()
          if (dayOfWeek === 5) {
            baseRisk *= 1.5 // Higher risk on Fridays
          } else if (dayOfWeek === 1) {
            baseRisk *= 1.3 // Higher risk on Mondays
          }

          return {
            date: dateStr,
            risk: Number.parseFloat(baseRisk.toFixed(1)),
            predicted: true,
          }
        }),

        highRiskRoutes: [
          {
            route: "Chicago to New York",
            riskFactor: 8.7,
            reason: "Weather conditions",
            alternativeRoute: "Chicago to New York via Pittsburgh",
            potentialSavings: "1.2 days",
          },
          {
            route: "Los Angeles to Seattle",
            riskFactor: 7.5,
            reason: "Port congestion",
            alternativeRoute: "Los Angeles to Seattle via Sacramento",
            potentialSavings: "0.8 days",
          },
          {
            route: "Miami to Dallas",
            riskFactor: 6.9,
            reason: "Highway construction",
            alternativeRoute: "Miami to Dallas via Atlanta",
            potentialSavings: "0.5 days",
          },
        ],

        insights: [
          "Volume expected to increase by 12% next week compared to this week",
          "Wednesday will likely be your busiest shipping day",
          "Consider pre-scheduling pickups for Thursday to avoid delays",
          "Potential carrier capacity issues detected for Northeast region",
          "Weather delays expected in the Midwest region on Friday",
        ],
      }

      setPredictions(forecastData)
    } catch (error) {
      console.error("Error generating forecast:", error)
      toast({
        title: "Error",
        description: "Failed to generate forecast. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold">Predictive Analytics</h3>
          <p className="text-muted-foreground">AI-powered shipping forecasts and insights</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={generateForecast} disabled={isLoading}>
            {isLoading ? "Generating..." : "Generate Forecast"}
          </Button>
        </div>
      </div>

      {!predictions ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg border-dashed">
          <Calendar className="w-12 h-12 mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium">No forecast data</h3>
          <p className="text-sm text-muted-foreground max-w-md mt-2">
            Generate a forecast to see AI-powered predictions for your shipping volume, costs, and potential delays.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Volume Forecast */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Shipping Volume Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={predictions.volumeForecast}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="volume" fill="#3b82f6" name="Packages" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Cost Forecast */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Average Cost Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={predictions.costForecast}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="avgCost" stroke="#10b981" name="Avg Cost ($)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Delay Risk Forecast */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Delay Risk Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={predictions.delayRiskForecast}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="risk" stroke="#f97316" name="Risk Factor" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* High Risk Routes */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">High Risk Routes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[250px] overflow-auto pr-2">
                {predictions.highRiskRoutes.map((route, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{route.route}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          <span className="font-medium">Reason:</span> {route.reason}
                        </p>
                      </div>
                      <div className="flex items-center px-2 py-1 text-amber-600 bg-amber-50 rounded-md">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        <span className="text-xs font-medium">{route.riskFactor}</span>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t text-sm">
                      <p>
                        <span className="font-medium">Alternative:</span> {route.alternativeRoute}
                      </p>
                      <p>
                        <span className="font-medium">Potential savings:</span> {route.potentialSavings}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">AI Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {predictions.insights.map((insight, index) => (
                  <div key={index} className="flex items-start p-3 border rounded-lg">
                    <TrendingUp className="w-5 h-5 mr-2 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{insight}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
