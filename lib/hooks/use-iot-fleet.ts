"use client"

import useSWR from "swr"
import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"

// ============================================================================
// Types
// ============================================================================

export interface FleetTelemetry {
  id: string
  truck_id: string
  driver_id: string | null
  latitude: number
  longitude: number
  speed_mph: number
  fuel_level_percent: number
  engine_hours: number
  odometer_miles: number
  status: "in_transit" | "idle" | "maintenance" | "offline"
  last_updated: string
  created_at: string
}

export interface PredictiveMaintenanceScore {
  id: string
  truck_id: string
  overall_score: number
  engine_score: number
  transmission_score: number
  brakes_score: number
  tires_score: number
  predicted_failure_days: number
  recommended_action: string
  confidence_level: number
  ai_model_version: string
  calculated_at: string
  created_at: string
}

export interface DriverLeaderboardEntry {
  driver_id: string
  driver_name: string
  total_miles: number
  fuel_efficiency: number
  on_time_deliveries: number
  safety_score: number
  points: number
  rank: number
}

export interface VoiceActivityLog {
  id: string
  user_id: string
  transcription: string
  command_type: string
  status: string
  created_at: string
  agent_name?: string
}

export interface CantonTransaction {
  tx_hash: string
  contract_type: string
  driver_id: string
  amount_ntgc: number
  load_id: string
  created_at: string
}

// ============================================================================
// Mock Data Generators (for demo purposes)
// ============================================================================

function generateMockTrucks(count: number): FleetTelemetry[] {
  const statuses: FleetTelemetry["status"][] = ["in_transit", "idle", "maintenance", "offline"]
  const trucks: FleetTelemetry[] = []

  for (let i = 0; i < count; i++) {
    const truckId = `NTG-${String(i + 1).padStart(4, "0")}`
    trucks.push({
      id: crypto.randomUUID(),
      truck_id: truckId,
      driver_id: i % 5 === 0 ? null : crypto.randomUUID(),
      // Distributed around Atlanta (NTG HQ)
      latitude: 33.749 + (Math.random() - 0.5) * 10,
      longitude: -84.388 + (Math.random() - 0.5) * 10,
      speed_mph: Math.floor(Math.random() * 70),
      fuel_level_percent: Math.floor(Math.random() * 100),
      engine_hours: Math.floor(Math.random() * 10000) + 1000,
      odometer_miles: Math.floor(Math.random() * 500000) + 50000,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      last_updated: new Date().toISOString(),
      created_at: new Date().toISOString(),
    })
  }

  return trucks
}

function generateMockMaintenanceScores(truckIds: string[]): PredictiveMaintenanceScore[] {
  return truckIds.map(truckId => ({
    id: crypto.randomUUID(),
    truck_id: truckId,
    overall_score: Math.floor(Math.random() * 40) + 60,
    engine_score: Math.floor(Math.random() * 40) + 60,
    transmission_score: Math.floor(Math.random() * 40) + 60,
    brakes_score: Math.floor(Math.random() * 40) + 50,
    tires_score: Math.floor(Math.random() * 40) + 60,
    predicted_failure_days: Math.floor(Math.random() * 30) + 5,
    recommended_action: truckId === "NTG-1247"
      ? "Schedule brake inspection within 8 days - 85% confidence"
      : "Routine maintenance recommended",
    confidence_level: 0.75 + Math.random() * 0.2,
    ai_model_version: "predictive-maintenance-v2.1",
    calculated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  }))
}

function generateMockDriverLeaderboard(): DriverLeaderboardEntry[] {
  const names = [
    "Marcus Johnson", "Sarah Williams", "James Rodriguez", "Emily Chen",
    "Michael Brown", "Jennifer Davis", "Robert Wilson", "Lisa Anderson",
    "David Martinez", "Amanda Taylor"
  ]

  return names.map((name, index) => ({
    driver_id: crypto.randomUUID(),
    driver_name: name,
    total_miles: Math.floor(Math.random() * 50000) + 100000,
    fuel_efficiency: 6.5 + Math.random() * 2,
    on_time_deliveries: 90 + Math.floor(Math.random() * 10),
    safety_score: 85 + Math.floor(Math.random() * 15),
    points: 10000 - (index * 800) + Math.floor(Math.random() * 500),
    rank: index + 1,
  })).sort((a, b) => b.points - a.points)
}

function generateMockVoiceActivity(): VoiceActivityLog[] {
  const activities = [
    { transcription: "Accept load 47382 from Dallas to Chicago", command_type: "accept_load", status: "completed" },
    { transcription: "Post load from Atlanta to Miami, 35000 pounds, flatbed", command_type: "post_load", status: "completed" },
    { transcription: "Delivered to warehouse 4, signature captured", command_type: "complete_delivery", status: "completed" },
    { transcription: "Request fuel stop at next Pilot station", command_type: "fuel_request", status: "completed" },
    { transcription: "Check maintenance schedule for truck 1247", command_type: "maintenance_query", status: "completed" },
  ]

  return activities.map((activity, index) => ({
    id: crypto.randomUUID(),
    user_id: crypto.randomUUID(),
    ...activity,
    agent_name: "NTG Dispatcher Agent",
    created_at: new Date(Date.now() - index * 300000).toISOString(),
  }))
}

function generateMockCantonTransactions(): CantonTransaction[] {
  const transactions: CantonTransaction[] = []
  const loadIds = ["47382", "47383", "47384", "47385", "47386"]

  for (let i = 0; i < 10; i++) {
    transactions.push({
      tx_hash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
      contract_type: i % 3 === 0 ? "driver_payment" : i % 3 === 1 ? "load_assignment" : "pod_verification",
      driver_id: crypto.randomUUID(),
      amount_ntgc: Math.floor(Math.random() * 1000) + 200,
      load_id: loadIds[i % loadIds.length],
      created_at: new Date(Date.now() - i * 600000).toISOString(),
    })
  }

  return transactions
}

// ============================================================================
// SWR Fetchers
// ============================================================================

async function fetchFleetTelemetry(limit: number): Promise<FleetTelemetry[]> {
  const supabase = getSupabaseClient()
  
  // Try to fetch from database first
  const { data, error } = await supabase
    .from("fleet_telemetry")
    .select("*")
    .order("last_updated", { ascending: false })
    .limit(limit)

  if (error || !data || data.length === 0) {
    // Return mock data for demo purposes
    return generateMockTrucks(limit)
  }

  return data as FleetTelemetry[]
}

async function fetchMaintenanceAlerts(): Promise<PredictiveMaintenanceScore[]> {
  const supabase = getSupabaseClient()
  
  const { data, error } = await supabase
    .from("predictive_maintenance_scores")
    .select("*")
    .lt("overall_score", 80)
    .order("overall_score", { ascending: true })
    .limit(20)

  if (error || !data || data.length === 0) {
    // Return mock data with the demo truck
    const mockTrucks = generateMockTrucks(50)
    const mockScores = generateMockMaintenanceScores(mockTrucks.map(t => t.truck_id))
    return mockScores.filter(s => s.overall_score < 80).slice(0, 10)
  }

  return data as PredictiveMaintenanceScore[]
}

async function fetchDriverLeaderboard(): Promise<DriverLeaderboardEntry[]> {
  // For demo, always return mock data
  return generateMockDriverLeaderboard()
}

async function fetchVoiceActivityLogs(): Promise<VoiceActivityLog[]> {
  const supabase = getSupabaseClient()
  
  const { data, error } = await supabase
    .from("voice_execution_logs")
    .select(`
      id,
      user_id,
      transcription,
      metadata,
      created_at,
      ai_agents (name)
    `)
    .order("created_at", { ascending: false })
    .limit(20)

  if (error || !data || data.length === 0) {
    return generateMockVoiceActivity()
  }

  return data.map(log => ({
    id: log.id,
    user_id: log.user_id,
    transcription: log.transcription,
    command_type: (log.metadata as any)?.command_type || "voice_command",
    status: "completed",
    agent_name: (log.ai_agents as any)?.name || "Voice Agent",
    created_at: log.created_at,
  })) as VoiceActivityLog[]
}

async function fetchCantonTransactions(): Promise<CantonTransaction[]> {
  const supabase = getSupabaseClient()
  
  const { data, error } = await supabase
    .from("canton_transactions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20)

  if (error || !data || data.length === 0) {
    return generateMockCantonTransactions()
  }

  return data as CantonTransaction[]
}

// ============================================================================
// Hooks
// ============================================================================

export function useFleetTelemetry(options: { limit?: number } = {}) {
  const limit = options.limit || 50

  return useSWR<FleetTelemetry[]>(
    ["fleet-telemetry", limit],
    () => fetchFleetTelemetry(limit),
    {
      refreshInterval: 10000, // Refresh every 10 seconds for live updates
      revalidateOnFocus: true,
    }
  )
}

export function usePredictiveMaintenanceAlerts() {
  return useSWR<PredictiveMaintenanceScore[]>(
    "maintenance-alerts",
    fetchMaintenanceAlerts,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
    }
  )
}

export function useDriverLeaderboard() {
  return useSWR<DriverLeaderboardEntry[]>(
    "driver-leaderboard",
    fetchDriverLeaderboard,
    {
      refreshInterval: 60000,
      revalidateOnFocus: true,
    }
  )
}

export function useVoiceActivityFeed() {
  return useSWR<VoiceActivityLog[]>(
    "voice-activity",
    fetchVoiceActivityLogs,
    {
      refreshInterval: 5000, // Refresh every 5 seconds for real-time feel
      revalidateOnFocus: true,
    }
  )
}

export function useCantonTransactions() {
  return useSWR<CantonTransaction[]>(
    "canton-transactions",
    fetchCantonTransactions,
    {
      refreshInterval: 15000,
      revalidateOnFocus: true,
    }
  )
}

// ============================================================================
// Real-time Subscriptions
// ============================================================================

export function useFleetTelemetryRealtime(onUpdate: (truck: FleetTelemetry) => void) {
  const supabase = getSupabaseClient()
  
  useEffect(() => {
    const channel = supabase
      .channel("fleet-telemetry-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "fleet_telemetry" },
        (payload) => {
          if (payload.new) {
            onUpdate(payload.new as FleetTelemetry)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, onUpdate])
}

// ============================================================================
// Fleet Statistics Hook
// ============================================================================

export interface FleetStatistics {
  totalTrucks: number
  inTransit: number
  idle: number
  maintenance: number
  offline: number
  avgFuelLevel: number
  avgSpeed: number
  alertCount: number
}

export function useFleetStatistics() {
  const { data: fleet } = useFleetTelemetry({ limit: 100 })
  const { data: alerts } = usePredictiveMaintenanceAlerts()
  
  const [stats, setStats] = useState<FleetStatistics>({
    totalTrucks: 0,
    inTransit: 0,
    idle: 0,
    maintenance: 0,
    offline: 0,
    avgFuelLevel: 0,
    avgSpeed: 0,
    alertCount: 0,
  })

  useEffect(() => {
    if (fleet) {
      const totalTrucks = fleet.length
      const inTransit = fleet.filter(t => t.status === "in_transit").length
      const idle = fleet.filter(t => t.status === "idle").length
      const maintenance = fleet.filter(t => t.status === "maintenance").length
      const offline = fleet.filter(t => t.status === "offline").length
      const avgFuelLevel = fleet.reduce((sum, t) => sum + t.fuel_level_percent, 0) / totalTrucks
      const avgSpeed = fleet.filter(t => t.status === "in_transit").reduce((sum, t) => sum + t.speed_mph, 0) / (inTransit || 1)

      setStats({
        totalTrucks,
        inTransit,
        idle,
        maintenance,
        offline,
        avgFuelLevel: Math.round(avgFuelLevel),
        avgSpeed: Math.round(avgSpeed),
        alertCount: alerts?.length || 0,
      })
    }
  }, [fleet, alerts])

  return stats
}
