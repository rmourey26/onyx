"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Loader2, Search, Brain, Lightbulb, Wrench, TrendingUp } from "lucide-react"
import { searchSimilarAssets, getAssetRecommendations } from "@/app/actions/asset-embedding-actions"
import { formatDistanceToNow } from "date-fns"
import type { AssetSearchResult } from "@/lib/embeddings/asset-embedding-system"

interface AssetRAGSearchProps {
  userId: string
  assets?: Array<{ id: string; name: string; asset_type: string; category?: string }>
}

export function AssetRAGSearch({ userId, assets = [] }: AssetRAGSearchProps) {
  const [activeTab, setActiveTab] = useState("search")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAssetTypes, setSelectedAssetTypes] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedDocumentTypes, setSelectedDocumentTypes] = useState<string[]>([])
  const [threshold, setThreshold] = useState(0.7)
  const [limit, setLimit] = useState(10)
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<AssetSearchResult[]>([])

  // Recommendations state
  const [selectedAsset, setSelectedAsset] = useState("")
  const [recommendationType, setRecommendationType] = useState<
    "maintenance" | "optimization" | "replacement" | "similar_issues"
  >("maintenance")
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false)
  const [recommendations, setRecommendations] = useState<AssetSearchResult[]>([])

  // Get unique asset types and categories with safe fallbacks
  const safeAssets = assets || []
  const assetTypes = [...new Set(safeAssets.map((a) => a.asset_type).filter(Boolean))]
  const categories = [...new Set(safeAssets.map((a) => a.category).filter(Boolean))] as string[]
  const documentTypes = ["asset_profile", "lifecycle_event", "maintenance_log", "compliance_report", "insight"]

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      const result = await searchSimilarAssets({
        query: searchQuery,
        asset_types: selectedAssetTypes,
        categories: selectedCategories,
        document_types: selectedDocumentTypes,
        limit,
        threshold,
      })

      if (result.success) {
        setSearchResults(result.data || [])
      } else {
        console.error("Search failed:", result.error)
      }
    } catch (error) {
      console.error("Error searching assets:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleGetRecommendations = async () => {
    if (!selectedAsset) return

    setIsLoadingRecommendations(true)
    try {
      const result = await getAssetRecommendations({
        asset_id: selectedAsset,
        recommendation_type: recommendationType,
        limit: 5,
        threshold: 0.75,
      })

      if (result.success) {
        setRecommendations(result.data || [])
      } else {
        console.error("Recommendations failed:", result.error)
      }
    } catch (error) {
      console.error("Error getting recommendations:", error)
    } finally {
      setIsLoadingRecommendations(false)
    }
  }

  const toggleAssetType = (assetType: string) => {
    setSelectedAssetTypes((prev) =>
      prev.includes(assetType) ? prev.filter((t) => t !== assetType) : [...prev, assetType],
    )
  }

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  const toggleDocumentType = (docType: string) => {
    setSelectedDocumentTypes((prev) =>
      prev.includes(docType) ? prev.filter((d) => d !== docType) : [...prev, docType],
    )
  }

  const getDocumentTypeIcon = (docType: string) => {
    switch (docType) {
      case "asset_profile":
        return "📋"
      case "lifecycle_event":
        return "🔄"
      case "maintenance_log":
        return "🔧"
      case "compliance_report":
        return "📊"
      case "insight":
        return "💡"
      default:
        return "📄"
    }
  }

  const getRecommendationTypeIcon = (type: string) => {
    switch (type) {
      case "maintenance":
        return <Wrench className="h-4 w-4" />
      case "optimization":
        return <TrendingUp className="h-4 w-4" />
      case "replacement":
        return <Brain className="h-4 w-4" />
      case "similar_issues":
        return <Lightbulb className="h-4 w-4" />
      default:
        return <Search className="h-4 w-4" />
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Asset Intelligence RAG Search
        </CardTitle>
        <CardDescription>
          Use AI-powered semantic search to find similar assets, patterns, and recommendations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search">Semantic Search</TabsTrigger>
            <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search-query">Search Query</Label>
                <Input
                  id="search-query"
                  placeholder="e.g., high maintenance cost equipment, predictive maintenance insights, compliance issues"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Asset Types</Label>
                  <div className="border rounded-md p-3 max-h-32 overflow-y-auto space-y-2">
                    {assetTypes.length > 0 ? (
                      assetTypes.map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox
                            id={`type-${type}`}
                            checked={selectedAssetTypes.includes(type)}
                            onCheckedChange={() => toggleAssetType(type)}
                          />
                          <Label htmlFor={`type-${type}`} className="text-sm capitalize">
                            {type}
                          </Label>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No asset types available</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Categories</Label>
                  <div className="border rounded-md p-3 max-h-32 overflow-y-auto space-y-2">
                    {categories.length > 0 ? (
                      categories.map((category) => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox
                            id={`cat-${category}`}
                            checked={selectedCategories.includes(category)}
                            onCheckedChange={() => toggleCategory(category)}
                          />
                          <Label htmlFor={`cat-${category}`} className="text-sm">
                            {category}
                          </Label>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No categories available</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Document Types</Label>
                  <div className="border rounded-md p-3 max-h-32 overflow-y-auto space-y-2">
                    {documentTypes.map((docType) => (
                      <div key={docType} className="flex items-center space-x-2">
                        <Checkbox
                          id={`doc-${docType}`}
                          checked={selectedDocumentTypes.includes(docType)}
                          onCheckedChange={() => toggleDocumentType(docType)}
                        />
                        <Label htmlFor={`doc-${docType}`} className="text-sm">
                          {getDocumentTypeIcon(docType)} {docType.replace("_", " ")}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Similarity Threshold: {threshold.toFixed(2)}</Label>
                  <Slider
                    value={[threshold]}
                    onValueChange={(value) => setThreshold(value[0])}
                    min={0}
                    max={1}
                    step={0.01}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Results Limit</Label>
                  <Select value={limit.toString()} onValueChange={(value) => setLimit(Number(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 results</SelectItem>
                      <SelectItem value="10">10 results</SelectItem>
                      <SelectItem value="20">20 results</SelectItem>
                      <SelectItem value="50">50 results</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()} className="w-full">
                {isSearching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search Assets
                  </>
                )}
              </Button>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Search Results ({searchResults.length})</h3>
                <div className="space-y-3">
                  {searchResults.map((result) => (
                    <Card key={result.id} className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{result.asset_name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary">
                              {getDocumentTypeIcon(result.document_type)} {result.document_type.replace("_", " ")}
                            </Badge>
                            <Badge variant="outline">{(result.similarity * 100).toFixed(1)}% match</Badge>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3">{result.content}</p>
                      {result.metadata.created_at && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDistanceToNow(new Date(result.metadata.created_at), { addSuffix: true })}
                        </p>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Asset</Label>
                <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an asset for recommendations" />
                  </SelectTrigger>
                  <SelectContent>
                    {safeAssets.length > 0 ? (
                      safeAssets.map((asset) => (
                        <SelectItem key={asset.id} value={asset.id}>
                          {asset.name} ({asset.asset_type})
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        No assets available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Recommendation Type</Label>
                <Select value={recommendationType} onValueChange={(value: any) => setRecommendationType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maintenance">
                      <div className="flex items-center gap-2">
                        <Wrench className="h-4 w-4" />
                        Maintenance Recommendations
                      </div>
                    </SelectItem>
                    <SelectItem value="optimization">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Optimization Opportunities
                      </div>
                    </SelectItem>
                    <SelectItem value="replacement">
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        Replacement Analysis
                      </div>
                    </SelectItem>
                    <SelectItem value="similar_issues">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" />
                        Similar Issues & Solutions
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleGetRecommendations}
                disabled={isLoadingRecommendations || !selectedAsset}
                className="w-full"
              >
                {isLoadingRecommendations ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Recommendations...
                  </>
                ) : (
                  <>
                    {getRecommendationTypeIcon(recommendationType)}
                    <span className="ml-2">Get AI Recommendations</span>
                  </>
                )}
              </Button>
            </div>

            {recommendations.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">AI Recommendations ({recommendations.length})</h3>
                <div className="space-y-3">
                  {recommendations.map((rec) => (
                    <Card key={rec.id} className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{rec.asset_name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary">
                              {getDocumentTypeIcon(rec.document_type)} {rec.document_type.replace("_", " ")}
                            </Badge>
                            <Badge variant="outline">{(rec.similarity * 100).toFixed(1)}% relevance</Badge>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{rec.content}</p>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
