import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PricingTable } from "@/components/billing/pricing-table"
import { ManageSubscriptionButton } from "@/components/billing/manage-subscription-button"
import type { Metadata } from "next"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Billing - AI Business Suite",
  description: "Manage your subscription and billing information for Shopify & Wix integrations.",
}

export default async function BillingPage({
  searchParams,
}: { searchParams: Promise<{ success?: string; error?: string }> }) {
  const resolvedSearchParams = await searchParams
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return redirect("/login")
  }

  const { data: subscription, error: subError } = await supabase
    .from("subscriptions")
    .select("*, prices(*, products(*))")
    .in("status", ["trialing", "active"])
    .maybeSingle()

  if (subError) {
    console.error("Error fetching subscription:", subError)
  }

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("*, prices(*)")
    .eq("active", true)
    .eq("prices.active", true)
    .order("metadata->index")

  if (productsError) {
    console.error("Error fetching products:", productsError)
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-5xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Billing & Subscriptions</h1>
        <p className="text-muted-foreground mt-4 text-lg">
          Choose the perfect plan to supercharge your Shopify or Wix store with AI.
        </p>
      </div>

      {resolvedSearchParams.success && (
        <Alert variant="default" className="mb-8 bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Success!</AlertTitle>
          <AlertDescription className="text-green-700">
            Your subscription has been activated. Welcome aboard!
          </AlertDescription>
        </Alert>
      )}
      {resolvedSearchParams.error && (
        <Alert variant="destructive" className="mb-8">
          <XCircle className="h-4 w-4" />
          <AlertTitle>An Error Occurred</AlertTitle>
          <AlertDescription>
            Something went wrong with your request. Please try again or contact support.
          </AlertDescription>
        </Alert>
      )}

      {subscription ? (
        <div className="p-8 bg-card rounded-2xl border shadow-sm">
          <h2 className="text-2xl font-semibold mb-2">Your Current Plan</h2>
          <p className="text-lg mb-1">
            You are subscribed to the{" "}
            <span className="font-bold text-primary">{subscription.prices?.products?.name}</span> plan.
          </p>
          <p className="text-muted-foreground mb-6">
            Your subscription will {subscription.cancel_at_period_end ? "be canceled" : "renew"} on{" "}
            {new Date(subscription.current_period_end).toLocaleDateString()}.
          </p>
          <ManageSubscriptionButton />
        </div>
      ) : (
        <PricingTable user={user} products={products || []} />
      )}
    </div>
  )
}
