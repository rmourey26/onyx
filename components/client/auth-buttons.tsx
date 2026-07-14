"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export function AuthButtons() {
  return (
    <div className="hidden md:flex items-center gap-2">
      <Link
        href="/login"
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "text-muted-foreground hover:text-primary hover:bg-transparent",
        )}
      >
        Login
      </Link>
      <Link
        href="/signup"
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "border-primary text-primary hover:bg-primary/10",
        )}
      >
        Sign Up
      </Link>
    </div>
  )
}
