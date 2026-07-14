"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useState } from "react"
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit"
import { Transaction } from "@mysten/sui/transactions"
import { toast } from "@/components/ui/use-toast"
import { SNS_PACKAGE_ID, SNS_REGISTRY_ID, getExplorerUrl } from "@/lib/sui-client"
import { ConnectWalletButton } from "./connect-wallet-button"
import { recordSuiMint } from "@/app/actions/sui-actions"
import { useQueryClient } from "@tanstack/react-query"
import { ExternalLink, Loader2 } from "lucide-react"

interface SuiNFTMintModalProps {
  profile: {
    id: string
    full_name: string | null
    company: string | null
    website: string | null
    avatar_url: string | null
  }
}

export function SuiNFTMintModal({ profile }: SuiNFTMintModalProps) {
  const [open, setOpen] = useState(false)
  const currentAccount = useCurrentAccount()
  const suiClient = useSuiClient()
  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction()
  const queryClient = useQueryClient()

  const handleMint = async () => {
    if (!currentAccount || !profile) {
      toast({
        title: "Error",
        description: "Wallet not connected or profile not available",
        variant: "destructive",
      })
      return
    }

    try {
      // Create a new transaction using the latest Transaction class
      const transaction = new Transaction()

      // Prepare NFT metadata
      const nftName = profile.full_name || "Digital Business Card"
      const nftDescription = `A digital identity NFT for ${profile.full_name || "User"} ${
        profile.company ? `at ${profile.company}` : ""
      }.`
      const nftImageUrl = profile.avatar_url || "/placeholder.svg?height=400&width=400&text=Business+Card"

      // Check if we have the required package and registry IDs
      if (!SNS_PACKAGE_ID || !SNS_REGISTRY_ID) {
        toast({
          title: "Configuration Error",
          description: "Smart contract addresses not configured. Please contact support.",
          variant: "destructive",
        })
        return
      }

      // Add the mint call to the transaction
      transaction.moveCall({
        target: `${SNS_PACKAGE_ID}::business_card_nft::mint`,
        arguments: [
          transaction.pure.string(nftName),
          transaction.pure.string(nftDescription),
          transaction.pure.string(nftImageUrl),
          transaction.pure.string(profile.website || ""),
          transaction.object(SNS_REGISTRY_ID),
        ],
      })

      // Set gas budget (adjust based on your contract's requirements)
      transaction.setGasBudget(10_000_000)

      // Execute the transaction
      signAndExecute(
        {
          transaction,
          options: {
            showEffects: true,
            showEvents: true,
            showObjectChanges: true,
          },
        },
        {
          onSuccess: async (result) => {
            console.log("Transaction successful:", result)

            // Extract the created NFT object ID from the transaction effects
            const createdObjects = result.effects?.created
            const nftObject = createdObjects?.find((obj) => obj.owner && typeof obj.owner === "object")
            const objectId = nftObject?.reference?.objectId

            toast({
              title: "NFT Minted Successfully! 🎉",
              description: (
                <div className="flex flex-col gap-2">
                  <p>Your business card NFT has been created on Sui blockchain.</p>
                  <a
                    href={getExplorerUrl(result.digest)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 underline"
                  >
                    View on Explorer <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              ),
            })

            // Record the mint in our database
            if (objectId) {
              try {
                await recordSuiMint({
                  name: nftName,
                  description: nftDescription,
                  imageUrl: nftImageUrl,
                  walletAddress: currentAccount.address,
                  userId: profile.id,
                  objectId: objectId,
                  txDigest: result.digest,
                })
              } catch (dbError) {
                console.error("Failed to record mint in database:", dbError)
                // Don't show error to user since the NFT was successfully minted
              }
            }

            // Refresh any cached NFT data
            queryClient.invalidateQueries({ queryKey: ["sui-nfts"] })
            queryClient.invalidateQueries({ queryKey: ["user-nfts"] })

            setOpen(false)
          },
          onError: (error) => {
            console.error("Transaction failed:", error)
            toast({
              title: "Failed to Mint NFT",
              description: error.message || "An unknown error occurred during minting.",
              variant: "destructive",
            })
          },
        },
      )
    } catch (error) {
      console.error("Error preparing transaction:", error)
      toast({
        title: "Transaction Error",
        description: error instanceof Error ? error.message : "Failed to prepare transaction",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <span className="mr-2">🎨</span>
          Mint Business Card NFT
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>🎨</span>
            Mint Sui NFT
          </DialogTitle>
          <DialogDescription>
            {currentAccount
              ? "Create a unique NFT representing your digital business card on the Sui blockchain."
              : "Connect your wallet to mint a digital business card NFT."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {currentAccount ? (
            <div className="space-y-3">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium mb-2">NFT Preview</h4>
                <div className="text-sm space-y-1">
                  <p>
                    <strong>Name:</strong> {profile.full_name || "Digital Business Card"}
                  </p>
                  <p>
                    <strong>Company:</strong> {profile.company || "Not specified"}
                  </p>
                  <p>
                    <strong>Website:</strong> {profile.website || "Not specified"}
                  </p>
                </div>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Network Fee:</strong> A small gas fee will be required to mint your NFT on the Sui blockchain.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Connect your Sui wallet to mint your business card as an NFT
                </p>
                <ConnectWalletButton />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleMint} disabled={!currentAccount || isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Minting...
              </>
            ) : (
              "Mint NFT"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
