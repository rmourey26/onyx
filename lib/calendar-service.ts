import { google } from 'googleapis';
import { GaxiosError } from 'gaxios'; // Part of googleapis

// Configure the Google OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
  // No redirect URI needed here as we are using a refresh token
);

// Set the credentials using the owner's refresh token
// This allows the server to make API calls on the owner's behalf
oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_OWNER_REFRESH_TOKEN,
});

// Create a Google Calendar API client instance
const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

// Define the owner's calendar ID from environment variables
const OWNER_CALENDAR_ID = process.env.GOOGLE_OWNER_CALENDAR_ID || 'primary';

interface CreateEventOptions {
  summary: string;
  description: string;
  startTime: string; // ISO 8601 format (e.g., '2025-05-20T10:00:00-04:00')
  endTime: string;   // ISO 8601 format
  attendeeEmail: string; // Email of the user scheduling the meeting
  attendeeName?: string; // Optional name of the user
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
  console.log(`Attempting to create event for ${attendeeEmail} from ${startTime} to ${endTime}`);

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
    };

    const response = await calendar.events.insert({
      calendarId: OWNER_CALENDAR_ID,
      requestBody: event,
      // conferenceDataVersion: 1, // Required if adding conferenceData
    });

    console.log('Google Calendar Event created: %s', response.data.htmlLink);
    return { success: true, eventId: response.data.id, link: response.data.htmlLink };

  } catch (error: unknown) {
    console.error('Error creating Google Calendar event:');
    if (error instanceof GaxiosError) {
        console.error('Gaxios Error:', error.response?.status, error.response?.data);
    } else if (error instanceof Error) {
         console.error(error.message);
    } else {
        console.error('An unknown error occurred', error);
    }

    // More specific error handling
    if (error instanceof GaxiosError && error.response?.status === 401) {
       console.error('Authentication error: Check Google credentials (Refresh Token might be expired or invalid).');
       return { success: false, error: 'Authentication error with Google Calendar.' };
    }
     if (error instanceof GaxiosError && error.response?.status === 403) {
        console.error('Permission error: Ensure the Calendar API is enabled and the refresh token has the correct scope (calendar.events).');
       return { success: false, error: 'Permission error with Google Calendar.' };
    }
    if (error instanceof GaxiosError && error.response?.status === 400) {
        console.error('Bad Request: Check event data format (dates, emails etc).', error.response?.data?.error?.errors);
       return { success: false, error: `Invalid meeting data: ${error.response?.data?.error?.message || 'Check input format.'}` };
    }

    return { success: false, error: 'Failed to create Google Calendar event.' };
  }
}