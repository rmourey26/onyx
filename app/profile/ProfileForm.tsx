"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { updateProfile } from "../actions/profile"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageUpload } from "@/components/image-upload"

interface ProfileFormProps {
  initialData: {
    full_name?: string | null
    username?: string | null
    email?: string | null
    company?: string | null
    job_title?: string | null
    website?: string | null
    linkedin_url?: string | null
    avatar_url?: string | null
    company_logo_url?: string | null
    waddress?: string | null
    xhandle?: string | null
  }
  userId: string
}

export default function ProfileForm({ initialData, userId }: ProfileFormProps) {
  // Ensure we have valid initial data with fallbacks
  const safeInitialData = {
    full_name: initialData?.full_name || "",
    username: initialData?.username || "",
    email: initialData?.email || "",
    company: initialData?.company || "",
    job_title: initialData?.job_title || "",
    website: initialData?.website || "",
    linkedin_url: initialData?.linkedin_url || "",
    avatar_url: initialData?.avatar_url || "",
    company_logo_url: initialData?.company_logo_url || "",
    waddress: initialData?.waddress || "",
    xhandle: initialData?.xhandle || "",
  }

  const [formData, setFormData] = useState(safeInitialData)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (field: string) => (url: string) => {
    setFormData((prev) => ({ ...prev, [field]: url }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simple client-side validation
      if (!formData.full_name || !formData.email) {
        throw new Error("Full name and email are required")
      }

      // Clean up website URL if needed
      let websiteValue = formData.website
      if (websiteValue && !websiteValue.startsWith("http")) {
        websiteValue = `https://${websiteValue}`
      }

      // Clean up LinkedIn URL if needed
      let linkedinValue = formData.linkedin_url
      if (linkedinValue && !linkedinValue.startsWith("http")) {
        linkedinValue = `https://${linkedinValue}`
      }

      // Prepare data for submission
      const dataToSubmit = {
        id: userId, // Add the ID field to match the server function's expectation
        ...formData,
        website: websiteValue,
        linkedin_url: linkedinValue,
      }

      console.log("Submitting profile data:", dataToSubmit)

      // Update the function call to pass a single object with the id included
      const result = await updateProfile(dataToSubmit)

      if (result.success) {
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully.",
        })
        router.refresh()
      } else {
        throw new Error(result.error || "Failed to update profile")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="advanced">Additional Info</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            <TabsContent value="basic" className="space-y-6">
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input id="full_name" name="full_name" value={formData.full_name} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="username">Username</Label>
                <Input id="username" name="username" value={formData.username} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                />
              </div>

              <ImageUpload
                id="avatar_url"
                value={formData.avatar_url}
                onChange={handleImageChange("avatar_url")}
                label="Profile Avatar"
                helpText="Upload or provide a URL to your profile picture"
                bucketName="avatars"
                folderPath={userId}
              />

              <div>
                <Label htmlFor="company">Company</Label>
                <Input id="company" name="company" value={formData.company} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="job_title">Job Title</Label>
                <Input
                  id="job_title"
                  name="job_title"
                  value={formData.job_title}
                  onChange={handleChange}
                  placeholder="Software Engineer"
                />
              </div>

              <ImageUpload
                id="company_logo_url"
                value={formData.company_logo_url}
                onChange={handleImageChange("company_logo_url")}
                label="Company Logo"
                helpText="Upload or provide a URL to your company logo"
                bucketName="company-logos"
                folderPath={userId}
              />

              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="example.com"
                />
                <p className="text-xs text-gray-500 mt-1">Include https:// or we'll add it for you</p>
              </div>
              <div>
                <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                <Input
                  id="linkedin_url"
                  name="linkedin_url"
                  value={formData.linkedin_url}
                  onChange={handleChange}
                  placeholder="linkedin.com/in/yourprofile"
                />
                <p className="text-xs text-gray-500 mt-1">Include https:// or we'll add it for you</p>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6">
              <div>
                <Label htmlFor="waddress">Wallet Address</Label>
                <Input
                  id="waddress"
                  name="waddress"
                  value={formData.waddress}
                  onChange={handleChange}
                  placeholder="0x..."
                />
              </div>
              <div>
                <Label htmlFor="xhandle">X Handle</Label>
                <Input
                  id="xhandle"
                  name="xhandle"
                  value={formData.xhandle}
                  onChange={handleChange}
                  placeholder="@username"
                />
              </div>
            </TabsContent>

            <Button type="submit" disabled={isLoading} className="mt-6">
              {isLoading ? "Updating..." : "Update Profile"}
            </Button>
          </form>
        </Tabs>
      </CardContent>
    </Card>
  )
}
