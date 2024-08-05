import { nanoid } from '@/lib/utils'
import { Separator } from "@/components/ui/separator"
import AccountForm from "./supa-account-form"
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supa-server-actions'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Chat } from '@/components/chat'
import { AI } from '@/lib/chat/actions'

export default async function ChatPage() {
  const id = nanoid()

  const cookieStore = cookies()
  const supabase = createClient(cookieStore)  


  const { 
data: { user },} = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth')
  }

  return (
<AI initialAIState={{ chatId: id, messages: [] }}>
    <div className="mt-10 px-2 lg:p-8">
    <div className="mx-auto px-2 flex w-full flex-col justify-center space-y-6">
<div className="flex flex-col space-y-2 text-justified-center items-justified-center">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Account Profile</h1>
        <p className="text-base text-justify ">
          AI coming soon...</p>

        <Link
          href="/playground"
          target="_blank"
          rel="noreferrer"
          className="text-1xl font-bold tracking-tighter sm:text-3xl"
        >
         Check out the OpenAI Playground!
        </Link>
       </div>
      <Separator />
      <Chat id={id} user={user}/>
    </div>
   </div>
</AI>
  )
}
