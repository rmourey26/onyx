import type { Metadata } from "next"
import { DataSourcesClient } from "./data-sources-client"

export const metadata: Metadata = {
  title: "Data Sources - AI Business Suite",
  description: "Connect and manage your external databases for AI processing",
}

export default function DataSourcesPage() {
  return <DataSourcesClient />
}
