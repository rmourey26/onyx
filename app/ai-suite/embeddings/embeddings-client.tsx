"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmbeddingsTableAdvanced } from "@/components/embeddings/embeddings-table-advanced"
import { EmbeddingsUploader } from "@/components/embeddings/embeddings-uploader"
import { EmbeddingsSettings } from "@/components/embeddings/embeddings-settings"
import { RagConfiguration } from "@/components/embeddings/rag-configuration"
import { EmbeddingsAnalytics } from "@/components/embeddings/embeddings-analytics"
import { EmbeddingsJobs } from "@/components/embeddings/embeddings-jobs"
import { Card, CardContent } from "@/components/ui/card"
import { Database, Upload, Settings, Zap, BarChart, Clock } from "lucide-react"
import type { User } from "@supabase/supabase-js"
import type { DataEmbedding, AIModel, AIAgent, EmbeddingJob } from "@/lib/types/database"
import { SeedEmbeddingsButton } from "@/components/embeddings/seed-embeddings-button"

interface EmbeddingsClientProps {
  user: User
  embeddings: DataEmbedding[]
  aiModels: AIModel[]
  aiAgents: AIAgent[]
  embeddingJobs: EmbeddingJob[]
  userSettings: any
}

export function EmbeddingsClient({
  user,
  embeddings,
  aiModels,
  aiAgents,
  embeddingJobs,
  userSettings,
}: EmbeddingsClientProps) {
  const [activeTab, setActiveTab] = useState("embeddings")
  const [embeddingModels, setEmbeddingModels] = useState<AIModel[]>([])
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Filter models with embedding capabilities
  useEffect(() => {
    const filtered = aiModels.filter(
      (model) => Array.isArray(model.capabilities) && model.capabilities.includes("embedding"),
    )
    setEmbeddingModels(filtered)
  }, [aiModels])

  const refreshData = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <Card className="enterprise-card glass-morphism border-none">
      <CardContent className="p-4 sm:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="w-full overflow-x-auto mb-6">
            <TabsList className="inline-flex lg:grid lg:grid-cols-6 gap-1 sm:gap-2 w-auto lg:w-full min-w-max lg:min-w-0 h-auto p-1 bg-muted/50 backdrop-blur-sm">
              <TabsTrigger
                value="embeddings"
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 whitespace-nowrap text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Database className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span>Embeddings</span>
              </TabsTrigger>
              <TabsTrigger
                value="upload"
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 whitespace-nowrap text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Upload className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span>Upload</span>
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 whitespace-nowrap text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span>Settings</span>
              </TabsTrigger>
              <TabsTrigger
                value="rag"
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 whitespace-nowrap text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span>RAG Config</span>
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 whitespace-nowrap text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <BarChart className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span>Analytics</span>
              </TabsTrigger>
              <TabsTrigger
                value="jobs"
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 whitespace-nowrap text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span>Jobs</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="embeddings" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <EmbeddingsTableAdvanced
                  embeddings={embeddings}
                  userId={user.id}
                  refreshData={refreshData}
                  key={`embeddings-table-${refreshTrigger}`}
                />
              </div>
              <div className="space-y-4">
                <SeedEmbeddingsButton userId={user.id} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="upload" className="mt-0">
            <EmbeddingsUploader
              userId={user.id}
              embeddingModels={embeddingModels}
              defaultSettings={userSettings}
              refreshData={refreshData}
            />
          </TabsContent>

          <TabsContent value="settings" className="mt-0">
            <EmbeddingsSettings
              userId={user.id}
              embeddingModels={embeddingModels}
              currentSettings={userSettings}
              refreshData={refreshData}
            />
          </TabsContent>

          <TabsContent value="rag" className="mt-0">
            <RagConfiguration userId={user.id} aiAgents={aiAgents} embeddings={embeddings} refreshData={refreshData} />
          </TabsContent>

          <TabsContent value="analytics" className="mt-0">
            <EmbeddingsAnalytics userId={user.id} embeddings={embeddings} />
          </TabsContent>

          <TabsContent value="jobs" className="mt-0">
            <EmbeddingsJobs jobs={embeddingJobs} userId={user.id} refreshData={refreshData} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
