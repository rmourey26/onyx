"use client"

import { Search, Grid, List, Sparkles, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"

export function MarketplaceHeader() {
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  return (
    <div className="marketplace-hero sticky top-16 z-40">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-bold text-balance leading-tight">
                AI Agent <span className="enterprise-text-gradient">Marketplace</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl text-pretty">
                Discover and deploy powerful AI agents with OAuth integrations, blockchain connectivity, and enterprise
                capabilities
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className={viewMode === "grid" ? "bg-primary" : ""}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "bg-primary" : ""}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by name, category, or OAuth capability..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 enterprise-input text-base"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="oauth-badge cursor-pointer hover:scale-105 transition-transform">
                <Sparkles className="h-3 w-3" />
                OAuth Agents
              </Badge>
              <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80 transition-colors">
                <TrendingUp className="h-3 w-3 mr-1" />
                Trending
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-accent/5 transition-colors">
                New Releases
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-accent/5 transition-colors">
                Most Popular
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
