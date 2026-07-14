import type { Metadata } from "next"
import { ProprietaryToolsDashboard } from "./proprietary-tools-dashboard"

export const metadata: Metadata = {
  title: "Proprietary AI Tools - Kronova",
  description: "18 enterprise-grade proprietary AI tools for asset intelligence, blockchain, and automation",
}

export default function ProprietaryToolsPage() {
  return <ProprietaryToolsDashboard />
}
