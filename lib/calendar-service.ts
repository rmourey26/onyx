"use server"

import { type calendar_v3, google } from "googleapis"
import { oauth2Client, setCredentials } from "./google-auth"

export interface MeetingDetails {
  summary: string
  description: string
  startTime: Date
  endTime: Date
  attendees: string[]
  timeZone?: string
}

export async function createMeetingWithGoogleMeet(details: MeetingDetails, tokens?: any) {
  const { summary, description, startTime, endTime, attendees, timeZone = "America/New_York" } = details

  // If tokens are provided, set them
  if (tokens) {
    await setCredentials(tokens)
  }

  // Initialize the Calendar API client
  const calendar = google.calendar({ version: "v3", auth: oauth2Client })

  try {
    const event: calendar_v3.Schema$Event = {
      summary,
      description,
      start: {
        dateTime: startTime.toISOString(),
        timeZone,
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone,
      },
      attendees: attendees.map((email) => ({ email })),
      conferenceData: {
        createRequest: {
          requestId: `meet-${Date.now()}`,
          conferenceSolutionKey: {
            type: "hangoutsMeet",
          },
        },
      },
    }

    const response = await calendar.events.insert({
      calendarId: "primary",
      conferenceDataVersion: 1,
      requestBody: event,
      sendUpdates: "all",
    })

    return {
      success: true,
      eventId: response.data.id,
      meetLink: response.data.hangoutLink,
      htmlLink: response.data.htmlLink,
    }
  } catch (error) {
    console.error("Error creating meeting:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function listUpcomingEvents(tokens: any, maxResults = 10) {
  // Set the credentials
  await setCredentials(tokens)

  // Initialize the Calendar API client
  const calendar = google.calendar({ version: "v3", auth: oauth2Client })

  try {
    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      maxResults,
      singleEvents: true,
      orderBy: "startTime",
    })

    return {
      success: true,
      events: response.data.items,
    }
  } catch (error) {
    console.error("Error listing events:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

