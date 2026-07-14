"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Calculator,
  TrendingUp,
  DollarSign,
  BarChart3,
  PieChart,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Building2,
  Users,
  Clock,
  Shield,
  Layers,
  Zap,
  CheckCircle2,
  ArrowUpRight,
  Globe,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const calculatorFeatures = [
  {
    icon: Building2,
    title: "Multi-Vendor Comparison",
    description: "Compare ROI across 50+ AI/automation platforms side-by-side with neutral, unbiased analysis",
  },
  {
    icon: PieChart,
    title: "Industry-Specific Models",
    description: "Pre-built calculators for 15+ industries with actual benchmark data from real deployments",
  },
  {
    icon: TrendingUp,
    title: "Live Data Integration",
    description: "Real-time pricing from vendor APIs, market salary data, and cloud cost calculators",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Recommendations",
    description: "ML-based product matching, predictive ROI modeling, and risk assessment algorithms",
  },
  {
    icon: Layers,
    title: "White-Label Solutions",
    description: "SDK for embedding in vendor websites with customizable branding and calculation logic",
  },
  {
    icon: Zap,
    title: "CRM Integrations",
    description: "Webhook integrations for Salesforce, HubSpot, and other major CRM systems",
  },
]

const marketStats = [
  { label: "Business Intelligence Market", value: "$33.3B", subtext: "Projected by 2025" },
  { label: "AI-Powered Tools CAGR", value: "25-30%", subtext: "Annual growth rate" },
  { label: "B2B SaaS Improvement", value: "30-40%", subtext: "Bottom line impact" },
  { label: "AI Adoption Growth", value: "42%", subtext: "Year-over-year 2024-2025" },
]

const comparisonData = [
  { feature: "Products Covered", current: "1 (Resend-It)", platform: "50+ (multi-vendor)" },
  { feature: "Customization", current: "Fixed inputs", platform: "Dynamic input builder" },
  { feature: "Data Sources", current: "Hardcoded", platform: "API-driven, live data" },
  { feature: "Industry Models", current: "7 industries", platform: "15+ with deep benchmarks" },
  { feature: "Export Options", current: "None", platform: "PDF, Excel, API" },
  { feature: "White-Label", current: "No", platform: "Yes (enterprise tier)" },
  { feature: "API Access", current: "No", platform: "RESTful API + webhooks" },
]

export function ROIAnalyticsClient() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="flex-1 p-6 space-y-6 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary via-primary/90 to-accent/80 flex items-center justify-center shadow-lg shadow-primary/25">
              <Calculator className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">ROI Analytics</h1>
              <p className="text-sm text-muted-foreground">AI Investment Intelligence Platform</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
            <Clock className="h-3 w-3 mr-1" />
            Platform Coming Soon
          </Badge>
          <Button asChild className="enterprise-button">
            <a href="https://roi.kronova.io" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Try Standalone Calculator
            </a>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="glass-morphism p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Overview
          </TabsTrigger>
          <TabsTrigger value="features" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Features
          </TabsTrigger>
          <TabsTrigger value="comparison" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Comparison
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card className="enterprise-card border-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent overflow-hidden">
            <CardContent className="p-8">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <div>
                    <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Independent AI Investment Intelligence
                    </Badge>
                    <h2 className="text-3xl font-bold tracking-tight mb-3 text-foreground">
                      Transform Buying Decisions with Data-Driven ROI Analysis
                    </h2>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      Our AI ROI Calculator provides unbiased, data-driven ROI comparisons across multiple AI/automation
                      vendors, powered by real market data and industry benchmarks.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button size="lg" asChild className="enterprise-button">
                      <a href="https://roi.kronova.io" target="_blank" rel="noopener noreferrer">
                        Launch Calculator
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </a>
                    </Button>
                    <Button size="lg" variant="outline" className="hover:bg-accent/50 transition-all bg-transparent">
                      <Globe className="h-4 w-4 mr-2" />
                      View Documentation
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {marketStats.map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="dashboard-metric-card">
                        <CardContent className="p-4">
                          <p className="dashboard-metric-value text-2xl">{stat.value}</p>
                          <p className="dashboard-metric-label text-sm mt-1">{stat.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{stat.subtext}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-4">
            <Card className="enterprise-card bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20 dark:border-emerald-500/30">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/10">
                  <Shield className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="font-semibold mb-2 text-foreground">Vendor Neutral</h3>
                <p className="text-sm text-muted-foreground">
                  Unbiased analysis across 50+ AI platforms without vendor lock-in or promotional bias
                </p>
              </CardContent>
            </Card>
            <Card className="enterprise-card bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20 dark:border-blue-500/30">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/10">
                  <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold mb-2 text-foreground">Cost Justification</h3>
                <p className="text-sm text-muted-foreground">
                  Data-driven business cases that satisfy CFO requirements and financial stakeholders
                </p>
              </CardContent>
            </Card>
            <Card className="enterprise-card bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20 dark:border-purple-500/30">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4 shadow-lg shadow-purple-500/10">
                  <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold mb-2 text-foreground">Enterprise Ready</h3>
                <p className="text-sm text-muted-foreground">
                  White-label solutions, API access, and CRM integrations for enterprise deployments
                </p>
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
                  <CardTitle className="text-lg text-foreground">Platform Version Coming Soon</CardTitle>
                  <CardDescription>Enhanced ROI Analytics integrated directly into AI Business Suite</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                We are building a fully integrated ROI Analytics platform within the AI Business Suite. The platform
                version will include team collaboration, saved calculations, historical comparisons, and seamless
                integration with your existing asset intelligence data.
              </p>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="text-foreground">Try our standalone calculator at</span>
                <a
                  href="https://roi.kronova.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1 font-medium"
                >
                  roi.kronova.io
                  <ArrowUpRight className="h-3 w-3" />
                </a>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {calculatorFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="enterprise-card h-full">
                  <CardContent className="p-6">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4 shadow-lg shadow-primary/10">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2 text-foreground">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Building2 className="h-5 w-5 text-primary" />
                Target Market Segments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Primary</h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 dark:bg-muted/20 border border-border/50">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">Enterprise Technology Buyers</p>
                        <p className="text-sm text-muted-foreground">CIOs, CTOs evaluating AI/automation platforms</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 dark:bg-muted/20 border border-border/50">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">Management Consultants</p>
                        <p className="text-sm text-muted-foreground">Client proposals and business case development</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 dark:bg-muted/20 border border-border/50">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">Software Vendors</p>
                        <p className="text-sm text-muted-foreground">
                          White-label ROI calculators for sales enablement
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Secondary</h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 dark:bg-muted/20 border border-border/50">
                      <CheckCircle2 className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">Mid-Market Companies</p>
                        <p className="text-sm text-muted-foreground">Operations managers evaluating automation</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 dark:bg-muted/20 border border-border/50">
                      <CheckCircle2 className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">Financial Advisory Firms</p>
                        <p className="text-sm text-muted-foreground">
                          PE firms evaluating portfolio company investments
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <BarChart3 className="h-5 w-5 text-primary" />
                Current vs. Platform Version
              </CardTitle>
              <CardDescription>
                Feature comparison between the standalone calculator and the upcoming platform integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Feature</th>
                      <th className="text-left py-3 px-4 font-semibold">
                        <Badge variant="outline" className="border-border/50">
                          Current Standalone
                        </Badge>
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">
                        <Badge className="bg-primary/10 text-primary border-primary/20">Platform Version</Badge>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonData.map((row, index) => (
                      <tr key={row.feature} className={index % 2 === 0 ? "bg-muted/20 dark:bg-muted/10" : ""}>
                        <td className="py-3 px-4 font-medium text-foreground">{row.feature}</td>
                        <td className="py-3 px-4 text-muted-foreground">{row.current}</td>
                        <td className="py-3 px-4 text-primary font-medium">{row.platform}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
