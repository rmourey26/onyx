"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Key, Copy, Eye, EyeOff, Plus, Trash2, RefreshCw } from "lucide-react"
import { toast } from "sonner"

interface OAuthClientManagerProps {
  clients: any[]
  userId: string
}

export function OAuthClientManager({ clients, userId }: OAuthClientManagerProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showSecrets, setShowSecrets] = useState<{ [key: string]: boolean }>({})
  const [creating, setCreating] = useState(false)

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">OAuth 2.1 Clients</h2>
          <p className="text-sm text-muted-foreground">Manage OAuth clients for MCP authentication</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Client
        </Button>
      </div>

      {clients.length === 0 ? (
        <Card className="enterprise-card">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Key className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No OAuth Clients</h3>
            <p className="text-sm text-muted-foreground mb-4 text-center">
              Create your first OAuth 2.1 client to enable MCP authentication
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Client
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {clients.map((client) => (
            <Card key={client.id} className="enterprise-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{client.client_name}</CardTitle>
                    {client.client_description && (
                      <CardDescription className="mt-1">{client.client_description}</CardDescription>
                    )}
                  </div>
                  <Badge variant={client.is_active ? "default" : "secondary"}>
                    {client.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Client ID</Label>
                    <div className="flex gap-2">
                      <Input value={client.client_id} readOnly className="font-mono text-sm" />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(client.client_id, "Client ID")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Client Secret</Label>
                    <div className="flex gap-2">
                      <Input
                        type={showSecrets[client.id] ? "text" : "password"}
                        value={client.client_secret_hash?.substring(0, 20) + "..."}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          setShowSecrets((prev) => ({
                            ...prev,
                            [client.id]: !prev[client.id],
                          }))
                        }
                      >
                        {showSecrets[client.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Allowed Scopes</Label>
                  <div className="flex flex-wrap gap-2">
                    {client.allowed_scopes?.map((scope: string) => (
                      <Badge key={scope} variant="secondary" className="font-mono text-xs">
                        {scope}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Redirect URIs</Label>
                  <div className="space-y-1">
                    {client.redirect_uris?.map((uri: string, idx: number) => (
                      <div key={idx} className="text-xs font-mono bg-muted/50 p-2 rounded">
                        {uri}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Rotate Secret
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive bg-transparent">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create OAuth 2.1 Client</DialogTitle>
            <DialogDescription>Register a new OAuth client for MCP authentication</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="client-name">Client Name</Label>
              <Input id="client-name" placeholder="My MCP Agent" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-description">Description</Label>
              <Textarea id="client-description" placeholder="OAuth client for..." rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="redirect-uris">Redirect URIs (one per line)</Label>
              <Textarea
                id="redirect-uris"
                placeholder={`${process.env.NEXT_PUBLIC_APP_URL}/oauth/callback\n${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/callback`}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Allowed Scopes</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  "execute_agents",
                  "read_assets",
                  "write_workflows",
                  "marketplace.read",
                  "marketplace.execute",
                  "user.profile",
                ].map((scope) => (
                  <div key={scope} className="flex items-center gap-2">
                    <input type="checkbox" id={scope} className="rounded" />
                    <Label htmlFor={scope} className="text-xs font-mono cursor-pointer">
                      {scope}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={() => setShowCreateDialog(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button className="flex-1" disabled={creating}>
                {creating ? "Creating..." : "Create Client"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
