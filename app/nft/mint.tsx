import { useContext } from "react"
import { networks } from "@zetachain/networks"
import { getAddress } from "@zetachain/protocol-contracts"
import { prepareData } from "@zetachain/toolkit/client"
import { parseEther } from "viem"
import { useAccount } from "wagmi"

import { useEthersSigner } from "@/lib/ethers"
import { AppContext } from "@/app/index"

import { useNFT } from "./useNFT"

export const useMint = () => {
  const { amount, setAmount, setMintingInProgress, omnichainContract } =
    useNFT()
  const { bitcoinAddress, setInbounds, inbounds, connectBitcoin } =
    useContext(AppContext)
  const { address } = useAccount()
  const signer = useEthersSigner()

  const mint = async (chain: any) => {
    try {
      setMintingInProgress(true)
      let chainName = Object.entries(networks).find(([key, value]) => {
        return value.chain_id === parseInt(chain)
      })?.[0]
      let cctxHash: any
      if (parseInt(chain) === 18332) {
        await connectBitcoin()
        window.xfi.bitcoin.request(
          {
            method: "transfer",
            params: [
              {
                feeRate: 10,
                from: bitcoinAddress,
                recipient: getAddress("tss", "btc_testnet"),
                amount: {
                  amount: parseFloat(amount) * 1e8,
                  decimals: 8,
                },
                memo: `${address}`.replace(/^0x/, ""),
              },
            ],
          },
          (error: any, hash: any) => {
            if (!error) {
              cctxHash = hash
            }
          }
        )
      } else {
        const value = parseEther(amount)
        const to = getAddress("tss", chainName as any)
        const data = prepareData(omnichainContract, ["address"], [address])
        const cctx = await signer?.sendTransaction({ data, to, value })
        cctxHash = cctx?.hash
      }
      setAmount("")
      if (cctxHash) {
        const inbound = {
          inboundHash: cctxHash,
          desc: `Minting an NFT`,
        }
        setInbounds([...inbounds, inbound])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setMintingInProgress(false)
    }
  }
  return { mint }
}