"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Share2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { QRCodeSVG } from "qrcode.react"
import { ensureProfileHasPublicId } from "@/app/actions/profile-public-id"
import { getAbsoluteUrl } from "@/lib/config"

interface ProfileShareModalProps {
  userId: string
  userData: {
    full_name: string
    company: string
    job_title?: string
    email: string
    website: string
    linkedin_url?: string
    xhandle?: string
    waddress?: string
  }
}

export function ProfileShareModal({ userId, userData }: ProfileShareModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [publicId, setPublicId] = useState<string | null>(null)
  const [shareUrl, setShareUrl] = useState<string>("")

  // Generate the profile URL for sharing
  useEffect(() => {
    if (publicId) {
      const url = getAbsoluteUrl(`/p/${publicId}`)
      setShareUrl(url)
    }
  }, [publicId])

  // Ensure the profile has a public_id when the modal opens
  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open)

    if (open) {
      setIsLoading(true)
      try {
        // Ensure the profile has a public_id
        const result = await ensureProfileHasPublicId(userId)

        if (result.success && result.public_id) {
          setPublicId(result.public_id)
          console.log("Using public_id for sharing:", result.public_id)

          // Generate share URL
          const url = getAbsoluteUrl(`/p/${result.public_id}`)

          setShareUrl(url)
        } else {
          console.error("Failed to ensure profile has public_id:", result.error)
          toast({
            title: "Error preparing share link",
            description: "There was a problem generating your share link. Please try again.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error in handleOpenChange:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
  }

  // Copy link to clipboard
  const copyLink = async () => {
    if (!shareUrl) {
      toast({
        title: "Error",
        description: "Share link is not ready yet. Please try again.",
        variant: "destructive",
      })
      return
    }

    try {
      await navigator.clipboard.writeText(shareUrl)
      toast({
        title: "Link copied",
        description: "Profile link copied to clipboard",
      })
    } catch (error) {
      console.error("Failed to copy link:", error)
      toast({
        title: "Failed to copy",
        description: "Please try again or copy the link manually",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Share2 className="h-4 w-4" />
          <span>Share Profile</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Your Profile</DialogTitle>
          <DialogDescription>Share your business card with others.</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Preparing your share link...</p>
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            {shareUrl && (
              <div className="flex justify-center">
                <div className="bg-white p-2 rounded-lg shadow-md">
                  <QRCodeSVG value={shareUrl} size={200} />
                </div>
              </div>
            )}
            {shareUrl && (
              <div className="p-3 bg-muted rounded-md break-all">
                <p className="text-sm font-mono">{shareUrl}</p>
              </div>
            )}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={copyLink}>
                Copy Link
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
