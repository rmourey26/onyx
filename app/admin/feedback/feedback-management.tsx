"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { getFeedbackReports, updateFeedbackStatus } from "@/app/actions/feedback"
import type { FeedbackReportWithId } from "@/lib/schemas/feedback"
import { MessageSquare, Bug, Lightbulb, Calendar, User, Globe, Smartphone } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export function FeedbackManagement() {
  const [reports, setReports] = useState<FeedbackReportWithId[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const { toast } = useToast()

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    setLoading(true)
    const result = await getFeedbackReports()
    if (result.success) {
      setReports(result.data as FeedbackReportWithId[])
    } else {
      toast({
        title: "Error",
        description: "Failed to load feedback reports",
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  const handleStatusUpdate = async (id: string, status: "open" | "in_progress" | "resolved" | "closed") => {
    const result = await updateFeedbackStatus(id, status)
    if (result.success) {
      setReports(reports.map((report) => (report.id === id ? { ...report, status } : report)))
      toast({
        title: "Status updated",
        description: "Feedback status has been updated successfully",
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      })
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "bug":
        return <Bug className="h-4 w-4" />
      case "feature_request":
        return <Lightbulb className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "bug":
        return "destructive"
      case "feature_request":
        return "default"
      default:
        return "secondary"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "destructive"
      case "in_progress":
        return "default"
      case "resolved":
        return "secondary"
      case "closed":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "destructive"
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "secondary"
    }
  }

  const filteredReports = reports.filter((report) => {
    const typeMatch = filter === "all" || report.type === filter
    const statusMatch = statusFilter === "all" || report.status === statusFilter
    return typeMatch && statusMatch
  })

  if (loading) {
    return <div>Loading feedback reports...</div>
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="feedback">Feedback</SelectItem>
            <SelectItem value="bug">Bug Reports</SelectItem>
            <SelectItem value="feature_request">Feature Requests</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={loadReports} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Open</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{reports.filter((r) => r.status === "open").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {reports.filter((r) => r.status === "in_progress").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {reports.filter((r) => r.status === "resolved").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.map((report) => (
          <Card key={report.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(report.type)}
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={getTypeColor(report.type) as any}>{report.type.replace("_", " ")}</Badge>
                    <Badge variant={getStatusColor(report.status) as any}>{report.status.replace("_", " ")}</Badge>
                    <Badge variant={getPriorityColor(report.priority) as any}>{report.priority}</Badge>
                    {report.tags &&
                      report.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={report.status} onValueChange={(value) => handleStatusUpdate(report.id, value as any)}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <CardDescription className="whitespace-pre-wrap">{report.description}</CardDescription>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                </div>
                {report.userId && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    User ID: {report.userId.slice(0, 8)}...
                  </div>
                )}
                {report.pageUrl && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <a
                      href={report.pageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline truncate"
                    >
                      {report.pageUrl}
                    </a>
                  </div>
                )}
                {report.userAgent && (
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    <span className="truncate">{report.userAgent.includes("Mobile") ? "Mobile" : "Desktop"}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No feedback reports found.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
