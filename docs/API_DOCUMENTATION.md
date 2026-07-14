# ResendIt API Documentation

## Overview

The ResendIt API enables developers to integrate AI agents and workflows into their applications. Trigger agent and workflow executions programmatically and receive results via webhooks.

## Authentication

All API requests require authentication using an API key. Include your API key in the `Authorization` header:

```
Authorization: Bearer YOUR_API_KEY
```

### Getting an API Key

1. Log in to your ResendIt account
2. Navigate to Settings > API Keys
3. Click "Create API Key"
4. Copy and securely store your API key

## Base URL

```
https://app.resend-it.com/api/v1
```

## Endpoints

### Execute Agent

Trigger an AI agent execution with custom context.

**Endpoint:** `POST /agents/{agentId}/execute`

**Parameters:**
- `agentId` (path, required): The ID of the agent to execute

**Request Body:**
```json
{
  "prompt": "Analyze the performance of these assets",
  "assetIds": ["asset-id-1", "asset-id-2"],
  "dataStreamIds": ["stream-id-1"],
  "webhookUrl": "https://your-app.com/webhooks/agent-result"
}
```

**Response:**
```json
{
  "success": true,
  "executionId": "exec-123",
  "result": "Agent analysis result...",
  "timestamp": "2025-01-26T10:30:00Z"
}
```

### Execute Workflow

Trigger a workflow execution with input data.

**Endpoint:** `POST /workflows/{workflowId}/execute`

**Parameters:**
- `workflowId` (path, required): The ID of the workflow to execute

**Request Body:**
```json
{
  "input": {
    "key1": "value1",
    "key2": "value2"
  },
  "webhookUrl": "https://your-app.com/webhooks/workflow-result"
}
```

**Response:**
```json
{
  "success": true,
  "executionId": "exec-456",
  "result": { "output": "..." },
  "timestamp": "2025-01-26T10:30:00Z"
}
```

## Webhooks

### Registering Webhooks

Register webhook URLs to receive automatic notifications when events occur.

1. Navigate to Settings > Webhooks
2. Click "Create Webhook"
3. Enter your webhook URL and select events to subscribe to
4. Save your webhook secret for signature verification

### Webhook Events

- `agent.execution.completed` - Agent execution finished successfully
- `agent.execution.failed` - Agent execution failed
- `workflow.execution.completed` - Workflow execution finished successfully
- `workflow.execution.failed` - Workflow execution failed
- `asset.created` - New asset created
- `asset.updated` - Asset updated

### Webhook Payload

```json
{
  "event": "agent.execution.completed",
  "data": {
    "agentId": "agent-123",
    "executionId": "exec-789",
    "result": "...",
    "timestamp": "2025-01-26T10:30:00Z"
  },
  "timestamp": "2025-01-26T10:30:00Z"
}
```

### Webhook Signature Verification

All webhook requests include an `X-Webhook-Signature` header containing an HMAC SHA-256 signature. Verify the signature to ensure the request is from ResendIt:

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(payload));
  const expectedSignature = hmac.digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

## Rate Limits

- 100 requests per minute per API key
- 1000 requests per hour per API key

## Error Codes

- `400` - Bad Request: Invalid parameters
- `401` - Unauthorized: Invalid or missing API key
- `404` - Not Found: Resource not found
- `429` - Too Many Requests: Rate limit exceeded
- `500` - Internal Server Error: Server error

## Example Integration

```javascript
// Execute an agent
const response = await fetch('https://app.resend-it.com/api/v1/agents/agent-123/execute', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    prompt: 'Analyze asset performance',
    assetIds: ['asset-1', 'asset-2']
  })
});

const result = await response.json();
console.log(result);
```

## Support

For API support, contact support@resend-it.com or visit our developer portal.
