import { AIClient, type AIProvider } from "./ai-client"
import { registerKronovaProprietaryTools } from "./kronova-proprietary-tools"
import { recordTokenUsage } from "@/lib/stripe/metering"

// Define the tool interface
export interface Tool {
  name: string
  description: string
  parameters: {
    type: "object"
    properties: Record<string, any>
    required: string[]
  }
  execute: (params: Record<string, any>) => Promise<any>
}

// Define the agent execution options
export interface AgentExecutionOptions {
  maxIterations?: number
  timeoutMs?: number
  verbose?: boolean
  /** User ID for billing metering. Required to send Stripe meter events. */
  userId?: string
}

// Define the agent execution result
export interface AgentExecutionResult {
  agentId: string
  finalResponse: string
  iterations: number
  toolCalls: Array<{
    tool: string
    params: Record<string, any>
    result: any
  }>
  tokens: {
    prompt: number
    completion: number
    total: number
  }
  elapsedMs: number
}

// Agent system class
export class AgentSystem {
  private supabase: any
  private aiClients: Map<string, AIClient> = new Map()
  private tools: Map<string, Tool> = new Map()

  constructor(supabaseClient?: any) {
    this.supabase = supabaseClient
    this.registerDefaultTools()
  }

  // Register a new tool
  registerTool(tool: Tool): void {
    this.tools.set(tool.name, tool)
  }

  // Register default tools
  private registerDefaultTools(): void {
    try {
      if (this.supabase) {
        const proprietaryTools = registerKronovaProprietaryTools(this.supabase)

        for (const tool of proprietaryTools) {
          this.registerTool(tool)
        }

        console.log("[Agent System] Registered", proprietaryTools.length, "Kronova proprietary tools")
      }
    } catch (error) {
      console.error("[Agent System] Error registering proprietary tools:", error)
      console.error("[Agent System] Continuing without proprietary tools")
    }

    // Web search tool
    this.registerTool({
      name: "web_search",
      description: "Search the web for information",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The search query",
          },
          num_results: {
            type: "integer",
            description: "Number of results to return",
            default: 5,
          },
        },
        required: ["query"],
      },
      execute: async (params) => {
        // Implement web search functionality
        // This is a placeholder - in a real implementation, you would integrate with a search API
        return {
          results: [
            { title: "Example result 1", snippet: "This is an example search result", url: "https://example.com/1" },
            {
              title: "Example result 2",
              snippet: "This is another example search result",
              url: "https://example.com/2",
            },
          ],
        }
      },
    })

    // Database query tool
    this.registerTool({
      name: "query_database",
      description: "Query the database for information",
      parameters: {
        type: "object",
        properties: {
          table: {
            type: "string",
            description: "The table to query",
          },
          query: {
            type: "string",
            description: "The SQL query to execute",
          },
        },
        required: ["table", "query"],
      },
      execute: async (params) => {
        try {
          // Validate the query to prevent SQL injection
          if (!this.isValidQuery(params.query)) {
            throw new Error("Invalid SQL query")
          }

          const { data, error } = await this.supabase.from("execute_safe_query").rpc("execute_safe_query", {
            query_text: params.query,
          })

          if (error) throw error

          return { results: data }
        } catch (error) {
          console.error("Error executing database query:", error)
          return { error: "Failed to execute database query" }
        }
      },
    })

    // Package optimization tool
    this.registerTool({
      name: "optimize_packaging",
      description: "Optimize packaging for a shipment",
      parameters: {
        type: "object",
        properties: {
          items: {
            type: "array",
            description: "The items to be packaged",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                length: { type: "number" },
                width: { type: "number" },
                height: { type: "number" },
                weight: { type: "number" },
              },
            },
          },
          available_packages: {
            type: "array",
            description: "The available package types",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                length: { type: "number" },
                width: { type: "number" },
                height: { type: "number" },
                weight_capacity: { type: "number" },
              },
            },
          },
        },
        required: ["items"],
      },
      execute: async (params) => {
        // Implement package optimization algorithm
        // This is a placeholder - in a real implementation, you would use a bin packing algorithm

        // If no available packages are provided, fetch from the database
        let availablePackages = params.available_packages
        if (!availablePackages || availablePackages.length === 0) {
          const { data, error } = await this.supabase
            .from("reusable_packages")
            .select("id, package_id, dimensions, weight_capacity")
            .eq("status", "available")

          if (error) throw error

          availablePackages = data.map((pkg: any) => ({
            id: pkg.package_id,
            length: pkg.dimensions.length,
            width: pkg.dimensions.width,
            height: pkg.dimensions.height,
            weight_capacity: pkg.weight_capacity,
          }))
        }

        // Simple first-fit algorithm
        const packagingSolution = {
          packages_used: [],
          unassigned_items: [],
        }

        for (const item of params.items) {
          let assigned = false

          for (const pkg of availablePackages) {
            // Check if the item fits in the package
            if (
              item.length <= pkg.length &&
              item.width <= pkg.width &&
              item.height <= pkg.height &&
              item.weight <= pkg.weight_capacity
            ) {
              // Assign the item to this package
              packagingSolution.packages_used.push({
                package_id: pkg.id,
                items: [item.id],
              })

              assigned = true
              break
            }
          }

          if (!assigned) {
            packagingSolution.unassigned_items.push(item.id)
          }
        }

        return packagingSolution
      },
    })

    // Shipping cost estimation tool
    this.registerTool({
      name: "estimate_shipping_cost",
      description: "Estimate the cost of shipping",
      parameters: {
        type: "object",
        properties: {
          origin_zip: {
            type: "string",
            description: "The origin ZIP code",
          },
          destination_zip: {
            type: "string",
            description: "The destination ZIP code",
          },
          weight: {
            type: "number",
            description: "The weight of the package in pounds",
          },
          dimensions: {
            type: "object",
            description: "The dimensions of the package",
            properties: {
              length: { type: "number" },
              width: { type: "number" },
              height: { type: "number" },
            },
          },
          service_level: {
            type: "string",
            description: "The shipping service level",
            enum: ["standard", "expedited", "overnight"],
          },
        },
        required: ["origin_zip", "destination_zip", "weight"],
      },
      execute: async (params) => {
        // Implement shipping cost estimation
        // This is a placeholder - in a real implementation, you would integrate with a shipping API

        const baseRate = 10.0
        const weightRate = 0.5
        const distanceFactor = 0.01

        // Calculate dimensional weight
        let dimensionalWeight = 0
        if (params.dimensions) {
          const { length, width, height } = params.dimensions
          dimensionalWeight = (length * width * height) / 166
        }

        // Use the greater of actual weight and dimensional weight
        const billableWeight = Math.max(params.weight, dimensionalWeight)

        // Calculate distance factor (simplified)
        const originRegion = params.origin_zip.substring(0, 1)
        const destinationRegion = params.destination_zip.substring(0, 1)
        const distance = Math.abs(Number.parseInt(originRegion) - Number.parseInt(destinationRegion)) * 500

        // Calculate service level multiplier
        let serviceMultiplier = 1.0
        switch (params.service_level) {
          case "expedited":
            serviceMultiplier = 1.5
            break
          case "overnight":
            serviceMultiplier = 2.5
            break
        }

        // Calculate the estimated cost
        const estimatedCost = (baseRate + billableWeight * weightRate + distance * distanceFactor) * serviceMultiplier

        return {
          estimated_cost: Number.parseFloat(estimatedCost.toFixed(2)),
          billable_weight: billableWeight,
          distance_miles: distance,
          service_level: params.service_level || "standard",
        }
      },
    })

    // Data analysis tool
    this.registerTool({
      name: "analyze_data",
      description: "Analyze data and generate insights",
      parameters: {
        type: "object",
        properties: {
          data_source: {
            type: "string",
            description: "The source of the data to analyze",
          },
          analysis_type: {
            type: "string",
            description: "The type of analysis to perform",
            enum: ["summary", "trends", "anomalies", "forecast"],
          },
          time_period: {
            type: "string",
            description: "The time period to analyze",
          },
        },
        required: ["data_source", "analysis_type"],
      },
      execute: async (params) => {
        // Implement data analysis
        // This is a placeholder - in a real implementation, you would use data analysis libraries

        try {
          let data

          // Fetch data based on the source
          if (params.data_source === "shipping") {
            const { data: shippingData, error } = await this.supabase
              .from("shipping")
              .select("*")
              .order("shipping_date", { ascending: false })

            if (error) throw error
            data = shippingData
          } else if (params.data_source === "reusable_packages") {
            const { data: packagesData, error } = await this.supabase.from("reusable_packages").select("*")

            if (error) throw error
            data = packagesData
          } else if (params.data_source === "shipping_analytics") {
            const { data: analyticsData, error } = await this.supabase
              .from("shipping_analytics")
              .select("*")
              .order("shipping_day", { ascending: false })

            if (error) throw error
            data = analyticsData
          } else {
            throw new Error(`Unknown data source: ${params.data_source}`)
          }

          // Perform the requested analysis
          let results
          switch (params.analysis_type) {
            case "summary":
              results = this.generateDataSummary(data)
              break
            case "trends":
              results = this.analyzeDataTrends(data, params.time_period)
              break
            case "anomalies":
              results = this.detectAnomalies(data)
              break
            case "forecast":
              results = this.generateForecast(data, params.time_period)
              break
            default:
              throw new Error(`Unknown analysis type: ${params.analysis_type}`)
          }

          return results
        } catch (error) {
          console.error("Error analyzing data:", error)
          return { error: "Failed to analyze data" }
        }
      },
    })

    // Code generation tool
    this.registerTool({
      name: "generate_code",
      description: "Generate code based on a description",
      parameters: {
        type: "object",
        properties: {
          language: {
            type: "string",
            description: "The programming language",
            enum: ["javascript", "typescript", "python", "sql", "html", "css"],
          },
          description: {
            type: "string",
            description: "Description of the code to generate",
          },
          context: {
            type: "string",
            description: "Additional context or requirements",
          },
        },
        required: ["language", "description"],
      },
      execute: async (params) => {
        // For code generation, we'll use the AI model directly
        try {
          const aiClient = await this.getAIClient("openai", "gpt-4o")

          const response = await aiClient.createChatCompletion({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content: `You are an expert ${params.language} developer. Generate clean, efficient, and well-documented code based on the user's description. Include comments explaining key parts of the code.`,
              },
              {
                role: "user",
                content: `Generate ${params.language} code for: ${params.description}\n\nAdditional context: ${params.context || "None"}`,
              },
            ],
            temperature: 0.2,
            max_tokens: 2000,
          })

          return {
            code: response.choices[0].message.content,
            language: params.language,
          }
        } catch (error) {
          console.error("Error generating code:", error)
          return { error: "Failed to generate code" }
        }
      },
    })

    // Data embeddings search tool
    this.registerTool({
      name: "search_embeddings",
      description: "Search for similar documents in the data embeddings",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The search query",
          },
          limit: {
            type: "integer",
            description: "Number of results to return",
            default: 5,
          },
          threshold: {
            type: "number",
            description: "Similarity threshold (0-1)",
            default: 0.7,
          },
        },
        required: ["query"],
      },
      execute: async (params) => {
        try {
          // Get the current user
          const { data: session } = await this.supabase.auth.getSession()
          if (!session?.user) {
            throw new Error("User not authenticated")
          }

          // Generate embedding for the query using OpenAI
          const openaiKey = process.env.OPENAI_API_KEY
          if (!openaiKey) {
            throw new Error("OpenAI API key not found")
          }

          const aiClient = new AIClient("openai", openaiKey, "text-embedding-ada-002")
          const embeddingResponse = await aiClient.createEmbedding({
            model: "text-embedding-ada-002",
            input: params.query,
          })

          const queryEmbedding = embeddingResponse.data[0].embedding

          // Search for similar documents in the database
          const { data, error } = await this.supabase.rpc("match_embeddings", {
            query_embedding: queryEmbedding,
            match_threshold: params.threshold || 0.7,
            match_count: params.limit || 5,
            user_id: session.user.id,
          })

          if (error) {
            console.error("Error searching for similar documents:", error)
            throw error
          }

          // Format the results
          const results = data.map((item: any) => ({
            id: item.id,
            content: item.metadata.content,
            metadata: item.metadata,
            similarity: item.similarity,
          }))

          return { results }
        } catch (error) {
          console.error("Error searching embeddings:", error)
          return { error: "Failed to search embeddings: " + (error instanceof Error ? error.message : String(error)) }
        }
      },
    })

    // Sui blockchain query tool
    this.registerTool({
      name: "query_sui_blockchain",
      description: "Query data from the Sui blockchain",
      parameters: {
        type: "object",
        properties: {
          query_type: {
            type: "string",
            description: "Type of query to perform",
            enum: ["object", "transaction", "address", "nft"],
          },
          id: {
            type: "string",
            description: "ID to query (object ID, transaction ID, address, etc.)",
          },
          options: {
            type: "object",
            description: "Additional query options",
            properties: {
              limit: {
                type: "integer",
                description: "Limit the number of results",
              },
              offset: {
                type: "integer",
                description: "Offset for pagination",
              },
            },
          },
        },
        required: ["query_type", "id"],
      },
      execute: async (params) => {
        try {
          // Import the Sui client
          const { createSuiClient } = await import("@/lib/sui-client")
          const suiClient = createSuiClient()

          let result
          switch (params.query_type) {
            case "object":
              result = await suiClient.getObject({
                id: params.id,
                options: {
                  showContent: true,
                  showOwner: true,
                  showDisplay: true,
                },
              })
              break
            case "transaction":
              result = await suiClient.getTransaction({
                digest: params.id,
                options: {
                  showEffects: true,
                  showEvents: true,
                  showInput: true,
                },
              })
              break
            case "address":
              result = await suiClient.getOwnedObjects({
                owner: params.id,
                options: {
                  showContent: true,
                  showDisplay: true,
                },
                limit: params.options?.limit || 10,
                cursor: params.options?.offset
                  ? { txDigest: "", objectId: "", version: params.options.offset }
                  : undefined,
              })
              break
            case "nft":
              // Query for NFTs owned by the address
              const { data: nfts, error } = await this.supabase
                .from("sui_nfts")
                .select("*")
                .eq("object_id", params.id)
                .limit(1)
                .single()

              if (error) {
                throw error
              }

              // Get the object details from Sui
              const nftObject = await suiClient.getObject({
                id: params.id,
                options: {
                  showContent: true,
                  showOwner: true,
                  showDisplay: true,
                },
              })

              result = {
                database_record: nfts,
                blockchain_data: nftObject,
              }
              break
            default:
              throw new Error(`Unsupported query type: ${params.query_type}`)
          }

          return { result }
        } catch (error) {
          console.error("Error querying Sui blockchain:", error)
          return {
            error: "Failed to query Sui blockchain: " + (error instanceof Error ? error.message : String(error)),
          }
        }
      },
    })

    // NFT analysis tool
    this.registerTool({
      name: "analyze_nfts",
      description: "Analyze NFTs and provide insights",
      parameters: {
        type: "object",
        properties: {
          user_id: {
            type: "string",
            description: "User ID to analyze NFTs for (defaults to current user)",
          },
          analysis_type: {
            type: "string",
            description: "Type of analysis to perform",
            enum: ["ownership", "value", "activity", "metadata"],
          },
        },
        required: ["analysis_type"],
      },
      execute: async (params) => {
        try {
          // Get the current user if user_id not provided
          let userId = params.user_id
          if (!userId) {
            const { data: session } = await this.supabase.auth.getSession()
            if (!session?.user) {
              throw new Error("User not authenticated")
            }
            userId = session.user.id
          }

          // Query NFTs from the database
          const { data: nfts, error } = await this.supabase.from("sui_nfts").select("*").eq("user_id", userId)

          if (error) {
            throw error
          }

          // Perform the requested analysis
          let analysis
          switch (params.analysis_type) {
            case "ownership":
              analysis = {
                total_nfts: nfts.length,
                nfts_by_profile: nfts.reduce((acc: Record<string, number>, nft: any) => {
                  acc[nft.profile_id] = (acc[nft.profile_id] || 0) + 1
                  return acc
                }, {}),
              }
              break
            case "value":
              // This would typically involve external price data
              // For demo purposes, we'll use mock data
              analysis = {
                total_nfts: nfts.length,
                estimated_value: nfts.length * 0.5, // Mock value in SUI tokens
                value_distribution: {
                  low: nfts.filter((_: any, i: number) => i % 3 === 0).length,
                  medium: nfts.filter((_: any, i: number) => i % 3 === 1).length,
                  high: nfts.filter((_: any, i: number) => i % 3 === 2).length,
                },
              }
              break
            case "activity":
              // Sort NFTs by creation date
              const sortedNfts = [...nfts].sort(
                (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
              )

              analysis = {
                total_nfts: nfts.length,
                newest_nft: sortedNfts[0],
                oldest_nft: sortedNfts[sortedNfts.length - 1],
                minting_frequency: {
                  last_7_days: sortedNfts.filter(
                    (nft) => new Date(nft.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                  ).length,
                  last_30_days: sortedNfts.filter(
                    (nft) => new Date(nft.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                  ).length,
                  all_time: sortedNfts.length,
                },
              }
              break
            case "metadata":
              analysis = {
                total_nfts: nfts.length,
                metadata_completeness: nfts.map((nft) => ({
                  id: nft.id,
                  object_id: nft.object_id,
                  completeness: {
                    has_name: !!nft.name,
                    has_description: !!nft.description,
                    has_image: !!nft.image_url,
                    score: [!!nft.name, !!nft.description, !!nft.image_url].filter(Boolean).length / 3,
                  },
                })),
              }
              break
            default:
              throw new Error(`Unsupported analysis type: ${params.analysis_type}`)
          }

          return { analysis }
        } catch (error) {
          console.error("Error analyzing NFTs:", error)
          return { error: "Failed to analyze NFTs: " + (error instanceof Error ? error.message : String(error)) }
        }
      },
    })
  }

  // Helper methods for data analysis
  private generateDataSummary(data: any[]): any {
    // Simple summary statistics
    const summary = {
      count: data.length,
      fields: {},
    }

    if (data.length === 0) {
      return summary
    }

    // Get all fields from the first item
    const fields = Object.keys(data[0])

    // Calculate summary statistics for each field
    for (const field of fields) {
      const values = data.map((item) => item[field]).filter((val) => val !== null && val !== undefined)

      if (values.length === 0) {
        summary.fields[field] = { type: "unknown" }
        continue
      }

      const firstValue = values[0]

      if (typeof firstValue === "number") {
        // Numeric field
        const sum = values.reduce((acc: number, val: number) => acc + val, 0)
        const mean = sum / values.length
        const sortedValues = [...values].sort((a, b) => a - b)
        const min = sortedValues[0]
        const max = sortedValues[sortedValues.length - 1]
        const median = sortedValues[Math.floor(sortedValues.length / 2)]

        summary.fields[field] = {
          type: "numeric",
          count: values.length,
          min,
          max,
          mean,
          median,
          sum,
        }
      } else if (typeof firstValue === "string") {
        // String field
        const valueCounts = values.reduce((acc: Record<string, number>, val: string) => {
          acc[val] = (acc[val] || 0) + 1
          return acc
        }, {})

        const uniqueValues = Object.keys(valueCounts)
        const mostCommon = uniqueValues.reduce((a, b) => (valueCounts[a] > valueCounts[b] ? a : b), uniqueValues[0])

        summary.fields[field] = {
          type: "string",
          count: values.length,
          unique_count: uniqueValues.length,
          most_common: mostCommon,
          most_common_count: valueCounts[mostCommon],
        }
      } else if (firstValue instanceof Date || (typeof firstValue === "string" && !isNaN(Date.parse(firstValue)))) {
        // Date field
        const dates = values.map((val) => (val instanceof Date ? val : new Date(val)))
        const sortedDates = [...dates].sort((a, b) => a.getTime() - b.getTime())
        const min = sortedDates[0]
        const max = sortedDates[sortedDates.length - 1]

        summary.fields[field] = {
          type: "date",
          count: values.length,
          min,
          max,
          range_days: Math.floor((max.getTime() - min.getTime()) / (1000 * 60 * 60 * 24)),
        }
      } else if (typeof firstValue === "boolean") {
        // Boolean field
        const trueCount = values.filter((val) => val === true).length
        const falseCount = values.filter((val) => val === false).length

        summary.fields[field] = {
          type: "boolean",
          count: values.length,
          true_count: trueCount,
          false_count: falseCount,
          true_percentage: (trueCount / values.length) * 100,
        }
      } else if (typeof firstValue === "object") {
        // Object or array field
        summary.fields[field] = {
          type: Array.isArray(firstValue) ? "array" : "object",
          count: values.length,
        }
      }
    }

    return summary
  }

  private analyzeDataTrends(data: any[], timePeriod?: string): any {
    // Find date fields
    const dateFields = Object.keys(data[0]).filter((field) => {
      const value = data[0][field]
      return value instanceof Date || (typeof value === "string" && !isNaN(Date.parse(value)))
    })

    if (dateFields.length === 0) {
      return { error: "No date fields found for trend analysis" }
    }

    // Use the first date field for trend analysis
    const dateField = dateFields[0]

    // Find numeric fields for trend analysis
    const numericFields = Object.keys(data[0]).filter((field) => {
      const value = data[0][field]
      return typeof value === "number"
    })

    if (numericFields.length === 0) {
      return { error: "No numeric fields found for trend analysis" }
    }

    // Group data by time period
    const groupedData: Record<string, any[]> = {}

    for (const item of data) {
      const date = item[dateField] instanceof Date ? item[dateField] : new Date(item[dateField])

      let periodKey
      if (timePeriod === "daily") {
        periodKey = date.toISOString().split("T")[0]
      } else if (timePeriod === "weekly") {
        const startOfWeek = new Date(date)
        startOfWeek.setDate(date.getDate() - date.getDay())
        periodKey = startOfWeek.toISOString().split("T")[0]
      } else if (timePeriod === "monthly") {
        periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      } else if (timePeriod === "quarterly") {
        const quarter = Math.floor(date.getMonth() / 3) + 1
        periodKey = `${date.getFullYear()}-Q${quarter}`
      } else if (timePeriod === "yearly") {
        periodKey = `${date.getFullYear()}`
      } else {
        // Default to monthly
        periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      }

      if (!groupedData[periodKey]) {
        groupedData[periodKey] = []
      }

      groupedData[periodKey].push(item)
    }

    // Calculate trends for each numeric field
    const trends: Record<string, any> = {}

    for (const field of numericFields) {
      trends[field] = {
        by_period: {},
        overall: {
          min: Number.MAX_VALUE,
          max: Number.MIN_VALUE,
          total: 0,
          count: 0,
        },
      }

      // Calculate statistics for each period
      for (const [period, items] of Object.entries(groupedData)) {
        const values = items.map((item) => item[field]).filter((val) => val !== null && val !== undefined)

        if (values.length === 0) continue

        const sum = values.reduce((acc, val) => acc + val, 0)
        const mean = sum / values.length
        const min = Math.min(...values)
        const max = Math.max(...values)

        trends[field].by_period[period] = {
          count: values.length,
          sum,
          mean,
          min,
          max,
        }

        // Update overall statistics
        trends[field].overall.min = Math.min(trends[field].overall.min, min)
        trends[field].overall.max = Math.max(trends[field].overall.max, max)
        trends[field].overall.total += sum
        trends[field].overall.count += values.length
      }

      // Calculate overall mean
      if (trends[field].overall.count > 0) {
        trends[field].overall.mean = trends[field].overall.total / trends[field].overall.count
      }

      // Calculate trend direction and magnitude
      const periods = Object.keys(trends[field].by_period).sort()
      if (periods.length >= 2) {
        const firstPeriod = periods[0]
        const lastPeriod = periods[periods.length - 1]

        const firstValue = trends[field].by_period[firstPeriod].mean
        const lastValue = trends[field].by_period[lastPeriod].mean

        const change = lastValue - firstValue
        const percentChange = (change / firstValue) * 100

        trends[field].trend = {
          direction: change > 0 ? "increasing" : change < 0 ? "decreasing" : "stable",
          change,
          percent_change: percentChange,
          periods_analyzed: periods.length,
        }
      }
    }

    return {
      time_period: timePeriod || "monthly",
      date_field: dateField,
      periods_count: Object.keys(groupedData).length,
      trends,
    }
  }

  private detectAnomalies(data: any[]): any {
    // Find numeric fields for anomaly detection
    const numericFields = Object.keys(data[0]).filter((field) => {
      const value = data[0][field]
      return typeof value === "number"
    })

    if (numericFields.length === 0) {
      return { error: "No numeric fields found for anomaly detection" }
    }

    const anomalies: Record<string, any[]> = {}

    // Detect anomalies using Z-score method
    for (const field of numericFields) {
      const values = data.map((item) => item[field]).filter((val) => val !== null && val !== undefined)

      if (values.length < 5) {
        // Not enough data for meaningful anomaly detection
        continue
      }

      // Calculate mean and standard deviation
      const sum = values.reduce((acc, val) => acc + val, 0)
      const mean = sum / values.length

      const squaredDiffs = values.map((val) => Math.pow(val - mean, 2))
      const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / values.length
      const stdDev = Math.sqrt(variance)

      // Detect anomalies (Z-score > 3 or < -3)
      const threshold = 3

      anomalies[field] = []

      for (let i = 0; i < data.length; i++) {
        const value = data[i][field]

        if (value === null || value === undefined) {
          continue
        }

        const zScore = (value - mean) / stdDev

        if (Math.abs(zScore) > threshold) {
          anomalies[field].push({
            index: i,
            value,
            z_score: zScore,
            direction: zScore > 0 ? "high" : "low",
            item: data[i],
          })
        }
      }
    }

    return {
      method: "z-score",
      threshold: 3,
      fields_analyzed: numericFields.length,
      anomalies,
    }
  }

  private generateForecast(data: any[], timePeriod?: string): any {
    // Find date fields
    const dateFields = Object.keys(data[0]).filter((field) => {
      const value = data[0][field]
      return value instanceof Date || (typeof value === "string" && !isNaN(Date.parse(value)))
    })

    if (dateFields.length === 0) {
      return { error: "No date fields found for forecasting" }
    }

    // Use the first date field for forecasting
    const dateField = dateFields[0]

    // Find numeric fields for forecasting
    const numericFields = Object.keys(data[0]).filter((field) => {
      const value = data[0][field]
      return typeof value === "number"
    })

    if (numericFields.length === 0) {
      return { error: "No numeric fields found for forecasting" }
    }

    // Sort data by date
    const sortedData = [...data].sort((a, b) => {
      const dateA = a[dateField] instanceof Date ? a[dateField] : new Date(a[dateField])
      const dateB = b[dateField] instanceof Date ? b[dateField] : new Date(b[dateField])
      return dateA.getTime() - dateB.getTime()
    })

    // Group data by time period
    const groupedData: Record<string, any[]> = {}

    for (const item of sortedData) {
      const date = item[dateField] instanceof Date ? item[dateField] : new Date(item[dateField])

      let periodKey
      if (timePeriod === "daily") {
        periodKey = date.toISOString().split("T")[0]
      } else if (timePeriod === "weekly") {
        const startOfWeek = new Date(date)
        startOfWeek.setDate(date.getDate() - date.getDay())
        periodKey = startOfWeek.toISOString().split("T")[0]
      } else if (timePeriod === "monthly") {
        periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      } else if (timePeriod === "quarterly") {
        const quarter = Math.floor(date.getMonth() / 3) + 1
        periodKey = `${date.getFullYear()}-Q${quarter}`
      } else if (timePeriod === "yearly") {
        periodKey = `${date.getFullYear()}`
      } else {
        // Default to monthly
        periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      }

      if (!groupedData[periodKey]) {
        groupedData[periodKey] = []
      }

      groupedData[periodKey].push(item)
    }

    // Calculate average values for each period
    const timeSeriesData: Record<string, Record<string, number>> = {}

    for (const [period, items] of Object.entries(groupedData)) {
      timeSeriesData[period] = {}

      for (const field of numericFields) {
        const values = items.map((item) => item[field]).filter((val) => val !== null && val !== undefined)

        if (values.length === 0) continue

        const sum = values.reduce((acc, val) => acc + val, 0)
        const mean = sum / values.length

        timeSeriesData[period][field] = mean
      }
    }

    // Generate forecasts using simple moving average
    const periods = Object.keys(timeSeriesData).sort()
    const windowSize = Math.min(3, periods.length)

    const forecasts: Record<string, any> = {}

    for (const field of numericFields) {
      // Get the time series for this field
      const timeSeries = periods.map((period) => timeSeriesData[period][field]).filter((val) => val !== undefined)

      if (timeSeries.length < windowSize) {
        // Not enough data for forecasting
        continue
      }

      // Calculate the moving average for the last window
      const lastValues = timeSeries.slice(-windowSize)
      const movingAverage = lastValues.reduce((acc, val) => acc + val, 0) / windowSize

      // Calculate the average period-over-period change
      const changes = []
      for (let i = 1; i < timeSeries.length; i++) {
        const change = timeSeries[i] - timeSeries[i - 1]
        changes.push(change)
      }

      const avgChange = changes.reduce((acc, val) => acc + val, 0) / changes.length

      // Generate forecast for the next period
      const lastValue = timeSeries[timeSeries.length - 1]
      const nextValue = lastValue + avgChange

      // Generate forecast for the next 3 periods
      const forecast = [nextValue]
      for (let i = 1; i < 3; i++) {
        forecast.push(forecast[i - 1] + avgChange)
      }

      forecasts[field] = {
        method: "moving_average_with_trend",
        window_size: windowSize,
        last_value: lastValue,
        avg_change: avgChange,
        forecast,
      }
    }

    return {
      time_period: timePeriod || "monthly",
      date_field: dateField,
      periods_analyzed: periods.length,
      forecasts,
    }
  }

  // Validate SQL query to prevent injection
  private isValidQuery(query: string): boolean {
    // Check for dangerous SQL commands
    const dangerousCommands = [
      "DROP",
      "DELETE",
      "TRUNCATE",
      "ALTER",
      "CREATE",
      "INSERT",
      "UPDATE",
      "GRANT",
      "REVOKE",
      "EXECUTE",
      "FUNCTION",
      "PROCEDURE",
    ]

    const normalizedQuery = query.toUpperCase()

    for (const command of dangerousCommands) {
      if (normalizedQuery.includes(command)) {
        return false
      }
    }

    // Only allow SELECT statements
    if (!normalizedQuery.trim().startsWith("SELECT")) {
      return false
    }

    return true
  }

  // Get or create an AI client for a provider
  private async getAIClient(provider: string, model: string): Promise<AIClient> {
    const key = `${provider}:${model}`

    if (this.aiClients.has(key)) {
      return this.aiClients.get(key)!
    }

    // Get the API key for the provider
    let apiKey = ""

    switch (provider) {
      case "openai":
        apiKey = process.env.OPENAI_API_KEY || ""
        break
      case "anthropic":
        apiKey = process.env.ANTHROPIC_API_KEY || ""
        break
      case "mistral":
        apiKey = process.env.MISTRAL_API_KEY || ""
        break
      case "google":
        apiKey = process.env.GOOGLE_API_KEY || ""
        break
      case "meta":
        apiKey = process.env.META_API_KEY || ""
        break
      case "stability":
        apiKey = process.env.STABILITY_API_KEY || ""
        break
      case "local":
        apiKey = "" // No API key needed for local models
        break
      default:
        throw new Error(`Unsupported provider: ${provider}`)
    }

    if (!apiKey && provider !== "local") {
      throw new Error(`API key not found for provider: ${provider}`)
    }

    const aiClient = new AIClient(provider as AIProvider, apiKey, model)
    this.aiClients.set(key, aiClient)

    return aiClient
  }

  // Execute an agent with a user query
  async executeAgent(
    agentId: string,
    query: string,
    options: AgentExecutionOptions = {},
  ): Promise<AgentExecutionResult> {
    const startTime = Date.now()
    const { maxIterations = 3, timeoutMs = 30000, verbose = false, userId } = options
    const executionId = crypto.randomUUID()

    try {
      let agent: any = null

      console.log("[v0] AgentSystem.executeAgent called with agentId:", agentId)
      console.log("[v0] Query:", query)

      // First try to get agent from system template library
      const { data: agentTemplate, error: templateError } = await this.supabase
        .from("system_agent_templates")
        .select("*")
        .eq("id", agentId)
        .maybeSingle()

      console.log("[v0] Template fetch result:", { agentTemplate, templateError })

      if (agentTemplate && !templateError) {
        // Use template as agent configuration
        agent = {
          id: agentTemplate.id,
          name: agentTemplate.name,
          description: agentTemplate.description,
          system_prompt: agentTemplate.system_prompt,
          tools: agentTemplate.tools,
          parameters: agentTemplate.parameters,
          category: agentTemplate.category,
          is_active: true,
        }
        console.log("[v0] Using agent from template:", agent)
      } else {
        // Fallback: try to get agent from user instances
        const { data: userAgent, error: userError } = await this.supabase
          .from("ai_agents")
          .select("*")
          .eq("id", agentId)
          .eq("is_active", true)
          .maybeSingle()

        console.log("[v0] User agent fetch result:", { userAgent, userError })

        if (userError || !userAgent) {
          throw new Error(`Agent not found in template library or user instances: ${agentId}`)
        }

        agent = userAgent
        console.log("[v0] Using agent from user instances:", agent)
      }

      console.log("[v0] Agent system_prompt:", agent.system_prompt)
      console.log("[v0] Agent tools:", agent.tools)
      console.log("[v0] Agent parameters:", agent.parameters)

      // Initialize AI client for the agent's preferred model

      const modelName = agent.parameters?.model || "gpt-4o"

      // Determine provider from model name
      let provider = "openai" // default provider
      if (modelName.includes("claude")) {
        provider = "anthropic"
      } else if (modelName.includes("mistral")) {
        provider = "mistral"
      } else if (modelName.includes("gemini") || modelName.includes("palm")) {
        provider = "google"
      } else if (modelName.includes("llama")) {
        provider = "meta"
      } else if (modelName.includes("stable")) {
        provider = "stability"
      }

      // Use the proper getAIClient method to ensure provider is configured
      const aiClient = await this.getAIClient(provider, modelName)

      const toolCalls: Array<{ tool: string; params: Record<string, any>; result: any }> = []
      let currentQuery = query
      let iterations = 0
      const totalTokens = { prompt: 0, completion: 0, total: 0 }

      while (iterations < maxIterations) {
        iterations++

        if (verbose) {
          console.log(`[AgentSystem] Iteration ${iterations} for agent ${agentId}`)
        }

        // Prepare messages for the AI model
        const messages = [
          { role: "system", content: agent.system_prompt },
          { role: "user", content: currentQuery },
        ]

        console.log("[v0] Messages being sent to AI model:", JSON.stringify(messages, null, 2))

        // Add tool call history to context
        if (toolCalls.length > 0) {
          const toolContext = toolCalls
            .map((tc) => `Tool: ${tc.tool}\nParams: ${JSON.stringify(tc.params)}\nResult: ${JSON.stringify(tc.result)}`)
            .join("\n\n")
          messages.push({ role: "assistant", content: `Previous tool calls:\n${toolContext}` })
        }

        // Generate response
        const response = await aiClient.createChatCompletion({
          model: modelName,
          messages,
          tools: this.getAvailableTools(agent.tools || []),
          ...agent.parameters,
        })

        console.log("[v0] AI response received:", response.choices[0]?.message?.content?.substring(0, 200))

        const responseContent = response.choices[0]?.message?.content || ""
        const toolCallsFromResponse = response.choices[0]?.message?.tool_calls || []

        // Update token usage
        if (response.usage) {
          totalTokens.prompt += response.usage.prompt_tokens || 0
          totalTokens.completion += response.usage.completion_tokens || 0
          totalTokens.total += response.usage.total_tokens || 0
        }

        // Check if the response includes tool calls
        if (toolCallsFromResponse.length > 0) {
          // Execute tool calls
          for (const toolCall of toolCallsFromResponse) {
            const tool = this.tools.get(toolCall.function.name)
            if (tool) {
              try {
                const toolResult = await tool.execute(toolCall.function.arguments)
                toolCalls.push({
                  tool: toolCall.function.name,
                  params: toolCall.function.arguments,
                  result: toolResult,
                })

                if (verbose) {
                  console.log(`[AgentSystem] Executed tool: ${toolCall.function.name}`)
                }
              } catch (toolError) {
                console.error(`[AgentSystem] Tool execution error:`, toolError)
                toolCalls.push({
                  tool: toolCall.function.name,
                  params: toolCall.function.arguments,
                  result: { error: toolError.message },
                })
              }
            }
          }

          // Continue to next iteration to process tool results
          currentQuery = `Based on the tool results, please provide your final response.`
          continue
        }

        // No more tool calls — meter usage and return final response
        if (userId && totalTokens.total > 0) {
          recordTokenUsage({
            userId,
            operationId: executionId,
            operationType: "agent",
            totalTokens: totalTokens.total,
            promptTokens: totalTokens.prompt,
            completionTokens: totalTokens.completion,
            modelId: modelName,
            agentId,
          }).catch((err) => console.error("[AgentSystem] Metering error (non-fatal):", err))
        }

        return {
          agentId,
          finalResponse: responseContent,
          iterations,
          toolCalls,
          tokens: totalTokens,
          elapsedMs: Date.now() - startTime,
        }
      }

      // Max iterations reached — still meter whatever tokens were consumed
      if (userId && totalTokens.total > 0) {
        recordTokenUsage({
          userId,
          operationId: executionId,
          operationType: "agent",
          totalTokens: totalTokens.total,
          promptTokens: totalTokens.prompt,
          completionTokens: totalTokens.completion,
          modelId: modelName,
          agentId,
        }).catch((err) => console.error("[AgentSystem] Metering error (non-fatal):", err))
      }

      return {
        agentId,
        finalResponse: "Maximum iterations reached. Please refine your query or try again.",
        iterations,
        toolCalls,
        tokens: totalTokens,
        elapsedMs: Date.now() - startTime,
      }
    } catch (error) {
      console.error(`[AgentSystem] Error executing agent ${agentId}:`, error)
      throw new Error(`Agent execution failed: ${error.message}`)
    }
  }

  private getAvailableTools(agentTools: string[]): any[] {
    return agentTools
      .map((toolName) => this.tools.get(toolName))
      .filter((tool) => tool !== undefined)
      .map((tool) => ({
        type: "function",
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters,
        },
      }))
  }

  // Execute a workflow
  async executeWorkflow(workflowId: string, userId: string, input: any): Promise<any> {
    // This is a placeholder for the workflow execution logic
    // In a real implementation, you would fetch the workflow from the database and execute its steps

    // For now, we'll just return a mock result
    return {
      workflowId,
      userId,
      input,
      result: "Workflow executed successfully",
      steps_executed: 3,
      elapsed_ms: 1500,
    }
  }
}
