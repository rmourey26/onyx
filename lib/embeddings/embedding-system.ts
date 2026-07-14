import { AIClient } from "../ai/ai-client"
import { createClient } from "@supabase/supabase-js"
import type { DataEmbedding } from "../types/database"

// Define the document interface
export interface Document {
  id: string
  content: string
  metadata?: Record<string, any>
}

// Define the embedding result interface
export interface EmbeddingResult {
  id: string
  embedding: number[]
  metadata: Record<string, any>
}

// Define the search result interface
export interface SearchResult {
  id: string
  content: string
  metadata: Record<string, any>
  similarity: number
}

// Embedding system class
export class EmbeddingSystem {
  private supabase: any
  private aiClient: AIClient
  private embeddingModel: string
  private embeddingDimensions: number

  constructor(supabaseUrl: string, supabaseKey: string, embeddingModel = "text-embedding-ada-002", dimensions = 1536) {
    this.supabase = createClient(supabaseUrl, supabaseKey)
    this.aiClient = new AIClient("openai", process.env.OPENAI_API_KEY || "", embeddingModel)
    this.embeddingModel = embeddingModel
    this.embeddingDimensions = dimensions
  }

  // Create embeddings for documents with batch processing
  async createEmbeddings(
    documents: Document[],
    userId: string,
    name: string,
    description?: string,
  ): Promise<EmbeddingResult[]> {
    const embeddings: EmbeddingResult[] = []
    const batchSize = 50 // Process 50 documents at a time

    // Process documents in batches to avoid overwhelming the API
    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize)

      for (const document of batch) {
        try {
          // Generate embedding
          const embeddingResponse = await this.aiClient.createEmbedding({
            model: this.embeddingModel,
            input: document.content,
          })

          const embedding = embeddingResponse.data[0].embedding

          // Store the embedding in the database
          const { data, error } = await this.supabase
            .from("data_embeddings")
            .insert({
              name,
              description,
              source_type: "document",
              source_id: document.id,
              embedding_model: this.embeddingModel,
              vector_data: embedding,
              metadata: {
                ...document.metadata,
                content: document.content,
                batchIndex: Math.floor(i / batchSize),
              },
              user_id: userId,
            })
            .select()

          if (error) {
            console.error("Error storing embedding:", error)
            throw error
          }

          embeddings.push({
            id: data[0].id,
            embedding,
            metadata: {
              ...document.metadata,
              content: document.content,
            },
          })
        } catch (error) {
          console.error(`Error processing document ${document.id}:`, error)
          // Continue with other documents instead of failing completely
        }
      }

      // Add a small delay between batches to avoid rate limiting
      if (i + batchSize < documents.length) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    }

    return embeddings
  }

  // Search for similar documents
  async searchSimilarDocuments(query: string, userId: string, limit = 5, threshold = 0.7): Promise<SearchResult[]> {
    // Generate embedding for the query
    const embeddingResponse = await this.aiClient.createEmbedding({
      model: this.embeddingModel,
      input: query,
    })

    const queryEmbedding = embeddingResponse.data[0].embedding

    // Search for similar documents in the database
    const { data, error } = await this.supabase.rpc("match_embeddings", {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit,
      user_id: userId,
    })

    if (error) {
      console.error("Error searching for similar documents:", error)
      throw error
    }

    // Format the results
    const results: SearchResult[] = data.map((item: any) => ({
      id: item.id,
      content: item.content,
      metadata: item.metadata,
      similarity: item.similarity,
    }))

    return results
  }

  // Process a document file and create chunks
  async processDocumentFile(
    fileContent: string,
    fileName: string,
    options: {
      chunkSize: number
      chunkOverlap: number
    },
  ): Promise<Document[]> {
    const { chunkSize, chunkOverlap } = options

    // For very large files, use a more memory-efficient chunking approach
    const chunks: Document[] = []
    let startIndex = 0
    let chunkIndex = 0

    // Process in batches to avoid memory issues with very large files
    const batchSize = 1000 // Process 1000 chunks at a time

    while (startIndex < fileContent.length) {
      const endIndex = Math.min(startIndex + chunkSize, fileContent.length)

      // Find a good break point (end of sentence or paragraph) near the end
      let actualEndIndex = endIndex
      if (endIndex < fileContent.length) {
        // Look for sentence endings within the last 100 characters
        const searchStart = Math.max(endIndex - 100, startIndex)
        const searchText = fileContent.substring(searchStart, endIndex + 100)
        const sentenceEnd = searchText.search(/[.!?]\s+/)

        if (sentenceEnd !== -1) {
          actualEndIndex = searchStart + sentenceEnd + 1
        }
      }

      const chunk = fileContent.substring(startIndex, actualEndIndex).trim()

      if (chunk.length > 0) {
        chunks.push({
          id: `${fileName}-chunk-${chunkIndex}`,
          content: chunk,
          metadata: {
            fileName,
            chunkIndex,
            startIndex,
            endIndex: actualEndIndex,
            fileSize: fileContent.length,
          },
        })
        chunkIndex++
      }

      // Move the window, accounting for overlap
      startIndex = actualEndIndex - chunkOverlap

      // Ensure we make progress and don't get stuck
      if (startIndex >= fileContent.length || startIndex <= 0) {
        break
      }

      // Prevent infinite loops
      if (startIndex >= actualEndIndex) {
        startIndex = actualEndIndex
      }
    }

    return chunks
  }

  // Get all embeddings for a user
  async getUserEmbeddings(userId: string): Promise<DataEmbedding[]> {
    const { data, error } = await this.supabase.from("data_embeddings").select("*").eq("user_id", userId)

    if (error) {
      console.error("Error fetching user embeddings:", error)
      throw error
    }

    return data
  }

  // Delete an embedding
  async deleteEmbedding(embeddingId: string, userId: string): Promise<void> {
    const { error } = await this.supabase.from("data_embeddings").delete().eq("id", embeddingId).eq("user_id", userId)

    if (error) {
      console.error("Error deleting embedding:", error)
      throw error
    }
  }

  // Update an embedding
  async updateEmbedding(
    embeddingId: string,
    userId: string,
    updates: { name?: string; description?: string; metadata?: Record<string, any> },
  ): Promise<DataEmbedding> {
    const { data, error } = await this.supabase
      .from("data_embeddings")
      .update(updates)
      .eq("id", embeddingId)
      .eq("user_id", userId)
      .select()

    if (error) {
      console.error("Error updating embedding:", error)
      throw error
    }

    return data[0]
  }

  // Generate embedding for a single text input
  async generateEmbedding(text: string): Promise<number[]> {
    const embeddingResponse = await this.aiClient.createEmbedding({
      model: this.embeddingModel,
      input: text,
    })

    return embeddingResponse.data[0].embedding
  }
}
