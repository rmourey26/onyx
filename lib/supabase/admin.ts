import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/types/database"

// Note: this is a private, server-side only client.
// Do not use this on the client-side.
export const createAdminSupabaseClient = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase URL or Service Role Key is not set.")
  }

  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export const createAdminClient = createAdminSupabaseClient
