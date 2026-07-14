import type { SupabaseClient } from "@supabase/supabase-js"
import { UserProfileSchema, type UserProfile } from "@/lib/schemas/profile"
import { ZodError } from "zod"

export const getUserProfileQuery = (client: SupabaseClient, userId: string) => ({
  queryKey: ["userProfile", userId],
  queryFn: async (): Promise<UserProfile | null> => {
    if (!userId) return null

    const { data: rawProfile, error } = await client
      .from("profiles")
      .select(
        `
        id,
        user_id,
        full_name,
        avatar_url,
        company,
        job_title,
        email,
        website,
        linkedin_url,
        company_logo_url,
        xhandle,
        waddress,
        public_id,
        card_style,
        created_at,
        updated_at
      `,
      )
      .eq("user_id", userId)
      .single()

    if (error) {
      console.error("Error fetching user profile (client query):", error.message)
      throw new Error(`Failed to fetch profile: ${error.message}`)
    }

    if (!rawProfile) {
      return null
    }

    try {
      return UserProfileSchema.parse(rawProfile)
    } catch (validationError) {
      if (validationError instanceof ZodError) {
        console.error("Profile data validation failed (client query):", validationError.format())
        throw new Error(`Profile data invalid: ${validationError.message}`)
      }
      console.error("Unknown error during profile parsing (client query):", validationError)
      throw new Error("Failed to parse profile data.")
    }
  },
  enabled: !!userId,
  retry: 1,
  staleTime: 5 * 60 * 1000,
  gcTime: 10 * 60 * 1000,
})
