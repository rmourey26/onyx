"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatDistanceToNow } from "date-fns"
import { RefreshCw, Eye, XCircle, CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react"
import type { EmbeddingJob } from "@/lib/types/database"

interface EmbeddingsJobsProps {
  jobs: EmbeddingJob[]
  userId: string
  refreshData: () => void
}

export function EmbeddingsJobs({ jobs, userId, refreshData }: EmbeddingsJobsProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedJob, setSelectedJob] = useState<EmbeddingJob | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    refreshData()
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const handleViewDetails = (job: EmbeddingJob) => {
    setSelectedJob(job)
    setIsDetailsDialogOpen(true)
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

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch (e) {
      return dateString
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Embedding Jobs</CardTitle>
            <CardDescription>Monitor the status of your embedding processing jobs</CardDescription>
          </div>
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10">
            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">No embedding jobs found</p>
          </div>
        ) : (
          <div className="border rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium capitalize">{job.job_type}</TableCell>
                      <TableCell>{getStatusBadge(job.status)}</TableCell>
                      <TableCell>{formatDate(job.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleViewDetails(job)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Job Details Dialog */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Job Details</DialogTitle>
              <DialogDescription>Detailed information about this embedding job</DialogDescription>
            </DialogHeader>
            {selectedJob && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Job Type</p>
                    <p className="capitalize">{selectedJob.job_type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <div>{getStatusBadge(selectedJob.status)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Created</p>
                    <p>{formatDate(selectedJob.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Updated</p>
                    <p>{formatDate(selectedJob.updated_at)}</p>
                  </div>
                </div>

                {selectedJob.parameters && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Parameters</p>
                    <pre className="bg-muted p-2 rounded-md text-xs overflow-auto max-h-[100px]">
                      {JSON.stringify(selectedJob.parameters, null, 2)}
                    </pre>
                  </div>
                )}

                {selectedJob.result && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Result</p>
                    <pre className="bg-muted p-2 rounded-md text-xs overflow-auto max-h-[100px]">
                      {JSON.stringify(selectedJob.result, null, 2)}
                    </pre>
                  </div>
                )}

                {selectedJob.error && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground text-red-500">Error</p>
                    <pre className="bg-red-50 p-2 rounded-md text-xs overflow-auto max-h-[100px] text-red-700">
                      {selectedJob.error}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
