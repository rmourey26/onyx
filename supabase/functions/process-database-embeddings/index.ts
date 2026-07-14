import { createClient } from "@supabase/supabase-js"
import { corsHeaders } from "../_shared/cors.ts"

import { Deno } from "https://deno.land/std@0.168.0/node/global.ts"


export const dynamic = "force-dynamic"
// Database connection utilities
class DatabaseConnector {
  private connectionString: string
  private connectionType: string

  constructor(connectionString: string, connectionType: string) {
    this.connectionString = connectionString
    this.connectionType = connectionType
  }

  async connect() {
    switch (this.connectionType) {
      case "postgresql":
        return await this.connectPostgreSQL()
      case "mysql":
        return await this.connectMySQL()
      default:
        throw new Error(`Unsupported database type: ${this.connectionType}`)
    }
  }

  private async connectPostgreSQL() {
    const { Client } = await import("postgres")
    const client = new Client(this.connectionString)
    await client.connect()
    return client
  }

  private async connectMySQL() {
    const { Client } = await import("mysql")
    const client = await new Client().connect(this.connectionString)
    return client
  }

  async executeQuery(client: any, query: string, batchSize = 1000) {
    const results = []
    let offset = 0
    let hasMore = true

    while (hasMore) {
      const paginatedQuery = this.addPagination(query, offset, batchSize)
      let batchRows = []

      try {
        if (this.connectionType === "postgresql") {
          const pgResult = await client.queryArray(paginatedQuery)
          batchRows = pgResult.rows
        } else if (this.connectionType === "mysql") {
          const mysqlResult = await client.query(paginatedQuery)
          batchRows = Array.isArray(mysqlResult) ? mysqlResult : []
        }

        if (batchRows.length === 0) {
          hasMore = false
        } else {
          results.push(...batchRows)
          offset += batchSize

          if (batchRows.length < batchSize) {
            hasMore = false
          }
        }
      } catch (error) {
        console.error(`Database query error at offset ${offset}:`, error)
        throw new Error(`Database query failed: ${error.message}`)
      }
    }

    return results
  }

  private addPagination(query: string, offset: number, limit: number): string {
    const trimmedQuery = query.trim().replace(/;$/, "")
    return `${trimmedQuery} LIMIT ${limit} OFFSET ${offset}`
  }

  async disconnect(client: any) {
    try {
      if (client && typeof client.end === "function") {
        await client.end()
      } else if (client && typeof client.close === "function") {
        await client.close()
      }
    } catch (error) {
      console.warn("Error disconnecting from database:", error)
    }
  }
}

// Text processing utilities
class TextProcessor {
  static chunkText(text: string, chunkSize: number, overlap: number): string[] {
    const chunks = []
    let start = 0

    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length)
      let actualEnd = end

      if (end < text.length) {
        const searchStart = Math.max(start + Math.floor(chunkSize * 0.5), 0)
        const lastSentence = text.lastIndexOf(".", Math.min(end, text.length - 1))
        const lastNewline = text.lastIndexOf("\n", Math.min(end, text.length - 1))

        if (lastSentence > searchStart && lastSentence < actualEnd) {
          actualEnd = lastSentence + 1
        } else if (lastNewline > searchStart && lastNewline < actualEnd) {
          actualEnd = lastNewline + 1
        }
      }

      const chunk = text.substring(start, actualEnd).trim()
      if (chunk.length > 0) {
        chunks.push(chunk)
      }

      start = Math.max(actualEnd - overlap, start + 1)
      if (start >= text.length || actualEnd === text.length) break
    }

    return chunks
  }

  static extractTextFromRow(row: any[], columns: string[]): string {
    return row
      .map((value, index) => {
        if (value === null || value === undefined) return ""
        const columnName = columns[index] || `column_${index + 1}`
        return `${columnName}: ${String(value)}`
      })
      .filter((text) => text.length > 0)
      .join(" | ")
  }
}

// Embedding generation using modern fetch API
class EmbeddingGenerator {
  private openaiApiKey: string

  constructor(openaiApiKey: string) {
    this.openaiApiKey = openaiApiKey
  }

  async generateEmbedding(text: string, model = "text-embedding-3-small"): Promise<number[]> {
    try {
      const response = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.openaiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: text,
          model: model,
        }),
      })

      if (!response.ok) {
        const errorBody = await response.text()
        console.error("OpenAI API Error:", response.status, response.statusText, errorBody)
        throw new Error(`OpenAI API error: ${response.statusText}`)
      }

      const data = await response.json()
      return data.data[0].embedding
    } catch (error) {
      console.error("Error generating embedding:", error)
      throw error
    }
  }

  async generateBatchEmbeddings(texts: string[], model = "text-embedding-3-small"): Promise<number[][]> {
    const batchSize = 100
    const embeddings: number[][] = []

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize)

      try {
        const response = await fetch("https://api.openai.com/v1/embeddings", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.openaiApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            input: batch,
            model: model,
          }),
        })

        if (!response.ok) {
          const errorBody = await response.text()
          console.error("OpenAI API Batch Error:", response.status, response.statusText, errorBody)
          throw new Error(`OpenAI API error during batch: ${response.statusText}`)
        }

        const data = await response.json()
        embeddings.push(...data.data.map((item: any) => item.embedding))

        // Rate limiting delay
        if (i + batchSize < texts.length) {
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      } catch (error) {
        console.error(`Error processing batch ${i}-${i + batchSize}:`, error)
        throw error
      }
    }

    return embeddings
  }
}

// Main processing function
async function processEmbeddingJob(jobId: string, supabase: any) {
  console.log(`Starting processing for job ${jobId}`)

  try {
    const { data: job, error: jobError } = await supabase.from("embedding_jobs").select("*").eq("id", jobId).single()

    if (jobError || !job) {
      throw new Error(`Failed to fetch job ${jobId}: ${jobError?.message}`)
    }

    const { parameters, user_id } = job
    const {
      connectionId,
      query,
      name,
      description,
      modelId,
      chunkSize = 1000,
      chunkOverlap = 100,
      table_schema,
      table_name,
      selected_columns = [],
    } = parameters

    // Update job status to processing
    await supabase
      .from("embedding_jobs")
      .update({
        status: "processing",
        result: { message: "Starting database connection...", progress: 0 },
      })
      .eq("id", jobId)

    // Get database connection details
    const { data: connection, error: connError } = await supabase
      .from("database_connections")
      .select("*")
      .eq("id", connectionId)
      .eq("user_id", user_id)
      .single()

    if (connError || !connection) {
      throw new Error(`Failed to fetch database connection: ${connError?.message}`)
    }

    // Get embedding model details
    const { data: model, error: modelError } = await supabase.from("ai_models").select("*").eq("id", modelId).single()

    if (modelError || !model) {
      throw new Error(`Failed to fetch embedding model: ${modelError?.message}`)
    }

    // Update progress
    await supabase
      .from("embedding_jobs")
      .update({
        result: { message: "Connecting to database...", progress: 10 },
      })
      .eq("id", jobId)

    // Connect to database
    const effectiveConnectionString = connection.connection_string || buildConnectionString(connection)
    const connector = new DatabaseConnector(effectiveConnectionString, connection.connection_type)
    const dbClient = await connector.connect()

    // Update progress
    await supabase
      .from("embedding_jobs")
      .update({
        result: { message: "Executing query...", progress: 20 },
      })
      .eq("id", jobId)

    // Execute query and get results
    const rows = await connector.executeQuery(dbClient, query)
    console.log(`Retrieved ${rows.length} rows from database for job ${jobId}`)

    if (rows.length === 0) {
      throw new Error("Query returned no results")
    }

    // Update progress
    await supabase
      .from("embedding_jobs")
      .update({
        result: {
          message: `Processing ${rows.length} rows...`,
          progress: 30,
        },
      })
      .eq("id", jobId)

    // Process rows into text chunks
    const allChunks: string[] = []
    const chunkMetadata: any[] = []

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const rowText = TextProcessor.extractTextFromRow(row, selected_columns)

      if (rowText.trim().length > 0) {
        const chunks = TextProcessor.chunkText(rowText, chunkSize, chunkOverlap)

        chunks.forEach((chunk, chunkIndex) => {
          allChunks.push(chunk)
          chunkMetadata.push({
            sourceRowIndex: i,
            chunkIndexInRow: chunkIndex,
            originalRowTextPreview: rowText.substring(0, 200),
            query,
            connectionId,
            table_schema,
            table_name,
          })
        })
      }

      // Update progress periodically
      if (i % 100 === 0 || i === rows.length - 1) {
        const progress = 30 + ((i + 1) / rows.length) * 20
        await supabase
          .from("embedding_jobs")
          .update({
            result: {
              message: `Processed ${i + 1}/${rows.length} rows into ${allChunks.length} chunks...`,
              progress,
            },
          })
          .eq("id", jobId)
      }
    }

    console.log(`Created ${allChunks.length} chunks from ${rows.length} rows for job ${jobId}`)

    if (allChunks.length === 0) {
      throw new Error("No text chunks generated from query results")
    }

    // Update progress
    await supabase
      .from("embedding_jobs")
      .update({
        result: {
          message: `Generating embeddings for ${allChunks.length} chunks...`,
          progress: 50,
        },
      })
      .eq("id", jobId)

    // Generate embeddings - Using global Deno namespace
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY")
    if (!openaiApiKey) {
      throw new Error("OpenAI API key not configured in Edge Function environment variables")
    }

    const embeddingGenerator = new EmbeddingGenerator(openaiApiKey)
    const embeddings = await embeddingGenerator.generateBatchEmbeddings(allChunks, model.model_id)

    // Update progress
    await supabase
      .from("embedding_jobs")
      .update({
        result: {
          message: "Storing embeddings in database...",
          progress: 80,
        },
      })
      .eq("id", jobId)

    // Store embeddings in database
    const embeddingRecords = embeddings.map((embedding, index) => ({
      name: `${name} - Chunk ${index + 1}`,
      description: description || `Generated from database query`,
      source_type: "database_query",
      source_id: connectionId,
      embedding_model_id: model.id,
      vector_data: embedding,
      content: allChunks[index],
      metadata: {
        ...chunkMetadata[index],
        jobId,
        chunkIndexInJob: index,
        totalChunksInJob: allChunks.length,
      },
      user_id: user_id,
    }))

    // Insert embeddings in batches
    const insertBatchSize = 100
    let insertedCount = 0

    for (let i = 0; i < embeddingRecords.length; i += insertBatchSize) {
      const batch = embeddingRecords.slice(i, i + insertBatchSize)

      const { error: insertError } = await supabase.from("data_embeddings").insert(batch)

      if (insertError) {
        console.error("Error inserting embedding batch for job " + jobId + ":", insertError)
        throw new Error(`Failed to store embeddings: ${insertError.message}`)
      }

      insertedCount += batch.length

      // Update progress
      const progress = 80 + (insertedCount / embeddingRecords.length) * 15
      await supabase
        .from("embedding_jobs")
        .update({
          result: {
            message: `Stored ${insertedCount}/${embeddingRecords.length} embeddings...`,
            progress,
          },
        })
        .eq("id", jobId)
    }

    // Disconnect from database
    await connector.disconnect(dbClient)

    // Update job as completed
    await supabase
      .from("embedding_jobs")
      .update({
        status: "completed",
        result: {
          message: "Successfully created embeddings from database",
          progress: 100,
          rowsProcessed: rows.length,
          chunksCreated: allChunks.length,
          embeddingsStored: insertedCount,
          completedAt: new Date().toISOString(),
        },
      })
      .eq("id", jobId)

    console.log(`Job ${jobId} completed successfully`)
  } catch (error: any) {
    console.error(`Job ${jobId} failed:`, error)

    await supabase
      .from("embedding_jobs")
      .update({
        status: "failed",
        error: error.message,
        result: {
          message: `Job failed: ${error.message}`,
          progress: 0,
          failedAt: new Date().toISOString(),
        },
      })
      .eq("id", jobId)

    throw error
  }
}

function buildConnectionString(connection: any): string {
  const { connection_type, host, port, database_name, username, password } = connection

  // Handle environment variable references - Using global Deno namespace
  const effectivePassword = password?.startsWith("ENV_") ? Deno.env.get(password.substring(4)) : password

  if (password?.startsWith("ENV_") && !effectivePassword) {
    console.warn(`Environment variable ${password.substring(4)} not found for database password`)
  }

  switch (connection_type) {
    case "postgresql":
      return `postgresql://${username}:${effectivePassword || ""}@${host}:${port}/${database_name}`
    case "mysql":
      return `mysql://${username}:${effectivePassword || ""}@${host}:${port}/${database_name}`
    default:
      throw new Error(`Unsupported connection type: ${connection_type}`)
  }
}

// Modern Deno 2.x HTTP server
Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    // Using global Deno namespace for environment variables
    const supabaseUrl = Deno.env.get("NEXT_PUBLIC_SUPABASE_URL")
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase URL or Service Role Key not configured")
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const { jobId } = await req.json()

    if (!jobId) {
      throw new Error("Job ID is required in the request body")
    }

    // Process the job
    await processEmbeddingJob(jobId, supabase)

    return new Response(
      JSON.stringify({
        success: true,
        message: "Job processed successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    )
  } catch (error: any) {
    console.error("Edge function error:", error)

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "An unexpected error occurred",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    )
  }
})
