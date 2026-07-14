"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { seedShippingEcosystemAction, clearShippingData } from "@/app/actions/shipping-ecosystem-seed"
import { Loader2, Package, Truck, Zap, QrCode, Database, Trash2 } from "lucide-react"

export function ShippingEcosystemSeeder() {
  const [isSeeding, setIsSeeding] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [packageCount, setPackageCount] = useState(50)
  const [shippingCount, setShippingCount] = useState(100)
  const [seedingStats, setSeedingStats] = useState<{
    packages: number
    iotSensors: number
    shipments: number
  } | null>(null)

  const { toast } = useToast()

  const handleSeedEcosystem = async () => {
    setIsSeeding(true)
    setProgress(0)
    setSeedingStats(null)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + Math.random() * 15, 90))
      }, 500)

      const result = await seedShippingEcosystemAction(packageCount, shippingCount)

      clearInterval(progressInterval)
      setProgress(100)

      if (result.success) {
        setSeedingStats({
          packages: result.packages || 0,
          iotSensors: result.iotSensors || 0,
          shipments: result.shipments || 0,
        })

        toast({
          title: "Ecosystem Seeded Successfully! 🎉",
          description: `Created ${result.packages} packages, ${result.iotSensors} IoT sensors, and ${result.shipments} shipments with QR codes.`,
        })
      } else {
        throw new Error(result.error || "Unknown error occurred")
      }
    } catch (error) {
      console.error("Seeding error:", error)
      toast({
        title: "Seeding Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSeeding(false)
      setTimeout(() => setProgress(0), 2000)
    }
  }

  const handleClearData = async () => {
    setIsClearing(true)

    try {
      const result = await clearShippingData()

      if (result.success) {
        setSeedingStats(null)
        toast({
          title: "Data Cleared Successfully",
          description: "All shipping, package, and IoT sensor data has been removed.",
        })
      } else {
        throw new Error(result.error || "Unknown error occurred")
      }
    } catch (error) {
      console.error("Clearing error:", error)
      toast({
        title: "Clear Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsClearing(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Shipping Ecosystem Seeder
          </CardTitle>
          <CardDescription>
            Generate realistic shipping data with reusable packages, IoT sensors, and QR codes for testing and
            development.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="packageCount">Reusable Packages</Label>
              <Input
                id="packageCount"
                type="number"
                min="1"
                max="200"
                value={packageCount}
                onChange={(e) => setPackageCount(Number.parseInt(e.target.value) || 50)}
                disabled={isSeeding}
              />
              <p className="text-sm text-muted-foreground">Each package gets a unique QR code and IoT sensor</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shippingCount">Shipping Records</Label>
              <Input
                id="shippingCount"
                type="number"
                min="1"
                max="500"
                value={shippingCount}
                onChange={(e) => setShippingCount(Number.parseInt(e.target.value) || 100)}
                disabled={isSeeding}
              />
              <p className="text-sm text-muted-foreground">Shipments will randomly use available packages</p>
            </div>
          </div>

          {/* Progress */}
          {isSeeding && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Seeding Progress</Label>
                <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Stats */}
          {seedingStats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Packages</p>
                    <p className="text-2xl font-bold">{seedingStats.packages}</p>
                  </div>
                  <Package className="h-8 w-8 text-blue-500" />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">IoT Sensors</p>
                    <p className="text-2xl font-bold">{seedingStats.iotSensors}</p>
                  </div>
                  <Zap className="h-8 w-8 text-green-500" />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Shipments</p>
                    <p className="text-2xl font-bold">{seedingStats.shipments}</p>
                  </div>
                  <Truck className="h-8 w-8 text-purple-500" />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Features List */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-3">What gets created:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <QrCode className="h-4 w-4 text-blue-500" />
                <span>Unique QR codes for each package</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-green-500" />
                <span>IoT sensors with realistic data</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-orange-500" />
                <span>Reusable packages with materials</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-purple-500" />
                <span>Shipping records with tracking</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={handleSeedEcosystem} disabled={isSeeding || isClearing} className="flex-1">
              {isSeeding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Seeding Ecosystem...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Seed Shipping Ecosystem
                </>
              )}
            </Button>

            <Button variant="destructive" onClick={handleClearData} disabled={isSeeding || isClearing}>
              {isClearing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Clearing...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear Data
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
