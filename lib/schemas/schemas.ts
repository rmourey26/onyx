// lib/schemas/schemas.ts
import { z } from 'zod';

export const scheduleMeetingSchema = z.object({
  summary: z.string().min(3, { message: "Summary must be at least 3 characters." }),
  description: z.string().optional(),
  startTime: z.date({ required_error: "Start date and time are required." }),
  endTime: z.date({ required_error: "End date and time are required." }),
}).refine(data => data.endTime > data.startTime, {
  message: "End time must be after start time.",
  path: ["endTime"], // Path of error
});

export type ScheduleMeetingData = z.infer<typeof scheduleMeetingSchema>;
