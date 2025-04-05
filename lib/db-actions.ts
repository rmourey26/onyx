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

export async function getMeetings(userId: string, meetings: Meeting) {
  const supabase = createSupbaseServerClient()
  
  const { data: {user}, error: userError } = (await supabase).auth.getUser()

  if (userError || !user ) {
    return {error: 'Unauthorized', meetings: []}
  }

  const { data, error } = await (await supabase)
    .from("meetings")
    .select("*", {count: "exact"})
    .eq("user_id", userId)
    .order("start_time", { ascending: true })

  if (error) {
    return { error: error.message }
  }
  if (data && data.length === 0) {
    console.log(`Table '${tableName}' is empty.`);
  } else {
    console.log(`Table '${tableName}' has ${data?.length} rows.`);
    return { meetings: data }
  }
}

export async function checkMeetingCount(meeting: Meeting) {
  const { data, error } = await supabase
    .from(meetings)
    .select("*", { count: "exact" });

  if (error) {
    console.error("Error fetching data:", error);
    return;
  }

  if (data && data.length === 0) {
    console.log(`Table '${tableName}' is empty.`);
  } else {
    console.log(`Table '${tableName}' has ${data?.length} rows.`);
  }
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

