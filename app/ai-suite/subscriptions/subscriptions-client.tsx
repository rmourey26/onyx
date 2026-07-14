"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Check,
  Zap,
  Database,
  Workflow,
  HardDrive,
  TrendingUp,
  Crown,
  Sparkles,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  XCircle,
  CalendarClock,
} from "lucide-react"
import { createCheckoutSession, createStripePortalSession } from "@/app/actions/stripe-actions"
import type { User } from "@supabase/supabase-js"

interface TokenUsage {
  totalTokens: number
  promptTokens: number
  completionTokens: number
  operationCount: number
  periodStart: string
  periodEnd: string
}

interface SubscriptionsClientProps {
  user: User
  subscription: any
  products: any[]
  assetsCount: number
  workflowsCount: number
  tokenUsage?: TokenUsage
}

export function SubscriptionsClient({
  user,
  subscription,
  products,
  assetsCount,
  workflowsCount,
  tokenUsage,
}: SubscriptionsClientProps) {
  const [billingInterval, setBillingInterval] = useState<"month" | "year">("month")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Open a Stripe-hosted URL safely regardless of iframe context.
  // Stripe blocks rendering inside iframes, so when the app is embedded
  // (e.g. the v0 preview) we open a new tab instead of navigating in place.
  const openStripeUrl = (url: string) => {
    if (window.self !== window.top) {
      window.open(url, "_blank", "noopener,noreferrer")
    } else {
      window.location.assign(url)
    }
  }

  const handleSubscribe = async (priceId: string) => {
    setIsLoading(true)
    setError(null)
    let result
    try {
      result = await createCheckoutSession(priceId)

      if (result.error) {
        setError(result.error)
      } else if (result.url) {
        openStripeUrl(result.url)
      } else {
        setError("Failed to create checkout session. Please try again.")
      }
    } catch (error) {
      console.error("Error in handleSubscribe:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      // Don't reset loading if we're in the process of navigating away
      if (!result?.url) {
        setIsLoading(false)
      }
    }
  }

  const handleManageSubscription = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await createStripePortalSession()
      if (result.error) {
        setError(result.error)
      } else if (result.url) {
        openStripeUrl(result.url)
      }
    } catch (error) {
      console.error("Error opening billing portal:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate usage percentages — prefer live metered data over stale subscription column
  const aiTokensUsed = tokenUsage?.totalTokens ?? subscription?.ai_tokens_used ?? 0
  const aiTokensLimit =
    subscription?.prices?.products?.metadata?.ai_tokens_limit ||
    subscription?.ai_tokens_limit ||
    100000
  const aiTokensPercentage = Math.min((aiTokensUsed / aiTokensLimit) * 100, 100)

  const assetsLimit = subscription?.assets_limit || 100
  const assetsPercentage = (assetsCount / assetsLimit) * 100

  const workflowsLimit = subscription?.workflows_limit || 2
  const workflowsPercentage = workflowsLimit > 0 ? (workflowsCount / workflowsLimit) * 100 : 0

  const storageUsed = subscription?.storage_used_gb || 0
  const storageLimit = subscription?.storage_limit_gb || 5
  const storagePercentage = (storageUsed / storageLimit) * 100

  const planTier = subscription?.plan_tier || "none"

  // Derive a normalised status for display
  const subStatus: "active" | "trialing" | "canceling" | "none" = (() => {
    if (!subscription) return "none"
    if (subscription.cancel_at_period_end) return "canceling"
    if (subscription.status === "trialing") return "trialing"
    return "active"
  })()

  const statusConfig = {
    active: {
      label: "Active",
      icon: CheckCircle2,
      banner: "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400",
      badge: "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30",
    },
    trialing: {
      label: "Trial",
      icon: Clock,
      banner: "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-400",
      badge: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
    },
    canceling: {
      label: "Canceling",
      icon: CalendarClock,
      banner: "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400",
      badge: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
    },
    none: {
      label: "Inactive",
      icon: XCircle,
      banner: "bg-muted border-border text-muted-foreground",
      badge: "bg-muted text-muted-foreground border-border",
    },
  }

  const currentStatus = statusConfig[subStatus]
  const StatusIcon = currentStatus.icon

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Subscription Management</h1>
        <p className="text-muted-foreground text-lg">
          Manage your Kronova Asset Intelligence subscription and monitor your usage
        </p>
      </div>

      {/* Subscription Status Banner */}
      <div className={`flex items-center justify-between rounded-lg border px-5 py-4 mb-6 ${currentStatus.banner}`}>
        <div className="flex items-center gap-3">
          <StatusIcon className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold leading-none mb-1">
              {subStatus === "none"
                ? "No active subscription"
                : subscription?.prices?.products?.name ?? "Subscription"}
            </p>
            <p className="text-sm opacity-80">
              {subStatus === "active" &&
                `Renews ${new Date(subscription.current_period_end).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`}
              {subStatus === "trialing" &&
                `Trial ends ${new Date(subscription.trial_end).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`}
              {subStatus === "canceling" &&
                `Access until ${new Date(subscription.current_period_end).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`}
              {subStatus === "none" && "Choose a plan below to get started"}
            </p>
          </div>
        </div>
        <span
          className={`text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full border ${currentStatus.badge}`}
        >
          {currentStatus.label}
        </span>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue={subscription ? "current" : "plans"} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="current" disabled={!subscription}>
            Current Plan
          </TabsTrigger>
          <TabsTrigger value="plans">Available Plans</TabsTrigger>
        </TabsList>

        {/* Current Plan Tab */}
        <TabsContent value="current" className="space-y-6">
          {subscription ? (
            <>
              {/* Current Plan Overview */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl flex items-center gap-2">
                        {subscription.prices?.products?.name}
                        {planTier === "enterprise" && <Crown className="h-6 w-6 text-yellow-500" />}
                        {planTier === "pro" && <Sparkles className="h-6 w-6 text-primary" />}
                      </CardTitle>
                      <CardDescription className="mt-2 flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border ${currentStatus.badge}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {currentStatus.label}
                        </span>
                        {subscription.prices?.interval && (
                          <span className="text-xs text-muted-foreground capitalize">
                            {subscription.prices.interval}ly billing
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold">${(subscription.prices?.unit_amount / 100).toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">per {subscription.prices?.interval}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Current period:</span>
                    <span className="font-medium">
                      {new Date(subscription.current_period_start).toLocaleDateString()} -{" "}
                      {new Date(subscription.current_period_end).toLocaleDateString()}
                    </span>
                  </div>
                  {subscription.cancel_at_period_end && (
                    <Alert variant="default" className="border-amber-500/30 bg-amber-500/10">
                      <CalendarClock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      <AlertTitle className="text-amber-700 dark:text-amber-400">Cancellation Scheduled</AlertTitle>
                      <AlertDescription className="text-amber-700/80 dark:text-amber-400/80">
                        Your subscription will not renew after{" "}
                        {new Date(subscription.current_period_end).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                        . You retain full access until then.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
                <CardFooter>
                  <Button onClick={handleManageSubscription} disabled={isLoading} className="w-full">
                    {isLoading ? "Loading..." : "Manage Subscription"}
                  </Button>
                </CardFooter>
              </Card>

              {/* Usage Metrics */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* AI Tokens Usage */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-primary" />
                      AI Tokens
                    </CardTitle>
                    <CardDescription>
                      Live metered usage &mdash; billed via Stripe
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>Used this period:</span>
                      <span className="font-medium">
                        {aiTokensUsed.toLocaleString()} / {aiTokensLimit.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={aiTokensPercentage} className="h-2" />
                    {tokenUsage && (
                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground pt-1">
                        <div className="flex justify-between">
                          <span>Prompt tokens:</span>
                          <span className="font-medium text-foreground">
                            {tokenUsage.promptTokens.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Completion tokens:</span>
                          <span className="font-medium text-foreground">
                            {tokenUsage.completionTokens.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Operations:</span>
                          <span className="font-medium text-foreground">
                            {tokenUsage.operationCount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Period ends:</span>
                          <span className="font-medium text-foreground">
                            {tokenUsage.periodEnd
                              ? new Date(tokenUsage.periodEnd).toLocaleDateString()
                              : "—"}
                          </span>
                        </div>
                      </div>
                    )}
                    {aiTokensPercentage > 80 && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          You&apos;ve used {aiTokensPercentage.toFixed(0)}% of your monthly AI tokens. Consider
                          upgrading for more capacity.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                {/* Assets Usage */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5 text-primary" />
                      Managed Assets
                    </CardTitle>
                    <CardDescription>Total assets in your account</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>Current assets:</span>
                      <span className="font-medium">
                        {assetsCount} / {assetsLimit === -1 ? "Unlimited" : assetsLimit}
                      </span>
                    </div>
                    {assetsLimit > 0 && <Progress value={assetsPercentage} className="h-2" />}
                    {assetsPercentage > 80 && assetsLimit > 0 && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          You're approaching your asset limit. Upgrade to manage more assets.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                {/* Workflows Usage */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Workflow className="h-5 w-5 text-primary" />
                      Active Workflows
                    </CardTitle>
                    <CardDescription>Automated workflows in use</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>Active workflows:</span>
                      <span className="font-medium">
                        {workflowsCount} / {workflowsLimit === -1 ? "Unlimited" : workflowsLimit}
                      </span>
                    </div>
                    {workflowsLimit > 0 && <Progress value={workflowsPercentage} className="h-2" />}
                  </CardContent>
                </Card>

                {/* Storage Usage */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <HardDrive className="h-5 w-5 text-primary" />
                      Storage
                    </CardTitle>
                    <CardDescription>Document and image storage</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>Storage used:</span>
                      <span className="font-medium">
                        {storageUsed.toFixed(2)} GB / {storageLimit === -1 ? "Unlimited" : `${storageLimit} GB`}
                      </span>
                    </div>
                    {storageLimit > 0 && <Progress value={storagePercentage} className="h-2" />}
                  </CardContent>
                </Card>
              </div>

              {/* Upgrade Prompt */}
              {planTier !== "enterprise" && (
                <Card className="border-primary bg-primary/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Ready to Upgrade?
                    </CardTitle>
                    <CardDescription>
                      Unlock more features and higher limits with {planTier === "lite" ? "Pro" : "Enterprise"} plan
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {planTier === "lite" && (
                        <>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-primary" />
                            <span>1,000,000 AI tokens per month</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-primary" />
                            <span>Up to 1,000 managed assets</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-primary" />
                            <span>API access and custom analytics</span>
                          </li>
                        </>
                      )}
                      {planTier === "pro" && (
                        <>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-primary" />
                            <span>Unlimited AI tokens and assets</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-primary" />
                            <span>Unlimited users and workflows</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-primary" />
                            <span>Dedicated support and custom SLA</span>
                          </li>
                        </>
                      )}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" onClick={() => setBillingInterval("month")}>
                      View Upgrade Options
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Active Subscription</CardTitle>
                <CardDescription>Choose a plan to get started with Kronova Asset Intelligence</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button onClick={() => setBillingInterval("month")} className="w-full">
                  View Available Plans
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>

        {/* Available Plans Tab */}
        <TabsContent value="plans" className="space-y-6">
          {/* Billing Interval Toggle */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-4 p-1 bg-muted rounded-lg">
              <Button
                variant={billingInterval === "month" ? "default" : "ghost"}
                size="sm"
                onClick={() => setBillingInterval("month")}
              >
                Monthly
              </Button>
              <Button
                variant={billingInterval === "year" ? "default" : "ghost"}
                size="sm"
                onClick={() => setBillingInterval("year")}
              >
                Annual
                <Badge variant="secondary" className="ml-2">
                  Save 20%
                </Badge>
              </Button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid gap-6 md:grid-cols-3">
            {products.map((product) => {
              const price = product.prices?.find((p: any) => p.interval === billingInterval)
              if (!price) return null

              const metadata = product.metadata || {}
              const features = metadata.features || []
              const tier = metadata.tier || ""
              const isCurrentPlan = subscription?.prices?.product_id === product.id

              return (
                <Card
                  key={product.id}
                  className={`relative ${tier === "pro" ? "border-primary shadow-lg" : ""} ${
                    isCurrentPlan ? "ring-2 ring-primary" : ""
                  }`}
                >
                  {tier === "pro" && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-2xl">{product.name}</CardTitle>
                      {tier === "enterprise" && <Crown className="h-6 w-6 text-yellow-500" />}
                      {tier === "pro" && <Sparkles className="h-6 w-6 text-primary" />}
                    </div>
                    <div className="mb-4">
                      <span className="text-4xl font-bold">${(price.unit_amount / 100).toFixed(0)}</span>
                      <span className="text-muted-foreground">/{billingInterval}</span>
                    </div>
                    <CardDescription>{product.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {features.map((feature: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    {isCurrentPlan ? (
                      <Button variant="outline" className="w-full bg-transparent" disabled>
                        Current Plan
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        onClick={() => handleSubscribe(price.id)}
                        disabled={isLoading}
                        variant={tier === "pro" ? "default" : "outline"}
                      >
                        {isLoading ? "Loading..." : subscription ? "Upgrade" : "Subscribe"}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              )
            })}
          </div>

          {/* FAQ Section */}
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">What are AI Tokens?</h4>
                <p className="text-sm text-muted-foreground">
                  AI Tokens are the universal currency for all AI operations on the platform, including generating
                  insights, running agents, and performing advanced analytics. Your token usage resets monthly.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Can I upgrade or downgrade my plan?</h4>
                <p className="text-sm text-muted-foreground">
                  Yes! You can upgrade or downgrade your plan at any time. Changes will be prorated and reflected in
                  your next billing cycle.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">What happens if I exceed my limits?</h4>
                <p className="text-sm text-muted-foreground">
                  When you reach your monthly AI token or asset limit, the corresponding features will be temporarily
                  disabled until your next billing cycle or until you upgrade your plan.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
