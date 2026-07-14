"use client"

import React from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallbackMessage?: string
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  digest?: string
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      digest: undefined,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const digest = (error as any).digest || (error as any).errorDigest

    console.error("[v0] ErrorBoundary - Error caught:", {
      message: error.message,
      name: error.name,
      digest: digest,
      stack: error.stack,
      errorObject: error,
      allProperties: Object.getOwnPropertyNames(error),
      timestamp: new Date().toISOString(),
    })

    return {
      hasError: true,
      error,
      digest,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const digest = (error as any).digest || (error as any).errorDigest

    console.error("[v0] ErrorBoundary - Component stack:", {
      componentStack: errorInfo.componentStack,
      error: {
        message: error.message,
        name: error.name,
        stack: error.stack,
        digest: digest,
      },
      timestamp: new Date().toISOString(),
    })

    console.error(
      "[v0] ErrorBoundary - All error properties:",
      Object.getOwnPropertyNames(error).reduce(
        (acc, key) => {
          acc[key] = (error as any)[key]
          return acc
        },
        {} as Record<string, any>,
      ),
    )

    this.setState({
      errorInfo,
      digest,
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[400px] p-4">
          <Alert variant="destructive" className="max-w-4xl">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="text-lg font-semibold">
              {this.props.fallbackMessage || "Something went wrong"}
            </AlertTitle>
            <AlertDescription className="mt-2 space-y-4">
              <div className="space-y-3">
                <div className="p-3 bg-destructive/10 rounded-md">
                  <p className="text-sm font-semibold mb-1">Error Message:</p>
                  <p className="text-sm font-mono">{this.state.error?.message || "An unexpected error occurred"}</p>
                </div>

                {this.state.digest && (
                  <div className="p-3 bg-destructive/10 rounded-md">
                    <p className="text-sm font-semibold mb-1">Error Digest:</p>
                    <p className="text-sm font-mono break-all">{this.state.digest}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Use this digest to track the error in Vercel logs
                    </p>
                  </div>
                )}

                {this.state.error && (
                  <div className="p-3 bg-destructive/10 rounded-md">
                    <p className="text-sm font-semibold mb-1">Error Type:</p>
                    <p className="text-sm font-mono">{this.state.error.name}</p>
                  </div>
                )}

                {this.state.error?.stack && (
                  <div className="p-3 bg-destructive/10 rounded-md">
                    <p className="text-sm font-semibold mb-2">Stack Trace:</p>
                    <pre className="text-xs font-mono overflow-auto max-h-[200px] p-2 bg-background/50 rounded">
                      {this.state.error.stack}
                    </pre>
                  </div>
                )}

                {this.state.errorInfo?.componentStack && (
                  <div className="p-3 bg-destructive/10 rounded-md">
                    <p className="text-sm font-semibold mb-2">Component Stack:</p>
                    <pre className="text-xs font-mono overflow-auto max-h-[200px] p-2 bg-background/50 rounded">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                )}

                {this.state.error && (
                  <details className="p-3 bg-destructive/10 rounded-md">
                    <summary className="text-sm font-semibold cursor-pointer hover:underline">
                      All Error Properties
                    </summary>
                    <pre className="mt-2 text-xs font-mono overflow-auto max-h-[200px] p-2 bg-background/50 rounded">
                      {JSON.stringify(
                        Object.getOwnPropertyNames(this.state.error).reduce(
                          (acc, key) => {
                            acc[key] = (this.state.error as any)[key]
                            return acc
                          },
                          {} as Record<string, any>,
                        ),
                        null,
                        2,
                      )}
                    </pre>
                  </details>
                )}
              </div>
              {/* </CHANGE> */}

              <Button
                onClick={() => {
                  this.setState({
                    hasError: false,
                    error: null,
                    errorInfo: null,
                    digest: undefined,
                  })
                  window.location.reload()
                }}
                variant="outline"
                className="mt-4"
              >
                Reload Page
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )
    }

    return this.props.children
  }
}
