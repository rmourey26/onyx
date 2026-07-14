"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BusinessCardPreview } from "@/components/business-card-preview"
import { MintNFTButton } from "@/components/mint-nft-button"
import { SuiNFTCard } from "@/components/sui-nft-card"
import { ProfileShareModal } from "@/components/profile-share-modal"
import { SuiNFTMintModal } from "@/components/sui-nft-mint-modal"
import { SuiWalletStatus } from "@/components/sui-wallet-status"

interface DashboardClientProps {
  user: any
  profile: any
  nfts: any[]
  suiNfts: any[]
}

export function DashboardClient({ user, profile, nfts, suiNfts }: DashboardClientProps) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
        <div>
          <BusinessCardPreview profile={profile} showEditor={true} />

          <div className="flex flex-wrap gap-4 mt-6">
            <MintNFTButton
              userId={user.id}
              profileId={profile.id}
              userData={{
                full_name: profile.full_name,
                company: profile.company,
                website: profile.website,
                avatar_url: profile.avatar_url,
              }}
            />
            <ProfileShareModal
              userId={user.id}
              userData={{
                full_name: profile.full_name,
                company: profile.company,
                job_title: profile.job_title,
                email: profile.email,
                website: profile.website,
                linkedin_url: profile.linkedin_url,
                xhandle: profile.xhandle,
                waddress: profile.waddress,
              }}
            />
          </div>
        </div>

        <div>
          <SuiWalletStatus />
          <Tabs defaultValue="sui_nfts" className="w-full mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="nfts">Base NFTs</TabsTrigger>
              <TabsTrigger value="sui_nfts">Sui NFTs</TabsTrigger>
            </TabsList>
            <TabsContent value="nfts" className="border rounded-lg p-4 mt-2">
              {nfts && nfts.length > 0 ? (
                <div className="space-y-4">
                  {nfts.map((nft) => (
                    <Card key={nft.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center">
                          <div className="w-12 h-12 rounded mr-4 flex items-center justify-center bg-gray-100">
                            <svg
                              className="h-6 w-6 text-gray-500"
                              fill="none"
                              height="24"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                              width="24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M19.5 12.572 12 17l-7.5-4.428V7.572L12 3l7.5 4.572v5" />
                              <path d="M12 17v4" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-medium">{nft.name}</h3>
                            <p className="text-sm text-gray-500">
                              <a
                                href={`https://goerli.basescan.org/tx/${nft.tx_hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                              >
                                View on BaseScan
                              </a>
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No Base NFTs minted yet</p>
                  <MintNFTButton userId={user.id} profileId={profile.id} />
                </div>
              )}
            </TabsContent>
            <TabsContent value="sui_nfts" className="border rounded-lg p-4 mt-2">
              {suiNfts && suiNfts.length > 0 ? (
                <div className="space-y-4">
                  {suiNfts.map((nft) => (
                    <SuiNFTCard key={nft.id} nft={nft} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No Sui NFTs minted yet.</p>
                </div>
              )}
              <div className="mt-4 flex justify-center">
                <SuiNFTMintModal profile={profile} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
