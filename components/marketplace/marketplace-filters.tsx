"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { X } from "lucide-react"
import { useState } from "react"

export function MarketplaceFilters() {
  const [priceRange, setPriceRange] = useState([0, 500])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])

  const categories = [
    { id: "productivity", label: "Productivity", count: 342 },
    { id: "analytics", label: "Analytics", count: 189 },
    { id: "customer-service", label: "Customer Service", count: 156 },
    { id: "content-creation", label: "Content Creation", count: 234 },
    { id: "automation", label: "Automation", count: 298 },
    { id: "data-processing", label: "Data Processing", count: 167 },
    { id: "communication", label: "Communication", count: 123 },
    { id: "security", label: "Security", count: 89 },
  ]

  const features = [
    { id: "real-time", label: "Real-time Processing" },
    { id: "multi-language", label: "Multi-language Support" },
    { id: "api-integration", label: "API Integration" },
    { id: "custom-training", label: "Custom Training" },
    { id: "enterprise-ready", label: "Enterprise Ready" },
    { id: "cloud-native", label: "Cloud Native" },
  ]

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  const toggleFeature = (featureId: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(featureId) ? prev.filter((id) => id !== featureId) : [...prev, featureId],
    )
  }

  const clearAllFilters = () => {
    setSelectedCategories([])
    setSelectedFeatures([])
    setPriceRange([0, 500])
  }

  const hasActiveFilters =
    selectedCategories.length > 0 || selectedFeatures.length > 0 || priceRange[0] > 0 || priceRange[1] < 500

  return (
    <Card className="enterprise-card sticky top-32">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filters</CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs">
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Active Filters</h4>
            <div className="flex flex-wrap gap-1">
              {selectedCategories.map((categoryId) => {
                const category = categories.find((c) => c.id === categoryId)
                return (
                  <Badge key={categoryId} variant="secondary" className="text-xs">
                    {category?.label}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-1"
                      onClick={() => toggleCategory(categoryId)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )
              })}
              {selectedFeatures.map((featureId) => {
                const feature = features.find((f) => f.id === featureId)
                return (
                  <Badge key={featureId} variant="secondary" className="text-xs">
                    {feature?.label}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-1"
                      onClick={() => toggleFeature(featureId)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )
              })}
            </div>
            <Separator />
          </div>
        )}

        {/* Price Range */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Price Range</h4>
          <div className="px-2">
            <Slider value={priceRange} onValueChange={setPriceRange} max={500} step={10} className="w-full" />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}+</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Categories */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Categories</h4>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={category.id}
                  checked={selectedCategories.includes(category.id)}
                  onCheckedChange={() => toggleCategory(category.id)}
                />
                <label
                  htmlFor={category.id}
                  className="text-sm flex-1 cursor-pointer flex items-center justify-between"
                >
                  <span>{category.label}</span>
                  <span className="text-xs text-muted-foreground">{category.count}</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Features */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Features</h4>
          <div className="space-y-2">
            {features.map((feature) => (
              <div key={feature.id} className="flex items-center space-x-2">
                <Checkbox
                  id={feature.id}
                  checked={selectedFeatures.includes(feature.id)}
                  onCheckedChange={() => toggleFeature(feature.id)}
                />
                <label htmlFor={feature.id} className="text-sm flex-1 cursor-pointer">
                  {feature.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
