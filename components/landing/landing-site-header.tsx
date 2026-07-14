"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Menu, X, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggleButton } from "@/components/theme-toggle-button"
import { useTheme } from "next-themes"

const navItems = [
  { title: "Features", href: "/#features" },
  { title: "Use Cases", href: "/use-cases/ecommerce" },
  { title: "Ecosystem", href: "/ecosystem" },
  { title: "Developers", href: "/#developers" },
  { title: "About", href: "/about" },
]

export function LandingSiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { resolvedTheme } = useTheme()

  const logoSrc = resolvedTheme === "dark" ? "/logos/kronova-logo-header-dark.svg" : "/logos/kronova-logo-header.svg"

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src={logoSrc || "/placeholder.svg"}
            alt="Kronova"
            width={180}
            height={40}
            className="h-10 w-auto"
            priority
          />
        </Link>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navItems.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              {item.title}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center space-x-3">
          <ThemeToggleButton />
          <Button asChild>
            <Link href="/signup">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <ThemeToggleButton />
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="ml-2">
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 inset-x-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="container py-4 flex flex-col space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="text-foreground/80 hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.title}
              </Link>
            ))}
            <Button asChild className="w-full">
              <Link href="/signup">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
