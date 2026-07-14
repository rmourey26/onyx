"use client"

import { ThemeProvider } from "@/components/theme-provider"
import type { ReactNode } from "react"

interface ProvidersProps {
  children: ReactNode
}

// Wallet context is handled by ClientProviders (WalletProvider from @mysten/dapp-kit).
// This component keeps the ThemeProvider wrapper for any legacy usage.
export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </ThemeProvider>
  )
}
