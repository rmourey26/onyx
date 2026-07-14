import { createClient } from "@supabase/supabase-js"

export interface BackgroundJob {
  id: string
  type: string
  status: "pending" | "processing" | "completed" | "failed"
  parameters: Record<string, any>
  result?: Record<string, any>
  error?: string
  user_id: string
  created_at: string
  updated_at: string
}

export class JobQueue {
  private supabase: any

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey)
  }

  // Create a new background job
  async createJob(type: string, parameters: Record<string, any>, userId: string): Promise<string> {
    const { data, error } = await this.supabase
      .from("embedding_jobs")
      .insert({
        job_type: type,
        status: "pending",
        parameters,
        user_id: userId,
      })
      .select("id")
      .single()

    if (error) {
      throw new Error(`Failed to create job: ${error.message}`)
    }

    return data.id
  }

  // Trigger background processing
  async triggerProcessing(jobId: string): Promise<void> {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const functionUrl = `${supabaseUrl}/functions/v1/process-database-embeddings`

    // Call the Edge Function asynchronously
    fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ jobId }),
    }).catch((error) => {
      console.error("Failed to trigger background processing:", error)
    })
  }

  // Get job status
  async getJobStatus(jobId: string, userId: string): Promise<BackgroundJob | null> {
    const { data, error } = await this.supabase
      .from("embedding_jobs")
      .select("*")
      .eq("id", jobId)
      .eq("user_id", userId)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return null // Job not found
      }
      throw new Error(`Failed to get job status: ${error.message}`)
    }

    return data
  }

  // Get all jobs for a user
  async getUserJobs(userId: string, limit = 50): Promise<BackgroundJob[]> {
    const { data, error } = await this.supabase
      .from("embedding_jobs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Failed to get user jobs: ${error.message}`)
    }

    return data
  }

  // Cancel a job
  async cancelJob(jobId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from("embedding_jobs")
      .update({
        status: "failed",
        error: "Job cancelled by user",
        result: {
          message: "Job was cancelled",
          cancelledAt: new Date().toISOString(),
        },
      })
      .eq("id", jobId)
      .eq("user_id", userId)
      .eq("status", "pending") // Only cancel pending jobs

    if (error) {
      throw new Error(`Failed to cancel job: ${error.message}`)
    }
  }

  // Retry a failed job
  async retryJob(jobId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from("embedding_jobs")
      .update({
        status: "pending",
        error: null,
        result: {
          message: "Job queued for retry",
          retriedAt: new Date().toISOString(),
        },
      })
      .eq("id", jobId)
      .eq("user_id", userId)
      .eq("status", "failed") // Only retry failed jobs

    if (error) {
      throw new Error(`Failed to retry job: ${error.message}`)
    }

    // Trigger processing again
    await this.triggerProcessing(jobId)
  }
}
