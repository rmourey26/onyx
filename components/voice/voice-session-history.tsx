"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, MessageSquare, Activity, Trash2 } from "lucide-react"

interface VoiceSessionHistoryProps {
  userId: string
  initialSessions: any[]
}

export function VoiceSessionHistory({ userId, initialSessions }: VoiceSessionHistoryProps) {
  return (
    <div className="space-y-4">
      <Card className="enterprise-card">
        <CardHeader>
          <CardTitle>Session History</CardTitle>
          <CardDescription>View your past voice conversations and sessions</CardDescription>
        </CardHeader>
        <CardContent>
          {initialSessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No voice sessions yet. Start a conversation to see your history here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {initialSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{session.session_name}</h4>
                      <Badge variant={session.is_active ? "default" : "secondary"}>
                        {session.is_active ? "Active" : "Ended"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(session.created_at).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5" />
                        {session.total_commands} commands
                      </span>
                      <span className="flex items-center gap-1">
                        <Activity className="h-3.5 w-3.5" />
                        {session.successful_commands}/{session.total_commands} successful
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
