"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import useSWR from "swr"
import {
  TrendingUp,
  DollarSign,
  BarChart3,
  PieChart,
  Clock,
  Building2,
  Users,
  Calculator,
  Target,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Download,
  Filter,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Gauge,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import {
  getROIAssessments,
  getROIDashboardStats,
  getROITrendData,
  getTopROIAssessments,
  getIndustryBenchmarks,
  type ROIAssessment,
  type ROIDashboardStats,
  type ROITrendData,
} from "@/app/actions/roi-dashboard-actions"
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
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

// ============================================================================
// Chart Colors
// ============================================================================

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

// ============================================================================
// Fetchers
// ============================================================================

async function fetchStats() {
  const result = await getROIDashboardStats({ isDemo: false })
  if (!result.success) throw new Error(result.error)
  return result.data
}

async function fetchAssessments() {
  const result = await getROIAssessments({ limit: 50, isDemo: false })
  if (!result.success) throw new Error(result.error)
  return result.data
}

async function fetchTrendData() {
  const result = await getROITrendData({ days: 30 })
  if (!result.success) throw new Error(result.error)
  return result.data
}

async function fetchTopAssessments() {
  const result = await getTopROIAssessments(5)
  if (!result.success) throw new Error(result.error)
  return result.data
}

async function fetchBenchmarks() {
  const result = await getIndustryBenchmarks()
  if (!result.success) throw new Error(result.error)
  return result.data
}

// ============================================================================
// Helper Functions
// ============================================================================

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`
  }
  return `$${value.toFixed(0)}`
}

function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-600 dark:text-emerald-400"
  if (score >= 60) return "text-amber-600 dark:text-amber-400"
  return "text-red-600 dark:text-red-400"
}

function getRiskColor(risk: number): string {
  if (risk <= 30) return "text-emerald-600 dark:text-emerald-400"
  if (risk <= 60) return "text-amber-600 dark:text-amber-400"
  return "text-red-600 dark:text-red-400"
}

// ============================================================================
// Main Component
// ============================================================================

export function ROIDataDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedIndustry, setSelectedIndustry] = useState<string>("all")
  const [selectedSize, setSelectedSize] = useState<string>("all")

  // SWR hooks for data fetching
  const { data: stats, isLoading: statsLoading, mutate: mutateStats } = useSWR<ROIDashboardStats | null>(
    "roi-stats",
    fetchStats,
    { refreshInterval: 60000 }
  )

  const { data: assessments, isLoading: assessmentsLoading, mutate: mutateAssessments } = useSWR<ROIAssessment[]>(
    "roi-assessments",
    fetchAssessments,
    { refreshInterval: 60000 }
  )

  const { data: trendData, isLoading: trendLoading } = useSWR<ROITrendData[]>(
    "roi-trend",
    fetchTrendData,
    { refreshInterval: 300000 }
  )

  const { data: topAssessments, isLoading: topLoading } = useSWR<ROIAssessment[]>(
    "roi-top",
    fetchTopAssessments,
    { refreshInterval: 60000 }
  )

  const { data: benchmarks, isLoading: benchmarksLoading } = useSWR(
    "roi-benchmarks",
    fetchBenchmarks,
    { refreshInterval: 300000 }
  )

  // Filter assessments
  const filteredAssessments = assessments?.filter(a => {
    if (selectedIndustry !== "all" && a.industry !== selectedIndustry) return false
    if (selectedSize !== "all" && a.company_size !== selectedSize) return false
    return true
  }) || []

  // Get unique industries and sizes from data
  const industries = [...new Set(assessments?.map(a => a.industry) || [])]
  const companySizes = [...new Set(assessments?.map(a => a.company_size) || [])]

  // Convert stats to pie chart data
  const industryPieData = stats?.byIndustry
    ? Object.entries(stats.byIndustry).map(([name, value]) => ({ name, value }))
    : []

  const sizePieData = stats?.byCompanySize
    ? Object.entries(stats.byCompanySize).map(([name, value]) => ({ name, value }))
    : []

  // Benchmarks bar chart data
  const benchmarkBarData = benchmarks
    ? Object.entries(benchmarks).map(([industry, data]) => ({
        industry: industry.slice(0, 12),
        avgROI: data.avgROI,
        avgSavings: data.avgSavings / 1000,
        count: data.count,
      }))
    : []

  const handleRefresh = () => {
    mutateStats()
    mutateAssessments()
  }

  const isLoading = statsLoading || assessmentsLoading

  return (
    <div className="flex-1 p-6 space-y-6 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <Calculator className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">ROI Assessment Dashboard</h1>
              <p className="text-sm text-muted-foreground">Analytics from org_roi_baseline_data</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {stats?.totalAssessments || 0} Assessments
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="bg-transparent"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Export
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Export as CSV</DropdownMenuItem>
              <DropdownMenuItem>Export as Excel</DropdownMenuItem>
              <DropdownMenuItem>Generate PDF Report</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <Card className="dashboard-metric-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <DollarSign className="h-5 w-5 text-emerald-500" />
                <Badge variant="secondary" className="text-xs">Annual</Badge>
              </div>
              <p className="dashboard-metric-value text-xl mt-2">
                {formatCurrency(stats?.totalAnnualSavings || 0)}
              </p>
              <p className="dashboard-metric-label text-xs mt-1">Total Savings</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="dashboard-metric-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                <ArrowUpRight className="h-4 w-4 text-emerald-500" />
              </div>
              <p className="dashboard-metric-value text-xl mt-2">
                {formatPercentage(stats?.avgROIPercentage || 0)}
              </p>
              <p className="dashboard-metric-label text-xs mt-1">Avg ROI</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="dashboard-metric-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Clock className="h-5 w-5 text-amber-500" />
                <Badge variant="secondary" className="text-xs">Months</Badge>
              </div>
              <p className="dashboard-metric-value text-xl mt-2">
                {(stats?.avgPaybackMonths || 0).toFixed(1)}
              </p>
              <p className="dashboard-metric-label text-xs mt-1">Avg Payback</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="dashboard-metric-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Target className="h-5 w-5 text-purple-500" />
                <Badge variant="secondary" className="text-xs">5-Year</Badge>
              </div>
              <p className="dashboard-metric-value text-xl mt-2">
                {formatCurrency(stats?.totalFiveYearValue || 0)}
              </p>
              <p className="dashboard-metric-label text-xs mt-1">Total Value</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="dashboard-metric-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Gauge className="h-5 w-5 text-cyan-500" />
                <span className={`text-sm font-medium ${getScoreColor(stats?.avgReadinessScore || 0)}`}>
                  {stats?.avgReadinessScore || 0}
                </span>
              </div>
              <Progress value={stats?.avgReadinessScore || 0} className="mt-2 h-2" />
              <p className="dashboard-metric-label text-xs mt-1">Avg Readiness</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="dashboard-metric-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span className={`text-sm font-medium ${getRiskColor(stats?.avgRiskScore || 0)}`}>
                  {stats?.avgRiskScore || 0}
                </span>
              </div>
              <Progress value={stats?.avgRiskScore || 0} className="mt-2 h-2" />
              <p className="dashboard-metric-label text-xs mt-1">Avg Risk</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="glass-morphism p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Overview
          </TabsTrigger>
          <TabsTrigger value="assessments" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Assessments
          </TabsTrigger>
          <TabsTrigger value="benchmarks" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Benchmarks
          </TabsTrigger>
          <TabsTrigger value="trends" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Trends
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Top Performers */}
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                  Top ROI Performers
                </CardTitle>
                <CardDescription>Assessments with highest ROI percentage</CardDescription>
              </CardHeader>
              <CardContent>
                {topLoading ? (
                  <div className="h-40 flex items-center justify-center">
                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {topAssessments?.slice(0, 5).map((assessment, index) => (
                      <div
                        key={assessment.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {assessment.company_name || assessment.assessment_reference}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {assessment.industry} | {assessment.company_size}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {formatPercentage(assessment.roi_percentage)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(assessment.annual_savings)}/yr
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Industry Distribution */}
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <PieChart className="h-5 w-5 text-blue-500" />
                  Industry Distribution
                </CardTitle>
                <CardDescription>Assessments by industry sector</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={industryPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {industryPieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Company Size Distribution */}
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Building2 className="h-5 w-5 text-purple-500" />
                Distribution by Company Size
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sizePieData.map(d => ({ name: d.name, value: d.value }))}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assessments Tab */}
        <TabsContent value="assessments" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filters:</span>
            </div>
            <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Industries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                {industries.map(industry => (
                  <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedSize} onValueChange={setSelectedSize}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Sizes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sizes</SelectItem>
                {companySizes.map(size => (
                  <SelectItem key={size} value={size}>{size}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="outline" className="ml-auto">
              {filteredAssessments.length} results
            </Badge>
          </div>

          {/* Assessments Table */}
          <Card className="enterprise-card">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead className="text-right">Annual Savings</TableHead>
                    <TableHead className="text-right">ROI %</TableHead>
                    <TableHead className="text-right">Payback</TableHead>
                    <TableHead className="text-right">Readiness</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssessments.map(assessment => (
                    <TableRow key={assessment.id}>
                      <TableCell className="font-mono text-sm">
                        {assessment.assessment_reference.slice(0, 12)}...
                      </TableCell>
                      <TableCell>{assessment.company_name || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{assessment.industry}</Badge>
                      </TableCell>
                      <TableCell>{assessment.company_size}</TableCell>
                      <TableCell className="text-right font-medium text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(assessment.annual_savings)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatPercentage(assessment.roi_percentage)}
                      </TableCell>
                      <TableCell className="text-right">
                        {assessment.payback_months.toFixed(1)} mo
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={getScoreColor(assessment.ai_maturity_score)}>
                          {assessment.ai_maturity_score}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Benchmarks Tab */}
        <TabsContent value="benchmarks" className="space-y-6">
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <BarChart3 className="h-5 w-5 text-cyan-500" />
                Industry Benchmarks
              </CardTitle>
              <CardDescription>Average ROI and savings by industry</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={benchmarkBarData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis dataKey="industry" type="category" tick={{ fontSize: 11 }} width={100} />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        name === "avgROI" ? `${value}%` : `$${value}K`,
                        name === "avgROI" ? "Avg ROI" : "Avg Savings",
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="avgROI" name="Avg ROI %" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="avgSavings" name="Avg Savings ($K)" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Benchmark Details */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {benchmarks && Object.entries(benchmarks).map(([industry, data]) => (
              <Card key={industry} className="enterprise-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-foreground">{industry}</h4>
                    <Badge variant="secondary">{data.count} assessments</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Avg ROI</span>
                      <span className="font-medium text-foreground">{data.avgROI}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Avg Payback</span>
                      <span className="font-medium text-foreground">{data.avgPayback} months</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Avg Savings</span>
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(data.avgSavings)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
                ROI Trend Over Time
              </CardTitle>
              <CardDescription>Assessment submissions and average ROI (last 30 days)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {trendLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData || []}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      />
                      <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                      <Tooltip
                        labelFormatter={(label) => new Date(label).toLocaleDateString()}
                        formatter={(value: number, name: string) => [
                          name === "avgROI" ? `${value}%` : value,
                          name === "avgROI" ? "Avg ROI" : "Assessments",
                        ]}
                      />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="assessments"
                        name="Assessments"
                        stroke="hsl(var(--chart-1))"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="avgROI"
                        name="Avg ROI"
                        stroke="hsl(var(--chart-2))"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <DollarSign className="h-5 w-5 text-emerald-500" />
                Cumulative Savings Trend
              </CardTitle>
              <CardDescription>Total potential savings identified over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData || []}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                    />
                    <Tooltip
                      labelFormatter={(label) => new Date(label).toLocaleDateString()}
                      formatter={(value: number) => [formatCurrency(value), "Savings"]}
                    />
                    <Bar dataKey="totalSavings" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
