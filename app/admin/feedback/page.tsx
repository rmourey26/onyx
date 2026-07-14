import { Suspense } from "react"
import { FeedbackManagement } from "./feedback-management"

export default function AdminFeedbackPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Feedback Management</h1>
        <p className="text-muted-foreground mt-2">Manage customer feedback, bug reports, and feature requests.</p>
      </div>

      <Suspense fallback={<div>Loading feedback reports...</div>}>
        <FeedbackManagement />
      </Suspense>
    </div>
  )
}
