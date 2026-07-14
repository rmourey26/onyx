"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Loader2 } from "lucide-react"
import type { User } from "@supabase/supabase-js"

interface FileUploaderProps {
  user: User
  embeddingModels: any[]
}

export function FileUploader({ user, embeddingModels }: FileUploaderProps) {
  const [files, setFiles] = useState<File[]>([])
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedModel, setSelectedModel] = useState("")
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)

    // Here you would implement the actual file upload and embedding creation
    // This would typically involve:
    // 1. Uploading the file to storage
    // 2. Processing the file to create embeddings
    // 3. Storing the embeddings in the database

    setTimeout(() => {
      setIsUploading(false)
      setFiles([])
      setName("")
      setDescription("")
    }, 2000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Embedding Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter a name for this embedding"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter a description for this embedding"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="model">Embedding Model</Label>
        <Select value={selectedModel} onValueChange={setSelectedModel} required>
          <SelectTrigger id="model">
            <SelectValue placeholder="Select an embedding model" />
          </SelectTrigger>
          <SelectContent>
            {embeddingModels.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                {model.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="file">Upload File</Label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Input
            id="file"
            type="file"
            onChange={handleFileChange}
            className="hidden"
            multiple
            accept=".pdf,.doc,.docx,.txt,.md"
          />
          <Label htmlFor="file" className="cursor-pointer flex flex-col items-center">
            <Upload className="h-10 w-10 text-gray-400 mb-2" />
            <span className="text-sm font-medium">
              {files.length > 0 ? `${files.length} file(s) selected` : "Click to upload or drag and drop"}
            </span>
            <span className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX, TXT, MD up to 100MB</span>
          </Label>
          {files.length > 0 && (
            <div className="mt-4">
              <ul className="text-sm text-left">
                {files.map((file, index) => (
                  <li key={index} className="truncate">
                    {file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isUploading || files.length === 0 || !name || !selectedModel}>
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>Upload and Create Embeddings</>
          )}
        </Button>
      </div>
    </form>
  )
}
