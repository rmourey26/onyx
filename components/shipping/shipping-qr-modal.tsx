"use client"

import { DialogFooter } from "@/components/ui/dialog"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import QRCode from "react-qr-code"
import { Check, Copy, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "@/components/ui/use-toast"

interface ShippingQRModalProps {
  trackingNumber: string
  publicId: string
  isOpen: boolean
  onClose: () => void
}

export function ShippingQRModal({ trackingNumber, publicId, isOpen, onClose }: ShippingQRModalProps) {
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (trackingNumber && publicId) {
      setShareUrl(`${process.env.NEXT_PUBLIC_APP_URL}/track/${publicId}`)
    }
  }, [trackingNumber, publicId])

  const copyLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast({
        title: "Copied!",
        description: "Tracking URL copied to clipboard.",
      })
      setTimeout(() => {
        setCopied(false)
      }, 3000)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Track Shipment</DialogTitle>
          <DialogDescription>Share this QR code or link to track your shipment.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center">
          {shareUrl ? (
            <>
              <QRCode value={shareUrl} size={256} />
              <Button variant="ghost" onClick={copyLink} className="mt-4">
                {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                {copied ? "Copied!" : "Copy Tracking URL"}
              </Button>
              <p className="mt-4 text-sm text-gray-500">Share this QR code or tracking URL with the recipient.</p>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
              <p className="mt-2 text-sm text-gray-500">Generating QR code...</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
