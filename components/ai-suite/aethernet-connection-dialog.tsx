"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Network, CheckCircle2, AlertCircle } from "lucide-react"
import { connectAetherNet, testAetherNetConnection } from "@/app/actions/oauth-agent-actions"
import { useToast } from "@/components/ui/use-toast"

interface AetherNetConnectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AetherNetConnectionDialog({ open, onOpenChange }: AetherNetConnectionDialogProps) {
  const [connectionName, setConnectionName] = useState("")
  const [aethernetAddress, setAethernetAddress] = useState("")
  const [networkType, setNetworkType] = useState<"mainnet" | "testnet">("testnet")
  const [isConnecting, setIsConnecting] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [connectionId, setConnectionId] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "connected" | "error">("idle")
  const { toast } = useToast()

  const handleConnect = async () => {
    if (!connectionName || !aethernetAddress) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsConnecting(true)
    try {
      const result = await connectAetherNet({
        connection_name: connectionName,
        aethernet_address: aethernetAddress,
        network_type: networkType,
      })

      if (result.success && result.data) {
        setConnectionId(result.data.id)
        setConnectionStatus("connected")
        toast({
          title: "Connection Created",
          description: "AetherNet connection has been configured successfully",
        })
      } else {
        throw new Error(result.error || "Failed to create connection")
      }
    } catch (error: any) {
      console.error("[v0] Error connecting to AetherNet:", error)
      setConnectionStatus("error")
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const handleTestConnection = async () => {
    if (!connectionId) return

    setIsTesting(true)
    try {
      const result = await testAetherNetConnection(connectionId)

      if (result.success) {
        toast({
          title: "Connection Tested",
          description: "AetherNet connection is working correctly",
        })
        setConnectionStatus("connected")
      } else {
        throw new Error(result.error || "Connection test failed")
      }
    } catch (error: any) {
      console.error("[v0] Error testing connection:", error)
      setConnectionStatus("error")
      toast({
        title: "Test Failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsTesting(false)
    }
  }

  const handleClose = () => {
    setConnectionName("")
    setAethernetAddress("")
    setNetworkType("testnet")
    setConnectionId(null)
    setConnectionStatus("idle")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-pink-500/10">
              <Network className="h-5 w-5 text-pink-500" />
            </div>
            <div>
              <DialogTitle>Connect to AetherNet</DialogTitle>
              <DialogDescription>Configure your AetherNet P2P messaging connection</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Connection Status */}
          {connectionStatus !== "idle" && (
            <Alert>
              <div className="flex items-center gap-2">
                {connectionStatus === "connected" ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                <AlertDescription>
                  {connectionStatus === "connected"
                    ? "Connection established successfully"
                    : "Connection failed - please check your configuration"}
                </AlertDescription>
              </div>
            </Alert>
          )}

          {/* Connection Name */}
          <div className="space-y-2">
            <Label htmlFor="connection-name">Connection Name</Label>
            <Input
              id="connection-name"
              placeholder="My AetherNet Connection"
              value={connectionName}
              onChange={(e) => setConnectionName(e.target.value)}
              disabled={isConnecting || connectionStatus === "connected"}
            />
          </div>

          {/* AetherNet Address */}
          <div className="space-y-2">
            <Label htmlFor="aethernet-address">AetherNet Address</Label>
            <Input
              id="aethernet-address"
              placeholder="aether://node.example.com:7890"
              value={aethernetAddress}
              onChange={(e) => setAethernetAddress(e.target.value)}
              disabled={isConnecting || connectionStatus === "connected"}
            />
            <p className="text-xs text-muted-foreground">The P2P address of the AetherNet node</p>
          </div>

          {/* Network Type */}
          <div className="space-y-2">
            <Label>Network Type</Label>
            <div className="flex gap-2">
              <Badge
                variant={networkType === "mainnet" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setNetworkType("mainnet")}
              >
                Mainnet
              </Badge>
              <Badge
                variant={networkType === "testnet" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setNetworkType("testnet")}
              >
                Testnet
              </Badge>
            </div>
          </div>

          {/* Info Box */}
          <Alert>
            <Network className="h-4 w-4" />
            <AlertDescription className="text-xs">
              AetherNet provides decentralized, encrypted messaging for AI agents. Your connection will be secured with
              end-to-end encryption.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          {connectionStatus === "connected" ? (
            <>
              <Button variant="outline" onClick={handleTestConnection} disabled={isTesting}>
                {isTesting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Test Connection
              </Button>
              <Button onClick={handleClose}>Done</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleConnect} disabled={isConnecting}>
                {isConnecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Connect
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
