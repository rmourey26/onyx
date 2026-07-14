"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createCheckoutSession } from "@/app/actions/stripe-actions"
import { useState } from "react"
import { CheckCircle2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { User } from "@supabase/supabase-js"
import { cn } from "@/lib/utils"

type ProductWithPrice = {
  id: string
  name: string | null
  description: string | null
  prices: {
    id: string
    unit_amount: number | null
    interval: string | null
  }[]
}

interface PricingTableProps {
  user: User | null
  products: ProductWithPrice[]
}

export function PricingTable({ user, products }: PricingTableProps) {
  const { toast } = useToast()
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null)

  const handleSubscribe = async (priceId: string) => {
    if (!user) {
      // This should ideally redirect to login, but for now, a toast is fine.
      toast({ title: "Please log in to subscribe.", variant: "destructive" })
      return
    }
    setLoadingPriceId(priceId)
    await createCheckoutSession(priceId)
    // The action handles redirection, so we don't need to do anything here.
    // If it fails, the user will be redirected back with an error.
    setLoadingPriceId(null)
  }

  const planFeatures: { [key: string]: string[] } = {
    Starter: ["Up to 100 orders/month", "Basic AI Analytics", "Shopify & Wix Sync", "Standard Email Support"],
    Growth: [
      "Up to 1,000 orders/month",
      "Advanced AI Analytics & Insights",
      "Inventory Optimization Suggestions",
      "Priority Email & Chat Support",
    ],
    Scale: ["Unlimited orders", "Full AI Suite Access", "Dedicated AI Agent Support", "24/7 Phone & Chat Support"],
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {products.map((product, index) => {
        if (!product.name || !product.prices?.[0]) return null
        const price = product.prices[0]
        const isFeatured = product.name === "Growth"

        return (
          <Card key={product.id} className={cn("flex flex-col", isFeatured ? "border-primary border-2 shadow-lg" : "")}>
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl">{product.name}</CardTitle>
              <CardDescription className="h-12">{product.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="mb-6">
                <span className="text-5xl font-extrabold">${(price.unit_amount ?? 0) / 100}</span>
                <span className="text-muted-foreground">/{price.interval}</span>
              </div>
              <ul className="space-y-3">
                {(planFeatures[product.name] || []).map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <form action={() => handleSubscribe(price.id)} className="w-full">
                <Button
                  className="w-full"
                  size="lg"
                  disabled={loadingPriceId === price.id}
                  variant={isFeatured ? "default" : "outline"}
                >
                  {loadingPriceId === price.id ? "Processing..." : "Choose Plan"}
                </Button>
              </form>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
