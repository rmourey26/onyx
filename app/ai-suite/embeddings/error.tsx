"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { createClientSupabaseClient } from "@/lib/supabase/client"

export default function EmbeddingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Embeddings page error:", error)

    // Check if it's a JWT error
    if (error.message && error.message.includes("JWT")) {
      // Try to refresh the session
      const refreshSession = async () => {
        const supabase = createClientSupabaseClient()
        try {
          const { error: refreshError } = await supabase.auth.refreshSession()
          if (refreshError) {
            console.error("Failed to refresh session:", refreshError)
          }
        } catch (e) {
          console.error("Error during session refresh:", e)
        }
      }

      refreshSession()
    }
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <p className="mb-6 text-muted-foreground">{error.message || "An unexpected error occurred"}</p>
      <div className="flex gap-4">
        <Button onClick={() => reset()}>Try again</Button>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          Go to Dashboard
        </Button>
        <Button
          variant="destructive"
          onClick={async () => {
            const supabase = createClientSupabaseClient()
            await supabase.auth.signOut()
            router.push("/login")
          }}
        >
          Sign Out and Login Again
        </Button>
      </div>
    </div>
  )
}
