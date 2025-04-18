'use server';

import { createActionClient } from '@/lib/supabase/action';
import { createGoogleCalendarEvent } from '@/lib/google';
import { revalidatePath } from 'next/cache';
import { Database } from '@/lib/supabase';
import { z } from 'zod'; // For input validation

// Define schema for form data validation
const scheduleSchema = z.object({
  startTime: z.string().datetime({ message: 'Invalid start date/time format.' }),
  endTime: z.string().datetime({ message: 'Invalid end date/time format.' }),
  userEmail: z.string().email({ message: 'Invalid user email.' }),
  userName: z.string().min(1, { message: 'User name cannot be empty.' }),
  summary: z.string().min(1, { message: 'Meeting summary cannot be empty.' }),
  description: z.string().optional(),
});


// Define the state structure returned by the action
interface ActionResult {
    message: string | null;
    error: string | null;
    success: boolean;
    googleEventLink?: string | null;
}

export async function scheduleMeetingAction(
  prevState: ActionResult, // Previous state from useFormState
  formData: FormData
): Promise<ActionResult> {

  const supabase = createActionClient(); // Use action client

  // 1. Check Authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.error('Authentication error in server action:', authError);
    return { success: false, message: null, error: 'You must be logged in to schedule a meeting.' };
  }

   // 2. Validate Form Data
   const rawData = {
       startTime: formData.get('startTime'),
       endTime: formData.get('endTime'),
       userEmail: formData.get('userEmail'),
       userName: formData.get('userName'),
       summary: formData.get('summary'),
       description: formData.get('description'),
   };

   const validationResult = scheduleSchema.safeParse(rawData);

   if (!validationResult.success) {
       console.error("Form validation failed:", validationResult.error.flatten().fieldErrors);
       // Combine Zod error messages
       const errorMessages = Object.values(validationResult.error.flatten().fieldErrors)
           .map(errors => errors?.join('. '))
           .filter(Boolean) // Remove undefined/null entries
           .join(' ');
       return { success: false, message: null, error: errorMessages || 'Invalid form data.' };
   }

   const validatedData = validationResult.data;

  // Basic check: User email from form should match logged-in user
  // (This is a basic security measure)
  if (validatedData.userEmail !== user.email) {
      console.error(`Security Alert: Form email (${validatedData.userEmail}) does not match authenticated user (${user.email})`);
      return { success: false, message: null, error: 'User email mismatch.' };
  }


  try {
    // 3. Create Google Calendar Event
    const calendarResult = await createGoogleCalendarEvent({
      startTime: validatedData.startTime,
      endTime: validatedData.endTime,
      attendeeEmail: validatedData.userEmail,
      attendeeName: validatedData.userName,
      summary: validatedData.summary,
      description: validatedData.description || `Scheduled by ${validatedData.userEmail}`,
    });

    if (!calendarResult.success || !calendarResult.eventId) {
      console.error("Failed to create Google Calendar event:", calendarResult.error);
      return { success: false, message: null, error: calendarResult.error || 'Failed to create Google Calendar event.' };
    }

    console.log(`Google Event created: ${calendarResult.eventId}, Link: ${calendarResult.link}`);

    // 4. (Optional but Recommended) Store meeting info in your Supabase DB
    // Create a 'meetings' table in Supabase first
    // Columns: id (uuid, pk), user_id (uuid, fk to auth.users), start_time (timestampz),
    //          end_time (timestampz), google_event_id (text), created_at (timestampz, default now())
    const { error: dbError } = await supabase
      .from('meetings') // Replace 'meetings' with your actual table name
      .insert({
        user_id: user.id,
        start_time: validatedData.startTime,
        end_time: validatedData.endTime,
        google_event_id: calendarResult.eventId,
        // You might want to store the summary/description/attendee email here too
      });

    if (dbError) {
      // Log the error, but maybe don't fail the whole operation if calendar event succeeded
      console.error('Error saving meeting to database:', dbError);
      // You might decide whether to return an error here or just log it
      // return { success: false, message: null, error: 'Failed to save meeting record.' };
    } else {
       console.log("Meeting details saved to database.");
    }

    // 5. Revalidate the path if needed (e.g., if displaying a list of scheduled meetings)
    // revalidatePath('/schedule');

    // 6. Return success state
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
    return { success: false, message: null, error: errorMessage };
  }
}