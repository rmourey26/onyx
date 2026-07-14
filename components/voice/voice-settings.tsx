"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"

interface VoiceSettingsProps {
  userId: string
}

export function VoiceSettings({ userId }: VoiceSettingsProps) {
  return (
    <div className="space-y-6">
      <Card className="enterprise-card">
        <CardHeader>
          <CardTitle>Voice Recognition Settings</CardTitle>
          <CardDescription>Configure how your voice commands are processed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-process after recording</Label>
              <p className="text-sm text-muted-foreground">Automatically process voice after you stop speaking</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="space-y-2">
            <Label>Recognition Language</Label>
            <Select defaultValue="en">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Minimum Confidence Threshold: 40%</Label>
            <Slider defaultValue={[40]} min={0} max={100} step={5} />
            <p className="text-xs text-muted-foreground">
              Commands below this confidence level will require clarification
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="enterprise-card">
        <CardHeader>
          <CardTitle>Voice Synthesis Settings</CardTitle>
          <CardDescription>Configure how the assistant speaks to you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable voice responses</Label>
              <p className="text-sm text-muted-foreground">Hear responses spoken aloud</p>
            </div>
            <Switch />
          </div>

          <div className="space-y-2">
            <Label>Voice</Label>
            <Select defaultValue="default">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Speaking Rate: Normal</Label>
            <Slider defaultValue={[50]} min={25} max={200} step={25} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
