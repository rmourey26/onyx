"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Users, Zap, Shield } from "lucide-react"

export function MarketplaceStats() {
  const stats = [
    {
      icon: TrendingUp,
      label: "Active Agents",
      value: "2,847",
      change: "+12%",
      changeType: "positive" as const,
    },
    {
      icon: Users,
      label: "Developers",
      value: "15,234",
      change: "+8%",
      changeType: "positive" as const,
    },
    {
      icon: Zap,
      label: "Deployments",
      value: "89.2K",
      change: "+24%",
      changeType: "positive" as const,
    },
    {
      icon: Shield,
      label: "Uptime",
      value: "99.9%",
      change: "Stable",
      changeType: "neutral" as const,
    },
  ]

  return (
    <div className="border-b bg-muted/30">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="enterprise-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <stat.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-muted-foreground truncate">{stat.label}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-bold">{stat.value}</p>
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded-full ${
                          stat.changeType === "positive"
                            ? "bg-accent/10 text-accent"
                            : stat.changeType === "negative"
                              ? "bg-destructive/10 text-destructive"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {stat.change}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
