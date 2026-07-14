"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { UserMenuClient } from "@/components/client/user-menu-client"
import { Menu, Bell, Search, Settings, Activity, Zap } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DashboardSidebar } from "./dashboard-sidebar"
import { useDashboardMetrics } from "@/lib/hooks/use-ai-suite"
import type { User } from "@supabase/supabase-js"

interface DashboardHeaderProps {
  user: User
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { data: metrics } = useDashboardMetrics()

  return (
    <>
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex h-12 lg:h-14 items-center justify-between px-3 lg:px-6">
          <div className="flex items-center gap-2 lg:gap-4">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden h-10 w-10 p-0">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full max-w-[320px] p-0 h-full safe-area-inset">
                <DashboardSidebar isMobile onNavigate={() => setMobileMenuOpen(false)} />
              </SheetContent>
            </Sheet>

            <div className="relative hidden md:block">
              <Search className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
              <Input placeholder="Search assets, agents..." className="w-48 lg:w-64 pl-7 h-8 text-xs lg:text-sm" />
            </div>
          </div>

          <div className="flex items-center gap-1 lg:gap-2">
            <div className="hidden lg:flex items-center gap-2 mr-2">
              <div className="flex items-center gap-1">
                <Activity className="h-3 w-3 text-green-600" />
                <span className="text-xs text-muted-foreground">{metrics?.totalAgents || 0} agents</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-blue-600" />
                <span className="text-xs text-muted-foreground">{metrics?.successRate || 0}% success</span>
              </div>
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative h-8 w-8 p-0">
              <Bell className="h-3 w-3 lg:h-4 lg:w-4" />
              <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 text-xs">
                {metrics?.recentAnalysis || 0}
              </Badge>
            </Button>

            {/* Settings */}
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Settings className="h-3 w-3 lg:h-4 lg:w-4" />
            </Button>

            <UserMenuClient user={user} />
          </div>
        </div>

        <div className="border-t border-border/50 bg-muted/30 px-3 lg:px-6 py-1.5 lg:py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 lg:gap-4 text-xs lg:text-sm text-muted-foreground">
              <span className="font-medium">AI Suite Dashboard</span>
              <span className="text-xs">•</span>
              <span className="text-xs">
                {metrics?.totalAssets || 0} assets • {metrics?.activeWorkflows || 0} workflows
              </span>
            </div>
            <div className="flex items-center gap-1 lg:gap-2">
              <Badge variant="outline" className="text-xs h-5">
                Enterprise
              </Badge>
              <Badge variant="secondary" className="text-xs h-5 bg-green-100 text-green-800 hidden lg:inline-flex">
                <div className="w-1.5 h-1.5 bg-green-600 rounded-full mr-1" />
                Live Data
              </Badge>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
