import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Asset Tokenization",
  description: "Tokenize physical assets on Sui blockchain with fractional ownership support",
}

export default function TokenizationLayout({ children }: { children: React.ReactNode }) {
  return children
}
