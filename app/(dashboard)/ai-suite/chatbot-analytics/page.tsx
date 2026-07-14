import { Suspense } from "react"
import { ChatbotLearningAnalytics } from "@/components/ai-suite/chatbot-learning-analytics"
import { RefreshCw } from "lucide-react"

export const metadata = {
  title: "Chatbot Learning Analytics | AI Business Suite",
  description: "AI chatbot performance metrics and continuous learning insights for Kronova",
}

function LoadingState() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading chatbot analytics...</p>
      </div>
    </div>
  )
}

export default function ChatbotAnalyticsPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ChatbotLearningAnalytics />
    </Suspense>
  )
}
