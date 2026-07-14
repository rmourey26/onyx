"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Search, MapPin, Calendar, TruckIcon } from "lucide-react"
import { searchSimilarShipments } from "@/app/actions/embedding-search-actions"
import { formatDistanceToNow, format } from "date-fns"
import type { ShipmentSearchResult } from "@/lib/types/search"

interface SimilaritySearchProps {
  userId: string
}

export function SimilaritySearch({ userId }: SimilaritySearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchType, setSearchType] = useState<"text" | "id">("text")
  const [threshold, setThreshold] = useState(0.7)
  const [limit, setLimit] = useState(10)
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<ShipmentSearchResult[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setHasSearched(true)

    try {
      const results = await searchSimilarShipments({
        userId,
        query: searchQuery,
        searchType,
        threshold,
        limit,
      })
      setSearchResults(results)
    } catch (error) {
      console.error("Error searching shipments:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const formatAddress = (address: any) => {
    if (!address) return "N/A"
    return `${address.city}, ${address.country}`
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "in transit":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "delayed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Similarity Search
        </CardTitle>
        <CardDescription>Find shipments similar to your query using vector embeddings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="text" onValueChange={(value) => setSearchType(value as "text" | "id")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text">Text Search</TabsTrigger>
            <TabsTrigger value="id">Tracking Number</TabsTrigger>
          </TabsList>
          <TabsContent value="text" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="text-query">Search Query</Label>
              <Input
                id="text-query"
                placeholder="e.g., international shipment to Japan with high value"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </TabsContent>
          <TabsContent value="id" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="id-query">Tracking Number</Label>
              <Input
                id="id-query"
                placeholder="e.g., TRACK-123456789"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="threshold">Similarity Threshold: {threshold.toFixed(2)}</Label>
            </div>
            <Slider
              id="threshold"
              min={0}
              max={1}
              step={0.01}
              value={[threshold]}
              onValueChange={(value) => setThreshold(value[0])}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="limit">Results Limit</Label>
            <Select value={limit.toString()} onValueChange={(value) => setLimit(Number.parseInt(value))}>
              <SelectTrigger id="limit">
                <SelectValue placeholder="Select limit" />
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
              Search Similar Shipments
            </>
          )}
        </Button>
      </CardContent>

      {hasSearched && (
        <CardFooter className="flex flex-col">
          <div className="w-full">
            <h3 className="text-lg font-medium mb-4">
              Search Results {searchResults.length > 0 && `(${searchResults.length})`}
            </h3>

            {searchResults.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No similar shipments found. Try adjusting your search criteria.
              </div>
            ) : (
              <div className="space-y-4">
                {searchResults.map((result) => (
                  <Card key={result.id} className="overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      <div className="p-4 md:w-2/3">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{result.tracking_number}</h4>
                          <Badge className={getStatusColor(result.status)}>{result.status}</Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">From:</span> {formatAddress(result.origin_address)}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">To:</span>{" "}
                            {formatAddress(result.destination_address)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">Shipped:</span>{" "}
                            {result.shipping_date
                              ? format(new Date(result.shipping_date), "MMM d, yyyy")
                              : "Not shipped"}
                          </div>
                          <div className="flex items-center gap-1">
                            <TruckIcon className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">Carrier:</span> {result.carrier}
                          </div>
                        </div>

                        {result.notes && <p className="text-sm text-muted-foreground">{result.notes}</p>}
                      </div>

                      <div className="bg-muted p-4 md:w-1/3 flex flex-col justify-between">
                        <div>
                          <p className="text-sm font-medium mb-1">Similarity Score</p>
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-secondary rounded-full h-2.5">
                              <div
                                className="bg-primary h-2.5 rounded-full"
                                style={{ width: `${result.similarity * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{(result.similarity * 100).toFixed(1)}%</span>
                          </div>
                        </div>

                        <div className="mt-4">
                          <p className="text-xs text-muted-foreground">
                            Created {formatDistanceToNow(new Date(result.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
