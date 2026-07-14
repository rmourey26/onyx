import type React from "react"
import type { Metadata, Viewport } from "next"
import "./globals.css"
import { Eczar, Roboto_Condensed } from "next/font/google"
import { ClientProviders } from "@/components/client-providers"
import { ConditionalSiteHeader } from "@/components/conditional-site-header"
import { ConditionalFooter } from "@/components/conditional-footer"
import { cn } from "@/lib/utils"
import { FeedbackProvider } from "@/components/feedback/feedback-provider"
import { Analytics } from "@vercel/analytics/react"
import { getVersion } from "@/lib/version"

export const dynamic = "force-dynamic"

const eczar = Eczar({ subsets: ["latin"], variable: "--font-eczar" })
const robotoCondensed = Roboto_Condensed({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-roboto-condensed",
})

export const metadata: Metadata = {
  title: {
    default: "Kronova Intelligent Systems",
    template: "%s | Kronova",
  },
  description:
    "Enterprise AI that Pays for Itself in 90 days. The only platform combining Canton Network, private stablecoins, and 18 proprietary AI tools. Replace 12 vendors with one. See ROI in your first quarter.",
  generator: `app.kronova.io v${getVersion().appVersion}`,
  manifest: "/manifest.json",
  applicationName: "Kronova",
  appleWebApp: {
    capable: true,
    title: "Kronova",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Kronova Intelligent Systems",
    title: {
      default: "Kronova Intelligent Systems",
      template: "%s | Kronova",
    },
    description:"Enterprise AI That Pays For Itself in 90 Days. The only platform combining Canton Network, private stablecoins, and 18 proprietary AI tools. Replace 12 vendors with one. See ROI in your first quarter.",
    url: "https://app.kronova.io",
    images: [
      {
        url: "/images/landing/aether-ecosystem-hero.png",
        width: 1200,
        height: 630,
        alt: "Kronova - Intelligent Systems",
        type: "image/png",
      },
      {
        url: "/images/landing/hero-platform-preview.png",
        width: 1200,
        height: 630,
        alt: "Kronova Platform Preview - AI Business Suite",
        type: "image/png",
      },
      {
        url: "/images/landing/feature-ai-agent-network.png",
        width: 1200,
        height: 630,
        alt: "AetherNet - Secure AI Agent Network",
        type: "image/png",
      },
      {
        url: "/images/landing/feature-blockchain-integration.png",
        width: 1200,
        height: 630,
        alt: "AetherChain - High-Performance Rust Blockchain",
        type: "image/png",
      },
      {
        url: "/images/landing/resendit-optimization-engine.png",
        width: 1200,
        height: 630,
        alt: "Kronova Optimization Engine - ROI and Sustainability Metrics",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: {
      default: "Kronova Intelligent Systems",
      template: "%s | Kronova",
    },
    description:
      "Enterprise AI that Pays for itself in 90 days and delivers 25:1 ROI.The only platform combining Canton Network, private stablecoins, and 18 proprietary AI tools. Replace 12 vendors with one. See ROI in your first quarter.",
    images: [
      {
        url: "/images/landing/aether-ecosystem-hero.png",
        alt: "Kronova - ",
      },
    ],
    creator: "@KronovaAI",
    site: "@KronovaAI",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      {
        url: "/favicon.svg",
        sizes: "32x32",
        type: "image/svg+xml",
      },
      {
        url: "/favicon.svg",
        sizes: "16x16",
        type: "image/svg+xml",
      },
    ],
    shortcut: "/favicon.svg",
    apple: [
      {
        url: "/logos/kronova-logo-icon.svg",
        sizes: "180x180",
        type: "image/svg+xml",
      },
    ],
  },
  verification: {},
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0A0A" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn("min-h-screen bg-background font-sans antialiased", eczar.variable, robotoCondensed.variable)}
      >
        <ClientProviders>
          <FeedbackProvider>
            <div className="relative flex min-h-screen flex-col">
              <ConditionalSiteHeader />
              <main className="flex-1">{children}</main>
              <ConditionalFooter />
            </div>
          </FeedbackProvider>
        </ClientProviders>
        <Analytics />
      </body>
    </html>
  )
}
