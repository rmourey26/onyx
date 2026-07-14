import type { SupabaseClient } from "@supabase/supabase-js"

export const getBusinessCardById = async (supabase: SupabaseClient, id: string) => {
  const { data, error } = await supabase.from("business_cards").select("*, profiles(*)").eq("id", id).single()

  if (error) {
    console.error("Error fetching business card:", error)
    throw new Error("Failed to fetch business card")
  }

  if (!data) {
    throw new Error("Business card not found")
  }

  return data
}
