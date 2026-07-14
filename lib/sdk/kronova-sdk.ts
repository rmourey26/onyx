/**
 * Kronova Enterprise SDK
 * Official TypeScript/JavaScript SDK for the Kronova Platform API
 * (Formerly Resend-It)
 *
 * @version 2.0.0
 * @license MIT
 */

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface KronovaConfig {
  apiKey: string
  baseUrl?: string
  timeout?: number
  retries?: number
  debug?: boolean
}

// Legacy type alias for backward compatibility
export type ResenditConfig = KronovaConfig

export interface ResenditConfig_DEPRECATED {
  apiKey: string
  baseUrl?: string
  timeout?: number
  retries?: number
  debug?: boolean
}

export interface APIResponse<T> {
  success: boolean
  data: T
  error?: string
  meta?: {
    page?: number
    limit?: number
    total?: number
    hasMore?: boolean
  }
}

export interface PaginationParams {
  page?: number
  limit?: number
  offset?: number
}

// Asset Types
export interface Asset {
  id: string
  name: string
  description?: string
  type: "equipment" | "vehicle" | "real_estate" | "inventory" | "other"
  status: "active" | "maintenance" | "retired" | "disposed"
  acquisition_date?: string
  acquisition_cost?: number
  current_value?: number
  location_id?: string
  metadata?: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface CreateAssetInput {
  name: string
  description?: string
  type: Asset["type"]
  status?: Asset["status"]
  acquisition_date?: string
  acquisition_cost?: number
  current_value?: number
  location_id?: string
  metadata?: Record<string, unknown>
}

export interface AssetInsights {
  asset_id: string
  insights: string
  recommendations: string[]
  risk_factors: string[]
  maintenance_predictions?: {
    next_maintenance_date?: string
    estimated_cost?: number
    priority: "low" | "medium" | "high" | "critical"
  }
  generated_at: string
}

// Embedding Types
export interface Embedding {
  id: string
  content: string
  embedding: number[]
  metadata?: Record<string, unknown>
  file_id?: string
  dataset_id?: string
  created_at: string
}

export interface CreateEmbeddingInput {
  content: string
  metadata?: Record<string, unknown>
  dataset_id?: string
}

export interface EmbeddingSearchResult {
  id: string
  content: string
  similarity: number
  metadata?: Record<string, unknown>
}

export interface Dataset {
  id: string
  name: string
  description?: string
  embedding_count: number
  created_at: string
  updated_at: string
}

// Tokenization Types
export interface TokenizedAsset {
  id: string
  asset_id: string
  token_id: string
  blockchain: "sui" | "canton" | "ethereum"
  contract_address?: string
  total_supply: number
  fractionalized: boolean
  fraction_count?: number
  metadata_uri?: string
  status: "pending" | "minted" | "burned"
  created_at: string
}

export interface TokenizeAssetInput {
  asset_id: string
  blockchain?: "sui" | "canton" | "ethereum"
  total_supply?: number
  metadata?: Record<string, unknown>
}

export interface FractionalizeInput {
  token_id: string
  fraction_count: number
  fraction_price?: number
}

// Stablecoin Types
export interface Stablecoin {
  id: string
  name: string
  symbol: string
  decimals: number
  total_supply: string
  backing_type: "usdc" | "multi_collateral" | "algorithmic"
  backing_ratio: number
  status: "active" | "paused" | "deprecated"
  contract_address?: string
  created_at: string
}

export interface CreateStablecoinInput {
  name: string
  symbol: string
  decimals?: number
  backing_type: Stablecoin["backing_type"]
  initial_supply?: string
  compliance_config?: {
    kyc_required: boolean
    whitelist_only: boolean
    max_supply?: string
  }
}

export interface MintStablecoinInput {
  amount: string
  recipient_address: string
  backing_transaction_id?: string
}

export interface BurnStablecoinInput {
  amount: string
  redemption_address?: string
}

export interface TransferStablecoinInput {
  amount: string
  from_address: string
  to_address: string
  memo?: string
}

// Agent Types
export interface Agent {
  id: string
  name: string
  description?: string
  model_id: string
  system_prompt?: string
  temperature: number
  max_tokens: number
  tools: string[]
  status: "active" | "inactive"
  created_at: string
}

export interface ExecuteAgentInput {
  prompt: string
  context?: Record<string, unknown>
  asset_ids?: string[]
  stream?: boolean
}

export interface AgentExecutionResult {
  id: string
  agent_id: string
  prompt: string
  response: string
  tokens_used: number
  execution_time_ms: number
  created_at: string
}

// Workflow Types
export interface Workflow {
  id: string
  name: string
  description?: string
  steps: WorkflowStep[]
  status: "active" | "inactive"
  created_at: string
}

export interface WorkflowStep {
  id: string
  type: "agent" | "condition" | "action" | "delay"
  config: Record<string, unknown>
  next_step_id?: string
}

export interface ExecuteWorkflowInput {
  input_data?: Record<string, unknown>
  asset_ids?: string[]
}

export interface WorkflowExecutionResult {
  id: string
  workflow_id: string
  status: "pending" | "running" | "completed" | "failed"
  results: Record<string, unknown>
  started_at: string
  completed_at?: string
}

// Data Stream Types
export interface DataStreamConfig {
  stream_type: "agents" | "workflows" | "iot-sensors" | "assets"
  filters?: Record<string, unknown>
}

// OAuth Types
export interface OAuthClient {
  client_id: string
  client_name: string
  redirect_uris: string[]
  scopes: string[]
  created_at: string
}

export interface OAuthTokenResponse {
  access_token: string
  token_type: "Bearer"
  expires_in: number
  refresh_token?: string
  scope: string
}

// A2A Protocol Types (Agent2Agent Interoperability)
export interface A2AAgentCard {
  id: string
  agent_id: string
  name: string
  description: string
  capabilities: string[]
  supported_protocols: string[]
  endpoint_url: string
  authentication_method: "api_key" | "oauth2" | "mutual_tls"
  metadata?: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface A2ATask {
  id: string
  task_type: string
  task_description: string
  requester_agent_id: string
  responder_agent_id?: string
  status: "pending" | "accepted" | "in_progress" | "completed" | "failed" | "cancelled"
  priority: "low" | "normal" | "high" | "urgent"
  input_data?: Record<string, unknown>
  result_data?: Record<string, unknown>
  started_at?: string
  completed_at?: string
  created_at: string
}

export interface A2AMessage {
  id: string
  task_id: string
  sender_agent_id: string
  receiver_agent_id: string
  message_type: "request" | "response" | "notification" | "error"
  content: Record<string, unknown>
  protocol_version: string
  created_at: string
}

export interface CreateA2ATaskInput {
  task_type: string
  task_description: string
  responder_agent_id?: string
  priority?: A2ATask["priority"]
  input_data?: Record<string, unknown>
}

export interface SendA2AMessageInput {
  task_id: string
  receiver_agent_id: string
  message_type: A2AMessage["message_type"]
  content: Record<string, unknown>
}

// =============================================================================
// SDK IMPLEMENTATION
// =============================================================================

export class ResenditSDK {
  private config: Required<ResenditConfig>

  // Sub-clients
  public assets: AssetsClient
  public embeddings: EmbeddingsClient
  public datasets: DatasetsClient
  public tokenization: TokenizationClient
  public stablecoins: StablecoinsClient
  public agents: AgentsClient
  public workflows: WorkflowsClient
  public dataStreams: DataStreamsClient
  public oauth: OAuthClient_SDK
  public a2a: A2AClient

  constructor(config: ResenditConfig) {
    this.config = {
      apiKey: config.apiKey,
      baseUrl: config.baseUrl || "https://api.kronova.ai/v1",
      timeout: config.timeout || 30000,
      retries: config.retries || 3,
      debug: config.debug || false,
    }

    // Initialize sub-clients
    this.assets = new AssetsClient(this)
    this.embeddings = new EmbeddingsClient(this)
    this.datasets = new DatasetsClient(this)
    this.tokenization = new TokenizationClient(this)
    this.stablecoins = new StablecoinsClient(this)
    this.agents = new AgentsClient(this)
    this.workflows = new WorkflowsClient(this)
    this.dataStreams = new DataStreamsClient(this)
    this.oauth = new OAuthClient_SDK(this)
    this.a2a = new A2AClient(this)
  }

  /**
   * Make an authenticated API request
   */
  async request<T>(
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    path: string,
    options: {
      body?: unknown
      params?: Record<string, string | number | boolean | undefined>
      headers?: Record<string, string>
    } = {},
  ): Promise<APIResponse<T>> {
    const url = new URL(`${this.config.baseUrl}${path}`)

    // Add query parameters
    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value))
        }
      })
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.config.apiKey}`,
      "Content-Type": "application/json",
      "X-SDK-Version": "2.0.0",
      ...options.headers,
    }

    let lastError: Error | null = null

    for (let attempt = 0; attempt < this.config.retries; attempt++) {
      try {
        if (this.config.debug) {
          console.log(`[ResenditSDK] ${method} ${url.toString()}`)
        }

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

        const response = await fetch(url.toString(), {
          method,
          headers,
          body: options.body ? JSON.stringify(options.body) : undefined,
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        const data = await response.json()

        if (!response.ok) {
          throw new ResenditAPIError(data.error || `HTTP ${response.status}`, response.status, data)
        }

        return data as APIResponse<T>
      } catch (error) {
        lastError = error as Error

        // Don't retry on client errors (4xx)
        if (error instanceof ResenditAPIError && error.status >= 400 && error.status < 500) {
          throw error
        }

        // Wait before retry with exponential backoff
        if (attempt < this.config.retries - 1) {
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000))
        }
      }
    }

    throw lastError || new Error("Request failed after retries")
  }

  /**
   * Get SDK configuration
   */
  getConfig(): Readonly<Required<ResenditConfig>> {
    return { ...this.config }
  }
}

// =============================================================================
// ERROR CLASSES
// =============================================================================

export class KronovaAPIError extends Error {
  public status: number
  public response: unknown

  constructor(message: string, status: number, response?: unknown) {
    super(message)
    this.name = "KronovaAPIError"
    this.status = status
    this.response = response
  }
}

// Legacy error class for backward compatibility
export class ResenditAPIError extends KronovaAPIError {
  constructor(message: string, status: number, response?: unknown) {
    super(message, status, response)
    this.name = "ResenditAPIError"
  }
}

// =============================================================================
// SUB-CLIENTS
// =============================================================================

class AssetsClient {
  constructor(private sdk: ResenditSDK) {}

  async list(params?: PaginationParams): Promise<APIResponse<Asset[]>> {
    return this.sdk.request("GET", "/assets", { params })
  }

  async get(id: string): Promise<APIResponse<Asset>> {
    return this.sdk.request("GET", `/assets/${id}`)
  }

  async create(input: CreateAssetInput): Promise<APIResponse<Asset>> {
    return this.sdk.request("POST", "/assets", { body: input })
  }

  async update(id: string, input: Partial<CreateAssetInput>): Promise<APIResponse<Asset>> {
    return this.sdk.request("PATCH", `/assets/${id}`, { body: input })
  }

  async delete(id: string): Promise<APIResponse<{ deleted: boolean }>> {
    return this.sdk.request("DELETE", `/assets/${id}`)
  }

  async generateInsights(id: string): Promise<APIResponse<AssetInsights>> {
    return this.sdk.request("POST", `/assets/${id}/insights`)
  }
}

class EmbeddingsClient {
  constructor(private sdk: ResenditSDK) {}

  async list(params?: PaginationParams & { dataset_id?: string }): Promise<APIResponse<Embedding[]>> {
    return this.sdk.request("GET", "/embeddings", { params })
  }

  async get(id: string): Promise<APIResponse<Embedding>> {
    return this.sdk.request("GET", `/embeddings/${id}`)
  }

  async create(input: CreateEmbeddingInput): Promise<APIResponse<Embedding>> {
    return this.sdk.request("POST", "/embeddings", { body: input })
  }

  async createBatch(inputs: CreateEmbeddingInput[]): Promise<APIResponse<Embedding[]>> {
    return this.sdk.request("POST", "/embeddings", { body: { embeddings: inputs } })
  }

  async delete(id: string): Promise<APIResponse<{ deleted: boolean }>> {
    return this.sdk.request("DELETE", `/embeddings/${id}`)
  }

  async search(
    query: string,
    options?: {
      dataset_id?: string
      limit?: number
      threshold?: number
    },
  ): Promise<APIResponse<EmbeddingSearchResult[]>> {
    return this.sdk.request("POST", "/embeddings/search", {
      body: { query, ...options },
    })
  }
}

class DatasetsClient {
  constructor(private sdk: ResenditSDK) {}

  async list(params?: PaginationParams): Promise<APIResponse<Dataset[]>> {
    return this.sdk.request("GET", "/datasets", { params })
  }

  async get(id: string): Promise<APIResponse<Dataset>> {
    return this.sdk.request("GET", `/datasets/${id}`)
  }

  async create(input: { name: string; description?: string }): Promise<APIResponse<Dataset>> {
    return this.sdk.request("POST", "/datasets", { body: input })
  }

  async delete(id: string): Promise<APIResponse<{ deleted: boolean }>> {
    return this.sdk.request("DELETE", `/datasets/${id}`)
  }
}

class TokenizationClient {
  constructor(private sdk: ResenditSDK) {}

  async list(params?: PaginationParams): Promise<APIResponse<TokenizedAsset[]>> {
    return this.sdk.request("GET", "/tokenization", { params })
  }

  async get(id: string): Promise<APIResponse<TokenizedAsset>> {
    return this.sdk.request("GET", `/tokenization/${id}`)
  }

  async tokenize(input: TokenizeAssetInput): Promise<APIResponse<TokenizedAsset>> {
    return this.sdk.request("POST", "/tokenization", { body: input })
  }

  async fractionalize(input: FractionalizeInput): Promise<APIResponse<TokenizedAsset>> {
    return this.sdk.request("POST", "/tokenization/fractionalize", { body: input })
  }

  async burn(id: string): Promise<APIResponse<{ burned: boolean }>> {
    return this.sdk.request("DELETE", `/tokenization/${id}`)
  }
}

class StablecoinsClient {
  constructor(private sdk: ResenditSDK) {}

  async list(params?: PaginationParams): Promise<APIResponse<Stablecoin[]>> {
    return this.sdk.request("GET", "/stablecoins", { params })
  }

  async get(id: string): Promise<APIResponse<Stablecoin>> {
    return this.sdk.request("GET", `/stablecoins/${id}`)
  }

  async create(input: CreateStablecoinInput): Promise<APIResponse<Stablecoin>> {
    return this.sdk.request("POST", "/stablecoins", { body: input })
  }

  async mint(
    id: string,
    input: MintStablecoinInput,
  ): Promise<APIResponse<{ transaction_id: string; new_supply: string }>> {
    return this.sdk.request("POST", `/stablecoins/${id}/mint`, { body: input })
  }

  async burn(
    id: string,
    input: BurnStablecoinInput,
  ): Promise<APIResponse<{ transaction_id: string; new_supply: string }>> {
    return this.sdk.request("POST", `/stablecoins/${id}/burn`, { body: input })
  }

  async transfer(id: string, input: TransferStablecoinInput): Promise<APIResponse<{ transaction_id: string }>> {
    return this.sdk.request("POST", `/stablecoins/${id}/transfer`, { body: input })
  }
}

class AgentsClient {
  constructor(private sdk: ResenditSDK) {}

  async list(params?: PaginationParams): Promise<APIResponse<Agent[]>> {
    return this.sdk.request("GET", "/agents", { params })
  }

  async get(id: string): Promise<APIResponse<Agent>> {
    return this.sdk.request("GET", `/agents/${id}`)
  }

  async execute(id: string, input: ExecuteAgentInput): Promise<APIResponse<AgentExecutionResult>> {
    return this.sdk.request("POST", `/agents/${id}/execute`, { body: input })
  }

  async *executeStream(id: string, input: ExecuteAgentInput): AsyncGenerator<string, void, unknown> {
    const config = this.sdk.getConfig()
    const url = `${config.baseUrl}/agents/${id}/execute`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify({ ...input, stream: true }),
    })

    if (!response.ok) {
      throw new ResenditAPIError(`HTTP ${response.status}`, response.status)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error("No response body")
    }

    const decoder = new TextDecoder()
    let buffer = ""

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6)
            if (data === "[DONE]") return
            yield data
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }
}

class WorkflowsClient {
  constructor(private sdk: ResenditSDK) {}

  async list(params?: PaginationParams): Promise<APIResponse<Workflow[]>> {
    return this.sdk.request("GET", "/workflows", { params })
  }

  async get(id: string): Promise<APIResponse<Workflow>> {
    return this.sdk.request("GET", `/workflows/${id}`)
  }

  async execute(id: string, input: ExecuteWorkflowInput): Promise<APIResponse<WorkflowExecutionResult>> {
    return this.sdk.request("POST", `/workflows/${id}/execute`, { body: input })
  }
}

class DataStreamsClient {
  constructor(private sdk: ResenditSDK) {}

  /**
   * Subscribe to real-time data streams using Server-Sent Events
   */
  subscribe(
    config: DataStreamConfig,
    callbacks: {
      onMessage: (data: unknown) => void
      onError?: (error: Error) => void
      onClose?: () => void
    },
  ): { close: () => void } {
    const sdkConfig = this.sdk.getConfig()
    const url = new URL(`${sdkConfig.baseUrl}/data-streams/${config.stream_type}`)
    url.searchParams.set("format", "sse")

    if (config.filters) {
      url.searchParams.set("filters", JSON.stringify(config.filters))
    }

    const eventSource = new EventSource(url.toString(), {
      // Note: EventSource doesn't support custom headers in browsers
      // For authenticated streams, use the polling method or WebSocket
    })

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        callbacks.onMessage(data)
      } catch {
        callbacks.onMessage(event.data)
      }
    }

    eventSource.onerror = () => {
      callbacks.onError?.(new Error("EventSource connection error"))
    }

    return {
      close: () => {
        eventSource.close()
        callbacks.onClose?.()
      },
    }
  }

  /**
   * Poll for data stream updates (for environments that don't support SSE)
   */
  async poll(config: DataStreamConfig): Promise<APIResponse<unknown[]>> {
    return this.sdk.request("GET", `/data-streams/${config.stream_type}`, {
      params: {
        format: "json",
        filters: config.filters ? JSON.stringify(config.filters) : undefined,
      },
    })
  }
}

class OAuthClient_SDK {
  constructor(private sdk: ResenditSDK) {}

  async listClients(): Promise<APIResponse<OAuthClient[]>> {
    return this.sdk.request("GET", "/oauth/clients")
  }

  async createClient(input: {
    client_name: string
    redirect_uris: string[]
    scopes: string[]
  }): Promise<APIResponse<OAuthClient & { client_secret: string }>> {
    return this.sdk.request("POST", "/oauth/clients", { body: input })
  }

  /**
   * Generate authorization URL for OAuth 2.1 flow
   */
  getAuthorizationUrl(params: {
    client_id: string
    redirect_uri: string
    scope: string
    state: string
    code_challenge: string
    code_challenge_method?: "S256"
  }): string {
    const config = this.sdk.getConfig()
    const baseUrl = config.baseUrl.replace("/api/v1", "")
    const url = new URL(`${baseUrl}/api/v1/oauth/authorize`)

    url.searchParams.set("response_type", "code")
    url.searchParams.set("client_id", params.client_id)
    url.searchParams.set("redirect_uri", params.redirect_uri)
    url.searchParams.set("scope", params.scope)
    url.searchParams.set("state", params.state)
    url.searchParams.set("code_challenge", params.code_challenge)
    url.searchParams.set("code_challenge_method", params.code_challenge_method || "S256")

    return url.toString()
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCode(params: {
    code: string
    client_id: string
    client_secret: string
    redirect_uri: string
    code_verifier: string
  }): Promise<APIResponse<OAuthTokenResponse>> {
    return this.sdk.request("POST", "/oauth/token", {
      body: {
        grant_type: "authorization_code",
        ...params,
      },
    })
  }

  /**
   * Refresh access token
   */
  async refreshToken(params: {
    refresh_token: string
    client_id: string
    client_secret: string
  }): Promise<APIResponse<OAuthTokenResponse>> {
    return this.sdk.request("POST", "/oauth/token", {
      body: {
        grant_type: "refresh_token",
        ...params,
      },
    })
  }
}

class A2AClient {
  constructor(private sdk: ResenditSDK) {}

  // Agent Card Management
  async listAgentCards(params?: PaginationParams): Promise<APIResponse<A2AAgentCard[]>> {
    return this.sdk.request("GET", "/a2a/agent-cards", { params })
  }

  async getAgentCard(id: string): Promise<APIResponse<A2AAgentCard>> {
    return this.sdk.request("GET", `/a2a/agent-cards/${id}`)
  }

  async createAgentCard(input: {
    agent_id: string
    name: string
    description: string
    capabilities: string[]
    endpoint_url: string
    authentication_method: A2AAgentCard["authentication_method"]
    metadata?: Record<string, unknown>
  }): Promise<APIResponse<A2AAgentCard>> {
    return this.sdk.request("POST", "/a2a/agent-cards", { body: input })
  }

  async updateAgentCard(
    id: string,
    input: Partial<{
      name: string
      description: string
      capabilities: string[]
      endpoint_url: string
      metadata: Record<string, unknown>
    }>,
  ): Promise<APIResponse<A2AAgentCard>> {
    return this.sdk.request("PATCH", `/a2a/agent-cards/${id}`, { body: input })
  }

  async deleteAgentCard(id: string): Promise<APIResponse<{ deleted: boolean }>> {
    return this.sdk.request("DELETE", `/a2a/agent-cards/${id}`)
  }

  // Task Management
  async listTasks(
    params?: PaginationParams & { status?: A2ATask["status"] },
  ): Promise<APIResponse<A2ATask[]>> {
    return this.sdk.request("GET", "/a2a/tasks", { params })
  }

  async getTask(id: string): Promise<APIResponse<A2ATask>> {
    return this.sdk.request("GET", `/a2a/tasks/${id}`)
  }

  async createTask(input: CreateA2ATaskInput): Promise<APIResponse<A2ATask>> {
    return this.sdk.request("POST", "/a2a/tasks", { body: input })
  }

  async acceptTask(id: string, agentId: string): Promise<APIResponse<A2ATask>> {
    return this.sdk.request("POST", `/a2a/tasks/${id}/accept`, {
      body: { agent_id: agentId },
    })
  }

  async completeTask(
    id: string,
    result: Record<string, unknown>,
  ): Promise<APIResponse<A2ATask>> {
    return this.sdk.request("POST", `/a2a/tasks/${id}/complete`, {
      body: { result_data: result },
    })
  }

  async cancelTask(id: string): Promise<APIResponse<A2ATask>> {
    return this.sdk.request("POST", `/a2a/tasks/${id}/cancel`)
  }

  // Message Management
  async listMessages(
    params?: PaginationParams & { task_id?: string },
  ): Promise<APIResponse<A2AMessage[]>> {
    return this.sdk.request("GET", "/a2a/messages", { params })
  }

  async getMessage(id: string): Promise<APIResponse<A2AMessage>> {
    return this.sdk.request("GET", `/a2a/messages/${id}`)
  }

  async sendMessage(input: SendA2AMessageInput): Promise<APIResponse<A2AMessage>> {
    return this.sdk.request("POST", "/a2a/messages", { body: input })
  }

  // Discovery
  async discoverAgents(params?: {
    capabilities?: string[]
    protocol_version?: string
  }): Promise<APIResponse<A2AAgentCard[]>> {
    return this.sdk.request("GET", "/a2a/discover", { params })
  }

  // Interoperability with external A2A networks
  async connectToExternalAgent(params: {
    external_agent_url: string
    auth_token?: string
    trust_level?: "trusted" | "verified" | "unverified"
  }): Promise<APIResponse<{ connection_id: string; agent_card: A2AAgentCard }>> {
    return this.sdk.request("POST", "/a2a/connect", { body: params })
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

/**
 * Kronova SDK - Primary branded SDK class
 */
export class KronovaSDK extends ResenditSDK {
  constructor(config: KronovaConfig) {
    super(config)
  }
}

/**
 * Create a new Kronova SDK instance
 */
export function createKronovaClient(config: KronovaConfig): KronovaSDK {
  return new KronovaSDK(config)
}

/**
 * Create a new Resend-It SDK instance
 * @deprecated Use createKronovaClient instead. Resend-It has been rebranded to Kronova.
 */
export function createResenditClient(config: ResenditConfig): ResenditSDK {
  return new ResenditSDK(config)
}

// Default export
export default ResenditSDK
