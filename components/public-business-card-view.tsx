"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Mail, Globe, Linkedin, Twitter } from "lucide-react"
import { Toggle } from "@/components/ui/toggle"
import { SaveContactButton } from "@/components/save-contact-button"
import { generateVCard } from "@/lib/nfc"
import { saveAs } from "file-saver"

interface PublicBusinessCardViewProps {
  card: any
}

export function PublicBusinessCardView({ card }: PublicBusinessCardViewProps) {
  const [isVertical, setIsVertical] = useState(false)

  // Extract user data from the card
  const userData = card.profiles || {
    full_name: card.businesscard_name || "Business Card",
    company: card.company_name || "",
    email: "",
    website: card.website || "",
    avatar_url: "",
    company_logo_url: "",
  }

  // Ensure card has all required properties
  const safeCard = {
    ...card,
    style: card.style || {
      backgroundColor: "#ffffff",
      textColor: "#000000",
      primaryColor: "#3b82f6",
    },
  }

  // Function to download vCard
  const downloadVCard = () => {
    try {
      // Generate vCard data
      const vCardData = generateVCard(userData)

      // Create a blob from the vCard data
      const blob = new Blob([vCardData], { type: "text/vcard;charset=utf-8" })

      // Create a safe filename
      const filename = `${userData.full_name.replace(/\s+/g, "-")}.vcf`

      // Save the file
      saveAs(blob, filename)
    } catch (error) {
      console.error("Error saving contact:", error)
    }
  }

  // Render horizontal business card layout
  const renderHorizontalCard = () => (
    <div className="w-full max-w-[890px] mx-auto aspect-[890/510] rounded-lg shadow-lg relative overflow-hidden">
      {/* Background layer */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundColor: safeCard.style.backgroundColor,
          backgroundImage: safeCard.image_url ? `url(${safeCard.image_url})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Content layer - all elements will be on top of the background */}
      <div className="absolute inset-0 z-10">
        {/* Company Logo */}
        {userData.company_logo_url && (
          <div className="absolute top-[3.9%] right-[2.2%] w-[16.9%] h-[29.4%] z-10">
            <Image
              src={userData.company_logo_url || "/placeholder.svg"}
              alt="Company Logo"
              fill
              className="object-contain"
            />
          </div>
        )}

        {/* Left side content */}
        <div className="absolute top-0 left-0 h-full p-[5.6%] flex flex-col justify-center">
          {/* Avatar */}
          {userData.avatar_url && (
            <div className="mb-[5.6%]">
              <div className="relative w-[120px] h-[120px] sm:w-[100px] sm:h-[100px] xs:w-[80px] xs:h-[80px]">
                <Image
                  src={userData.avatar_url || "/placeholder.svg"}
                  alt="User Avatar"
                  fill
                  className="rounded-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Contact Information */}
          <div className="space-y-[3.9%]">
            <h2 className="text-4xl font-bold sm:text-3xl xs:text-2xl" style={{ color: safeCard.style.primaryColor }}>
              {userData.full_name}
            </h2>

            {/* Job Title */}
            {userData.job_title && (
              <div>
                <p className="text-2xl sm:text-xl xs:text-lg" style={{ color: safeCard.style.textColor }}>
                  {userData.job_title}
                </p>
              </div>
            )}

            {/* Company */}
            <div className="mb-2">
              <p className="text-2xl sm:text-xl xs:text-lg" style={{ color: safeCard.style.textColor }}>
                {userData.company}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Mail className="w-5 h-5 flex-shrink-0" style={{ color: safeCard.style.textColor }} />
              <p className="text-lg sm:text-base xs:text-sm break-all" style={{ color: safeCard.style.textColor }}>
                {userData.email}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5 flex-shrink-0" style={{ color: safeCard.style.textColor }} />
              <p className="text-lg sm:text-base xs:text-sm break-all" style={{ color: safeCard.style.textColor }}>
                {userData.website}
              </p>
            </div>

            {/* LinkedIn */}
            {userData.linkedin_url && (
              <div className="flex items-center space-x-2">
                <Linkedin className="w-5 h-5 flex-shrink-0" style={{ color: safeCard.style.textColor }} />
                <p className="text-lg sm:text-base xs:text-sm break-all" style={{ color: safeCard.style.textColor }}>
                  {userData.linkedin_url}
                </p>
              </div>
            )}

            {/* X Handle */}
            {userData.xhandle && (
              <div className="flex items-center space-x-2">
                <Twitter className="w-5 h-5 flex-shrink-0" style={{ color: safeCard.style.textColor }} />
                <p className="text-lg sm:text-base xs:text-sm" style={{ color: safeCard.style.textColor }}>
                  {userData.xhandle}
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
          backgroundColor: safeCard.style.backgroundColor,
          backgroundImage: safeCard.image_url ? `url(${safeCard.image_url})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Content layer - all elements will be on top of the background */}
      <div className="absolute inset-0 z-10">
        {/* Company Logo Banner */}
        {userData.company_logo_url && (
          <div className="relative w-full h-[22.5%] flex items-center justify-center overflow-hidden z-10">
            <Image
              src={userData.company_logo_url || "/placeholder.svg"}
              alt="Company Logo"
              fill
              className="object-contain"
              style={{ objectPosition: "center" }}
            />
            {/* Gradient overlay for better text visibility */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/50"></div>
          </div>
        )}

        {/* Avatar overlaying the banner */}
        {userData.avatar_url && (
          <div className="absolute top-[11.2%] left-[7.8%] w-[31.4%] h-[18%] rounded-full border-4 border-white overflow-hidden shadow-lg z-20">
            <Image src={userData.avatar_url || "/placeholder.svg"} alt="User Avatar" fill className="object-cover" />
          </div>
        )}

        {/* Contact Information */}
        <div className="absolute top-[31.5%] left-0 w-full px-[7.8%] space-y-[2.5%] z-10">
          <h2 className="text-4xl font-bold sm:text-3xl xs:text-2xl" style={{ color: safeCard.style.primaryColor }}>
            {userData.full_name}
          </h2>

          {/* Job Title */}
          {userData.job_title && (
            <div>
              <p className="text-2xl sm:text-xl xs:text-lg" style={{ color: safeCard.style.textColor }}>
                {userData.job_title}
              </p>
            </div>
          )}

          {/* Company */}
          <div className="mb-4">
            <p className="text-2xl sm:text-xl xs:text-lg" style={{ color: safeCard.style.textColor }}>
              {userData.company}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Mail className="w-5 h-5 flex-shrink-0" style={{ color: safeCard.style.textColor }} />
            <p className="text-lg sm:text-base xs:text-sm break-all" style={{ color: safeCard.style.textColor }}>
              {userData.email}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 flex-shrink-0" style={{ color: safeCard.style.textColor }} />
            <p className="text-lg sm:text-base xs:text-sm break-all" style={{ color: safeCard.style.textColor }}>
              {userData.website}
            </p>
          </div>

          {/* LinkedIn */}
          {userData.linkedin_url && (
            <div className="flex items-center space-x-2">
              <Linkedin className="w-5 h-5 flex-shrink-0" style={{ color: safeCard.style.textColor }} />
              <p className="text-lg sm:text-base xs:text-sm break-all" style={{ color: safeCard.style.textColor }}>
                {userData.linkedin_url}
              </p>
            </div>
          )}

          {/* X Handle */}
          {userData.xhandle && (
            <div className="flex items-center space-x-2">
              <Twitter className="w-5 h-5 flex-shrink-0" style={{ color: safeCard.style.textColor }} />
              <p className="text-lg sm:text-base xs:text-sm" style={{ color: safeCard.style.textColor }}>
                {userData.xhandle}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <header className="bg-white dark:bg-gray-800 shadow-sm py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Resend-It</h1>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-center mb-6">{userData.full_name}'s Business Card</h2>

          {/* Layout toggle */}
          <div className="flex items-center justify-center space-x-2 mb-6">
            <span className="text-sm font-medium">Layout:</span>
            <Toggle pressed={!isVertical} onPressedChange={() => setIsVertical(false)} aria-label="Horizontal layout">
              <span>Horizontal</span>
            </Toggle>
            <Toggle pressed={isVertical} onPressedChange={() => setIsVertical(true)} aria-label="Vertical layout">
              <span>Vertical</span>
            </Toggle>
          </div>

          {/* Card container with responsive padding */}
          <div className="w-full px-3 sm:px-0 mb-8">
            {/* Render the appropriate card layout */}
            {isVertical ? renderVerticalCard() : renderHorizontalCard()}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <SaveContactButton userData={userData} />
            <Button onClick={downloadVCard}>Download vCard</Button>
          </div>
        </div>
      </main>

      <footer className="bg-white dark:bg-gray-800 py-4 px-6 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} Resend-It. All rights reserved.</p>
      </footer>
    </div>
  )
}
