import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Truck, CheckCircle, AlertCircle, Clock, XCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface ShipmentTrackingViewProps {
  shipment: any
}

export function ShipmentTrackingView({ shipment }: ShipmentTrackingViewProps) {
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
    <Card>
      <CardHeader>
        <CardTitle>Shipment Tracking</CardTitle>
        <CardDescription>Tracking Number: {shipment.tracking_number}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Shipment Details</h3>
          <div className="space-y-2">
            <p>
              <span className="font-medium">Origin:</span> {shipment.origin_address.city},{" "}
              {shipment.origin_address.country}
            </p>
            <p>
              <span className="font-medium">Destination:</span> {shipment.destination_address.city},{" "}
              {shipment.destination_address.country}
            </p>
            <p>
              <span className="font-medium">Carrier:</span> {shipment.carrier}
            </p>
            <p>
              <span className="font-medium">Service Level:</span> {shipment.service_level}
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium">Status</h3>
          <div className="space-y-2">
            <p>
              <span className="font-medium">Current Status:</span> {getStatusBadge(shipment.status)}
            </p>
            <p>
              <span className="font-medium">Shipping Date:</span>{" "}
              {shipment.shipping_date
                ? formatDistanceToNow(new Date(shipment.shipping_date), { addSuffix: true })
                : "Not shipped"}
            </p>
            <p>
              <span className="font-medium">Estimated Delivery:</span>{" "}
              {shipment.estimated_delivery
                ? formatDistanceToNow(new Date(shipment.estimated_delivery), { addSuffix: true })
                : "Unknown"}
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium">Packages</h3>
          <div className="space-y-2">
            {shipment.package_ids && shipment.package_ids.length > 0 ? (
              <ul className="list-disc pl-5">
                {shipment.package_ids.map((packageId: string) => (
                  <li key={packageId}>{packageId}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No packages associated with this shipment</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
