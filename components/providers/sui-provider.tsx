"use client"

import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { networkConfig, CURRENT_NETWORK } from "@/lib/sui-client-hooks"
import { type ReactNode, useState } from "react"

interface SuiProviderProps {
  children: ReactNode
}

/**
 * Enterprise-grade Sui Provider with dApp Kit
 * Uses @mysten/dapp-kit package with network configuration
 * and built-in wallet management
 */
export function SuiProvider({ children }: SuiProviderProps) {
  // Create a query client with optimized settings
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider 
        networks={networkConfig} 
        defaultNetwork={CURRENT_NETWORK}
      >
        <WalletProvider autoConnect={false}>
          {children}
        </WalletProvider>
      </SuiClientProvider>
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}
