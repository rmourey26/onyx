"use client"

import { EvmPriceServiceConnection } from "@pythnetwork/pyth-evm-js"

import "@/styles/globals.css"
import { parse } from "path"
import { createContext, use, useCallback, useEffect, useState } from "react"
import { getEndpoints } from "@zetachain/networks/dist/src/getEndpoints"
import {
  fetchFees,
  getBalances,
  getPools,
  trackCCTX,
  // @ts-ignore
} from "@zetachain/toolkit/helpers"
import EventEmitter from "eventemitter3"
// @ts-ignore
import Cookies from "js-cookie"
import debounce from "lodash/debounce"
import { useAccount } from "wagmi"

import { hexToBech32Address } from "@/lib/hexToBech32Address"
import { ToastAction } from "@/components/ui/toast"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"
import { SiteHeader } from "@/components/site-header"
import { ThemeProvider } from "@/components/theme-provider"

import { NFTProvider } from "./nft/useNFT"

interface RootLayoutProps {
  children: React.ReactNode
}

export const AppContext = createContext<any>(null)

export default function Index({ children }: RootLayoutProps) {
  const [balances, setBalances] = useState<any>([])
  const [balancesLoading, setBalancesLoading] = useState(true)
  const [balancesRefreshing, setBalancesRefreshing] = useState(false)
  const [bitcoinAddress, setBitcoinAddress] = useState("")
  const [fees, setFees] = useState<any>([])
  const [pools, setPools] = useState<any>([])
  const [poolsLoading, setPoolsLoading] = useState(false)
  const [validators, setValidators] = useState<any>([])
  const [validatorsLoading, setValidatorsLoading] = useState(false)
  const [stakingDelegations, setStakingDelegations] = useState<any>([])
  const [stakingRewards, setStakingRewards] = useState<any>([])
  const [unbondingDelegations, setUnbondingDelegations] = useState<any>([])
  const [observers, setObservers] = useState<any>([])
  const [prices, setPrices] = useState<any>([])
  const { address, isConnected } = useAccount()
  const { toast } = useToast()

  const fetchObservers = useCallback(
    debounce(async () => {
      try {
        const api = getEndpoints("cosmos-http", "zeta_testnet")[0]?.url
        const url = `${api}/zeta-chain/observer/nodeAccount`
        const response = await fetch(url)
        const data = await response.json()
        setObservers(data.NodeAccount)
      } catch (e) {
        console.error(e)
      }
    }, 500),
    []
  )

  const fetchUnbondingDelegations = useCallback(
    debounce(async () => {
      try {
        if (!isConnected) {
          return setUnbondingDelegations([])
        }
        const api = getEndpoints("cosmos-http", "zeta_testnet")[0]?.url
        const addr = hexToBech32Address(address as any, "zeta")
        const url = `${api}/cosmos/staking/v1beta1/delegators/${addr}/unbonding_delegations`
        const response = await fetch(url)
        const data = await response.json()
        setUnbondingDelegations(data.unbonding_responses)
      } catch (e) {
        console.error(e)
      }
    }, 500),
    [address, isConnected]
  )

  const connectBitcoin = async () => {
    const w = window as any
    console.log("connect bitcoin")
    if ("xfi" in w && w.xfi?.bitcoin) {
      w.xfi.bitcoin.changeNetwork("testnet")
      const btc = (await w.xfi.bitcoin.getAccounts())[0]
      await setBitcoinAddress(btc)
      // fetchBalances(true, btc)
    }
  }

  const fetchStakingDelegations = useCallback(
    debounce(async () => {
      try {
        if (!isConnected) {
          return setStakingDelegations([])
        }
        const api = getEndpoints("cosmos-http", "zeta_testnet")[0]?.url
        const addr = hexToBech32Address(address as any, "zeta")
        const url = `${api}/cosmos/staking/v1beta1/delegations/${addr}`
        const response = await fetch(url)
        const data = await response.json()
        setStakingDelegations(data.delegation_responses)
      } catch (e) {
        console.error(e)
      }
    }, 500),
    [address, isConnected]
  )

  const fetchStakingRewards = useCallback(
    debounce(async () => {
      try {
        if (!isConnected) {
          return setStakingRewards([])
        }
        const api = getEndpoints("cosmos-http", "zeta_testnet")[0]?.url
        const addr = hexToBech32Address(address as any, "zeta")
        const url = `${api}/cosmos/distribution/v1beta1/delegators/${addr}/rewards`
        const response = await fetch(url)
        const data = await response.json()
        setStakingRewards(data.rewards)
      } catch (e) {
        console.error(e)
      }
    }, 500),
    [address, isConnected]
  )

  const fetchValidators = useCallback(
    debounce(async () => {
      setValidatorsLoading(true)
      let allValidators: any[] = []
      let nextKey: any = null

      try {
        if (!isConnected) {
          setValidatorsLoading(false)
          setValidators([])
        }
        const api = getEndpoints("cosmos-http", "zeta_testnet")[0]?.url

        const fetchBonded = async () => {
          const response = await fetch(`${api}/cosmos/staking/v1beta1/pool`)
          const data = await response.json()
          return data
        }

        const fetchPage = async (key: string) => {
          const endpoint = "/cosmos/staking/v1beta1/validators"
          const query = `pagination.key=${encodeURIComponent(key)}`
          const url = `${api}${endpoint}?${key && query}`

          const response = await fetch(url)
          const data = await response.json()

          allValidators = allValidators.concat(data.validators)

          if (data.pagination && data.pagination.next_key) {
            await fetchPage(data.pagination.next_key)
          }
        }
        const pool = (await fetchBonded())?.pool
        const tokens = parseInt(pool.bonded_tokens)
        await fetchPage(nextKey)
        allValidators = allValidators.map((v) => {
          return {
            ...v,
            voting_power: tokens ? (parseInt(v.tokens) / tokens) * 100 : 0,
          }
        })
      } catch (e) {
        console.error(e)
      } finally {
        setValidators(allValidators)
        setValidatorsLoading(false)
      }
    }, 500),
    [address, isConnected]
  )

  const fetchBalances = useCallback(
    debounce(async (refresh: Boolean = false, btc: any = null) => {
      if (refresh) setBalancesRefreshing(true)
      if (balances.length === 0) setBalancesLoading(true)
      try {
        if (!isConnected) {
          return setBalances([])
        }
        const b = await getBalances(address, btc)
        setBalances(b)
      } catch (e) {
        console.log(e)
      } finally {
        setBalancesRefreshing(false)
        setBalancesLoading(false)
      }
    }, 500),
    [isConnected, address]
  )

  const fetchFeesList = useCallback(
    debounce(async () => {
      try {
        if (!isConnected) {
          return setFees([])
        }
        setFees(await fetchFees(500000))
      } catch (e) {
        console.log(e)
      }
    }, 500),
    []
  )

  const fetchPools = useCallback(
    debounce(async () => {
      setPoolsLoading(true)
      try {
        setPools(await getPools())
      } catch (e) {
        console.log(e)
      } finally {
        setPoolsLoading(false)
      }
    }, 500),
    []
  )

  useEffect(() => {
    fetchBalances(true)
    fetchFeesList()
    fetchStakingDelegations()
    fetchPrices()
  }, [isConnected, address])

  const fetchPrices = useCallback(
    debounce(async () => {
      let priceIds: any = []
      const api = getEndpoints("cosmos-http", "zeta_testnet")[0]?.url

      const zetaChainUrl = `${api}/zeta-chain/fungible/foreign_coins`
      const pythNetworkUrl = "https://benchmarks.pyth.network/v1/price_feeds/"

      try {
        const zetaResponse = await fetch(zetaChainUrl)
        const zetaData = await zetaResponse.json()
        const foreignCoins = zetaData.foreignCoins
        const symbolsFromZeta = foreignCoins.map((coin: any) =>
          coin.symbol.replace(/^[tg]/, "")
        )

        const pythResponse = await fetch(pythNetworkUrl)
        const pythData = await pythResponse.json()
        const priceFeeds = pythData

        priceIds = priceFeeds
          .filter((feed: any) => {
            const base = symbolsFromZeta.includes(feed.attributes.base)
            const quote = feed.attributes.quote_currency === "USD"
            return base && quote
          })
          .map((feed: any) => ({
            symbol: feed.attributes.base,
            id: feed.id,
          }))
      } catch (error) {
        console.error("Error fetching or processing data:", error)
        return []
      }
      const connection = new EvmPriceServiceConnection(
        "https://hermes.pyth.network"
      )

      const priceFeeds = await connection.getLatestPriceFeeds(
        priceIds.map((p: any) => p.id)
      )

      setPrices(
        priceFeeds?.map((p: any) => {
          const pr = p.getPriceNoOlderThan(60)
          return {
            id: p.id,
            symbol: priceIds.find((i: any) => i.id === p.id)?.symbol,
            price: parseInt(pr.price) * 10 ** pr.expo,
          }
        })
      )
    }, 500),
    []
  )

  const [inbounds, setInbounds] = useState<any>([])
  const [cctxs, setCCTXs] = useState<any>([])

  const updateCCTX = (updatedItem: any) => {
    setCCTXs((prevItems: any) => {
      const index = prevItems.findIndex(
        (item: any) => item.inboundHash === updatedItem.inboundHash
      )

      if (index === -1) return prevItems

      const newItems = [...prevItems]
      newItems[index] = {
        ...newItems[index],
        ...updatedItem,
      }

      return newItems
    })
  }

  useEffect(() => {
    const cctxList = cctxs.map((c: any) => c.inboundHash)
    for (let i of inbounds) {
      if (!cctxList.includes(i.inboundHash)) {
        const emitter = new EventEmitter()
        emitter
          .on("search-add", ({ text }) => {
            updateCCTX({
              inboundHash: i.inboundHash,
              progress: text,
              status: "searching",
            })
          })
          .on("add", ({ text }) => {
            updateCCTX({
              inboundHash: i.inboundHash,
              progress: text,
              status: "searching",
            })
          })
          .on("succeed", ({ text }) => {
            updateCCTX({
              inboundHash: i.inboundHash,
              progress: text,
              status: "succeed",
            })
          })
          .on("fail", ({ text }) => {
            updateCCTX({
              inboundHash: i.inboundHash,
              progress: text,
              status: "failed",
            })
          })
          .on("mined-success", (value) => {
            updateCCTX({
              inboundHash: i.inboundHash,
              status: "mined-success",
              ...value,
            })
          })
          .on("mined-fail", (value) => {
            updateCCTX({
              inboundHash: i.inboundHash,
              status: "mined-fail",
              ...value,
            })
          })

        trackCCTX(i.inboundHash, false, emitter)
        setCCTXs([...cctxs, { inboundHash: i.inboundHash, desc: i.desc }])
      }
    }
  }, [inbounds])

  useEffect(() => {
    if (!Cookies.get("firstTimeVisit")) {
      toast({
        title: "Welcome to ZetaChain Example App",
        description: "This is a testnet. Please do not use real funds.",
        duration: 60000,
      })
      Cookies.set("firstTimeVisit", "true", { expires: 7 })
    }
  }, [])

  return (
    <>
      <AppContext.Provider
        value={{
          cctxs,
          inbounds,
          balances,
          bitcoinAddress,
          balancesLoading,
          balancesRefreshing,
          fees,
          connectBitcoin,
          pools,
          poolsLoading,
          validators,
          fetchValidators,
          validatorsLoading,
          stakingDelegations,
          stakingRewards,
          setCCTXs,
          setInbounds,
          setBitcoinAddress,
          setBalances,
          fetchPools,
          fetchBalances,
          fetchStakingDelegations,
          fetchStakingRewards,
          unbondingDelegations,
          fetchUnbondingDelegations,
          prices,
          fetchObservers,
          observers,
        }}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <NFTProvider>
            <div className="relative flex min-h-screen flex-col">
              <SiteHeader />
              <section className="container px-4 mt-4">{children}</section>
            </div>
            <Toaster />
          </NFTProvider>
        </ThemeProvider>
      </AppContext.Provider>
    </>
  )
}