// Original implementation used google-auth-library which doesn't work in browser-based preview

"use server"

/**
 * Stub implementation for generating Google OAuth URL.
 * In production, this would use the Google OAuth2 client.
 */
export async function getAuthUrl() {
  console.log("[v0] Google Auth integration disabled for preview mode")
  return "https://accounts.google.com/o/oauth2/auth?mock=true"
}

/**
 * Stub implementation for exchanging authorization code for tokens.
 * In production, this would exchange the code with Google's OAuth2 service.
 */
export async function getTokens(code: string) {
  console.log("[v0] Google Auth integration disabled for preview mode")
  return {
    access_token: "mock-access-token",
    refresh_token: "mock-refresh-token",
    expiry_date: Date.now() + 3600000,
  }
}

/**
 * Stub implementation for setting credentials.
 * In production, this would configure the OAuth2 client with real tokens.
 */
export async function setCredentials(tokens: any) {
  console.log("[v0] Google Auth integration disabled for preview mode")
  return null
}

// Export a mock oauth2Client for compatibility
export const oauth2Client = null
