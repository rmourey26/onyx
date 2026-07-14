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
import {
  Copy,
  MessageSquare,
  Mail,
  Smartphone,
  Linkedin,
  Share2,
  QrCode,
  CreditCard,
  Facebook,
  Send,
  WheatIcon as WhatsApp,
} from "lucide-react"
import { toast } from "sonner"
import { QRCodeSVG } from "qrcode.react"
import { saveAs } from "file-saver"
import { generateVCard } from "@/lib/nfc"
import { isNfcSupported, shareViaNfc } from "@/lib/nfc"
import { ensureProfileHasPublicId } from "@/app/actions/profile-public-id"

interface ShareModalProps {
  profileId: string
  profileUrl?: string
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

export function ShareModal({ profileId, userData }: ShareModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isNfcLoading, setIsNfcLoading] = useState(false)
  const [publicId, setPublicId] = useState<string | null>(null)
  const [shareUrl, setShareUrl] = useState<string>("")
  const [nfcDialogOpen, setNfcDialogOpen] = useState(false)
  const [qrCodeRef, setQrCodeRef] = useState<SVGSVGElement | null>(null)

  // Generate the profile URL for sharing
  useEffect(() => {
    if (publicId) {
      const url =
        typeof window !== "undefined"
          ? `${window.location.origin}/p/${publicId}`
          : `${process.env.NEXT_PUBLIC_APP_URL || "https://app.resend-it.com"}/p/${publicId}`
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
        const result = await ensureProfileHasPublicId(profileId)

        if (result.success && result.public_id) {
          setPublicId(result.public_id)
          console.log("Using public_id for sharing:", result.public_id)

          // Generate share URL
          const url =
            typeof window !== "undefined"
              ? `${window.location.origin}/p/${result.public_id}`
              : `${process.env.NEXT_PUBLIC_APP_URL || "https://app.resend-it.com"}/p/${result.public_id}`

          setShareUrl(url)
        } else {
          console.error("Failed to ensure profile has public_id:", result.error)
          toast.error("Error preparing share link", {
            description: "There was a problem generating your share link. Please try again.",
          })
        }
      } catch (error) {
        console.error("Error in handleOpenChange:", error)
        toast.error("Error", {
          description: "An unexpected error occurred. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }
  }

  // Copy link to clipboard
  const copyLink = async () => {
    if (!shareUrl) {
      toast.error("Error", {
        description: "Share link is not ready yet. Please try again.",
      })
      return
    }

    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success("Link copied", {
        description: "Profile link copied to clipboard",
      })
    } catch (error) {
      console.error("Failed to copy link:", error)
      toast.error("Failed to copy", {
        description: "Please try again or copy the link manually",
      })
    }
  }

  // Share via text message
  const shareViaText = () => {
    if (!shareUrl) return
    const smsUrl = `sms:?body=Check out my digital business card: ${shareUrl}`
    window.open(smsUrl, "_blank")
  }

  // Share via email
  const shareViaEmail = () => {
    if (!shareUrl) return
    const subject = `${userData.full_name}'s Digital Business Card`
    const body = `Check out my digital business card: ${shareUrl}`
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailtoUrl, "_blank")
  }

  // Share via NFC
  const handleNfcShare = async () => {
    if (!isNfcSupported()) {
      toast.error("NFC not supported", {
        description: "Your device doesn't support NFC sharing",
      })
      return
    }

    try {
      setIsNfcLoading(true)
      setNfcDialogOpen(true)

      const vCardData = generateVCard(userData)

      // Add a timeout to automatically close the NFC dialog if it takes too long
      const nfcTimeout = setTimeout(() => {
        setIsNfcLoading(false)
        setNfcDialogOpen(false)
        toast.error("NFC timeout", {
          description: "NFC sharing took too long. Please try again.",
        })
      }, 10000)

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
        setNfcDialogOpen(false)
      }
    } catch (error) {
      console.error("NFC sharing error:", error)
      toast.error("NFC error", {
        description: "Failed to activate NFC sharing",
      })
      setNfcDialogOpen(false)
    } finally {
      setIsNfcLoading(false)
    }
  }

  // Share via LinkedIn
  const shareViaLinkedIn = () => {
    if (!shareUrl) return
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    window.open(linkedInUrl, "_blank")
  }

  // Share via WhatsApp
  const shareViaWhatsApp = () => {
    if (!shareUrl) return
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`Check out my digital business card: ${shareUrl}`)}`
    window.open(whatsappUrl, "_blank")
  }

  // Share via Facebook
  const shareViaFacebook = () => {
    if (!shareUrl) return
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    window.open(facebookUrl, "_blank")
  }

  // Use Web Share API for "Send another way"
  const shareAnotherWay = async () => {
    if (!shareUrl) return
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${userData.full_name}'s Digital Business Card`,
          text: `Check out my digital business card`,
          url: shareUrl,
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    } else {
      toast.error("Sharing not supported", {
        description: "Your browser doesn't support the Web Share API",
      })
    }
  }

  // Save QR code to photos
  const saveQrCode = () => {
    if (!shareUrl || !qrCodeRef) {
      toast.error("Error", {
        description: "QR code is not ready yet. Please try again.",
      })
      return
    }

    try {
      // Convert SVG to a data URL
      const svgData = new XMLSerializer().serializeToString(qrCodeRef)
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })

      // Create a URL for the blob
      const DOMURL = window.URL || window.webkitURL || window
      const url = DOMURL.createObjectURL(svgBlob)

      // Create an image to draw to canvas
      const img = new Image()
      img.onload = () => {
        // Create a canvas
        const canvas = document.createElement("canvas")
        canvas.width = img.width
        canvas.height = img.height

        // Draw the image to the canvas
        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.drawImage(img, 0, 0)

          // Get the data URL from the canvas
          const pngUrl = canvas.toDataURL("image/png")

          // Save the PNG
          saveAs(pngUrl, `${userData.full_name.replace(/\s+/g, "-")}-qr-code.png`)

          // Clean up
          DOMURL.revokeObjectURL(url)
        }
      }
      img.src = url
    } catch (error) {
      console.error("Error saving QR code:", error)
      toast.error("Error", {
        description: "Failed to save QR code. Please try again.",
      })
    }
  }

  // Share QR code
  const shareQrCode = async () => {
    if (!shareUrl) return

    if (navigator.share) {
      try {
        // Just share the URL if we can't share files
        await navigator.share({
          title: `${userData.full_name}'s Digital Business Card`,
          text: `Check out my digital business card`,
          url: shareUrl,
        })
      } catch (error) {
        console.error("Error sharing QR code:", error)
        // Fallback to download if sharing fails
        saveQrCode()
      }
    } else {
      // Fallback to download if Web Share API is not supported
      saveQrCode()
    }
  }

  // Save to wallet (Apple Wallet or Google Pay)
  const saveToWallet = () => {
    // This is a placeholder - actual implementation would require creating a .pkpass file for Apple Wallet
    // or a Google Pay pass, which requires backend integration with Apple/Google
    toast("Coming soon", {
      description: "Wallet integration is coming soon",
    })
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2 bg-transparent">
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Share Your Business Card</DialogTitle>
            <DialogDescription>Choose how you want to share your digital business card</DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="py-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Preparing your share link...</p>
            </div>
          ) : (
            <div className="overflow-y-auto pr-1 max-h-[calc(90vh-10rem)]">
              {shareUrl && (
                <div className="p-3 bg-muted rounded-md mb-2 break-all">
                  <p className="text-sm font-mono">{shareUrl}</p>
                </div>
              )}

              {shareUrl && (
                <div className="flex justify-center mb-4">
                  <div className="bg-white p-2 rounded-lg shadow-md qr-code-canvas">
                    <QRCodeSVG value={shareUrl} size={200} ref={setQrCodeRef} />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 py-4">
                <div
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent cursor-pointer"
                  onClick={copyLink}
                >
                  <div className="flex items-center gap-3">
                    <Copy className="h-5 w-5 text-muted-foreground" />
                    <span>Copy link</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      copyLink()
                    }}
                  >
                    Copy
                  </Button>
                </div>

                <div
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent cursor-pointer"
                  onClick={shareViaText}
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5 text-muted-foreground" />
                    <span>Text your card</span>
                  </div>
                  <Button variant="ghost" size="sm">
                    Send
                  </Button>
                </div>

                <div
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent cursor-pointer"
                  onClick={shareViaEmail}
                >
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <span>Email your card</span>
                  </div>
                  <Button variant="ghost" size="sm">
                    Send
                  </Button>
                </div>

                <div
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent cursor-pointer"
                  onClick={handleNfcShare}
                >
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-5 w-5 text-muted-foreground" />
                    <span>Send via NFC</span>
                  </div>
                  <Button variant="ghost" size="sm" disabled={isNfcLoading}>
                    {isNfcLoading ? "Activating..." : "Send"}
                  </Button>
                </div>

                <div
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent cursor-pointer"
                  onClick={shareViaLinkedIn}
                >
                  <div className="flex items-center gap-3">
                    <Linkedin className="h-5 w-5 text-muted-foreground" />
                    <span>Send via LinkedIn</span>
                  </div>
                  <Button variant="ghost" size="sm">
                    Send
                  </Button>
                </div>

                <div
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent cursor-pointer"
                  onClick={shareViaWhatsApp}
                >
                  <div className="flex items-center gap-3">
                    <WhatsApp className="h-5 w-5 text-muted-foreground" />
                    <span>Send via WhatsApp</span>
                  </div>
                  <Button variant="ghost" size="sm">
                    Send
                  </Button>
                </div>

                <div
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent cursor-pointer"
                  onClick={shareAnotherWay}
                >
                  <div className="flex items-center gap-3">
                    <Send className="h-5 w-5 text-muted-foreground" />
                    <span>Send another way</span>
                  </div>
                  <Button variant="ghost" size="sm">
                    Send
                  </Button>
                </div>

                <div
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent cursor-pointer"
                  onClick={shareViaFacebook}
                >
                  <div className="flex items-center gap-3">
                    <Facebook className="h-5 w-5 text-muted-foreground" />
                    <span>Post to Facebook</span>
                  </div>
                  <Button variant="ghost" size="sm">
                    Post
                  </Button>
                </div>

                <div
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent cursor-pointer"
                  onClick={shareViaLinkedIn}
                >
                  <div className="flex items-center gap-3">
                    <Linkedin className="h-5 w-5 text-muted-foreground" />
                    <span>Post to LinkedIn</span>
                  </div>
                  <Button variant="ghost" size="sm">
                    Post
                  </Button>
                </div>

                <div
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent cursor-pointer"
                  onClick={saveQrCode}
                >
                  <div className="flex items-center gap-3">
                    <QrCode className="h-5 w-5 text-muted-foreground" />
                    <span>Save QR code</span>
                  </div>
                  <Button variant="ghost" size="sm" disabled={!shareUrl || isLoading}>
                    {isLoading ? "Generating..." : "Save"}
                  </Button>
                </div>

                <div
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent cursor-pointer"
                  onClick={shareQrCode}
                >
                  <div className="flex items-center gap-3">
                    <QrCode className="h-5 w-5 text-muted-foreground" />
                    <span>Send QR code</span>
                  </div>
                  <Button variant="ghost" size="sm" disabled={!shareUrl || isLoading}>
                    Send
                  </Button>
                </div>

                <div
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent cursor-pointer"
                  onClick={saveToWallet}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <span>Save to wallet</span>
                  </div>
                  <Button variant="ghost" size="sm">
                    Save
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Separate NFC Dialog */}
      <Dialog open={nfcDialogOpen} onOpenChange={setNfcDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>NFC Sharing</DialogTitle>
            <DialogDescription>
              Hold your phone near another NFC-enabled device to share your contact information.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 text-center">
            {isNfcLoading ? (
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

          <div className="flex justify-center">
            <Button variant="outline" onClick={() => setNfcDialogOpen(false)} className="w-full">
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
