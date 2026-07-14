"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, ShieldCheck, ExternalLink, CheckCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

interface OAuthConsentClientProps {
  authDetails: any
  authorizationId: string
  user: any
}

// Scope descriptions for user-friendly display
const SCOPE_DESCRIPTIONS: Record<string, { label: string; description: string; icon: string }> = {
  openid: {
    label: "Basic Profile",
    description: "Access your user ID and basic profile information",
    icon: "👤",
  },
  email: {
    label: "Email Address",
    description: "Access your email address",
    icon: "📧",
  },
  profile: {
    label: "Full Profile",
    description: "Access your name, avatar, and other profile details",
    icon: "👨‍💼",
  },
  read_assets: {
    label: "Read Assets",
    description: "View your assets and asset intelligence data",
    icon: "📦",
  },
  write_assets: {
    label: "Manage Assets",
    description: "Create, update, and delete your assets",
    icon: "✏️",
  },
  execute_agents: {
    label: "Execute AI Agents",
    description: "Run AI agents and workflows on your behalf",
    icon: "🤖",
  },
  read_embeddings: {
    label: "Read Embeddings",
    description: "Access your vector embeddings and semantic search data",
    icon: "🔍",
  },
  manage_tokenization: {
    label: "Manage Tokenization",
    description: "Create and manage tokenized assets (RWAs)",
    icon: "🪙",
  },
  manage_stablecoins: {
    label: "Manage Stablecoins",
    description: "Create and manage private stablecoins",
    icon: "💵",
  },
}

export function OAuthConsentClient({ authDetails, authorizationId, user }: OAuthConsentClientProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDecision = async (decision: "approve" | "deny") => {
    setIsProcessing(true)
    setError(null)

    try {
      const response = await fetch("/api/oauth/decision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorization_id: authorizationId,
          decision,
        }),
      })

      const data = await response.json()

      if (!response.ok || data.error) {
        setError(data.error || "Failed to process authorization")
        setIsProcessing(false)
        return
      }

      // Redirect back to the client application
      if (data.redirect_to) {
        window.location.href = data.redirect_to
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred")
      setIsProcessing(false)
    }
  }

  const requestedScopes = authDetails.scopes || []
  const clientName = authDetails.client?.name || "Unknown Application"
  const clientDescription = authDetails.client?.description
  const redirectUri = authDetails.redirect_uri

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-4 mb-4">
            <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl">{clientName}</CardTitle>
              {clientDescription && <CardDescription className="mt-1">{clientDescription}</CardDescription>}
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>{clientName}</strong> is requesting access to your Resend-It account
            </AlertDescription>
          </Alert>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* User Info */}
          <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.user_metadata?.avatar_url || "/placeholder.svg"} />
              <AvatarFallback>{user.email?.[0]?.toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium">{user.user_metadata?.full_name || "User"}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <Separator />

          {/* Requested Permissions */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              Requested Permissions
            </h3>
            <div className="space-y-2">
              {requestedScopes.map((scope: string) => {
                const scopeInfo = SCOPE_DESCRIPTIONS[scope] || {
                  label: scope,
                  description: `Access ${scope} data`,
                  icon: "🔐",
                }
                return (
                  <div key={scope} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <span className="text-2xl">{scopeInfo.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{scopeInfo.label}</p>
                      <p className="text-xs text-muted-foreground">{scopeInfo.description}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {scope}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </div>

          <Separator />

          {/* Redirect URI */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Application Details</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ExternalLink className="h-3 w-3" />
              <span className="font-mono">{redirectUri}</span>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={() => handleDecision("deny")}
              disabled={isProcessing}
            >
              Deny
            </Button>
            <Button className="flex-1" onClick={() => handleDecision("approve")} disabled={isProcessing}>
              {isProcessing ? "Processing..." : "Authorize"}
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            By authorizing, you allow {clientName} to access the permissions listed above. You can revoke access at any
            time from your account settings.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
