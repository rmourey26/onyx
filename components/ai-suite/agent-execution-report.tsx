"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  CheckCircle,
  Clock,
  Zap,
  Database,
  Activity,
  Code,
  Copy,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Download,
  Bot,
  Calendar,
  Cpu,
  Play,
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useState, useEffect } from "react"
import { toast } from "@/hooks/use-toast"
import { jsPDF } from "jspdf"
import { format } from "date-fns"
import { logAgentExecution } from "@/app/actions/agent-execution-logging"

interface AgentExecutionReportProps {
  result: any
  agentName: string
  prompt: string
  agentData?: {
    id: string
    model?: string
    model_id?: string
    created_at?: string
  }
}

function stripMarkdown(text: string): string {
  if (!text) return text
  let cleaned = text.replace(/\*\*(.+?)\*\*/g, "$1").replace(/__(.+?)__/g, "$1")
  cleaned = cleaned.replace(/^#{1,6}\s+/gm, "")
  return cleaned
}

export function AgentExecutionReport({ result, agentName, prompt, agentData }: AgentExecutionReportProps) {
  const { finalResponse, toolCalls = [], tokens, elapsedMs, iterations, agentId } = result
  const [expandedTools, setExpandedTools] = useState<Set<number>>(new Set())
  const [showRawJson, setShowRawJson] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [hasLoggedExecution, setHasLoggedExecution] = useState(false)

  const hasToolCalls = toolCalls && toolCalls.length > 0
  const executionTimeSeconds = elapsedMs ? (elapsedMs / 1000).toFixed(2) : "0.00"

  const totalTokens = tokens?.total || (tokens?.prompt && tokens?.completion ? tokens.prompt + tokens.completion : null)

  const promptTokens = tokens?.prompt || 0
  const completionTokens = tokens?.completion || 0

  const actualModelName =
    agentData?.model && agentData.model !== "" ? agentData.model : result?.model || result?.modelName || "Unknown Model"

  const [executedAt] = useState(() => new Date().toISOString())
  const createdDate = agentData?.created_at

  useEffect(() => {
    if (!hasLoggedExecution && agentData?.id) {
      logAgentExecution({
        agentId: agentData.id,
        agentName: agentName,
        modelId: agentData.model_id,
        modelName: actualModelName,
        prompt: prompt,
        response: finalResponse,
        tokensUsed: totalTokens,
        promptTokens: promptTokens,
        completionTokens: completionTokens,
        executionTimeMs: elapsedMs || 0,
        iterations: iterations || 1,
        toolCalls: toolCalls,
        contextData: {},
        status: "completed",
      }).then((result) => {
        if (result.success) {
          // Logged successfully
        }
      })
      setHasLoggedExecution(true)
    }
  }, [
    hasLoggedExecution,
    agentData,
    agentName,
    actualModelName,
    prompt,
    finalResponse,
    totalTokens,
    promptTokens,
    completionTokens,
    elapsedMs,
    iterations,
    toolCalls,
  ])

  const toggleTool = (index: number) => {
    const newExpanded = new Set(expandedTools)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedTools(newExpanded)
  }

  const copyResponse = async () => {
    try {
      await navigator.clipboard.writeText(stripMarkdown(finalResponse))
      toast({ title: "Copied", description: "Response copied to clipboard" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to copy response", variant: "destructive" })
    }
  }

  const downloadPDF = async () => {
    setIsGeneratingPDF(true)
    try {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 20
      const contentWidth = pageWidth - 2 * margin
      let yPos = margin

      const addWatermark = () => {
        doc.saveGraphicsState()
        doc.setGState(new (doc as any).GState({ opacity: 0.1 }))
        doc.setTextColor(200, 200, 200)
        doc.setFontSize(40)
        doc.setFont("helvetica", "bold")
        const watermarkText = "KRONOVA"
        const textWidth = doc.getTextWidth(watermarkText)
        doc.text(watermarkText, (pageWidth - textWidth) / 2, pageHeight / 2, {
          angle: 45,
        })
        doc.restoreGraphicsState()
      }

      try {
        const logoResponse = await fetch("/logos/kronova-logo-header.png")
        if (logoResponse.ok) {
          const logoBlob = await logoResponse.blob()
          const logoBase64 = await new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result as string)
            reader.readAsDataURL(logoBlob)
          })
          doc.addImage(logoBase64, "PNG", margin, yPos, 50, 12)
          yPos += 20
        } else {
          yPos += 5
        }
      } catch (error) {
        yPos += 5
      }

      addWatermark()

      doc.setFontSize(24)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(37, 99, 235)
      doc.text("Agent Execution Report", margin, yPos)
      yPos += 12

      doc.setFontSize(9)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(120, 120, 120)
      doc.text(`Generated: ${format(new Date(), "PPpp")}`, margin, yPos)
      yPos += 5
      doc.text(`Report ID: ${Date.now()}`, margin, yPos)
      yPos += 12

      doc.setFillColor(245, 247, 250)
      doc.rect(margin, yPos, contentWidth, 35, "F")
      doc.setDrawColor(200, 200, 200)
      doc.rect(margin, yPos, contentWidth, 35, "S")

      yPos += 7
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(0, 0, 0)
      doc.text("Agent Profile", margin + 5, yPos)

      yPos += 8
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(0, 0, 0)
      doc.text(`Agent ID: ${agentData?.id || agentId || "N/A"}`, margin + 5, yPos)
      yPos += 6
      doc.text(`Agent Name: ${agentName}`, margin + 5, yPos)
      yPos += 6
      doc.text(`AI Model: ${actualModelName}`, margin + 5, yPos)
      yPos += 6
      doc.text(`Executed: ${format(new Date(executedAt), "PPpp")}`, margin + 5, yPos)

      yPos += 12

      const checkPageBreak = (requiredSpace = 30) => {
        if (yPos > pageHeight - requiredSpace) {
          doc.addPage()
          addWatermark()
          yPos = margin
          return true
        }
        return false
      }

      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(59, 130, 246)
      doc.text("User Prompt", margin, yPos)
      yPos += 7

      doc.setFontSize(9)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(0, 0, 0)
      const promptLines = doc.splitTextToSize(prompt, contentWidth)
      promptLines.forEach((line: string) => {
        checkPageBreak()
        doc.setFontSize(9)
        doc.setFont("helvetica", "normal")
        doc.setTextColor(0, 0, 0)
        doc.text(line, margin, yPos)
        yPos += 5
      })
      yPos += 10

      checkPageBreak(40)
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(147, 51, 234)
      doc.text("AI Response", margin, yPos)
      yPos += 7

      doc.setFontSize(9)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(0, 0, 0)
      const responseText = stripMarkdown(finalResponse)
      const responseLines = doc.splitTextToSize(responseText, contentWidth)
      responseLines.forEach((line: string) => {
        checkPageBreak()
        doc.setFontSize(9)
        doc.setFont("helvetica", "normal")
        doc.setTextColor(0, 0, 0)
        doc.text(line, margin, yPos)
        yPos += 4.5
      })

      if (hasToolCalls) {
        yPos += 10
        checkPageBreak(40)
        doc.setFontSize(12)
        doc.setFont("helvetica", "bold")
        doc.setTextColor(234, 88, 12)
        doc.text("Tool Executions", margin, yPos)
        yPos += 7

        toolCalls.forEach((tc: any, i: number) => {
          checkPageBreak(25)
          doc.setFontSize(10)
          doc.setFont("helvetica", "bold")
          doc.setTextColor(0, 0, 0)
          doc.text(`${i + 1}. ${tc.tool || tc.name || "Unknown Tool"}`, margin, yPos)
          yPos += 5
          doc.setFont("helvetica", "normal")
          doc.setFontSize(8)
          doc.setTextColor(100, 100, 100)
          const paramsText = `Params: ${JSON.stringify(tc.params)}`
          const paramsLines = doc.splitTextToSize(paramsText, contentWidth - 5)
          paramsLines.forEach((line: string) => {
            checkPageBreak()
            doc.setFontSize(8)
            doc.setFont("helvetica", "normal")
            doc.setTextColor(100, 100, 100)
            doc.text(line, margin + 5, yPos)
            yPos += 4
          })
          yPos += 6
        })
      }

      const pageCount = (doc as any).internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: "center" })
        doc.text("© Kronova - Confidential", margin, pageHeight - 10)
      }

      doc.save(`agent-report-${agentName.replace(/\s+/g, "-")}-${Date.now()}.pdf`)
      toast({
        title: "Success",
        description: "PDF report downloaded successfully",
      })
    } catch (error) {
      console.error("[v0] PDF generation error:", error)
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  return (
    <div className="w-full max-w-full space-y-6 pb-6">
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/5 shadow-2xl overflow-hidden">
        <CardHeader className="p-6 md:p-8 space-y-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-2xl ring-4 ring-green-500/20">
                <CheckCircle className="h-8 w-8 text-white" strokeWidth={2.5} />
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <CardTitle className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight">
                  Agent Execution Report
                </CardTitle>
                <CardDescription className="text-base md:text-lg font-medium flex items-center gap-2 text-muted-foreground">
                  <Bot className="h-5 w-5" />
                  {agentName}
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-3 flex-shrink-0 w-full lg:w-auto">
              <Button
                variant="outline"
                size="default"
                onClick={copyResponse}
                className="flex-1 lg:flex-initial h-11 gap-2 font-medium hover:bg-primary/10 bg-transparent"
              >
                <Copy className="h-4 w-4" />
                <span>Copy</span>
              </Button>
              <Button
                variant="default"
                size="default"
                onClick={downloadPDF}
                disabled={isGeneratingPDF}
                className="flex-1 lg:flex-initial h-11 gap-2 font-medium bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
              >
                <Download className="h-4 w-4" />
                <span>{isGeneratingPDF ? "Generating..." : "Download PDF"}</span>
              </Button>
            </div>
          </div>

          <div className="bg-muted/40 backdrop-blur-sm rounded-xl p-5 border border-border/40 space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Agent Profile
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Created
                </p>
                <p className="font-medium text-foreground">
                  {createdDate ? format(new Date(createdDate), "PPP") : "N/A"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Agent Name</p>
                <p className="font-medium text-foreground">{agentName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                  <Cpu className="h-3 w-3" />
                  AI Model
                </p>
                <p className="font-medium text-foreground">{actualModelName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                  <Play className="h-3 w-3" />
                  Executed
                </p>
                <p className="font-medium text-foreground">{format(new Date(executedAt), "PPpp")}</p>
              </div>
            </div>
          </div>

          <Badge
            variant="default"
            className="text-sm px-6 py-2 self-start w-fit bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg font-semibold"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            COMPLETED SUCCESSFULLY
          </Badge>
        </CardHeader>

        <CardContent className="p-6 md:p-8 pt-0">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
            {[
              {
                label: "Execution Time",
                value: `${executionTimeSeconds}s`,
                icon: Clock,
                gradient: "from-blue-500 to-cyan-500",
                bgColor: "bg-blue-50 dark:bg-blue-950/30",
                borderColor: "border-blue-200 dark:border-blue-800/50",
              },
              {
                label: "Total Tokens",
                value: totalTokens !== null && totalTokens > 0 ? totalTokens.toLocaleString() : "N/A",
                icon: Database,
                gradient: "from-violet-500 to-purple-500",
                bgColor: "bg-violet-50 dark:bg-violet-950/30",
                borderColor: "border-violet-200 dark:border-violet-800/50",
              },
              {
                label: "Iterations",
                value: String(iterations || 1),
                icon: Activity,
                gradient: "from-amber-500 to-orange-500",
                bgColor: "bg-amber-50 dark:bg-amber-950/30",
                borderColor: "border-amber-200 dark:border-amber-800/50",
              },
              {
                label: "Tools Used",
                value: String(toolCalls.length),
                icon: Code,
                gradient: "from-emerald-500 to-teal-500",
                bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
                borderColor: "border-emerald-200 dark:border-emerald-800/50",
              },
              {
                label: "AI Model",
                value: actualModelName,
                icon: Cpu,
                gradient: "from-indigo-500 to-blue-500",
                bgColor: "bg-indigo-50 dark:bg-indigo-950/30",
                borderColor: "border-indigo-200 dark:border-indigo-800/50",
                isWide: true,
              },
            ].map((metric, i) => (
              <div
                key={i}
                className={`space-y-3 p-4 md:p-5 ${metric.bgColor} backdrop-blur-sm rounded-xl border ${metric.borderColor} shadow-sm hover:shadow-md transition-all duration-300 ${metric.isWide ? "col-span-2 lg:col-span-1" : ""}`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-10 h-10 rounded-lg bg-gradient-to-br ${metric.gradient} flex items-center justify-center shadow-md`}
                  >
                    <metric.icon className="h-5 w-5 text-white" strokeWidth={2} />
                  </div>
                  <p className="text-xs font-semibold text-muted-foreground leading-tight">{metric.label}</p>
                </div>
                <p
                  className={`text-2xl md:text-3xl font-semibold text-foreground tracking-tight ${metric.isWide ? "text-lg md:text-xl truncate" : ""}`}
                >
                  {metric.value}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border/60 hover:border-primary/40 transition-colors">
        <CardHeader
          className="p-5 cursor-pointer hover:bg-muted/40 transition-colors rounded-t-lg"
          onClick={() => setShowRawJson(!showRawJson)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Code className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base font-semibold">Raw JSON Output</CardTitle>
              <Badge variant="secondary" className="text-xs font-medium">
                Debug
              </Badge>
            </div>
            {showRawJson ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </CardHeader>
        {showRawJson && (
          <CardContent className="p-5 pt-0">
            <ScrollArea className="h-[300px] md:h-[400px]">
              <div className="bg-gray-950 dark:bg-black rounded-lg p-5 border border-gray-800 font-mono">
                <pre className="text-xs text-green-400 overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </ScrollArea>
          </CardContent>
        )}
      </Card>

      <Card className="border border-primary/20 shadow-xl">
        <CardHeader className="p-6 md:p-8 bg-gradient-to-r from-primary/5 via-primary/3 to-secondary/5 rounded-t-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-3 text-xl md:text-2xl font-semibold">
                <Zap className="h-6 w-6 text-primary" strokeWidth={2} />
                AI Response
              </CardTitle>
              <CardDescription className="text-sm md:text-base mt-2">
                Generated with advanced AI reasoning
              </CardDescription>
            </div>
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary border-primary/20 font-medium px-4 py-2 text-sm"
            >
              {totalTokens !== null && totalTokens > 0 ? `${totalTokens.toLocaleString()} tokens` : "N/A"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <ScrollArea className="max-h-[500px] md:max-h-[600px]">
            <div className="bg-muted/20 rounded-xl p-6 md:p-8 border border-border/40 shadow-inner">
              <p className="text-base md:text-lg leading-relaxed md:leading-loose whitespace-pre-wrap break-words text-foreground">
                {stripMarkdown(finalResponse)}
              </p>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {hasToolCalls && (
        <Card className="border border-border/60">
          <CardHeader className="p-6 md:p-8 bg-gradient-to-r from-orange-500/5 to-amber-500/5 rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-xl font-semibold">
              <Code className="h-6 w-6 text-orange-500" strokeWidth={2} />
              Tool Executions
              <Badge variant="outline" className="ml-2 font-medium">
                {toolCalls.length} {toolCalls.length === 1 ? "call" : "calls"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <div className="space-y-4">
              {toolCalls.map((tc: any, index: number) => (
                <div
                  key={index}
                  className="border border-border/60 rounded-xl overflow-hidden hover:border-orange-500/40 transition-colors"
                >
                  <div
                    className="flex items-center justify-between p-4 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => toggleTool(index)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-md">
                        <Code className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-medium text-foreground">{tc.tool || tc.name || "Unknown Tool"}</span>
                    </div>
                    {expandedTools.has(index) ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  {expandedTools.has(index) && (
                    <div className="p-4 bg-gray-950 dark:bg-black border-t border-border/40">
                      <p className="text-xs text-muted-foreground mb-2 font-medium">Parameters:</p>
                      <pre className="text-xs text-green-400 overflow-x-auto whitespace-pre-wrap font-mono">
                        {JSON.stringify(tc.params || tc.arguments, null, 2)}
                      </pre>
                      {tc.result && (
                        <>
                          <Separator className="my-4" />
                          <p className="text-xs text-muted-foreground mb-2 font-medium">Result:</p>
                          <pre className="text-xs text-blue-400 overflow-x-auto whitespace-pre-wrap font-mono">
                            {typeof tc.result === "string" ? tc.result : JSON.stringify(tc.result, null, 2)}
                          </pre>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
