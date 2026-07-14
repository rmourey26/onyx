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
import QRCode from "react-qr-code"
import { createClient } from "@/lib/supabase"

interface ShareQRCodeButtonProps {
  cardId: string
}

export function ShareQRCodeButton({ cardId }: ShareQRCodeButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleOpen = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()

      // Fetch the business card and associated user data
      const { data, error } = await supabase.from("business_cards").select("*, profiles(*)").eq("id", cardId).single()

      if (error) throw error

      setUserData(data)
    } catch (error) {
      console.error("Error fetching card data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Generate vCard format for contact information
  const generateVCard = () => {
    if (!userData) return ""

    return `BEGIN:VCARD
VERSION:3.0
FN:${userData.profiles.full_name}
ORG:${userData.profiles.company}
EMAIL:${userData.profiles.email}
URL:${userData.profiles.website}
END:VCARD`
  }

  // Generate URL for sharing
  const shareUrl = userData ? generateVCard() : `${process.env.NEXT_PUBLIC_APP_URL}/card/${cardId}`

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open)
        if (open) handleOpen()
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">Share QR Code</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share your business card</DialogTitle>
          <DialogDescription>Scan this QR code to save contact information or view the business card</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-6">
          {isLoading ? (
            <div className="animate-pulse h-64 w-64 bg-gray-200 rounded-lg"></div>
          ) : (
            <>
              <QRCode value={shareUrl} size={256} />
              <p className="mt-4 text-sm text-gray-500">
                This QR code contains your contact information and can be saved directly to contacts
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
