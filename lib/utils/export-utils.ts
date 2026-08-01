/**
 * Enterprise-grade data export utilities
 * Supports CSV and JSON formats with metadata preservation
 */

export interface ExportColumn {
  key: string
  label: string
  transform?: (value: any) => string
}

export interface ExportOptions {
  format: "csv" | "json"
  filename: string
  columns?: ExportColumn[]
  includeMetadata?: boolean
  flattenJSON?: boolean
}

/**
 * Flatten nested JSONB objects for CSV export
 */
export function flattenObject(obj: Record<string, any>, prefix = ""): Record<string, any> {
  const flattened: Record<string, any> = {}

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key

    if (value && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date)) {
      Object.assign(flattened, flattenObject(value, newKey))
    } else if (Array.isArray(value)) {
      flattened[newKey] = JSON.stringify(value)
    } else {
      flattened[newKey] = value
    }
  }

  return flattened
}

/**
 * Convert array of objects to CSV string
 */
export function generateCSV(data: Record<string, any>[], columns?: ExportColumn[], flattenJSON = true): string {
  if (data.length === 0) {
    return ""
  }

  // Flatten all objects if requested
  const processedData = flattenJSON ? data.map((item) => flattenObject(item)) : data

  // Determine columns
  let csvColumns: ExportColumn[]
  if (columns && columns.length > 0) {
    csvColumns = columns
  } else {
    // Auto-generate columns from first row
    const firstRow = processedData[0]
    csvColumns = Object.keys(firstRow).map((key) => ({
      key,
      label: key,
    }))
  }

  // Generate header row
  const headers = csvColumns.map((col) => escapeCSVValue(col.label))

  // Generate data rows
  const rows = processedData.map((row) => {
    return csvColumns.map((col) => {
      let value = row[col.key]

      // Apply transform if provided
      if (col.transform && value !== undefined && value !== null) {
        value = col.transform(value)
      }

      // Handle different types
      if (value === null || value === undefined) {
        return ""
      } else if (typeof value === "object") {
        return escapeCSVValue(JSON.stringify(value))
      } else {
        return escapeCSVValue(String(value))
      }
    })
  })

  // Combine header and rows
  const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n")

  return csvContent
}

/**
 * Escape CSV values that contain commas, quotes, or newlines
 */
function escapeCSVValue(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

/**
 * Convert array of objects to formatted JSON string
 */
export function generateJSON(data: Record<string, any>[], includeMetadata = true): string {
  const exportData = {
    exportDate: new Date().toISOString(),
    recordCount: data.length,
    ...(includeMetadata && {
      metadata: {
        exportedBy: "Kronova Platform",
        version: "1.0",
      },
    }),
    records: data,
  }

  return JSON.stringify(exportData, null, 2)
}

/**
 * Download data as file in browser
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Export data to CSV file
 */
export function exportToCSV(
  data: Record<string, any>[],
  filename: string,
  columns?: ExportColumn[],
  flattenJSON = true,
): void {
  const csvContent = generateCSV(data, columns, flattenJSON)
  downloadFile(csvContent, `${filename}.csv`, "text/csv;charset=utf-8;")
}

/**
 * Export data to JSON file
 */
export function exportToJSON(data: Record<string, any>[], filename: string, includeMetadata = true): void {
  const jsonContent = generateJSON(data, includeMetadata)
  downloadFile(jsonContent, `${filename}.json`, "application/json;charset=utf-8;")
}
