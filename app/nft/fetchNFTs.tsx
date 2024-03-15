import { abi } from "@zetachain/example-contracts/abi/omnichain/NFT.sol/NFT.json"
import { getEndpoints } from "@zetachain/networks"
import { ethers } from "ethers"
import { gql, request } from "graphql-request"
import { formatUnits } from "viem"
import { useAccount } from "wagmi"

import { useNFT } from "./useNFT"

const GOLDSKY_API =
  "https://api.goldsky.com/api/public/project_clnujea22c0if34x5965c8c0j/subgraphs/nft-zetachain-testnet/v4/gn"

const query = (address: string) => {
  return gql`
      query {
        transfers(
          first: 100
          where: {
            or: [
              { to: "${address}" }
              { from: "${address}" }
            ]
          }
        ) {
          id
          to
          from
          block_number
          tokenId
        }
      }
    `
}

const findUserNFTs = (walletAddress: string, transfers: any) => {
  let currentOwnership: any = {}
  transfers.sort(
    (a: any, b: any) => parseInt(a.block_number) - parseInt(b.block_number)
  )

  transfers.forEach((transfer: any) => {
    if (transfer.to.toLowerCase() === walletAddress.toLowerCase()) {
      currentOwnership[transfer.tokenId] = true
    } else if (transfer.from.toLowerCase() === walletAddress.toLowerCase()) {
      currentOwnership[transfer.tokenId] = false
    }
  })

  return Object.keys(currentOwnership).filter((id) => currentOwnership[id])
}

export const useFetchNFTs = () => {
  const {
    setAssetsReloading,
    setAssets,
    omnichainContract,
    fetchForeignCoins,
  } = useNFT()
  const { address } = useAccount()

  const fetchNFTs = async () => {
    console.log("Fetching NFTs...")
    setAssetsReloading(true)
    try {
      let ownedNFTs: any = []
      const rpc = getEndpoints("evm", "zeta_testnet")[0]?.url

      if (address) {
        const transfers = (await request(
          GOLDSKY_API,
          query(address.toLocaleLowerCase())
        )) as any
        ownedNFTs = findUserNFTs(address, transfers?.transfers)
      }

      const provider = new ethers.providers.StaticJsonRpcProvider(rpc)

      const c = new ethers.Contract(omnichainContract, abi, provider)
      const foreignCoins = await fetchForeignCoins()
      let assets = await Promise.all(
        ownedNFTs.map(async (id: any) => {
          const chain = (await c.tokenChains(BigInt(id))).toString()
          const decimals = foreignCoins.find(
            (b: any) =>
              b.coin_type === "Gas" &&
              parseInt(b.foreign_chain_id) === parseInt(chain)
          )?.decimals
          const amount = formatUnits(
            await c.tokenAmounts(BigInt(id)),
            parseInt(decimals)
          )
          return { id, amount, chain, decimals }
        })
      )
      assets = assets.filter((nft: any) => parseInt(nft.chain) > 0)
      assets.sort((a: any, b: any) => parseInt(b.id) - parseInt(a.id))
      setAssets(assets)
    } catch (e) {
      console.log(e)
    } finally {
      setAssetsReloading(false)
    }
  }

  return { fetchNFTs }
}