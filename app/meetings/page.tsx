import { createSupbaseServerClient } from "@/utils/supaone"
import { getMeetings } from "@/lib/db-actions"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function MeetingsPage() {
  const supabase = createSupbaseServerClient()
  const {
    data: { session },
  } = await (await supabase).auth.getSession()

  if (!session) {
    redirect("/login")
  }

  const { meetings, error } = await getMeetings(session.user.id)

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Your Meetings</h1>
      {meetings.length === 0 ? (
        <p>You have no scheduled meetings.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {meetings.map((meeting) => (
            <Card key={meeting.id}>
              <CardHeader>
                <CardTitle>{meeting.summary}</CardTitle>
                <CardDescription>{new Date(meeting.start_time).toLocaleString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>{meeting.description}</p>
                <Button asChild className="mt-4">
                  <a href={meeting.meet_link} target="_blank" rel="noopener noreferrer">
                    Join Meeting
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Button asChild className="mt-8">
        <Link href="/">Back to Home</Link>
      </Button>
    </div>
  )
}

