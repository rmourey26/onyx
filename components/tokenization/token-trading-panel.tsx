"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/hooks/use-toast"
import { Loader2, Plus, Check, X } from "lucide-react"
import useSWR from "swr"
import {
  createBuyOffer,
  getUserOffers,
  acceptOffer,
  cancelOffer,
  getTransactionHistory,
} from "@/app/actions/token-trading-actions"

interface TokenTradingPanelProps {
  userId: string
  poolId?: string
  availableFractions?: number
  pricePerFraction?: number
}

const fetcher = async (url: string) => {
  const [action, userId] = url.split("|")

  if (action === "offers") {
    const result = await getUserOffers(userId)
    if (result.success) return result.data
    throw new Error(result.error)
  }

  if (action === "transactions") {
    const result = await getTransactionHistory(userId)
    if (result.success) return result.data
    throw new Error(result.error)
  }

  return null
}

export function TokenTradingPanel({
  userId,
  poolId,
  availableFractions = 0,
  pricePerFraction = 0,
}: TokenTradingPanelProps) {
  const [showOfferDialog, setShowOfferDialog] = useState(false)
  const [offerFractions, setOfferFractions] = useState(10)
  const [offerPrice, setOfferPrice] = useState(pricePerFraction)
  const [loading, setLoading] = useState(false)

  const {
    data: offers = [],
    mutate: mutateOffers,
    isLoading: offersLoading,
  } = useSWR(`offers|${userId}`, fetcher, {
    refreshInterval: 30000,
  })

  const {
    data: transactions = [],
    mutate: mutateTransactions,
    isLoading: transactionsLoading,
  } = useSWR(`transactions|${userId}`, fetcher, {
    refreshInterval: 30000,
  })

  const handleCreateOffer = async () => {
    if (!poolId) {
      toast({
        title: "Error",
        description: "No pool selected",
        variant: "destructive",
      })
      return
    }

    if (offerFractions <= 0 || offerFractions > availableFractions) {
      toast({
        title: "Invalid Amount",
        description: `Please enter a valid number of fractions (1-${availableFractions})`,
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const result = await createBuyOffer({
        poolId,
        fractionCount: offerFractions,
        offerPrice,
        userId,
      })

      if (result.success) {
        toast({
          title: "Offer Created",
          description: "Your buy offer has been submitted",
        })
        setShowOfferDialog(false)
        mutateOffers()
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create offer",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptOffer = async (offerId: string) => {
    setLoading(true)
    try {
      const result = await acceptOffer({
        offerId,
        userId,
      })

      if (result.success) {
        toast({
          title: "Offer Accepted",
          description: "Fractional ownership has been transferred",
        })
        mutateOffers()
        mutateTransactions()
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept offer",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancelOffer = async (offerId: string) => {
    setLoading(true)
    try {
      const result = await cancelOffer(offerId, userId)

      if (result.success) {
        toast({
          title: "Offer Cancelled",
          description: "Your offer has been cancelled",
        })
        mutateOffers()
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel offer",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const myOffers = offers.filter((offer: any) => offer.buyer_id === userId && offer.status === "pending")
  const receivedOffers = offers.filter(
    (offer: any) => offer.fractionalization_pools?.asset_tokens?.user_id === userId && offer.status === "pending",
  )

  return (
    <div className="space-y-4">
      <Tabs defaultValue="offers" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="offers">My Offers</TabsTrigger>
          <TabsTrigger value="received">Received</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="offers" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>My Buy Offers</CardTitle>
                  <CardDescription>Offers you've made on fractional tokens</CardDescription>
                </div>
                {poolId && (
                  <Button size="sm" onClick={() => setShowOfferDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Offer
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {offersLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : myOffers.length === 0 ? (
                <p className="text-center text-muted-foreground p-8">No active offers</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset</TableHead>
                      <TableHead>Fractions</TableHead>
                      <TableHead>Offer Price</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myOffers.map((offer: any) => (
                      <TableRow key={offer.id}>
                        <TableCell>{offer.fractionalization_pools?.asset_tokens?.assets?.name || "Unknown"}</TableCell>
                        <TableCell>{offer.fraction_count}</TableCell>
                        <TableCell>${offer.offer_price}</TableCell>
                        <TableCell className="font-bold">${offer.total_price}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(offer.expires_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCancelOffer(offer.id)}
                            disabled={loading}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="received" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Received Offers</CardTitle>
              <CardDescription>Buy offers on your fractionalized assets</CardDescription>
            </CardHeader>
            <CardContent>
              {offersLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : receivedOffers.length === 0 ? (
                <p className="text-center text-muted-foreground p-8">No pending offers</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Fractions</TableHead>
                      <TableHead>Total Price</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {receivedOffers.map((offer: any) => (
                      <TableRow key={offer.id}>
                        <TableCell>{offer.fractionalization_pools?.asset_tokens?.assets?.name || "Unknown"}</TableCell>
                        <TableCell className="text-xs font-mono">{offer.buyer_id.slice(0, 8)}...</TableCell>
                        <TableCell>{offer.fraction_count}</TableCell>
                        <TableCell className="font-bold">${offer.total_price}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(offer.expires_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button size="sm" onClick={() => handleAcceptOffer(offer.id)} disabled={loading}>
                            <Check className="w-4 h-4 mr-1" />
                            Accept
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Your token trading activity</CardDescription>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : transactions.length === 0 ? (
                <p className="text-center text-muted-foreground p-8">No transactions yet</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Asset</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Fractions</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx: any) => (
                      <TableRow key={tx.id}>
                        <TableCell className="text-xs">{new Date(tx.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>{tx.fractionalization_pools?.asset_tokens?.assets?.name || "N/A"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{tx.from_user_id === userId ? "Sold" : "Bought"}</Badge>
                        </TableCell>
                        <TableCell>{tx.fraction_count}</TableCell>
                        <TableCell className="font-medium">${tx.price}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              tx.status === "completed" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                            }
                          >
                            {tx.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Offer Dialog */}
      <Dialog open={showOfferDialog} onOpenChange={setShowOfferDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Buy Offer</DialogTitle>
            <DialogDescription>Make an offer to purchase fractional tokens</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Number of Fractions</Label>
              <Input
                type="number"
                min="1"
                max={availableFractions}
                value={offerFractions}
                onChange={(e) => setOfferFractions(Number.parseInt(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">Available: {availableFractions} fractions</p>
            </div>

            <div className="space-y-2">
              <Label>Price per Fraction (USD)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={offerPrice}
                onChange={(e) => setOfferPrice(Number.parseFloat(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">Current price: ${pricePerFraction}</p>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Total Offer</span>
                <span className="text-lg font-bold">${(offerFractions * offerPrice).toFixed(2)}</span>
              </div>
              <p className="text-xs text-muted-foreground">Offer expires in 7 days</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOfferDialog(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleCreateOffer} disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Submit Offer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
