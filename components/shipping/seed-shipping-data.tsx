"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { seedShippingDashboard } from "@/app/actions/seed-actions"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface SeedShippingDataProps {
  onComplete?: () => void
  onClose?: () => void
}

export function SeedShippingData({ onComplete, onClose }: SeedShippingDataProps) {
  const [packageCount, setPackageCount] = useState(20)
  const [shippingCount, setShippingCount] = useState(30)
  const [isLoading, setIsLoading] = useState(false)

  const handleSeed = async () => {
    try {
      setIsLoading(true)
      const result = await seedShippingDashboard(packageCount, shippingCount)

      if (result.success) {
        toast({
          title: "Demo data seeded successfully",
          description: `Created ${result.packages} packages and ${result.shipments} shipments.`,
        })
        if (onComplete) onComplete()
        if (onClose) onClose()
      } else {
        toast({
          title: "Error seeding demo data",
          description: result.error || "An unexpected error occurred",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error seeding demo data:", error)
      toast({
        title: "Error seeding demo data",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-4">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Seed Demo Data</h3>
        <p className="text-sm text-muted-foreground">
          Generate sample data to demonstrate the AI-Enhanced Shipping Dashboard.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <label htmlFor="package-count" className="text-sm font-medium">
              Reusable Packages
            </label>
            <span className="text-sm text-muted-foreground">{packageCount}</span>
          </div>
          <Slider
            id="package-count"
            min={5}
            max={50}
            step={5}
            value={[packageCount]}
            onValueChange={(value) => setPackageCount(value[0])}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <label htmlFor="shipping-count" className="text-sm font-medium">
              Shipping Records
            </label>
            <span className="text-sm text-muted-foreground">{shippingCount}</span>
          </div>
          <Slider
            id="shipping-count"
            min={10}
            max={100}
            step={10}
            value={[shippingCount]}
            onValueChange={(value) => setShippingCount(value[0])}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={handleSeed} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Seeding...
            </>
          ) : (
            "Seed Demo Data"
          )}
        </Button>
      </div>
    </div>
  )
}
