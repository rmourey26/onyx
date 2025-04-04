"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Clock, Plus, Trash } from "lucide-react"
import { cn } from "@/lib/utils"
import { TimePicker } from "@/components/ui/time-picker"
import { toast } from "@/components/ui/use-toast"
import { scheduleMeeting, type MeetingFormData } from "@/lib/meeting-actions"
import { useAuth } from "@/hooks/use-auth"

export function MeetingScheduler() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [startTime, setStartTime] = useState<Date | undefined>(undefined)
  const [endTime, setEndTime] = useState<Date | undefined>(undefined)
  const [summary, setSummary] = useState("")
  const [description, setDescription] = useState("")
  const [attendees, setAttendees] = useState<string[]>([""])

  const addAttendee = () => {
    setAttendees([...attendees, ""])
  }

  const removeAttendee = (index: number) => {
    const newAttendees = [...attendees]
    newAttendees.splice(index, 1)
    setAttendees(newAttendees)
  }

  const updateAttendee = (index: number, value: string) => {
    const newAttendees = [...attendees]
    newAttendees[index] = value
    setAttendees(newAttendees)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to schedule a meeting",
        variant: "destructive",
      })
      return
    }

    if (!date || !startTime || !endTime || !summary || attendees.filter((a) => a).length === 0) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const startDateTime = new Date(date)
    startDateTime.setHours(startTime.getHours(), startTime.getMinutes())

    const endDateTime = new Date(date)
    endDateTime.setHours(endTime.getHours(), endTime.getMinutes())

    setIsLoading(true)

    try {
      const formData: MeetingFormData = {
        summary,
        description,
        date: date.toISOString(),
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        attendees: attendees.filter((a) => a),
      }

      const result = await scheduleMeeting(user.id, formData)

      if (!result.success) {
        throw new Error(result.error)
      }

      toast({
        title: "Meeting scheduled!",
        description: `Your Google Meet link: ${result.meetLink}`,
      })

      router.push(`/confirmation?meetLink=${encodeURIComponent(result.meetLink)}`)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to schedule meeting",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Schedule a Google Meet</CardTitle>
        <CardDescription>Fill in the details to create a meeting</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="summary">Meeting Title</Label>
            <Input
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Quarterly Review"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Discuss quarterly goals and achievements"
            />
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !startTime && "text-muted-foreground")}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    {startTime ? format(startTime, "h:mm a") : "Select time"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <TimePicker setTime={setStartTime} />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Time</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !endTime && "text-muted-foreground")}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    {endTime ? format(endTime, "h:mm a") : "Select time"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <TimePicker setTime={setEndTime} />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Attendees</Label>
            {attendees.map((attendee, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  type="email"
                  value={attendee}
                  onChange={(e) => updateAttendee(index, e.target.value)}
                  placeholder="email@example.com"
                  required={index === 0}
                />
                {index > 0 && (
                  <Button type="button" variant="outline" size="icon" onClick={() => removeAttendee(index)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" className="mt-2" onClick={addAttendee}>
              <Plus className="h-4 w-4 mr-2" />
              Add Attendee
            </Button>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Scheduling..." : "Schedule Meeting"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

