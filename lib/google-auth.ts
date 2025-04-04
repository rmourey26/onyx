"use server"

import { OAuth2Client } from "google-auth-library"

// Initialize the OAuth2 client with your credentials
const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.NODE_ENV === "production"
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback/google`
    : "http://localhost:3000/api/auth/callback/google",
)

// Generate a URL for the user to authorize the application
export async function getAuthUrl() {
  const scopes = ["https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/calendar.events"]

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent",
  })
}

// Exchange the authorization code for tokens
export async function getTokens(code: string) {
  const { tokens } = await oauth2Client.getToken(code)
  oauth2Client.setCredentials(tokens)
  return tokens
}

// Set credentials from existing tokens
export async function setCredentials(tokens: any) {
  oauth2Client.setCredentials(tokens)
  return oauth2Client
}

// Export the oauth2Client for use in other server components
export { oauth2Client }

