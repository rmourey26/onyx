"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { getRagSettings, saveRagSettings } from "@/app/actions/embedding-actions"
import { toast } from "@/components/ui/use-toast"
import type { DataEmbedding, AIAgent } from "@/lib/types/database"
import { Loader2, Save } from "lucide-react"

interface RagSettingsProps {
  userId: string
  aiAgents: AIAgent[]
  embeddings: DataEmbedding[]
}

export function RagSettings({ userId, aiAgents, embeddings }: RagSettingsProps) {
  const [selectedAgent, setSelectedAgent] = useState<string>("")
  const [settings, setSettings] = useState({
    enabled: false,
    embeddingIds: [] as string[],
    retrievalTopK: 5,
    similarityThreshold: 0.7,
    includeMetadata: true,
    includeContent: true,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (selectedAgent) {
      loadAgentSettings(selectedAgent)
    }
  }, [selectedAgent])

  const loadAgentSettings = async (agentId: string) => {
    setIsLoading(true)
    try {
      const savedSettings = await getRagSettings(userId, agentId)
      if (savedSettings) {
        setSettings(savedSettings)
      } else {
        // Reset to defaults if no settings found
        setSettings({
          enabled: false,
          embeddingIds: [],
          retrievalTopK: 5,
          similarityThreshold: 0.7,
          includeMetadata: true,
          includeContent: true,
        })
      }
    } catch (error) {
      console.error("Error loading RAG settings:", error)
      toast({
        title: "Error",
        description: "Failed to load RAG settings for this agent.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    if (!selectedAgent) {
      toast({
        title: "No agent selected",
        description: "Please select an agent to save settings for.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      await saveRagSettings(userId, selectedAgent, settings)
      toast({
        title: "Settings saved",
        description: "RAG settings for this agent have been saved successfully.",
      })
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
    if (settings.embeddingIds.includes(embeddingId)) {
      setSettings({
        ...settings,
        embeddingIds: settings.embeddingIds.filter((id) => id !== embeddingId),
      })
    } else {
      setSettings({
        ...settings,
        embeddingIds: [...settings.embeddingIds, embeddingId],
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>RAG Configuration</CardTitle>
        <CardDescription>Configure Retrieval Augmented Generation settings for your AI agents</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="agent-select">Select Agent</Label>
          <Select value={selectedAgent} onValueChange={setSelectedAgent}>
            <SelectTrigger id="agent-select">
              <SelectValue placeholder="Select an AI agent" />
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

        {selectedAgent && (
          <>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="rag-enabled">Enable RAG</Label>
                    <p className="text-sm text-muted-foreground">Use document embeddings to enhance AI responses</p>
                  </div>
                  <Switch
                    id="rag-enabled"
                    checked={settings.enabled}
                    onCheckedChange={(checked) => setSettings({ ...settings, enabled: checked })}
                  />
                </div>

                {settings.enabled && (
                  <>
                    <div className="space-y-2">
                      <Label>Select Embeddings to Use</Label>
                      <div className="border rounded-md p-4 max-h-60 overflow-y-auto space-y-2">
                        {embeddings.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            No embeddings available. Upload files to create embeddings.
                          </p>
                        ) : (
                          embeddings.map((embedding) => (
                            <div key={embedding.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`embedding-${embedding.id}`}
                                checked={settings.embeddingIds.includes(embedding.id)}
                                onCheckedChange={() => toggleEmbedding(embedding.id)}
                              />
                              <Label htmlFor={`embedding-${embedding.id}`} className="text-sm">
                                {embedding.name}
                              </Label>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="top-k">Top K Results: {settings.retrievalTopK}</Label>
                        </div>
                        <Slider
                          id="top-k"
                          min={1}
                          max={20}
                          step={1}
                          value={[settings.retrievalTopK]}
                          onValueChange={(value) => setSettings({ ...settings, retrievalTopK: value[0] })}
                        />
                        <p className="text-xs text-muted-foreground">Number of most similar documents to retrieve.</p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="similarity-threshold">
                            Similarity Threshold: {settings.similarityThreshold.toFixed(2)}
                          </Label>
                        </div>
                        <Slider
                          id="similarity-threshold"
                          min={0}
                          max={1}
                          step={0.01}
                          value={[settings.similarityThreshold]}
                          onValueChange={(value) => setSettings({ ...settings, similarityThreshold: value[0] })}
                        />
                        <p className="text-xs text-muted-foreground">
                          Minimum similarity score required for retrieval (0-1).
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="include-metadata"
                          checked={settings.includeMetadata}
                          onCheckedChange={(checked) => setSettings({ ...settings, includeMetadata: checked === true })}
                        />
                        <Label htmlFor="include-metadata">Include document metadata in context</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="include-content"
                          checked={settings.includeContent}
                          onCheckedChange={(checked) => setSettings({ ...settings, includeContent: checked === true })}
                        />
                        <Label htmlFor="include-content">Include document content in context</Label>
                      </div>
                    </div>
                  </>
                )}

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
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
