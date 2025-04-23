'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button'
import { scheduleMeetingAction } from '@/app/schedule/actions';
import { useFormState, useFormStatus } from 'react-dom';
import { DayPicker } from 'react-day-picker';
import { z } from 'zod'; // Import Zod
import {
    format,
    formatISO,
    addMinutes,
    setHours,
    setMinutes,
    setSeconds,
    setMilliseconds,
    isPast,
    isSameDay,
    startOfDay,
    isValid // Import isValid for robustness
} from 'date-fns';

// --- Zod Schema for Client-Side Validation ---
// This schema validates the data *after* the user has made selections
// and we've constructed the initial Date objects.
const clientScheduleSchema = z.object({
    startDateTime: z.date({
        // Error if we somehow fail to create a valid Date object
        invalid_type_error: "Invalid date or time selected.",
        // Error if the user hasn't selected both date and time slot
        required_error: "Please select both a date and a time slot."
       })
       .refine(date => isValid(date), { // Ensure the created date is valid
            message: "Invalid date/time combination."
       })
       .refine(date => !isPast(date), { // Ensure the date/time is not in the past
            message: "The selected time slot has already passed. Please select a future time.",
       }),
    // We don't strictly need to validate endDateTime client-side if start is valid
    // and duration is fixed, but it could be added for completeness.
    // userEmail: z.string().email(), // Usually passed as prop, less critical here
    // userName: z.string().min(1), // Usually passed as prop
});

// Type for flattened Zod errors specifically for our schema structure
type ClientValidationErrors = z.inferFlattenedErrors<typeof clientScheduleSchema>['fieldErrors'];


interface ScheduleFormProps {
  userEmail: string;
  userName: string;
}

const initialState: { message: string | null; error: string | null; success: boolean; googleEventLink?: string | null } = {
  message: null,
  error: null,
  success: false,
  googleEventLink: null,
};

const MEETING_DURATION_MINUTES = 60;
const AVAILABLE_HOURS_START = 9;
const AVAILABLE_HOURS_END = 17;

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  const isDisabled = pending || disabled;

  return (
    <button
      type="submit"
      aria-disabled={isDisabled}
      disabled={isDisabled}
      className={`px-6 py-2 rounded text-white font-semibold ${
        isDisabled
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-green-500 hover:bg-green-600'
      }`}
    >
      {pending ? 'Scheduling...' : 'Schedule Meeting'}
    </button>
  );
}

export default function ScheduleForm({ userEmail, userName }: ScheduleFormProps) {
  // Server action state
  const [serverState, formAction] = useFormState(scheduleMeetingAction, initialState);
  // Component state
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | undefined>(undefined);
  // Client-side validation state
  const [clientErrors, setClientErrors] = useState<ClientValidationErrors | null>(null);


  const availableTimeSlots = useMemo(() => {
    // ... (time slot generation logic remains the same) ...
    if (!selectedDate) return [];
    const slots: string[] = [];
    const today = startOfDay(new Date());
    const selectedDayStart = startOfDay(selectedDate);
    for (let hour = AVAILABLE_HOURS_START; hour < AVAILABLE_HOURS_END; hour++) {
      const slotStartTime = setMilliseconds(setSeconds(setMinutes(setHours(selectedDate, hour), 0), 0), 0);
      if (isSameDay(selectedDayStart, today) && isPast(slotStartTime)) {
          continue;
      }
      slots.push(format(slotStartTime, 'HH:mm'));
    }
    return slots;
  }, [selectedDate]);

  // Clear client errors when selection changes
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTimeSlot(undefined);
    setClientErrors(null); // Clear errors
  };

  const handleTimeSelect = (slot: string) => {
    setSelectedTimeSlot(slot);
    setClientErrors(null); // Clear errors
  };

  // Handle form submission
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setClientErrors(null); // Clear previous client errors on new submission attempt

    // 1. Construct Date objects (attempt)
    let startDateTime: Date | null = null;
    let endDateTime: Date | null = null;

    if (selectedDate && selectedTimeSlot) {
        try {
            const [hour, minute] = selectedTimeSlot.split(':').map(Number);
            // Ensure hour and minute are valid numbers before setting
            if (!isNaN(hour) && !isNaN(minute)) {
                startDateTime = setMilliseconds(setSeconds(setMinutes(setHours(selectedDate, hour), minute), 0), 0);
                endDateTime = addMinutes(startDateTime, MEETING_DURATION_MINUTES);
            } else {
                 console.error("Invalid time slot format parsed:", selectedTimeSlot);
                 // Set startDateTime to an invalid date to trigger Zod error below
                 startDateTime = new Date('invalid date');
            }
        } catch (error) {
            console.error("Error constructing date:", error);
             // Set startDateTime to an invalid date to trigger Zod error below
            startDateTime = new Date('invalid date');
        }
    }

    // 2. Client-side validation using Zod
    // We primarily validate startDateTime as it implies date/time selection and past check
    const validationResult = clientScheduleSchema.safeParse({ startDateTime });

    if (!validationResult.success) {
      // Validation failed: Update client error state and stop
      setClientErrors(validationResult.error.flatten().fieldErrors);
      console.log("Client validation failed:", validationResult.error.flatten().fieldErrors);
      return;
    }

    // 3. Validation successful: Proceed with formatting and FormData
    // Use the validated data from result.data for type safety
    const startTimeISO = formatISO(validationResult.data.startDateTime);
    // endDateTime was constructed earlier, assuming fixed duration based on validated start
    const endTimeISO = formatISO(endDateTime!); // Use non-null assertion as startDateTime is valid

    // 4. Prepare FormData
    const formData = new FormData();
    formData.append('startTime', startTimeISO);
    formData.append('endTime', endTimeISO);
    formData.append('userEmail', userEmail);
    formData.append('userName', userName);
    formData.append('summary', `Meeting with ${userName}`);
    formData.append('description', `Scheduled via App by ${userEmail} for ${format(validationResult.data.startDateTime, 'PPP p')}`);

    // 5. Trigger Server Action
    console.log("Client validation passed. Submitting to server action...");
    formAction(formData);
  };

  // Determine if the submit button should be disabled
  const isSubmitDisabled = !selectedDate || !selectedTimeSlot;

  // Get specific client-side error message for date/time selection
  const dateTimeClientError = clientErrors?.startDateTime?.[0];

  // CSS for DayPicker (remains the same)
  const css = `
    .rdp { /* ... same styles ... */ }
    /* ... other rdp styles ... */
  `;


  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
      {/* Display messages from server action state */}
      {serverState?.message && (
        <p className={`p-3 rounded text-sm ${serverState.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {serverState.message}
          {serverState.success && serverState.googleEventLink && (
             <a href={serverState.googleEventLink} target="_blank" rel="noopener noreferrer" className="ml-2 underline font-semibold">View Event</a>
          )}
        </p>
      )}
       {serverState?.error && (
        <p className="p-3 rounded bg-red-100 text-red-800 text-sm">
          Server Error: {serverState.error}
        </p>
      )}

      {/* Display General Client Validation Errors (if not specific to date/time) */}
       {clientErrors && !dateTimeClientError && (
             <div className="p-3 rounded bg-yellow-100 text-yellow-800 text-sm border border-yellow-300">
                Please correct the errors indicated below.
             </div>
          )}

      {/* Date Selection */}
      <div>
         <h3 className="text-lg font-semibold mb-2 text-gray-800">1. Select a Date</h3>
         <style>{css}</style>
         <DayPicker
            mode="single"
            required // Keep required for accessibility, Zod handles actual logic
            selected={selectedDate}
            onSelect={handleDateSelect}
            fromDate={new Date()}
            // disabled={[ (day) => day.getDay() === 0 || day.getDay() === 6 ]}
            footer={selectedDate ? `Selected date: ${format(selectedDate, 'PPP')}` : 'Please pick a day.'}
            className="bg-white rounded-md shadow"
            // Associate potential errors with the picker region for accessibility
            aria-describedby={dateTimeClientError ? "datetime-client-error" : undefined}
         />
      </div>

      {/* Time Slot Selection */}
      {selectedDate && (
        <div>
          <h3 className="text-lg font-semibold mb-2 text-gray-800">2. Select a Time Slot</h3>
          {availableTimeSlots.length > 0 ? (
             <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
               {availableTimeSlots.map((slot) => (
                 <button
                   key={slot}
                   type="button"
                   onClick={() => handleTimeSelect(slot)} // Use specific handler
                   className={`p-2 border rounded text-center text-sm font-medium transition-colors duration-150 ease-in-out ${
                     selectedTimeSlot === slot
                       ? 'bg-green-600 text-white border-green-700 ring-2 ring-green-300'
                       : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100 hover:border-gray-400'
                   }`}
                    // Associate potential errors with the time slot region
                    aria-describedby={dateTimeClientError ? "datetime-client-error" : undefined}
                 >
                   {slot}
                 </button>
               ))}
             </div>
          ) : (
              <p className="text-gray-500 italic">No available time slots for the selected date based on predefined hours.</p>
          )}
            {/* Display Client-Side Date/Time Validation Error */}
            {dateTimeClientError && (
              <p id="datetime-client-error" className="mt-2 text-sm text-red-600">
                  {dateTimeClientError}
              </p>
            )}
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-4">
         {/* Disable button based on selection, not clientErrors (Zod prevents submission) */}
         <SubmitButton disabled={isSubmitDisabled} />
      </div>
    </form>
  );
}