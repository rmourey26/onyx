"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Package, CheckCircle, AlertCircle, Truck, XCircle } from "lucide-react"
import { updateReusablePackage } from "@/app/actions/shipping"
import { toast } from "@/components/ui/use-toast"
import type { ReusablePackage } from "@/lib/types/database"

interface PackagesTableProps {
  packagesData: ReusablePackage[]
}

export function PackagesTable({ packagesData }: PackagesTableProps) {
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  const handleStatusUpdate = async (id: string, status: string) => {
    setIsUpdating(id)
    try {
      const result = await updateReusablePackage(id, { status })
      if (result.success) {
        toast({
          title: "Status updated",
          description: `Package status updated to ${status}`,
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update status",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "in_use":
        return <Truck className="h-4 w-4 text-blue-500" />
      case "damaged":
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      case "retired":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "default"

    switch (status) {
      case "available":
        variant = "default"
        break
      case "in_use":
        variant = "secondary"
        break
      case "damaged":
        variant = "outline"
        break
      case "retired":
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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Package ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Dimensions</TableHead>
            <TableHead>Weight Capacity</TableHead>
            <TableHead>Material</TableHead>
            <TableHead>Reuse Count</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>IoT Sensor ID</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {packagesData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                No reusable packages found
              </TableCell>
            </TableRow>
          ) : (
            packagesData.map((pkg) => (
              <TableRow key={pkg.id}>
                <TableCell className="font-medium">{pkg.package_id}</TableCell>
                <TableCell>{pkg.name}</TableCell>
                <TableCell>
                  {pkg.dimensions.length} x {pkg.dimensions.width} x {pkg.dimensions.height} {pkg.dimensions.unit}
                </TableCell>
                <TableCell>{pkg.weight_capacity} kg</TableCell>
                <TableCell>{pkg.material || "N/A"}</TableCell>
                <TableCell>{pkg.reuse_count}</TableCell>
                <TableCell>{getStatusBadge(pkg.status)}</TableCell>
                <TableCell>{pkg.iot_sensor_id || "N/A"}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" disabled={isUpdating === pkg.id}>
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleStatusUpdate(pkg.id, "available")}
                        disabled={pkg.status === "available" || pkg.status === "retired"}
                      >
                        Mark as Available
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusUpdate(pkg.id, "damaged")}
                        disabled={pkg.status === "damaged" || pkg.status === "retired"}
                      >
                        Mark as Damaged
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusUpdate(pkg.id, "retired")}
                        disabled={pkg.status === "retired"}
                      >
                        Retire Package
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
  )
}
