'use client'
import { buttonVariants } from "@/components/ui/button" 
import { cn } from '@/lib/utils'   
import { useCallback, useEffect, useState } from 'react'
import useSupabaseBrowser from '@/utils/supabase-browser'
import { type User } from '@supabase/supabase-js'
import Avatar from './avatar'
import { Input } from '@/components/ui/input'

export default function AccountForm({ user }: { user: User | null }) {
  const supabase = useSupabaseBrowser()
  const [loading, setLoading] = useState(true)
  const [fullname, setFullname] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [website, setWebsite] = useState<string | null>(null)
  const [avatar_url, setAvatarUrl] = useState<string | null>(null)
const [email, setEmail] = useState<string | null>(null)
const [waddress, setWaddress] = useState<string | null>(null)
const languages = [
  { label: "English", value: "en" },
  { label: "French", value: "fr" },
  { label: "German", value: "de" },
  { label: "Spanish", value: "es" },
  { label: "Portuguese", value: "pt" },
  { label: "Russian", value: "ru" },
  { label: "Japanese", value: "ja" },
  { label: "Korean", value: "ko" },
  { label: "Chinese", value: "zh" },
] as const

  const getProfile = useCallback(async () => {
    try {
      setLoading(true)

      const { data, error, status } = await supabase
        .from('profiles')
        .select(`full_name, username, website, avatar_url, email`)
        .eq('id', user?.id as string)
        .single()

      if (error && status !== 406) {
        console.log(error)
        throw error
      }

      if (data) {
        setFullname(data.full_name)
        setUsername(data.username)
        setWebsite(data.website)
        setAvatarUrl(data.avatar_url)
        setEmail(data.email)
      }
    } catch (error) {
      alert('Error loading user data!')
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    getProfile()
  }, [user, getProfile])

  async function updateProfile({
    username,
    website,
    avatar_url,
    email,
  }: {
    username: string | null
    fullname: string | null
    website: string | null
    avatar_url: string | null
    email: string | null

  }) {
    try {
      setLoading(true)

      const { error } = await supabase.from('profiles').upsert({
        id: user?.id as string,
        full_name: fullname,
        username,
        website,
        avatar_url,
        email,
        updated_at: new Date().toISOString(),
      })
      if (error) throw error
      alert('Account updated!')
    } catch (error) {
      alert('Error updating the data!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="                                   w-full px-2 py-8 space-y-8">
<Avatar

      uid={user?.id ?? null}
      url={avatar_url}
      size={144}
      onUpload={(url) => {
        setAvatarUrl(url)
        updateProfile({ fullname, username, website, email, avatar_url: url })
      }}
    />
 <div className="flex flex-col">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="email">Email</label>
        <input className={cn("flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50")} id="email" type="text" value={user?.email} disabled />
      </div>
      <div className="flex flex-col">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="fullName">Full Name</label>
        <input
           className={cn("flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50")}
          id="fullName"
          type="text"
          value={fullname || ''}
          onChange={(e) => setFullname(e.target.value)}
        />
      </div>
      <div className="flex flex-col">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="username">Username</label>
        <input className={cn("flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50")}
          id="username"
          type="text"
          value={username || ''}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div className="flex flex-col">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="website">Website</label>
        <input className={cn("flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50")}
          id="website"
          type="url"
          value={website || ''}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>


<div className="w-full grid grid-cols-1 justify-evenly">    




        <button
          className={buttonVariants({ variant: "outline" })}
          onClick={() => updateProfile({ fullname, username, website, email, avatar_url })}
          disabled={loading}
        >
          {loading ? 'Loading ...' : 'Update Account'}
        </button>
        </div>

      <div className="flex flex-col w-full mb-2">
        <form className="space-y-8 items-center" action="/auth/signout" method="post">
          <button           className={buttonVariants({ variant: "outline" })} type="submit">
            Sign out
          </button>
        </form>
      </div>
    </div>
  )
}