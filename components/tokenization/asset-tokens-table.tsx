"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ExternalLink, MoreVertical, Copy, Share, Eye } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { getExplorerUrl } from "@/lib/sui-client"

interface AssetTokensTableProps {
  tokens: any[]
  loading: boolean
  onRefresh: () => void
  showActions?: boolean
}

export function AssetTokensTable({ tokens, loading, onRefresh, showActions = false }: AssetTokensTableProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredTokens = tokens.filter((token) => {
    const assetName = token.assets?.name || ""
    return assetName.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const copyTokenId = (tokenId: string) => {
    navigator.clipboard.writeText(tokenId)
    toast({
      title: "Copied",
      description: "Token ID copied to clipboard",
    })
  }

  const viewOnExplorer = (txHash: string) => {
    window.open(getExplorerUrl(txHash), "_blank")
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Asset Tokens</CardTitle>
          <CardDescription>Loading tokenized assets...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Asset Tokens</CardTitle>
            <CardDescription>Your tokenized assets on Sui blockchain</CardDescription>
          </div>
          <Input
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xs"
          />
        </div>
      </CardHeader>
      <CardContent>
        {filteredTokens.length === 0 ? (
          <div className="text-center p-8">
            <p className="text-muted-foreground">No tokenized assets found</p>
            <p className="text-sm text-muted-foreground mt-2">
              {searchQuery ? "Try a different search" : "Tokenize your first asset to get started"}
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Token Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  {showActions && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTokens.map((token) => (
                  <TableRow key={token.id}>
                    <TableCell className="font-medium">{token.assets?.name || "Unknown"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{token.assets?.asset_type || "N/A"}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={token.metadata?.is_fractionalized ? "bg-blue-100 text-blue-800" : ""}>
                        {token.metadata?.is_fractionalized ? "Fractionalized" : "NFT"}
                      </Badge>
                    </TableCell>
                    <TableCell>${(token.assets?.current_value || 0).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge
                        variant={token.status === "active" ? "default" : "secondary"}
                        className={
                          token.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }
                      >
                        {token.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(token.created_at).toLocaleDateString()}</TableCell>
                    {showActions && (
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => copyTokenId(token.token_id)}>
                              <Copy className="w-4 h-4 mr-2" />
                              Copy Token ID
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => viewOnExplorer(token.tx_hash)}>
                              <ExternalLink className="w-4 h-4 mr-2" />
                              View on Explorer
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Share className="w-4 h-4 mr-2" />
                              Share Token
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
