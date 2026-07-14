"use client"

import { useState, useEffect } from "react"
import { X, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AppInstallBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    try {
      if (typeof window === "undefined" || typeof navigator === "undefined") {
        return
      }

      // Check if the app is already installed with error handling
      let isAppInstalled = false
      try {
        isAppInstalled = window.matchMedia && window.matchMedia("(display-mode: standalone)").matches
      } catch (error) {
        console.error("Error checking app install status:", error)
      }
      setIsStandalone(isAppInstalled)

      // Detect iOS with error handling
      try {
        const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
        setIsIOS(iOS)
      } catch (error) {
        console.error("Error detecting iOS:", error)
      }

      // Detect Android with error handling
      try {
        const android = /Android/.test(navigator.userAgent)
        setIsAndroid(android)
      } catch (error) {
        console.error("Error detecting Android:", error)
      }

      // Listen for the beforeinstallprompt event with error handling
      const handleBeforeInstallPrompt = (e: Event) => {
        try {
          // Prevent the mini-infobar from appearing on mobile
          e.preventDefault()
          // Stash the event so it can be triggered later
          setDeferredPrompt(e)
          // Only show the banner if on mobile and not already installed
          if ((isIOS || isAndroid) && !isAppInstalled) {
            // Check if user has dismissed the banner before
            let dismissed = false
            try {
              dismissed = localStorage.getItem("app-install-banner-dismissed") === "true"
            } catch (error) {
              console.error("Error accessing localStorage:", error)
            }
            if (!dismissed) {
              setShowBanner(true)
            }
          }
        } catch (error) {
          console.error("Error handling beforeinstallprompt:", error)
        }
      }

      if (window.addEventListener) {
        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      }

      // Clean up
      return () => {
        if (window.removeEventListener) {
          window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
        }
      }
    } catch (error) {
      console.error("App install banner initialization error:", error)
    }
  }, [isIOS, isAndroid])

  const dismissBanner = () => {
    try {
      setShowBanner(false)
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("app-install-banner-dismissed", "true")
      }
    } catch (error) {
      console.error("Error dismissing banner:", error)
    }
  }

  const installApp = async () => {
    try {
      if (!deferredPrompt || !deferredPrompt.prompt) return

      // Show the install prompt
      await deferredPrompt.prompt()

      // Wait for the user to respond to the prompt
      if (deferredPrompt.userChoice) {
        const { outcome } = await deferredPrompt.userChoice
        console.log(`User response to the install prompt: ${outcome}`)
      }

      // We've used the prompt, and can't use it again, throw it away
      setDeferredPrompt(null)

      // Hide the banner
      dismissBanner()
    } catch (error) {
      console.error("Error installing app:", error)
      // Hide the banner even if installation fails
      dismissBanner()
    }
  }

  if (!showBanner || isStandalone) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 p-4 shadow-lg z-50 border-t">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-medium">Install Kronova App</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isIOS ? "Tap the share button and select 'Add to Home Screen'" : "Install our app for a better experience"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isIOS && deferredPrompt && (
            <Button variant="default" size="sm" onClick={installApp}>
              <Download className="h-4 w-4 mr-2" />
              Install
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={dismissBanner}>
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
