"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { UserMenuServer } from "@/components/server/user-menu-server"
import type { User } from "@supabase/supabase-js"

interface NavItem {
  title: string
  href: string
}

interface AuthButtonsProps {
  user?: User | null
  authNavItems?: NavItem[]
  isMobile?: boolean
}

export function AuthButtons({ user, authNavItems = [], isMobile = false }: AuthButtonsProps) {
  if (user) {
    return (
      <div className={`flex ${isMobile ? "flex-col space-y-2" : "items-center space-x-4"}`}>
        {!isMobile &&
          authNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors"
            >
              {item.title}
            </Link>
          ))}
        <div className={isMobile ? "pt-2" : ""}>
          <UserMenuServer user={user} />
        </div>
      </div>
    )
  }

  return (
    <div className={`flex ${isMobile ? "flex-col space-y-2" : "items-center space-x-2"}`}>
      <Button asChild variant="ghost" size="sm">
        <Link href="/login">Login</Link>
      </Button>
      <Button asChild size="sm">
        <Link href="/signup">Sign Up</Link>
      </Button>
    </div>
  )
}
