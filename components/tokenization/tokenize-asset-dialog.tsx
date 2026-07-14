"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { useCurrentAccount } from "@mysten/dapp-kit"
import { Loader2, Wallet } from "lucide-react"
import { getAssets } from "@/app/actions/asset-intelligence-actions"
import { tokenizeAsset } from "@/app/actions/asset-tokenization-actions"
import { ConnectWalletButton } from "@/components/connect-wallet-button"

interface TokenizeAssetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  onSuccess: () => void
}

export function TokenizeAssetDialog({ open, onOpenChange, userId, onSuccess }: TokenizeAssetDialogProps) {
  const [assets, setAssets] = useState<any[]>([])
  const [selectedAssetId, setSelectedAssetId] = useState("")
  const [enableFractionalization, setEnableFractionalization] = useState(false)
  const [totalFractions, setTotalFractions] = useState(1000)
  const [pricePerFraction, setPricePerFraction] = useState(10)
  const [loading, setLoading] = useState(false)
  const [loadingAssets, setLoadingAssets] = useState(false)

  const { toast } = useToast()
  const currentAccount = useCurrentAccount()

  useEffect(() => {
    if (open) {
      loadAssets()
    }
  }, [open])

  const loadAssets = async () => {
    setLoadingAssets(true)
    try {
      const result = await getAssets()
      if (result.success) {
        // Filter out already tokenized assets
        const availableAssets = result.data?.filter((asset: any) => !asset.metadata?.tokenized) || []
        setAssets(availableAssets)
      }
    } catch (error) {
      console.error("Error loading assets:", error)
    } finally {
      setLoadingAssets(false)
    }
  }

  const handleSubmit = async () => {
    if (!selectedAssetId) {
      toast({
        title: "Error",
        description: "Please select an asset to tokenize",
        variant: "destructive",
      })
      return
    }

    if (!currentAccount?.address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your Sui wallet to tokenize assets",
        variant: "destructive",
      })
      return
    }

    if (enableFractionalization && (totalFractions <= 0 || pricePerFraction <= 0)) {
      toast({
        title: "Invalid Fractionalization",
        description: "Please provide valid fractionalization details",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const result = await tokenizeAsset({
        assetId: selectedAssetId,
        userId,
        walletAddress: currentAccount.address,
        enableFractionalization,
        totalFractions: enableFractionalization ? totalFractions : undefined,
        pricePerFraction: enableFractionalization ? pricePerFraction : undefined,
      })

      if (result.success) {
        toast({
          title: "Asset Tokenized",
          description: "Your asset has been successfully tokenized on Sui blockchain",
        })
        onSuccess()
        onOpenChange(false)
        resetForm()
      } else {
        toast({
          title: "Tokenization Failed",
          description: result.error || "Failed to tokenize asset",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error tokenizing asset:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setSelectedAssetId("")
    setEnableFractionalization(false)
    setTotalFractions(1000)
    setPricePerFraction(10)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Tokenize Asset</DialogTitle>
          <DialogDescription>
            Create an NFT representation of your physical asset on the Sui blockchain
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Wallet Connection */}
          {!currentAccount ? (
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg">
              <Wallet className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-4">Connect your Sui wallet to continue</p>
              <ConnectWalletButton />
            </div>
          ) : (
            <>
              {/* Asset Selection */}
              <div className="space-y-2">
                <Label htmlFor="asset">Select Asset</Label>
                {loadingAssets ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : assets.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-4 border rounded-lg">
                    No assets available for tokenization. Create an asset first.
                  </p>
                ) : (
                  <Select value={selectedAssetId} onValueChange={setSelectedAssetId}>
                    <SelectTrigger id="asset">
                      <SelectValue placeholder="Choose an asset" />
                    </SelectTrigger>
                    <SelectContent>
                      {assets.map((asset) => (
                        <SelectItem key={asset.id} value={asset.id}>
                          <div className="flex flex-col">
                            <span>{asset.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {asset.asset_type} • ${(asset.current_value || 0).toLocaleString()}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Fractionalization Option */}
              <div className="flex items-start space-x-3 p-4 border rounded-lg">
                <Checkbox
                  id="fractionalization"
                  checked={enableFractionalization}
                  onCheckedChange={(checked) => setEnableFractionalization(checked as boolean)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="fractionalization" className="font-medium cursor-pointer">
                    Enable Fractional Ownership
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Allow multiple investors to own fractions of this asset
                  </p>
                </div>
              </div>

              {/* Fractionalization Details */}
              {enableFractionalization && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                  <div className="space-y-2">
                    <Label htmlFor="total-fractions">Total Fractions</Label>
                    <Input
                      id="total-fractions"
                      type="number"
                      min="1"
                      value={totalFractions}
                      onChange={(e) => setTotalFractions(Number.parseInt(e.target.value))}
                      placeholder="1000"
                    />
                    <p className="text-xs text-muted-foreground">How many fractional tokens to create</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price-per-fraction">Price per Fraction (SUI)</Label>
                    <Input
                      id="price-per-fraction"
                      type="number"
                      min="0"
                      step="0.1"
                      value={pricePerFraction}
                      onChange={(e) => setPricePerFraction(Number.parseFloat(e.target.value))}
                      placeholder="10"
                    />
                    <p className="text-xs text-muted-foreground">
                      Total value: {totalFractions * pricePerFraction} SUI
                    </p>
                  </div>
                </div>
              )}

              {/* Wallet Info */}
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
                <p className="text-sm font-medium mb-1">Connected Wallet</p>
                <p className="text-xs text-muted-foreground font-mono">
                  {currentAccount.address.slice(0, 8)}...{currentAccount.address.slice(-6)}
                </p>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !currentAccount || !selectedAssetId}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Tokenize Asset
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
