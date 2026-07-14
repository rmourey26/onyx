import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "API Documentation | Resendit-It Platform",
  description: "Comprehensive API documentation for the Resendit-It platform",
}

export default function ApiDocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-screen bg-background">{children}</div>
}
