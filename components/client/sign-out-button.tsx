"use client"

import { signOut } from "@/app/actions/auth"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { useTransition } from "react"

export function SignOutButton() {
  const [isPending, startTransition] = useTransition()

  const handleSignOut = () => {
    startTransition(async () => {
      try {
        await signOut()
      } catch (error) {
        console.error("Error signing out:", error)
        // You could add toast notification here if needed
      }
    })
  }

  return (
    <DropdownMenuItem
      onClick={handleSignOut}
      disabled={isPending}
      className="text-red-500 hover:bg-red-50 hover:text-red-600 cursor-pointer disabled:opacity-50"
    >
      {isPending ? "Signing out..." : "Sign Out"}
    </DropdownMenuItem>
  )
}
