"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Zap } from "lucide-react"
import {
  Bot,
  BarChart,
  Network,
  Blocks,
  Truck,
  Code,
  ImageIcon,
  Briefcase,
  Map,
  Leaf,
  Users,
  Award as IdCard,
  DollarSign,
  GitBranch,
  TrendingUp,
  Route,
  Shield,
  PieChart,
  CheckCircle,
  FileText,
  Flag as Flask,
  ClipboardCheck,
  Dna,
  Stethoscope,
  Droplet,
  RefreshCw,
  Megaphone,
} from "lucide-react"
import { agentTemplates, type AgentTemplate } from "@/lib/ai/agent-templates"

interface AgentTemplateSelectorProps {
  onSelect: (template: AgentTemplate) => void
  onCancel: () => void
}

const iconMap = {
  bot: Bot,
  "bar-chart": BarChart,
  network: Network,
  blocks: Blocks,
  truck: Truck,
  code: Code,
  image: ImageIcon,
  briefcase: Briefcase,
  map: Map,
  leaf: Leaf,
  users: Users,
  "id-card": IdCard,
  "dollar-sign": DollarSign,
  "git-branch": GitBranch,
  "trending-up": TrendingUp,
  route: Route,
  shield: Shield,
  "pie-chart": PieChart,
  "check-circle": CheckCircle,
  "file-text": FileText,
  flask: Flask,
  "clipboard-check": ClipboardCheck,
  dna: Dna,
  stethoscope: Stethoscope,
  droplet: Droplet,
  "refresh-cw": RefreshCw,
  megaphone: Megaphone,
}

const categoryColors = {
  general: "bg-blue-100 text-blue-800",
  data: "bg-purple-100 text-purple-800",
  blockchain: "bg-orange-100 text-orange-800",
  "supply-chain": "bg-green-100 text-green-800",
  developer: "bg-gray-100 text-gray-800",
  business: "bg-indigo-100 text-indigo-800",
  integration: "bg-pink-100 text-pink-800",
  analytics: "bg-cyan-100 text-cyan-800",
  marketing: "bg-red-100 text-red-800",
  "smart-contracts": "bg-yellow-100 text-yellow-800",
  quality: "bg-teal-100 text-teal-800",
  healthcare: "bg-emerald-100 text-emerald-800",
  pharmaceuticals: "bg-violet-100 text-violet-800",
  "data-center": "bg-slate-100 text-slate-800",
}

export function AgentTemplateSelector({ onSelect, onCancel }: AgentTemplateSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredTemplates = agentTemplates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || template.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = Array.from(new Set(agentTemplates.map((t) => t.category)))

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-[95vw] w-full sm:max-w-7xl h-[90vh] sm:h-[85vh] p-0 gap-0 flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0 border-b border-border/50 px-4 sm:px-6 py-4 space-y-2">
          <DialogTitle className="text-xl sm:text-2xl md:text-3xl font-bold">Choose an Agent Template</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Select a pre-configured template to quickly deploy an AI agent optimized for specific enterprise tasks.
          </DialogDescription>
        </DialogHeader>

        {/* Search and Filters */}
        <div className="flex-shrink-0 px-4 sm:px-6 py-3 border-b border-border/50 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10 sm:h-11 text-sm"
            />
          </div>

          <div
            className="w-full overflow-auto overflow-x-hidden px-4 sm:px-6 overscroll-contain"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <div className="flex gap-2 pb-1">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className="whitespace-nowrap flex-shrink-0 h-8 sm:h-9 px-3 text-xs"
              >
                All Templates
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="whitespace-nowrap flex-shrink-0 h-8 sm:h-9 px-3 text-xs"
                >
                  {category.charAt(0).toUpperCase() + category.slice(1).replace("-", " ")}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Scrollable Template Grid */}
        <div
          className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 overscroll-contain"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div className="py-4">
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {filteredTemplates.map((template) => {
                const IconComponent = iconMap[template.icon as keyof typeof iconMap] || Bot
                return (
                  <Card
                    key={template.id}
                    className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                    onClick={() => onSelect(template)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <IconComponent className="h-5 w-5 text-primary" />
                        </div>
                        <Badge
                          variant="secondary"
                          className={`${categoryColors[template.category as keyof typeof categoryColors]} text-[10px] flex-shrink-0 px-2 py-0.5 font-semibold`}
                        >
                          {template.category.replace("-", " ")}
                        </Badge>
                      </div>
                      <CardTitle className="text-sm sm:text-base line-clamp-2 break-words font-bold">
                        {template.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 sm:line-clamp-3 text-xs break-words">
                        {template.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-0 space-y-2">
                      <div>
                        <p className="text-xs font-semibold mb-1.5 text-muted-foreground uppercase tracking-wide">
                          Tools ({template.tools.length})
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {template.tools.slice(0, 3).map((tool) => (
                            <Badge key={tool} variant="outline" className="text-[10px] px-1.5 py-0">
                              {tool.replace("_", " ")}
                            </Badge>
                          ))}
                          {template.tools.length > 3 && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              +{template.tools.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between text-xs p-2 rounded-lg bg-muted/50">
                        <span className="text-muted-foreground font-medium">
                          <Zap className="inline h-3 w-3 mr-1 text-primary" />
                          Temp: {template.parameters.temperature}
                        </span>
                        <span className="text-muted-foreground font-medium">
                          <TrendingUp className="inline h-3 w-3 mr-1" />
                          Tokens: {template.parameters.max_tokens}
                        </span>
                      </div>

                      <Button size="sm" className="w-full h-9 text-xs font-semibold">
                        Deploy Template
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/30 flex items-center justify-center">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-base text-muted-foreground font-medium">No templates found matching your criteria</p>
                <p className="text-xs text-muted-foreground/70 mt-2">Try adjusting your search or category filters</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
