import { type NextRequest, NextResponse } from "next/server"
import { validateAPIKeyWithContext } from "@/app/actions/api-keys"

export async function authenticateAPIKey(request: NextRequest): Promise<NextResponse | null> {
  const authHeader = request.headers.get("authorization")

  if (!authHeader) {
    return NextResponse.json({ error: "Missing Authorization header" }, { status: 401 })
  }

  // Support both "Bearer token" and "token" formats
  const token = authHeader.replace(/^Bearer\s+/i, "")

  if (!token) {
    return NextResponse.json({ error: "Invalid Authorization header format" }, { status: 401 })
  }

  // Validate the API key using the new function that sets RLS context
  const result = await validateAPIKeyWithContext(token)

  // Hard-fail if the RPC reported valid but is missing the identity fields we
  // need -- never fall back to a partially-built/undefined identity.
  if (!result.valid || !result.userId || !result.apiKeyId) {
    return NextResponse.json({ error: result.error || "Invalid API key" }, { status: 401 })
  }

  // Add user_id and scopes to request headers for downstream use
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-user-id", result.userId)
  requestHeaders.set("x-api-key-id", result.apiKeyId)

  if (result.scopes) {
    requestHeaders.set("x-api-key-scopes", JSON.stringify(result.scopes))
  }

  return null // Authentication successful, continue to route handler
}

export function getUserIdFromRequest(request: NextRequest): string | null {
  return request.headers.get("x-user-id")
}

export function getAPIKeyIdFromRequest(request: NextRequest): string | null {
  return request.headers.get("x-api-key-id")
}

export function hasScope(request: NextRequest, requiredScope: string): boolean {
  const scopesHeader = request.headers.get("x-api-key-scopes")
  if (!scopesHeader) return false

  try {
    const scopes = JSON.parse(scopesHeader) as string[]
    return scopes.includes(requiredScope)
  } catch {
    return false
  }
}

export function requireScopes(request: NextRequest, requiredScopes: string[]): NextResponse | null {
  for (const scope of requiredScopes) {
    if (!hasScope(request, scope)) {
      return NextResponse.json({ error: `Missing required scope: ${scope}` }, { status: 403 })
    }
  }
  return null
}
