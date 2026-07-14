"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Truck,
  Gauge,
  Fuel,
  AlertTriangle,
  Wrench,
  Trophy,
  Mic,
  Wallet,
  MapPin,
  Clock,
  Activity,
  TrendingUp,
  Users,
  Zap,
  RefreshCw,
  ChevronRight,
  Signal,
  Battery,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  useFleetTelemetry,
  usePredictiveMaintenanceAlerts,
  useDriverLeaderboard,
  useVoiceActivityFeed,
  useCantonTransactions,
  useFleetStatistics,
  useFleetTelemetryRealtime,
  type FleetTelemetry,
} from "@/lib/hooks/use-iot-fleet"

// ============================================================================
// Helper Functions
// ============================================================================

function getStatusColor(status: string): string {
  switch (status) {
    case "in_transit":
      return "bg-emerald-500"
    case "idle":
      return "bg-amber-500"
    case "maintenance":
      return "bg-blue-500"
    case "offline":
      return "bg-red-500"
    default:
      return "bg-gray-500"
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "in_transit":
      return "In Transit"
    case "idle":
      return "Idle"
    case "maintenance":
      return "Maintenance"
    case "offline":
      return "Offline"
    default:
      return status
  }
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-600 dark:text-emerald-400"
  if (score >= 60) return "text-amber-600 dark:text-amber-400"
  return "text-red-600 dark:text-red-400"
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

// ============================================================================
// Sub-Components
// ============================================================================

function FleetMetricsCards({ stats }: { stats: ReturnType<typeof useFleetStatistics> }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
        <Card className="dashboard-metric-card">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <Truck className="h-4 w-4 text-blue-500" />
              <Badge variant="secondary" className="text-xs">Total</Badge>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.totalTrucks}</p>
            <p className="text-xs text-muted-foreground">Fleet Size</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card className="dashboard-metric-card border-emerald-500/30">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <Activity className="h-4 w-4 text-emerald-500" />
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.inTransit}</p>
            <p className="text-xs text-muted-foreground">In Transit</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="dashboard-metric-card">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.idle}</p>
            <p className="text-xs text-muted-foreground">Idle</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card className="dashboard-metric-card">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <Wrench className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.maintenance}</p>
            <p className="text-xs text-muted-foreground">Maintenance</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="dashboard-metric-card">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <Signal className="h-4 w-4 text-red-500" />
            </div>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.offline}</p>
            <p className="text-xs text-muted-foreground">Offline</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <Card className="dashboard-metric-card">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <Fuel className="h-4 w-4 text-cyan-500" />
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.avgFuelLevel}%</p>
            <p className="text-xs text-muted-foreground">Avg Fuel</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="dashboard-metric-card">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <Gauge className="h-4 w-4 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.avgSpeed}</p>
            <p className="text-xs text-muted-foreground">Avg MPH</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <Card className="dashboard-metric-card border-amber-500/30">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.alertCount}</p>
            <p className="text-xs text-muted-foreground">Alerts</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

function MaintenanceScorePanel() {
  const { data: alerts, isLoading } = usePredictiveMaintenanceAlerts()

  return (
    <Card className="enterprise-card h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base text-foreground">
          <Wrench className="h-4 w-4 text-amber-500" />
          Predictive Maintenance Alerts
        </CardTitle>
        <CardDescription className="text-xs">AI-powered failure prediction</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="p-4 flex items-center justify-center">
              <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-1 px-4 pb-4">
              {alerts?.map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-3 rounded-lg border ${
                    alert.overall_score < 75
                      ? "bg-red-500/10 border-red-500/30"
                      : "bg-amber-500/10 border-amber-500/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono font-semibold text-foreground">{alert.truck_id}</span>
                    </div>
                    <span className={`text-lg font-bold ${getScoreColor(alert.overall_score)}`}>
                      {alert.overall_score}/100
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    <div className="text-center">
                      <p className={`text-xs font-medium ${getScoreColor(alert.engine_score)}`}>
                        {alert.engine_score}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Engine</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-xs font-medium ${getScoreColor(alert.transmission_score)}`}>
                        {alert.transmission_score}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Trans</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-xs font-medium ${getScoreColor(alert.brakes_score)}`}>
                        {alert.brakes_score}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Brakes</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-xs font-medium ${getScoreColor(alert.tires_score)}`}>
                        {alert.tires_score}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Tires</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Est. failure in {alert.predicted_failure_days} days
                    </p>
                    <Badge variant="outline" className="text-[10px]">
                      {Math.round(alert.confidence_level * 100)}% confidence
                    </Badge>
                  </div>
                  <p className="text-xs text-foreground mt-2 font-medium">
                    {alert.recommended_action}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

function DriverLeaderboard() {
  const { data: drivers, isLoading } = useDriverLeaderboard()

  return (
    <Card className="enterprise-card h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base text-foreground">
          <Trophy className="h-4 w-4 text-amber-500" />
          Driver Leaderboard
        </CardTitle>
        <CardDescription className="text-xs">Gamification & performance tracking</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="p-4 flex items-center justify-center">
              <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-1 px-4 pb-4">
              {drivers?.map((driver, index) => (
                <motion.div
                  key={driver.driver_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50"
                >
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                      index === 0
                        ? "bg-gradient-to-br from-amber-400 to-amber-600"
                        : index === 1
                          ? "bg-gradient-to-br from-gray-300 to-gray-500"
                          : index === 2
                            ? "bg-gradient-to-br from-amber-600 to-amber-800"
                            : "bg-muted"
                    }`}
                  >
                    {index < 3 ? (
                      <Trophy className="h-4 w-4" />
                    ) : (
                      <span className="text-muted-foreground">{driver.rank}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{driver.driver_name}</p>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span>{driver.total_miles.toLocaleString()} mi</span>
                      <span>|</span>
                      <span>{driver.fuel_efficiency.toFixed(1)} mpg</span>
                      <span>|</span>
                      <span>{driver.on_time_deliveries}% OT</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{driver.points.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">points</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

function VoiceActivityFeed() {
  const { data: activities, isLoading } = useVoiceActivityFeed()

  return (
    <Card className="enterprise-card h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base text-foreground">
          <Mic className="h-4 w-4 text-purple-500" />
          Voice Activity Feed
        </CardTitle>
        <CardDescription className="text-xs">Real-time driver voice commands</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="p-4 flex items-center justify-center">
              <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-1 px-4 pb-4">
              <AnimatePresence mode="popLayout">
                {activities?.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {activity.command_type.replace("_", " ")}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {formatTimeAgo(activity.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-foreground italic">
                      {'"'}{activity.transcription}{'"'}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        variant="secondary"
                        className={`text-[10px] ${
                          activity.status === "completed"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-amber-500/10 text-amber-600"
                        }`}
                      >
                        {activity.status}
                      </Badge>
                      {activity.agent_name && (
                        <span className="text-[10px] text-muted-foreground">
                          via {activity.agent_name}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

function CantonIntegrationPanel() {
  const { data: transactions, isLoading } = useCantonTransactions()
  
  // Calculate total NTGC in demo
  const totalNTGC = transactions?.reduce((sum, tx) => sum + tx.amount_ntgc, 0) || 0

  return (
    <Card className="enterprise-card h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base text-foreground">
          <Wallet className="h-4 w-4 text-cyan-500" />
          Canton Network
        </CardTitle>
        <CardDescription className="text-xs">NTGC stablecoin transactions</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="px-4 pb-3 border-b border-border/50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total NTGC Transacted</span>
            <span className="text-lg font-bold text-cyan-600 dark:text-cyan-400">
              {totalNTGC.toLocaleString()} NTGC
            </span>
          </div>
        </div>
        <ScrollArea className="h-[340px]">
          {isLoading ? (
            <div className="p-4 flex items-center justify-center">
              <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-1 px-4 py-3">
              {transactions?.map((tx, index) => (
                <motion.div
                  key={tx.tx_hash}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        tx.contract_type === "driver_payment"
                          ? "border-emerald-500/50 text-emerald-600"
                          : tx.contract_type === "load_assignment"
                            ? "border-blue-500/50 text-blue-600"
                            : "border-purple-500/50 text-purple-600"
                      }`}
                    >
                      {tx.contract_type.replace("_", " ")}
                    </Badge>
                    <span className="font-bold text-cyan-600 dark:text-cyan-400">
                      {tx.amount_ntgc} NTGC
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span className="font-mono truncate max-w-[120px]">
                      {tx.tx_hash.slice(0, 10)}...{tx.tx_hash.slice(-6)}
                    </span>
                    <span>Load #{tx.load_id}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {formatTimeAgo(tx.created_at)}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

function FleetMapPlaceholder({ trucks }: { trucks: FleetTelemetry[] | undefined }) {
  const statusCounts = trucks?.reduce((acc, truck) => {
    const status = truck.alert_level || "normal"
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  // Simulate geographic spread across different regions
  const getGeographicPosition = (index: number, total: number) => {
    const regions = [
      { lat: 40.7128, lng: -74.0060, name: "Northeast" },  // NYC area
      { lat: 33.7490, lng: -84.3880, name: "Southeast" },  // Atlanta area
      { lat: 41.8781, lng: -87.6298, name: "Midwest" },    // Chicago area
      { lat: 29.7604, lng: -95.3698, name: "South" },      // Houston area
      { lat: 37.7749, lng: -122.4194, name: "West" },      // SF area
    ]
    
    const region = regions[index % regions.length]
    const jitter = { lat: (Math.random() - 0.5) * 2, lng: (Math.random() - 0.5) * 3 }
    
    return {
      lat: region.lat + jitter.lat,
      lng: region.lng + jitter.lng,
      region: region.name
    }
  }

  return (
    <Card className="overflow-hidden border-border/50 bg-gradient-to-br from-card via-card to-card/80">
      <CardHeader className="border-b border-border/50 bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-emerald-500" />
            Fleet Map
          </div>
          <Badge variant="outline" className="bg-background/50">
            {trucks?.length || 0} Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative h-[400px] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
          {/* US Map SVG Outline */}
          <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 960 600" preserveAspectRatio="xMidYMid meet">
            <path
              d="M 152 400 L 180 390 L 200 380 L 240 390 L 270 400 L 300 380 L 340 390 L 380 400 L 420 410 L 460 400 L 500 390 L 540 380 L 580 390 L 620 400 L 660 410 L 700 420 L 740 410 L 780 400 L 800 390 L 820 380"
              stroke="currentColor"
              strokeWidth="1"
              fill="none"
              className="text-primary/30"
            />
            <path
              d="M 200 300 L 250 280 L 300 270 L 350 280 L 400 290 L 450 280 L 500 270 L 550 280 L 600 290 L 650 300 L 700 310 L 750 300"
              stroke="currentColor"
              strokeWidth="1"
              fill="none"
              className="text-primary/30"
            />
          </svg>

          {/* Fleet truck markers with realistic positioning */}
          <div className="absolute inset-0">
            {trucks?.slice(0, 30).map((truck, i) => {
              const pos = getGeographicPosition(i, trucks.length)
              // Convert lat/lng to viewport percentage (simplified projection)
              const x = ((pos.lng + 125) / 58) * 100
              const y = ((pos.lat - 25) / 25) * 100
              
              return (
                <div
                  key={truck.truck_id}
                  className="absolute group cursor-pointer"
                  style={{
                    left: `${Math.max(5, Math.min(95, x))}%`,
                    top: `${Math.max(10, Math.min(90, 100 - y))}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <div
                    className={`h-3 w-3 rounded-full ${
                      truck.alert_level === "critical" ? "bg-red-500 animate-pulse" :
                      truck.alert_level === "warning" ? "bg-yellow-500" :
                      "bg-emerald-500"
                    } shadow-lg ring-2 ring-background/50 transition-all group-hover:scale-150`}
                  />
                  {/* Tooltip on hover */}
                  <div className="absolute hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-background/95 backdrop-blur-sm border border-border rounded text-xs whitespace-nowrap z-10">
                    <div className="font-medium">{truck.driver_name}</div>
                    <div className="text-muted-foreground text-[10px]">{pos.region}</div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 border border-border/50 z-10">
            <div className="space-y-1">
              {Object.entries(statusCounts).map(([status, count]) => (
                <div key={status} className="flex items-center gap-2 text-xs">
                  <span className={`h-2 w-2 rounded-full ${getStatusColor(status)}`} />
                  <span className="text-muted-foreground">{getStatusLabel(status)}</span>
                  <span className="font-medium text-foreground">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Geographic coverage indicator */}
          <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-border/50 z-10">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium">Live Tracking</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function IoTFleetDashboard() {
  const { data: fleet, isLoading: fleetLoading, mutate: mutateFleet } = useFleetTelemetry({ limit: 50 })
  const stats = useFleetStatistics()
  const [selectedTruck, setSelectedTruck] = useState<FleetTelemetry | null>(null)

  // Handle real-time updates
  const handleTruckUpdate = useCallback((updatedTruck: FleetTelemetry) => {
    mutateFleet(
      (current) =>
        current?.map((t) => (t.truck_id === updatedTruck.truck_id ? updatedTruck : t)),
      false
    )
  }, [mutateFleet])

  useFleetTelemetryRealtime(handleTruckUpdate)

  return (
    <div className="flex-1 p-6 space-y-6 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Truck className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">IoT Fleet Management</h1>
              <p className="text-sm text-muted-foreground">Kronova for NTG - Real-time Fleet Visibility</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse mr-2" />
            Live Updates
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => mutateFleet()}
            disabled={fleetLoading}
            className="bg-transparent"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${fleetLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Fleet Metrics */}
      <FleetMetricsCards stats={stats} />

      {/* Main Dashboard Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map - Large Panel */}
        <div className="lg:col-span-2">
          <FleetMapPlaceholder trucks={fleet} />
        </div>

        {/* Maintenance Alerts */}
        <MaintenanceScorePanel />
      </div>

      {/* Secondary Panels */}
      <div className="grid lg:grid-cols-3 gap-6">
        <VoiceActivityFeed />
        <DriverLeaderboard />
        <CantonIntegrationPanel />
      </div>
    </div>
  )
}
