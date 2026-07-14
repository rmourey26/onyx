"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw as Refresh } from "lucide-react"

export function PWARegister() {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    try {
      if (typeof window === "undefined" || !("serviceWorker" in navigator) || !(window as any).workbox) {
        return
      }

      // Register the service worker with better error handling
      navigator.serviceWorker
        .register("/service-worker.js")
        .then((reg) => {
          console.log("Service worker registered successfully", reg)
          setRegistration(reg)

          // Check if there's an update available
          if (reg.onupdatefound !== undefined) {
            reg.onupdatefound = () => {
              const installingWorker = reg.installing
              if (installingWorker && installingWorker.onstatechange !== undefined) {
                installingWorker.onstatechange = () => {
                  if (installingWorker.state === "installed" && navigator.serviceWorker.controller) {
                    setIsUpdateAvailable(true)
                  }
                }
              }
            }
          }
        })
        .catch((error) => {
          console.error("Service worker registration failed:", error)
          // Fail silently to prevent client-side exceptions
        })
    } catch (error) {
      console.error("PWA registration error:", error)
      // Fail silently to prevent client-side exceptions
    }
  }, [])

  const updateServiceWorker = () => {
    try {
      if (registration && registration.waiting && registration.waiting.postMessage) {
        // Send a message to the waiting service worker to skip waiting and become active
        registration.waiting.postMessage({ type: "SKIP_WAITING" })

        // Reload the page to load the new version
        if (typeof window !== "undefined" && window.location) {
          window.location.reload()
        }
      }
    } catch (error) {
      console.error("Service worker update error:", error)
      // Fail silently to prevent client-side exceptions
    }
  }

  if (!isUpdateAvailable) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button onClick={updateServiceWorker} className="flex items-center gap-2">
        <Refresh className="h-4 w-4" />
        <span>Update Available</span>
      </Button>
    </div>
  )
}
