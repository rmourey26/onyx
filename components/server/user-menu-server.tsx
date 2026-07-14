import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserAvatarServer } from "./user-avatar-server" // Will use the updated UserAvatarServer
import { SignOutButton } from "../client/sign-out-button"
import { getCachedProfile } from "@/app/actions/profile"
import { UserProfileSchema, type UserProfile } from "@/lib/schemas/profile" // For type hint
import Link from "next/link"
import type { User } from "@supabase/supabase-js"
import { ZodError } from "zod"

interface UserMenuServerProps {
  user: User // Assuming user object is passed from a higher component (e.g., SiteHeader)
}

export async function UserMenuServer({ user }: UserMenuServerProps) {
  let profileForDisplay: Partial<UserProfile> & { full_name?: string | null } = {
    // Basic fallback using auth user data
    full_name: user.user_metadata?.full_name || user.email || "User",
  }

  try {
    const rawProfileData = await getCachedProfile(user.id)

    try {
      const parsedProfile = await UserProfileSchema.parse(rawProfileData)
      profileForDisplay = {
        full_name: parsedProfile.full_name || profileForDisplay.full_name,
      }
    } catch (zodError) {
      if (zodError instanceof ZodError) {
        console.warn(
          `Zod validation failed for profile in UserMenuServer (using raw/fallback): ${user.id}`,
          zodError.format(),
        )
      }
      if (rawProfileData) {
        profileForDisplay = {
          full_name: rawProfileData.full_name || profileForDisplay.full_name,
        }
      }
    }
  } catch (error) {
    console.error(
      `Error fetching profile in UserMenuServer for user ${user.id} (using basic fallback):`,
      error instanceof Error ? error.message : String(error),
    )
    // Stick to the initial fallback
  }

  const displayName = profileForDisplay.full_name || "User"
  const displayEmail = user.email || ""

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative h-8 w-8 rounded-full">
          {/* UserAvatarServer now handles its own data fetching and fallbacks */}
          <UserAvatarServer user={user} className="h-8 w-8" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
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
