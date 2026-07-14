"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Download, FileJson, FileSpreadsheet, Loader2, Database } from "lucide-react"
import { format as formatDate } from "date-fns"
import { exportLearningData, exportEmbeddingsData } from "@/app/actions/learning-layer-export-actions"
import { exportToCSV, exportToJSON, type ExportColumn } from "@/lib/utils/export-utils"

interface DatasetExportDialogProps {
  datasetType: "learning" | "embeddings"
  totalRecords: number
  availableFilters?: {
    executionTypes?: string[]
    sourceTypes?: string[]
    tags?: string[]
  }
}

export function DatasetExportDialog({ datasetType, totalRecords, availableFilters }: DatasetExportDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [format, setFormat] = useState<"csv" | "json">("csv")
  const [includeVectors, setIncludeVectors] = useState(false)
  const [includeMetadata, setIncludeMetadata] = useState(true)
  const [selectedExecutionType, setSelectedExecutionType] = useState<string | undefined>()
  const [selectedSourceType, setSelectedSourceType] = useState<string | undefined>()

  const learningColumns: ExportColumn[] = [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "execution_type", label: "Execution Type" },
    { key: "execution_name", label: "Execution Name" },
    { key: "success_score", label: "Success Score" },
    { key: "quality_rating", label: "Quality Rating" },
    { key: "tags", label: "Tags", transform: (val) => (Array.isArray(val) ? val.join("; ") : "") },
    { key: "created_at", label: "Created At", transform: (val) => formatDate(new Date(val), "yyyy-MM-dd HH:mm:ss") },
  ]

  const embeddingsColumns: ExportColumn[] = [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "source_type", label: "Source Type" },
    { key: "embedding_model", label: "Embedding Model" },
    { key: "created_at", label: "Created At", transform: (val) => formatDate(new Date(val), "yyyy-MM-dd HH:mm:ss") },
  ]

  const handleExport = async () => {
    setIsExporting(true)

    try {
      let exportResult

      if (datasetType === "learning") {
        exportResult = await exportLearningData({
          format,
          includeVectors,
          filters: {
            executionType: selectedExecutionType as "agent" | "workflow" | undefined,
          },
        })
      } else {
        exportResult = await exportEmbeddingsData({
          format,
          includeVectors,
          filters: {
            sourceType: selectedSourceType,
          },
        })
      }

      if (!exportResult.success || !exportResult.data) {
        throw new Error(exportResult.error || "Export failed")
      }

      const data = exportResult.data
      const timestamp = formatDate(new Date(), "yyyy-MM-dd-HHmmss")
      const filename = `${datasetType}-dataset-${timestamp}`

      if (format === "csv") {
        const columns = datasetType === "learning" ? learningColumns : embeddingsColumns
        exportToCSV(data, filename, columns, true)
      } else {
        exportToJSON(data, filename, includeMetadata)
      }

      toast.success(`Successfully exported ${data.length} records as ${format.toUpperCase()}`)
      setIsOpen(false)
    } catch (error: any) {
      console.error("[v0] Export error:", error)
      toast.error(`Export failed: ${error.message}`)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export Dataset
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Export {datasetType === "learning" ? "Learning Layer" : "Embeddings"} Dataset
          </DialogTitle>
          <DialogDescription>Export your data with IDs, values, and metadata in CSV or JSON format</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Dataset Stats */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium">Total Records</span>
            <Badge variant="secondary">{totalRecords.toLocaleString()}</Badge>
          </div>

          {/* Export Format */}
          <div className="space-y-3">
            <Label>Export Format</Label>
            <RadioGroup value={format} onValueChange={(value) => setFormat(value as "csv" | "json")}>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="csv" id="csv" />
                <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="csv" className="flex-1 cursor-pointer">
                  <div className="font-medium">CSV (Spreadsheet)</div>
                  <div className="text-xs text-muted-foreground">Compatible with Excel, Google Sheets</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="json" id="json" />
                <FileJson className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="json" className="flex-1 cursor-pointer">
                  <div className="font-medium">JSON (Structured)</div>
                  <div className="text-xs text-muted-foreground">Complete with nested metadata</div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Filters */}
          {datasetType === "learning" && availableFilters?.executionTypes && (
            <div className="space-y-3">
              <Label>Filter by Execution Type (Optional)</Label>
              <Select value={selectedExecutionType} onValueChange={setSelectedExecutionType}>
                <SelectTrigger>
                  <SelectValue placeholder="All execution types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Execution Types</SelectLabel>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="agent">Agents</SelectItem>
                    <SelectItem value="workflow">Workflows</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          )}

          {datasetType === "embeddings" && availableFilters?.sourceTypes && (
            <div className="space-y-3">
              <Label>Filter by Source Type (Optional)</Label>
              <Select value={selectedSourceType} onValueChange={setSelectedSourceType}>
                <SelectTrigger>
                  <SelectValue placeholder="All source types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Source Types</SelectLabel>
                    <SelectItem value="all">All Types</SelectItem>
                    {availableFilters.sourceTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Export Options */}
          <div className="space-y-3">
            <Label>Export Options</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeVectors"
                  checked={includeVectors}
                  onCheckedChange={(checked) => setIncludeVectors(checked as boolean)}
                />
                <Label htmlFor="includeVectors" className="text-sm font-normal cursor-pointer">
                  Include vector embeddings (increases file size)
                </Label>
              </div>
              {format === "json" && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeMetadata"
                    checked={includeMetadata}
                    onCheckedChange={(checked) => setIncludeMetadata(checked as boolean)}
                  />
                  <Label htmlFor="includeMetadata" className="text-sm font-normal cursor-pointer">
                    Include export metadata (timestamp, record count)
                  </Label>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isExporting}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export {format.toUpperCase()}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
