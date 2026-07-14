import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "./database.types"

let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null

export function getSupabaseClient() {
  if (typeof window === "undefined") {
    throw new Error("getSupabaseClient can only be called on the client side")
  }

  if (!browserClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    console.log("[v0] Creating singleton Supabase client")

    browserClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: "pkce",
      },
      global: {
        fetch: (url, options = {}) => {
          // Use the existing signal if provided, otherwise create new abort controller
          const existingSignal = options?.signal
          
          if (existingSignal) {
            // If a signal is already provided, just use it
            return fetch(url, options)
          }

          // Only add timeout for requests without a signal
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

          return fetch(url, {
            ...options,
            signal: controller.signal,
          })
            .then((response) => {
              clearTimeout(timeoutId)
              return response
            })
            .catch((error) => {
              clearTimeout(timeoutId)
              if (error.name === "AbortError") {
                console.warn("[v0] Supabase request timeout, using cached data")
              }
              throw error
            })
        },
      },
    })
  }

  return browserClient
}

// Legacy compatibility exports
export const createClientSupabaseClient = getSupabaseClient
export const createBrowserSupabaseClient = getSupabaseClient
