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
  DialogFooter,
} from "@/components/ui/dialog"
import { Paintbrush } from "lucide-react"
import { HexColorPicker } from "react-colorful"
import { updateProfileStyle } from "@/app/actions/profile"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ColorPickerModalProps {
  profileId: string
  initialColor: string
  onColorChange: (color: string) => void
  initialTextColor?: string
  initialPrimaryColor?: string
}

export function ColorPickerModal({
  profileId,
  initialColor,
  onColorChange,
  initialTextColor = "#333333",
  initialPrimaryColor = "#3b82f6",
}: ColorPickerModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [backgroundColor, setBackgroundColor] = useState(initialColor)
  const [textColor, setTextColor] = useState(initialTextColor)
  const [primaryColor, setPrimaryColor] = useState(initialPrimaryColor)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("background")

  const handleColorChange = (newColor: string) => {
    if (activeTab === "background") {
      setBackgroundColor(newColor)
      onColorChange(newColor)
    } else if (activeTab === "text") {
      setTextColor(newColor)
    } else if (activeTab === "primary") {
      setPrimaryColor(newColor)
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await updateProfileStyle(profileId, {
        backgroundColor,
        textColor,
        primaryColor,
      })
      toast.success("Colors updated", {
        description: "Your business card colors have been updated successfully.",
      })
      setIsOpen(false)
    } catch (error) {
      console.error("Error updating colors:", error)
      toast.error("Error", {
        description: "Failed to update colors. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Get the current color based on active tab
  const getCurrentColor = () => {
    switch (activeTab) {
      case "background":
        return backgroundColor
      case "text":
        return textColor
      case "primary":
        return primaryColor
      default:
        return backgroundColor
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Paintbrush className="h-4 w-4" />
          <span>Edit Colors</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Card Colors</DialogTitle>
          <DialogDescription>Customize the colors of your business card.</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="background">Background</TabsTrigger>
            <TabsTrigger value="text">Text</TabsTrigger>
            <TabsTrigger value="primary">Primary</TabsTrigger>
          </TabsList>

          <TabsContent value="background" className="space-y-4">
            <div className="text-sm">Choose the background color of your card</div>
          </TabsContent>

          <TabsContent value="text" className="space-y-4">
            <div className="text-sm">Choose the color for most text on your card</div>
          </TabsContent>

          <TabsContent value="primary" className="space-y-4">
            <div className="text-sm">Choose the color for your name and highlights</div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-center py-4">
          <HexColorPicker color={getCurrentColor()} onChange={handleColorChange} />
        </div>

        <div className="flex items-center justify-between mt-2">
          <div
            className="w-12 h-12 rounded-md border"
            style={{ backgroundColor: getCurrentColor() }}
            aria-label="Selected color preview"
          />
          <div className="text-sm font-mono">{getCurrentColor()}</div>
        </div>

        <DialogFooter className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
