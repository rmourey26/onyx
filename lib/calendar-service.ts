// Google Calendar API disabled for v0 preview mode
//mport { google } from "googleapis"
//import { GaxiosError } from "gaxios"

// Mock Google Calendar API types for v0 preview mode
type GaxiosErrorType = Error & { response?: { status?: number; data?: any } }

// Define the owner's calendar ID from environment variables
const OWNER_CALENDAR_ID = process.env.GOOGLE_OWNER_CALENDAR_ID || "primary"
const calendar = google.calendar({ version: "v3", auth: process.env.GOOGLE_AUTH_TOKEN });

interface CreateEventOptions {
  summary: string
  description: string
  startTime: string // ISO 8601 format (e.g., '2025-05-20T10:00:00-04:00')
  endTime: string // ISO 8601 format
  attendeeEmail: string // Email of the user scheduling the meeting
  attendeeName?: string // Optional name of the user
}

/**
 * Creates an event on the app owner's Google Calendar.
 */
export async function createGoogleCalendarEvent({
  summary,
  description,
  startTime,
  endTime,
  attendeeEmail,
  attendeeName,
}: CreateEventOptions) {
  console.log(`Attempting to create event for ${attendeeEmail} from ${startTime} to ${endTime}`)

  if (process.env.PREVIEW_MODE === "v0") {
    console.log(`[v0] Mock: Creating event for ${attendeeEmail} from ${startTime} to ${endTime}`)
    console.log(`[v0] Event details: ${summary}`)

    // Return a mock success response for preview mode
    return {
      success: true,
      eventId: `mock-event-${Date.now()}`,
      link: `https://calendar.google.com/calendar/event?eid=mock-${Date.now()}`,
    }
  }

  try {
    const event = {
      summary: summary,
      description: description,
      start: {
        dateTime: startTime,
        // Optional: Specify the time zone, otherwise it uses calendar's default
        // timeZone: 'America/New_York',
      },
      end: {
        dateTime: endTime,
        // timeZone: 'America/New_York',
      },
      // Add the user who scheduled the meeting as an attendee
      attendees: [
        { email: attendeeEmail, displayName: attendeeName },
        // Optionally add the owner explicitly if needed, though they are the organizer
        // { email: OWNER_CALENDAR_ID } // Only if OWNER_CALENDAR_ID is an email
      ],
      // Send notifications to attendees
      sendNotifications: true,
      // Optional: Add conference data (e.g., Google Meet link)
      // conferenceData: {
      //   createRequest: {
      //     requestId: `meet-${Date.now()}`, // Unique request ID
      //     conferenceSolutionKey: { type: 'hangoutsMeet' },
      //   },
      // },
    }

    const response = await calendar.events.insert({
      calendarId: OWNER_CALENDAR_ID,
      requestBody: event,
      // conferenceDataVersion: 1, // Required if adding conferenceData
    })

    console.log("Google Calendar Event created: %s", response.data.htmlLink)
    return { success: true, eventId: response.data.id, link: response.data.htmlLink }
  } catch (error: unknown) {
    console.error("Error creating Google Calendar event:")
    if (error instanceof GaxiosErrorType) {
      console.error("Gaxios Error:", error.response?.status, error.response?.data)
    } else if (error instanceof Error) {
      console.error(error.message)
    } else {
      console.error("An unknown error occurred", error)
    }

    // More specific error handling
    if (error instanceof GaxiosErrorType && error.response?.status === 401) {
      console.error("Authentication error: Check Google credentials (Refresh Token might be expired or invalid).")
      return { success: false, error: "Authentication error with Google Calendar." }
    }
    if (error instanceof GaxiosErrorType && error.response?.status === 403) {
      console.error(
        "Permission error: Ensure the Calendar API is enabled and the refresh token has the correct scope (calendar.events).",
      )
      return { success: false, error: "Permission error with Google Calendar." }
    }
    if (error instanceof GaxiosErrorType && error.response?.status === 400) {
      console.error("Bad Request: Check event data format (dates, emails etc).", error.response?.data?.error?.errors)
      return {
        success: false,
        error: `Invalid meeting data: ${error.response?.data?.error?.message || "Check input format."}`,
      }
    }

    return { success: false, error: "Failed to create Google Calendar event." }
  }
}
