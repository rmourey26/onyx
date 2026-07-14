import { Suspense } from "react"
import { SupportLearningDashboard } from "@/components/ai-suite/support-learning-dashboard"
import { RefreshCw } from "lucide-react"

export const metadata = {
  title: "Support Learning Layer | AI Business Suite",
  description: "AI-powered customer support intelligence and learning analytics for Kronova",
}

function LoadingState() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading support learning dashboard...</p>
      </div>
    </div>
  )
}

export default function SupportLearningPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <SupportLearningDashboard />
    </Suspense>
  )
}
