"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Loader2, MapPin, Route, Truck, Clock, Leaf, DollarSign } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function RouteOptimization() {
  const [isLoading, setIsLoading] = useState(false)
  const [optimizationResults, setOptimizationResults] = useState<any>(null)
  const { toast } = useToast()

  const runOptimization = async () => {
    setIsLoading(true)
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock optimization results
      setOptimizationResults({
        routes: [
          {
            id: "route-1",
            name: "San Francisco to Los Angeles",
            originalDistance: 382,
            optimizedDistance: 368,
            originalTime: 5.8,
            optimizedTime: 5.4,
            fuelSavings: 4.2,
            co2Reduction: 12.6,
            costSavings: 87.5,
            waypoints: [
              { name: "San Francisco, CA", lat: 37.7749, lng: -122.4194 },
              { name: "San Jose, CA", lat: 37.3382, lng: -121.8863 },
              { name: "Fresno, CA", lat: 36.7378, lng: -119.7871 },
              { name: "Bakersfield, CA", lat: 35.3733, lng: -119.0187 },
              { name: "Los Angeles, CA", lat: 34.0522, lng: -118.2437 },
            ],
          },
          {
            id: "route-2",
            name: "Seattle to Portland",
            originalDistance: 174,
            optimizedDistance: 168,
            originalTime: 2.9,
            optimizedTime: 2.7,
            fuelSavings: 2.1,
            co2Reduction: 6.3,
            costSavings: 42.75,
            waypoints: [
              { name: "Seattle, WA", lat: 47.6062, lng: -122.3321 },
              { name: "Tacoma, WA", lat: 47.2529, lng: -122.4443 },
              { name: "Olympia, WA", lat: 47.0379, lng: -122.9007 },
              { name: "Portland, OR", lat: 45.5051, lng: -122.675 },
            ],
          },
          {
            id: "route-3",
            name: "New York to Boston",
            originalDistance: 215,
            optimizedDistance: 204,
            originalTime: 3.8,
            optimizedTime: 3.5,
            fuelSavings: 3.6,
            co2Reduction: 10.8,
            costSavings: 68.25,
            waypoints: [
              { name: "New York, NY", lat: 40.7128, lng: -74.006 },
              { name: "New Haven, CT", lat: 41.3083, lng: -72.9279 },
              { name: "Providence, RI", lat: 41.824, lng: -71.4128 },
              { name: "Boston, MA", lat: 42.3601, lng: -71.0589 },
            ],
          },
        ],
        summary: {
          totalRoutes: 3,
          totalDistanceSaved: 31,
          totalTimeSaved: 0.9,
          totalFuelSaved: 9.9,
          totalCo2Reduced: 29.7,
          totalCostSavings: 198.5,
        },
      })

      toast({
        title: "Route optimization complete",
        description: "Found optimal routes with 31 miles in distance savings",
      })
    } catch (error) {
      console.error("Error in route optimization:", error)
      toast({
        title: "Optimization failed",
        description: "An error occurred during route optimization",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Route Optimization</h2>
          <p className="text-muted-foreground">Optimize delivery routes to save time, fuel, and reduce emissions</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" disabled={isLoading}>
            Import Routes
          </Button>
          <Button onClick={runOptimization} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Optimizing...
              </>
            ) : (
              <>
                <Route className="mr-2 h-4 w-4" />
                Run Optimization
              </>
            )}
          </Button>
        </div>
      </div>

      {!optimizationResults ? (
        <Card>
          <CardHeader>
            <CardTitle>Route Parameters</CardTitle>
            <CardDescription>Configure parameters for route optimization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="origin">Origin Hub</Label>
                  <Input id="origin" placeholder="Enter origin location" defaultValue="San Francisco, CA" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="destinations">Destinations</Label>
                  <Input
                    id="destinations"
                    placeholder="Enter destinations (comma separated)"
                    defaultValue="Los Angeles, CA; Seattle, WA; Portland, OR; New York, NY; Boston, MA"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicle-type">Vehicle Type</Label>
                  <Input id="vehicle-type" placeholder="Enter vehicle type" defaultValue="Electric Delivery Van" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Optimization Priority</Label>
                  <Tabs defaultValue="balanced">
                    <TabsList className="grid grid-cols-3">
                      <TabsTrigger value="time">Time</TabsTrigger>
                      <TabsTrigger value="balanced">Balanced</TabsTrigger>
                      <TabsTrigger value="eco">Eco-Friendly</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="constraints">Constraints</Label>
                  <Input id="constraints" placeholder="Enter constraints" defaultValue="Max 8 hours per route" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Delivery Date</Label>
                  <Input id="date" type="date" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Summary Card */}
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30">
            <CardHeader>
              <CardTitle>Optimization Results</CardTitle>
              <CardDescription>Summary of route optimization benefits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                <div className="space-y-1">
                  <div className="text-2xl font-bold">{optimizationResults.summary.totalRoutes}</div>
                  <div className="text-xs text-muted-foreground">Routes Optimized</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {optimizationResults.summary.totalDistanceSaved} mi
                  </div>
                  <div className="text-xs text-muted-foreground">Distance Saved</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {optimizationResults.summary.totalTimeSaved.toFixed(1)} hrs
                  </div>
                  <div className="text-xs text-muted-foreground">Time Saved</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {optimizationResults.summary.totalCo2Reduced.toFixed(1)} kg
                  </div>
                  <div className="text-xs text-muted-foreground">CO₂ Reduced</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    ${optimizationResults.summary.totalCostSavings.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground">Cost Savings</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Routes */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Optimized Routes</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {optimizationResults.routes.map((route: any) => (
                <Card key={route.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">{route.name}</CardTitle>
                      <Badge variant="outline" className="ml-2">
                        Route {route.id.split("-")[1]}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {route.waypoints.length} stops
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-1.5">
                          <Truck className="h-4 w-4 text-muted-foreground" />
                          <div className="text-sm">
                            <div className="font-medium">{route.optimizedDistance} mi</div>
                            <div className="text-xs text-muted-foreground">
                              Saved {route.originalDistance - route.optimizedDistance} mi
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div className="text-sm">
                            <div className="font-medium">{route.optimizedTime} hrs</div>
                            <div className="text-xs text-muted-foreground">
                              Saved {(route.originalTime - route.optimizedTime).toFixed(1)} hrs
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-1.5">
                          <Leaf className="h-4 w-4 text-green-600 dark:text-green-400" />
                          <div className="text-sm">
                            <div className="font-medium">{route.co2Reduction} kg CO₂</div>
                            <div className="text-xs text-muted-foreground">Emissions reduced</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          <div className="text-sm">
                            <div className="font-medium">${route.costSavings.toFixed(2)}</div>
                            <div className="text-xs text-muted-foreground">Cost savings</div>
                          </div>
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground pt-1">
                        <span className="font-medium">Stops:</span>{" "}
                        {route.waypoints.map((wp: any) => wp.name).join(" → ")}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button variant="outline" size="sm" className="w-full">
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
