"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Loader2, Boxes, RefreshCw, MapPin, Calendar, TruckIcon } from "lucide-react"
import { clusterShipments } from "@/app/actions/embedding-cluster-actions"
import { format } from "date-fns"
import type { ClusterResult } from "@/lib/types/search"

interface ShipmentClustersProps {
  userId: string
}

export function ShipmentClusters({ userId }: ShipmentClustersProps) {
  const [clusters, setClusters] = useState<ClusterResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [clusterCount, setClusterCount] = useState("5")
  const [algorithm, setAlgorithm] = useState("kmeans")
  const [selectedCluster, setSelectedCluster] = useState<number | null>(null)

  const loadClusters = async () => {
    setIsLoading(true)
    try {
      const results = await clusterShipments({
        userId,
        clusterCount: Number.parseInt(clusterCount),
        algorithm,
      })
      setClusters(results)
      if (results.length > 0) {
        setSelectedCluster(0)
      }
    } catch (error) {
      console.error("Error clustering shipments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadClusters()
  }, [])

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

  const getClusterColor = (clusterId: number) => {
    const colors = [
      "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
      "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
      "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
    ]
    return colors[clusterId % colors.length]
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Boxes className="h-5 w-5" />
          Shipment Clusters
        </CardTitle>
        <CardDescription>Group similar shipments using clustering algorithms</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="space-y-2 flex-1">
            <Label htmlFor="algorithm">Clustering Algorithm</Label>
            <Select value={algorithm} onValueChange={setAlgorithm}>
              <SelectTrigger id="algorithm">
                <SelectValue placeholder="Select algorithm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kmeans">K-Means</SelectItem>
                <SelectItem value="hierarchical">Hierarchical</SelectItem>
                <SelectItem value="dbscan">DBSCAN</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 flex-1">
            <Label htmlFor="clusterCount">Number of Clusters</Label>
            <Select value={clusterCount} onValueChange={setClusterCount}>
              <SelectTrigger id="clusterCount">
                <SelectValue placeholder="Select cluster count" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 clusters</SelectItem>
                <SelectItem value="5">5 clusters</SelectItem>
                <SelectItem value="7">7 clusters</SelectItem>
                <SelectItem value="10">10 clusters</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button onClick={loadClusters} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Clustering...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Clusters
                </>
              )}
            </Button>
          </div>
        </div>

        {clusters.length > 0 ? (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {clusters.map((cluster, index) => (
                <Badge
                  key={index}
                  className={`${getClusterColor(index)} cursor-pointer ${
                    selectedCluster === index ? "ring-2 ring-offset-2" : ""
                  }`}
                  onClick={() => setSelectedCluster(index)}
                >
                  Cluster {index + 1} ({cluster.shipments.length})
                </Badge>
              ))}
            </div>

            {selectedCluster !== null && clusters[selectedCluster] && (
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-md">
                  <h3 className="font-medium mb-2">Cluster {selectedCluster + 1} Characteristics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Size</p>
                      <p className="font-medium">{clusters[selectedCluster].shipments.length} shipments</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Average Distance</p>
                      <p className="font-medium">{clusters[selectedCluster].avg_distance.toFixed(3)}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-muted-foreground mb-1">Key Features</p>
                      <div className="flex flex-wrap gap-2">
                        {clusters[selectedCluster].key_features.map((feature, idx) => (
                          <Badge key={idx} variant="outline">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <h3 className="font-medium">Shipments in Cluster {selectedCluster + 1}</h3>
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {clusters[selectedCluster].shipments.map((shipment) => (
                    <Card key={shipment.id} className="overflow-hidden">
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{shipment.tracking_number}</h4>
                          <Badge className={getStatusColor(shipment.status)}>{shipment.status}</Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">From:</span>{" "}
                            {formatAddress(shipment.origin_address)}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">To:</span>{" "}
                            {formatAddress(shipment.destination_address)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">Shipped:</span>{" "}
                            {shipment.shipping_date
                              ? format(new Date(shipment.shipping_date), "MMM d, yyyy")
                              : "Not shipped"}
                          </div>
                          <div className="flex items-center gap-1">
                            <TruckIcon className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">Carrier:</span> {shipment.carrier}
                          </div>
                        </div>

                        {shipment.notes && <p className="text-sm text-muted-foreground">{shipment.notes}</p>}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Boxes className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No clusters available. Click the button above to generate clusters.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
