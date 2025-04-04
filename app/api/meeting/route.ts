import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { decrypt } from "@/lib/encryption"
import { setCredentials } from "@/lib/google-auth"
import { createMeetingWithGoogleMeet, type MeetingDetails } from "@/lib/calendar-service"

export async function POST(request: NextRequest) {
  // Get tokens from cookie
  const encryptedTokens = cookies().get("google_tokens")?.value

  if (!encryptedTokens) {
    return NextResponse.json({ error: "Not authenticated with Google" }, { status: 401 })
  }

  try {
    // Decrypt tokens and set credentials
    const tokens = JSON.parse(await decrypt(encryptedTokens))
    setCredentials(tokens)

    // Parse meeting details from request
    const meetingDetails: MeetingDetails = await request.json()

    // Create meeting with Google Meet
    const result = await createMeetingWithGoogleMeet({
      ...meetingDetails,
      startTime: new Date(meetingDetails.startTime),
      endTime: new Date(meetingDetails.endTime),
    })

    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error("Error creating meeting:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}

