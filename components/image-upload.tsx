"use client"

import type React from "react"

import { useState, useRef } from "react"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase"

interface ImageUploadProps {
  id: string
  value: string
  onChange: (url: string) => void
  label: string
  helpText?: string
  bucketName?: string
  folderPath?: string
}

export function ImageUpload({
  id,
  value,
  onChange,
  label,
  helpText,
  bucketName = "avatars",
  folderPath = "",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>("upload")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadError(null)

    try {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        throw new Error("Please upload an image file (JPEG, PNG, etc.)")
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("Image size should be less than 5MB")
      }

      const supabase = createClient()

      // Generate a unique file name
      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
      const filePath = folderPath ? `${folderPath}/${fileName}` : fileName

      // Upload the file to Supabase Storage
      const { data, error } = await supabase.storage.from(bucketName).upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

      if (error) throw error

      // Get the public URL
      const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(filePath)

      // Update the form with the new URL
      onChange(urlData.publicUrl)
    } catch (error) {
      console.error("Error uploading image:", error)
      setUploadError(error instanceof Error ? error.message : "Failed to upload image")
    } finally {
      setIsUploading(false)
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()

    const files = e.dataTransfer.files
    if (files.length > 0 && fileInputRef.current) {
      fileInputRef.current.files = files
      handleFileChange({ target: { files } } as React.ChangeEvent<HTMLInputElement>)
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload Image</TabsTrigger>
          <TabsTrigger value="url">Image URL</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <div
            className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            {value && !isUploading ? (
              <div className="relative w-full h-40 mb-4">
                <Image src={value || "/placeholder.svg"} alt={label} fill className="object-contain rounded-md" />
              </div>
            ) : (
              <Upload className="h-10 w-10 text-gray-400 mb-2" />
            )}

            {isUploading ? (
              <div className="flex flex-col items-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="text-sm text-gray-500 mt-2">Uploading...</p>
              </div>
            ) : (
              <>
                <p className="text-sm font-medium">{value ? "Change image" : "Click to upload or drag and drop"}</p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG or GIF (max. 5MB)</p>
              </>
            )}

            <input
              ref={fileInputRef}
              id={`${id}-upload`}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </div>

          {uploadError && <p className="text-sm text-red-500">{uploadError}</p>}
        </TabsContent>

        <TabsContent value="url">
          <Input id={id} value={value || ""} onChange={handleUrlChange} placeholder="https://example.com/image.jpg" />
          {helpText && <p className="text-xs text-gray-500 mt-1">{helpText}</p>}

          {value && (
            <div className="mt-4 relative w-full h-40">
              <Image
                src={value || "/placeholder.svg"}
                alt={label}
                fill
                className="object-contain rounded-md"
                onError={() => {
                  // Handle image load error
                  console.log("Error loading image from URL")
                }}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
