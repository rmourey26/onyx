import type { Metadata } from "next"
import { ROIDataDashboard } from "@/components/ai-suite/roi-data-dashboard"

export const metadata: Metadata = {
  title: "ROI Analytics - AI Business Suite",
  description: "Calculate and analyze AI investment returns with our comprehensive ROI calculator and assessments dashboard",
}

export default function ROIAnalyticsPage() {
  return <ROIDataDashboard />
}
