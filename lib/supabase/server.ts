import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"
import { cache } from "react"

export const createServerSupabaseClient = cache(async () => {
  const cookieStore = await cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    const errorMessage = "Supabase URL or Anon Key is missing. Check server environment variables."
    console.error(`CRITICAL_ERROR: ${errorMessage}`)
    throw new Error(errorMessage)
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          // Silently ignore cookie set errors in Server Components
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options })
        } catch (error) {
          // Silently ignore cookie remove errors in Server Components
        }
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  })
})

// Export aliases for backward compatibility
export const createServerClientForSSR = createServerSupabaseClient
export const createClient = createServerSupabaseClient
