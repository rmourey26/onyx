"use client"

import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from "@/components/theme-provider"
import { fontSans } from "@/lib/font"
import { siteConfig } from '@/config/site'
import { ReactQueryClientProvider } from '@/components/react-query-client-provider'
import { Toaster } from "@/components/ui/toaster"
import { SiteHeader } from "@/components/site-header"
import { TailwindIndicator } from "@/components/tailwind-indicator"
import { cn } from "@/lib/utils"

import {
  injectedWallet,
  metaMaskWallet,
  okxWallet,
  xdefiWallet,
} from "@rainbow-me/rainbowkit/wallets"

// import Index from "@/app/index"

import { ZetaChainProvider } from "./ZetaChainContext"
import "@rainbow-me/rainbowkit/styles.css"
import {
  RainbowKitProvider,
  connectorsForWallets,
} from "@rainbow-me/rainbowkit"
import { WagmiConfig, configureChains, createConfig } from "wagmi"
import {
  mainnet,
  bscTestnet,
  goerli,
  polygonMumbai,
} from "wagmi/chains"
import { zetachainAthensTestnet } from "wagmi/chains"
import { publicProvider } from "wagmi/providers/public"
import { headers } from 'next/headers' 
import { cookieToInitialState } from 'wagmi' 

import { config } from './config'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })


interface RootLayoutProps {
  children: React.ReactNode
}

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    goerli,
    polygonMumbai,
    bscTestnet,
    {
      ...zetachainAthensTestnet,
      iconUrl: "https://www.zetachain.com/favicon/favicon.png",
    },
  ],
  [publicProvider()]
)

const connectors = connectorsForWallets([
  {
    groupName: "Recommended",
    wallets: [
      injectedWallet({ chains }),
      metaMaskWallet({ projectId: "PROJECT_ID", chains }),
      xdefiWallet({ chains }),
      okxWallet({ projectId: "PROJECT_ID", chains }),
    ],
  },
])


export default function RootLayout({ children }: RootLayoutProps) {
const initialState = cookieToInitialState( 
    config, 
    headers().get('cookie') 
  )
  return (

    <ReactQueryClientProvider>
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
            "min-h-screen bg-background font-sans antialiased",
            fontSans.variable
          )}
        >
          <Providers>
<ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
             <div className="relative flex min-h-screen flex-col">
              <SiteHeader />
              <div className="flex-1"><Providers initialState={initialState}>{children}<Toaster/></div>
              </div>
              <TailwindIndicator />
          </Providers>

</body>
    </html>
    </ReactQueryClientProvider>

  )
}
