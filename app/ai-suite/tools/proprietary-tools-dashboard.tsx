"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Wrench,
  TrendingUp,
  Mic,
  Shield,
  Layers,
  Link2,
  Bot,
  Workflow,
  Radio,
  Accessibility,
  Cpu,
  GitBranch,
  Server,
  Database,
  Cloud,
  Boxes,
} from "lucide-react"

const TOOL_CATEGORIES = [
  {
    name: "Asset Intelligence & Operational Efficiency",
    icon: TrendingUp,
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-900/20",
    tools: [
      {
        name: "Predictive Maintenance",
        description: "AI-powered predictive maintenance using sensor data, historical patterns, and machine learning",
        roi: "$2.8M-$5.8M savings",
        capabilities: ["Failure prediction", "Maintenance scheduling", "Downtime optimization"],
      },
      {
        name: "Asset Utilization Optimizer",
        description: "Maximize asset ROI through intelligent utilization analysis and recommendations",
        roi: "$3.5M-$6.2M savings",
        capabilities: ["Usage analytics", "Optimization recommendations", "Resource allocation"],
      },
      {
        name: "Voice Data Entry",
        description: "Hands-free asset management with voice commands and ElevenLabs integration",
        roi: "$1.8M-$3.2M savings",
        capabilities: ["Speech-to-text", "Multi-language support", "Context awareness"],
      },
      {
        name: "Compliance Monitoring",
        description: "Automated regulatory compliance tracking and reporting",
        roi: "$4.2M-$8.5M savings",
        capabilities: ["Real-time monitoring", "Automated alerts", "Audit trails"],
      },
    ],
  },
  {
    name: "Blockchain & Tokenization",
    icon: Layers,
    color: "text-purple-600",
    bgColor: "bg-purple-100 dark:bg-purple-900/20",
    tools: [
      {
        name: "Asset Tokenization Engine",
        description: "Convert physical assets into digital tokens on Canton Network and Sui blockchain",
        roi: "$5.5M-$12M value unlock",
        capabilities: ["Move smart contracts", "Canton DAML integration", "Fractional ownership"],
      },
      {
        name: "Provenance Verification",
        description: "Blockchain-based asset history and authenticity verification",
        roi: "$2.2M-$4.5M savings",
        capabilities: ["Immutable records", "Chain of custody", "Fraud prevention"],
      },
    ],
  },
  {
    name: "API Infrastructure & Integration",
    icon: Link2,
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-900/20",
    tools: [
      {
        name: "Financial Integration Tool",
        description: "Connect to ERP systems, accounting platforms, and payment gateways",
        roi: "$1.5M-$2.8M savings",
        capabilities: ["Multi-platform support", "Real-time sync", "Automated reconciliation"],
      },
    ],
  },
  {
    name: "AI Agent & Workflow Automation",
    icon: Bot,
    color: "text-orange-600",
    bgColor: "bg-orange-100 dark:bg-orange-900/20",
    tools: [
      {
        name: "AI Agent Deployment",
        description: "Deploy and manage autonomous AI agents for complex business processes",
        roi: "$6.8M-$15M automation value",
        capabilities: ["Multi-model support", "Tool integration", "Context management"],
      },
      {
        name: "Workflow Automation Builder",
        description: "Visual workflow designer with AI-powered optimization",
        roi: "$4.5M-$8.2M savings",
        capabilities: ["Drag-and-drop builder", "Conditional logic", "Error handling"],
      },
      {
        name: "AetherNet P2P Communication",
        description: "Secure peer-to-peer communication for distributed AI agents",
        roi: "$1.2M-$2.5M savings",
        capabilities: ["End-to-end encryption", "Mesh networking", "Low latency"],
      },
    ],
  },
  {
    name: "Voice & Accessibility",
    icon: Mic,
    color: "text-pink-600",
    bgColor: "bg-pink-100 dark:bg-pink-900/20",
    tools: [
      {
        name: "Voice Agent Interface",
        description: "Natural language voice control powered by ElevenLabs",
        roi: "$2.8M-$5.5M productivity gain",
        capabilities: ["Real-time transcription", "Intent recognition", "Voice synthesis"],
      },
      {
        name: "Accessibility Compliance Scanner",
        description: "Automated WCAG and ADA compliance checking",
        roi: "$800K-$1.5M risk mitigation",
        capabilities: ["WCAG 2.1 validation", "Screen reader testing", "Remediation guidance"],
      },
    ],
  },
  {
    name: "IoT & Device Coordination",
    icon: Radio,
    color: "text-cyan-600",
    bgColor: "bg-cyan-100 dark:bg-cyan-900/20",
    tools: [
      {
        name: "IoT Device Coordination",
        description: "Manage and orchestrate IoT sensor networks at scale",
        roi: "$3.2M-$6.8M efficiency gain",
        capabilities: ["Real-time monitoring", "Edge processing", "Fleet management"],
      },
      {
        name: "Autonomous System Protocol",
        description: "Enable autonomous decision-making for connected systems",
        roi: "$4.5M-$9.2M automation value",
        capabilities: ["Self-healing", "Adaptive optimization", "Distributed consensus"],
      },
    ],
  },
  {
    name: "Deployment & Infrastructure",
    icon: Server,
    color: "text-indigo-600",
    bgColor: "bg-indigo-100 dark:bg-indigo-900/20",
    tools: [
      {
        name: "On-Premise AI Deployment",
        description: "Deploy AI models on private infrastructure with full data sovereignty",
        roi: "$2.5M-$5.2M compliance value",
        capabilities: ["Air-gapped deployment", "Model optimization", "Hardware acceleration"],
      },
      {
        name: "Data Sovereignty Manager",
        description: "Ensure data residency and compliance with regional regulations",
        roi: "$1.8M-$3.5M risk mitigation",
        capabilities: ["Geo-fencing", "Encryption at rest", "Audit logging"],
      },
      {
        name: "Edge Computing Coordinator",
        description: "Distribute AI processing to edge nodes for low-latency operations",
        roi: "$3.8M-$7.2M latency reduction value",
        capabilities: ["Edge orchestration", "Workload distribution", "Offline capability"],
      },
      {
        name: "Hybrid Cloud Orchestrator",
        description: "Seamlessly orchestrate workloads across cloud and on-premise",
        roi: "$5.2M-$10.5M cost optimization",
        capabilities: ["Multi-cloud support", "Cost optimization", "Disaster recovery"],
      },
    ],
  },
]

export function ProprietaryToolsDashboard() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Wrench className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-foreground">Proprietary AI Tools</h1>
                <p className="text-sm lg:text-base text-muted-foreground mt-1">
                  18 Enterprise-Grade Tools Solving 24 Critical Business Problems
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="enterprise-card">
                <CardContent className="p-6 text-center">
                  <div className="dashboard-metric-value text-primary">18</div>
                  <div className="dashboard-metric-label mt-2">Proprietary Tools</div>
                </CardContent>
              </Card>
              <Card className="enterprise-card">
                <CardContent className="p-6 text-center">
                  <div className="dashboard-metric-value text-primary">24</div>
                  <div className="dashboard-metric-label mt-2">Problems Solved</div>
                </CardContent>
              </Card>
              <Card className="enterprise-card">
                <CardContent className="p-6 text-center">
                  <div className="dashboard-metric-value text-primary">$58M+</div>
                  <div className="dashboard-metric-label mt-2">Annual Savings</div>
                </CardContent>
              </Card>
              <Card className="enterprise-card">
                <CardContent className="p-6 text-center">
                  <div className="dashboard-metric-value text-primary">25:1</div>
                  <div className="dashboard-metric-label mt-2">Average ROI</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Tool Categories */}
          <div className="space-y-6">
            {TOOL_CATEGORIES.map((category) => (
              <Card key={category.name} className="enterprise-card">
                <CardHeader className={`${category.bgColor} border-b border-border`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${category.bgColor}`}>
                      <category.icon className={`h-5 w-5 ${category.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold">{category.name}</CardTitle>
                      <CardDescription className="text-xs">{category.tools.length} Tools Available</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid gap-4">
                    {category.tools.map((tool) => (
                      <Card key={tool.name} className="border border-border bg-card hover:border-primary/30 transition-all">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1 flex-1">
                              <CardTitle className="text-base font-semibold">{tool.name}</CardTitle>
                              <CardDescription className="text-sm">{tool.description}</CardDescription>
                            </div>
                            <Badge variant="secondary" className="shrink-0 font-semibold">
                              {tool.roi}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex flex-wrap gap-2">
                            {tool.capabilities.map((capability) => (
                              <Badge key={capability} variant="outline" className="text-xs tool-badge">
                                {capability}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
