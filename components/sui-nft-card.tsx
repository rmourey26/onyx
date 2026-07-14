"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ExternalLink, Wallet } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useSuiClientQuery } from "@mysten/dapp-kit"
import { getObjectExplorerUrl } from "@/lib/sui-client"

interface SuiNFTCardProps {
  nft: {
    id: string
    name: string
    tx_hash: string
    domain_name?: string
    avatar_url?: string
    content_url?: string
    created_at: string
    object_id?: string
  }
}

export function SuiNFTCard({ nft }: SuiNFTCardProps) {
  // Use React Query to fetch NFT data if needed
  const { data: nftObject } = useSuiClientQuery(
    "getObject",
    {
      id: nft.object_id || "",
      options: {
        showContent: true,
        showDisplay: true,
      },
    },
    {
      enabled: !!nft.object_id,
    },
  )

  // Get display data from the NFT object if available
  const displayData = nftObject?.data?.display?.data

  // Determine which Sui explorer to use based on network
  const explorerBaseUrl = process.env.NEXT_PUBLIC_SUI_NETWORK?.includes("testnet")
    ? "https://explorer.sui.io/txblock"
    : "https://explorer.sui.io/txblock"

  const txHash = nft.tx_hash || nft.object_id || ""
  const imageUrl = nft.avatar_url || displayData?.image_url || "/placeholder.svg"
  const name = nft.name || displayData?.name || "NFT"
  const domainName = nft.domain_name || displayData?.description?.split(".sui")[0] || "unknown"

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <div className="relative w-12 h-12 rounded-full overflow-hidden">
            <Image src={imageUrl || "/placeholder.svg"} alt={name} fill className="object-cover" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium">{name}</h3>
            <div className="flex items-center text-sm text-gray-500">
              <Wallet className="h-3.5 w-3.5 mr-1" />
              <span>{domainName}.sui</span>
            </div>
            <div className="flex items-center mt-1">
              <Link
                href={
                  nft.object_id
                    ? getObjectExplorerUrl(nft.object_id)
                    : `${explorerBaseUrl}/${txHash}?network=${process.env.NEXT_PUBLIC_SUI_NETWORK || "mainnet"}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-500 hover:underline flex items-center"
              >
                View on Explorer
                <ExternalLink className="h-3 w-3 ml-1" />
              </Link>
            </div>
          </div>
          <div className="text-right text-xs text-gray-500">{new Date(nft.created_at).toLocaleDateString()}</div>
        </div>
      </CardContent>
    </Card>
  )
}
