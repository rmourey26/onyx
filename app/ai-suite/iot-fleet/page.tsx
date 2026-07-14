import type { Metadata } from "next"
import { IoTFleetDashboard } from "@/components/iot/iot-fleet-dashboard"

export const metadata: Metadata = {
  title: "IoT Fleet Management - AI Business Suite",
  description: "Real-time fleet telemetry, predictive maintenance, and driver performance analytics",
}

export default function IoTFleetPage() {
  return <IoTFleetDashboard />
}
