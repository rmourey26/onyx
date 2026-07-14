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

    browserClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: "pkce",
      },
    })
  }

  return browserClient
}

// Legacy compatibility - will use singleton
export const createClientSupabaseClient = getSupabaseClient
export const createBrowserSupabaseClient = getSupabaseClient

// Re-exporting from client.ts to maintain backward compatibility from "./client"
