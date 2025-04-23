'use server';

import { createClient } from '@/utils/supa-server-actions';
import { createGoogleCalendarEvent } from '@/lib/calendar-service';
import { revalidatePath } from 'next/cache';
import { Database } from '@/lib/supabase';
import { z } from 'zod';
import { formatISO, isPast } from 'date-fns'; // Import formatISO here

// --- Updated Zod Schema for Server Action ---
const scheduleSchema = z.object({
  // Coerce the incoming string from FormData into a Date object
  // The Date constructor used by coerce handles various ISO 8601 formats
  startTime: z.coerce.date({
      // Provide a clearer error message if coercion fails
      errorMap: (issue, ctx) => ({ message: 'Invalid format for start date/time.' })
    })
    // Add refinements directly to the coerced Date object
    .refine(date => !isPast(date), {
        message: "The selected start time appears to be in the past.",
    }),
  endTime: z.coerce.date({
      errorMap: (issue, ctx) => ({ message: 'Invalid format for end date/time.' })
  }),
  userEmail: z.string().email({ message: 'Invalid user email.' }),
  userName: z.string().min(1, { message: 'User name cannot be empty.' }),
  summary: z.string().min(1, { message: 'Meeting summary cannot be empty.' }),
  description: z.string().optional(),
})
// Refine the relationship between the coerced Date objects
.refine(data => data.endTime > data.startTime, {
    message: "End time must be after start time.",
    path: ["endTime"], // Target the error message correctly
});


// Define the state structure returned by the action
interface ActionResult {
    message: string | null;
    error: string | null;
    success: boolean;
    googleEventLink?: string | null;
}

export async function scheduleMeetingAction(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {

  const supabase = createClient();

  // 1. Check Authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.error('Authentication error in server action:', authError);
    return { success: false, message: null, error: 'You must be logged in to schedule a meeting.', googleEventLink: null };
  }

   // 2. Validate Form Data (using the updated schema with coerce)
   const rawData = {
       // Extract raw strings from FormData for Zod to coerce
       startTime: formData.get('startTime'),
       endTime: formData.get('endTime'),
       userEmail: formData.get('userEmail'),
       userName: formData.get('userName'),
       summary: formData.get('summary'),
       description: formData.get('description'),
   };

   // safeParse will attempt to coerce startTime and endTime strings into Date objects
   const validationResult = scheduleSchema.safeParse(rawData);

   if (!validationResult.success) {
       console.error("Server validation failed:", validationResult.error.flatten());
       // Combine Zod error messages
       const errorMessages = Object.values(validationResult.error.flatten().fieldErrors)
           .map(errors => errors?.join('. '))
           .filter(Boolean)
           .join(' ');
       return { success: false, message: null, error: errorMessages || 'Invalid form data provided.', googleEventLink: null };
   }

   // --- IMPORTANT: validationResult.data now contains actual Date objects ---
   const validatedData = validationResult.data;

   // 3. Basic check: User email from form should match logged-in user
   if (validatedData.userEmail !== user.email) {
       console.error(`Security Alert: Form email (${validatedData.userEmail}) does not match authenticated user (${user.email})`);
       return { success: false, message: null, error: 'User email mismatch.', googleEventLink: null };
   }


  try {
    // 4. Create Google Calendar Event
    //    Format the validated Date objects back into ISO strings for the Google API call
    const calendarResult = await createGoogleCalendarEvent({
      startTime: formatISO(validatedData.startTime), // Format Date -> ISO String
      endTime: formatISO(validatedData.endTime),     // Format Date -> ISO String
      attendeeEmail: validatedData.userEmail,
      attendeeName: validatedData.userName,
      summary: validatedData.summary,
      description: validatedData.description || `Scheduled by ${validatedData.userEmail}`,
    });

    if (!calendarResult.success || !calendarResult.eventId) {
      console.error("Failed to create Google Calendar event:", calendarResult.error);
      // Pass specific Google error back if available
      const errorMessage = calendarResult.error || 'Failed to create Google Calendar event.';
      return { success: false, message: null, error: errorMessage, googleEventLink: null };
    }

    console.log(`Google Event created: ${calendarResult.eventId}, Link: ${calendarResult.link}`);

    // 5. Store meeting info in Supabase DB
    //    Pass the validated Date objects directly to the Supabase client.
    //    It typically handles conversion to 'timestamptz' correctly.
    const { error: dbError } = await supabase
      .from('meetings')
      .insert({
        user_id: user.id,
        start_time: validatedData.startTime, // Pass Date object
        end_time: validatedData.endTime,     // Pass Date object
        google_event_id: calendarResult.eventId,
        summary: validatedData.summary,
      });

    if (dbError) {
      // Log the error, but don't necessarily fail if calendar event succeeded
      console.error('Error saving meeting to database:', dbError);
      // Optional: Return a partial success message or specific DB error
      // return { success: false, message: null, error: 'Meeting scheduled, but failed to save record.', googleEventLink: calendarResult.link };
    } else {
       console.log("Meeting details saved to database.");
    }

    // 6. Revalidate the path if needed
    // revalidatePath('/schedule');

    // 7. Return success state
    return {
        success: true,
        message: 'Meeting scheduled successfully! Check your email for the invite.',
        error: null,
        googleEventLink: calendarResult.link,
    };

  } catch (error) {
    console.error('Unexpected error in scheduleMeetingAction:', error);
     let errorMessage = 'An unexpected error occurred while scheduling.';
     if (error instanceof Error) {
         errorMessage = error.message;
     }
    return { success: false, message: null, error: errorMessage, googleEventLink: null };
  }
}