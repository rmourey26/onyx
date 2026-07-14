"use client"

import { useState, useEffect } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SignOutButton } from "./sign-out-button"
import { UserIcon } from "lucide-react"
import Link from "next/link"
import type { User } from "@supabase/supabase-js"
import { getSupabaseClient } from "@/lib/supabase/singleton"

interface UserMenuClientProps {
  user: User
}

interface UserProfile {
  full_name?: string | null
  avatar_url?: string | null
}

export function UserMenuClient({ user }: UserMenuClientProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProfile() {
      try {
        const supabase = getSupabaseClient()
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", user.id)
          .single()

        if (error) {
          console.warn("Error fetching profile:", error.message)
        } else {
          setProfile(data)
        }
      } catch (error) {
        console.error("Error in fetchProfile:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user.id])

  // Fallback display values
  const displayName = profile?.full_name || user.user_metadata?.full_name || user.email || "User"
  const displayEmail = user.email || ""
  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8 bg-muted">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={displayName} />
            ) : (
              <AvatarFallback>
                <span className="sr-only">{displayName}</span>
                <UserIcon className="h-4 w-4 text-muted-foreground" />
              </AvatarFallback>
            )}
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{loading ? "Loading..." : displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">{displayEmail}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard">Dashboard</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <SignOutButton />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
