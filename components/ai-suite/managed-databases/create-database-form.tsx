"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createSupabaseProjectFormSchema } from "@/lib/schemas/managed-databases"
import type { CreateSupabaseProjectFormValues, SupabaseProjectRegion } from "@/lib/types/database"
import { availableSupabaseRegions } from "@/lib/types/database"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useState } from "react"

interface CreateDatabaseFormProps {
  onSubmit: (data: CreateSupabaseProjectFormValues) => void
  onCancel: () => void
  isLoading: boolean
}

export function CreateDatabaseForm({ onSubmit, onCancel, isLoading }: CreateDatabaseFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const form = useForm<CreateSupabaseProjectFormValues>({
    resolver: zodResolver(createSupabaseProjectFormSchema),
    defaultValues: {
      displayName: "",
      supabaseProjectName: "",
      region: "us-east-1", // Default region
      dbPass: "",
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Supabase Database</CardTitle>
        <CardDescription>
          This will provision a new Supabase project (Free Tier) under your account. The project name must be unique
          across Supabase.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name *</Label>
            <Input id="displayName" {...form.register("displayName")} placeholder="My AI Analytics DB" />
            {form.formState.errors.displayName && (
              <p className="text-sm text-red-600">{form.formState.errors.displayName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="supabaseProjectName">Supabase Project Name *</Label>
            <Input
              id="supabaseProjectName"
              {...form.register("supabaseProjectName")}
              placeholder="ai-analytics-db-unique"
            />
            <p className="text-xs text-muted-foreground">
              Lowercase letters, numbers, and hyphens only. Must be globally unique.
            </p>
            {form.formState.errors.supabaseProjectName && (
              <p className="text-sm text-red-600">{form.formState.errors.supabaseProjectName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="region">Region *</Label>
            <Select
              value={form.watch("region")}
              onValueChange={(value) => form.setValue("region", value as SupabaseProjectRegion)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a region" />
              </SelectTrigger>
              <SelectContent>
                {availableSupabaseRegions.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.region && (
              <p className="text-sm text-red-600">{form.formState.errors.region.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dbPass">Database Password *</Label>
            <div className="relative">
              <Input
                id="dbPass"
                type={showPassword ? "text" : "password"}
                {...form.register("dbPass")}
                placeholder="Min 8 characters"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {form.formState.errors.dbPass && (
              <p className="text-sm text-red-600">{form.formState.errors.dbPass.message}</p>
            )}
          </div>

          <div className="flex items-center justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Database
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
