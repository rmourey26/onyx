"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Package, Truck, BarChart } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { optimizeSupplyChain } from "@/app/actions/ai-actions" // Import the action
import type { AIModel } from "@/lib/types/database"

interface AISupplyChainOptimizerProps {
  user: any
  aiModels: AIModel[]
}

export function AISupplyChainOptimizer({ user, aiModels }: AISupplyChainOptimizerProps) {
  const [items, setItems] = useState("")
  const [packages, setPackages] = useState("")
  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!items.trim() || !origin.trim() || !destination.trim() || isLoading) return

    setIsLoading(true)
    setResult(null)

    try {
      const result = await optimizeSupplyChain({
        items: items,
        packages: packages,
        origin: origin,
        destination: destination,
      })

      if (result.success) {
        setResult(result.data)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to optimize supply chain",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error optimizing supply chain:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Supply Chain Optimizer</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Optimize Packaging & Shipping</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Items to Ship (JSON format)</label>
              <Textarea
                placeholder='[{"id": "item1", "length": 10, "width": 5, "height": 3, "weight": 2, "quantity": 3}]'
                value={items}
                onChange={(e) => setItems(e.target.value)}
                className="min-h-[100px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Enter items as JSON array with id, dimensions (in cm), weight (in kg), and quantity
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Available Packages (Optional, JSON format)</label>
              <Textarea
                placeholder='[{"id": "box1", "length": 20, "width": 15, "height": 10, "weight_capacity": 10}]'
                value={packages}
                onChange={(e) => setPackages(e.target.value)}
                className="min-h-[100px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Enter available packages as JSON array with id, dimensions (in cm), and weight capacity (in kg)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Origin Address</label>
                <Input
                  placeholder="123 Main St, City, Country"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Destination Address</label>
                <Input
                  placeholder="456 Other St, City, Country"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !items.trim() || !origin.trim() || !destination.trim()}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Optimizing...
                </>
              ) : (
                <>
                  <Truck className="mr-2 h-4 w-4" />
                  Optimize Supply Chain
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Optimization Results</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            {result ? (
              <Tabs defaultValue="summary">
                <TabsList>
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="packaging">Packaging</TabsTrigger>
                  <TabsTrigger value="shipping">Shipping</TabsTrigger>
                  <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                </TabsList>
                <TabsContent value="summary" className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4 flex flex-col items-center justify-center">
                        <Package className="h-8 w-8 mb-2 text-primary" />
                        <p className="text-sm font-medium">Packages Used</p>
                        <p className="text-2xl font-bold">{result.packing_solution.total_packages}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 flex flex-col items-center justify-center">
                        <BarChart className="h-8 w-8 mb-2 text-primary" />
                        <p className="text-sm font-medium">Volume Utilization</p>
                        <p className="text-2xl font-bold">
                          {Math.round(result.packing_solution.total_volume_utilization * 100)}%
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-medium mb-2">Delivery Information</h3>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="font-medium">Estimated Delivery:</span>{" "}
                          {new Date(result.delivery_date).toLocaleDateString()}
                        </p>
                        <p>
                          <span className="font-medium">Total Cost:</span> ${result.total_cost.toFixed(2)}
                        </p>
                        <p>
                          <span className="font-medium">Carbon Footprint:</span> {result.carbon_footprint.toFixed(2)} kg
                          CO₂
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="packaging" className="mt-4">
                  <div className="space-y-4">
                    <h3 className="font-medium">Package Allocation</h3>
                    {result.packing_solution.packages.map((pkg: any, index: number) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">
                              Package {index + 1}: {pkg.package_id}
                            </h4>
                            <div className="flex space-x-2">
                              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                                {Math.round(pkg.volume_utilization * 100)}% Full
                              </span>
                              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                                {pkg.items.length} Items
                              </span>
                            </div>
                          </div>
                          <div className="text-sm">
                            <p>Items: {pkg.items.map((item: any) => item.item_id).join(", ")}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {result.packing_solution.unassigned_items.length > 0 && (
                      <Card className="border-destructive">
                        <CardContent className="p-4">
                          <h4 className="font-medium text-destructive">Unassigned Items</h4>
                          <p className="text-sm">{result.packing_solution.unassigned_items.join(", ")}</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="shipping" className="mt-4">
                  <Card>
                    <CardContent className="p-4 space-y-4">
                      <div>
                        <h3 className="font-medium">Route Details</h3>
                        <div className="text-sm space-y-1 mt-2">
                          <p>
                            <span className="font-medium">Carrier:</span> {result.route.carrier}
                          </p>
                          <p>
                            <span className="font-medium">Service Level:</span> {result.route.service_level}
                          </p>
                          <p>
                            <span className="font-medium">Distance:</span> {result.route.distance.toFixed(2)} km
                          </p>
                          <p>
                            <span className="font-medium">Estimated Time:</span>{" "}
                            {result.route.estimated_time.toFixed(1)} days
                          </p>
                          <p>
                            <span className="font-medium">Cost:</span> ${result.route.cost.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="recommendations" className="mt-4">
                  <ul className="list-disc pl-5 space-y-2">
                    {result.recommendations?.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
                <Truck className="h-12 w-12 mb-4" />
                <p>Your optimization results will appear here</p>
                <p className="text-sm mt-2">
                  Enter your items, packages, origin, and destination, then click "Optimize Supply Chain"
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
