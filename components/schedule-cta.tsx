"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { MeetingScheduler } from "@/components/meeting-scheduler"
import { Video } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { signInWithGoogle } from "@/app/auth/actions"
import { toast } from "@/components/ui/use-toast"

export function ScheduleCTA() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { user, loading } = useAuth()

  const handleAuth = async () => {
    if (!user) {
      setIsLoading(true)
      try {
        const result = await signInWithGoogle()
        if (result.error) {
          toast({
            title: "Error",
            description: result.error,
            variant: "destructive",
          })
        } else if (result.url) {
          window.location.href = result.url
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to sign in with Google",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    } else {
      setIsOpen(true)
    }
  }

  if (loading) {
    return <Button disabled>Loading...</Button>
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2" onClick={handleAuth} disabled={isLoading}>
          <Video className="h-4 w-4" />
          {isLoading ? "Loading..." : user ? "Schedule a Meeting" : "Sign in to Schedule"}
        </Button>
      </DialogTrigger>
      {user && (
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule a Google Meet</DialogTitle>
            <DialogDescription>Create a meeting and invite attendees with Google Meet</DialogDescription>
          </DialogHeader>
          <MeetingScheduler />
        </DialogContent>
      )}
    </Dialog>
  )
}

