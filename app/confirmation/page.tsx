"use client"

import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Copy, Calendar } from "lucide-react"
import { useState } from "react"
import { toast } from "@/components/ui/use-toast"

export default function ConfirmationPage() {
  const searchParams = useSearchParams()
  const meetLink = searchParams.get("meetLink")
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    if (meetLink) {
      navigator.clipboard.writeText(meetLink)
      setCopied(true)
      toast({
        title: "Copied!",
        description: "Meeting link copied to clipboard",
      })
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const addToCalendar = () => {
    if (meetLink) {
      window.open(meetLink, "_blank")
    }
  }

  if (!meetLink) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>No meeting link found</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Please try scheduling your meeting again.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => (window.location.href = "/")}>Go Home</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <CardTitle>Meeting Scheduled!</CardTitle>
          <CardDescription>Your Google Meet has been created successfully</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-muted rounded-md break-all">
            <p className="font-mono text-sm">{meetLink}</p>
          </div>
          <p className="text-sm text-muted-foreground">
            This link has been sent to all attendees via email. You can also copy it to share manually.
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={copyToClipboard} className="gap-2">
            {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy Link"}
          </Button>
          <Button onClick={addToCalendar} className="gap-2">
            <Calendar className="h-4 w-4" />
            Open in Calendar
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

