"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FeedbackModal } from "./feedback-modal"
import { MessageSquare, Bug, Lightbulb, ChevronUp, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export function FeedbackBadge() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {/* Expanded options */}
      {isExpanded && (
        <div className="flex flex-col gap-2 animate-in slide-in-from-bottom-2 duration-200">
          <FeedbackModal defaultType="feature_request">
            <Button
              size="sm"
              variant="secondary"
              className="shadow-lg hover:shadow-xl transition-shadow bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              Feature Request
            </Button>
          </FeedbackModal>

          <FeedbackModal defaultType="bug">
            <Button
              size="sm"
              variant="secondary"
              className="shadow-lg hover:shadow-xl transition-shadow bg-red-600 hover:bg-red-700 text-white"
            >
              <Bug className="h-4 w-4 mr-2" />
              Report Bug
            </Button>
          </FeedbackModal>

          <FeedbackModal defaultType="feedback">
            <Button
              size="sm"
              variant="secondary"
              className="shadow-lg hover:shadow-xl transition-shadow bg-green-600 hover:bg-green-700 text-white"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              General Feedback
            </Button>
          </FeedbackModal>
        </div>
      )}

      {/* Main toggle button */}
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "shadow-lg hover:shadow-xl transition-all duration-200 bg-primary hover:bg-primary/90",
          isExpanded ? "rounded-full" : "rounded-full",
        )}
        size="sm"
      >
        <MessageSquare className="h-4 w-4 mr-2" />
        Feedback
        {isExpanded ? <ChevronDown className="h-4 w-4 ml-2" /> : <ChevronUp className="h-4 w-4 ml-2" />}
      </Button>
    </div>
  )
}
