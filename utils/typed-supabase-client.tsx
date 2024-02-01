import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase'

export type TypedSupabaseClient = SupabaseClient<Database>