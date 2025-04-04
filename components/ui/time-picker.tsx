"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface TimePickerProps {
  setTime: (time: Date) => void
  interval?: number
}

export function TimePicker({ setTime, interval = 15 }: TimePickerProps) {
  const [times, setTimes] = useState<Date[]>([])

  useEffect(() => {
    const generateTimes = () => {
      const result: Date[] = []
      const now = new Date()
      now.setHours(0, 0, 0, 0)

      for (let minutes = 0; minutes < 24 * 60; minutes += interval) {
        const time = new Date(now)
        time.setMinutes(minutes)
        result.push(time)
      }

      return result
    }

    setTimes(generateTimes())
  }, [interval])

  return (
    <ScrollArea className="h-72">
      <div className="grid grid-cols-1 gap-1 p-2">
        {times.map((time, i) => (
          <Button key={i} variant="ghost" onClick={() => setTime(time)} className="justify-start font-normal">
            {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </Button>
        ))}
      </div>
    </ScrollArea>
  )
}

