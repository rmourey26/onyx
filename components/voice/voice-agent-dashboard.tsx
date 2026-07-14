"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mic, Network, Zap, Activity, History, Settings } from "lucide-react"
import { VoiceConversationInterface } from "./voice-conversation-interface"
import { VoiceSessionHistory } from "./voice-session-history"
import { VoiceSettings } from "./voice-settings"

interface VoiceAgentDashboardProps {
  userId: string
  initialSessions: any[]
  hasAetherNet: boolean
  aethernetConnection?: any
}

export function VoiceAgentDashboard({
  userId,
  initialSessions,
  hasAetherNet,
  aethernetConnection,
}: VoiceAgentDashboardProps) {
  const [activeTab, setActiveTab] = useState("conversation")
  const [isAetherNetMode, setIsAetherNetMode] = useState(false)

  return (
    <div className="flex flex-col min-h-screen p-4 md:p-6 lg:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">Voice Agent</h1>
          <p className="text-muted-foreground text-balance">
            Converse with your AI assistant to execute platform functionality
          </p>
        </div>

        <div className="flex items-center gap-3">
          {hasAetherNet && (
            <Button
              variant={isAetherNetMode ? "default" : "outline"}
              onClick={() => setIsAetherNetMode(!isAetherNetMode)}
              className="gap-2"
            >
              <Network className="h-4 w-4" />
              {isAetherNetMode ? "AetherNet Active" : "Enable AetherNet"}
            </Button>
          )}

          <Badge variant={hasAetherNet ? "default" : "secondary"} className="gap-1.5 px-3 py-1.5">
            <Activity className="h-3.5 w-3.5" />
            {hasAetherNet ? "Connected" : "Standard Mode"}
          </Badge>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="enterprise-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Mic className="h-4 w-4 text-primary" />
              Voice Commands
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">Ready</p>
            <p className="text-xs text-muted-foreground mt-1">Click to start speaking</p>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Processing Speed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">~2.5s</p>
            <p className="text-xs text-muted-foreground mt-1">Average response time</p>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <History className="h-4 w-4 text-primary" />
              Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{initialSessions.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Total conversations</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex mb-6">
          <TabsTrigger value="conversation" className="gap-2">
            <Mic className="h-4 w-4" />
            <span className="hidden sm:inline">Conversation</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">History</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="conversation" className="flex-1 flex flex-col min-h-0 mt-0">
          <VoiceConversationInterface
            userId={userId}
            isAetherNetMode={isAetherNetMode}
            aethernetConnection={aethernetConnection}
          />
        </TabsContent>

        <TabsContent value="history" className="flex-1 overflow-y-auto mt-0">
          <VoiceSessionHistory userId={userId} initialSessions={initialSessions} />
        </TabsContent>

        <TabsContent value="settings" className="flex-1 overflow-y-auto mt-0">
          <VoiceSettings userId={userId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
