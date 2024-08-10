import { type Metadata } from 'next'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supa-server-actions'
import { nanoid } from '@/lib/utils'
import { notFound, redirect } from 'next/navigation'

import { getChat } from '@/app/actions'
import { Chat } from '@/components/chat'
import { AI } from '@/lib/chat/actions'

export interface ChatPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({
  params
}: ChatPageProps): Promise<Metadata> {
  const id = nanoid()

  const cookieStore = cookies()
  const supabase = createClient(cookieStore)  


  const { 
data: { user },} = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth')
  }

   

  const chat = await getChat(params.id, user.id)
  return {
    title: chat?.title.toString().slice(0, 50) ?? 'Chat'
  }
}

export default async function ChatPage({ params }: ChatPageProps) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)  


  const { 
data: { user },} = await supabase.auth.getUser()
  if (!user) {
    redirect(`/auth?next=/chat/${params.id}`)
  }

  
  


  if (!user) {
    redirect(`/login?next=/chat/${params.id}`)
  }

  const userId = user.id as string
  const chat = await getChat(params.id, userId)

  if (!chat) {
    redirect('/')
  }

  if (chat?.userId !== user?.id) {
    notFound()
  }

  return (
    <AI initialAIState={{ chatId: chat.id, messages: chat.messages }}>
      <Chat
        id={chat.id}
        user={user}
        initialMessages={chat.messages}
      />
    </AI>
  )
}