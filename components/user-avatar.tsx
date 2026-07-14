"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { getSupabaseClient } from "@/lib/supabase/singleton"
import { getUserProfileQuery } from "@/queries/get-user-profile"
import type { UserProfile } from "@/lib/schemas/profile"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserIcon } from "lucide-react"

interface UserAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  userId: string
}

export function UserAvatar({ userId, className, ...props }: UserAvatarProps) {
  const supabase = getSupabaseClient()

  const { data: profile, isLoading, error } = useQuery<UserProfile | null>(getUserProfileQuery(supabase, userId))

  const displayName = React.useMemo(() => {
    if (!profile) return "User"
    return profile.full_name || profile.email || "User"
  }, [profile])

  if (error) {
    console.error("Error in UserAvatar:", error.message)
    return (
      <Avatar className={cn("bg-destructive/20", className)} {...props}>
        <AvatarFallback>
          <span className="sr-only">Error loading profile</span>
          <UserIcon className="h-5 w-5 text-destructive" />
        </AvatarFallback>
      </Avatar>
    )
  }

  if (isLoading) {
    return (
      <Avatar className={cn("bg-muted", className)} {...props}>
        <AvatarFallback>
          <div className="h-5 w-5 animate-pulse rounded-full bg-muted-foreground/20" />
        </AvatarFallback>
      </Avatar>
    )
  }

  return (
    <Avatar className={cn("bg-muted", className)} {...props}>
      {profile?.avatar_url ? (
        <AvatarImage src={profile.avatar_url || "/placeholder.svg"} alt={displayName} />
      ) : (
        <AvatarFallback>
          <span className="sr-only">{displayName}</span>
          <UserIcon className="h-5 w-5 text-muted-foreground" />
        </AvatarFallback>
      )}
    </Avatar>
  )
}
