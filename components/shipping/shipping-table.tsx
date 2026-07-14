"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Package, Truck, CheckCircle, AlertCircle, Clock, XCircle, QrCode } from "lucide-react"
import { updateShippingRecord } from "@/app/actions/shipping"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import type { Shipping } from "@/lib/types/database"
import { ShippingQRModal } from "./shipping-qr-modal"

interface ShippingTableProps {
  shippingData: Shipping[]
}

export function ShippingTable({ shippingData }: ShippingTableProps) {
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [selectedShipment, setSelectedShipment] = useState<{
    trackingNumber: string
    publicId: string
  } | null>(null)

  const handleStatusUpdate = async (id: string, status: string) => {
    setIsUpdating(id)
    try {
      const result = await updateShippingRecord(id, { status })
      if (result.success) {
        toast.success(`Shipping status updated to ${status}`)
      } else {
        toast.error(result.error || "Failed to update status")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setIsUpdating(null)
    }
  }

  const openQrModal = (trackingNumber: string, publicId: string) => {
    setSelectedShipment({ trackingNumber, publicId })
    setQrModalOpen(true)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "in_transit":
        return <Truck className="h-4 w-4 text-blue-500" />
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "delayed":
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "default"

    switch (status) {
      case "pending":
        variant = "outline"
        break
      case "in_transit":
        variant = "secondary"
        break
      case "delivered":
        variant = "default"
        break
      case "delayed":
        variant = "outline"
        break
      case "cancelled":
        variant = "destructive"
        break
    }

    return (
      <Badge variant={variant} className="flex items-center gap-1">
        {getStatusIcon(status)}
        <span className="capitalize">{status.replace("_", " ")}</span>
      </Badge>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tracking #</TableHead>
              <TableHead>Origin</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Shipping Date</TableHead>
              <TableHead>Est. Delivery</TableHead>
              <TableHead>Packages</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shippingData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No shipping records found
                </TableCell>
              </TableRow>
            ) : (
              shippingData.map((shipping) => (
                <TableRow key={shipping.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {shipping.tracking_number}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openQrModal(shipping.tracking_number, shipping.public_id)}
                        title="View QR Code"
                      >
                        <QrCode className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    {shipping.origin_address.city}, {shipping.origin_address.country}
                  </TableCell>
                  <TableCell>
                    {shipping.destination_address.city}, {shipping.destination_address.country}
                  </TableCell>
                  <TableCell>{getStatusBadge(shipping.status)}</TableCell>
                  <TableCell>
                    {shipping.shipping_date
                      ? formatDistanceToNow(new Date(shipping.shipping_date), { addSuffix: true })
                      : "Not shipped"}
                  </TableCell>
                  <TableCell>
                    {shipping.estimated_delivery
                      ? formatDistanceToNow(new Date(shipping.estimated_delivery), { addSuffix: true })
                      : "Unknown"}
                  </TableCell>
                  <TableCell>{shipping.package_ids?.length || 0}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={isUpdating === shipping.id}>
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openQrModal(shipping.tracking_number, shipping.public_id)}>
                          <QrCode className="mr-2 h-4 w-4" />
                          View QR Code
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusUpdate(shipping.id, "in_transit")}
                          disabled={
                            shipping.status === "in_transit" ||
                            shipping.status === "delivered" ||
                            shipping.status === "cancelled"
                          }
                        >
                          Mark as In Transit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusUpdate(shipping.id, "delivered")}
                          disabled={shipping.status === "delivered" || shipping.status === "cancelled"}
                        >
                          Mark as Delivered
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusUpdate(shipping.id, "delayed")}
                          disabled={shipping.status === "delivered" || shipping.status === "cancelled"}
                        >
                          Mark as Delayed
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusUpdate(shipping.id, "cancelled")}
                          disabled={shipping.status === "delivered" || shipping.status === "cancelled"}
                        >
                          Cancel Shipment
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedShipment && (
        <ShippingQRModal
          trackingNumber={selectedShipment.trackingNumber}
          publicId={selectedShipment.publicId}
          isOpen={qrModalOpen}
          onClose={() => setQrModalOpen(false)}
        />
      )}
    </>
  )
}
