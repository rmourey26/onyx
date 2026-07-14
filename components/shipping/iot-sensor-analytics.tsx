"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Loader2, Thermometer, Droplets, Activity, MapPin, BarChart, AlertTriangle } from "lucide-react"
import { format } from "date-fns"

interface IoTSensorAnalyticsProps {
  shipmentData: any[]
  isLoading?: boolean
}

export function IoTSensorAnalytics({ shipmentData, isLoading = false }: IoTSensorAnalyticsProps) {
  const [selectedShipment, setSelectedShipment] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("temperature")
  const [sensorData, setSensorData] = useState<any>(null)
  const [alertsCount, setAlertsCount] = useState<Record<string, number>>({})

  // Filter to only shipments with IoT data
  const iotShipments = shipmentData.filter((shipment) => shipment.iot_data)

  useEffect(() => {
    if (iotShipments.length > 0 && !selectedShipment) {
      setSelectedShipment(iotShipments[0].tracking_number)
    }
  }, [iotShipments, selectedShipment])

  useEffect(() => {
    if (selectedShipment) {
      const shipment = iotShipments.find((s) => s.tracking_number === selectedShipment)
      if (shipment && shipment.iot_data) {
        setSensorData(shipment.iot_data)

        // Count alerts by type
        const alertCounts: Record<string, number> = {}
        if (shipment.iot_data.alerts) {
          shipment.iot_data.alerts.forEach((alert: any) => {
            alertCounts[alert.type] = (alertCounts[alert.type] || 0) + 1
          })
        }
        setAlertsCount(alertCounts)
      } else {
        setSensorData(null)
        setAlertsCount({})
      }
    }
  }, [selectedShipment, iotShipments])

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "medium":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      case "low":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const renderSensorReadingsChart = () => {
    if (!sensorData || !sensorData.sensor_readings || sensorData.sensor_readings.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <BarChart className="h-12 w-12 mb-4 opacity-50" />
          <p>No sensor readings available for this shipment</p>
        </div>
      )
    }

    const readings = sensorData.sensor_readings

    // Determine what data to display based on active tab
    let data: any[] = []
    let unit = ""
    let min = 0
    let max = 0

    switch (activeTab) {
      case "temperature":
        data = readings.map((r: any) => ({
          timestamp: new Date(r.timestamp),
          value: r.temperature.value,
        }))
        unit = "°C"
        min = Math.min(...data.map((d) => d.value)) - 2
        max = Math.max(...data.map((d) => d.value)) + 2
        break
      case "humidity":
        data = readings.map((r: any) => ({
          timestamp: new Date(r.timestamp),
          value: r.humidity.value,
        }))
        unit = "%"
        min = Math.min(...data.map((d) => d.value)) - 5
        max = Math.max(...data.map((d) => d.value)) + 5
        break
      case "shock":
        data = readings.map((r: any) => ({
          timestamp: new Date(r.timestamp),
          value: r.shock.value,
        }))
        unit = "g"
        min = 0
        max = Math.max(...data.map((d) => d.value)) + 2
        break
      case "battery":
        data = readings.map((r: any) => ({
          timestamp: new Date(r.timestamp),
          value: r.battery.value,
        }))
        unit = "%"
        min = 0
        max = 100
        break
    }

    // Sort data by timestamp
    data.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

    // Simple chart rendering - in a real app, you'd use a charting library
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">Range</p>
            <p className="font-medium">
              {min.toFixed(1)}
              {unit} - {max.toFixed(1)}
              {unit}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Average</p>
            <p className="font-medium">
              {(data.reduce((sum, d) => sum + d.value, 0) / data.length).toFixed(1)}
              {unit}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Readings</p>
            <p className="font-medium">{data.length}</p>
          </div>
        </div>

        <div className="h-64 w-full relative border rounded-md p-4">
          <div className="absolute inset-0 flex items-end p-4">
            {data.map((point, i) => {
              const height = ((point.value - min) / (max - min)) * 100
              const width = 100 / data.length

              // Determine color based on value and type
              let color = "bg-blue-500"
              if (activeTab === "temperature") {
                if (point.value > 30) color = "bg-red-500"
                else if (point.value < 0) color = "bg-cyan-500"
              } else if (activeTab === "shock") {
                if (point.value > 5) color = "bg-red-500"
              } else if (activeTab === "battery") {
                if (point.value < 20) color = "bg-red-500"
                else if (point.value < 50) color = "bg-yellow-500"
                else color = "bg-green-500"
              }

              return (
                <div
                  key={i}
                  className="flex-1 flex items-end justify-center"
                  title={`${format(point.timestamp, "MMM d, yyyy HH:mm")}: ${point.value.toFixed(1)}${unit}`}
                >
                  <div
                    className={`${color} rounded-t-sm w-[80%] transition-all duration-300`}
                    style={{ height: `${Math.max(height, 1)}%` }}
                  ></div>
                </div>
              )
            })}
          </div>

          {/* X-axis labels */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 text-xs text-muted-foreground">
            <span>{format(data[0].timestamp, "MMM d")}</span>
            <span>{format(data[Math.floor(data.length / 2)].timestamp, "MMM d")}</span>
            <span>{format(data[data.length - 1].timestamp, "MMM d")}</span>
          </div>

          {/* Y-axis labels */}
          <div className="absolute top-0 bottom-0 left-0 flex flex-col justify-between py-4 text-xs text-muted-foreground">
            <span>
              {max.toFixed(0)}
              {unit}
            </span>
            <span>
              {((max + min) / 2).toFixed(0)}
              {unit}
            </span>
            <span>
              {min.toFixed(0)}
              {unit}
            </span>
          </div>
        </div>
      </div>
    )
  }

  const renderLocationTracking = () => {
    if (!sensorData || !sensorData.location_tracking || sensorData.location_tracking.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <MapPin className="h-12 w-12 mb-4 opacity-50" />
          <p>No location tracking data available for this shipment</p>
        </div>
      )
    }

    const locations = sensorData.location_tracking

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">Total Points</p>
            <p className="font-medium">{locations.length}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">First Tracked</p>
            <p className="font-medium">{format(new Date(locations[0].timestamp), "MMM d, yyyy")}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Last Updated</p>
            <p className="font-medium">{format(new Date(locations[locations.length - 1].timestamp), "MMM d, yyyy")}</p>
          </div>
        </div>

        <div className="border rounded-md overflow-hidden">
          <div className="bg-muted p-4 text-sm font-medium">Location History</div>
          <div className="max-h-[300px] overflow-y-auto">
            {locations.map((location: any, index: number) => (
              <div key={index} className="p-3 border-b last:border-b-0 flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs">
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-medium">
                    {location.facility_type.charAt(0).toUpperCase() + location.facility_type.slice(1).replace("_", " ")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Lat: {location.latitude.toFixed(4)}, Lng: {location.longitude.toFixed(4)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(location.timestamp), "MMM d, yyyy HH:mm")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderAlerts = () => {
    if (!sensorData || !sensorData.alerts || sensorData.alerts.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <AlertTriangle className="h-12 w-12 mb-4 opacity-50" />
          <p>No alerts detected for this shipment</p>
        </div>
      )
    }

    const alerts = sensorData.alerts

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {Object.entries(alertsCount).map(([type, count]) => (
            <Badge key={type} variant="outline" className="capitalize">
              {type.replace("_", " ")}: {count}
            </Badge>
          ))}
        </div>

        <div className="border rounded-md overflow-hidden">
          <div className="bg-muted p-4 text-sm font-medium">Alert History</div>
          <div className="max-h-[300px] overflow-y-auto">
            {alerts.map((alert: any, index: number) => (
              <div key={index} className="p-3 border-b last:border-b-0">
                <div className="flex justify-between items-start mb-1">
                  <p className="font-medium capitalize">{alert.type.replace("_", " ")}</p>
                  <Badge className={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                </div>
                <p className="text-sm">{alert.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {format(new Date(alert.timestamp), "MMM d, yyyy HH:mm")}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          IoT Sensor Analytics
        </CardTitle>
        <CardDescription>Monitor real-time sensor data from IoT-enabled shipments</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : iotShipments.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No IoT-enabled shipments found</p>
            <p className="text-sm mt-2">Try creating shipments with IoT sensor data</p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="shipment-select">Select IoT-Enabled Shipment</Label>
              <Select value={selectedShipment || ""} onValueChange={setSelectedShipment}>
                <SelectTrigger id="shipment-select">
                  <SelectValue placeholder="Select a shipment" />
                </SelectTrigger>
                <SelectContent>
                  {iotShipments.map((shipment) => (
                    <SelectItem key={shipment.tracking_number} value={shipment.tracking_number}>
                      {shipment.tracking_number} ({shipment.carrier})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {sensorData ? (
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-md">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Device ID</p>
                      <p className="font-medium">{sensorData.device_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Sensor Type</p>
                      <p className="font-medium capitalize">{sensorData.sensor_type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Refrigerated</p>
                      <p className="font-medium">{sensorData.is_refrigerated ? "Yes" : "No"}</p>
                    </div>
                  </div>
                </div>

                <Tabs defaultValue="temperature" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-4">
                    <TabsTrigger value="temperature" className="flex items-center gap-1">
                      <Thermometer className="h-4 w-4" />
                      <span className="hidden sm:inline">Temperature</span>
                    </TabsTrigger>
                    <TabsTrigger value="humidity" className="flex items-center gap-1">
                      <Droplets className="h-4 w-4" />
                      <span className="hidden sm:inline">Humidity</span>
                    </TabsTrigger>
                    <TabsTrigger value="shock" className="flex items-center gap-1">
                      <Activity className="h-4 w-4" />
                      <span className="hidden sm:inline">Shock</span>
                    </TabsTrigger>
                    <TabsTrigger value="battery" className="flex items-center gap-1">
                      <BarChart className="h-4 w-4" />
                      <span className="hidden sm:inline">Battery</span>
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="temperature" className="pt-4">
                    {renderSensorReadingsChart()}
                  </TabsContent>
                  <TabsContent value="humidity" className="pt-4">
                    {renderSensorReadingsChart()}
                  </TabsContent>
                  <TabsContent value="shock" className="pt-4">
                    {renderSensorReadingsChart()}
                  </TabsContent>
                  <TabsContent value="battery" className="pt-4">
                    {renderSensorReadingsChart()}
                  </TabsContent>
                </Tabs>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Location Tracking</h3>
                    {renderLocationTracking()}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-4">Alerts & Notifications</h3>
                    {renderAlerts()}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a shipment to view IoT sensor data</p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
