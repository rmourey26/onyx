"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import useSWR from "swr"
import {
  Bot,
  MessageCircle,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Brain,
  Zap,
  Activity,
  BarChart3,
  Filter,
  RefreshCw,
  Download,
  Settings,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts"
import {
  getSupportLearningMetrics,
  getIntentPatterns,
  getKnowledgeGaps,
  getSupportConversations,
  type LearningMetrics,
  type IntentPattern,
  type KnowledgeGap,
  type SupportConversation,
} from "@/app/actions/support-learning-actions"

// ============================================================================
// Data Fetchers
// ============================================================================

async function fetchLearningMetrics(timeRange: string) {
  const result = await getSupportLearningMetrics("system", timeRange as any)
  return result.data
}

async function fetchIntentPatterns() {
  const result = await getIntentPatterns("system", 10)
  return result.data
}

async function fetchKnowledgeGaps() {
  const result = await getKnowledgeGaps("system", 10)
  return result.data
}

async function fetchConversations() {
  const result = await getSupportConversations("system", 100)
  return result.data
}

// ============================================================================
// Mock Trend Data
// ============================================================================

const performanceTrendData = [
  { date: "Mon", accuracy: 87, satisfaction: 89, resolution: 82 },
  { date: "Tue", accuracy: 89, satisfaction: 91, resolution: 85 },
  { date: "Wed", accuracy: 91, satisfaction: 92, resolution: 88 },
  { date: "Thu", accuracy: 90, satisfaction: 90, resolution: 86 },
  { date: "Fri", accuracy: 92, satisfaction: 94, resolution: 89 },
  { date: "Sat", accuracy: 93, satisfaction: 93, resolution: 90 },
  { date: "Sun", accuracy: 94, satisfaction: 95, resolution: 92 },
]

const volumeTrendData = [
  { hour: "00:00", conversations: 12, resolved: 10 },
  { hour: "04:00", conversations: 8, resolved: 7 },
  { hour: "08:00", conversations: 45, resolved: 38 },
  { hour: "12:00", conversations: 78, resolved: 65 },
  { hour: "16:00", conversations: 92, resolved: 79 },
  { hour: "20:00", conversations: 56, resolved: 48 },
]

// ============================================================================
// Main Component
// ============================================================================

export function ChatbotLearningAnalytics() {
  const [activeTab, setActiveTab] = useState("overview")
  const [timeRange, setTimeRange] = useState("7d")

  // Data fetching with SWR
  const { data: metrics, isLoading: metricsLoading, mutate: mutateMetrics } = useSWR(
    ["learning-metrics", timeRange],
    () => fetchLearningMetrics(timeRange),
    { refreshInterval: 60000 }
  )

  const { data: intents, isLoading: intentsLoading } = useSWR(
    "intent-patterns",
    fetchIntentPatterns,
    { refreshInterval: 60000 }
  )

  const { data: gaps, isLoading: gapsLoading } = useSWR(
    "knowledge-gaps",
    fetchKnowledgeGaps,
    { refreshInterval: 60000 }
  )

  const { data: conversations, isLoading: conversationsLoading } = useSWR(
    "support-conversations",
    fetchConversations,
    { refreshInterval: 30000 }
  )

  const handleRefresh = () => {
    mutateMetrics()
  }

  const isLoading = metricsLoading || intentsLoading || gapsLoading

  return (
    <div className="flex-1 p-6 space-y-6 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary via-primary/90 to-accent/80 flex items-center justify-center shadow-lg shadow-primary/25">
              <Bot className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Chatbot Learning Analytics
              </h1>
              <p className="text-sm text-muted-foreground">
                AI performance and continuous learning insights
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px] glass-morphism">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isLoading}
            className="glass-morphism bg-transparent"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          <Button variant="outline" size="icon" className="glass-morphism bg-transparent">
            <Filter className="h-4 w-4" />
          </Button>
          <Button className="enterprise-button">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card className="dashboard-metric-card">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Response Accuracy</p>
                  <p className="dashboard-metric-value">92.4%</p>
                  <div className="flex items-center gap-1">
                    <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm font-medium text-emerald-500">
                      {metrics?.periodComparison.customerSatisfaction.toFixed(1) || "2.8"}%
                    </span>
                    <span className="text-xs text-muted-foreground">vs last period</span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="dashboard-metric-card">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
                  <p className="dashboard-metric-value">
                    {metrics?.avgResolutionTime.toFixed(1) || "1.8"}s
                  </p>
                  <div className="flex items-center gap-1">
                    <ArrowDownRight className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm font-medium text-emerald-500">12.3%</span>
                    <span className="text-xs text-muted-foreground">faster</span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center shadow-lg">
                  <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="dashboard-metric-card">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Conversations</p>
                  <p className="dashboard-metric-value">
                    {metrics?.activeConversations.toLocaleString() || "1,247"}
                  </p>
                  <div className="flex items-center gap-1">
                    <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm font-medium text-emerald-500">
                      {metrics?.periodComparison.activeConversations.toFixed(1) || "8.5"}%
                    </span>
                    <span className="text-xs text-muted-foreground">growth</span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center shadow-lg">
                  <MessageCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="dashboard-metric-card">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Learning Rate</p>
                  <p className="dashboard-metric-value">
                    +{metrics?.knowledgeBaseGrowth || "342"}
                  </p>
                  <div className="flex items-center gap-1">
                    <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm font-medium text-emerald-500">
                      {metrics?.periodComparison.knowledgeBaseGrowth.toFixed(1) || "28.4"}%
                    </span>
                    <span className="text-xs text-muted-foreground">new patterns</span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/20 flex items-center justify-center shadow-lg">
                  <Brain className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="glass-morphism p-1">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="performance"
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Performance
          </TabsTrigger>
          <TabsTrigger
            value="learning"
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Learning Insights
          </TabsTrigger>
          <TabsTrigger
            value="intents"
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Intent Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Activity className="h-5 w-5 text-primary" />
                  Performance Trends
                </CardTitle>
                <CardDescription>Weekly performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceTrendData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="accuracy"
                        stroke="hsl(var(--chart-1))"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        name="Accuracy"
                      />
                      <Line
                        type="monotone"
                        dataKey="satisfaction"
                        stroke="hsl(var(--chart-2))"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        name="Satisfaction"
                      />
                      <Line
                        type="monotone"
                        dataKey="resolution"
                        stroke="hsl(var(--chart-3))"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        name="Resolution"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Conversation Volume
                </CardTitle>
                <CardDescription>24-hour conversation activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={volumeTrendData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                      <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="conversations"
                        stackId="1"
                        stroke="hsl(var(--chart-1))"
                        fill="hsl(var(--chart-1))"
                        fillOpacity={0.6}
                        name="Total"
                      />
                      <Area
                        type="monotone"
                        dataKey="resolved"
                        stackId="2"
                        stroke="hsl(var(--chart-2))"
                        fill="hsl(var(--chart-2))"
                        fillOpacity={0.6}
                        name="Resolved"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="enterprise-card border-primary/30 dark:border-primary/40 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center shadow-lg shadow-primary/10">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg text-foreground">AI Learning Status</CardTitle>
                  <CardDescription>
                    Continuous improvement through conversation analysis
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-background/50 border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-5 w-5 text-emerald-500" />
                    <span className="font-semibold text-foreground">Intent Classification</span>
                  </div>
                  <Progress value={92} className="h-2 mb-2" />
                  <p className="text-sm text-muted-foreground">92% accuracy across 47 intents</p>
                </div>
                <div className="p-4 rounded-lg bg-background/50 border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-5 w-5 text-blue-500" />
                    <span className="font-semibold text-foreground">Knowledge Base</span>
                  </div>
                  <Progress value={78} className="h-2 mb-2" />
                  <p className="text-sm text-muted-foreground">1,247 articles, 78% coverage</p>
                </div>
                <div className="p-4 rounded-lg bg-background/50 border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-5 w-5 text-purple-500" />
                    <span className="font-semibold text-foreground">Response Quality</span>
                  </div>
                  <Progress value={88} className="h-2 mb-2" />
                  <p className="text-sm text-muted-foreground">88% helpful rating from users</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle className="text-base text-foreground">Resolution Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">First Response Time</span>
                  <span className="font-semibold text-foreground">1.2s</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Avg Resolution Time</span>
                  <span className="font-semibold text-foreground">2.4 min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Auto-Resolution Rate</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">87.3%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Handoff Rate</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">12.7%</span>
                </div>
              </CardContent>
            </Card>

            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle className="text-base text-foreground">Quality Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Response Accuracy</span>
                  <span className="font-semibold text-foreground">92.4%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Customer Satisfaction</span>
                  <span className="font-semibold text-foreground">94.2%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Helpful Rating</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">88.7%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Confidence Score</span>
                  <span className="font-semibold text-foreground">89.7%</span>
                </div>
              </CardContent>
            </Card>

            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle className="text-base text-foreground">Volume Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Conversations</span>
                  <span className="font-semibold text-foreground">
                    {conversations?.length.toLocaleString() || "1,247"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Peak Hour Volume</span>
                  <span className="font-semibold text-foreground">92/hr</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Unique Users</span>
                  <span className="font-semibold text-foreground">847</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Returning Users</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">34.2%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="learning" className="space-y-6">
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Brain className="h-5 w-5 text-primary" />
                Knowledge Gaps Identified
              </CardTitle>
              <CardDescription>
                Topics requiring additional training data for improved accuracy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {gapsLoading ? (
                  <div className="h-40 flex items-center justify-center">
                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : gaps && gaps.length > 0 ? (
                  gaps.map((gap) => (
                    <div
                      key={gap.id}
                      className="p-4 rounded-lg border border-border/50 bg-gradient-to-r from-muted/20 to-transparent hover:from-muted/40 transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3 flex-1">
                          <div>
                            <p className="font-semibold text-foreground">{gap.topic}</p>
                            <p className="text-sm text-muted-foreground">
                              {gap.query_count} queries • {(gap.avg_confidence * 100).toFixed(0)}% avg
                              confidence
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={
                              gap.priority === "high"
                                ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                                : gap.priority === "medium"
                                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                  : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                            }
                          >
                            {gap.priority} priority
                          </Badge>
                          <Button size="sm" className="enterprise-button">
                            <Zap className="h-3 w-3 mr-1" />
                            Train
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              gap.avg_confidence >= 0.8
                                ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                                : gap.avg_confidence >= 0.7
                                  ? "bg-gradient-to-r from-amber-500 to-amber-600"
                                  : "bg-gradient-to-r from-red-500 to-red-600"
                            }`}
                            style={{ width: `${gap.avg_confidence * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-40 flex flex-col items-center justify-center text-muted-foreground">
                    <CheckCircle2 className="h-12 w-12 mb-2 text-emerald-500" />
                    <p>No significant knowledge gaps detected</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="intents" className="space-y-6">
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Target className="h-5 w-5 text-primary" />
                Intent Classification Performance
              </CardTitle>
              <CardDescription>
                Most common customer intents and their accuracy metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {intentsLoading ? (
                  <div className="h-40 flex items-center justify-center">
                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : intents && intents.length > 0 ? (
                  intents.map((intent, index) => (
                    <div
                      key={intent.id}
                      className="p-4 rounded-lg border border-border/50 bg-gradient-to-r from-muted/20 to-transparent hover:from-muted/40 transition-all"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{intent.intent_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {intent.occurrence_count} occurrences
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            intent.confidence_score >= 0.9
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                          }
                        >
                          {(intent.confidence_score * 100).toFixed(0)}% confidence
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Avg time:{" "}
                            <span className="font-medium text-foreground">
                              {(intent.avg_resolution_time / 60).toFixed(1)}m
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Success:{" "}
                            <span className="font-medium text-foreground">{intent.success_rate}%</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-40 flex flex-col items-center justify-center text-muted-foreground">
                    <AlertCircle className="h-12 w-12 mb-2" />
                    <p>No intent data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
