"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Settings, Bell, Shield, DollarSign, CheckCircle } from "lucide-react"
import { useState } from "react"

interface AgentConfigPanelProps {
  user: any
}

export function AgentConfigPanel({ user }: AgentConfigPanelProps) {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    errors: true,
    performance: false,
  })

  const [limits, setLimits] = useState({
    requestsPerMinute: [100],
    maxConcurrentRequests: [10],
    timeoutSeconds: [30],
  })

  const [billing, setBilling] = useState({
    autoScaling: true,
    budgetLimit: 500,
    alertThreshold: 80,
  })

  return (
    <div className="space-y-6">
      {/* Notification Settings */}
      <Card className="enterprise-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
          <CardDescription>Configure how you want to be notified about agent activities</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive email alerts for important events</p>
            </div>
            <Switch
              checked={notifications.email}
              onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, email: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Push Notifications</Label>
              <p className="text-sm text-muted-foreground">Get real-time push notifications</p>
            </div>
            <Switch
              checked={notifications.push}
              onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, push: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Error Alerts</Label>
              <p className="text-sm text-muted-foreground">Alert me when agents encounter errors</p>
            </div>
            <Switch
              checked={notifications.errors}
              onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, errors: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Performance Alerts</Label>
              <p className="text-sm text-muted-foreground">Notify me about performance issues</p>
            </div>
            <Switch
              checked={notifications.performance}
              onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, performance: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Rate Limiting */}
      <Card className="enterprise-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Rate Limiting & Security
          </CardTitle>
          <CardDescription>Configure rate limits and security settings for your agents</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Requests per Minute: {limits.requestsPerMinute[0]}</Label>
            <Slider
              value={limits.requestsPerMinute}
              onValueChange={(value) => setLimits((prev) => ({ ...prev, requestsPerMinute: value }))}
              max={1000}
              min={10}
              step={10}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">Maximum number of requests per minute per agent</p>
          </div>

          <div className="space-y-2">
            <Label>Max Concurrent Requests: {limits.maxConcurrentRequests[0]}</Label>
            <Slider
              value={limits.maxConcurrentRequests}
              onValueChange={(value) => setLimits((prev) => ({ ...prev, maxConcurrentRequests: value }))}
              max={50}
              min={1}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">Maximum number of simultaneous requests</p>
          </div>

          <div className="space-y-2">
            <Label>Request Timeout: {limits.timeoutSeconds[0]}s</Label>
            <Slider
              value={limits.timeoutSeconds}
              onValueChange={(value) => setLimits((prev) => ({ ...prev, timeoutSeconds: value }))}
              max={300}
              min={5}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">Maximum time to wait for agent response</p>
          </div>
        </CardContent>
      </Card>

      {/* Billing & Usage */}
      <Card className="enterprise-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Billing & Usage Controls
          </CardTitle>
          <CardDescription>Manage your spending and usage limits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-scaling</Label>
              <p className="text-sm text-muted-foreground">Automatically scale agents based on demand</p>
            </div>
            <Switch
              checked={billing.autoScaling}
              onCheckedChange={(checked) => setBilling((prev) => ({ ...prev, autoScaling: checked }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget-limit">Monthly Budget Limit ($)</Label>
            <Input
              id="budget-limit"
              type="number"
              value={billing.budgetLimit}
              onChange={(e) => setBilling((prev) => ({ ...prev, budgetLimit: Number(e.target.value) }))}
              placeholder="500"
            />
            <p className="text-xs text-muted-foreground">Set a monthly spending limit for all agents</p>
          </div>

          <div className="space-y-2">
            <Label>Budget Alert Threshold: {billing.alertThreshold}%</Label>
            <Slider
              value={[billing.alertThreshold]}
              onValueChange={(value) => setBilling((prev) => ({ ...prev, alertThreshold: value[0] }))}
              max={100}
              min={50}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">Get alerted when you reach this percentage of your budget</p>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            <CheckCircle className="h-4 w-4 text-accent" />
            <div className="text-sm">
              <p className="font-medium">Current Usage: $127.50 / $500.00</p>
              <p className="text-muted-foreground">25.5% of monthly budget used</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Settings */}
      <div className="flex justify-end">
        <Button className="enterprise-button">
          <Settings className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  )
}
