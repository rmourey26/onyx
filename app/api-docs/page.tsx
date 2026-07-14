import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  Book,
  Code2,
  Coins,
  Database,
  FileJson,
  Key,
  Layers,
  Lock,
  Play,
  Server,
  Sparkles,
  Zap,
  Bot,
  Shield,
  Workflow,
  Radio,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { APIPlayground } from "@/components/api-docs/api-playground"

export const metadata: Metadata = {
  title: "API Documentation | Kronova Platform",
  description:
    "Complete API documentation for the Kronova Enterprise Asset Intelligence Platform. Test endpoints, explore SDKs, and integrate AI-powered asset management.",
}

// API Categories with their endpoints
const API_CATEGORIES = [
  {
    id: "assets",
    name: "Asset Intelligence",
    icon: Database,
    description: "Manage assets with AI-powered insights and predictive analytics",
    endpoints: [
      { method: "GET", path: "/assets", description: "List all assets" },
      { method: "POST", path: "/assets", description: "Create new asset" },
      { method: "GET", path: "/assets/{id}", description: "Get asset details" },
      { method: "PATCH", path: "/assets/{id}", description: "Update asset" },
      { method: "DELETE", path: "/assets/{id}", description: "Delete asset" },
      { method: "POST", path: "/assets/{id}/insights", description: "Generate AI insights" },
    ],
  },
  {
    id: "embeddings",
    name: "Embeddings & Search",
    icon: Sparkles,
    description: "Vector embeddings for semantic search and RAG applications",
    endpoints: [
      { method: "GET", path: "/embeddings", description: "List embeddings" },
      { method: "POST", path: "/embeddings", description: "Create embedding" },
      { method: "POST", path: "/embeddings/search", description: "Semantic search" },
      { method: "GET", path: "/datasets", description: "List datasets" },
      { method: "POST", path: "/datasets", description: "Create dataset" },
    ],
  },
  {
    id: "tokenization",
    name: "Asset Tokenization",
    icon: Layers,
    description: "Tokenize real-world assets on Sui and Canton blockchains",
    endpoints: [
      { method: "GET", path: "/tokenization", description: "List tokenized assets" },
      { method: "POST", path: "/tokenization", description: "Tokenize asset" },
      { method: "GET", path: "/tokenization/{id}", description: "Get token details" },
      { method: "POST", path: "/tokenization/fractionalize", description: "Fractionalize token" },
    ],
  },
  {
    id: "stablecoins",
    name: "Private Stablecoins",
    icon: Coins,
    description: "Deploy and manage USDC-backed stablecoins on Canton Network",
    endpoints: [
      { method: "GET", path: "/stablecoins", description: "List stablecoins" },
      { method: "POST", path: "/stablecoins", description: "Deploy stablecoin" },
      { method: "POST", path: "/stablecoins/{id}/mint", description: "Mint tokens" },
      { method: "POST", path: "/stablecoins/{id}/burn", description: "Burn tokens" },
      { method: "POST", path: "/stablecoins/{id}/transfer", description: "Transfer tokens" },
    ],
  },
  {
    id: "agents",
    name: "AI Agents",
    icon: Bot,
    description: "Execute intelligent AI agents for autonomous operations",
    endpoints: [
      { method: "GET", path: "/agents", description: "List agents" },
      { method: "GET", path: "/agents/{id}", description: "Get agent details" },
      { method: "POST", path: "/agents/{id}/execute", description: "Execute agent" },
    ],
  },
  {
    id: "workflows",
    name: "Workflows",
    icon: Workflow,
    description: "Orchestrate multi-step automated business processes",
    endpoints: [
      { method: "GET", path: "/workflows", description: "List workflows" },
      { method: "GET", path: "/workflows/{id}", description: "Get workflow details" },
      { method: "POST", path: "/workflows/{id}/execute", description: "Execute workflow" },
    ],
  },
  {
    id: "datastreams",
    name: "Real-time Data Streams",
    icon: Radio,
    description: "Subscribe to live data feeds via Server-Sent Events",
    endpoints: [
      { method: "GET", path: "/data-streams/agents", description: "Agent execution events" },
      { method: "GET", path: "/data-streams/workflows", description: "Workflow events" },
      { method: "GET", path: "/data-streams/iot-sensors", description: "IoT sensor readings" },
    ],
  },
  {
    id: "oauth",
    name: "OAuth 2.1 / MCP",
    icon: Shield,
    description: "OAuth 2.1 with PKCE for secure third-party integrations",
    endpoints: [
      { method: "GET", path: "/oauth/authorize", description: "Authorization endpoint" },
      { method: "POST", path: "/oauth/token", description: "Token exchange" },
      { method: "GET", path: "/oauth/clients", description: "List OAuth clients" },
      { method: "POST", path: "/oauth/clients", description: "Register OAuth client" },
    ],
  },
  {
    id: "voice",
    name: "Voice Interface",
    icon: Zap,
    description: "Voice-powered asset management with speech-to-text",
    endpoints: [
      { method: "POST", path: "/voice/sessions", description: "Create voice session" },
      { method: "POST", path: "/voice/upload", description: "Upload audio" },
      { method: "POST", path: "/voice/process", description: "Process voice command" },
      { method: "POST", path: "/voice/synthesize", description: "Text-to-speech" },
    ],
  },
]

// SDK Installation options
const SDK_INSTALL = {
  npm: "npm install @kronova/sdk",
  yarn: "yarn add @kronova/sdk",
  pnpm: "pnpm add @kronova/sdk",
}

const QUICK_START_CODE = `import { createKronovaClient } from '@kronova/sdk'

// Initialize the client
const client = createKronovaClient({
  apiKey: process.env.KRONOVA_API_KEY!,
})

// List your assets
const { data: assets } = await client.assets.list()

// Generate AI insights for an asset
const { data: insights } = await client.assets.generateInsights(assets[0].id)

// Semantic search across your knowledge base
const { data: results } = await client.embeddings.search(
  'maintenance procedures for industrial equipment'
)

// Execute an AI agent
const { data: execution } = await client.agents.execute('agent_id', {
  prompt: 'Analyze Q3 maintenance needs and provide recommendations',
  asset_ids: assets.map(a => a.id),
})

console.log(execution.response)`

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="border-b bg-gradient-to-b from-muted/50 to-background">
        <div className="container mx-auto py-16 px-4 max-w-7xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <Badge variant="outline" className="text-sm">
                v2.0 API
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">Kronova API</h1>
              <p className="text-xl text-muted-foreground">
                Enterprise-grade APIs for asset intelligence, AI agents, blockchain tokenization, and private stablecoin
                deployment. Built for scale.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button asChild size="lg">
                  <Link href="#playground">
                    <Play className="mr-2 h-4 w-4" />
                    Try in Playground
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/dashboard/api-keys">
                    <Key className="mr-2 h-4 w-4" />
                    Get API Key
                  </Link>
                </Button>
              </div>
            </div>
            <div className="lg:w-[400px]">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Quick Install</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {Object.entries(SDK_INSTALL).map(([pkg, cmd]) => (
                    <div key={pkg} className="flex items-center gap-2">
                      <Badge variant="secondary" className="w-12 justify-center text-xs">
                        {pkg}
                      </Badge>
                      <code className="flex-1 text-sm bg-muted px-2 py-1 rounded">{cmd}</code>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto py-12 px-4 max-w-7xl">
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent p-0">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Book className="mr-2 h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="playground"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Play className="mr-2 h-4 w-4" />
              Playground
            </TabsTrigger>
            <TabsTrigger
              value="reference"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Code2 className="mr-2 h-4 w-4" />
              Reference
            </TabsTrigger>
            <TabsTrigger
              value="sdk"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <FileJson className="mr-2 h-4 w-4" />
              SDK
            </TabsTrigger>
            <TabsTrigger
              value="authentication"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Lock className="mr-2 h-4 w-4" />
              Auth
            </TabsTrigger>
            <TabsTrigger
              value="edge-functions"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Server className="mr-2 h-4 w-4" />
              Edge Functions
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold">28+</div>
                  <p className="text-sm text-muted-foreground">API Endpoints</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold">9</div>
                  <p className="text-sm text-muted-foreground">Edge Functions</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold">18</div>
                  <p className="text-sm text-muted-foreground">AI Tools</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold">99.9%</div>
                  <p className="text-sm text-muted-foreground">Uptime SLA</p>
                </CardContent>
              </Card>
            </div>

            {/* API Categories */}
            <div>
              <h2 className="text-2xl font-bold mb-6">API Categories</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {API_CATEGORIES.map((category) => (
                  <Card key={category.id} className="hover:border-primary/50 transition-colors">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <category.icon className="h-5 w-5 text-primary" />
                        </div>
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                      </div>
                      <CardDescription>{category.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1">
                        {category.endpoints.slice(0, 4).map((endpoint, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <Badge
                              variant="outline"
                              className={`text-xs font-mono w-14 justify-center ${
                                endpoint.method === "GET"
                                  ? "border-green-500 text-green-600"
                                  : endpoint.method === "POST"
                                    ? "border-blue-500 text-blue-600"
                                    : endpoint.method === "PATCH"
                                      ? "border-orange-500 text-orange-600"
                                      : "border-red-500 text-red-600"
                              }`}
                            >
                              {endpoint.method}
                            </Badge>
                            <code className="text-xs text-muted-foreground truncate">{endpoint.path}</code>
                          </div>
                        ))}
                        {category.endpoints.length > 4 && (
                          <p className="text-xs text-muted-foreground pt-1">
                            +{category.endpoints.length - 4} more endpoints
                          </p>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="ghost" className="w-full" asChild>
                        <Link href={`#${category.id}`}>
                          View Documentation
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>

            {/* Quick Start */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Quick Start</h2>
              <Card>
                <CardHeader>
                  <CardTitle>Get started in 5 minutes</CardTitle>
                  <CardDescription>Install the SDK and start making API calls</CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="bg-zinc-950 text-zinc-50 p-4 rounded-lg text-sm overflow-x-auto">
                    {QUICK_START_CODE}
                  </pre>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Playground Tab */}
          <TabsContent value="playground" id="playground" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">API Playground</h2>
              <p className="text-muted-foreground mb-6">
                Test API endpoints directly in your browser. Enter your API key to make live requests.
              </p>
            </div>
            <APIPlayground />
          </TabsContent>

          {/* Reference Tab */}
          <TabsContent value="reference" className="space-y-8">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">API Reference</h2>
                <Button variant="outline" asChild>
                  <a href="/api/openapi.json" download>
                    <FileJson className="mr-2 h-4 w-4" />
                    Download OpenAPI Spec
                  </a>
                </Button>
              </div>

              {API_CATEGORIES.map((category) => (
                <Card key={category.id} id={category.id}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <category.icon className="h-5 w-5 text-primary" />
                      <CardTitle>{category.name}</CardTitle>
                    </div>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-muted">
                          <tr>
                            <th className="px-4 py-2 text-left w-20">Method</th>
                            <th className="px-4 py-2 text-left">Endpoint</th>
                            <th className="px-4 py-2 text-left">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {category.endpoints.map((endpoint, i) => (
                            <tr key={i} className="border-t hover:bg-muted/50">
                              <td className="px-4 py-2">
                                <Badge
                                  variant="outline"
                                  className={`font-mono ${
                                    endpoint.method === "GET"
                                      ? "border-green-500 text-green-600"
                                      : endpoint.method === "POST"
                                        ? "border-blue-500 text-blue-600"
                                        : endpoint.method === "PATCH"
                                          ? "border-orange-500 text-orange-600"
                                          : "border-red-500 text-red-600"
                                  }`}
                                >
                                  {endpoint.method}
                                </Badge>
                              </td>
                              <td className="px-4 py-2">
                                <code className="text-sm">/api/v1{endpoint.path}</code>
                              </td>
                              <td className="px-4 py-2 text-muted-foreground">{endpoint.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* SDK Tab */}
          <TabsContent value="sdk" className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">Official SDK</h2>
              <p className="text-muted-foreground mb-6">
                The Kronova SDK provides type-safe access to all API endpoints with built-in retry logic, streaming
                support, and comprehensive TypeScript definitions.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>TypeScript/JavaScript</CardTitle>
                  <CardDescription>Full-featured SDK for Node.js and browsers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Installation</p>
                    <pre className="bg-zinc-950 text-zinc-50 p-3 rounded text-sm">npm install @kronova/sdk</pre>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Features</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>- Full TypeScript support with type definitions</li>
                      <li>- Automatic retry with exponential backoff</li>
                      <li>- Streaming responses for AI agents</li>
                      <li>- Server-Sent Events for data streams</li>
                      <li>- OAuth 2.1 PKCE helper utilities</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Python (Coming Soon)</CardTitle>
                  <CardDescription>Native Python SDK for data science workflows</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Installation</p>
                    <pre className="bg-zinc-950 text-zinc-50 p-3 rounded text-sm">pip install kronova</pre>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Features</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>- Async/await support</li>
                      <li>- Pandas DataFrame integration</li>
                      <li>- Jupyter notebook friendly</li>
                      <li>- Type hints with Pydantic</li>
                    </ul>
                  </div>
                </CardContent>
                <CardFooter>
                  <Badge variant="secondary">Coming Q2 2025</Badge>
                </CardFooter>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>SDK Examples</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="assets">
                  <TabsList>
                    <TabsTrigger value="assets">Assets</TabsTrigger>
                    <TabsTrigger value="embeddings">Embeddings</TabsTrigger>
                    <TabsTrigger value="agents">AI Agents</TabsTrigger>
                    <TabsTrigger value="streams">Data Streams</TabsTrigger>
                  </TabsList>
                  <TabsContent value="assets">
                    <pre className="bg-zinc-950 text-zinc-50 p-4 rounded-lg text-sm overflow-x-auto mt-4">
                      {`// Create an asset and generate AI insights
const { data: asset } = await client.assets.create({
  name: 'Industrial Robot Arm',
  type: 'equipment',
  acquisition_cost: 150000,
  metadata: {
    model: 'FANUC R-2000iC',
    serial: 'FR2000-12345'
  }
})

const { data: insights } = await client.assets.generateInsights(asset.id)
console.log(insights.recommendations)`}
                    </pre>
                  </TabsContent>
                  <TabsContent value="embeddings">
                    <pre className="bg-zinc-950 text-zinc-50 p-4 rounded-lg text-sm overflow-x-auto mt-4">
                      {`// Create embeddings and perform semantic search
await client.embeddings.create({
  content: 'Maintenance procedure for hydraulic systems...',
  dataset_id: 'ds_maintenance',
  metadata: { category: 'hydraulics', version: '2.0' }
})

const { data: results } = await client.embeddings.search(
  'how to maintain hydraulic pumps',
  { dataset_id: 'ds_maintenance', limit: 5 }
)

results.forEach(r => console.log(r.similarity, r.content))`}
                    </pre>
                  </TabsContent>
                  <TabsContent value="agents">
                    <pre className="bg-zinc-950 text-zinc-50 p-4 rounded-lg text-sm overflow-x-auto mt-4">
                      {`// Execute an AI agent with streaming
const stream = client.agents.executeStream('agt_analyzer', {
  prompt: 'Analyze all equipment maintenance patterns',
  asset_ids: ['ast_001', 'ast_002', 'ast_003']
})

for await (const chunk of stream) {
  process.stdout.write(chunk)
}`}
                    </pre>
                  </TabsContent>
                  <TabsContent value="streams">
                    <pre className="bg-zinc-950 text-zinc-50 p-4 rounded-lg text-sm overflow-x-auto mt-4">
                      {`// Subscribe to real-time IoT sensor data
const subscription = client.dataStreams.subscribe(
  { stream_type: 'iot-sensors' },
  {
    onMessage: (data) => {
      console.log('Sensor reading:', data)
      if (data.reading.temperature > 80) {
        triggerAlert(data.sensor_id)
      }
    },
    onError: (err) => console.error('Stream error:', err)
  }
)

// Later: subscription.close()`}
                    </pre>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Authentication Tab */}
          <TabsContent value="authentication" className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">Authentication</h2>
              <p className="text-muted-foreground mb-6">
                Secure your API requests using API keys or OAuth 2.1 with PKCE for third-party integrations.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    API Key Authentication
                  </CardTitle>
                  <CardDescription>Best for server-to-server integrations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">Include your API key in the Authorization header:</p>
                  <pre className="bg-zinc-950 text-zinc-50 p-3 rounded text-sm">Authorization: Bearer sk_live_...</pre>
                  <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">Security Best Practices</p>
                    <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-1 space-y-1">
                      <li>- Never expose API keys in client-side code</li>
                      <li>- Use environment variables for storage</li>
                      <li>- Rotate keys regularly</li>
                      <li>- Use scoped keys with minimal permissions</li>
                    </ul>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href="/dashboard/api-keys">
                      Manage API Keys
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    OAuth 2.1 with PKCE
                  </CardTitle>
                  <CardDescription>Best for third-party app integrations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">
                    OAuth 2.1 flow with Proof Key for Code Exchange (PKCE) for secure authorization:
                  </p>
                  <ol className="text-sm space-y-2">
                    <li className="flex gap-2">
                      <span className="font-bold">1.</span>
                      Generate code verifier and challenge
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold">2.</span>
                      Redirect to /oauth/authorize
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold">3.</span>
                      Exchange code for tokens at /oauth/token
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold">4.</span>
                      Use access token for API requests
                    </li>
                  </ol>
                  <p className="text-sm text-muted-foreground">
                    Compatible with Model Context Protocol (MCP) for AI integrations.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" asChild className="w-full bg-transparent">
                    <Link href="/dashboard/oauth-clients">
                      Manage OAuth Clients
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>API Key Scopes</CardTitle>
                <CardDescription>Create scoped API keys with specific permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { scope: "assets:read", description: "Read asset data" },
                    { scope: "assets:write", description: "Create/update assets" },
                    { scope: "embeddings:read", description: "Search embeddings" },
                    { scope: "embeddings:write", description: "Create embeddings" },
                    { scope: "agents:execute", description: "Execute AI agents" },
                    { scope: "workflows:execute", description: "Run workflows" },
                    { scope: "tokenization:read", description: "View tokens" },
                    { scope: "tokenization:write", description: "Create/manage tokens" },
                    { scope: "stablecoins:read", description: "View stablecoins" },
                    { scope: "stablecoins:write", description: "Deploy stablecoins" },
                    { scope: "stablecoins:mint", description: "Mint/burn tokens" },
                    { scope: "datastreams:read", description: "Subscribe to streams" },
                  ].map(({ scope, description }) => (
                    <div key={scope} className="flex items-center gap-2 p-2 border rounded">
                      <Badge variant="secondary" className="font-mono text-xs">
                        {scope}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{description}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Edge Functions Tab */}
          <TabsContent value="edge-functions" className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">Supabase Edge Functions</h2>
              <p className="text-muted-foreground mb-6">
                Serverless functions deployed on Supabase&apos;s global edge network for low-latency execution.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  name: "execute-agent",
                  description: "Execute AI agents with context injection",
                  path: "/functions/v1/execute-agent",
                },
                {
                  name: "execute-workflow",
                  description: "Run multi-step automated workflows",
                  path: "/functions/v1/execute-workflow",
                },
                {
                  name: "process-embeddings",
                  description: "Generate vector embeddings for content",
                  path: "/functions/v1/process-embeddings",
                },
                {
                  name: "process-database-embeddings",
                  description: "Batch process database records",
                  path: "/functions/v1/process-database-embeddings",
                },
                {
                  name: "tokenize-asset",
                  description: "Mint blockchain tokens for assets",
                  path: "/functions/v1/tokenize-asset",
                },
                {
                  name: "stablecoin-operations",
                  description: "Mint/burn private stablecoins",
                  path: "/functions/v1/stablecoin-operations",
                },
                {
                  name: "oauth-introspect",
                  description: "Validate OAuth tokens",
                  path: "/functions/v1/oauth-introspect",
                },
                {
                  name: "voice-websocket",
                  description: "Real-time voice processing",
                  path: "/functions/v1/voice-websocket",
                },
                {
                  name: "voice-websocket-aethernet",
                  description: "Voice with AetherNet integration",
                  path: "/functions/v1/voice-websocket-aethernet",
                },
              ].map((fn) => (
                <Card key={fn.name}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-mono">{fn.name}</CardTitle>
                    <CardDescription className="text-sm">{fn.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <code className="text-xs text-muted-foreground">{fn.path}</code>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Invoking Edge Functions</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-zinc-950 text-zinc-50 p-4 rounded-lg text-sm overflow-x-auto">
                  {`// Using Supabase client
const { data, error } = await supabase.functions.invoke('execute-agent', {
  body: {
    agentId: 'agt_xyz123',
    prompt: 'Analyze maintenance schedules',
    assetIds: ['ast_001', 'ast_002']
  }
})

// Using fetch directly
const response = await fetch(
  'https://qcbllcvbwfykbaxzcrwe.supabase.co/functions/v1/execute-agent',
  {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${accessToken}\`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      agentId: 'agt_xyz123',
      prompt: 'Analyze maintenance schedules'
    })
  }
)`}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer CTA */}
      <div className="border-t bg-muted/30">
        <div className="container mx-auto py-12 px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold">Ready to get started?</h3>
              <p className="text-muted-foreground">Create your API key and start building with Resend-It today.</p>
            </div>
            <div className="flex gap-3">
              <Button asChild>
                <Link href="/dashboard/api-keys">
                  <Key className="mr-2 h-4 w-4" />
                  Get API Key
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/contact">Contact Sales</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
