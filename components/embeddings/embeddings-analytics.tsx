"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { BarChart, LineChart, PieChart, BarChart2 } from "lucide-react"
import type { DataEmbedding } from "@/lib/types/database"

interface EmbeddingsAnalyticsProps {
  userId: string
  embeddings: DataEmbedding[]
}

export function EmbeddingsAnalytics({ userId, embeddings }: EmbeddingsAnalyticsProps) {
  const [selectedEmbedding, setSelectedEmbedding] = useState<string>("all")
  const [timeRange, setTimeRange] = useState<string>("30d")

  // Group embeddings by source type
  const sourceTypeCounts = embeddings.reduce((acc: Record<string, number>, embedding) => {
    const sourceType = embedding.source_type
    acc[sourceType] = (acc[sourceType] || 0) + 1
    return acc
  }, {})

  // Group embeddings by model
  const modelCounts = embeddings.reduce((acc: Record<string, number>, embedding) => {
    const model = embedding.embedding_model
    acc[model] = (acc[model] || 0) + 1
    return acc
  }, {})

  return (
    <Card className="enterprise-card glass-morphism border border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Embeddings Analytics
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Analyze your embeddings usage and performance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="embeddingSelect" className="text-sm font-medium">
              Embedding Source
            </Label>
            <Select value={selectedEmbedding} onValueChange={setSelectedEmbedding}>
              <SelectTrigger id="embeddingSelect" className="bg-background/50 backdrop-blur-sm">
                <SelectValue placeholder="Select an embedding" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Embeddings</SelectItem>
                {embeddings.map((embedding) => (
                  <SelectItem key={embedding.id} value={embedding.id}>
                    {embedding.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeRange" className="text-sm font-medium">
              Time Range
            </Label>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger id="timeRange" className="bg-background/50 backdrop-blur-sm">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="usage">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted/50 backdrop-blur-sm">
            <TabsTrigger
              value="usage"
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <BarChart className="h-4 w-4" />
              <span>Usage</span>
            </TabsTrigger>
            <TabsTrigger
              value="performance"
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <LineChart className="h-4 w-4" />
              <span>Performance</span>
            </TabsTrigger>
            <TabsTrigger
              value="distribution"
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <PieChart className="h-4 w-4" />
              <span>Distribution</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="usage">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="enterprise-card group relative overflow-hidden hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] border border-border/50 bg-card/80 backdrop-blur-sm">
                <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/20 via-transparent to-accent/20" />
                </div>
                <CardHeader className="pb-2 relative z-10">
                  <CardTitle className="text-base font-semibold">Embeddings by Source Type</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 relative z-10">
                  {Object.keys(sourceTypeCounts).length > 0 ? (
                    <div className="h-[200px] flex items-center justify-center">
                      <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 via-accent/10 to-primary/20 flex items-center justify-center">
                        <PieChart className="h-16 w-16 text-primary" />
                      </div>
                    </div>
                  ) : (
                    <div className="h-[200px] flex items-center justify-center">
                      <p className="text-muted-foreground text-center text-sm">No data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="enterprise-card group relative overflow-hidden hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] border border-border/50 bg-card/80 backdrop-blur-sm">
                <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-accent/20 via-transparent to-primary/20" />
                </div>
                <CardHeader className="pb-2 relative z-10">
                  <CardTitle className="text-base font-semibold">Embeddings by Model</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 relative z-10">
                  {Object.keys(modelCounts).length > 0 ? (
                    <div className="h-[200px] flex items-center justify-center">
                      <div className="relative w-32 h-32 rounded-xl bg-gradient-to-br from-accent/20 via-primary/10 to-accent/20 flex items-center justify-center">
                        <BarChart className="h-16 w-16 text-accent" />
                      </div>
                    </div>
                  ) : (
                    <div className="h-[200px] flex items-center justify-center">
                      <p className="text-muted-foreground text-center text-sm">No data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance">
            <Card className="enterprise-card group relative overflow-hidden hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] border border-border/50 bg-card/80 backdrop-blur-sm">
              <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-500/20 via-transparent to-cyan-500/20" />
              </div>
              <CardHeader className="pb-2 relative z-10">
                <CardTitle className="text-base font-semibold">Retrieval Performance</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 relative z-10">
                <div className="h-[300px] flex items-center justify-center">
                  <div className="relative w-32 h-32 rounded-xl bg-gradient-to-br from-blue-500/20 via-cyan-500/10 to-blue-500/20 flex items-center justify-center">
                    <LineChart className="h-16 w-16 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="distribution">
            <Card className="enterprise-card group relative overflow-hidden hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] border border-border/50 bg-card/80 backdrop-blur-sm">
              <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-purple-500/20 via-transparent to-pink-500/20" />
              </div>
              <CardHeader className="pb-2 relative z-10">
                <CardTitle className="text-base font-semibold">Embedding Size Distribution</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 relative z-10">
                <div className="h-[300px] flex items-center justify-center">
                  <div className="relative w-32 h-32 rounded-xl bg-gradient-to-br from-purple-500/20 via-pink-500/10 to-purple-500/20 flex items-center justify-center">
                    <BarChart2 className="h-16 w-16 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="p-4 sm:p-5 rounded-lg bg-gradient-to-br from-muted/80 to-muted/40 backdrop-blur-sm border border-border/50">
          <h4 className="font-semibold mb-2 text-sm sm:text-base">Analytics Insights</h4>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {embeddings.length === 0
              ? "No embeddings data available yet. Create embeddings to see analytics."
              : `You have ${embeddings.length} embeddings across ${Object.keys(sourceTypeCounts).length} source types and ${Object.keys(modelCounts).length} models.`}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
