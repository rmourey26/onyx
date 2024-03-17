
"use client"

import { useContext, useEffect, useState } from "react"
import Link from "next/link"
import { siteConfig } from "@/config/site"
import { buttonVariants } from "@/components/ui/button"
import {
  ArrowBigUp,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  RefreshCw,
} from "lucide-react"
import { formatUnits } from "viem"
import { useAccount } from "wagmi"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Transfer from "@/components/transfer"
import { AppContext } from "@/app/index"

const LoadingSkeleton = () => {
  return (
    <div className="space-y-4">
      {Array(5)
        .fill(null)
        .map((_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
    </div>
  )
}

const BalancesTable = ({
  balances,
  showAll,
  toggleShowAll,
  stakingAmountTotal,
}: any) => {
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow className="border-none hover:bg-transparent">
            <TableHead className="pl-4">Asset</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Balance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {balances
            .slice(0, showAll ? balances.length : 5)
            .map((b: any, index: any) => (
              <TableRow key={index} className="border-none">
                <TableCell className="pl-4 rounded-bl-xl rounded-tl-xl">
                  <div>{b.ticker}</div>
                  <div className="text-xs text-gray-400">{b.chain_name}</div>
                </TableCell>
                <TableCell>{b.coin_type}</TableCell>
                <TableCell className="text-right">
                  {b.price?.toFixed(2)}
                </TableCell>
                <TableCell className="rounded-br-xl rounded-tr-xl text-right">
                  {parseFloat(b.balance).toFixed(2) || "N/A"}
                  {b.ticker === "ZETA" && b.coin_type === "Gas" && (
                    <div>
                      <Button
                        size="sm"
                        variant="link"
                        className="my-1 p-0 text-xs h-5"
                        asChild
                      >
                        <Link href="/staking">
                          <ArrowBigUp className="h-4 w-4 mr-0.5" />
                          {stakingAmountTotal > 0 ? (
                            <span>
                              Staked:&nbsp;
                              {parseFloat(
                                formatUnits(stakingAmountTotal, 18)
                              ).toFixed(0)}
                            </span>
                          ) : (
                            <span>Stake ZETA</span>
                          )}
                        </Link>
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
      {balances?.length > 5 && (
        <div className="my-4 flex justify-center">
          <Button variant="link" onClick={toggleShowAll}>
            {showAll ? "Collapse" : "Show all assets"}
            {showAll ? (
              <ChevronUp className="ml-2 h-4 w-4 shrink-0 opacity-75" />
            ) : (
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-75" />
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

const ConnectWallet = () => {
  return (
    <Alert>
      <AlertTitle>Connect wallet</AlertTitle>
      <AlertDescription>
        Please, connect wallet to see token balances.
      </AlertDescription>
    </Alert>
  )
}

export default function IndexPage() {
  const {
    balances,
    balancesLoading,
    balancesRefreshing,
    fetchBalances,
    prices,
    stakingDelegations,
  } = useContext(AppContext)
  const [sortedBalances, setSortedBalances] = useState([])
  const [showAll, setShowAll] = useState(false)

  const { isConnected } = useAccount()

  const refreshBalances = async () => {
    await fetchBalances(true)
  }

  const toggleShowAll = () => {
    setShowAll(!showAll)
  }

  const balancesPrices = sortedBalances.map((balance: any) => {
    const normalizeSymbol = (symbol: string) => symbol.replace(/^[tg]/, "")

    const normalizedSymbol = normalizeSymbol(balance.symbol)
    const priceObj = prices.find(
      (price: any) => normalizeSymbol(price.symbol) === normalizedSymbol
    )

    return {
      ...balance,
      price: priceObj ? priceObj.price : null,
    }
  })

  const stakingAmountTotal = stakingDelegations.reduce((a: any, c: any) => {
    const amount = BigInt(c.balance.amount)
    return a + amount
  }, BigInt(0))

  useEffect(() => {
    let balance = balances
      .sort((a: any, b: any) => {
        // Prioritize ZETA
        if (a.ticker === "ZETA" && a.coin_type === "Gas") return -1
        if (b.ticker === "ZETA" && b.coin_type === "Gas") return 1

        if (a.coin_type === "Gas" && b.coin_type !== "Gas") return -1
        if (a.coin_type !== "Gas" && b.coin_type === "Gas") return 1
        return a.chain_name < b.chain_name ? -1 : 1
      })
      .filter((b: any) => {
        return b.balance > 0
      })
    setSortedBalances(balance)
  }, [balances])

  const balancesTotal = balancesPrices.reduce((a: any, c: any) => {
    return a + parseFloat(c.balance)
  }, 0)

  const formatBalanceTotal = (b: string) => {
    if (parseFloat(b) > 1000) {
      return parseInt(b).toLocaleString()
    } else {
      return parseFloat(b).toFixed(2)
    }
  }

  return (
    <div>
      <div className="grid sm:grid-cols-3 gap-x-10">
        <div className="sm:col-span-2 overflow-x-scroll">
          <div className="mt-12 mb-8">
            <div className="px-3 text-sm mb-1 text-gray-400">Total balance</div>
            <div className="flex items-center justify-start gap-1">
              <h1 className="px-3 text-4xl font-bold tracking-tight">
                ${formatBalanceTotal(balancesTotal)}
              </h1>
              <Button size="icon" variant="ghost" onClick={refreshBalances}>
                <RefreshCw
                  className={`h-4 w-4 ${
                    (balancesLoading || balancesRefreshing) && "animate-spin"
                  }`}
                />
              </Button>
            </div>
          </div>
          {balancesLoading ? (
            <LoadingSkeleton />
          ) : isConnected ? (
            <BalancesTable
              balances={balancesPrices}
              showAll={showAll}
              toggleShowAll={toggleShowAll}
              stakingAmountTotal={stakingAmountTotal}
            />
          ) : (
            <ConnectWallet />
          )}
          <div className="my-5 flex space-x-2">
            <Link href="/messaging" legacyBehavior passHref>
              <Button variant="outline">
                <MessageCircle className="mr-1 h-5 w-5" strokeWidth={1.5} />
                Cross-Chain Messaging
              </Button>
            </Link>
          </div>
        </div>
        <div className="mr-4">
          <Transfer />
        </div>
      </div>
    </div>
  )
}
