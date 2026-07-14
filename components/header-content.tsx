"use client"

import Link from "next/link"
import Image from "next/image"
import { MainNav } from "@/components/main-nav"
import { MobileNav } from "@/components/mobile-nav"
import { UserMenuServer } from "@/components/server/user-menu-server"
import { AuthButtons } from "@/components/client/auth-buttons"
import { useTheme } from "next-themes"
import type { User } from "@supabase/supabase-js"

interface HeaderContentProps {
  user: User | null
  mainNavItems: { title: string; href: string }[]
  authNavItems: { title: string; href: string }[]
  allNavItems: { title: string; href: string }[]
}

export function HeaderContent({ user, mainNavItems, authNavItems, allNavItems }: HeaderContentProps) {
  const { resolvedTheme } = useTheme()

  const logoSrc = resolvedTheme === "dark" ? "/logos/kronova-logo-header-dark.svg" : "/logos/kronova-logo-header.svg"

  return (
    <div className="container flex h-16 items-center justify-between px-4 md:px-6 bg-background">
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Image
              src={logoSrc || "/placeholder.svg"}
              alt="Kronova"
              width={180}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </div>
        </Link>
        <MainNav items={allNavItems} />
      </div>

      <div className="flex items-center gap-2">
        {user ? (
          <>
            <div className="hidden md:flex items-center gap-2">
              {/* Desktop navigation items can go here if needed */}
            </div>
            <UserMenuServer user={user} />
          </>
        ) : (
          <AuthButtons />
        )}
        <MobileNav items={allNavItems} />
      </div>
    </div>
  )
}
