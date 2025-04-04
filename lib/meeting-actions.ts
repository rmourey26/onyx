"use server"

import { cookies } from "next/headers"
import { decrypt } from "./encryption"
import { createMeetingWithGoogleMeet } from "./calendar-service"
import { createMeeting } from "./db-actions"
import { z } from "zod"

const meetingFormSchema = z.object({
  summary: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
  startTime: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid start time"),
  endTime: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid end time"),
  attendees: z.array(z.string().email("Invalid email")).min(1, "At least one attendee is required"),
})

export type MeetingFormData = z.infer<typeof meetingFormSchema>

export async function scheduleMeeting(userId: string, formData: MeetingFormData) {
  // Validate form data
  const validatedData = meetingFormSchema.safeParse(formData)

  if (!validatedData.success) {
    return {
      success: false,
      error: validatedData.error.errors[0]?.message || "Invalid form data",
    }
  }

  const { summary, description, date, startTime, endTime, attendees } = validatedData.data

  // Parse dates
  const startDateTime = new Date(startTime)
  const endDateTime = new Date(endTime)

  // Check if end time is after start time
  if (endDateTime <= startDateTime) {
    return {
      success: false,
      error: "End time must be after start time",
    }
  }

  // Get Google tokens from cookies
  const encryptedTokens = cookies().get("google_tokens")?.value

  if (!encryptedTokens) {
    return {
      success: false,
      error: "Not authenticated with Google",
    }
  }

  try {
    // Decrypt tokens
    const tokens = JSON.parse(await decrypt(encryptedTokens))

    // Create meeting with Google Meet
    const googleMeetResult = await createMeetingWithGoogleMeet(
      {
        summary,
        description: description || "",
        startTime: startDateTime,
        endTime: endDateTime,
        attendees,
      },
      tokens,
    )

    if (!googleMeetResult.success) {
      return {
        success: false,
        error: googleMeetResult.error || "Failed to create Google Meet",
      }
    }

    // Save meeting to database
    const dbResult = await createMeeting({
      user_id: userId,
      summary,
      description: description || "",
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      meet_link: googleMeetResult.meetLink || "",
    })

    if (dbResult.error) {
      return {
        success: false,
        error: dbResult.error,
      }
    }

    return {
      success: true,
      meetLink: googleMeetResult.meetLink,
    }
  } catch (error) {
    console.error("Error scheduling meeting:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

