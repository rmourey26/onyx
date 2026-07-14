"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Check, Sparkles, AlertCircle, ArrowRight, Bot, Zap, Link2, Crown, TrendingUp, Shield } from "lucide-react"
import { createCheckoutSession, createStripePortalSession } from "@/app/actions/stripe-actions"
import type { User } from "@supabase/supabase-js"

interface MarketplaceSubscriptionsClientProps {
  user: User
  subscription: any
  products: any[]
  purchasedAgents: any[]
  deployedAgents: number
}

export function MarketplaceSubscriptionsClient({
  user,
  subscription,
  products,
  purchasedAgents,
  deployedAgents,
}: MarketplaceSubscriptionsClientProps) {
  const [billingInterval, setBillingInterval] = useState<"month" | "year">("month")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubscribe = async (priceId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await createCheckoutSession(priceId)
      if (result.error) {
        setError(result.error)
      } else if (result.url) {
        window.location.assign(result.url)
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
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
        window.location.href = result.url
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const planTier = subscription?.prices?.products?.metadata?.tier || "free"

  // Mock limits based on plan tier
  const getLimits = (tier: string) => {
    switch (tier) {
      case "starter":
        return { agents: 5, deployments: 10, oauthApps: 3 }
      case "professional":
        return { agents: 25, deployments: 100, oauthApps: 15 }
      case "enterprise":
        return { agents: -1, deployments: -1, oauthApps: -1 }
      default:
        return { agents: 2, deployments: 5, oauthApps: 1 }
    }
  }

  const limits = getLimits(planTier)
  const agentsPercentage = limits.agents > 0 ? (purchasedAgents.length / limits.agents) * 100 : 0
  const deploymentsPercentage = limits.deployments > 0 ? (deployedAgents / limits.deployments) * 100 : 0

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="marketplace-hero">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <Bot className="h-8 w-8 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold">
                Marketplace <span className="enterprise-text-gradient">Subscriptions</span>
              </h1>
            </div>
            <p className="text-xl text-muted-foreground text-pretty">
              Unlock the full power of our AI Agent Marketplace with flexible subscription plans designed for teams of
              all sizes
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue={subscription ? "current" : "plans"} className="space-y-8">
          <TabsList className="grid w-full max-w-md grid-cols-2 h-12">
            <TabsTrigger value="current" disabled={!subscription} className="text-base">
              Current Plan
            </TabsTrigger>
            <TabsTrigger value="plans" className="text-base">
              Available Plans
            </TabsTrigger>
          </TabsList>

          {/* Current Plan Tab */}
          <TabsContent value="current" className="space-y-6">
            {subscription ? (
              <>
                {/* Current Plan Overview */}
                <Card className="enterprise-card">
                  <CardHeader>
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div>
                        <CardTitle className="text-3xl flex items-center gap-3">
                          {subscription.prices?.products?.name}
                          {planTier === "enterprise" && <Crown className="h-7 w-7 text-yellow-500" />}
                          {planTier === "professional" && <Sparkles className="h-7 w-7 text-primary" />}
                        </CardTitle>
                        <CardDescription className="mt-3 flex items-center gap-2">
                          Status:{" "}
                          <Badge
                            variant={subscription.status === "active" ? "default" : "secondary"}
                            className={subscription.status === "active" ? "bg-accent" : ""}
                          >
                            {subscription.status}
                          </Badge>
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-4xl font-bold enterprise-text-gradient">
                          ${(subscription.prices?.unit_amount / 100).toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">per {subscription.prices?.interval}</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between p-4 rounded-lg bg-muted/50">
                        <span className="text-muted-foreground">Current period:</span>
                        <span className="font-medium">
                          {new Date(subscription.current_period_start).toLocaleDateString()} -{" "}
                          {new Date(subscription.current_period_end).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between p-4 rounded-lg bg-muted/50">
                        <span className="text-muted-foreground">Renewal date:</span>
                        <span className="font-medium">
                          {new Date(subscription.current_period_end).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {subscription.cancel_at_period_end && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Subscription Ending</AlertTitle>
                        <AlertDescription>
                          Your subscription will be canceled on{" "}
                          {new Date(subscription.current_period_end).toLocaleDateString()}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={handleManageSubscription}
                      disabled={isLoading}
                      className="w-full enterprise-button"
                      size="lg"
                    >
                      {isLoading ? "Loading..." : "Manage Subscription"}
                    </Button>
                  </CardFooter>
                </Card>

                {/* Usage Metrics */}
                <div className="grid gap-6 md:grid-cols-3">
                  {/* Purchased Agents */}
                  <Card className="enterprise-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bot className="h-5 w-5 text-primary" />
                        Marketplace Agents
                      </CardTitle>
                      <CardDescription>Agents in your library</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span>Purchased:</span>
                        <span className="font-bold text-lg">
                          {purchasedAgents.length} / {limits.agents === -1 ? "Unlimited" : limits.agents}
                        </span>
                      </div>
                      {limits.agents > 0 && <Progress value={agentsPercentage} className="h-2" />}
                      {agentsPercentage > 80 && limits.agents > 0 && (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-xs">
                            Approaching agent limit. Upgrade for more capacity.
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>

                  {/* Active Deployments */}
                  <Card className="enterprise-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-primary" />
                        Active Deployments
                      </CardTitle>
                      <CardDescription>Currently running agents</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span>Deployed:</span>
                        <span className="font-bold text-lg">
                          {deployedAgents} / {limits.deployments === -1 ? "Unlimited" : limits.deployments}
                        </span>
                      </div>
                      {limits.deployments > 0 && <Progress value={deploymentsPercentage} className="h-2" />}
                    </CardContent>
                  </Card>

                  {/* OAuth Connections */}
                  <Card className="enterprise-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Link2 className="h-5 w-5 text-primary" />
                        OAuth Integrations
                      </CardTitle>
                      <CardDescription>Connected applications</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span>Available:</span>
                        <span className="font-bold text-lg">
                          {limits.oauthApps === -1 ? "Unlimited" : `Up to ${limits.oauthApps}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Shield className="h-4 w-4" />
                        <span>OAuth 2.1 secured connections</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Purchased Agents Grid */}
                {purchasedAgents.length > 0 && (
                  <Card className="enterprise-card">
                    <CardHeader>
                      <CardTitle>Your Agents</CardTitle>
                      <CardDescription>Marketplace agents you own</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {purchasedAgents.slice(0, 6).map((purchase: any) => (
                          <div
                            key={purchase.id}
                            className="p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-colors"
                          >
                            <h4 className="font-semibold mb-1">{purchase.marketplace_agents?.name}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {purchase.marketplace_agents?.description}
                            </p>
                            <div className="mt-3 flex items-center justify-between">
                              <Badge variant="secondary" className="text-xs">
                                {purchase.marketplace_agents?.category}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {purchase.total_interactions || 0} runs
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      {purchasedAgents.length > 6 && (
                        <Button variant="outline" className="w-full mt-4 bg-transparent">
                          View All {purchasedAgents.length} Agents
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Upgrade Prompt */}
                {planTier !== "enterprise" && (
                  <Card className="oauth-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Unlock Premium Features
                      </CardTitle>
                      <CardDescription>
                        Upgrade to {planTier === "free" || planTier === "starter" ? "Professional" : "Enterprise"} for
                        advanced capabilities
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {(planTier === "free" || planTier === "starter") && (
                          <>
                            <li className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <Check className="h-4 w-4 text-primary" />
                              </div>
                              <span>Up to 25 marketplace agents</span>
                            </li>
                            <li className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <Check className="h-4 w-4 text-primary" />
                              </div>
                              <span>100 active deployments</span>
                            </li>
                            <li className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <Check className="h-4 w-4 text-primary" />
                              </div>
                              <span>15 OAuth app integrations</span>
                            </li>
                          </>
                        )}
                        {planTier === "professional" && (
                          <>
                            <li className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <Check className="h-4 w-4 text-primary" />
                              </div>
                              <span>Unlimited agents and deployments</span>
                            </li>
                            <li className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <Check className="h-4 w-4 text-primary" />
                              </div>
                              <span>Priority support with 2-hour SLA</span>
                            </li>
                            <li className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <Check className="h-4 w-4 text-primary" />
                              </div>
                              <span>Custom agent development assistance</span>
                            </li>
                          </>
                        )}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full enterprise-button" size="lg">
                        Upgrade Now
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                )}
              </>
            ) : (
              <Card className="enterprise-card">
                <CardHeader>
                  <CardTitle>No Active Subscription</CardTitle>
                  <CardDescription>Choose a plan to access premium marketplace features</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button className="w-full enterprise-button" size="lg">
                    View Available Plans
                  </Button>
                </CardFooter>
              </Card>
            )}
          </TabsContent>

          {/* Available Plans Tab */}
          <TabsContent value="plans" className="space-y-8">
            {/* Billing Interval Toggle */}
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-4 p-1.5 glass-morphism rounded-xl">
                <Button
                  variant={billingInterval === "month" ? "default" : "ghost"}
                  size="lg"
                  onClick={() => setBillingInterval("month")}
                  className={billingInterval === "month" ? "enterprise-button" : ""}
                >
                  Monthly
                </Button>
                <Button
                  variant={billingInterval === "year" ? "default" : "ghost"}
                  size="lg"
                  onClick={() => setBillingInterval("year")}
                  className={billingInterval === "year" ? "enterprise-button" : ""}
                >
                  Annual
                  <Badge variant="secondary" className="ml-2 bg-accent/20 text-accent">
                    Save 20%
                  </Badge>
                </Button>
              </div>
            </div>

            {/* Pricing Cards */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {/* Free Tier */}
              <Card className="marketplace-card">
                <CardHeader>
                  <CardTitle className="text-2xl">Free</CardTitle>
                  <div className="mt-4 mb-4">
                    <span className="text-5xl font-bold">$0</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <CardDescription>Perfect for trying out marketplace agents</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">Up to 2 marketplace agents</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">5 active deployments</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">1 OAuth integration</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">Community support</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full bg-transparent" disabled>
                    Current Plan
                  </Button>
                </CardFooter>
              </Card>

              {/* Starter Tier */}
              <Card className="marketplace-card">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">Starter</CardTitle>
                  <div className="mt-4 mb-4">
                    <span className="text-5xl font-bold">$29</span>
                    <span className="text-muted-foreground">/{billingInterval}</span>
                  </div>
                  <CardDescription>For individuals building with AI agents</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">Up to 5 marketplace agents</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">10 active deployments</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">3 OAuth integrations</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">Email support</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">Basic analytics</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full enterprise-button"
                    size="lg"
                    onClick={() => handleSubscribe("price_starter")}
                    disabled={isLoading}
                  >
                    {isLoading ? "Loading..." : "Get Started"}
                  </Button>
                </CardFooter>
              </Card>

              {/* Professional Tier */}
              <Card className="oauth-card">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="oauth-badge">
                    <Sparkles className="h-3 w-3" />
                    Most Popular
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    Professional
                    <Sparkles className="h-6 w-6 text-primary" />
                  </CardTitle>
                  <div className="mt-4 mb-4">
                    <span className="text-5xl font-bold enterprise-text-gradient">$99</span>
                    <span className="text-muted-foreground">/{billingInterval}</span>
                  </div>
                  <CardDescription>For teams scaling with AI automation</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">Up to 25 marketplace agents</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">100 active deployments</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">15 OAuth integrations</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">Priority support (24h response)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">Advanced analytics & insights</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">Team collaboration features</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full enterprise-button"
                    size="lg"
                    onClick={() => handleSubscribe("price_pro")}
                    disabled={isLoading}
                  >
                    {isLoading ? "Loading..." : "Upgrade to Pro"}
                  </Button>
                </CardFooter>
              </Card>

              {/* Enterprise Tier */}
              <Card className="marketplace-card md:col-span-2 lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    Enterprise
                    <Crown className="h-6 w-6 text-yellow-500" />
                  </CardTitle>
                  <div className="mt-4 mb-4">
                    <span className="text-5xl font-bold">Custom</span>
                  </div>
                  <CardDescription>For organizations with advanced needs</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">Unlimited agents & deployments</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">Unlimited OAuth integrations</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">Dedicated support with 2h SLA</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">Custom agent development</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">Dedicated account manager</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">Custom SLA & security reviews</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full bg-transparent" size="lg">
                    Contact Sales
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Feature Comparison */}
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle>Compare Plans</CardTitle>
                <CardDescription>Find the right plan for your team</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-4 px-4">Feature</th>
                        <th className="text-center py-4 px-4">Free</th>
                        <th className="text-center py-4 px-4">Starter</th>
                        <th className="text-center py-4 px-4">Professional</th>
                        <th className="text-center py-4 px-4">Enterprise</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border/50">
                        <td className="py-4 px-4">Marketplace Agents</td>
                        <td className="text-center py-4 px-4">2</td>
                        <td className="text-center py-4 px-4">5</td>
                        <td className="text-center py-4 px-4">25</td>
                        <td className="text-center py-4 px-4">Unlimited</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-4 px-4">Active Deployments</td>
                        <td className="text-center py-4 px-4">5</td>
                        <td className="text-center py-4 px-4">10</td>
                        <td className="text-center py-4 px-4">100</td>
                        <td className="text-center py-4 px-4">Unlimited</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-4 px-4">OAuth Integrations</td>
                        <td className="text-center py-4 px-4">1</td>
                        <td className="text-center py-4 px-4">3</td>
                        <td className="text-center py-4 px-4">15</td>
                        <td className="text-center py-4 px-4">Unlimited</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-4 px-4">Team Members</td>
                        <td className="text-center py-4 px-4">1</td>
                        <td className="text-center py-4 px-4">3</td>
                        <td className="text-center py-4 px-4">10</td>
                        <td className="text-center py-4 px-4">Unlimited</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-4 px-4">Support</td>
                        <td className="text-center py-4 px-4">Community</td>
                        <td className="text-center py-4 px-4">Email</td>
                        <td className="text-center py-4 px-4">Priority</td>
                        <td className="text-center py-4 px-4">Dedicated</td>
                      </tr>
                      <tr>
                        <td className="py-4 px-4">API Access</td>
                        <td className="text-center py-4 px-4">-</td>
                        <td className="text-center py-4 px-4">
                          <Check className="h-5 w-5 text-primary mx-auto" />
                        </td>
                        <td className="text-center py-4 px-4">
                          <Check className="h-5 w-5 text-primary mx-auto" />
                        </td>
                        <td className="text-center py-4 px-4">
                          <Check className="h-5 w-5 text-primary mx-auto" />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">Can I change plans at any time?</h4>
                  <p className="text-sm text-muted-foreground">
                    Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll
                    prorate any payments.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">What happens to my agents if I downgrade?</h4>
                  <p className="text-sm text-muted-foreground">
                    Your agents remain in your library. If you exceed your new plan's limits, you'll need to choose
                    which agents to keep active.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Do OAuth integrations expire?</h4>
                  <p className="text-sm text-muted-foreground">
                    OAuth tokens are automatically refreshed. Your integrations remain active as long as you maintain
                    your subscription.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Is there a free trial?</h4>
                  <p className="text-sm text-muted-foreground">
                    Yes! All paid plans include a 14-day free trial. No credit card required to start.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
