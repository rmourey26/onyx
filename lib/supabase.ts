import { createBrowserClient } from "@supabase/ssr"

import type { Database } from "./supabase/database.types"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: "pkce", // Use PKCE flow for more secure token handling
    },
  })
}


//export { createServerClientForSSR } from "@/lib/supabase/server"

export type { Database } from "./supabase/database.types"
