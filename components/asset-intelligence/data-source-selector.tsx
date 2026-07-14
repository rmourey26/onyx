"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Database, Globe, Brain, TrendingUp } from "lucide-react"

interface DataSourceSelectorProps {
  selectedTables: string[]
  selectedEndpoints: string[]
  includeLearningData: boolean
  onTablesChange: (tables: string[]) => void
  onEndpointsChange: (endpoints: string[]) => void
  onLearningDataChange: (include: boolean) => void
  mode?: "input" | "output" | "both"
}

// Available Supabase tables for selection
const AVAILABLE_TABLES = [
  { name: "assets", description: "Asset inventory and metadata", category: "Core" },
  { name: "asset_lifecycle_events", description: "Asset lifecycle tracking", category: "Core" },
  { name: "asset_insights", description: "AI-generated asset insights", category: "Intelligence" },
  { name: "asset_relationships", description: "Asset connections and dependencies", category: "Core" },
  { name: "workflow_learning_data", description: "Workflow execution learning data", category: "Intelligence" },
  { name: "ai_agent_executions", description: "Agent execution history", category: "Intelligence" },
  { name: "ai_workflows", description: "Workflow definitions", category: "Automation" },
  { name: "workflow_executions", description: "Workflow run history", category: "Automation" },
  { name: "profiles", description: "User profile information", category: "User" },
  { name: "crm_connections", description: "CRM connections and contacts", category: "CRM" },
]

// Available API endpoints
const AVAILABLE_ENDPOINTS = [
  { path: "/api/assets", method: "GET", description: "Fetch asset data" },
  { path: "/api/assets", method: "POST", description: "Create new asset" },
  { path: "/api/insights", method: "GET", description: "Get asset insights" },
  { path: "/api/workflows/execute", method: "POST", description: "Execute workflow" },
  { path: "/api/agents/execute", method: "POST", description: "Run AI agent" },
  { path: "/api/analytics", method: "GET", description: "Get analytics data" },
]

const groupedTables = AVAILABLE_TABLES.reduce(
  (acc, table) => {
    if (!acc[table.category]) acc[table.category] = []
    acc[table.category].push(table)
    return acc
  },
  {} as Record<string, typeof AVAILABLE_TABLES>,
)

export function DataSourceSelector({
  selectedTables,
  selectedEndpoints,
  includeLearningData,
  onTablesChange,
  onEndpointsChange,
  onLearningDataChange,
  mode = "both",
}: DataSourceSelectorProps) {
  const [activeSection, setActiveSection] = useState<"tables" | "endpoints">("tables")

  const safeSelectedTables = Array.isArray(selectedTables) ? selectedTables : []
  const safeSelectedEndpoints = Array.isArray(selectedEndpoints) ? selectedEndpoints : []

  const handleTableToggle = (tableName: string) => {
    if (safeSelectedTables.includes(tableName)) {
      onTablesChange(safeSelectedTables.filter((t) => t !== tableName))
    } else {
      onTablesChange([...safeSelectedTables, tableName])
    }
  }

  const handleEndpointToggle = (endpoint: string) => {
    if (safeSelectedEndpoints.includes(endpoint)) {
      onEndpointsChange(safeSelectedEndpoints.filter((e) => e !== endpoint))
    } else {
      onEndpointsChange([...safeSelectedEndpoints, endpoint])
    }
  }

  return (
    <Card>
      <CardHeader className="p-5 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Database className="h-5 w-5" />
          Data Sources {mode !== "both" && `(${mode === "input" ? "Input" : "Output"})`}
        </CardTitle>
        <CardDescription className="text-sm">
          Select Supabase tables and API endpoints to{" "}
          {mode === "input" ? "read from" : mode === "output" ? "write to" : "use"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-5 sm:p-6 pt-0">
        {/* Section Toggle */}
        <div className="flex gap-2 p-1 bg-muted rounded-lg">
          <button
            onClick={() => setActiveSection("tables")}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeSection === "tables" ? "bg-background shadow-sm" : "hover:bg-background/50"
            }`}
          >
            <Database className="h-4 w-4 inline mr-2" />
            Tables ({safeSelectedTables.length})
          </button>
          <button
            onClick={() => setActiveSection("endpoints")}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeSection === "endpoints" ? "bg-background shadow-sm" : "hover:bg-background/50"
            }`}
          >
            <Globe className="h-4 w-4 inline mr-2" />
            Endpoints ({safeSelectedEndpoints.length})
          </button>
        </div>

        {/* Workflow Learning Data Toggle */}
        {(mode === "input" || mode === "both") && (
          <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center gap-3">
              <Brain className="h-5 w-5 text-primary" />
              <div>
                <Label className="text-sm font-medium">Include Workflow Learning Data</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Use historical workflow execution data for optimization
                </p>
              </div>
            </div>
            <Checkbox checked={includeLearningData} onCheckedChange={onLearningDataChange} className="h-5 w-5" />
          </div>
        )}

        {/* Tables Section */}
        {activeSection === "tables" && (
          <ScrollArea className="h-[300px] sm:h-[350px]">
            <div className="space-y-4 pr-4">
              {Object.entries(groupedTables).map(([category, tables]) => (
                <div key={category}>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    {category}
                  </h4>
                  <div className="space-y-2">
                    {tables.map((table) => (
                      <div
                        key={table.name}
                        className="flex items-start gap-3 p-3 border rounded-lg hover:border-primary/50 transition-colors"
                      >
                        <Checkbox
                          id={`table-${table.name}`}
                          checked={safeSelectedTables.includes(table.name)}
                          onCheckedChange={() => handleTableToggle(table.name)}
                          className="mt-0.5"
                        />
                        <Label htmlFor={`table-${table.name}`} className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">{table.name}</span>
                            {table.name === "workflow_learning_data" && (
                              <Badge variant="secondary" className="text-xs">
                                Learning
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{table.description}</p>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Endpoints Section */}
        {activeSection === "endpoints" && (
          <ScrollArea className="h-[300px] sm:h-[350px]">
            <div className="space-y-2 pr-4">
              {AVAILABLE_ENDPOINTS.map((endpoint) => {
                const endpointKey = `${endpoint.method} ${endpoint.path}`
                const isCompatible =
                  mode === "both" ||
                  (mode === "input" && endpoint.method === "GET") ||
                  (mode === "output" && endpoint.method === "POST")

                return (
                  <div
                    key={endpointKey}
                    className={`flex items-start gap-3 p-3 border rounded-lg transition-colors ${
                      isCompatible ? "hover:border-primary/50" : "opacity-50"
                    }`}
                  >
                    <Checkbox
                      id={`endpoint-${endpointKey}`}
                      checked={safeSelectedEndpoints.includes(endpointKey)}
                      onCheckedChange={() => handleEndpointToggle(endpointKey)}
                      disabled={!isCompatible}
                      className="mt-0.5"
                    />
                    <Label htmlFor={`endpoint-${endpointKey}`} className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant={endpoint.method === "GET" ? "secondary" : "default"}
                          className="text-xs font-mono"
                        >
                          {endpoint.method}
                        </Badge>
                        <span className="text-sm font-mono">{endpoint.path}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{endpoint.description}</p>
                    </Label>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        )}

        {/* Selection Summary */}
        <div className="pt-3 border-t">
          <p className="text-xs text-muted-foreground">
            Selected: {safeSelectedTables.length} table{safeSelectedTables.length !== 1 ? "s" : ""},{" "}
            {safeSelectedEndpoints.length} endpoint{safeSelectedEndpoints.length !== 1 ? "s" : ""}
            {includeLearningData && ", Learning Data enabled"}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
