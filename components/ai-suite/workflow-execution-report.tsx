"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, XCircle, Clock, Zap, TrendingUp, Activity, AlertCircle } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface WorkflowExecutionReportProps {
  result: any
}

// Utility function to strip markdown formatting from text
function stripMarkdown(text: string): string {
  if (!text) return text
  // Remove bold markdown (**text** or __text__)
  let cleaned = text.replace(/\*\*(.+?)\*\*/g, "$1").replace(/__(.+?)__/g, "$1")
  // Remove markdown headings (###, ##, #)
  cleaned = cleaned.replace(/^#{1,6}\s+/gm, "")
  return cleaned
}

export function WorkflowExecutionReport({ result }: WorkflowExecutionReportProps) {
  const { workflow_id, run_id, status, results, error, execution_time } = result

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 dark:text-green-400"
      case "failed":
        return "text-red-600 dark:text-red-400"
      case "running":
        return "text-blue-600 dark:text-blue-400"
      default:
        return "text-gray-600 dark:text-gray-400"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "failed":
        return <XCircle className="h-5 w-5 text-red-600" />
      case "running":
        return <Activity className="h-5 w-5 text-blue-600 animate-pulse" />
      default:
        return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  const stepResults = results ? Object.entries(results) : []
  const totalSteps = stepResults.length
  const completedSteps = stepResults.filter(([_, step]: any) => step.finalResponse || step.message).length

  return (
    <div className="space-y-4 md:space-y-6 pb-4">
      {/* Executive Summary */}
      <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-950/20 relative">
        <CardHeader className="p-4 md:p-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              {getStatusIcon(status)}
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base md:text-lg lg:text-xl truncate">Workflow Execution Report</CardTitle>
                <CardDescription className="mt-1 text-xs md:text-sm truncate">Run ID: {run_id}</CardDescription>
              </div>
            </div>
            <Badge
              variant={status === "completed" ? "default" : status === "failed" ? "destructive" : "secondary"}
              className="text-xs md:text-sm px-3 py-1 self-start w-fit"
            >
              {status.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div className="space-y-1 p-3 bg-background/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Total Steps</p>
              <p className="text-xl md:text-2xl font-bold">{totalSteps}</p>
            </div>
            <div className="space-y-1 p-3 bg-background/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Completed</p>
              <p className="text-xl md:text-2xl font-bold text-green-600">{completedSteps}</p>
            </div>
            <div className="space-y-1 p-3 bg-background/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Execution Time</p>
              <p className="text-xl md:text-2xl font-bold">{(execution_time / 1000).toFixed(2)}s</p>
            </div>
            <div className="space-y-1 p-3 bg-background/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Success Rate</p>
              <p className="text-xl md:text-2xl font-bold">
                {totalSteps > 0 ? ((completedSteps / totalSteps) * 100).toFixed(0) : 0}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && error !== "Unknown error" && (
        <Card className="border-l-4 border-l-red-500 bg-red-50/50 dark:bg-red-950/20 relative">
          <CardHeader className="p-4 md:p-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <CardTitle className="text-base md:text-lg text-red-600">Execution Error</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <p className="text-sm text-red-700 dark:text-red-400 break-words">{stripMarkdown(error)}</p>
          </CardContent>
        </Card>
      )}

      {/* Step Results */}
      <Card className="relative">
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-sm md:text-base">
            <TrendingUp className="h-5 w-5 flex-shrink-0" />
            Step-by-Step Analysis
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Detailed breakdown of each workflow step execution
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0">
          <ScrollArea className="h-[400px] md:h-[500px] lg:h-[600px] pr-2 md:pr-4">
            <div className="space-y-4 md:space-y-6">
              {stepResults.map(([stepId, stepData]: any, index) => (
                <div key={stepId}>
                  <div className="space-y-3 md:space-y-4">
                    {/* Step Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 font-semibold text-sm flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm md:text-base break-words">
                            {stepData.step_name ||
                              stepId.replace(/-/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            <Badge variant="outline" className="text-xs">
                              {stepData.step_type || "unknown"}
                            </Badge>
                            {stepData.analysis_type && (
                              <Badge variant="secondary" className="text-xs">
                                {stepData.analysis_type}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      {stepData.timestamp && (
                        <p className="text-xs text-muted-foreground flex-shrink-0 sm:mt-1">
                          {new Date(stepData.timestamp).toLocaleTimeString()}
                        </p>
                      )}
                    </div>

                    {/* Step Content */}
                    <div className="ml-10 md:ml-11 space-y-3">
                      {/* AI Response */}
                      {stepData.finalResponse && (
                        <div className="bg-muted/50 rounded-lg p-3 md:p-4 space-y-2">
                          <div className="flex items-center gap-2 mb-2">
                            <Zap className="h-4 w-4 text-blue-600 flex-shrink-0" />
                            <p className="text-xs md:text-sm font-medium">AI Analysis</p>
                          </div>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                            {stripMarkdown(stepData.finalResponse)}
                          </p>
                        </div>
                      )}

                      {/* Custom Step Message */}
                      {stepData.message && !stepData.finalResponse && (
                        <div className="bg-muted/50 rounded-lg p-3 md:p-4">
                          <p className="text-sm text-muted-foreground break-words">{stripMarkdown(stepData.message)}</p>
                        </div>
                      )}

                      {/* Data Analysis Summary */}
                      {stepData.data_summary && Array.isArray(stepData.data_summary) && (
                        <div className="bg-muted/50 rounded-lg p-3 md:p-4 space-y-2">
                          <div className="flex items-center gap-2 mb-2">
                            <Activity className="h-4 w-4 text-purple-600 flex-shrink-0" />
                            <p className="text-xs md:text-sm font-medium">Data Analysis Summary</p>
                          </div>
                          <p className="text-xs md:text-sm text-muted-foreground">
                            Analyzed {stepData.data_count} data point(s) from previous steps
                          </p>
                        </div>
                      )}

                      {/* Performance Metrics */}
                      {(stepData.tokens || stepData.elapsedMs || stepData.iterations) && (
                        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2 md:gap-3">
                          {stepData.elapsedMs && (
                            <div className="bg-background border rounded-lg p-3">
                              <p className="text-xs text-muted-foreground mb-1">Execution Time</p>
                              <p className="text-base md:text-lg font-semibold">
                                {(stepData.elapsedMs / 1000).toFixed(2)}s
                              </p>
                            </div>
                          )}
                          {stepData.tokens && (
                            <div className="bg-background border rounded-lg p-3">
                              <p className="text-xs text-muted-foreground mb-1">Tokens Used</p>
                              <p className="text-base md:text-lg font-semibold">
                                {stepData.tokens.total_tokens.toLocaleString()}
                              </p>
                            </div>
                          )}
                          {stepData.iterations && (
                            <div className="bg-background border rounded-lg p-3">
                              <p className="text-xs text-muted-foreground mb-1">Iterations</p>
                              <p className="text-base md:text-lg font-semibold">{stepData.iterations}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Step Configuration */}
                      {stepData.config && Object.keys(stepData.config).length > 0 && (
                        <details className="group">
                          <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors py-1">
                            View Configuration
                          </summary>
                          <div className="mt-2 bg-background border rounded-lg p-3 overflow-x-auto">
                            <pre className="text-xs">{JSON.stringify(stepData.config, null, 2)}</pre>
                          </div>
                        </details>
                      )}
                    </div>
                  </div>

                  {index < stepResults.length - 1 && <Separator className="my-4 md:my-6" />}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Technical Details */}
      <details className="group relative">
        <summary className="cursor-pointer text-sm md:text-base font-medium hover:text-primary transition-colors flex items-center gap-2 py-3 px-2 bg-muted/30 rounded-lg">
          <span>View Raw JSON Output</span>
          <span className="text-xs text-muted-foreground">(for debugging)</span>
        </summary>
        <Card className="mt-3">
          <CardContent className="p-3 md:p-4">
            <ScrollArea className="h-[250px] md:h-[300px] lg:h-[400px]">
              <pre className="text-xs overflow-x-auto">{JSON.stringify(result, null, 2)}</pre>
            </ScrollArea>
          </CardContent>
        </Card>
      </details>
    </div>
  )
}
