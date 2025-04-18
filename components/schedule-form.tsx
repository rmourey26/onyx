// components/schedule-form.tsx
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { scheduleMeetingSchema, ScheduleMeetingData } from "@/lib/schemas/schemas";
import { scheduleMeetingAction } from "@/app/schedule/actions"; // Server Action (see below)
import { useState } from "react";

export function ScheduleForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<ScheduleMeetingData>({
    resolver: zodResolver(scheduleMeetingSchema),
    defaultValues: {
      summary: "",
      description: "",
      // Set default times if needed, e.g., start time 1 hour from now
      startTime: new Date(Date.now() + 60 * 60 * 1000),
      endTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
    },
  });

  async function onSubmit(data: ScheduleMeetingData) {
    setIsSubmitting(true);
    console.log("Form Data:", data); // Log data before sending

    try {
        const result = await scheduleMeetingAction(data); // Call server action

        if (result.success && result.meetLink) {
            toast({
                title: "Meeting Scheduled!",
                description: (
                    <p>
                        Your meeting {data.summary} is scheduled.
                        <br />
                        <a
                            href={result.meetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline"
                        >
                            Join Google Meet
                        </a>
                    </p>
                ),
            });
            form.reset(); // Reset form on success
        } else {
            console.error("Failed to create meeting:", result.error);
            toast({
                variant: "destructive",
                title: "Scheduling Failed",
                description: result.error || "Could not create the Google Meet link or save the meeting.",
            });
        }
    } catch (error) {
        console.error("Error submitting form:", error);
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: "There was a problem with your request.",
        });
    } finally {
        setIsSubmitting(false);
    }
}


  // Helper to combine Date and Time (since Calendar only picks date)
  // You might need separate Time pickers or a combined DateTime picker component
  const handleDateTimeChange = (field: "startTime" | "endTime", date: Date | undefined) => {
    if (!date) return;
    // This is basic - assumes you want to keep the existing time or set a default
    // A real implementation needs a time input as well.
    const currentFieldValue = form.getValues(field);
    const newDate = new Date(date);
    newDate.setHours(currentFieldValue.getHours());
    newDate.setMinutes(currentFieldValue.getMinutes());
    form.setValue(field, newDate, { shouldValidate: true });
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Summary Field */}
        <FormField
          control={form.control}
          name="summary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meeting Summary</FormLabel>
              <FormControl>
                <Input placeholder="Quick Sync" {...field} />
              </FormControl>
              <FormDescription>
                This will be the title of the meeting.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description Field */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Discuss project updates..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Start Time Field (Using Shadcn Date Picker - needs time input too) */}
        <FormField
          control={form.control}
          name="startTime"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Start Time</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP HH:mm") // Format including time
                      ) : (
                        <span>Pick a date and time</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => handleDateTimeChange("startTime", date)}
                    disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} // Disable past dates
                    initialFocus
                  />
                  {/* Add Time Picker component here */}
                </PopoverContent>
              </Popover>
               <FormDescription>
                 Select the start date & time. (Time input needed separately).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* End Time Field (Similar to Start Time) */}
         <FormField
          control={form.control}
          name="endTime"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>End Time</FormLabel>
              <Popover>
                 <PopoverTrigger asChild>
                   <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP HH:mm")
                      ) : (
                        <span>Pick a date and time</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => handleDateTimeChange("endTime", date)}
                    disabled={(date) => date < form.getValues("startTime")} // Disable before start time
                    initialFocus
                  />
                   {/* Add Time Picker component here */}
                </PopoverContent>
              </Popover>
               <FormDescription>
                 Select the end date & time. (Time input needed separately).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Scheduling..." : "Schedule Meeting"}
        </Button>
      </form>
    </Form>
  );
}
