"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Bell, Mail, Workflow, Bot, Package, Shield, TrendingUp } from "lucide-react"
import {
  getUserSettings,
  updateNotificationSettings,
  type NotificationSettings,
} from "@/app/actions/user-settings-actions"

export function NotificationSettingsComponent() {
  const [settings, setSettings] = useState<NotificationSettings>({
    email_notifications: true,
    workflow_notifications: true,
    agent_notifications: true,
    asset_notifications: true,
    security_alerts: true,
    marketing_emails: false,
    weekly_digest: true,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setIsLoading(true)
    const result = await getUserSettings("notifications")
    if (result.success && result.data) {
      setSettings(result.data as NotificationSettings)
    }
    setIsLoading(false)
  }

  const handleToggle = (key: keyof NotificationSettings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    const result = await updateNotificationSettings(settings)

    if (result.success) {
      toast({
        title: "Settings saved",
        description: "Your notification preferences have been updated.",
      })
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to save settings",
        variant: "destructive",
      })
    }
    setIsSaving(false)
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Email Notifications
          </CardTitle>
          <CardDescription>Configure how you receive email notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="email_notifications" className="text-base font-medium">
                  Email Notifications
                </Label>
                <p className="text-sm text-muted-foreground">Receive all notifications via email</p>
              </div>
            </div>
            <Switch
              id="email_notifications"
              checked={settings.email_notifications}
              onCheckedChange={() => handleToggle("email_notifications")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="weekly_digest" className="text-base font-medium">
                  Weekly Digest
                </Label>
                <p className="text-sm text-muted-foreground">Receive a weekly summary of your activity</p>
              </div>
            </div>
            <Switch
              id="weekly_digest"
              checked={settings.weekly_digest}
              onCheckedChange={() => handleToggle("weekly_digest")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="marketing_emails" className="text-base font-medium">
                  Marketing Emails
                </Label>
                <p className="text-sm text-muted-foreground">Receive updates about new features and promotions</p>
              </div>
            </div>
            <Switch
              id="marketing_emails"
              checked={settings.marketing_emails}
              onCheckedChange={() => handleToggle("marketing_emails")}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activity Notifications</CardTitle>
          <CardDescription>Get notified about important events in your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Workflow className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="workflow_notifications" className="text-base font-medium">
                  Workflow Notifications
                </Label>
                <p className="text-sm text-muted-foreground">Get notified when workflows complete or fail</p>
              </div>
            </div>
            <Switch
              id="workflow_notifications"
              checked={settings.workflow_notifications}
              onCheckedChange={() => handleToggle("workflow_notifications")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bot className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="agent_notifications" className="text-base font-medium">
                  Agent Notifications
                </Label>
                <p className="text-sm text-muted-foreground">Get notified about AI agent executions</p>
              </div>
            </div>
            <Switch
              id="agent_notifications"
              checked={settings.agent_notifications}
              onCheckedChange={() => handleToggle("agent_notifications")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="asset_notifications" className="text-base font-medium">
                  Asset Notifications
                </Label>
                <p className="text-sm text-muted-foreground">Get notified about asset intelligence updates</p>
              </div>
            </div>
            <Switch
              id="asset_notifications"
              checked={settings.asset_notifications}
              onCheckedChange={() => handleToggle("asset_notifications")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="security_alerts" className="text-base font-medium">
                  Security Alerts
                </Label>
                <p className="text-sm text-muted-foreground">Get notified about security events</p>
              </div>
            </div>
            <Switch
              id="security_alerts"
              checked={settings.security_alerts}
              onCheckedChange={() => handleToggle("security_alerts")}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </div>
  )
}
