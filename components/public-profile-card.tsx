"use client"

import { useState } from "react"
import Image from "next/image"
import { Mail, Globe, Linkedin, Twitter } from "lucide-react"
import { generateVCard } from "@/lib/nfc"
import { saveAs } from "file-saver"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface PublicProfileCardProps {
  profile: {
    full_name: string
    company: string
    job_title?: string
    email: string
    website: string
    linkedin_url?: string
    avatar_url?: string
    company_logo_url?: string
    xhandle?: string
    card_style?: {
      backgroundColor: string
      textColor: string
      primaryColor: string
    }
  }
}

export function PublicProfileCard({ profile }: PublicProfileCardProps) {
  const [isVertical, setIsVertical] = useState(false)
  const { toast } = useToast()

  // Default card style if not provided in profile
  const defaultStyle = {
    backgroundColor: "#ffffff",
    textColor: "#333333",
    primaryColor: "#3b82f6",
  }

  const cardStyle = profile.card_style || defaultStyle

  // Function to download vCard
  const downloadVCard = () => {
    try {
      // Generate vCard data
      const vCardData = generateVCard({
        full_name: profile.full_name || "",
        company: profile.company || "",
        job_title: profile.job_title || "",
        email: profile.email || "",
        website: profile.website || "",
        linkedin_url: profile.linkedin_url || "",
        xhandle: profile.xhandle || "",
      })

      // Create a blob from the vCard data
      const blob = new Blob([vCardData], { type: "text/vcard;charset=utf-8" })

      // Create a safe filename
      const filename = `${profile.full_name.replace(/\s+/g, "-")}.vcf`

      // Save the file
      saveAs(blob, filename)

      toast({
        title: "vCard downloaded",
        description: "Contact information has been saved as a vCard file",
      })
    } catch (error) {
      console.error("Error saving contact:", error)
      toast({
        title: "Error",
        description: "Failed to download vCard. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Render horizontal business card layout
  const renderHorizontalCard = () => (
    <div className="w-full max-w-[890px] mx-auto aspect-[890/510] rounded-lg shadow-lg relative overflow-hidden">
      {/* Background layer */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundColor: cardStyle.backgroundColor,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Content layer - all elements will be on top of the background */}
      <div className="absolute inset-0 z-10">
        {/* Company Logo */}
        {profile.company_logo_url && (
          <div className="absolute top-[3.9%] right-[2.2%] w-[16.9%] h-[29.4%] z-10">
            <Image
              src={profile.company_logo_url || "/placeholder.svg"}
              alt="Company Logo"
              fill
              className="object-contain"
            />
          </div>
        )}

        {/* Left side content */}
        <div className="absolute top-0 left-0 h-full p-[5.6%] flex flex-col justify-center">
          {/* Avatar */}
          {profile.avatar_url && (
            <div className="mb-[5.6%]">
              <div className="relative w-[120px] h-[120px] sm:w-[100px] sm:h-[100px] xs:w-[80px] xs:h-[80px]">
                <Image
                  src={profile.avatar_url || "/placeholder.svg"}
                  alt="User Avatar"
                  fill
                  className="rounded-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Contact Information */}
          <div className="space-y-[3.9%]">
            <h2 className="text-4xl font-bold sm:text-3xl xs:text-2xl" style={{ color: cardStyle.primaryColor }}>
              {profile.full_name}
            </h2>

            {/* Job Title */}
            {profile.job_title && (
              <div>
                <p className="text-2xl sm:text-xl xs:text-lg" style={{ color: cardStyle.textColor }}>
                  {profile.job_title}
                </p>
              </div>
            )}

            {/* Company */}
            <div className="mb-2">
              <p className="text-2xl sm:text-xl xs:text-lg" style={{ color: cardStyle.textColor }}>
                {profile.company}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Mail className="w-5 h-5 flex-shrink-0" style={{ color: cardStyle.textColor }} />
              <p className="text-lg sm:text-base xs:text-sm break-all" style={{ color: cardStyle.textColor }}>
                {profile.email}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5 flex-shrink-0" style={{ color: cardStyle.textColor }} />
              <p className="text-lg sm:text-base xs:text-sm break-all" style={{ color: cardStyle.textColor }}>
                {profile.website}
              </p>
            </div>

            {/* LinkedIn */}
            {profile.linkedin_url && (
              <div className="flex items-center space-x-2">
                <Linkedin className="w-5 h-5 flex-shrink-0" style={{ color: cardStyle.textColor }} />
                <p className="text-lg sm:text-base xs:text-sm break-all" style={{ color: cardStyle.textColor }}>
                  {profile.linkedin_url}
                </p>
              </div>
            )}

            {/* X Handle */}
            {profile.xhandle && (
              <div className="flex items-center space-x-2">
                <Twitter className="w-5 h-5 flex-shrink-0" style={{ color: cardStyle.textColor }} />
                <p className="text-lg sm:text-base xs:text-sm" style={{ color: cardStyle.textColor }}>
                  {profile.xhandle}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  // Render vertical business card layout
  const renderVerticalCard = () => (
    <div className="w-full max-w-[510px] mx-auto aspect-[510/890] rounded-lg shadow-lg relative overflow-hidden">
      {/* Background layer */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundColor: cardStyle.backgroundColor,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Content layer - all elements will be on top of the background */}
      <div className="absolute inset-0 z-10">
        {/* Company Logo Banner */}
        {profile.company_logo_url && (
          <div className="relative w-full h-[22.5%] flex items-center justify-center overflow-hidden z-10">
            <Image
              src={profile.company_logo_url || "/placeholder.svg"}
              alt="Company Logo"
              fill
              className="object-contain"
              style={{ objectPosition: "center" }}
            />
            {/* Gradient overlay for better text visibility */}
            <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/10 to-black/50"></div>
          </div>
        )}

        {/* Avatar overlaying the banner */}
        {profile.avatar_url && (
          <div className="absolute top-[11.2%] left-[7.8%] w-[31.4%] h-[18%] rounded-full border-4 border-white overflow-hidden shadow-lg z-20">
            <Image src={profile.avatar_url || "/placeholder.svg"} alt="User Avatar" fill className="object-cover" />
          </div>
        )}

        {/* Contact Information */}
        <div className="absolute top-[31.5%] left-0 w-full px-[7.8%] space-y-[2.5%] z-10">
          <h2 className="text-4xl font-bold sm:text-3xl xs:text-2xl" style={{ color: cardStyle.primaryColor }}>
            {profile.full_name}
          </h2>

          {/* Job Title */}
          {profile.job_title && (
            <div>
              <p className="text-2xl sm:text-xl xs:text-lg" style={{ color: cardStyle.textColor }}>
                {profile.job_title}
              </p>
            </div>
          )}

          {/* Company */}
          <div className="mb-4">
            <p className="text-2xl sm:text-xl xs:text-lg" style={{ color: cardStyle.textColor }}>
              {profile.company}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Mail className="w-5 h-5 flex-shrink-0" style={{ color: cardStyle.textColor }} />
            <p className="text-lg sm:text-base xs:text-sm break-all" style={{ color: cardStyle.textColor }}>
              {profile.email}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 flex-shrink-0" style={{ color: cardStyle.textColor }} />
            <p className="text-lg sm:text-base xs:text-sm break-all" style={{ color: cardStyle.textColor }}>
              {profile.website}
            </p>
          </div>

          {/* LinkedIn */}
          {profile.linkedin_url && (
            <div className="flex items-center space-x-2">
              <Linkedin className="w-5 h-5 flex-shrink-0" style={{ color: cardStyle.textColor }} />
              <p className="text-lg sm:text-base xs:text-sm break-all" style={{ color: cardStyle.textColor }}>
                {profile.linkedin_url}
              </p>
            </div>
          )}

          {/* X Handle */}
          {profile.xhandle && (
            <div className="flex items-center space-x-2">
              <Twitter className="w-5 h-5 flex-shrink-0" style={{ color: cardStyle.textColor }} />
              <p className="text-lg sm:text-base xs:text-sm" style={{ color: cardStyle.textColor }}>
                {profile.xhandle}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Layout toggle */}
      <div className="flex items-center space-x-2 mb-4">
        <span className="text-sm font-medium">Layout:</span>
        <button
          className={`px-3 py-1 rounded-md ${!isVertical ? "bg-primary text-white" : "bg-gray-200 text-gray-800"}`}
          onClick={() => setIsVertical(false)}
        >
          Horizontal
        </button>
        <button
          className={`px-3 py-1 rounded-md ${isVertical ? "bg-primary text-white" : "bg-gray-200 text-gray-800"}`}
          onClick={() => setIsVertical(true)}
        >
          Vertical
        </button>
      </div>

      {/* Card container with responsive padding */}
      <div className="w-full px-3 sm:px-0">
        {/* Render the appropriate card layout */}
        {isVertical ? renderVerticalCard() : renderHorizontalCard()}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap justify-center gap-4 mt-2">
        <Button onClick={downloadVCard}>Download vCard</Button>
      </div>
    </div>
  )
}
