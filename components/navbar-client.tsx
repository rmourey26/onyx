"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

interface NavbarClientProps {
  showAuth?: boolean
  isLoggedIn?: boolean
}

export function NavbarClient({ showAuth = true, isLoggedIn = false }: NavbarClientProps) {
  return (
    <header className="bg-white border-b">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <svg
            className="h-6 w-6"
            fill="none"
            height="24"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect height="16" rx="2" width="20" x="2" y="4" />
            <path d="M22 7H2" />
            <path d="M18 14h-8" />
            <path d="M18 11h-6" />
            <path d="M8 11H6" />
            <path d="M8 14H6" />
          </svg>
          <span className="text-xli font-bold">Card0</span>
        </Link>
        {showAuth && (
          <nav className="flex gap-4">
            {isLoggedIn ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                <form action="/api/auth/signout" method="post">
                  <Button variant="ghost" type="submit">
                    Sign Out
                  </Button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/signup">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}
