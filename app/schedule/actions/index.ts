// app/schedule/actions
'use server';

import { createSupbaseServerClient } from '@/lib/supaone';
import { cookies } from 'next/headers';
import { google } from 'googleapis';
import { scheduleMeetingSchema, ScheduleMeetingData } from '@/lib//schemas/schemas';

// --- Google API ---
// This is highly simplified and requires some added logic to obtain session info. Coming soon. 

async function getGoogleAuthClient(userId: string) {
    // 1. Fetch user's stored refresh token from your DB (e.g., a separate 'user_credentials' table)
    // const refreshToken = await fetchRefreshTokenFromDb(userId);
    const refreshToken = "STORED_REFRESH_TOKEN"; // Placeholder

    if (!refreshToken) {
        throw new Error("User not authenticated with Google or refresh token missing.");
    }

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({ refresh_token: refreshToken });

    // Optional: Refresh access token if needed (googleapis library might handle this)
    // const { token } = await oauth2Client.getAccessToken();
    // oauth2Client.setCredentials({ access_token: token });

    return oauth2Client;
}

// --- Server Action ---
export async function createMeeting(formData: ScheduleMeetingData): Promise<{ success: boolean; meetLink?: string; error?: string }> {
    const cookieStore = cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                // Set/Remove needed if the action modifies auth state
            },
        }
    );

    // 1. Get User Session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) {
        console.error("Authentication error:", sessionError);
        return { success: false, error: 'User not authenticated.' };
    }
    const userId = session.user.id;

    // 2. Validate Form Data
    const validationResult = scheduleMeetingSchema.safeParse(formData);
    if (!validationResult.success) {
        console.error("Validation errors:", validationResult.error.flatten().fieldErrors);
        // Return specific validation errors if needed
        return { success: false, error: 'Invalid form data.' };
    }
    const { summary, description, startTime, endTime } = validationResult.data;


    try {
        // 3. Authenticate with Google
        const auth = await getGoogleAuthClient(userId); // Needs proper implementation
        const calendar = google.calendar({ version: 'v3', auth });

        // 4. Create Google Calendar Event with Meet Link
        const event = {
            summary: summary,
            description: description,
            start: {
                dateTime: startTime.toISOString(),
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Use user's timezone
            },
            end: {
                dateTime: endTime.toISOString(),
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            // Crucial part for Google Meet link generation
            conferenceData: {
                createRequest: {
                    requestId: `meet-${userId}-${Date.now()}`, // Unique ID for the request
                    conferenceSolutionKey: {
                        type: 'hangoutsMeet' // Use 'hangoutsMeet' for Google Meet
                    }
                }
            },
            // Optional: Add attendees, reminders etc.
            // attendees: [{ email: 'user@example.com' }],
        };

        const createdEvent = await calendar.events.insert({
            calendarId: 'primary', // Use the user's primary calendar
            requestBody: event,
            conferenceDataVersion: 1, // Required when creating conference data
        });

        const meetLink = createdEvent.data.hangoutLink;
        const eventId = createdEvent.data.id;

        if (!meetLink || !eventId) {
            throw new Error('Google Calendar event created, but Meet link or Event ID missing.');
        }

        console.log("Google Meet Link:", meetLink);
        console.log("Google Calendar Event ID:", eventId);


        // 5. Save Meeting Details to Supabase DB
        const { error: dbError } = await supabase
            .from('meetings')
            .insert({
                user_id: userId,
                summary: summary,
                description: description,
                start_time: startTime.toISOString(),
                end_time: endTime.toISOString(),
                google_meet_link: meetLink,
                google_event_id: eventId,
            });

        if (dbError) {
            console.error("Supabase DB insert error:", dbError);
            // Optional: Try to delete the Google Calendar event if DB save fails (rollback)
            try {
                await calendar.events.delete({ calendarId: 'primary', eventId: eventId });
                console.log("Rolled back Google Calendar event.");
            } catch (deleteError) {
                console.error("Failed to rollback Google Calendar event:", deleteError);
            }
            return { success: false, error: 'Failed to save meeting to database.' };
        }

        return { success: true, meetLink: meetLink };

    } catch (error: any) {
        console.error('Error creating Google Meet/Calendar event:', error);
        // Handle specific Google API errors (e.g., insufficient permissions, token expiry)
        if (error.response?.data?.error?.message) {
             return { success: false, error: `Google API Error: ${error.response.data.error.message}` };
        }
        return { success: false, error: error.message || 'An unexpected error occurred during scheduling.' };
    }
}