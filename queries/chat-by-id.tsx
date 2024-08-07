import { TypedSupabaseClient } from '@/utils/typed-supabase-client'

export function getChatById(client: TypedSupabaseClient, chatId: number) {
  return client
    .from('chat')
    .select(
      `
      id,
      title
    `
    )
    .eq('id', chatId)
    .throwOnError()
    .single()
}