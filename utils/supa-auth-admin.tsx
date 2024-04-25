import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase'

const supabase = createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Access auth admin api
export const adminAuthClient = supabase.auth.admin