"use client"

import { Button } from "@/components/ui/button"
import { createStripePortalSession } from "@/app/actions/stripe-actions"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export function ManageSubscriptionButton() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleManageSubscription = async () => {
    setIsLoading(true)
    try {
      await createStripePortalSession()
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not open billing portal. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
    // No need to set isLoading to false on success, as the page will redirect.
  }

  return (
    <form action={handleManageSubscription}>
      <Button disabled={isLoading} type="submit" size="lg">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isLoading ? "Loading..." : "Manage Subscription"}
      </Button>
    </form>
  )
}
