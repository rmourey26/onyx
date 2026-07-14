"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { saveRagSettings, getRagSettings } from "@/app/actions/embedding-actions"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Save, Zap, Info } from "lucide-react"
import type { DataEmbedding, AIAgent } from "@/lib/types/database"

interface RagConfigurationProps {
  userId: string
  aiAgents: AIAgent[]
  embeddings: DataEmbedding[]
  refreshData: () => void
}

export function RagConfiguration({ userId, aiAgents, embeddings, refreshData }: RagConfigurationProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [settings, setSettings] = useState<Record<string, any>>({})

  useEffect(() => {
    if (aiAgents.length > 0 && !selectedAgent) {
      setSelectedAgent(aiAgents[0].id)
    }
  }, [aiAgents, selectedAgent])

  useEffect(() => {
    const loadSettings = async () => {
      if (!selectedAgent) return

      setIsLoading(true)
      try {
        const savedSettings = await getRagSettings(userId, selectedAgent)
        if (savedSettings) {
          setSettings(savedSettings)
        } else {
          // Default settings
          setSettings({
            enabled: false,
            embeddingIds: [],
            similarityThreshold: 0.7,
            maxResults: 5,
            includeMetadata: true,
            includeContent: true,
            prependRetrievedContent: true,
            retrievalPrompt:
              "Use the following retrieved information to answer the question. If you don't know the answer based on the retrieved information, say that you don't know.",
            retrievalStrategy: "similarity",
            reranking: false,
            rerankingModel: "",
            rerankingThreshold: 0.5,
          })
        }
      } catch (error) {
        console.error("Error loading RAG settings:", error)
        toast({
          title: "Error",
          description: "Failed to load RAG settings.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [userId, selectedAgent])

  const handleSaveSettings = async () => {
    if (!selectedAgent) return

    setIsSaving(true)
    try {
      await saveRagSettings(userId, selectedAgent, settings)
      toast({
        title: "Settings saved",
        description: "Your RAG settings have been saved successfully.",
      })
      refreshData()
    } catch (error) {
      console.error("Error saving RAG settings:", error)
      toast({
        title: "Error",
        description: "Failed to save RAG settings.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const toggleEmbedding = (embeddingId: string) => {
    const currentIds = settings.embeddingIds || []
    if (currentIds.includes(embeddingId)) {
      setSettings({
        ...settings,
        embeddingIds: currentIds.filter((id: string) => id !== embeddingId),
      })
    } else {
      setSettings({
        ...settings,
        embeddingIds: [...currentIds, embeddingId],
      })
    }
  }

  if (!selectedAgent) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <Zap className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            {aiAgents.length === 0
              ? "You don't have any AI agents yet. Create an agent first to configure RAG."
              : "Select an agent to configure RAG settings."}
          </p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>RAG Configuration</CardTitle>
        <CardDescription>Configure Retrieval Augmented Generation settings for your AI agents</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="agentSelect">Select AI Agent</Label>
          <Select value={selectedAgent || ""} onValueChange={setSelectedAgent}>
            <SelectTrigger id="agentSelect">
              <SelectValue placeholder="Select an agent" />
            </SelectTrigger>
            <SelectContent>
              {aiAgents.map((agent) => (
                <SelectItem key={agent.id} value={agent.id}>
                  {agent.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="ragEnabled">Enable RAG for this agent</Label>
            <p className="text-sm text-muted-foreground">
              Use embeddings to enhance responses with relevant information
            </p>
          </div>
          <Switch
            id="ragEnabled"
            checked={settings.enabled}
            onCheckedChange={(checked) => setSettings({ ...settings, enabled: checked })}
          />
        </div>

        {settings.enabled && (
          <Tabs defaultValue="sources">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="sources">Sources</TabsTrigger>
              <TabsTrigger value="retrieval">Retrieval</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="sources" className="space-y-4">
              <div className="space-y-2">
                <Label>Select Embeddings to Use</Label>
                <div className="border rounded-md p-4 max-h-[300px] overflow-y-auto">
                  {embeddings.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No embeddings available. Upload files to create embeddings.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {embeddings.map((embedding) => (
                        <div key={embedding.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`embedding-${embedding.id}`}
                            checked={(settings.embeddingIds || []).includes(embedding.id)}
                            onCheckedChange={() => toggleEmbedding(embedding.id)}
                          />
                          <Label htmlFor={`embedding-${embedding.id}`} className="text-sm font-normal cursor-pointer">
                            {embedding.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {embeddings.length > 0 && (settings.embeddingIds || []).length === 0 && (
                  <p className="text-xs text-amber-500 flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    <span>Select at least one embedding source to use with RAG</span>
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="retrieval" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="similarityThreshold">
                      Similarity Threshold: {settings.similarityThreshold?.toFixed(2)}
                    </Label>
                  </div>
                  <Slider
                    id="similarityThreshold"
                    min={0.1}
                    max={1.0}
                    step={0.05}
                    value={[settings.similarityThreshold || 0.7]}
                    onValueChange={(value) => setSettings({ ...settings, similarityThreshold: value[0] })}
                  />
                  <p className="text-xs text-muted-foreground">Minimum similarity score required for retrieval (0-1)</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="maxResults">Max Results: {settings.maxResults}</Label>
                  </div>
                  <Slider
                    id="maxResults"
                    min={1}
                    max={20}
                    step={1}
                    value={[settings.maxResults || 5]}
                    onValueChange={(value) => setSettings({ ...settings, maxResults: value[0] })}
                  />
                  <p className="text-xs text-muted-foreground">Maximum number of documents to retrieve</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="retrievalStrategy">Retrieval Strategy</Label>
                <Select
                  value={settings.retrievalStrategy || "similarity"}
                  onValueChange={(value) => setSettings({ ...settings, retrievalStrategy: value })}
                >
                  <SelectTrigger id="retrievalStrategy">
                    <SelectValue placeholder="Select a retrieval strategy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="similarity">Similarity Search</SelectItem>
                    <SelectItem value="mmr">Maximum Marginal Relevance</SelectItem>
                    <SelectItem value="hybrid">Hybrid Search</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {settings.retrievalStrategy === "mmr"
                    ? "MMR balances relevance with diversity in results"
                    : settings.retrievalStrategy === "hybrid"
                      ? "Hybrid combines keyword and semantic search"
                      : "Similarity search finds the most semantically similar documents"}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Retrieval Options</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeMetadata"
                      checked={settings.includeMetadata}
                      onCheckedChange={(checked) => setSettings({ ...settings, includeMetadata: !!checked })}
                    />
                    <Label htmlFor="includeMetadata" className="text-sm font-normal cursor-pointer">
                      Include metadata with retrieved content
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeContent"
                      checked={settings.includeContent}
                      onCheckedChange={(checked) => setSettings({ ...settings, includeContent: !!checked })}
                    />
                    <Label htmlFor="includeContent" className="text-sm font-normal cursor-pointer">
                      Include full content in retrieval results
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="prependRetrievedContent"
                      checked={settings.prependRetrievedContent}
                      onCheckedChange={(checked) => setSettings({ ...settings, prependRetrievedContent: !!checked })}
                    />
                    <Label htmlFor="prependRetrievedContent" className="text-sm font-normal cursor-pointer">
                      Prepend retrieved content to AI prompts
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="retrievalPrompt">Retrieval Prompt</Label>
                <Textarea
                  id="retrievalPrompt"
                  value={settings.retrievalPrompt || ""}
                  onChange={(e) => setSettings({ ...settings, retrievalPrompt: e.target.value })}
                  placeholder="Instructions for the AI on how to use the retrieved content"
                  className="min-h-[100px]"
                />
                <p className="text-xs text-muted-foreground">
                  Instructions for the AI on how to use the retrieved content
                </p>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="reranking">Enable Reranking</Label>
                  <p className="text-sm text-muted-foreground">Rerank retrieved documents for better relevance</p>
                </div>
                <Switch
                  id="reranking"
                  checked={settings.reranking}
                  onCheckedChange={(checked) => setSettings({ ...settings, reranking: checked })}
                />
              </div>

              {settings.reranking && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="rerankingModel">Reranking Model</Label>
                    <Select
                      value={settings.rerankingModel || ""}
                      onValueChange={(value) => setSettings({ ...settings, rerankingModel: value })}
                    >
                      <SelectTrigger id="rerankingModel">
                        <SelectValue placeholder="Select a reranking model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cohere-rerank">Cohere Rerank</SelectItem>
                        <SelectItem value="bge-reranker">BGE Reranker</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="rerankingThreshold">
                        Reranking Threshold: {settings.rerankingThreshold?.toFixed(2)}
                      </Label>
                    </div>
                    <Slider
                      id="rerankingThreshold"
                      min={0.1}
                      max={1.0}
                      step={0.05}
                      value={[settings.rerankingThreshold || 0.5]}
                      onValueChange={(value) => setSettings({ ...settings, rerankingThreshold: value[0] })}
                    />
                    <p className="text-xs text-muted-foreground">Minimum score required after reranking</p>
                  </div>
                </>
              )}

              <div className="p-4 bg-muted rounded-md">
                <h4 className="font-medium mb-2">Advanced RAG Techniques</h4>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>• Reranking improves retrieval quality by reordering results</li>
                  <li>• Hybrid search combines keyword and semantic search for better results</li>
                  <li>• MMR reduces redundancy in retrieved documents</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSaveSettings} disabled={isSaving} className="w-full">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save RAG Settings
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
