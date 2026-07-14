"use client"

import { Button } from "@/components/ui/button"
import { UserPlus } from "lucide-react"
import { generateVCard } from "@/lib/nfc"
import { saveAs } from "file-saver"
import { toast } from "@/components/ui/use-toast"

interface SaveContactButtonProps {
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

export function SaveContactButton({ userData }: SaveContactButtonProps) {
  const handleSaveContact = () => {
    try {
      // Generate vCard data
      const vCardData = generateVCard(userData)

      // Create a blob from the vCard data
      const blob = new Blob([vCardData], { type: "text/vcard;charset=utf-8" })

      // Create a safe filename
      const filename = `${userData.full_name.replace(/\s+/g, "-")}.vcf`

      // Save the file
      saveAs(blob, filename)

      toast({
        title: "Contact saved",
        description: "The contact information has been downloaded. Open the file to add to your contacts.",
      })
    } catch (error) {
      console.error("Error saving contact:", error)
      toast({
        title: "Error saving contact",
        description: "There was an error saving the contact information. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Button onClick={handleSaveContact} className="gap-2">
      <UserPlus className="h-4 w-4" />
      <span>Save Contact</span>
    </Button>
  )
}
