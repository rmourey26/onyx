import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getCachedProfile } from "@/app/actions/profile" // The existing server action
import { UserProfileSchema, type UserProfile } from "@/lib/schemas/profile" // For type hint and potential parsing
import { cn } from "@/lib/utils"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { UserIcon } from "lucide-react"
import { ZodError } from "zod"

interface UserAvatarServerProps {
  // We might not need to pass the full user object if we fetch it inside,
  // but for now, let's assume it's passed if available from a higher-level component.
  // If not, this component would need to be async and fetch user itself.
  // For simplicity and reusability, let's assume `user` is passed.
  user: SupabaseUser
  className?: string
}

// This component will remain async as it calls an async action getProfile
export async function UserAvatarServer({ user, className }: UserAvatarServerProps) {
  let profileForDisplay: Partial<UserProfile> & { avatar_url?: string | null; full_name?: string | null } = {
    // Basic fallback using auth user data
    full_name: user.user_metadata?.full_name || user.email || "User",
    avatar_url: user.user_metadata?.avatar_url || null,
  }

  try {
    const rawProfileData = await getCachedProfile(user.id)

    // Attempt to parse with Zod for type safety if data is complete
    // but be ready to fallback if parsing fails or data is partial
    try {
      const parsedProfile = UserProfileSchema.parse(rawProfileData)
      profileForDisplay = {
        full_name: parsedProfile.full_name || profileForDisplay.full_name,
        avatar_url: parsedProfile.avatar_url || profileForDisplay.avatar_url,
      }
    } catch (zodError) {
      if (zodError instanceof ZodError) {
        console.warn(
          `Zod validation failed for profile in UserAvatarServer (using raw/fallback): ${user.id}`,
          zodError.format(),
        )
      }
      // If Zod parsing fails, use raw data if available, or stick to initial fallback
      if (rawProfileData) {
        profileForDisplay = {
          full_name: rawProfileData.full_name || profileForDisplay.full_name,
          avatar_url: rawProfileData.avatar_url || profileForDisplay.avatar_url,
        }
      }
    }
  } catch (error) {
    console.error(
      `Error fetching profile in UserAvatarServer for user ${user.id} (using basic fallback):`,
      error instanceof Error ? error.message : String(error),
    )
    // Stick to the initial fallback based on user.user_metadata
  }

  const displayName = profileForDisplay.full_name || "User"

  return (
    <Avatar className={cn("bg-muted", className)}>
      {profileForDisplay.avatar_url ? (
        <AvatarImage src={profileForDisplay.avatar_url || "/placeholder.svg"} alt={displayName} />
      ) : (
        <AvatarFallback>
          <span className="sr-only">{displayName}</span>
          <UserIcon className="h-5 w-5 text-muted-foreground" />
        </AvatarFallback>
      )}
    </Avatar>
  )
}
