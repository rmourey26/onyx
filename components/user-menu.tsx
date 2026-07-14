"use client"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js" // Supabase auth user type
import { getSupabaseClient } from "@/lib/supabase/singleton"
import { UserAvatar } from "@/components/user-avatar" // UserAvatar is updated
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface UserMenuProps {
  user: User // This is the Supabase Auth User object
}

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter()
  const supabase = getSupabaseClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh() // Refreshes server components and re-runs auth checks
  }

  const handleProfileClick = () => {
    router.push("/profile")
  }

  const handleDashboardClick = () => {
    router.push("/dashboard")
  }

  // The UserAvatar component now handles profile fetching and Zod validation.
  // The UserMenu component itself doesn't directly fetch profile data for the label,
  // but relies on the User object for email and UserAvatar for the image.

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        {/* UserAvatar will use the userId from the auth user to fetch and validate profile */}
        <UserAvatar userId={user.id} className="h-9 w-9 border-2 border-green-500/50" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            {/* Displaying user's email from the auth object as a fallback or primary display */}
            <p className="text-sm font-medium leading-none">{user.email || "My Account"}</p>
            {/* If you want to display full_name here, you'd need to fetch profile data */}
            {/* similar to UserAvatar or pass it down if fetched by a parent. */}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleProfileClick} className="cursor-pointer">
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDashboardClick} className="cursor-pointer">
          Dashboard
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-red-500 cursor-pointer">
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
