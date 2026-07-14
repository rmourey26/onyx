"use client"

import { Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { useState } from "react"
import { NfcHelpDialog } from "@/components/nfc-help-dialog"
import { isNfcSupported, shareViaNfc, generateVCard } from "@/lib/nfc"
import { toast } from "sonner"

interface NfcShareButtonProps {
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

export function NfcShareButton({ userData }: NfcShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleNfcShare = async () => {
    if (!isNfcSupported()) {
      toast.error("NFC not supported", {
        description: "Your device doesn't support NFC sharing. Try using Chrome on Android.",
      })
      return
    }

    try {
      setIsLoading(true)

      // Add a timeout to automatically close the NFC dialog if it takes too long
      const nfcTimeout = setTimeout(() => {
        setIsLoading(false)
        toast.error("NFC timeout", {
          description: "NFC sharing took too long. Please try again.",
        })
      }, 10000)

      const vCardData = generateVCard(userData)
      const result = await shareViaNfc(vCardData)

      // Clear the timeout since we got a response
      clearTimeout(nfcTimeout)

      if (result.success) {
        toast.success("NFC activated", {
          description: result.message,
        })
      } else {
        toast.error("NFC error", {
          description: result.message,
        })
      }
    } catch (error) {
      console.error("NFC sharing error:", error)
      toast.error("NFC error", {
        description: "Failed to activate NFC sharing",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex items-center">
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2 bg-transparent">
            <Smartphone className="h-4 w-4" />
            <span>Share via NFC</span>
          </Button>
        </DialogTrigger>
        <NfcHelpDialog />
      </div>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share via NFC</DialogTitle>
          <DialogDescription>
            Hold your phone near another NFC-enabled device to share your contact information.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 text-center">
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-lg font-medium">Activating NFC...</p>
              <p className="text-sm text-muted-foreground mt-2">Make sure NFC is enabled in your device settings</p>
            </>
          ) : (
            <>
              <Smartphone className="h-16 w-16 mx-auto mb-4 text-primary" />
              <p className="text-lg font-medium">Ready to share!</p>
              <p className="text-sm text-muted-foreground mt-2">Tap your phone against another NFC-enabled device</p>
            </>
          )}
        </div>

        <DialogFooter>
          <Button onClick={handleNfcShare} disabled={isLoading} className="w-full">
            {isLoading ? "Activating..." : "Start NFC Sharing"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
