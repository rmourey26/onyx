# Data Streams API Documentation

## Overview

The Resend-It Data Streams API provides real-time and polling access to AI agent results, workflow executions, and IoT sensor data. The streaming format (SSE or HTTP polling) is automatically determined by your subscription tier.

## Base URL

```
https://api.resend-it.com/v1/data-streams
```

## Authentication

All endpoints require authentication via:
- **Session Token**: `Authorization: Bearer <session_token>` (Web apps)
- **API Key**: `Authorization: Bearer <api_key>` (External integrations)

## Subscription Tiers

| Tier | Format | Rate Limit | Max Streams | Poll Interval |
|------|--------|------------|-------------|---------------|
| **Free** | HTTP Polling | 60/hour | 1 | 30 seconds |
| **Lite** | HTTP Polling | 180/hour | 2 | 15 seconds |
| **Pro** | Server-Sent Events (SSE) | 1,000/hour | 10 | 1 second (fallback) |
| **Enterprise** | Server-Sent Events (SSE) | Unlimited | Unlimited | 1 second (fallback) |

## Endpoints

### 1. Main Data Stream Endpoint

**GET** `/api/v1/data-streams`

Universal endpoint that automatically serves SSE or polling based on subscription tier.

**Query Parameters:**
- `type` (optional): `agents` | `workflows` | `iot_sensors` (default: `agents`)
- `format` (optional): `sse` | `polling` (overrides tier default if tier allows)

**SSE Response (Pro/Enterprise):**
```typescript
// Connection message
data: {"type":"connection","status":"connected","streamType":"agents","timestamp":"2026-01-08T..."}

// Stream events
data: {"id":"uuid","type":"agents","data":{...},"timestamp":"2026-01-08T..."}

// Keep-alive pings (every 30s)
: keep-alive
```

**Polling Response (Free/Lite):**
```json
{
  "format": "polling",
  "pollInterval": 30000,
  "rateLimit": 60,
  "data": [
    {
      "id": "uuid",
      "type": "agents",
      "data": {...},
      "timestamp": "2026-01-08T..."
    }
  ],
  "timestamp": "2026-01-08T..."
}
```

### 2. Agent Results Stream

**GET** `/api/v1/data-streams/agents`

Dedicated stream for AI agent analysis results.

### 3. Workflow Executions Stream

**GET** `/api/v1/data-streams/workflows`

Dedicated stream for workflow run updates.

### 4. IoT Sensors Stream

**GET** `/api/v1/data-streams/iot-sensors`

Dedicated stream for real-time IoT sensor readings.

## Client Examples

### JavaScript (SSE - Pro/Enterprise)

```javascript
const eventSource = new EventSource(
  'https://api.resend-it.com/v1/data-streams?type=agents',
  {
    headers: {
      'Authorization': `Bearer ${sessionToken}`
    }
  }
)

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data)
  console.log('Stream event:', data)
}

eventSource.onerror = (error) => {
  console.error('SSE error:', error)
  eventSource.close()
}
```

### JavaScript (Polling - Free/Lite)

```javascript
async function pollDataStream() {
  const response = await fetch(
    'https://api.resend-it.com/v1/data-streams?type=agents',
    {
      headers: {
        'Authorization': `Bearer ${sessionToken}`
      }
    }
  )
  
  const result = await response.json()
  console.log('Polling data:', result.data)
  
  // Schedule next poll based on tier limits
  setTimeout(pollDataStream, result.pollInterval)
}

pollDataStream()
```

### Python (SSE)

```python
import sseclient
import requests

headers = {'Authorization': f'Bearer {api_key}'}
response = requests.get(
    'https://api.resend-it.com/v1/data-streams?type=workflows',
    headers=headers,
    stream=True
)

client = sseclient.SSEClient(response)
for event in client.events():
    data = json.loads(event.data)
    print(f"Event: {data}")
```

### cURL (Polling)

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  "https://api.resend-it.com/v1/data-streams?type=iot_sensors"
```

## Error Codes

| Code | Description |
|------|-------------|
| 401 | Unauthorized - Invalid or missing authentication |
| 403 | Forbidden - Tier does not support requested format |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

## Best Practices

1. **Use SSE for Real-Time Needs**: Upgrade to Pro/Enterprise for true real-time streaming
2. **Respect Rate Limits**: Implement exponential backoff on errors
3. **Handle Reconnection**: SSE clients should automatically reconnect on disconnect
4. **Filter Client-Side**: Use the `type` parameter to reduce bandwidth
5. **Monitor Usage**: Track your rate limit headers

## Migration from Legacy API

Old endpoints at `/api/data-streams/*` automatically redirect to `/api/v1/data-streams/*` with HTTP 301.

Update your client code to use the new v1 endpoints.
