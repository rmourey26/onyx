"use client"

import { cn } from "@/lib/utils"

interface CodeBlockHighlightProps {
  code: string
  language?: string // Language prop for potential future syntax highlighting
  className?: string
}

export function CodeBlockHighlight({ code, language, className }: CodeBlockHighlightProps) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-gray-900 p-4 text-sm text-gray-100 dark:bg-gray-800 dark:border-gray-700 overflow-x-auto",
        className,
      )}
    >
      <pre>
        <code>{code.trim()}</code>
      </pre>
      {language && <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">Language: {language}</div>}
    </div>
  )
}
