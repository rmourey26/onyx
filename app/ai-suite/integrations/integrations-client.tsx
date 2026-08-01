"use client"

import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { IntegrationsList } from "@/components/ai-suite/integrations/integrations-list"
import { ConnectShopifyForm } from "@/components/ai-suite/integrations/connect-shopify-form"
import { initiateShopifyAuth, resyncShopifyData, disconnectIntegration } from "@/app/actions/integration-actions"
import type { ExternalIntegration } from "@/lib/types/database"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShopifyIcon, WixIcon } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"

interface IntegrationsClientProps {
  initialIntegrations: ExternalIntegration[]
}

export function IntegrationsClient({ initialIntegrations }: IntegrationsClientProps) {
  const [integrations, setIntegrations] = useState(initialIntegrations)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleConnectShopify = async (shopUrl: string) => {
    setIsLoading(true)
    const result = await initiateShopifyAuth(shopUrl)
    if (result.success && result.authUrl) {
      window.location.href = result.authUrl
    } else {
      toast({
        variant: "destructive",
        title: "Failed to connect Shopify",
        description: result.error || "An unknown error occurred.",
      })
      setIsLoading(false)
    }
  }

  const handleResync = async (id: string) => {
    toast({ title: "Starting data sync...", description: "This may take a few minutes." })
    const result = await resyncShopifyData(id)
    if (result.success) {
      toast({ title: "Sync in progress", description: "Your data is being synced in the background." })
    } else {
      toast({
        variant: "destructive",
        title: "Failed to start sync",
        description: result.error,
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to disconnect this integration? This action cannot be undone.")) {
      return
    }
    const result = await disconnectIntegration(id)
    if (result.success) {
      setIntegrations(integrations.filter((int) => int.id !== id))
      toast({ title: "Integration disconnected" })
    } else {
      toast({
        variant: "destructive",
        title: "Failed to disconnect",
        description: result.error,
      })
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight enterprise-text-gradient sm:text-4xl">
            External Integrations
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-lg text-muted-foreground">
            Connect your e-commerce stores and external platforms to the Kronova ecosystem.
          </p>
        </div>

        <Card className="enterprise-card glass-morphism border-none">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">Connect a New Platform</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Select a platform to start syncing your data.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="enterprise-card p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-xl bg-green-500/10">
                  <ShopifyIcon className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold">Shopify</h3>
              </div>
              <p className="text-muted-foreground mb-4 text-sm">
                Sync your products, orders, and customers to leverage AI-powered insights and automations.
              </p>
              <ConnectShopifyForm onSubmit={handleConnectShopify} isLoading={isLoading} />
            </Card>
            <Card className="enterprise-card p-6 flex flex-col justify-between bg-muted/30">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-blue-500/10">
                    <WixIcon className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-semibold">Wix</h3>
                </div>
                <p className="text-muted-foreground mb-4 text-sm">
                  Wix integration is coming soon. Connect your store to get notified when it's available.
                </p>
              </div>
              <Button disabled className="opacity-50">
                Coming Soon
              </Button>
            </Card>
          </CardContent>
        </Card>

        <IntegrationsList integrations={integrations} onResync={handleResync} onDelete={handleDelete} />
      </div>
    </div>
  )
}
