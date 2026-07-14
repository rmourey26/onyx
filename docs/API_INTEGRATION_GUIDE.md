# ResendIt API Integration Guide

Complete guide for integrating with the ResendIt platform API to execute agents and workflows programmatically.

## Table of Contents

1. [Authentication](#authentication)
2. [API Key Management](#api-key-management)
3. [Executing Agents](#executing-agents)
4. [Executing Workflows](#executing-workflows)
5. [Webhooks](#webhooks)
6. [Scopes & Permissions](#scopes--permissions)
7. [Error Handling](#error-handling)
8. [Rate Limiting](#rate-limiting)
9. [Best Practices](#best-practices)

## Authentication

All API requests require authentication using an API key passed in the `Authorization` header:

```http
Authorization: Bearer sk_live_your_api_key_here
```

### Creating an API Key

1. Navigate to Settings > API Keys in your dashboard
2. Click "Create API Key"
3. Provide a name and optionally set an expiration date
4. Select the required scopes (permissions)
5. Save the API key immediately - it will only be shown once

## API Key Management

### Creating a Key via Server Action

```typescript
import { createAPIKey } from "@/app/actions/api-keys"

const { data, error } = await createAPIKey(
  "Production Agent API Key",
  90, // expires in 90 days
  ["read:agents", "execute:agents", "read:assets"]
)

if (data) {
  console.log("API Key:", data.key) // Save this - shown only once!
  console.log("Key ID:", data.id)
}
```

### Available Scopes

| Scope | Description |
|-------|-------------|
| `read:agents` | View agent configurations |
| `write:agents` | Create and modify agents |
| `execute:agents` | Execute agents |
| `read:workflows` | View workflow configurations |
| `write:workflows` | Create and modify workflows |
| `execute:workflows` | Execute workflows |
| `read:assets` | View assets |
| `read:analytics` | View analytics data |
| `execute:*` | Execute all agents and workflows |

### Key Security Best Practices

- Store API keys securely in environment variables
- Never commit keys to version control
- Use different keys for different environments (dev/staging/prod)
- Rotate keys regularly
- Use minimal scopes required for each integration
- Monitor key usage in the audit logs

## Executing Agents

### Endpoint

```
POST /api/v1/agents/{agentId}/execute
```

### Request Headers

```http
Authorization: Bearer sk_live_your_api_key
Content-Type: application/json
```

### Request Body

```json
{
  "prompt": "Analyze this asset for potential issues",
  "assetIds": ["asset-uuid-1", "asset-uuid-2"],
  "dataStreamIds": ["stream-uuid-1"],
  "webhookUrl": "https://your-app.com/webhooks/agent-completed",
  "metadata": {
    "customField": "customValue"
  }
}
```

#### Parameters

- `prompt` (required, string): The instruction or question for the agent
- `assetIds` (optional, array): Array of asset UUIDs to include in context
- `dataStreamIds` (optional, array): Array of data stream UUIDs to analyze
- `webhookUrl` (optional, string): URL to receive completion webhook (overrides registered webhooks)
- `metadata` (optional, object): Custom metadata to attach to execution record

### Response

```json
{
  "success": true,
  "executionId": "exec-uuid",
  "agentId": "agent-uuid",
  "agentName": "Asset Analyzer",
  "result": "Based on the analysis of the provided assets...",
  "executionTime": 2341,
  "iterations": 2,
  "toolCalls": 3,
  "tokens": {
    "prompt": 1234,
    "completion": 567,
    "total": 1801
  },
  "timestamp": "2024-12-11T10:30:00.000Z"
}
```

### Example (cURL)

```bash
curl -X POST https://api.resend-it.com/api/v1/agents/agent-123/execute \
  -H "Authorization: Bearer sk_live_abc123..." \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Analyze this asset",
    "assetIds": ["asset-456"]
  }'
```

### Example (Node.js)

```javascript
const response = await fetch('https://api.resend-it.com/api/v1/agents/agent-123/execute', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.RESENDIT_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    prompt: 'Analyze this asset for compliance issues',
    assetIds: ['asset-456'],
    webhookUrl: 'https://myapp.com/webhooks/agent'
  })
})

const result = await response.json()
console.log('Agent result:', result.result)
```

### Example (Python)

```python
import requests
import os

response = requests.post(
    'https://api.resend-it.com/api/v1/agents/agent-123/execute',
    headers={
        'Authorization': f'Bearer {os.environ["RESENDIT_API_KEY"]}',
        'Content-Type': 'application/json'
    },
    json={
        'prompt': 'Analyze this asset',
        'assetIds': ['asset-456']
    }
)

result = response.json()
print(f"Agent result: {result['result']}")
```

## Executing Workflows

### Endpoint

```
POST /api/v1/workflows/{workflowId}/execute
```

### Request Headers

```http
Authorization: Bearer sk_live_your_api_key
Content-Type: application/json
```

### Request Body

```json
{
  "input": {
    "assetId": "asset-uuid",
    "analysisType": "full"
  },
  "webhookUrl": "https://your-app.com/webhooks/workflow-completed",
  "metadata": {
    "userId": "user-123",
    "requestId": "req-456"
  }
}
```

#### Parameters

- `input` (optional, object): Input data for the workflow
- `webhookUrl` (optional, string): URL to receive completion webhook
- `metadata` (optional, object): Custom metadata for execution tracking

### Response (Success)

```json
{
  "success": true,
  "executionId": "run-uuid",
  "workflowId": "workflow-uuid",
  "workflowName": "Asset Analysis Pipeline",
  "status": "completed",
  "result": {
    "step1_output": "...",
    "step2_output": "...",
    "final_result": "..."
  },
  "executionTime": 5432,
  "timestamp": "2024-12-11T10:30:00.000Z"
}
```

### Response (Failure)

```json
{
  "success": false,
  "executionId": "run-uuid",
  "workflowId": "workflow-uuid",
  "workflowName": "Asset Analysis Pipeline",
  "status": "failed",
  "error": "Step 'data_analysis' failed: Invalid input format",
  "executionTime": 1234,
  "timestamp": "2024-12-11T10:30:00.000Z"
}
```

### Example (TypeScript)

```typescript
interface WorkflowExecutionResponse {
  success: boolean
  executionId: string
  workflowId: string
  status: 'completed' | 'failed'
  result?: any
  error?: string
  executionTime: number
}

async function executeWorkflow(
  workflowId: string,
  input: Record<string, any>
): Promise<WorkflowExecutionResponse> {
  const response = await fetch(
    `https://api.resend-it.com/api/v1/workflows/${workflowId}/execute`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESENDIT_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ input })
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Workflow execution failed')
  }

  return response.json()
}

// Usage
const result = await executeWorkflow('workflow-123', {
  assetId: 'asset-456',
  analysisType: 'full'
})

console.log('Workflow completed:', result.status)
```

## Webhooks

### Creating a Webhook

Webhooks allow you to receive notifications when agents and workflows complete execution.

```typescript
import { createWebhook } from "@/app/actions/webhooks"

const { webhook, secret } = await createWebhook({
  name: "Production Webhook",
  url: "https://myapp.com/api/webhooks",
  description: "Receives execution completion events",
  events: [
    "agent.execution.completed",
    "agent.execution.failed",
    "workflow.execution.completed",
    "workflow.execution.failed"
  ]
})

// Store the secret securely - it's shown only once!
console.log("Webhook Secret:", secret)
```

### Webhook Payload

When an event occurs, ResendIt will POST to your webhook URL with:

```json
{
  "event": "agent.execution.completed",
  "data": {
    "agentId": "agent-uuid",
    "agentName": "Asset Analyzer",
    "executionId": "exec-uuid",
    "result": "Analysis complete...",
    "executionTime": 2341,
    "timestamp": "2024-12-11T10:30:00.000Z"
  },
  "timestamp": "2024-12-11T10:30:00.000Z"
}
```

### Webhook Headers

```http
Content-Type: application/json
X-Webhook-Signature: sha256_hash_of_payload
X-Webhook-Event: agent.execution.completed
User-Agent: ResendIt-Webhooks/1.0
```

### Verifying Webhook Signatures

Always verify webhook signatures to ensure requests are authentic:

```typescript
import crypto from 'crypto'

function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(payload)
  const expectedSignature = hmac.digest('hex')
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

// In your webhook handler
app.post('/api/webhooks', (req, res) => {
  const signature = req.headers['x-webhook-signature']
  const payload = JSON.stringify(req.body)
  
  if (!verifyWebhookSignature(payload, signature, process.env.WEBHOOK_SECRET)) {
    return res.status(401).json({ error: 'Invalid signature' })
  }
  
  // Process webhook...
  res.json({ success: true })
})
```

### Webhook Events

| Event | Description |
|-------|-------------|
| `agent.execution.completed` | Agent finished successfully |
| `agent.execution.failed` | Agent execution failed |
| `workflow.execution.completed` | Workflow finished successfully |
| `workflow.execution.failed` | Workflow execution failed |

### Webhook Retry Logic

- ResendIt will retry failed webhooks 3 times
- Exponential backoff: 1s, 2s, 4s
- Webhooks timing out after 10 seconds are considered failed
- Check webhook logs in dashboard for delivery status

## Error Handling

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Invalid or missing API key |
| 403 | Forbidden - Insufficient permissions (check scopes) |
| 404 | Not Found - Agent/workflow doesn't exist or no access |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

### Error Response Format

```json
{
  "error": "Short error description",
  "message": "Detailed error message with guidance",
  "timestamp": "2024-12-11T10:30:00.000Z"
}
```

### Common Errors

#### Missing Scope

```json
{
  "error": "API key does not have permission to execute agents. Required scope: execute:agents",
  "timestamp": "2024-12-11T10:30:00.000Z"
}
```

**Solution**: Update your API key to include the `execute:agents` scope

#### Agent Not Found

```json
{
  "error": "Agent not found or access denied",
  "message": "No agent found with ID agent-123 for your account",
  "timestamp": "2024-12-11T10:30:00.000Z"
}
```

**Solution**: Verify the agent ID and ensure it belongs to your account

#### Invalid Asset

```json
{
  "error": "Failed to fetch asset context",
  "message": "One or more asset IDs are invalid or inaccessible",
  "timestamp": "2024-12-11T10:30:00.000Z"
}
```

**Solution**: Check that all asset IDs exist and belong to your account

### Handling Errors in Code

```typescript
try {
  const response = await fetch(apiUrl, options)
  
  if (!response.ok) {
    const error = await response.json()
    
    switch (response.status) {
      case 401:
        console.error('Invalid API key')
        // Re-authenticate or refresh key
        break
      case 403:
        console.error('Insufficient permissions:', error.message)
        // Request admin to update key scopes
        break
      case 404:
        console.error('Resource not found:', error.message)
        // Update resource ID
        break
      case 429:
        console.error('Rate limited - waiting before retry')
        // Implement exponential backoff
        await new Promise(resolve => setTimeout(resolve, 60000))
        break
      default:
        console.error('API error:', error.message)
    }
    
    throw new Error(error.message)
  }
  
  return await response.json()
} catch (error) {
  console.error('Request failed:', error)
  throw error
}
```

## Rate Limiting

Currently, the API does not enforce strict rate limits, but we recommend:

- **Maximum 100 requests per minute per API key**
- **Maximum 1000 requests per hour per account**
- Implement exponential backoff for retries
- Cache results when possible
- Use webhooks instead of polling

Future updates will enforce rate limits with headers:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1639392000
```

## Best Practices

### 1. Use Environment Variables

Never hardcode API keys:

```typescript
// ✅ Good
const apiKey = process.env.RESENDIT_API_KEY

// ❌ Bad
const apiKey = "sk_live_abc123..."
```

### 2. Implement Retry Logic

```typescript
async function executeWithRetry(fn: () => Promise<any>, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error: any) {
      if (error.status === 429 || error.status >= 500) {
        if (i < maxRetries - 1) {
          await new Promise(resolve => 
            setTimeout(resolve, Math.pow(2, i) * 1000)
          )
          continue
        }
      }
      throw error
    }
  }
}
```

### 3. Use Minimal Scopes

Only request the permissions you need:

```typescript
// ✅ Good - only execution permission
const scopes = ["execute:agents", "read:assets"]

// ❌ Bad - unnecessary permissions
const scopes = ["admin:*"]
```

### 4. Monitor API Key Usage

Regularly check:
- Total requests
- Last used timestamp
- Audit logs
- Failed requests

```typescript
import { getAPIKeyUsageStats } from "@/app/actions/api-key-audit-actions"

const { data } = await getAPIKeyUsageStats(apiKeyId)
console.log(`Total requests: ${data.total_requests}`)
console.log(`Last used: ${data.last_used_at}`)
```

### 5. Handle Webhooks Idempotently

Webhook deliveries may be retried, so ensure your handlers are idempotent:

```typescript
const processedEvents = new Set()

app.post('/webhooks', async (req, res) => {
  const eventId = req.body.data.executionId
  
  if (processedEvents.has(eventId)) {
    return res.json({ success: true, message: 'Already processed' })
  }
  
  // Process event...
  processedEvents.add(eventId)
  
  res.json({ success: true })
})
```

### 6. Log Everything

Maintain comprehensive logs for debugging:

```typescript
console.log('[API] Executing agent:', {
  agentId,
  timestamp: new Date().toISOString(),
  prompt: prompt.substring(0, 100)
})

// After execution
console.log('[API] Execution complete:', {
  executionId,
  executionTime,
  success: true
})
```

## SDK Examples

### Node.js SDK (Recommended)

```typescript
import { ResendItClient } from '@resendit/sdk'

const client = new ResendItClient({
  apiKey: process.env.RESENDIT_API_KEY
})

// Execute an agent
const result = await client.agents.execute('agent-123', {
  prompt: 'Analyze this asset',
  assetIds: ['asset-456']
})

// Execute a workflow
const workflowResult = await client.workflows.execute('workflow-123', {
  input: { assetId: 'asset-456' }
})

// Create a webhook
const webhook = await client.webhooks.create({
  name: 'My Webhook',
  url: 'https://myapp.com/webhooks',
  events: ['agent.execution.completed']
})
```

## Support

For questions or issues:

- Documentation: https://docs.resend-it.com
- Support: support@resend-it.com
- Status: https://status.resend-it.com

## Changelog

### v1.1.0 (2024-12-11)
- Added scope-based permission system
- Enhanced error messages with guidance
- Added execution time tracking
- Improved webhook delivery reliability
- Added metadata support for executions

### v1.0.0 (2024-11-01)
- Initial API release
- Agent and workflow execution
- Webhook notifications
- API key management
