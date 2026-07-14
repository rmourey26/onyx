import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  InfoIcon,
  AlertTriangle,
  CheckCircle,
  Code,
  GitBranch,
  Database,
  Truck,
  MessageSquare,
  BarChart,
} from "lucide-react"

export function ApiWorkflowGuide() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">AI Workflow System</h2>
        <p className="text-muted-foreground">
          The Resendit-It AI Workflow System allows you to create, manage, and execute complex AI-powered workflows that
          integrate multiple components of the platform.
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="creation">Creating Workflows</TabsTrigger>
          <TabsTrigger value="steps">Step Types</TabsTrigger>
          <TabsTrigger value="execution">Execution</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>What are AI Workflows?</CardTitle>
              <CardDescription>
                AI Workflows allow you to automate complex processes by connecting multiple AI capabilities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The Resendit-It AI Workflow System is a powerful orchestration engine that allows you to create
                multi-step processes combining various AI capabilities, data operations, and business logic. Workflows
                enable you to automate complex tasks that would otherwise require multiple manual steps.
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <GitBranch className="h-5 w-5" />
                    Key Features
                  </h3>
                  <ul className="mt-2 space-y-1 list-disc list-inside text-sm">
                    <li>Connect multiple AI capabilities in sequence</li>
                    <li>Pass data between workflow steps</li>
                    <li>Conditional branching based on step results</li>
                    <li>Integration with database operations</li>
                    <li>Support for custom functions and external APIs</li>
                    <li>Monitoring and history of workflow executions</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Benefits
                  </h3>
                  <ul className="mt-2 space-y-1 list-disc list-inside text-sm">
                    <li>Automate complex business processes</li>
                    <li>Reduce manual intervention in AI operations</li>
                    <li>Create reusable templates for common tasks</li>
                    <li>Ensure consistent execution of multi-step processes</li>
                    <li>Track and audit AI operations</li>
                    <li>Scale AI capabilities across your organization</li>
                  </ul>
                </div>
              </div>

              <Alert>
                <InfoIcon className="h-4 w-4" />
                <AlertTitle>Workflow System Architecture</AlertTitle>
                <AlertDescription>
                  The Workflow System is built on a flexible architecture that allows for extensibility and integration
                  with various components of the Resendit-It platform. Workflows are stored in the database and can be
                  executed on-demand or triggered by events.
                </AlertDescription>
              </Alert>

              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg">Core Concepts</h3>
                <div className="mt-2 space-y-3">
                  <div>
                    <h4 className="font-medium">Workflow</h4>
                    <p className="text-sm text-muted-foreground">
                      A workflow is a collection of steps that are executed in a defined order, with data flowing
                      between them. Each workflow has a unique ID, name, description, and belongs to a user.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">Step</h4>
                    <p className="text-sm text-muted-foreground">
                      A step is a single operation within a workflow, such as executing an AI agent, performing a
                      database query, or calling an external API. Steps have inputs, outputs, and can be connected to
                      other steps.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">Context</h4>
                    <p className="text-sm text-muted-foreground">
                      The workflow context is a data structure that maintains the state of the workflow execution,
                      including input data, results from each step, and metadata about the execution.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">Conditions</h4>
                    <p className="text-sm text-muted-foreground">
                      Conditions allow for branching logic in workflows, where the next step is determined based on the
                      results of the current step.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="creation" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Creating and Managing Workflows</CardTitle>
              <CardDescription>Learn how to create, update, and manage workflows through the API</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Creating a Workflow</h3>
                <p>
                  Workflows can be created using the API or through the AI Business Suite interface. A workflow consists
                  of a name, description, and a collection of steps.
                </p>

                <div className="bg-muted rounded-md p-4">
                  <h4 className="text-sm font-medium mb-2">API Endpoint</h4>
                  <code className="text-xs bg-black text-white p-2 rounded block">POST /api/v1/workflows</code>
                  <h4 className="text-sm font-medium mt-4 mb-2">Request Body</h4>
                  <pre className="text-xs bg-black text-white p-2 rounded overflow-auto">
                    {`{
  "name": "Customer Onboarding Workflow",
  "description": "Process new customer data and set up their account",
  "steps": [
    {
      "id": "extract_data",
      "type": "agent",
      "name": "Extract Customer Data",
      "config": {
        "agent_id": "data_extraction_agent",
        "query": "Extract structured data from this customer information: \${input.customer_info}",
        "max_iterations": 3,
        "timeout_ms": 30000
      },
      "next_steps": ["validate_data"]
    },
    {
      "id": "validate_data",
      "type": "custom",
      "name": "Validate Customer Data",
      "config": {
        "function_name": "transform_data",
        "parameters": {
          "data": "\${extract_data.extracted_data}",
          "transformations": [
            {
              "type": "filter",
              "config": {
                "field": "email",
                "operator": "contains",
                "value": "@"
              }
            }
          ]
        }
      },
      "next_steps": ["create_account", "send_error"],
      "condition": {
        "field": "valid",
        "operator": "==",
        "value": true
      }
    },
    {
      "id": "create_account",
      "type": "custom",
      "name": "Create Customer Account",
      "config": {
        "function_name": "save_data",
        "parameters": {
          "destination": "supabase",
          "table": "customers",
          "operation": "insert",
          "data": "\${validate_data.result}"
        }
      },
      "next_steps": []
    },
    {
      "id": "send_error",
      "type": "agent",
      "name": "Send Error Notification",
      "config": {
        "agent_id": "notification_agent",
        "query": "Generate an error email for invalid customer data: \${validate_data.errors}",
        "max_iterations": 1,
        "timeout_ms": 10000
      },
      "next_steps": []
    }
  ],
  "trigger_type": "manual",
  "trigger_config": {},
  "is_active": true
}`}
                  </pre>
                </div>

                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Important</AlertTitle>
                  <AlertDescription>
                    Each step must have a unique ID within the workflow. The first step should not be referenced in any
                    other step's next_steps array.
                  </AlertDescription>
                </Alert>

                <h3 className="text-lg font-medium mt-6">Updating a Workflow</h3>
                <p>Existing workflows can be updated to modify their steps, name, description, or active status.</p>

                <div className="bg-muted rounded-md p-4">
                  <h4 className="text-sm font-medium mb-2">API Endpoint</h4>
                  <code className="text-xs bg-black text-white p-2 rounded block">
                    PUT /api/v1/workflows/{"{workflow_id}"}
                  </code>
                  <h4 className="text-sm font-medium mt-4 mb-2">Request Body</h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    Include the fields you want to update. The structure is the same as the creation endpoint.
                  </p>
                </div>

                <h3 className="text-lg font-medium mt-6">Deleting a Workflow</h3>
                <div className="bg-muted rounded-md p-4">
                  <h4 className="text-sm font-medium mb-2">API Endpoint</h4>
                  <code className="text-xs bg-black text-white p-2 rounded block">
                    DELETE /api/v1/workflows/{"{workflow_id}"}
                  </code>
                </div>

                <h3 className="text-lg font-medium mt-6">Listing Workflows</h3>
                <div className="bg-muted rounded-md p-4">
                  <h4 className="text-sm font-medium mb-2">API Endpoint</h4>
                  <code className="text-xs bg-black text-white p-2 rounded block">GET /api/v1/workflows</code>
                </div>

                <h3 className="text-lg font-medium mt-6">Getting a Specific Workflow</h3>
                <div className="bg-muted rounded-md p-4">
                  <h4 className="text-sm font-medium mb-2">API Endpoint</h4>
                  <code className="text-xs bg-black text-white p-2 rounded block">
                    GET /api/v1/workflows/{"{workflow_id}"}
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="steps" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Step Types</CardTitle>
              <CardDescription>Explore the different types of steps available for building workflows</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <p>
                The Workflow System supports various step types, each designed for specific operations. Steps are
                connected through their next_steps property, which defines the flow of execution.
              </p>

              <div className="space-y-6">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="h-5 w-5 text-blue-500" />
                    <h3 className="font-semibold text-lg">Agent Step</h3>
                    <Badge variant="outline">agent</Badge>
                  </div>
                  <p className="text-sm mb-3">
                    Executes an AI agent with a specified query and returns the agent's response. Useful for natural
                    language processing, content generation, and decision making.
                  </p>
                  <div className="bg-muted rounded-md p-3">
                    <h4 className="text-xs font-medium mb-1">Configuration Options</h4>
                    <pre className="text-xs overflow-auto">
                      {`{
  "agent_id": "string",       // ID of the agent to execute
  "query": "string",          // Query to send to the agent
  "max_iterations": number,   // Maximum number of iterations
  "timeout_ms": number        // Timeout in milliseconds
}`}
                    </pre>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Database className="h-5 w-5 text-purple-500" />
                    <h3 className="font-semibold text-lg">Embedding Step</h3>
                    <Badge variant="outline">embedding</Badge>
                  </div>
                  <p className="text-sm mb-3">
                    Creates or searches vector embeddings for semantic similarity. Useful for document retrieval,
                    similarity search, and knowledge base operations.
                  </p>
                  <div className="bg-muted rounded-md p-3">
                    <h4 className="text-xs font-medium mb-1">Configuration Options (Create)</h4>
                    <pre className="text-xs overflow-auto">
                      {`{
  "operation": "create",
  "documents": [              // Array of documents to embed
    {
      "content": "string",
      "metadata": {}
    }
  ],
  "name": "string",           // Name for the embedding collection
  "description": "string"     // Description for the embedding collection
}`}
                    </pre>
                    <h4 className="text-xs font-medium mt-3 mb-1">Configuration Options (Search)</h4>
                    <pre className="text-xs overflow-auto">
                      {`{
  "operation": "search",
  "query": "string",          // Query to search for
  "limit": number,            // Maximum number of results
  "threshold": number         // Similarity threshold
}`}
                    </pre>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Truck className="h-5 w-5 text-green-500" />
                    <h3 className="font-semibold text-lg">Supply Chain Step</h3>
                    <Badge variant="outline">supply_chain</Badge>
                  </div>
                  <p className="text-sm mb-3">
                    Optimizes packaging, shipping routes, and supply chain operations. Useful for logistics planning and
                    optimization.
                  </p>
                  <div className="bg-muted rounded-md p-3">
                    <h4 className="text-xs font-medium mb-1">Configuration Options</h4>
                    <pre className="text-xs overflow-auto">
                      {`{
  "operation": "optimize_packaging" | "optimize_shipping_routes" | "optimize_supply_chain",
  "items": [],                // Items to be packaged/shipped
  "available_packages": [],   // Available package types
  "origin": {},               // Origin location
  "destination": {},          // Destination location
  "carriers": []              // Available carriers
}`}
                    </pre>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Code className="h-5 w-5 text-yellow-500" />
                    <h3 className="font-semibold text-lg">Code Generation Step</h3>
                    <Badge variant="outline">code_generation</Badge>
                  </div>
                  <p className="text-sm mb-3">
                    Generates or reviews code based on descriptions or existing code. Useful for automating development
                    tasks and code quality checks.
                  </p>
                  <div className="bg-muted rounded-md p-3">
                    <h4 className="text-xs font-medium mb-1">Configuration Options (Generate)</h4>
                    <pre className="text-xs overflow-auto">
                      {`{
  "operation": "generate",
  "language": "string",       // Programming language
  "description": "string",    // Description of the code to generate
  "context": "string",        // Additional context
  "framework": "string",      // Framework to use
  "libraries": []             // Libraries to use
}`}
                    </pre>
                    <h4 className="text-xs font-medium mt-3 mb-1">Configuration Options (Review)</h4>
                    <pre className="text-xs overflow-auto">
                      {`{
  "operation": "review",
  "code": "string",           // Code to review
  "language": "string",       // Programming language
  "focus": "string"           // Focus of the review (e.g., "security", "performance")
}`}
                    </pre>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart className="h-5 w-5 text-red-500" />
                    <h3 className="font-semibold text-lg">Data Analysis Step</h3>
                    <Badge variant="outline">data_analysis</Badge>
                  </div>
                  <p className="text-sm mb-3">
                    Analyzes data to extract insights, detect anomalies, or generate forecasts. Useful for business
                    intelligence and data-driven decision making.
                  </p>
                  <div className="bg-muted rounded-md p-3">
                    <h4 className="text-xs font-medium mb-1">Configuration Options</h4>
                    <pre className="text-xs overflow-auto">
                      {`{
  "operation": "analyze",
  "data_source": "string",    // Table name or context path
  "analysis_type": "summary" | "trends" | "anomalies" | "forecast",
  "time_period": "string"     // Time period for trends or forecast
}`}
                    </pre>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Code className="h-5 w-5 text-gray-500" />
                    <h3 className="font-semibold text-lg">Custom Step</h3>
                    <Badge variant="outline">custom</Badge>
                  </div>
                  <p className="text-sm mb-3">
                    Executes custom functions for specialized operations. Useful for integrating with external systems
                    or implementing custom business logic.
                  </p>
                  <div className="bg-muted rounded-md p-3">
                    <h4 className="text-xs font-medium mb-1">Configuration Options</h4>
                    <pre className="text-xs overflow-auto">
                      {`{
  "function_name": "fetch_data" | "transform_data" | "save_data",
  "parameters": {}            // Function-specific parameters
}`}
                    </pre>
                    <h4 className="text-xs font-medium mt-3 mb-1">fetch_data Parameters</h4>
                    <pre className="text-xs overflow-auto">
                      {`{
  "source": "supabase" | "api",
  "query": {},                // Source-specific query parameters
  "filters": []               // Optional filters
}`}
                    </pre>
                    <h4 className="text-xs font-medium mt-3 mb-1">transform_data Parameters</h4>
                    <pre className="text-xs overflow-auto">
                      {`{
  "data": [],                 // Data to transform
  "transformations": []       // Array of transformation operations
}`}
                    </pre>
                    <h4 className="text-xs font-medium mt-3 mb-1">save_data Parameters</h4>
                    <pre className="text-xs overflow-auto">
                      {`{
  "destination": "supabase" | "file",
  "data": {},                 // Data to save
  "operation": "insert" | "update" | "upsert" | "delete",
  "table": "string"           // For supabase destination
}`}
                    </pre>
                  </div>
                </div>
              </div>

              <Alert>
                <InfoIcon className="h-4 w-4" />
                <AlertTitle>Variable Substitution</AlertTitle>
                <AlertDescription>
                  You can reference data from previous steps or input using the ${"{path}"} syntax. For example, $
                  {"{input.customer_name}"} references the customer_name field from the input, and ${"{step_id.result}"}{" "}
                  references the result field from the step with ID step_id.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="execution" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Executing and Monitoring Workflows</CardTitle>
              <CardDescription>Learn how to execute workflows and monitor their progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-medium">Executing a Workflow</h3>
              <p>Workflows can be executed on-demand through the API or triggered automatically based on events.</p>

              <div className="bg-muted rounded-md p-4">
                <h4 className="text-sm font-medium mb-2">API Endpoint</h4>
                <code className="text-xs bg-black text-white p-2 rounded block">
                  POST /api/v1/workflows/{"{workflow_id}"}/execute
                </code>
                <h4 className="text-sm font-medium mt-4 mb-2">Request Body</h4>
                <pre className="text-xs bg-black text-white p-2 rounded overflow-auto">
                  {`{
  "input": {
    // Any input data required by the workflow
    "customer_info": "John Doe, john.doe@example.com, 123 Main St, New York, NY 10001"
  }
}`}
                </pre>
                <h4 className="text-sm font-medium mt-4 mb-2">Response</h4>
                <pre className="text-xs bg-black text-white p-2 rounded overflow-auto">
                  {`{
  "workflow_id": "123e4567-e89b-12d3-a456-426614174000",
  "run_id": "789e0123-e45b-67d8-a901-234567890123",
  "status": "completed",
  "results": {
    // Results from each step
    "extract_data": {
      "extracted_data": {
        "name": "John Doe",
        "email": "john.doe@example.com",
        "address": "123 Main St, New York, NY 10001"
      }
    },
    "validate_data": {
      "valid": true,
      "result": {
        "name": "John Doe",
        "email": "john.doe@example.com",
        "address": "123 Main St, New York, NY 10001"
      }
    },
    "create_account": {
      "id": "user_123",
      "created_at": "2023-01-01T12:00:00Z"
    }
  },
  "execution_time": 2500
}`}
                </pre>
              </div>

              <h3 className="text-lg font-medium mt-6">Workflow Execution Context</h3>
              <p>
                During execution, the workflow maintains a context that includes input data, results from each step, and
                metadata about the execution. This context is used to pass data between steps and track the progress of
                the workflow.
              </p>

              <div className="border rounded-lg p-4">
                <h4 className="font-medium">Context Structure</h4>
                <pre className="text-xs mt-2 bg-muted p-2 rounded overflow-auto">
                  {`{
  "workflow_id": "string",    // ID of the workflow
  "run_id": "string",         // ID of the execution run
  "user_id": "string",        // ID of the user who initiated the execution
  "input": {},                // Input data provided for the execution
  "results": {                // Results from each step
    "step_id": {              // Results indexed by step ID
      // Step-specific results
    }
  },
  "current_step": "string",   // ID of the currently executing step
  "completed_steps": [],      // IDs of completed steps
  "error": "string"           // Error message if execution failed
}`}
                </pre>
              </div>

              <h3 className="text-lg font-medium mt-6">Monitoring Workflow Runs</h3>
              <p>You can retrieve information about workflow runs to monitor their status and results.</p>

              <div className="bg-muted rounded-md p-4">
                <h4 className="text-sm font-medium mb-2">List Workflow Runs</h4>
                <code className="text-xs bg-black text-white p-2 rounded block">
                  GET /api/v1/workflows/{"{workflow_id}"}/runs
                </code>

                <h4 className="text-sm font-medium mt-4 mb-2">Get Workflow Run Details</h4>
                <code className="text-xs bg-black text-white p-2 rounded block">
                  GET /api/v1/workflows/runs/{"{run_id}"}
                </code>
              </div>

              <Alert>
                <InfoIcon className="h-4 w-4" />
                <AlertTitle>Asynchronous Execution</AlertTitle>
                <AlertDescription>
                  For long-running workflows, you can use the asynchronous execution endpoint, which returns immediately
                  with a run ID that you can use to check the status later.
                </AlertDescription>
              </Alert>

              <div className="bg-muted rounded-md p-4">
                <h4 className="text-sm font-medium mb-2">Asynchronous Execution</h4>
                <code className="text-xs bg-black text-white p-2 rounded block">
                  POST /api/v1/workflows/{"{workflow_id}"}/execute-async
                </code>
                <h4 className="text-sm font-medium mt-4 mb-2">Response</h4>
                <pre className="text-xs bg-black text-white p-2 rounded overflow-auto">
                  {`{
  "workflow_id": "123e4567-e89b-12d3-a456-426614174000",
  "run_id": "789e0123-e45b-67d8-a901-234567890123",
  "status": "pending"
}`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examples" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Examples</CardTitle>
              <CardDescription>Explore practical examples of AI workflows for common use cases</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-6">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg">Customer Support Automation</h3>
                  <p className="text-sm mt-1 mb-3">
                    This workflow processes customer support tickets, categorizes them, and either generates a response
                    or escalates to a human agent.
                  </p>
                  <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                    {`{
  "name": "Customer Support Automation",
  "description": "Process support tickets and generate responses",
  "steps": [
    {
      "id": "analyze_ticket",
      "type": "agent",
      "name": "Analyze Support Ticket",
      "config": {
        "agent_id": "support_analyzer_agent",
        "query": "Analyze this support ticket and extract the category, urgency, and key issues: \${input.ticket_text}",
        "max_iterations": 2,
        "timeout_ms": 20000
      },
      "next_steps": ["search_knowledge_base"]
    },
    {
      "id": "search_knowledge_base",
      "type": "embedding",
      "name": "Search Knowledge Base",
      "config": {
        "operation": "search",
        "query": "\${analyze_ticket.key_issues}",
        "limit": 5,
        "threshold": 0.7
      },
      "next_steps": ["check_results"],
      "condition": {
        "field": "results",
        "operator": "!=",
        "value": null
      }
    },
    {
      "id": "check_results",
      "type": "custom",
      "name": "Check Search Results",
      "config": {
        "function_name": "transform_data",
        "parameters": {
          "data": "\${search_knowledge_base}",
          "transformations": [
            {
              "type": "filter",
              "config": {
                "field": "similarity",
                "operator": ">",
                "value": 0.8
              }
            }
          ]
        }
      },
      "next_steps": ["generate_response", "escalate_ticket"],
      "condition": {
        "field": "length",
        "operator": ">",
        "value": 0
      }
    },
    {
      "id": "generate_response",
      "type": "agent",
      "name": "Generate Response",
      "config": {
        "agent_id": "response_generator_agent",
        "query": "Generate a helpful response for this support ticket using the knowledge base articles. Ticket: \${input.ticket_text}\\n\\nKnowledge Base Articles: \${check_results.result}",
        "max_iterations": 3,
        "timeout_ms": 30000
      },
      "next_steps": ["save_response"]
    },
    {
      "id": "escalate_ticket",
      "type": "custom",
      "name": "Escalate Ticket to Human",
      "config": {
        "function_name": "save_data",
        "parameters": {
          "destination": "supabase",
          "table": "escalated_tickets",
          "operation": "insert",
          "data": {
            "ticket_id": "\${input.ticket_id}",
            "category": "\${analyze_ticket.category}",
            "urgency": "\${analyze_ticket.urgency}",
            "key_issues": "\${analyze_ticket.key_issues}",
            "escalation_reason": "No matching knowledge base articles found"
          }
        }
      },
      "next_steps": []
    },
    {
      "id": "save_response",
      "type": "custom",
      "name": "Save Generated Response",
      "config": {
        "function_name": "save_data",
        "parameters": {
          "destination": "supabase",
          "table": "ticket_responses",
          "operation": "insert",
          "data": {
            "ticket_id": "\${input.ticket_id}",
            "response": "\${generate_response.response}",
            "category": "\${analyze_ticket.category}",
            "knowledge_base_articles": "\${check_results.result}"
          }
        }
      },
      "next_steps": []
    }
  ],
  "trigger_type": "api",
  "trigger_config": {},
  "is_active": true
}`}
                  </pre>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg">Supply Chain Optimization</h3>
                  <p className="text-sm mt-1 mb-3">
                    This workflow optimizes packaging and shipping routes for a set of items, then generates a shipping
                    plan.
                  </p>
                  <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                    {`{
  "name": "Supply Chain Optimization",
  "description": "Optimize packaging and shipping routes",
  "steps": [
    {
      "id": "fetch_items",
      "type": "custom",
      "name": "Fetch Items to Ship",
      "config": {
        "function_name": "fetch_data",
        "parameters": {
          "source": "supabase",
          "query": {
            "table": "order_items",
            "select": "*"
          },
          "filters": [
            {
              "field": "order_id",
              "operator": "eq",
              "value": "\${input.order_id}"
            }
          ]
        }
      },
      "next_steps": ["fetch_packages"]
    },
    {
      "id": "fetch_packages",
      "type": "custom",
      "name": "Fetch Available Packages",
      "config": {
        "function_name": "fetch_data",
        "parameters": {
          "source": "supabase",
          "query": {
            "table": "available_packages",
            "select": "*"
          },
          "filters": [
            {
              "field": "is_active",
              "operator": "eq",
              "value": true
            }
          ]
        }
      },
      "next_steps": ["optimize_packaging"]
    },
    {
      "id": "optimize_packaging",
      "type": "supply_chain",
      "name": "Optimize Packaging",
      "config": {
        "operation": "optimize_packaging",
        "items": "\${fetch_items}",
        "available_packages": "\${fetch_packages}"
      },
      "next_steps": ["fetch_carriers"]
    },
    {
      "id": "fetch_carriers",
      "type": "custom",
      "name": "Fetch Available Carriers",
      "config": {
        "function_name": "fetch_data",
        "parameters": {
          "source": "supabase",
          "query": {
            "table": "carriers",
            "select": "*"
          },
          "filters": [
            {
              "field": "is_active",
              "operator": "eq",
              "value": true
            }
          ]
        }
      },
      "next_steps": ["optimize_routes"]
    },
    {
      "id": "optimize_routes",
      "type": "supply_chain",
      "name": "Optimize Shipping Routes",
      "config": {
        "operation": "optimize_shipping_routes",
        "origin": "\${input.origin}",
        "destination": "\${input.destination}",
        "available_packages": "\${optimize_packaging.packages}",
        "carriers": "\${fetch_carriers}"
      },
      "next_steps": ["generate_shipping_plan"]
    },
    {
      "id": "generate_shipping_plan",
      "type": "agent",
      "name": "Generate Shipping Plan",
      "config": {
        "agent_id": "shipping_plan_generator",
        "query": "Generate a detailed shipping plan based on the optimized packaging and routes. Items: \${fetch_items}\\n\\nOptimized Packaging: \${optimize_packaging.packages}\\n\\nOptimized Routes: \${optimize_routes.routes}",
        "max_iterations": 3,
        "timeout_ms": 30000
      },
      "next_steps": ["save_shipping_plan"]
    },
    {
      "id": "save_shipping_plan",
      "type": "custom",
      "name": "Save Shipping Plan",
      "config": {
        "function_name": "save_data",
        "parameters": {
          "destination": "supabase",
          "table": "shipping_plans",
          "operation": "insert",
          "data": {
            "order_id": "\${input.order_id}",
            "origin": "\${input.origin}",
            "destination": "\${input.destination}",
            "optimized_packaging": "\${optimize_packaging.packages}",
            "optimized_routes": "\${optimize_routes.routes}",
            "shipping_plan": "\${generate_shipping_plan.plan}",
            "estimated_cost": "\${optimize_routes.total_cost}",
            "estimated_delivery_time": "\${optimize_routes.estimated_delivery_time}"
          }
        }
      },
      "next_steps": []
    }
  ],
  "trigger_type": "api",
  "trigger_config": {},
  "is_active": true
}`}
                  </pre>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg">Content Generation Pipeline</h3>
                  <p className="text-sm mt-1 mb-3">
                    This workflow generates marketing content based on product information, reviews it for quality, and
                    publishes it if it meets the criteria.
                  </p>
                  <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                    {`{
  "name": "Content Generation Pipeline",
  "description": "Generate, review, and publish marketing content",
  "steps": [
    {
      "id": "fetch_product",
      "type": "custom",
      "name": "Fetch Product Information",
      "config": {
        "function_name": "fetch_data",
        "parameters": {
          "source": "supabase",
          "query": {
            "table": "products",
            "select": "*"
          },
          "filters": [
            {
              "field": "id",
              "operator": "eq",
              "value": "\${input.product_id}"
            }
          ]
        }
      },
      "next_steps": ["generate_content"]
    },
    {
      "id": "generate_content",
      "type": "agent",
      "name": "Generate Marketing Content",
      "config": {
        "agent_id": "content_generator_agent",
        "query": "Generate marketing content for this product. Include a headline, short description, and 3 key selling points. Product information: \${fetch_product}",
        "max_iterations": 3,
        "timeout_ms": 30000
      },
      "next_steps": ["review_content"]
    },
    {
      "id": "review_content",
      "type": "agent",
      "name": "Review Content Quality",
      "config": {
        "agent_id": "content_reviewer_agent",
        "query": "Review this marketing content for quality, accuracy, and brand alignment. Provide a score from 1-10 and improvement suggestions. Content: \${generate_content.content}\\n\\nProduct information: \${fetch_product}",
        "max_iterations": 2,
        "timeout_ms": 20000
      },
      "next_steps": ["check_quality"]
    },
    {
      "id": "check_quality",
      "type": "custom",
      "name": "Check Content Quality Score",
      "config": {
        "function_name": "transform_data",
        "parameters": {
          "data": "\${review_content}",
          "transformations": [
            {
              "type": "filter",
              "config": {
                "field": "score",
                "operator": ">=",
                "value": 7
              }
            }
          ]
        }
      },
      "next_steps": ["publish_content", "regenerate_content"],
      "condition": {
        "field": "passed",
        "operator": "==",
        "value": true
      }
    },
    {
      "id": "publish_content",
      "type": "custom",
      "name": "Publish Content",
      "config": {
        "function_name": "save_data",
        "parameters": {
          "destination": "supabase",
          "table": "marketing_content",
          "operation": "insert",
          "data": {
            "product_id": "\${input.product_id}",
            "headline": "\${generate_content.headline}",
            "description": "\${generate_content.description}",
            "selling_points": "\${generate_content.selling_points}",
            "quality_score": "\${review_content.score}",
            "status": "published",
            "published_at": "CURRENT_TIMESTAMP"
          }
        }
      },
      "next_steps": []
    },
    {
      "id": "regenerate_content",
      "type": "agent",
      "name": "Regenerate Content with Feedback",
      "config": {
        "agent_id": "content_generator_agent",
        "query": "Regenerate marketing content for this product, addressing the following feedback: \${review_content.suggestions}\\n\\nProduct information: \${fetch_product}",
        "max_iterations": 3,
        "timeout_ms": 30000
      },
      "next_steps": ["save_draft"]
    },
    {
      "id": "save_draft",
      "type": "custom",
      "name": "Save Content as Draft",
      "config": {
        "function_name": "save_data",
        "parameters": {
          "destination": "supabase",
          "table": "marketing_content",
          "operation": "insert",
          "data": {
            "product_id": "\${input.product_id}",
            "headline": "\${regenerate_content.headline}",
            "description": "\${regenerate_content.description}",
            "selling_points": "\${regenerate_content.selling_points}",
            "quality_score": "\${review_content.score}",
            "improvement_suggestions": "\${review_content.suggestions}",
            "status": "draft"
          }
        }
      },
      "next_steps": []
    }
  ],
  "trigger_type": "api",
  "trigger_config": {},
  "is_active": true
}`}
                  </pre>
                </div>
              </div>

              <Alert>
                <InfoIcon className="h-4 w-4" />
                <AlertTitle>Best Practices</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside text-sm mt-2">
                    <li>Keep workflows focused on a specific business process</li>
                    <li>Use descriptive names for steps to make workflows easier to understand</li>
                    <li>Include error handling steps to gracefully handle failures</li>
                    <li>Test workflows with various inputs to ensure they handle edge cases</li>
                    <li>Monitor workflow execution times and optimize steps that take too long</li>
                    <li>Use conditions to create branching logic based on step results</li>
                    <li>Document workflows with clear descriptions of their purpose and inputs</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
