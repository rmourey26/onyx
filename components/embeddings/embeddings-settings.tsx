"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { saveEmbeddingsSettings } from "@/app/actions/embedding-actions"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Save, FileText, Code, Database } from "lucide-react"
import type { AIModel } from "@/lib/types/database"

interface EmbeddingsSettingsProps {
  userId: string
  embeddingModels: AIModel[]
  currentSettings: any
  refreshData: () => void
}

export function EmbeddingsSettings({ userId, embeddingModels, currentSettings, refreshData }: EmbeddingsSettingsProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState({
    defaultModelId:
      currentSettings?.defaultModelId || (embeddingModels && embeddingModels.length > 0 ? embeddingModels[0].id : ""),
    autoEmbedEnabled: currentSettings?.autoEmbedEnabled || false,
    defaultChunkSize: currentSettings?.defaultChunkSize || 1000,
    defaultChunkOverlap: currentSettings?.defaultChunkOverlap || 200,
    similarityThreshold: currentSettings?.similarityThreshold || 0.7,
    maxResults: currentSettings?.maxResults || 5,
    autoEmbedFileTypes: currentSettings?.autoEmbedFileTypes || ["txt", "pdf", "md"],
    defaultSourceType: currentSettings?.defaultSourceType || "document",
  })

  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      await saveEmbeddingsSettings(userId, settings)
      toast({
        title: "Settings saved",
        description: "Your embedding settings have been saved successfully.",
      })
      refreshData()
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Failed to save embedding settings.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const toggleFileType = (fileType: string) => {
    if (settings.autoEmbedFileTypes.includes(fileType)) {
      setSettings({
        ...settings,
        autoEmbedFileTypes: settings.autoEmbedFileTypes.filter((type) => type !== fileType),
      })
    } else {
      setSettings({
        ...settings,
        autoEmbedFileTypes: [...settings.autoEmbedFileTypes, fileType],
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Embedding Settings</CardTitle>
        <CardDescription>Configure default settings for your embeddings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="general">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="chunking">Chunking</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="defaultModel">Default Embedding Model</Label>
              <Select
                value={settings.defaultModelId}
                onValueChange={(value) => setSettings({ ...settings, defaultModelId: value })}
              >
                <SelectTrigger id="defaultModel">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {embeddingModels.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                This model will be used by default when creating new embeddings
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultSourceType">Default Source Type</Label>
              <Select
                value={settings.defaultSourceType}
                onValueChange={(value) => setSettings({ ...settings, defaultSourceType: value })}
              >
                <SelectTrigger id="defaultSourceType">
                  <SelectValue placeholder="Select a source type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="document">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>Document</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="code">
                    <div className="flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      <span>Code</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="database">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      <span>Database</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">The default source type for new embeddings</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="similarityThreshold">
                  Default Similarity Threshold: {settings.similarityThreshold.toFixed(2)}
                </Label>
              </div>
              <Slider
                id="similarityThreshold"
                min={0.1}
                max={1.0}
                step={0.05}
                value={[settings.similarityThreshold]}
                onValueChange={(value) => setSettings({ ...settings, similarityThreshold: value[0] })}
              />
              <p className="text-xs text-muted-foreground">
                Minimum similarity score for retrieving relevant documents (0.1-1.0)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxResults">Maximum Results</Label>
              <Input
                id="maxResults"
                type="number"
                min={1}
                max={20}
                value={settings.maxResults}
                onChange={(e) => setSettings({ ...settings, maxResults: Number.parseInt(e.target.value) || 5 })}
              />
              <p className="text-xs text-muted-foreground">Maximum number of documents to retrieve during search</p>
            </div>
          </TabsContent>

          <TabsContent value="chunking" className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="defaultChunkSize">Default Chunk Size: {settings.defaultChunkSize}</Label>
              </div>
              <Slider
                id="defaultChunkSize"
                min={100}
                max={2000}
                step={50}
                value={[settings.defaultChunkSize]}
                onValueChange={(value) => setSettings({ ...settings, defaultChunkSize: value[0] })}
              />
              <p className="text-xs text-muted-foreground">Default number of characters per chunk for new embeddings</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="defaultChunkOverlap">Default Chunk Overlap: {settings.defaultChunkOverlap}</Label>
              </div>
              <Slider
                id="defaultChunkOverlap"
                min={0}
                max={500}
                step={10}
                value={[settings.defaultChunkOverlap]}
                onValueChange={(value) => setSettings({ ...settings, defaultChunkOverlap: value[0] })}
              />
              <p className="text-xs text-muted-foreground">Default number of characters to overlap between chunks</p>
            </div>

            <div className="p-4 bg-muted rounded-md">
              <h4 className="font-medium mb-2">Chunking Strategy Tips</h4>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>• Smaller chunks (200-500 chars) are better for precise information retrieval</li>
                <li>• Larger chunks (1000-2000 chars) preserve more context but may be less precise</li>
                <li>• Higher overlap (100-300 chars) helps maintain context between chunks</li>
                <li>• For code, consider using function or class-level chunking</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="automation" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="autoEmbedEnabled">Automatic Embeddings</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically create embeddings for new documents and data
                </p>
              </div>
              <Switch
                id="autoEmbedEnabled"
                checked={settings.autoEmbedEnabled}
                onCheckedChange={(checked) => setSettings({ ...settings, autoEmbedEnabled: checked })}
              />
            </div>

            {settings.autoEmbedEnabled && (
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>File Types for Automatic Embedding</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {["txt", "pdf", "doc", "docx", "csv", "json", "md"].map((fileType) => (
                      <div key={fileType} className="flex items-center space-x-2">
                        <Checkbox
                          id={`fileType-${fileType}`}
                          checked={settings.autoEmbedFileTypes.includes(fileType)}
                          onCheckedChange={() => toggleFileType(fileType)}
                        />
                        <Label htmlFor={`fileType-${fileType}`} className="text-sm">
                          .{fileType}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-md">
                  <h4 className="font-medium mb-2">Automation Settings</h4>
                  <p className="text-sm text-muted-foreground">
                    When enabled, files of the selected types will be automatically processed for embeddings when
                    uploaded to your storage.
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
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
              Save Settings
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
