"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Clock, TrendingUp, Shield, Leaf, Wrench, BarChart3, Wifi, DollarSign } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import {
  assetIntelligenceWorkflowTemplates,
  type AssetIntelligenceWorkflowTemplate,
} from "@/lib/workflows/asset-intelligence-workflow-templates"

interface AssetWorkflowTemplateSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onTemplateSelected: (template: AssetIntelligenceWorkflowTemplate) => void
  assets: any[]
}

const categoryIcons: Record<string, any> = {
  "Predictive Maintenance": Wrench,
  "Lifecycle Management": TrendingUp,
  "Performance Optimization": BarChart3,
  "Risk Management": Shield,
  Sustainability: Leaf,
  "IoT Intelligence": Wifi,
  "Cost Optimization": DollarSign,
  Compliance: Shield,
  Security: Shield,
}

const difficultyColors = {
  beginner: "bg-green-100 text-green-800",
  intermediate: "bg-yellow-100 text-yellow-800",
  advanced: "bg-red-100 text-red-800",
}

export function AssetWorkflowTemplateSelector({
  open,
  onOpenChange,
  onTemplateSelected,
  assets,
}: AssetWorkflowTemplateSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all")
  const [selectedAssetType, setSelectedAssetType] = useState<string>("all")
  const [selectedTemplate, setSelectedTemplate] = useState<AssetIntelligenceWorkflowTemplate | null>(null)
  const [showTemplateDetails, setShowTemplateDetails] = useState(false)

  // Get unique categories, difficulties, and asset types
  const categories = Array.from(new Set(assetIntelligenceWorkflowTemplates.map((t) => t.category)))
  const difficulties = Array.from(new Set(assetIntelligenceWorkflowTemplates.map((t) => t.difficulty)))
  const assetTypes = Array.from(new Set(assetIntelligenceWorkflowTemplates.flatMap((t) => t.assetTypes)))

  // Filter templates based on search and filters
  const filteredTemplates = assetIntelligenceWorkflowTemplates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory
    const matchesDifficulty = selectedDifficulty === "all" || template.difficulty === selectedDifficulty
    const matchesAssetType =
      selectedAssetType === "all" ||
      template.assetTypes.includes(selectedAssetType) ||
      template.assetTypes.includes("all-assets")

    return matchesSearch && matchesCategory && matchesDifficulty && matchesAssetType
  })

  const handleTemplateSelect = (template: AssetIntelligenceWorkflowTemplate) => {
    setSelectedTemplate(template)
    setShowTemplateDetails(true)
  }

  const handleDeployTemplate = () => {
    if (!selectedTemplate) return

    if (assets.length === 0) {
      toast({
        title: "No Assets Available",
        description: "Please add some assets before deploying a workflow template.",
        variant: "destructive",
      })
      return
    }

    onTemplateSelected(selectedTemplate)
    setShowTemplateDetails(false)
    onOpenChange(false)

    toast({
      title: "Template Deployed",
      description: `${selectedTemplate.name} workflow has been deployed successfully.`,
    })
  }

  const resetFilters = () => {
    setSearchQuery("")
    setSelectedCategory("all")
    setSelectedDifficulty("all")
    setSelectedAssetType("all")
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[95vw] sm:max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden p-4 sm:p-6">
          <DialogHeader className="space-y-2 sm:space-y-3">
            <DialogTitle className="text-lg sm:text-xl">Asset Intelligence Workflow Templates</DialogTitle>
            <DialogDescription className="text-sm">
              Choose from our library of pre-built Asset Intelligence workflows to automate your asset management
              processes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col gap-2 sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 sm:h-auto"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-48 h-10 sm:h-auto">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger className="w-full sm:w-32 h-10 sm:h-auto">
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    {difficulties.map((difficulty) => (
                      <SelectItem key={difficulty} value={difficulty}>
                        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="w-full sm:w-auto h-10 sm:h-auto bg-transparent"
                >
                  Clear Filters
                </Button>
              </div>
            </div>

            <ScrollArea className="h-[calc(95vh-280px)] sm:h-[500px]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 pr-2 sm:pr-4 pb-4">
                {filteredTemplates.map((template) => {
                  const IconComponent = categoryIcons[template.category] || BarChart3

                  return (
                    <Card
                      key={template.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                            <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg flex-shrink-0">
                              <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-sm sm:text-base font-medium line-clamp-2">
                                {template.name}
                              </CardTitle>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {template.category}
                          </Badge>
                          <Badge className={`text-xs ${difficultyColors[template.difficulty]}`}>
                            {template.difficulty}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 p-3 sm:p-6 sm:pt-0">
                        <CardDescription className="text-xs line-clamp-2 sm:line-clamp-3 mb-2 sm:mb-3">
                          {template.description}
                        </CardDescription>
                        <div className="space-y-1.5 sm:space-y-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{template.estimated_time}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{template.businessValue}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2 sm:mt-3">
                          {template.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {template.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{template.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {filteredTemplates.length === 0 && (
                <div className="text-center py-8 sm:py-12">
                  <BarChart3 className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground mb-2">No templates match your current filters.</p>
                  <Button variant="outline" onClick={resetFilters} className="mt-2 bg-transparent">
                    Clear Filters
                  </Button>
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showTemplateDetails} onOpenChange={setShowTemplateDetails}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden p-4 sm:p-6">
          {selectedTemplate && (
            <>
              <DialogHeader className="space-y-2 sm:space-y-3">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg flex-shrink-0">
                    {(() => {
                      const IconComponent = categoryIcons[selectedTemplate.category] || BarChart3
                      return <IconComponent className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <DialogTitle className="text-base sm:text-xl line-clamp-2">{selectedTemplate.name}</DialogTitle>
                    <DialogDescription className="mt-1 text-sm line-clamp-2">
                      {selectedTemplate.description}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <ScrollArea className="max-h-[calc(95vh-200px)] sm:max-h-[60vh]">
                <div className="space-y-4 sm:space-y-6 pr-2 sm:pr-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <div>
                      <p className="text-xs sm:text-sm font-medium mb-1">Category</p>
                      <Badge variant="outline" className="text-xs">
                        {selectedTemplate.category}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-medium mb-1">Difficulty</p>
                      <Badge className={`text-xs ${difficultyColors[selectedTemplate.difficulty]}`}>
                        {selectedTemplate.difficulty}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-medium mb-1">Duration</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">{selectedTemplate.estimated_time}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-medium mb-1">Trigger</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">{selectedTemplate.trigger_type}</p>
                    </div>
                  </div>

                  {/* Business Value */}
                  <div>
                    <p className="text-sm font-medium mb-2">Expected Business Value</p>
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">{selectedTemplate.businessValue}</p>
                    </div>
                  </div>

                  {/* Asset Types */}
                  <div>
                    <p className="text-sm font-medium mb-2">Compatible Asset Types</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedTemplate.assetTypes.map((type) => (
                        <Badge key={type} variant="secondary">
                          {type.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <p className="text-sm font-medium mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedTemplate.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Workflow Steps ({selectedTemplate.steps.length})</p>
                    <div className="space-y-2">
                      {selectedTemplate.steps.slice(0, 3).map((step, index) => (
                        <div
                          key={step.id}
                          className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-muted/50 rounded-lg"
                        >
                          <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-medium line-clamp-1">{step.name}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2">{step.description}</p>
                          </div>
                        </div>
                      ))}
                      {selectedTemplate.steps.length > 3 && (
                        <p className="text-xs text-muted-foreground text-center">
                          +{selectedTemplate.steps.length - 3} more steps...
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <div className="flex flex-col-reverse sm:flex-row justify-between gap-2 sm:gap-0 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowTemplateDetails(false)} className="w-full sm:w-auto">
                  Back to Templates
                </Button>
                <Button onClick={handleDeployTemplate} className="w-full sm:w-auto">
                  Deploy Template
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
