"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { getSupabaseClient } from "@/lib/supabase/singleton"

export default function PackageShipmentDetails() {
  const [loading, setLoading] = useState(true)
  const [packageDetails, setPackageDetails] = useState<any[]>([])
  const supabase = getSupabaseClient()

  useEffect(() => {
    async function fetchPackageShipmentDetails() {
      try {
        setLoading(true)
        const { data, error } = await supabase.from("package_shipment_details").select("*")

        if (error) {
          console.error("Error fetching package shipment details:", error)
          return
        }

        setPackageDetails(data || [])
      } catch (error) {
        console.error("Error in fetchPackageShipmentDetails:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPackageShipmentDetails()
  }, [supabase])

  // Function to get badge color based on status
  const getStatusColor = (status: string | null) => {
    if (!status) return "bg-gray-200 text-gray-800"

    switch (status.toLowerCase()) {
      case "available":
        return "bg-green-100 text-green-800"
      case "in_use":
        return "bg-blue-100 text-blue-800"
      case "damaged":
        return "bg-red-100 text-red-800"
      case "maintenance":
        return "bg-yellow-100 text-yellow-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "in_transit":
        return "bg-blue-100 text-blue-800"
      case "processing":
        return "bg-purple-100 text-purple-800"
      case "delayed":
        return "bg-yellow-100 text-yellow-800"
      case "returned":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Package-Shipment Relationships</CardTitle>
        <CardDescription>View the current shipment details for each reusable package</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : packageDetails.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No package-shipment relationships found</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Package</TableHead>
                  <TableHead>Tracking Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reuse Count</TableHead>
                  <TableHead>Current Shipment</TableHead>
                  <TableHead>Carrier</TableHead>
                  <TableHead>Shipment Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packageDetails.map((detail) => (
                  <TableRow key={detail.package_id}>
                    <TableCell className="font-medium">{detail.package_name}</TableCell>
                    <TableCell>{detail.tracking_code}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(detail.status)}>{detail.status || "Unknown"}</Badge>
                    </TableCell>
                    <TableCell>{detail.reuse_count || 0}</TableCell>
                    <TableCell>
                      {detail.tracking_number ? (
                        detail.tracking_number
                      ) : (
                        <span className="text-gray-500">Not assigned</span>
                      )}
                    </TableCell>
                    <TableCell>{detail.carrier || "-"}</TableCell>
                    <TableCell>
                      {detail.shipment_status ? (
                        <Badge className={getStatusColor(detail.shipment_status)}>{detail.shipment_status}</Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
