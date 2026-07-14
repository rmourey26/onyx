# OAuth 2.1 Integration Guide

Complete guide for integrating with the Resend-It API using OAuth 2.1, API keys, scopes, and webhooks.

## Table of Contents
- [Getting Started](#getting-started)
- [OAuth 2.1 Flow](#oauth-21-flow)
- [Available Scopes](#available-scopes)
- [API Keys](#api-keys)
- [Webhooks](#webhooks)
- [Code Examples](#code-examples)

## Getting Started

Our API uses OAuth 2.1 with PKCE (Proof Key for Code Exchange) for secure authentication. Before integrating, you'll need to:

1. Create an OAuth client in the AI Suite settings
2. Save your Client ID and Client Secret (keep secret secure)
3. Configure your redirect URIs
4. Select the appropriate scopes for your use case

## OAuth 2.1 Flow

### Step 1: Generate PKCE Parameters

```javascript
// Generate code verifier (43-128 characters)
const codeVerifier = crypto.randomBytes(32).toString('base64url');

// Generate code challenge
const codeChallenge = crypto.createHash('sha256')
  .update(codeVerifier)
  .digest('base64url');
```

### Step 2: Authorization Request

Redirect users to the authorization endpoint:

```
GET https://app.resendit.com/oauth/authorize?
  response_type=code
  &client_id=YOUR_CLIENT_ID
  &redirect_uri=YOUR_REDIRECT_URI
  &scope=execute_agents read_assets write_workflows
  &state=RANDOM_STATE
  &code_challenge=CODE_CHALLENGE
  &code_challenge_method=S256
```

### Step 3: Token Exchange

Exchange the authorization code for access tokens:

```bash
POST https://app.resendit.com/oauth/token
Content-Type: application/json

{
  "grant_type": "authorization_code",
  "client_id": "YOUR_CLIENT_ID",
  "client_secret": "YOUR_CLIENT_SECRET",
  "code": "AUTHORIZATION_CODE",
  "redirect_uri": "YOUR_REDIRECT_URI",
  "code_verifier": "CODE_VERIFIER"
}
```

Response:
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "execute_agents read_assets write_workflows"
}
```

### Step 4: Refresh Tokens

When the access token expires:

```bash
POST https://app.resendit.com/oauth/token
Content-Type: application/json

{
  "grant_type": "refresh_token",
  "client_id": "YOUR_CLIENT_ID",
  "client_secret": "YOUR_CLIENT_SECRET",
  "refresh_token": "YOUR_REFRESH_TOKEN"
}
```

## Available Scopes

| Scope | Description |
|-------|-------------|
| `execute_agents` | Run AI agents via API |
| `execute_workflows` | Run workflows via API |
| `read_agents` | View agent configurations |
| `write_agents` | Create and modify agents |
| `read_workflows` | View workflow configurations |
| `write_workflows` | Create and modify workflows |
| `read_assets` | View asset data |
| `write_assets` | Create and modify assets |
| `read_analytics` | Access analytics data |
| `write_analytics` | Create analytics events |
| `admin` | Full administrative access |

## API Keys

In addition to OAuth tokens, you can use API keys for server-to-server authentication.

### Creating API Keys

1. Navigate to AI Suite > Settings > API Keys
2. Click "Create API Key"
3. Enter a name and description
4. Select the required scopes
5. Save the key (you won't see it again!)

### Using API Keys

Include the API key in the request header:

```bash
GET https://app.resendit.com/api/v1/agents
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

## Webhooks

Configure webhooks to receive real-time events from the platform.

### Available Events

- `agent.executed` - AI agent completed execution
- `agent.failed` - AI agent execution failed
- `workflow.completed` - Workflow finished successfully
- `workflow.failed` - Workflow execution failed
- `asset.created` - New asset added
- `asset.updated` - Asset modified
- `asset.deleted` - Asset removed
- `token.refreshed` - Access token refreshed

### Webhook Configuration

1. Create a webhook endpoint in your application
2. Add the endpoint URL in AI Suite settings
3. Select the events you want to receive
4. Save your webhook configuration

### Webhook Payload Format

```json
{
  "event": "agent.executed",
  "timestamp": "2024-12-26T10:30:00Z",
  "data": {
    "agent_id": "agent_123",
    "execution_id": "exec_456",
    "status": "completed",
    "result": {
      "output": "...",
      "metrics": {...}
    }
  }
}
```

### Webhook Signature Verification

All webhooks include an `X-Resendit-Signature` header for verification:

```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expectedSignature = 'sha256=' + 
    crypto.createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
  
  return signature === expectedSignature;
}
```

## Code Examples

### Express.js Server Example

Complete OAuth 2.1 implementation for Express.js applications:

```javascript
const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const session = require('express-session');

const app = express();

// Configuration
const CLIENT_ID = process.env.RESENDIT_CLIENT_ID;
const CLIENT_SECRET = process.env.RESENDIT_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3000/callback';
const API_BASE_URL = 'https://app.resendit.com';

// Session middleware
app.use(session({
  secret: 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: true, httpOnly: true }
}));

app.use(express.json());

// PKCE Helper Functions
function generateCodeVerifier() {
  return crypto.randomBytes(32).toString('base64url');
}

function generateCodeChallenge(verifier) {
  return crypto.createHash('sha256').update(verifier).digest('base64url');
}

// Route 1: Initiate OAuth Flow
app.get('/auth', (req, res) => {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const state = crypto.randomBytes(16).toString('hex');
  
  // Store in session
  req.session.codeVerifier = codeVerifier;
  req.session.state = state;
  
  const authUrl = `${API_BASE_URL}/oauth/authorize?` +
    `response_type=code` +
    `&client_id=${CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&scope=execute_agents read_assets write_workflows` +
    `&state=${state}` +
    `&code_challenge=${codeChallenge}` +
    `&code_challenge_method=S256`;
  
  res.redirect(authUrl);
});

// Route 2: OAuth Callback
app.get('/callback', async (req, res) => {
  const { code, state } = req.query;
  
  // Verify state
  if (state !== req.session.state) {
    return res.status(400).send('State mismatch - possible CSRF attack');
  }
  
  try {
    // Exchange code for tokens
    const response = await axios.post(`${API_BASE_URL}/oauth/token`, {
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      redirect_uri: REDIRECT_URI,
      code_verifier: req.session.codeVerifier
    });
    
    const { access_token, refresh_token, expires_in } = response.data;
    
    // Store tokens securely
    req.session.accessToken = access_token;
    req.session.refreshToken = refresh_token;
    req.session.tokenExpiry = Date.now() + (expires_in * 1000);
    
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Token exchange failed:', error.response?.data);
    res.status(500).send('Authentication failed');
  }
});

// Route 3: Refresh Access Token
async function refreshAccessToken(session) {
  try {
    const response = await axios.post(`${API_BASE_URL}/oauth/token`, {
      grant_type: 'refresh_token',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: session.refreshToken
    });
    
    session.accessToken = response.data.access_token;
    session.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
    
    return response.data.access_token;
  } catch (error) {
    console.error('Token refresh failed:', error.response?.data);
    throw error;
  }
}

// Middleware: Check Token and Refresh if Needed
async function ensureValidToken(req, res, next) {
  if (!req.session.accessToken) {
    return res.redirect('/auth');
  }
  
  // Check if token is expired or will expire soon (5 min buffer)
  if (Date.now() >= req.session.tokenExpiry - 300000) {
    try {
      await refreshAccessToken(req.session);
    } catch (error) {
      return res.redirect('/auth');
    }
  }
  
  next();
}

// Route 4: Make API Requests
app.get('/api/agents', ensureValidToken, async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/v1/agents`, {
      headers: {
        'Authorization': `Bearer ${req.session.accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('API request failed:', error.response?.data);
    res.status(error.response?.status || 500).json({
      error: 'API request failed',
      details: error.response?.data
    });
  }
});

// Route 5: Execute AI Agent
app.post('/api/agents/:id/execute', ensureValidToken, async (req, res) => {
  const { id } = req.params;
  const { prompt, context } = req.body;
  
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/v1/agents/${id}/execute`,
      { prompt, context },
      {
        headers: {
          'Authorization': `Bearer ${req.session.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    res.json(response.data);
  } catch (error) {
    console.error('Agent execution failed:', error.response?.data);
    res.status(error.response?.status || 500).json({
      error: 'Agent execution failed',
      details: error.response?.data
    });
  }
});

// Route 6: Webhook Endpoint
app.post('/webhooks/resendit', express.json(), (req, res) => {
  const signature = req.headers['x-resendit-signature'];
  
  // Verify webhook signature
  const payload = JSON.stringify(req.body);
  const expectedSignature = 'sha256=' + 
    crypto.createHmac('sha256', CLIENT_SECRET)
      .update(payload)
      .digest('hex');
  
  if (signature !== expectedSignature) {
    return res.status(401).send('Invalid signature');
  }
  
  // Process webhook event
  const { event, timestamp, data } = req.body;
  
  console.log(`[Webhook] Received event: ${event} at ${timestamp}`);
  
  switch (event) {
    case 'agent.executed':
      console.log(`Agent ${data.agent_id} completed:`, data.result);
      break;
    case 'workflow.completed':
      console.log(`Workflow ${data.workflow_id} finished`);
      break;
    case 'asset.updated':
      console.log(`Asset ${data.asset_id} was updated`);
      break;
    default:
      console.log('Unknown event type:', event);
  }
  
  res.status(200).json({ received: true });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`OAuth flow starts at: http://localhost:${PORT}/auth`);
});
```

### Next.js App Router Example

Complete OAuth 2.1 implementation for Next.js applications:

#### 1. Environment Variables

```bash
# .env.local
RESENDIT_CLIENT_ID=your_client_id
RESENDIT_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=https://app.resendit.com
```

#### 2. Auth Route Handler

```typescript
// app/api/auth/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

const CLIENT_ID = process.env.RESENDIT_CLIENT_ID!;
const REDIRECT_URI = process.env.NEXT_PUBLIC_URL + '/api/auth/callback';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

function generateCodeVerifier() {
  return crypto.randomBytes(32).toString('base64url');
}

function generateCodeChallenge(verifier: string) {
  return crypto.createHash('sha256').update(verifier).digest('base64url');
}

export async function GET(request: NextRequest) {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const state = crypto.randomBytes(16).toString('hex');
  
  // Store in HTTP-only cookies
  cookies().set('code_verifier', codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600 // 10 minutes
  });
  
  cookies().set('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600
  });
  
  const authUrl = `${API_BASE_URL}/oauth/authorize?` +
    `response_type=code` +
    `&client_id=${CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&scope=execute_agents read_assets write_workflows` +
    `&state=${state}` +
    `&code_challenge=${codeChallenge}` +
    `&code_challenge_method=S256`;
  
  return NextResponse.redirect(authUrl);
}
```

#### 3. Callback Route Handler

```typescript
// app/api/auth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const CLIENT_ID = process.env.RESENDIT_CLIENT_ID!;
const CLIENT_SECRET = process.env.RESENDIT_CLIENT_SECRET!;
const REDIRECT_URI = process.env.NEXT_PUBLIC_URL + '/api/auth/callback';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  
  const cookieStore = cookies();
  const storedState = cookieStore.get('oauth_state')?.value;
  const codeVerifier = cookieStore.get('code_verifier')?.value;
  
  // Verify state
  if (!state || state !== storedState) {
    return NextResponse.json(
      { error: 'State mismatch' },
      { status: 400 }
    );
  }
  
  if (!code || !codeVerifier) {
    return NextResponse.json(
      { error: 'Missing code or verifier' },
      { status: 400 }
    );
  }
  
  try {
    // Exchange code for tokens
    const response = await fetch(`${API_BASE_URL}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        redirect_uri: REDIRECT_URI,
        code_verifier: codeVerifier
      })
    });
    
    if (!response.ok) {
      throw new Error('Token exchange failed');
    }
    
    const tokens = await response.json();
    
    // Store tokens in HTTP-only cookies
    cookieStore.set('access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokens.expires_in
    });
    
    cookieStore.set('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    });
    
    // Clean up temporary cookies
    cookieStore.delete('code_verifier');
    cookieStore.delete('oauth_state');
    
    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(new URL('/auth/error', request.url));
  }
}
```

#### 4. API Client Utility

```typescript
// lib/api-client.ts
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;
const CLIENT_ID = process.env.RESENDIT_CLIENT_ID!;
const CLIENT_SECRET = process.env.RESENDIT_CLIENT_SECRET!;

async function refreshAccessToken(refreshToken: string) {
  const response = await fetch(`${API_BASE_URL}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: refreshToken
    })
  });
  
  if (!response.ok) {
    throw new Error('Token refresh failed');
  }
  
  return response.json();
}

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
) {
  const cookieStore = cookies();
  let accessToken = cookieStore.get('access_token')?.value;
  const refreshToken = cookieStore.get('refresh_token')?.value;
  
  if (!accessToken && refreshToken) {
    // Try to refresh token
    try {
      const tokens = await refreshAccessToken(refreshToken);
      accessToken = tokens.access_token;
      
      cookieStore.set('access_token', tokens.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: tokens.expires_in
      });
    } catch (error) {
      throw new Error('Authentication required');
    }
  }
  
  if (!accessToken) {
    throw new Error('No access token available');
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  
  if (response.status === 401) {
    // Token expired, try refresh
    if (refreshToken) {
      const tokens = await refreshAccessToken(refreshToken);
      
      cookieStore.set('access_token', tokens.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: tokens.expires_in
      });
      
      // Retry request with new token
      return fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
    }
  }
  
  return response;
}

// Helper functions for common operations
export async function getAgents() {
  const response = await apiRequest('/api/v1/agents');
  if (!response.ok) throw new Error('Failed to fetch agents');
  return response.json();
}

export async function executeAgent(agentId: string, data: any) {
  const response = await apiRequest(`/api/v1/agents/${agentId}/execute`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to execute agent');
  return response.json();
}

export async function getAssets() {
  const response = await apiRequest('/api/v1/assets');
  if (!response.ok) throw new Error('Failed to fetch assets');
  return response.json();
}
```

#### 5. Server Action Example

```typescript
// app/actions/agent-actions.ts
'use server'

import { apiRequest } from '@/lib/api-client';

export async function executeAgentAction(agentId: string, prompt: string) {
  try {
    const response = await apiRequest(`/api/v1/agents/${agentId}/execute`, {
      method: 'POST',
      body: JSON.stringify({ prompt })
    });
    
    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message };
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
```

#### 6. Webhook Route Handler

```typescript
// app/api/webhooks/resendit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const CLIENT_SECRET = process.env.RESENDIT_CLIENT_SECRET!;

function verifySignature(payload: string, signature: string): boolean {
  const expectedSignature = 'sha256=' + 
    crypto.createHmac('sha256', CLIENT_SECRET)
      .update(payload)
      .digest('hex');
  
  return signature === expectedSignature;
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get('x-resendit-signature');
  
  if (!signature) {
    return NextResponse.json(
      { error: 'Missing signature' },
      { status: 401 }
    );
  }
  
  const payload = await request.text();
  
  if (!verifySignature(payload, signature)) {
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 401 }
    );
  }
  
  const event = JSON.parse(payload);
  
  // Process webhook event
  console.log(`[Webhook] ${event.event}:`, event.data);
  
  switch (event.event) {
    case 'agent.executed':
      // Handle agent execution completion
      await handleAgentExecuted(event.data);
      break;
    case 'workflow.completed':
      // Handle workflow completion
      await handleWorkflowCompleted(event.data);
      break;
    case 'asset.updated':
      // Handle asset updates
      await handleAssetUpdated(event.data);
      break;
    default:
      console.log('Unknown event type:', event.event);
  }
  
  return NextResponse.json({ received: true });
}

async function handleAgentExecuted(data: any) {
  // Your business logic here
  console.log('Agent executed:', data.agent_id);
}

async function handleWorkflowCompleted(data: any) {
  // Your business logic here
  console.log('Workflow completed:', data.workflow_id);
}

async function handleAssetUpdated(data: any) {
  // Your business logic here
  console.log('Asset updated:', data.asset_id);
}
```

## Best Practices

### Security
- Always use HTTPS in production
- Store client secrets securely (environment variables, never in code)
- Implement proper CSRF protection with state parameter
- Verify webhook signatures
- Use HTTP-only cookies for token storage
- Implement token refresh logic
- Set appropriate token expiration times

### Error Handling
- Handle token expiration gracefully
- Implement retry logic for transient failures
- Log errors for debugging
- Provide clear error messages to users

### Performance
- Cache tokens appropriately
- Implement connection pooling for API requests
- Use webhooks instead of polling
- Batch API requests when possible

## Support

For additional help:
- Documentation: https://docs.resendit.com
- API Reference: https://docs.resendit.com/api
- Support: support@resendit.com
