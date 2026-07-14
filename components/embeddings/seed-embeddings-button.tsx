"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { seedShipmentEmbeddings, seedAssetEmbeddings } from "@/app/actions/seed-actions"
import { Database, Package, RefreshCw } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface SeedEmbeddingsButtonProps {
  userId: string
}

export function SeedEmbeddingsButton({ userId }: SeedEmbeddingsButtonProps) {
  const [shipmentCount, setShipmentCount] = useState(50)
  const [assetCount, setAssetCount] = useState(50)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("shipments")
  const router = useRouter()

  const handleSeedShipments = async () => {
    if (shipmentCount < 1 || shipmentCount > 500) {
      toast.error("Please enter a valid count between 1 and 500")
      return
    }

    setIsLoading(true)
    try {
      const result = await seedShipmentEmbeddings(userId, shipmentCount)

      toast.success("Shipment embeddings seeded successfully", {
        description: `Successfully added ${result.count} shipment embeddings to your account.`,
      })

      setTimeout(() => {
        router.refresh()
      }, 2000)
    } catch (error) {
      console.error("Error seeding embeddings:", error)
      toast.error("Failed to seed shipment embeddings. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSeedAssets = async () => {
    if (assetCount < 1 || assetCount > 500) {
      toast.error("Please enter a valid count between 1 and 500")
      return
    }

    setIsLoading(true)
    try {
      const result = await seedAssetEmbeddings(userId, assetCount)

      toast.success("Asset embeddings seeded successfully", {
        description: `Successfully added ${result.count} asset embeddings to your account.`,
      })

      setTimeout(() => {
        router.refresh()
      }, 2000)
    } catch (error) {
      console.error("Error seeding embeddings:", error)
      toast.error("Failed to seed asset embeddings. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Seed Test Data</CardTitle>
        <CardDescription>Add sample embeddings for testing and development</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="shipments" className="gap-2">
              <Package className="h-4 w-4" />
              <span>Shipments</span>
            </TabsTrigger>
            <TabsTrigger value="assets" className="gap-2">
              <Database className="h-4 w-4" />
              <span>Assets</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="shipments" className="space-y-4 mt-0">
            <div className="space-y-2">
              <Label htmlFor="shipment-count">Number of shipments</Label>
              <Input
                id="shipment-count"
                type="number"
                min="1"
                max="500"
                value={shipmentCount}
                onChange={(e) => setShipmentCount(Number.parseInt(e.target.value) || 0)}
                placeholder="Enter count (1-500)"
              />
              <p className="text-xs text-muted-foreground">
                Generate mock shipment data with embeddings for similarity search and clustering
              </p>
            </div>
            <Button onClick={handleSeedShipments} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Seeding...
                </>
              ) : (
                <>
                  <Package className="mr-2 h-4 w-4" />
                  Seed Shipment Embeddings
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="assets" className="space-y-4 mt-0">
            <div className="space-y-2">
              <Label htmlFor="asset-count">Number of assets</Label>
              <Input
                id="asset-count"
                type="number"
                min="1"
                max="500"
                value={assetCount}
                onChange={(e) => setAssetCount(Number.parseInt(e.target.value) || 0)}
                placeholder="Enter count (1-500)"
              />
              <p className="text-xs text-muted-foreground">
                Generate mock asset data with embeddings for equipment management and tracking
              </p>
            </div>
            <Button onClick={handleSeedAssets} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Seeding...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Seed Asset Embeddings
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
