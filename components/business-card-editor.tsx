"use client"

import type React from "react"

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
import { updateProfile } from "@/app/actions/profile"
import { toast } from "sonner"
import { ImageUpload } from "@/components/image-upload"

interface BusinessCardEditorProps {
  userId: string
  initialData: {
    full_name: string
    company: string
    job_title?: string
    email: string
    website: string
    linkedin_url?: string
    avatar_url?: string
    company_logo_url?: string
    xhandle?: string
  }
  onUpdate: () => void
}

export function BusinessCardEditor({ userId, initialData, onUpdate }: BusinessCardEditorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: initialData.full_name || "",
    company: initialData.company || "",
    job_title: initialData.job_title || "",
    email: initialData.email || "",
    website: initialData.website || "",
    linkedin_url: initialData.linkedin_url || "",
    avatar_url: initialData.avatar_url || "",
    company_logo_url: initialData.company_logo_url || "",
    xhandle: initialData.xhandle || "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAvatarUpload = (url: string) => {
    setFormData((prev) => ({ ...prev, avatar_url: url }))
  }

  const handleLogoUpload = (url: string) => {
    setFormData((prev) => ({ ...prev, company_logo_url: url }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await updateProfile({
        id: userId,
        ...formData,
      })

      if (result.success) {
        toast.success("Profile updated", {
          description: "Your business card has been updated successfully.",
        })
        setIsOpen(false)
        onUpdate()
      } else {
        toast.error("Update failed", {
          description: result.error || "Failed to update profile. Please try again.",
        })
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Update failed", {
        description: "An unexpected error occurred. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10 absolute top-4 right-4 z-50 pointer-events-auto"
          type="button"
          aria-haspopup="dialog"
          aria-expanded="false"
          aria-controls="radix-:Rqb9utlb:"
          data-state="closed"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            class="lucide lucide-pen h-4 w-4"
          >
            <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"></path>
          </svg>
          <span class="sr-only">Edit Business Card</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Edit Business Card</DialogTitle>
          <DialogDescription>Update your business card information.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <label htmlFor="full_name" className="text-sm font-medium">
                Full Name
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                value={formData.full_name}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="job_title" className="text-sm font-medium">
                Job Title
              </label>
              <input
                id="job_title"
                name="job_title"
                type="text"
                value={formData.job_title}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="company" className="text-sm font-medium">
                Company
              </label>
              <input
                id="company"
                name="company"
                type="text"
                value={formData.company}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="website" className="text-sm font-medium">
                Website
              </label>
              <input
                id="website"
                name="website"
                type="text"
                value={formData.website}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="linkedin_url" className="text-sm font-medium">
                LinkedIn
              </label>
              <input
                id="linkedin_url"
                name="linkedin_url"
                type="text"
                value={formData.linkedin_url}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="xhandle" className="text-sm font-medium">
                X Handle
              </label>
              <input
                id="xhandle"
                name="xhandle"
                type="text"
                value={formData.xhandle}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Profile Picture</label>
              <ImageUpload value={formData.avatar_url} onChange={handleAvatarUpload} bucket="avatars" userId={userId} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Company Logo</label>
              <ImageUpload
                value={formData.company_logo_url}
                onChange={handleLogoUpload}
                bucket="company-logos"
                userId={userId}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
