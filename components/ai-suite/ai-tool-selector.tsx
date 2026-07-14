"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import {
  Search,
  Database,
  Code,
  TrendingUp,
  Package,
  Truck,
  Blocks,
  ImageIcon,
  Lightbulb,
  DollarSign,
  Activity,
  AlertTriangle,
  Leaf,
  FileCheck,
  Wifi,
  Shield,
  Zap,
  Check,
  X,
} from "lucide-react"
import { AVAILABLE_AI_TOOLS } from "@/lib/ai/available-tools"
import { cn } from "@/lib/utils"

const iconMap: Record<string, any> = {
  search: Search,
  database: Database,
  code: Code,
  "bar-chart": TrendingUp,
  package: Package,
  truck: Truck,
  blocks: Blocks,
  image: ImageIcon,
  lightbulb: Lightbulb,
  "dollar-sign": DollarSign,
  activity: Activity,
  "alert-triangle": AlertTriangle,
  leaf: Leaf,
  "file-check": FileCheck,
  wifi: Wifi,
  shield: Shield,
  zap: Zap,
}

interface AIToolSelectorProps {
  selectedTools: string[]
  onToolsChange: (tools: string[]) => void
  mode?: "create" | "execute"
  maxTools?: number
  showPremium?: boolean
}

export function AIToolSelector({
  selectedTools,
  onToolsChange,
  mode = "create",
  maxTools,
  showPremium = true,
}: AIToolSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<string>("all")

  const categories = useMemo(() => {
    const cats = new Set(AVAILABLE_AI_TOOLS.map((tool) => tool.category))
    return ["all", ...Array.from(cats)]
  }, [])

  const filteredTools = useMemo(() => {
    let tools = AVAILABLE_AI_TOOLS

    // Filter by premium status
    if (!showPremium) {
      tools = tools.filter((tool) => !tool.premium)
    }

    // Filter by category
    if (activeCategory !== "all") {
      tools = tools.filter((tool) => tool.category === activeCategory)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      tools = tools.filter(
        (tool) => tool.name.toLowerCase().includes(query) || tool.description.toLowerCase().includes(query),
      )
    }

    return tools
  }, [activeCategory, searchQuery, showPremium])

  const toggleTool = (toolName: string) => {
    if (selectedTools.includes(toolName)) {
      onToolsChange(selectedTools.filter((t) => t !== toolName))
    } else {
      if (maxTools && selectedTools.length >= maxTools) {
        return // Don't add if max reached
      }
      onToolsChange([...selectedTools, toolName])
    }
  }

  const selectAll = () => {
    const allToolNames = filteredTools.map((t) => t.name)
    onToolsChange(allToolNames)
  }

  const clearAll = () => {
    onToolsChange([])
  }

  return (
    <div className="space-y-4">
      {/* Header with search and actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 sm:h-9"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={selectAll}
            disabled={filteredTools.length === 0}
            className="h-10 sm:h-9 bg-transparent"
          >
            Select All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearAll}
            disabled={selectedTools.length === 0}
            className="h-10 sm:h-9 bg-transparent"
          >
            Clear All
          </Button>
        </div>
      </div>

      {/* Selection summary */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {selectedTools.length} tool{selectedTools.length !== 1 ? "s" : ""} selected
          {maxTools && ` (max ${maxTools})`}
        </span>
        {selectedTools.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAll} className="h-8 text-xs">
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Category tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <ScrollArea className="w-full">
          <TabsList className="inline-flex w-max min-w-full">
            {categories.map((category) => (
              <TabsTrigger key={category} value={category} className="capitalize text-xs sm:text-sm px-3 sm:px-4">
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </ScrollArea>

        <TabsContent value={activeCategory} className="mt-4">
          <ScrollArea className="h-[400px] sm:h-[500px] pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredTools.map((tool) => {
                const Icon = iconMap[tool.icon] || Zap
                const isSelected = selectedTools.includes(tool.name)
                const isDisabled = maxTools && selectedTools.length >= maxTools && !isSelected

                return (
                  <Card
                    key={tool.name}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      isSelected && "ring-2 ring-primary",
                      isDisabled && "opacity-50 cursor-not-allowed",
                    )}
                    onClick={() => !isDisabled && toggleTool(tool.name)}
                  >
                    <CardHeader className="p-4 pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div
                            className={cn(
                              "p-2 rounded-lg shrink-0",
                              isSelected ? "bg-primary text-primary-foreground" : "bg-muted",
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-sm font-semibold truncate">
                              {tool.name.replace(/_/g, " ")}
                            </CardTitle>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {tool.premium && (
                            <Badge variant="secondary" className="text-xs px-1.5 py-0">
                              Pro
                            </Badge>
                          )}
                          {isSelected && (
                            <div className="p-1 rounded-full bg-primary text-primary-foreground">
                              <Check className="h-3 w-3" />
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <CardDescription className="text-xs line-clamp-2">{tool.description}</CardDescription>
                      <div className="mt-2 flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-xs capitalize">
                          {tool.category}
                        </Badge>
                        {tool.requiresAuth && (
                          <Badge variant="outline" className="text-xs">
                            Auth Required
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {filteredTools.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">No tools found matching your criteria</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}
