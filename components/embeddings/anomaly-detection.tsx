"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, AlertTriangle, MapPin, Calendar, TruckIcon, Info, RefreshCw } from "lucide-react"
import { detectAnomalies } from "@/app/actions/embedding-anomaly-actions"
import { format } from "date-fns"
import type { AnomalyResult } from "@/lib/types/search"

interface AnomalyDetectionProps {
  userId: string
}

export function AnomalyDetection({ userId }: AnomalyDetectionProps) {
  const [anomalies, setAnomalies] = useState<AnomalyResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [threshold, setThreshold] = useState(0.8)
  const [method, setMethod] = useState("isolation-forest")
  const [timeRange, setTimeRange] = useState("all")

  const loadAnomalies = async () => {
    setIsLoading(true)
    try {
      const results = await detectAnomalies({
        userId,
        threshold,
        method,
        timeRange,
      })
      setAnomalies(results)
    } catch (error) {
      console.error("Error detecting anomalies:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAnomalies()
  }, [])

  const formatAddress = (address: any) => {
    if (!address) return "N/A"
    return `${address.city}, ${address.country}`
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "in transit":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "delayed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const getAnomalyColor = (score: number) => {
    if (score > 0.9) return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    if (score > 0.7) return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Anomaly Detection
        </CardTitle>
        <CardDescription>Identify unusual shipping patterns using embedding-based anomaly detection</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="space-y-2 flex-1">
            <Label htmlFor="method">Detection Method</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger id="method">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="isolation-forest">Isolation Forest</SelectItem>
                <SelectItem value="local-outlier-factor">Local Outlier Factor</SelectItem>
                <SelectItem value="one-class-svm">One-Class SVM</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 flex-1">
            <Label htmlFor="timeRange">Time Range</Label>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger id="timeRange">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button onClick={loadAnomalies} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Detecting...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="threshold">Anomaly Threshold: {threshold.toFixed(2)}</Label>
          </div>
          <Slider
            id="threshold"
            min={0.5}
            max={0.99}
            step={0.01}
            value={[threshold]}
            onValueChange={(value) => setThreshold(value[0])}
          />
          <p className="text-xs text-muted-foreground">
            Higher values detect only the most unusual shipments. Lower values will flag more shipments as anomalies.
          </p>
        </div>

        {anomalies.length > 0 ? (
          <div className="space-y-4">
            <h3 className="font-medium">Detected Anomalies ({anomalies.length})</h3>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {anomalies.map((anomaly) => (
                <Card key={anomaly.shipment.id} className="overflow-hidden border-l-4 border-l-red-500">
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{anomaly.shipment.tracking_number}</h4>
                      <div className="flex gap-2">
                        <Badge className={getStatusColor(anomaly.shipment.status)}>{anomaly.shipment.status}</Badge>
                        <Badge className={getAnomalyColor(anomaly.anomaly_score)}>
                          Anomaly Score: {(anomaly.anomaly_score * 100).toFixed(0)}%
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">From:</span>{" "}
                        {formatAddress(anomaly.shipment.origin_address)}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">To:</span>{" "}
                        {formatAddress(anomaly.shipment.destination_address)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Shipped:</span>{" "}
                        {anomaly.shipment.shipping_date
                          ? format(new Date(anomaly.shipment.shipping_date), "MMM d, yyyy")
                          : "Not shipped"}
                      </div>
                      <div className="flex items-center gap-1">
                        <TruckIcon className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Carrier:</span> {anomaly.shipment.carrier}
                      </div>
                    </div>

                    <div className="bg-muted p-3 rounded-md flex items-start gap-2 mt-2">
                      <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium mb-1">Anomaly Type: {anomaly.anomaly_type}</p>
                        <p className="text-sm text-muted-foreground">{anomaly.explanation}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No anomalies detected with the current settings.</p>
            <p className="text-sm mt-2">Try lowering the threshold or changing the detection method.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
