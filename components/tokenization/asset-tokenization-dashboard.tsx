"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  Coins,
  TrendingUp,
  DollarSign,
  Shield,
  Users,
  BarChart3,
  Activity,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "@/hooks/use-toast"
import useSWR from "swr"
import {
  getTokenizedAssets,
  getUserFractionalOwnerships,
  getTokenizationAnalytics,
} from "@/app/actions/asset-tokenization-actions"
import { TokenizeAssetDialog } from "./tokenize-asset-dialog"
import { AssetTokensTable } from "./asset-tokens-table"
import { FractionalOwnershipGrid } from "./fractional-ownership-grid"
import { TokenTradingPanel } from "./token-trading-panel"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface AssetTokenizationDashboardProps {
  userId: string
}

const fetcher = async (url: string) => {
  const [action, userId] = url.split("|")

  if (action === "tokens") {
    const result = await getTokenizedAssets(userId)
    if (result.success) return result.data
    throw new Error(result.error)
  }

  if (action === "fractions") {
    const result = await getUserFractionalOwnerships(userId)
    if (result.success) return result.data
    throw new Error(result.error)
  }

  if (action === "analytics") {
    const result = await getTokenizationAnalytics(userId)
    if (result.success) return result.data
    throw new Error(result.error)
  }

  return null
}

export function AssetTokenizationDashboard({ userId }: AssetTokenizationDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [showTokenizeDialog, setShowTokenizeDialog] = useState(false)

  const {
    data: tokens = [],
    isLoading: tokensLoading,
    mutate: mutateTokens,
  } = useSWR(`tokens|${userId}`, fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
  })

  const {
    data: fractions = [],
    isLoading: fractionsLoading,
    mutate: mutateFractions,
  } = useSWR(`fractions|${userId}`, fetcher, {
    refreshInterval: 30000,
  })

  const {
    data: analytics,
    isLoading: analyticsLoading,
    mutate: mutateAnalytics,
  } = useSWR(`analytics|${userId}`, fetcher, {
    refreshInterval: 30000,
  })

  const handleRefresh = () => {
    mutateTokens()
    mutateFractions()
    mutateAnalytics()
    toast({
      title: "Data refreshed",
      description: "All tokenization data has been updated",
    })
  }

  const metrics = {
    totalTokens: analytics?.totalTokenizedAssets || tokens.length || 0,
    totalValue: analytics?.totalValueLocked || 0,
    fractionalizedAssets: analytics?.totalFractionalizedAssets || 0,
    totalRevenue: analytics?.totalRevenue || 0,
    fractionsSold: analytics?.totalFractionsSold || 0,
    avgAssetValue: analytics?.averageAssetValue || 0,
  }

  // Mock trend data
  const trendData = [
    { month: "Jan", tokens: 2, value: 45000 },
    { month: "Feb", tokens: 5, value: 98000 },
    { month: "Mar", tokens: 8, value: 156000 },
    { month: "Apr", tokens: 12, value: 234000 },
    { month: "May", tokens: 15, value: 312000 },
    { month: "Jun", tokens: metrics.totalTokens, value: metrics.totalValue },
  ]

  const distributionData = [
    { name: "NFTs", value: metrics.totalTokens - metrics.fractionalizedAssets, color: "hsl(var(--chart-1))" },
    { name: "Fractionalized", value: metrics.fractionalizedAssets, color: "hsl(var(--chart-2))" },
  ]

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Asset Tokenization
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tokenize your physical assets on Sui blockchain with comprehensive management tools
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setShowTokenizeDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Tokenize Asset
          </Button>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-6 gap-3 lg:gap-4"
      >
        <Card className="dashboard-metric-card">
          <CardContent className="p-3 lg:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="dashboard-metric-label text-xs">Total Tokens</p>
                <p className="dashboard-metric-value text-lg lg:text-xl">
                  {tokensLoading ? "..." : metrics.totalTokens}
                </p>
              </div>
              <Coins className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
            </div>
            <div className="mt-1 lg:mt-2">
              <div className="flex items-center gap-1">
                <ArrowUpRight className="h-2 w-2 text-green-600" />
                <span className="text-xs text-green-600 font-medium">Active</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-metric-card">
          <CardContent className="p-3 lg:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="dashboard-metric-label text-xs">Total Value</p>
                <p className="dashboard-metric-value text-lg lg:text-xl">
                  {analyticsLoading ? "..." : `$${(metrics.totalValue / 1000).toFixed(0)}K`}
                </p>
              </div>
              <DollarSign className="w-4 h-4 lg:w-5 lg:h-5 text-chart-2" />
            </div>
            <div className="mt-1 lg:mt-2">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-2 w-2 text-green-600" />
                <span className="text-xs text-green-600 font-medium">
                  Avg ${(metrics.avgAssetValue / 1000).toFixed(0)}K
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-metric-card">
          <CardContent className="p-3 lg:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="dashboard-metric-label text-xs">Fractionalized</p>
                <p className="dashboard-metric-value text-lg lg:text-xl">
                  {analyticsLoading ? "..." : metrics.fractionalizedAssets}
                </p>
              </div>
              <Users className="w-4 h-4 lg:w-5 lg:h-5 text-accent" />
            </div>
            <div className="mt-1 lg:mt-2">
              <div className="flex items-center gap-1">
                <Activity className="h-2 w-2 text-blue-600" />
                <span className="text-xs text-blue-600 font-medium">{metrics.fractionsSold} sold</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-metric-card">
          <CardContent className="p-3 lg:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="dashboard-metric-label text-xs">Revenue</p>
                <p className="dashboard-metric-value text-lg lg:text-xl">
                  {analyticsLoading ? "..." : `$${(metrics.totalRevenue / 1000).toFixed(1)}K`}
                </p>
              </div>
              <BarChart3 className="w-4 h-4 lg:w-5 lg:h-5 text-chart-3" />
            </div>
            <div className="mt-1 lg:mt-2">
              <div className="h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-chart-3"
                  style={{ width: `${Math.min((metrics.totalRevenue / metrics.totalValue) * 100, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-metric-card">
          <CardContent className="p-3 lg:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="dashboard-metric-label text-xs">Blockchain</p>
                <p className="dashboard-metric-value text-lg lg:text-xl">Sui</p>
              </div>
              <Shield className="w-4 h-4 lg:w-5 lg:h-5 text-chart-4" />
            </div>
            <div className="mt-1 lg:mt-2">
              <Badge variant="outline" className="text-xs">
                Mainnet
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-metric-card">
          <CardContent className="p-3 lg:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="dashboard-metric-label text-xs">My Holdings</p>
                <p className="dashboard-metric-value text-lg lg:text-xl">
                  {fractionsLoading ? "..." : fractions.length}
                </p>
              </div>
              <Coins className="w-4 h-4 lg:w-5 lg:h-5 text-chart-5" />
            </div>
            <div className="mt-1 lg:mt-2">
              <div className="flex items-center gap-1">
                <Users className="h-2 w-2 text-purple-600" />
                <span className="text-xs text-purple-600 font-medium">Fractional</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <Card className="enterprise-card">
            <CardHeader className="pb-2 lg:pb-4">
              <CardTitle className="text-sm lg:text-base">Tokenization Growth</CardTitle>
              <CardDescription className="text-xs">Asset tokenization trend over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                      fontSize: "11px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="tokens"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          <Card className="enterprise-card">
            <CardHeader className="pb-2 lg:pb-4">
              <CardTitle className="text-sm lg:text-base">Token Distribution</CardTitle>
              <CardDescription className="text-xs">NFTs vs Fractionalized assets</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                      fontSize: "11px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tabs Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tokens">My Tokens</TabsTrigger>
          <TabsTrigger value="trading">Trading</TabsTrigger>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <AssetTokensTable tokens={tokens} loading={tokensLoading} onRefresh={mutateTokens} />
        </TabsContent>

        <TabsContent value="tokens" className="space-y-4">
          <AssetTokensTable tokens={tokens} loading={tokensLoading} onRefresh={mutateTokens} showActions />
        </TabsContent>

        <TabsContent value="trading" className="space-y-4">
          <TokenTradingPanel userId={userId} />
        </TabsContent>

        <TabsContent value="marketplace" className="space-y-4">
          <FractionalOwnershipGrid fractions={fractions} loading={fractionsLoading} onRefresh={mutateFractions} />
        </TabsContent>
      </Tabs>

      {/* Tokenize Asset Dialog */}
      <TokenizeAssetDialog
        open={showTokenizeDialog}
        onOpenChange={setShowTokenizeDialog}
        userId={userId}
        onSuccess={() => {
          mutateTokens()
          mutateAnalytics()
        }}
      />
    </div>
  )
}
