'use client';

import { useState } from 'react';
import { scheduleMeetingAction } from '@/app/schedule/actions'; // We'll create this Server Action
import { useFormState, useFormStatus } from 'react-dom';
import { formatISO, addHours } from 'date-fns'; // Using date-fns

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

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      aria-disabled={pending}
      disabled={pending}
      className={`px-6 py-2 rounded ${
        pending ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 text-white'
      }`}
    >
      {pending ? 'Scheduling...' : 'Schedule Meeting'}
    </button>
  );
}

export default function ScheduleForm({ userEmail, userName }: ScheduleFormProps) {
  // Use useFormState to handle form submission results from the Server Action
  const [state, formAction] = useFormState(scheduleMeetingAction, initialState);

  // Simple state for date and time - consider using a date picker library for better UX
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!date || !time) {
      alert('Please select both a date and a time.');
      return;
    }

    // Construct ISO 8601 datetime strings
    // WARNING: This assumes the user's browser timezone. For robustness,
    // handle timezones explicitly (e.g., ask user or use owner's timezone).
    // Example: '2025-05-20T10:00:00' (adjust based on input type='time')
    const startDateTime = new Date(`${date}T${time}`);
    if (isNaN(startDateTime.getTime())) {
       alert('Invalid date or time selected.');
       return;
    }

    // Assume a 1-hour meeting duration
    const endDateTime = addHours(startDateTime, 1);

    // Format for Google Calendar API (ISO 8601)
    const startTimeISO = formatISO(startDateTime);
    const endTimeISO = formatISO(endDateTime);

    // Create FormData to pass to the server action
    const formData = new FormData();
    formData.append('startTime', startTimeISO);
    formData.append('endTime', endTimeISO);
    formData.append('userEmail', userEmail);
    formData.append('userName', userName);
    formData.append('summary', `Meeting with ${userName}`); // Customize summary
    formData.append('description', `Scheduled via App by ${userEmail}`); // Customize description

    // Trigger the server action
    formAction(formData);
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Display messages from server action */}
      {state?.message && (
        <p className={`p-3 rounded ${state.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {state.message}
        </p>
      )}
       {state?.error && (
        <p className="p-3 rounded bg-red-100 text-red-800">
          Error: {state.error}
        </p>
      )}

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
          Select Date:
        </label>
        <input
          type="date"
          id="date"
          name="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
          // Set min date to today
          min={new Date().toISOString().split('T')[0]}
        />
      </div>

      <div>
        <label htmlFor="time" className="block text-sm font-medium text-gray-700">
          Select Time: (e.g., 09:00 AM)
        </label>
        <input
          type="time"
          id="time"
          name="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
          // Consider adding time constraints (e.g., step="3600" for hourly slots)
        />
      </div>

       {/* Hidden fields for user email and name are passed via FormData now */}

      <SubmitButton />
    </form>
  );
}