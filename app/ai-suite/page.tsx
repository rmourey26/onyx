import { AISuiteDashboard } from "@/components/ai-suite/dashboard"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AI Business Suite Dashboard - Kronova",
  description: "Advanced AI analytics and agent management dashboard",
}

export default async function AISuitePage() {
  return <AISuiteDashboard />
}
