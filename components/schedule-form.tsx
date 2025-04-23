'use client';

import { useState, useMemo } from 'react';
import { scheduleMeetingAction } from '@/app/schedule/actions';
import { useFormState, useFormStatus } from 'react-dom';
import { DayPicker } from 'react-day-picker';
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
    startOfDay
} from 'date-fns';

interface ScheduleFormProps {
  userEmail: string;
  userName: string;
}

// Initial state for the useFormState hook
const initialState: { message: string | null; error: string | null; success: boolean } = {
  message: null,
  error: null,
  success: false,
};

// --- Time Slot Configuration ---
const MEETING_DURATION_MINUTES = 60; // e.g., 1 hour meetings
const AVAILABLE_HOURS_START = 9; // 9 AM
const AVAILABLE_HOURS_END = 17; // 5 PM (exclusive)
// -----------------------------

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  const isDisabled = pending || disabled; // Disable if pending or explicitly disabled

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

export function ScheduleForm({ userEmail, userName }: ScheduleFormProps) {
  const [state, formAction] = useFormState(scheduleMeetingAction, initialState);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | undefined>(undefined); // e.g., "09:00"

  // --- Time Slot Generation ---
  // Note: This generates predefined slots. Real-world scenarios should
  // check the owner's actual availability using Google Calendar API (freebusy query).
  const availableTimeSlots = useMemo(() => {
    if (!selectedDate) return [];

    const slots: string[] = [];
    const today = startOfDay(new Date()); // Use startOfDay for consistent comparison
    const selectedDayStart = startOfDay(selectedDate);

    for (let hour = AVAILABLE_HOURS_START; hour < AVAILABLE_HOURS_END; hour++) {
      // Create a potential start time for the slot on the selected date
      const slotStartTime = setMilliseconds(setSeconds(setMinutes(setHours(selectedDate, hour), 0), 0), 0);

      // Basic check: Don't show slots that have already passed today
      if (isSameDay(selectedDayStart, today) && isPast(slotStartTime)) {
          continue;
      }

      slots.push(format(slotStartTime, 'HH:mm')); // Format as "09:00", "10:00", etc.
    }
    return slots;
  }, [selectedDate]);
  // -----------------------------

  // Reset time slot if the date changes
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTimeSlot(undefined); // Reset time slot when date changes
  };

  // Handle form submission prep
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedDate || !selectedTimeSlot) {
      alert('Please select both a date and a time slot.');
      return;
    }

    // --- Construct ISO DateTimes ---
    const [hour, minute] = selectedTimeSlot.split(':').map(Number);
    let startDateTime = setHours(selectedDate, hour);
    startDateTime = setMinutes(startDateTime, minute);
    startDateTime = setSeconds(startDateTime, 0);
    startDateTime = setMilliseconds(startDateTime, 0);

    if (isNaN(startDateTime.getTime())) {
       alert('Invalid date or time combination.');
       return;
    }

    // Basic check: Ensure the selected slot hasn't passed (double-check)
    if (isPast(startDateTime)) {
      alert('The selected time slot has already passed. Please select a future time.');
      return;
    }

    const endDateTime = addMinutes(startDateTime, MEETING_DURATION_MINUTES);

    // Format for Google Calendar API and Server Action (ISO 8601)
    const startTimeISO = formatISO(startDateTime);
    const endTimeISO = formatISO(endDateTime);
    // -----------------------------

    // Create FormData to pass to the server action
    const formData = new FormData();
    formData.append('startTime', startTimeISO);
    formData.append('endTime', endTimeISO);
    formData.append('userEmail', userEmail);
    formData.append('userName', userName);
    formData.append('summary', `Meeting with ${userName}`); // Customize summary
    formData.append('description', `Scheduled via App by ${userEmail} for ${format(startDateTime, 'PPP p')}`); // Add formatted time to description

    // Trigger the server action
    formAction(formData);
  };

  // Determine if the submit button should be disabled
  const isSubmitDisabled = !selectedDate || !selectedTimeSlot;

  // CSS for DayPicker (can customize further)
  const css = `
    .rdp {
      --rdp-cell-size: 40px;
      --rdp-accent-color: #16a34a; /* green-600 */
      --rdp-background-color: #dcfce7; /* green-100 */
      /* Switch selected colors */
      --rdp-accent-color-dark: #15803d; /* green-700 */
      --rdp-background-color-dark: #bbf7d0; /* green-200 */
      /* today button */
      --rdp-today-color: #ea580c; /* orange-600 */
      margin: 1em 0;
      border: 1px solid #e5e7eb; /* gray-200 */
      border-radius: 0.375rem; /* rounded-md */
      padding: 0.5rem;
    }
    .rdp-caption {
        border-bottom: 1px solid #e5e7eb; /* gray-200 */
        padding-bottom: 0.5rem;
        margin-bottom: 0.5rem;
    }
    .rdp-head_cell {
        font-weight: 600; /* font-semibold */
        font-size: 0.875rem; /* text-sm */
    }
    .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
        background-color: #f3f4f6; /* gray-100 */
    }
    .rdp-day_selected, .rdp-day_selected:hover {
       background-color: var(--rdp-accent-color);
       color: white;
    }
    .rdp-day_today {
      font-weight: bold;
      color: var(--rdp-today-color);
    }
    .rdp-day_disabled {
       color: #9ca3af; /* gray-400 */
    }
  `;


  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
      {/* Display messages from server action */}
      {state?.message && (
        <p className={`p-3 rounded text-sm ${state.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {state.message}
          {state.success && state.googleEventLink && (
             <a href={state.googleEventLink} target="_blank" rel="noopener noreferrer" className="ml-2 underline font-semibold">View Event</a>
          )}
        </p>
      )}
       {state?.error && (
        <p className="p-3 rounded bg-red-100 text-red-800 text-sm">
          Error: {state.error}
        </p>
      )}

      {/* Date Selection */}
      <div>
         <h3 className="text-lg font-semibold mb-2 text-gray-800">1. Select a Date</h3>
         <style>{css}</style> {/* Inject DayPicker CSS */}
         <DayPicker
            mode="single"
            required
            selected={selectedDate}
            onSelect={handleDateSelect}
            fromDate={new Date()} // Disable past dates
            disabled={[
                // Example: Disable weekends
                // (day) => day.getDay() === 0 || day.getDay() === 6
            ]}
            footer={selectedDate ? `Selected date: ${format(selectedDate, 'PPP')}` : 'Please pick a day.'}
            className="bg-white rounded-md shadow" // Add basic container styling
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
                   type="button" // Important: Prevent form submission on click
                   onClick={() => setSelectedTimeSlot(slot)}
                   className={`p-2 border rounded text-center text-sm font-medium transition-colors duration-150 ease-in-out ${
                     selectedTimeSlot === slot
                       ? 'bg-green-600 text-white border-green-700 ring-2 ring-green-300'
                       : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100 hover:border-gray-400'
                   }`}
                 >
                   {slot}
                 </button>
               ))}
             </div>
          ) : (
              <p className="text-gray-500 italic">No available time slots for the selected date based on predefined hours.</p>
          )}

        </div>
      )}

      {/* Submit Button */}
      <div className="pt-4">
         <SubmitButton disabled={isSubmitDisabled} />
      </div>
    </form>
  );
}