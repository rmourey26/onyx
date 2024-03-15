import { createContext, useContext, useEffect, useState } from "react"
import { getEndpoints } from "@zetachain/networks"

export const NFTContext = createContext<any>(undefined)

export const NFTProvider = ({ children }: any) => {
  const [assets, setAssets] = useState<any>([])
  const [selectedChain, setSelectedChain] = useState<any>(null)
  const [amount, setAmount] = useState<any>("")
  const [assetsReloading, setAssetsReloading] = useState(false)
  const [assetsUpdating, setAssetsUpdating] = useState<any>([])
  const [assetsBurned, setAssetsBurned] = useState<any>([])
  const [mintingInProgress, setMintingInProgress] = useState<any>(false)
  const [recipient, setRecipient] = useState<any>("")
  const [foreignCoins, setForeignCoins] = useState<any>([])

  const omnichainContract = "0x936b0724C849090907f9bDDB21b70Ff570E7e358"

  const fetchForeignCoins = async () => {
    try {
      const api = getEndpoints("cosmos-http", "zeta_testnet")[0]?.url
      const url = `${api}/zeta-chain/fungible/foreign_coins`
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error("Error fetching foreign coins")
      }
      const { foreignCoins } = await response.json()
      setForeignCoins(foreignCoins)
      return foreignCoins
    } catch (error) {
      console.error("Failed to fetch foreign coins:", error)
    }
  }

  const value = {
    assets,
    setAssets,
    selectedChain,
    setSelectedChain,
    amount,
    setAmount,
    assetsReloading,
    setAssetsReloading,
    assetsUpdating,
    setAssetsUpdating,
    assetsBurned,
    setAssetsBurned,
    mintingInProgress,
    setMintingInProgress,
    recipient,
    setRecipient,
    foreignCoins,
    setForeignCoins,
    fetchForeignCoins,
    omnichainContract,
  }

  return (
    <NFTContext.Provider value={value as any}>{children}</NFTContext.Provider>
  )
}

export const useNFT = (): any => {
  const context = useContext(NFTContext)
  if (context === undefined) {
    throw new Error("useNFT must be used within a NFTProvider")
  }
  return context
}