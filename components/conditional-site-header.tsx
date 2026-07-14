"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function ConditionalSiteHeader() {
  const pathname = usePathname()

  if (pathname?.startsWith("/ai-suite") || pathname === "/login" || pathname === "/signup" || pathname === "/") {
    return null
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105">
          <Image
            src="/logos/kronova-logo-header.svg"
            alt="Kronova"
            width={180}
            height={40}
            className="h-6 w-auto"
            priority
          />
        </Link>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "text-foreground hover:text-primary hover:bg-primary/10 transition-colors",
            )}
          >
            Login
          </Link>
          <Link
            href="/signup"
            className={cn(
              buttonVariants({ variant: "default", size: "sm" }),
              "bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-lg shadow-primary/20",
            )}
          >
            Sign Up
          </Link>
        </div>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] glass-morphism border-l border-border/50">
            <div className="flex items-center gap-3 mb-8">
              <Image
                src="/logos/kronova-logo-icon.svg"
                alt="Kronova"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <div>
                <h3 className="text-sm font-bold text-foreground">KRONOVA</h3>
                <p className="text-xs text-muted-foreground">INTELLIGENT SYSTEMS</p>
              </div>
            </div>
            <nav className="flex flex-col gap-3">
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "lg" }),
                  "justify-start text-foreground hover:text-primary hover:bg-primary/10 transition-colors",
                )}
              >
                Login
              </Link>
              <Link
                href="/signup"
                className={cn(
                  buttonVariants({ variant: "default", size: "lg" }),
                  "justify-start bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-lg",
                )}
              >
                Sign Up
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
