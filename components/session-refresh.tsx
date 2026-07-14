"use client"

import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase/singleton"
import { useRouter, usePathname } from "next/navigation"

export function SessionRefresh() {
  const router = useRouter()
  const pathname = usePathname()
  const [refreshAttempted, setRefreshAttempted] = useState(false)

  // Define public routes that don't require authentication
  const isPublicRoute = (path: string) => {
    return (
      path.startsWith("/p/") ||
      path.startsWith("/api/check-profile") ||
      path.startsWith("/api/debug-profile") ||
      path.startsWith("/api/fix-profiles") ||
      path.startsWith("/api/fix-specific-profile") ||
      path === "/test-public-card" ||
      path === "/login" ||
      path === "/" ||
      path === "/signup" ||
      path === "/forgot-password" ||
      path === "/reset-password" ||
      path === "/about" ||
      path.match(/\.(ico|png|jpg|jpeg|svg|css|js)$/)
    )
  }

  useEffect(() => {
    const supabase = getSupabaseClient()

    // Check and refresh session if needed
    const refreshSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Session error:", error)
          // If there's an error, try to refresh the session
          const refreshResult = await supabase.auth.refreshSession()

          if (refreshResult.error) {
            console.error("Failed to refresh session:", refreshResult.error)
            // Only redirect to login if we're not on a public route
            if (!isPublicRoute(pathname)) {
              router.push("/login")
            }
          } else {
            console.log("Session refreshed successfully")
          }
        } else if (!data.session) {
          console.log("No active session found")
          // Only redirect to login if we're not on a public route
          if (!isPublicRoute(pathname)) {
            router.push("/login")
          }
        }
      } catch (e) {
        console.error("Error during session refresh:", e)
        // Only redirect to login if we're not on a public route
        if (!isPublicRoute(pathname)) {
          router.push("/login")
        }
      } finally {
        setRefreshAttempted(true)
      }
    }

    refreshSession()

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "TOKEN_REFRESHED") {
        console.log("Token has been refreshed")
      } else if (event === "SIGNED_OUT") {
        // Only redirect to login if we're not on a public route
        if (!isPublicRoute(pathname)) {
          router.push("/login")
        }
      }
    })

    // Set up a periodic refresh every 10 minutes
    const intervalId = setInterval(refreshSession, 10 * 60 * 1000)

    return () => {
      subscription.unsubscribe()
      clearInterval(intervalId)
    }
  }, [router, pathname])

  return null
}
