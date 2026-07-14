import type { Metadata } from "next"
import { MarketplaceHeader } from "@/components/marketplace/marketplace-header"
import { MarketplaceFilters } from "@/components/marketplace/marketplace-filters"
import { AgentGrid } from "@/components/marketplace/agent-grid"
import { MarketplaceStats } from "@/components/marketplace/marketplace-stats"

export const metadata: Metadata = {
  title: "AI Agent Marketplace",
  description:
    "Discover, purchase, and deploy AI agents for productivity, analytics, customer service, and content creation.",
}

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketplaceHeader />
      <MarketplaceStats />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-80 flex-shrink-0">
            <MarketplaceFilters />
          </aside>
          <main className="flex-1">
            <AgentGrid />
          </main>
        </div>
      </div>
    </div>
  )
}
