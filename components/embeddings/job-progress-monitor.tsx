"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getJobStatus, cancelJob, retryJob } from "@/app/actions/embedding-actions"
import { toast } from "@/components/ui/use-toast"
import { RefreshCw, Eye, XCircle, CheckCircle, Clock, AlertCircle, Loader2, Play, Square } from "lucide-react"
import type { BackgroundJob } from "@/lib/background-jobs/job-queue"

interface JobProgressMonitorProps {
  jobId: string
  userId: string
  onJobComplete?: () => void
  autoRefresh?: boolean
}

export function JobProgressMonitor({ jobId, userId, onJobComplete, autoRefresh = true }: JobProgressMonitorProps) {
  const [job, setJob] = useState<BackgroundJob | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isActionLoading, setIsActionLoading] = useState(false)

  const fetchJobStatus = async () => {
    try {
      const jobData = await getJobStatus(jobId, userId)
      setJob(jobData)

      if (jobData?.status === "completed" && onJobComplete) {
        onJobComplete()
      }
    } catch (error) {
      console.error("Error fetching job status:", error)
      toast({
        title: "Error",
        description: "Failed to fetch job status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchJobStatus()
  }, [jobId, userId])

  useEffect(() => {
    if (!autoRefresh || !job) return

    const shouldContinuePolling = job.status === "pending" || job.status === "processing"

    if (shouldContinuePolling) {
      const interval = setInterval(fetchJobStatus, 2000) // Poll every 2 seconds
      return () => clearInterval(interval)
    }
  }, [job, autoRefresh]) // Updated to include job in dependencies

  const handleCancel = async () => {
    if (!job || job.status !== "pending") return

    setIsActionLoading(true)
    try {
      await cancelJob(jobId, userId)
      await fetchJobStatus()
      toast({
        title: "Job cancelled",
        description: "The embedding job has been cancelled",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel job",
        variant: "destructive",
      })
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleRetry = async () => {
    if (!job || job.status !== "failed") return

    setIsActionLoading(true)
    try {
      await retryJob(jobId, userId)
      await fetchJobStatus()
      toast({
        title: "Job restarted",
        description: "The embedding job has been queued for retry",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to retry job",
        variant: "destructive",
      })
    } finally {
      setIsActionLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Pending</span>
          </Badge>
        )
      case "processing":
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-blue-50">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Processing</span>
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700">
            <CheckCircle className="h-3 w-3" />
            <span>Completed</span>
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-red-50 text-red-700">
            <XCircle className="h-3 w-3" />
            <span>Failed</span>
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            <span>{status}</span>
          </Badge>
        )
    }
  }

  const getProgress = () => {
    if (!job?.result?.progress) return 0
    return Math.min(Math.max(job.result.progress, 0), 100)
  }

  const getMessage = () => {
    if (!job) return "Loading job details..."
    if (job.result?.message) return job.result.message
    if (job.error) return job.error
    return `Job is ${job.status}`
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading job status...</span>
        </CardContent>
      </Card>
    )
  }

  if (!job) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-6">
          <AlertCircle className="h-6 w-6 text-muted-foreground mr-2" />
          <span>Job not found</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Database Embedding Job</CardTitle>
              <CardDescription>{job.parameters?.name || "Unnamed embedding job"}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(job.status)}
              <Button variant="outline" size="icon" onClick={fetchJobStatus} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {(job.status === "processing" || job.status === "completed") && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{getProgress()}%</span>
              </div>
              <Progress value={getProgress()} className="w-full" />
            </div>
          )}

          <div className="text-sm text-muted-foreground">{getMessage()}</div>

          {job.result && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              {job.result.rowsProcessed && (
                <div>
                  <span className="font-medium">Rows Processed:</span>
                  <span className="ml-2">{job.result.rowsProcessed}</span>
                </div>
              )}
              {job.result.chunksCreated && (
                <div>
                  <span className="font-medium">Chunks Created:</span>
                  <span className="ml-2">{job.result.chunksCreated}</span>
                </div>
              )}
              {job.result.embeddingsStored && (
                <div>
                  <span className="font-medium">Embeddings Stored:</span>
                  <span className="ml-2">{job.result.embeddingsStored}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsDetailsOpen(true)}>
              <Eye className="h-4 w-4 mr-1" />
              View Details
            </Button>

            {job.status === "pending" && (
              <Button variant="outline" size="sm" onClick={handleCancel} disabled={isActionLoading}>
                <Square className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            )}

            {job.status === "failed" && (
              <Button variant="outline" size="sm" onClick={handleRetry} disabled={isActionLoading}>
                <Play className="h-4 w-4 mr-1" />
                Retry
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Job Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Job Details</DialogTitle>
            <DialogDescription>Detailed information about this embedding job</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Job Type</p>
                <p className="capitalize">{job.job_type}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <div>{getStatusBadge(job.status)}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Created</p>
                <p>{new Date(job.created_at).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Updated</p>
                <p>{new Date(job.updated_at).toLocaleString()}</p>
              </div>
            </div>

            {job.parameters && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Parameters</p>
                <pre className="bg-muted p-2 rounded-md text-xs overflow-auto max-h-[150px]">
                  {JSON.stringify(job.parameters, null, 2)}
                </pre>
              </div>
            )}

            {job.result && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Result</p>
                <pre className="bg-muted p-2 rounded-md text-xs overflow-auto max-h-[150px]">
                  {JSON.stringify(job.result, null, 2)}
                </pre>
              </div>
            )}

            {job.error && (
              <div>
                <p className="text-sm font-medium text-muted-foreground text-red-500">Error</p>
                <pre className="bg-red-50 p-2 rounded-md text-xs overflow-auto max-h-[150px] text-red-700">
                  {job.error}
                </pre>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
