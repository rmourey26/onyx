"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, Printer } from "lucide-react"

interface ShippingLabelModalProps {
  isOpen: boolean
  onClose: () => void
  labelImage: string | null
  trackingNumber: string
}

export function ShippingLabelModal({ isOpen, onClose, labelImage, trackingNumber }: ShippingLabelModalProps) {
  const handlePrint = () => {
    if (!labelImage) return
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Print Shipping Label</title></head>
          <body style="margin: 0; padding: 0;">
            <img src="data:image/png;base64,${labelImage}" style="width: 100%;" onload="window.print(); window.close();" />
          </body>
        </html>
      `)
      printWindow.document.close()
    }
  }

  const handleDownload = () => {
    if (!labelImage) return
    const link = document.createElement("a")
    link.href = `data:image/png;base64,${labelImage}`
    link.download = `shipping-label-${trackingNumber}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Shipping Label Generated</DialogTitle>
          <DialogDescription>
            Your shipping label for tracking number <strong>{trackingNumber}</strong> is ready.
          </DialogDescription>
        </DialogHeader>
        <div className="my-4 p-4 border rounded-md flex justify-center bg-white">
          {labelImage ? (
            <img
              src={`data:image/png;base64,${labelImage}`}
              alt={`Shipping label for ${trackingNumber}`}
              className="max-w-full h-auto"
            />
          ) : (
            <p className="text-muted-foreground">Label image is not available.</p>
          )}
        </div>
        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            <Button onClick={handlePrint} disabled={!labelImage}>
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
            <Button onClick={handleDownload} disabled={!labelImage}>
              <Download className="mr-2 h-4 w-4" /> Download
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
