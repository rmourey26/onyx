import type { Metadata } from "next"
import { SupportPageClient } from "./support-page-client"

export const metadata: Metadata = {
  title: "Support | Kronova",
  description:
    "Get help from Kairo, Kronova's intelligent support assistant, or submit an inquiry to the support team.",
}

export default function SupportPage() {
  return <SupportPageClient />
}
