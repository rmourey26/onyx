"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Shield, Clock, Key, Bell, AlertTriangle, Globe } from "lucide-react"
import { getUserSettings, updateSecuritySettings, type SecuritySettings } from "@/app/actions/user-settings-actions"
import { Slider } from "@/components/ui/slider"

export function SecuritySettingsComponent() {
  const [settings, setSettings] = useState<SecuritySettings>({
    two_factor_enabled: false,
    session_timeout: 60,
    api_key_rotation_days: 90,
    login_notifications: true,
    suspicious_activity_alerts: true,
    allowed_ip_addresses: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [newIpAddress, setNewIpAddress] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setIsLoading(true)
    const result = await getUserSettings("security")
    if (result.success && result.data) {
      setSettings(result.data as SecuritySettings)
    }
    setIsLoading(false)
  }

  const handleToggle = (key: keyof SecuritySettings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSliderChange = (key: keyof SecuritySettings, value: number[]) => {
    setSettings((prev) => ({ ...prev, [key]: value[0] }))
  }

  const handleAddIpAddress = () => {
    if (newIpAddress && !settings.allowed_ip_addresses.includes(newIpAddress)) {
      setSettings((prev) => ({
        ...prev,
        allowed_ip_addresses: [...prev.allowed_ip_addresses, newIpAddress],
      }))
      setNewIpAddress("")
    }
  }

  const handleRemoveIpAddress = (ip: string) => {
    setSettings((prev) => ({
      ...prev,
      allowed_ip_addresses: prev.allowed_ip_addresses.filter((addr) => addr !== ip),
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    const result = await updateSecuritySettings(settings)

    if (result.success) {
      toast({
        title: "Settings saved",
        description: "Your security preferences have been updated.",
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
            <Shield className="h-5 w-5" />
            Authentication & Access
          </CardTitle>
          <CardDescription>Manage your account security and authentication settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="two_factor_enabled" className="text-base font-medium">
                  Two-Factor Authentication
                </Label>
                <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
              </div>
            </div>
            <Switch
              id="two_factor_enabled"
              checked={settings.two_factor_enabled}
              onCheckedChange={() => handleToggle("two_factor_enabled")}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <Label htmlFor="session_timeout" className="text-base font-medium">
                  Session Timeout
                </Label>
                <p className="text-sm text-muted-foreground">
                  Automatically log out after {settings.session_timeout} minutes of inactivity
                </p>
              </div>
            </div>
            <Slider
              id="session_timeout"
              min={5}
              max={1440}
              step={5}
              value={[settings.session_timeout]}
              onValueChange={(value) => handleSliderChange("session_timeout", value)}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5 min</span>
              <span>24 hours</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Key className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <Label htmlFor="api_key_rotation_days" className="text-base font-medium">
                  API Key Rotation
                </Label>
                <p className="text-sm text-muted-foreground">
                  Rotate API keys every {settings.api_key_rotation_days} days
                </p>
              </div>
            </div>
            <Slider
              id="api_key_rotation_days"
              min={30}
              max={365}
              step={30}
              value={[settings.api_key_rotation_days]}
              onValueChange={(value) => handleSliderChange("api_key_rotation_days", value)}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>30 days</span>
              <span>365 days</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security Alerts</CardTitle>
          <CardDescription>Get notified about security events</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="login_notifications" className="text-base font-medium">
                  Login Notifications
                </Label>
                <p className="text-sm text-muted-foreground">Get notified when someone logs into your account</p>
              </div>
            </div>
            <Switch
              id="login_notifications"
              checked={settings.login_notifications}
              onCheckedChange={() => handleToggle("login_notifications")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="suspicious_activity_alerts" className="text-base font-medium">
                  Suspicious Activity Alerts
                </Label>
                <p className="text-sm text-muted-foreground">Get notified about unusual account activity</p>
              </div>
            </div>
            <Switch
              id="suspicious_activity_alerts"
              checked={settings.suspicious_activity_alerts}
              onCheckedChange={() => handleToggle("suspicious_activity_alerts")}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            IP Address Whitelist
          </CardTitle>
          <CardDescription>Restrict access to your account from specific IP addresses</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter IP address (e.g., 192.168.1.1)"
              value={newIpAddress}
              onChange={(e) => setNewIpAddress(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddIpAddress()}
            />
            <Button onClick={handleAddIpAddress} variant="outline">
              Add
            </Button>
          </div>

          {settings.allowed_ip_addresses.length > 0 ? (
            <div className="space-y-2">
              {settings.allowed_ip_addresses.map((ip) => (
                <div key={ip} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="font-mono text-sm">{ip}</span>
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveIpAddress(ip)}>
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No IP addresses whitelisted. Access is allowed from any IP.</p>
          )}
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
