"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"
import { UserProfileSchema, type UserProfile } from "@/lib/schemas/profile"
import { z } from "zod"
import { cache } from "react"

// Helper to create a fully compliant default UserProfile object
const createDefaultProfile = (userId: string, authUser?: any): UserProfile => {
  const baseProfile = {
    id: userId,
    user_id: userId,
    full_name: authUser?.user_metadata?.full_name || null,
    username: authUser?.user_metadata?.username || null,
    email: authUser?.email || null,
    company: authUser?.user_metadata?.company || null,
    job_title: authUser?.user_metadata?.job_title || null,
    website: authUser?.user_metadata?.website || null,
    linkedin_url: authUser?.user_metadata?.linkedin_url || null,
    avatar_url: authUser?.user_metadata?.avatar_url || null,
    company_logo_url: authUser?.user_metadata?.company_logo_url || null,
    waddress: authUser?.user_metadata?.waddress || null,
    xhandle: authUser?.user_metadata?.xhandle || null,
    public_id: null,
    public_access: true,
    card_style: {
      backgroundColor: "#ffffff",
      textColor: "#333333",
      primaryColor: "#3b82f6",
    },
    created_at: null,
    updated_at: null,
  }
  const schemaKeys = Object.keys(UserProfileSchema.shape)
  const finalProfile: any = { ...baseProfile }
  schemaKeys.forEach((key) => {
    if (!(key in finalProfile)) {
      finalProfile[key] = null
    }
  })
  return finalProfile as UserProfile
}

export const getCachedProfile = cache(async (userId: string): Promise<UserProfile> => {
  return getProfile(userId)
})

export async function getProfile(userId: string): Promise<UserProfile> {
  const supabase = await createServerSupabaseClient()

  try {
    const { data: authUserResponse } = await supabase.auth.getUser()
    const authUser = authUserResponse?.user

    let data: any = null
    let error: any = null

    try {
      const response = await supabase
        .from("profiles")
        .select(
          `
          id, user_id, full_name, username, email, company, job_title,
          website, linkedin_url, avatar_url, company_logo_url, waddress, xhandle,
          public_id, public_access, card_style, created_at, updated_at
        `,
        )
        .eq("id", userId)
        .maybeSingle()

      data = response.data
      error = response.error
    } catch (networkOrParseError: any) {
      console.error(
        `Supabase client network/parse error in getProfile for user ${userId}:`,
        networkOrParseError.message,
      )
      error = { message: "Network or parsing error from Supabase." }
    }

    if (error) {
      console.warn(`Error fetching profile from DB for user ${userId} (falling back to default):`, error.message)
      return createDefaultProfile(userId, authUser)
    }

    if (data) {
      const resultProfile: any = {}
      const schemaKeys = Object.keys(UserProfileSchema.shape)
      schemaKeys.forEach((key) => {
        resultProfile[key] = data[key] !== undefined ? data[key] : null
      })
      resultProfile.card_style = data.card_style || {
        backgroundColor: "#ffffff",
        textColor: "#333333",
        primaryColor: "#3b82f6",
      }
      resultProfile.user_id = data.user_id || userId
      return resultProfile as UserProfile
    }

    return createDefaultProfile(userId, authUser)
  } catch (outerError: any) {
    console.error(`Outer catch error in getProfile for user ${userId}:`, outerError.message)
    return createDefaultProfile(userId)
  }
}

export async function updateProfile(profileData: any) {
  const supabase = await createServerSupabaseClient()
  const userId = profileData.id

  try {
    const dataToUpdate = {
      full_name: profileData.full_name || null,
      username: profileData.username || profileData.full_name?.toLowerCase().replace(/\s+/g, "_") || null,
      email: profileData.email || null,
      company: profileData.company || null,
      job_title: profileData.job_title || null,
      website:
        (profileData.website && !profileData.website.startsWith("http")
          ? `https://${profileData.website}`
          : profileData.website) || null,
      linkedin_url:
        (profileData.linkedin_url && !profileData.linkedin_url.startsWith("http")
          ? `https://${profileData.linkedin_url}`
          : profileData.linkedin_url) || null,
      avatar_url: profileData.avatar_url || null,
      company_logo_url: profileData.company_logo_url || null,
      waddress: profileData.waddress || null,
      xhandle: profileData.xhandle || null,
      updated_at: new Date().toISOString(),
      public_access: profileData.public_access !== undefined ? profileData.public_access : true,
    }

    const { data: existingProfile, error: checkError } = await supabase
      .from("profiles")
      .select("id, public_id, card_style, user_id")
      .eq("id", userId)
      .maybeSingle()

    if (checkError) throw checkError

    if (!existingProfile) {
      const public_id = uuidv4()
      const newProfile = {
        id: userId,
        user_id: userId,
        ...dataToUpdate,
        public_id,
        created_at: new Date().toISOString(),
        card_style: profileData.card_style || {
          backgroundColor: "#ffffff",
          textColor: "#333333",
          primaryColor: "#3b82f6",
        },
      }
      const { error: insertError } = await supabase.from("profiles").insert(newProfile)
      if (insertError) throw insertError
    } else {
      const { error: updateError } = await supabase.from("profiles").update(dataToUpdate).eq("id", userId)
      if (updateError) throw updateError
    }

    await supabase.auth.updateUser({
      data: {
        full_name: dataToUpdate.full_name,
        username: dataToUpdate.username,
        company: dataToUpdate.company,
        job_title: dataToUpdate.job_title,
        website: dataToUpdate.website,
        linkedin_url: dataToUpdate.linkedin_url,
        avatar_url: dataToUpdate.avatar_url,
        company_logo_url: dataToUpdate.company_logo_url,
        waddress: dataToUpdate.waddress,
        xhandle: dataToUpdate.xhandle,
      },
    })

    revalidatePath("/profile")
    revalidatePath("/dashboard")
    const updatedFullProfile = await getProfile(userId)
    return { success: true, data: UserProfileSchema.parse(updatedFullProfile) }
  } catch (error: any) {
    console.error("Error in updateProfile:", error.message)
    if (error instanceof z.ZodError) {
      return { success: false, error: "Profile data validation failed during update.", details: error.format() }
    }
    return { success: false, error: error.message || "An unexpected error occurred while updating your profile" }
  }
}

export async function updateProfileStyle(profileId: string, styleData: any) {
  const supabase = await createServerSupabaseClient()
  try {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("card_style")
      .eq("id", profileId)
      .single()

    if (profileError) throw profileError

    const defaultCardStyle = { backgroundColor: "#ffffff", textColor: "#333333", primaryColor: "#3b82f6" }
    const currentStyle = profile.card_style || {}
    const updatedStyle = {
      backgroundColor: styleData.backgroundColor || currentStyle.backgroundColor || defaultCardStyle.backgroundColor,
      textColor: styleData.textColor || currentStyle.textColor || defaultCardStyle.textColor,
      primaryColor: styleData.primaryColor || currentStyle.primaryColor || defaultCardStyle.primaryColor,
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ card_style: updatedStyle, updated_at: new Date().toISOString() })
      .eq("id", profileId)

    if (updateError) throw updateError

    revalidatePath("/profile")
    revalidatePath("/dashboard")
    const updatedFullProfile = await getProfile(profileId)
    return { success: true, data: UserProfileSchema.parse(updatedFullProfile) }
  } catch (error: any) {
    console.error("Error in updateProfileStyle:", error.message)
    if (error instanceof z.ZodError) {
      return { success: false, error: "Profile style data validation failed.", details: error.format() }
    }
    return { success: false, error: error.message || "An unexpected error occurred while updating profile style" }
  }
}
