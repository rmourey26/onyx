"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Brain,
  MessageSquare,
  TrendingUp,
  Users,
  BookOpen,
  Zap,
  Target,
  Activity,
  BarChart3,
  PieChart,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Lightbulb,
  Database,
  Filter,
  Download,
  RefreshCw,
  Settings,
  Sparkles,
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

interface LearningMetric {
  label: string
  value: string
  change: number
  trend: "up" | "down"
  icon: any
  color: string
}

interface IntentPattern {
  intent: string
  confidence: number
  occurrences: number
  avgResolutionTime: string
  successRate: number
}

interface KnowledgeGap {
  topic: string
  queries: number
  avgConfidence: number
  priority: "high" | "medium" | "low"
}

const learningMetrics: LearningMetric[] = [
  {
    label: "Active Conversations",
    value: "1,247",
    change: 12.5,
    trend: "up",
    icon: MessageSquare,
    color: "from-blue-500/20 to-blue-600/20",
  },
  {
    label: "Avg Resolution Time",
    value: "2.4 min",
    change: -15.3,
    trend: "up",
    icon: Clock,
    color: "from-emerald-500/20 to-emerald-600/20",
  },
  {
    label: "Customer Satisfaction",
    value: "94.2%",
    change: 5.8,
    trend: "up",
    icon: CheckCircle2,
    color: "from-purple-500/20 to-purple-600/20",
  },
  {
    label: "Knowledge Base Growth",
    value: "+342",
    change: 28.4,
    trend: "up",
    icon: BookOpen,
    color: "from-amber-500/20 to-amber-600/20",
  },
]

const intentPatterns: IntentPattern[] = [
  {
    intent: "Account Setup",
    confidence: 0.94,
    occurrences: 342,
    avgResolutionTime: "1.8 min",
    successRate: 96.5,
  },
  {
    intent: "Billing Inquiry",
    confidence: 0.89,
    occurrences: 278,
    avgResolutionTime: "3.2 min",
    successRate: 91.2,
  },
  {
    intent: "Technical Support",
    confidence: 0.92,
    occurrences: 456,
    avgResolutionTime: "4.5 min",
    successRate: 88.7,
  },
  {
    intent: "Feature Request",
    confidence: 0.87,
    occurrences: 189,
    avgResolutionTime: "2.1 min",
    successRate: 93.8,
  },
  {
    intent: "Integration Help",
    confidence: 0.91,
    occurrences: 234,
    avgResolutionTime: "5.3 min",
    successRate: 85.4,
  },
]

const knowledgeGaps: KnowledgeGap[] = [
  { topic: "API Authentication", queries: 67, avgConfidence: 0.68, priority: "high" },
  { topic: "Webhook Configuration", queries: 45, avgConfidence: 0.72, priority: "high" },
  { topic: "Custom Domain Setup", queries: 34, avgConfidence: 0.78, priority: "medium" },
  { topic: "Rate Limiting", queries: 28, avgConfidence: 0.81, priority: "medium" },
  { topic: "Data Export", queries: 19, avgConfidence: 0.85, priority: "low" },
]

export function SupportLearningDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [timeRange, setTimeRange] = useState("7d")

  return (
    <div className="flex-1 p-6 space-y-6 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary via-primary/90 to-accent/80 flex items-center justify-center shadow-lg shadow-primary/25">
              <Brain className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Support Learning Layer
              </h1>
              <p className="text-sm text-muted-foreground">
                AI-Powered Customer Support Intelligence
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
          <Button variant="outline" size="icon" className="glass-morphism bg-transparent">
            <RefreshCw className="h-4 w-4" />
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
        {learningMetrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="dashboard-metric-card">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                    <p className="dashboard-metric-value">{metric.value}</p>
                    <div className="flex items-center gap-1">
                      {metric.trend === "up" ? (
                        <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-500" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          metric.trend === "up" ? "text-emerald-500" : "text-red-500"
                        }`}
                      >
                        {Math.abs(metric.change)}%
                      </span>
                      <span className="text-xs text-muted-foreground">vs last period</span>
                    </div>
                  </div>
                  <div
                    className={`h-12 w-12 rounded-xl bg-gradient-to-br ${metric.color} flex items-center justify-center shadow-lg`}
                  >
                    <metric.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
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
            value="intents"
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Intent Analysis
          </TabsTrigger>
          <TabsTrigger
            value="knowledge"
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Knowledge Gaps
          </TabsTrigger>
          <TabsTrigger
            value="performance"
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Activity className="h-5 w-5 text-primary" />
                  Learning Activity
                </CardTitle>
                <CardDescription>
                  Real-time insights from customer interactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-transparent border border-blue-500/20">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">New Conversations</p>
                        <p className="text-sm text-muted-foreground">Last hour</p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-foreground">73</p>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/20">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <Lightbulb className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Patterns Identified</p>
                        <p className="text-sm text-muted-foreground">Today</p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-foreground">28</p>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-transparent border border-purple-500/20">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <Database className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">KB Articles Added</p>
                        <p className="text-sm text-muted-foreground">This week</p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-foreground">12</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Target className="h-5 w-5 text-primary" />
                  Learning Goals
                </CardTitle>
                <CardDescription>Current training objectives and progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">
                        Intent Classification Accuracy
                      </span>
                      <span className="text-sm font-bold text-primary">92%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-accent w-[92%] rounded-full" />
                    </div>
                    <p className="text-xs text-muted-foreground">Target: 95%</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">
                        Response Quality Score
                      </span>
                      <span className="text-sm font-bold text-emerald-500">88%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 w-[88%] rounded-full" />
                    </div>
                    <p className="text-xs text-muted-foreground">Target: 90%</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">
                        Knowledge Coverage
                      </span>
                      <span className="text-sm font-bold text-blue-500">76%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 w-[76%] rounded-full" />
                    </div>
                    <p className="text-xs text-muted-foreground">Target: 85%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="enterprise-card border-amber-500/30 dark:border-amber-500/40 bg-gradient-to-br from-amber-500/5 to-transparent">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center shadow-lg shadow-amber-500/10">
                  <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <CardTitle className="text-lg text-foreground">AI Learning Insights</CardTitle>
                  <CardDescription>
                    Automated improvements from conversation analysis
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/50">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      New FAQ pattern detected
                    </p>
                    <p className="text-sm text-muted-foreground">
                      28 similar questions about webhook retries identified. Auto-generated KB article draft available.
                    </p>
                  </div>
                  <Button size="sm" variant="outline" className="bg-transparent">
                    Review
                  </Button>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/50">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      Intent classification improved
                    </p>
                    <p className="text-sm text-muted-foreground">
                      "Account Security" intent now 94% accurate after processing 156 labeled conversations.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/50">
                  <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      Low confidence area identified
                    </p>
                    <p className="text-sm text-muted-foreground">
                      "API versioning" queries have 68% avg confidence. Additional training data recommended.
                    </p>
                  </div>
                  <Button size="sm" variant="outline" className="bg-transparent">
                    Train
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="intents" className="space-y-6">
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <BarChart3 className="h-5 w-5 text-primary" />
                Top Intent Patterns
              </CardTitle>
              <CardDescription>
                Most common customer intents and their performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {intentPatterns.map((intent, index) => (
                  <div
                    key={intent.intent}
                    className="p-4 rounded-lg border border-border/50 bg-gradient-to-r from-muted/20 to-transparent hover:from-muted/40 transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{intent.intent}</p>
                          <p className="text-sm text-muted-foreground">
                            {intent.occurrences} occurrences
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          intent.confidence >= 0.9
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                        }
                      >
                        {(intent.confidence * 100).toFixed(0)}% confidence
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Avg time: <span className="font-medium text-foreground">{intent.avgResolutionTime}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Success: <span className="font-medium text-foreground">{intent.successRate}%</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-6">
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Lightbulb className="h-5 w-5 text-primary" />
                Knowledge Gaps
              </CardTitle>
              <CardDescription>
                Topics with low confidence requiring additional training
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {knowledgeGaps.map((gap) => (
                  <div
                    key={gap.topic}
                    className="p-4 rounded-lg border border-border/50 bg-gradient-to-r from-muted/20 to-transparent hover:from-muted/40 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3 flex-1">
                        <div>
                          <p className="font-semibold text-foreground">{gap.topic}</p>
                          <p className="text-sm text-muted-foreground">
                            {gap.queries} queries • {(gap.avgConfidence * 100).toFixed(0)}% avg confidence
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
                            gap.avgConfidence >= 0.8
                              ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                              : gap.avgConfidence >= 0.7
                                ? "bg-gradient-to-r from-amber-500 to-amber-600"
                                : "bg-gradient-to-r from-red-500 to-red-600"
                          }`}
                          style={{ width: `${gap.avgConfidence * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Chatbot Performance
                </CardTitle>
                <CardDescription>Key performance indicators over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">Resolution Rate</span>
                      <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                        87.3%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      +3.2% from last week
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-transparent border border-blue-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">Avg Confidence</span>
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        89.7%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      +1.8% from last week
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-transparent border border-purple-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">
                        Human Handoff Rate
                      </span>
                      <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                        12.7%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      -2.1% from last week
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <PieChart className="h-5 w-5 text-primary" />
                  Learning Distribution
                </CardTitle>
                <CardDescription>Sources of learning data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Resolved Conversations
                      </span>
                      <span className="text-sm font-medium text-foreground">65%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 w-[65%] rounded-full" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Knowledge Base
                      </span>
                      <span className="text-sm font-medium text-foreground">25%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 w-[25%] rounded-full" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Manual Training
                      </span>
                      <span className="text-sm font-medium text-foreground">10%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-purple-600 w-[10%] rounded-full" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
