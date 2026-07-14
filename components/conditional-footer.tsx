"use client"

import { usePathname } from "next/navigation"
import { Footer } from "@/components/footer"

export function ConditionalFooter() {
  const pathname = usePathname()

  if (pathname?.startsWith("/ai-suite") ||pathname === "/login" || pathname === "/signup") {
    return null
  }

  return <Footer />
}
