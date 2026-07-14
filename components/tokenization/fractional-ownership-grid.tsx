"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Coins, TrendingUp, Users, ExternalLink } from "lucide-react"
import { motion } from "framer-motion"

interface FractionalOwnershipGridProps {
  fractions: any[]
  loading: boolean
  onRefresh: () => void
}

export function FractionalOwnershipGrid({ fractions, loading, onRefresh }: FractionalOwnershipGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2 mt-2" />
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (fractions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-12">
          <Coins className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Fractional Holdings</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            You don't own any fractional tokens yet. Browse the marketplace to invest in fractionalized assets.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {fractions.map((fraction, index) => {
        const pool = fraction.fractionalization_pools
        const asset = pool?.asset_tokens?.assets
        const ownershipPercent = (fraction.ownership_percentage || 0).toFixed(2)

        return (
          <motion.div
            key={fraction.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg line-clamp-1">{asset?.name || "Unknown Asset"}</CardTitle>
                    <CardDescription className="text-xs mt-1">{asset?.asset_type || "Asset"}</CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-primary/10">
                    {ownershipPercent}%
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Fractions Owned</p>
                    <p className="text-lg font-bold">{fraction.fraction_count}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Total Fractions</p>
                    <p className="text-lg font-bold">{pool?.total_fractions || 0}</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-muted-foreground">Your Share</span>
                    <span className="font-medium">{ownershipPercent}%</span>
                  </div>
                  <Progress value={Number.parseFloat(ownershipPercent)} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Purchase Price</span>
                    <span className="font-medium">${(fraction.purchase_price || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Asset Value</span>
                    <span className="font-medium">${(asset?.current_value || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Your Value</span>
                    <span className="font-bold text-primary">
                      ${((asset?.current_value || 0) * (Number.parseFloat(ownershipPercent) / 100)).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t flex items-center gap-2">
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <TrendingUp className="w-3 h-3" />
                    <span className="font-medium">Active</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="w-3 h-3" />
                    <span>Pool Active</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-0">
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  <ExternalLink className="w-3 h-3 mr-2" />
                  View Details
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
