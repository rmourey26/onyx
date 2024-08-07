import { TypedSupabaseClient } from '@/utils/typed-supabase-client'

export function getMessages(client: TypedSupabaseClient, chatId: number) {
    return client
      .from('chat')
      .select(
        `
        id,
        messages
      `
      )
      .eq('id', chatId)
      .throwOnError()
      .single()
  }