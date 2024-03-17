"use client"

import { useContext, useEffect, useState } from "react"
import { formatUnits } from "viem"
import { useAccount } from "wagmi"

import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AppContext } from "@/app/index"

const PoolsPage = () => {
  const { pools, balances, balancesLoading, poolsLoading, fetchPools } =
    useContext(AppContext)
  const [poolsSorted, setPoolsSorted] = useState<any[]>([])
  const { address, isConnected } = useAccount()

  useEffect(() => {
    fetchPools()
  }, [address, isConnected])

  useEffect(() => {
    const enrichPoolsData = (pools: any[], balances: any[]) => {
      const balancesMap: { [key: string]: any } = {}
      balances.forEach((balance: any) => {
        if (balance.contract) {
          balancesMap[balance.contract.toLowerCase()] = {
            symbol: balance.symbol,
            decimals: balance.decimals,
          }
        }
      })

      return pools.map((pool: any) => ({
        ...pool,
        t0: {
          ...pool.t0,
          ...balancesMap[pool.t0.address.toLowerCase()],
        },
        t1: {
          ...pool.t1,
          ...balancesMap[pool.t1.address.toLowerCase()],
        },
      }))
    }

    const enrichedPools = enrichPoolsData(pools, balances)

    enrichedPools.sort((a: any, b: any) => {
      const aKnown = a.t0.symbol && a.t1.symbol
      const bKnown = b.t0.symbol && b.t1.symbol

      if (aKnown && !bKnown) return -1
      if (!aKnown && bKnown) return 1
      return 0
    })

    setPoolsSorted(enrichedPools)
  }, [pools, balances])

  return (
    <div>
      <h1 className="leading-10 text-2xl font-bold tracking-tight pl-4">
        Pools
      </h1>
      <div className="mt-10">
        {balancesLoading || poolsLoading ? (
          <div className="flex flex-wrap gap-4">
            {Array(15)
              .fill(null)
              .map((_, index) => (
                <Skeleton
                  key={index}
                  className="w-[100%] sm:w-64 min-h-[150px] border-none rounded-xl"
                />
              ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-4">
            {poolsSorted.map((p: any) => (
              <Card
                className={`p-4 w-[100%] sm:w-64 min-h-[150px] shadow-lg border-none rounded-xl ${
                  p.t0.symbol && p.t1.symbol ? "" : "opacity-50"
                }`}
              >
                <div className="flex flex-col space-y-2">
                  <div className="flex">
                    <div className="grow-0 basis-1/2">
                      {p.t0.symbol || "Unknown"}
                    </div>
                    <div className="grow-0 basis-1/2">
                      {p.t1.symbol || "Unknown"}
                    </div>
                  </div>
                  <div className="flex">
                    <div className="grow-0 basis-1/2">
                      {parseFloat(
                        formatUnits(p.t0.reserve, p.t0.decimals)
                      ).toFixed(2)}
                    </div>
                    <div className="grow-0 basis-1/2">
                      {parseFloat(
                        formatUnits(p.t1.reserve, p.t1.decimals)
                      ).toFixed(2)}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default PoolsPage