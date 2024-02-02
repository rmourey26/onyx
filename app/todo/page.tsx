import { createClient } from '@/utils/supa-server-action'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase'
import Todo from './todo'

export default async function Page() {
const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/')
  return <Todo />
}