"use client"

import { useState, useEffect, useRef } from "react"
import { MessageCircle, Lightbulb, Bug, X, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { FeedbackModal } from "@/components/feedback/feedback-modal"
import { SupportChatWidget } from "@/components/support/support-chat-widget"

export function UnifiedFAB() {
  const [isOpen, setIsOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close speed-dial when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  // Allow any page to open Kairo via a custom event (e.g. /support page CTA)
  useEffect(() => {
    function handleOpenKairo() {
      setChatOpen(true)
      setIsOpen(false)
    }
    window.addEventListener("kronova:open-kairo", handleOpenKairo)
    return () => window.removeEventListener("kronova:open-kairo", handleOpenKairo)
  }, [])

  const handleChatClick = () => {
    setChatOpen(true)
    setIsOpen(false)
  }

  return (
    <>
      {/* Unified speed-dial anchor — bottom right */}
      <div
        ref={ref}
        className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3"
        aria-label="Support actions"
      >
        {/* Speed-dial items — animate up when open */}
        <div
          className={cn(
            "flex flex-col items-end gap-2 transition-all duration-200",
            isOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-2 pointer-events-none",
          )}
          aria-hidden={!isOpen}
        >
          {/* Chat with Kairo */}
          <button
            onClick={handleChatClick}
            className="group flex items-center gap-3 focus:outline-none"
            tabIndex={isOpen ? 0 : -1}
            aria-label="Chat with Kairo"
          >
            <span className="hidden sm:flex items-center h-8 px-3 rounded-lg glass-morphism border border-primary/20 text-xs font-medium text-foreground shadow-md group-hover:border-primary/40 group-hover:shadow-primary/10 transition-all whitespace-nowrap">
              Chat with Kairo
            </span>
            <div className="h-10 w-10 rounded-full enterprise-button flex items-center justify-center shadow-lg group-hover:scale-105 transition-all duration-200">
              <MessageCircle className="h-4 w-4" />
            </div>
          </button>

          {/* Feature Request */}
          <FeedbackModal defaultType="feature_request">
            <button
              className="group flex items-center gap-3 focus:outline-none"
              tabIndex={isOpen ? 0 : -1}
              aria-label="Request a feature"
              onClick={() => setIsOpen(false)}
            >
              <span className="hidden sm:flex items-center h-8 px-3 rounded-lg glass-morphism border border-border/40 text-xs font-medium text-foreground shadow-md group-hover:border-primary/30 transition-all whitespace-nowrap">
                Feature Request
              </span>
              <div className="h-10 w-10 rounded-full glass-morphism border border-border/40 text-foreground flex items-center justify-center shadow-md group-hover:border-primary/40 group-hover:scale-105 transition-all duration-200">
                <Lightbulb className="h-4 w-4" />
              </div>
            </button>
          </FeedbackModal>

          {/* Report Bug */}
          <FeedbackModal defaultType="bug">
            <button
              className="group flex items-center gap-3 focus:outline-none"
              tabIndex={isOpen ? 0 : -1}
              aria-label="Report a bug"
              onClick={() => setIsOpen(false)}
            >
              <span className="hidden sm:flex items-center h-8 px-3 rounded-lg glass-morphism border border-border/40 text-xs font-medium text-foreground shadow-md group-hover:border-primary/30 transition-all whitespace-nowrap">
                Report Bug
              </span>
              <div className="h-10 w-10 rounded-full glass-morphism border border-border/40 text-foreground flex items-center justify-center shadow-md group-hover:border-primary/40 group-hover:scale-105 transition-all duration-200">
                <Bug className="h-4 w-4" />
              </div>
            </button>
          </FeedbackModal>
        </div>

        {/* Primary FAB toggle */}
        <button
          onClick={() => setIsOpen(o => !o)}
          aria-label={isOpen ? "Close support menu" : "Open support menu"}
          aria-expanded={isOpen}
          className={cn(
            "h-14 w-14 rounded-full flex items-center justify-center",
            "enterprise-button shadow-xl shadow-primary/25",
            "hover:scale-105 active:scale-95 transition-all duration-200",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          )}
        >
          <Plus
            className={cn(
              "h-5 w-5 transition-transform duration-200",
              isOpen && "rotate-45",
            )}
          />
        </button>
      </div>

      {/* Kairo chat panel — rendered outside the FAB container so it can go full-width on mobile */}
      <SupportChatWidget externalOpen={chatOpen} onExternalClose={() => setChatOpen(false)} />
    </>
  )
}
