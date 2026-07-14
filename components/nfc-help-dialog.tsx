"use client"

import { HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useState } from "react"

export function NfcHelpDialog() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="ml-1">
          <HelpCircle className="h-4 w-4" />
          <span className="sr-only">NFC Help</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>About NFC Sharing</DialogTitle>
          <DialogDescription>
            Near Field Communication (NFC) allows you to share your contact information by tapping phones.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <h3 className="font-medium mb-2">Requirements:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>NFC is currently only supported in Chrome on Android devices</li>
              <li>Both devices must have NFC hardware and have it enabled</li>
              <li>The receiving device should be able to read NFC tags</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-2">How to use:</h3>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Make sure NFC is enabled in your device settings</li>
              <li>Click "Send via NFC" in the share menu</li>
              <li>Hold your phone near the other device (back-to-back)</li>
              <li>The other device should detect your contact information</li>
            </ol>
          </div>

          <div>
            <h3 className="font-medium mb-2">Troubleshooting:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>If sharing fails, make sure both devices have NFC enabled</li>
              <li>Try moving the devices closer together or adjusting their position</li>
              <li>Some phone cases may interfere with NFC - try removing them</li>
              <li>If you're still having issues, try using another sharing method</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
