"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Brain, Loader2, PackageCheck } from "lucide-react"

interface SmartPackageRecommendationProps {
  availablePackages: any[]
  onSelectPackage?: (packageId: string) => void
}

export function SmartPackageRecommendation({ availablePackages, onSelectPackage }: SmartPackageRecommendationProps) {
  const [itemDescription, setItemDescription] = useState("")
  const [ecoFriendly, setEcoFriendly] = useState(true)
  const [fragile, setFragile] = useState(false)
  const [temperatureSensitive, setTemperatureSensitive] = useState(false)
  const [sustainabilityFocus, setSustainabilityFocus] = useState(50)
  const [fillRateTarget, setFillRateTarget] = useState(85)
  const [packageTypePriority, setPackageTypePriority] = useState("reusable")
  const [isLoading, setIsLoading] = useState(false)
  const [recommendation, setRecommendation] = useState<any>(null)

  const getRecommendation = async () => {
    if (!itemDescription.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide item description",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      // In a real implementation, this would call an AI endpoint
      // For demo purposes, we'll simulate a response after a delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setRecommendation({
        recommended: {
          id: "medium-box-12",
          name: "Medium Reusable Box #12",
          dimensions: "30cm × 20cm × 15cm",
          weightCapacity: "5kg",
          volumeUtilization: 87,
          weightUtilization: 72,
          co2Savings: 2.4,
          isBestMatch: true,
        },
        alternatives: [
          {
            id: "small-box-8",
            name: "Small Reusable Box #8",
            dimensions: "25cm × 15cm × 10cm",
            weightCapacity: "3kg",
            volumeUtilization: 95,
            weightUtilization: 88,
            co2Savings: 1.8,
            note: "Slightly over capacity",
          },
          {
            id: "large-box-4",
            name: "Large Reusable Box #4",
            dimensions: "40cm × 30cm × 20cm",
            weightCapacity: "10kg",
            volumeUtilization: 65,
            weightUtilization: 54,
            co2Savings: 3.2,
            note: "Underutilized space",
          },
        ],
      })
    } catch (error) {
      console.error("Error getting package recommendation:", error)
      toast({
        title: "Error",
        description: "Failed to get package recommendation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectPackage = (packageId: string) => {
    if (onSelectPackage) {
      onSelectPackage(packageId)
    }
    toast({
      title: "Package selected",
      description: `Package ${packageId} has been selected for your shipment.`,
    })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Items to Ship</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="item-description">Item Description</Label>
            <Textarea
              id="item-description"
              placeholder="Enter item details (dimensions, weight, quantity, etc.)"
              className="min-h-[100px]"
              value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="packaging-preferences">Packaging Preferences</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch id="eco-friendly" checked={ecoFriendly} onCheckedChange={setEcoFriendly} />
                <Label htmlFor="eco-friendly">Eco-friendly packaging</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="fragile" checked={fragile} onCheckedChange={setFragile} />
                <Label htmlFor="fragile">Fragile items</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="temperature-sensitive"
                  checked={temperatureSensitive}
                  onCheckedChange={setTemperatureSensitive}
                />
                <Label htmlFor="temperature-sensitive">Temperature sensitive</Label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Optimization Preferences</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Cost vs. Sustainability</Label>
            <Slider
              value={[sustainabilityFocus]}
              max={100}
              step={1}
              className="py-4"
              onValueChange={(value) => setSustainabilityFocus(value[0])}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Cost Focused</span>
              <span>Balanced</span>
              <span>Eco Focused</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Package Fill Rate Target</Label>
            <Slider
              value={[fillRateTarget]}
              max={100}
              step={1}
              className="py-4"
              onValueChange={(value) => setFillRateTarget(value[0])}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>70%</span>
              <span>85%</span>
              <span>100%</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="package-type">Package Type Priority</Label>
            <Select value={packageTypePriority} onValueChange={setPackageTypePriority}>
              <SelectTrigger>
                <SelectValue placeholder="Select package type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reusable">Reusable First</SelectItem>
                <SelectItem value="recyclable">Recyclable First</SelectItem>
                <SelectItem value="smallest">Smallest Fit</SelectItem>
                <SelectItem value="standard">Standard Packaging</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={getRecommendation} disabled={isLoading} className="gap-2">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Brain className="h-4 w-4" />
              Get AI Package Recommendation
            </>
          )}
        </Button>
      </div>

      {recommendation && (
        <Card className="border-green-200 dark:border-green-800 mt-6">
          <CardHeader className="bg-green-50 dark:bg-green-900/30">
            <CardTitle className="flex items-center">
              <PackageCheck className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
              AI Package Recommendation
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-2 border-green-500 dark:border-green-700">
                <CardHeader className="pb-2 bg-green-50 dark:bg-green-900/20">
                  <CardTitle className="text-base">Recommended Package</CardTitle>
                  <CardDescription>Best match for your items</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <div className="font-medium">{recommendation.recommended.name}</div>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                      Best Match
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dimensions:</span>
                      <span>{recommendation.recommended.dimensions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Weight Capacity:</span>
                      <span>{recommendation.recommended.weightCapacity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Volume Utilization:</span>
                      <span className="font-medium">{recommendation.recommended.volumeUtilization}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Weight Utilization:</span>
                      <span className="font-medium">{recommendation.recommended.weightUtilization}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">CO₂ Savings:</span>
                      <span className="text-green-600 dark:text-green-400">
                        {recommendation.recommended.co2Savings}kg CO₂
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={() => handleSelectPackage(recommendation.recommended.id)}>
                    Select This Package
                  </Button>
                </CardFooter>
              </Card>

              {recommendation.alternatives.map((alt: any, index: number) => (
                <Card key={alt.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Alternative Option {index + 1}</CardTitle>
                    <CardDescription>{alt.note}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <div className="font-medium">{alt.name}</div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Dimensions:</span>
                        <span>{alt.dimensions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Weight Capacity:</span>
                        <span>{alt.weightCapacity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Volume Utilization:</span>
                        <span
                          className={`font-medium ${
                            alt.volumeUtilization > 90
                              ? "text-amber-600"
                              : alt.volumeUtilization < 70
                                ? "text-red-600"
                                : ""
                          }`}
                        >
                          {alt.volumeUtilization}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Weight Utilization:</span>
                        <span
                          className={`font-medium ${
                            alt.weightUtilization > 90
                              ? "text-amber-600"
                              : alt.weightUtilization < 70
                                ? "text-red-600"
                                : ""
                          }`}
                        >
                          {alt.weightUtilization}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">CO₂ Savings:</span>
                        <span className="text-green-600 dark:text-green-400">{alt.co2Savings}kg CO₂</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => handleSelectPackage(alt.id)}>
                      Select This Package
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
