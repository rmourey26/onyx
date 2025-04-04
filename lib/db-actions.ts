"use server"

import { createSupbaseServerClient } from "@/utils/supaone"
import { z } from "zod"

const meetingSchema = z.object({
  id: z.string().optional(),
  user_id: z.string(),
  summary: z.string(),
  description: z.string().optional(),
  start_time: z.string(),
  end_time: z.string(),
  meet_link: z.string(),
})

export type Meeting = z.infer<typeof meetingSchema>

export async function createMeeting(meeting: Meeting) {
  const supabase = createSupbaseServerClient()
  const { data, error } = await (await supabase).from("meetings").insert(meetingSchema.parse(meeting)).select().single()

  if (error) {
    return { error: error.message }
  }

  return { meeting: data }
}

export async function getMeetings(userId: string) {
  const supabase = createSupbaseServerClient()
  const { data, error } = await (await supabase)
    .from("meetings")
    .select("*")
    .eq("user_id", userId)
    .order("start_time", { ascending: true })

  if (error) {
    return { error: error.message }
  }

  return { meetings: data }
}

export async function updateMeeting(meeting: Meeting) {
  const supabase = createSupbaseServerClient()
  const { data, error } = await (await supabase)
    .from("meetings")
    .update(meetingSchema.parse(meeting))
    .eq("id", meeting.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  return { meeting: data }
}

export async function deleteMeeting(id: string) {
  const supabase = createSupbaseServerClient()
  const { error } = await (await supabase).from("meetings").delete().eq("id", id)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

