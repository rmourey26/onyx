"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { createDatabaseConnectionSchema, updateDatabaseConnectionSchema } from "@/lib/schemas/data-sources"
import type {
  DatabaseConnection,
  CreateDatabaseConnectionInput,
  UpdateDatabaseConnectionInput,
} from "@/lib/types/database"

interface DatabaseConnectionFormProps {
  connection?: DatabaseConnection | null
  onSubmit: (data: CreateDatabaseConnectionInput | UpdateDatabaseConnectionInput) => void
  onCancel: () => void
  isLoading: boolean
}

export function DatabaseConnectionForm({ connection, onSubmit, onCancel, isLoading }: DatabaseConnectionFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [connectionMethod, setConnectionMethod] = useState<"individual" | "string">("individual")
  const isEditing = !!connection

  const schema = isEditing ? updateDatabaseConnectionSchema : createDatabaseConnectionSchema

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: connection?.name || "",
      description: connection?.description || "",
      connection_type: connection?.connection_type || "postgresql",
      host: connection?.host || "",
      port: connection?.port || 5432,
      database_name: connection?.database_name || "",
      username: connection?.username || "",
      password: "", // Always empty for security
      connection_string: connection?.connection_string || "",
      ssl_mode: connection?.ssl_mode || "prefer",
      is_active: connection?.is_active ?? true,
      additional_params: connection?.additional_params || {},
    },
  })

  const selectedType = form.watch("connection_type")

  useEffect(() => {
    // Set default ports based on database type
    const defaultPorts = {
      postgresql: 5432,
      mysql: 3306,
      sqlserver: 1433,
      bigquery: 443,
      snowflake: 443,
    }

    if (selectedType && defaultPorts[selectedType as keyof typeof defaultPorts]) {
      form.setValue("port", defaultPorts[selectedType as keyof typeof defaultPorts])
    }
  }, [selectedType, form])

  const handleSubmit = (data: any) => {
    // Clean up the data based on connection method
    if (connectionMethod === "string") {
      // Clear individual connection fields when using connection string
      data.host = null
      data.port = null
      data.database_name = null
      data.username = null
      data.password = null
    } else {
      // Clear connection string when using individual fields
      data.connection_string = null
    }

    onSubmit(data)
  }

  const getDatabaseTypeDescription = (type: string) => {
    const descriptions = {
      postgresql: "PostgreSQL database connection",
      mysql: "MySQL/MariaDB database connection",
      sqlserver: "Microsoft SQL Server connection",
      bigquery: "Google BigQuery data warehouse",
      snowflake: "Snowflake cloud data platform",
    }
    return descriptions[type as keyof typeof descriptions] || "Database connection"
  }

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            {isEditing ? "Edit Database Connection" : "Add Database Connection"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update your database connection settings"
              : "Connect to an external database for AI processing"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Connection Name *</Label>
                  <Input id="name" {...form.register("name")} placeholder="My Production DB" />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="connection_type">Database Type *</Label>
                  <Select
                    value={form.watch("connection_type")}
                    onValueChange={(value) => form.setValue("connection_type", value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="postgresql">PostgreSQL</SelectItem>
                      <SelectItem value="mysql">MySQL</SelectItem>
                      <SelectItem value="sqlserver">SQL Server</SelectItem>
                      <SelectItem value="bigquery">BigQuery</SelectItem>
                      <SelectItem value="snowflake">Snowflake</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.connection_type && (
                    <p className="text-sm text-red-600">{form.formState.errors.connection_type.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...form.register("description")}
                  placeholder="Optional description of this database connection"
                  rows={2}
                />
              </div>

              <Alert>
                <AlertDescription>{getDatabaseTypeDescription(selectedType)}</AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Connection Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Connection Details</CardTitle>
              <CardDescription>Choose how you want to configure the connection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Button
                  type="button"
                  variant={connectionMethod === "individual" ? "default" : "outline"}
                  onClick={() => setConnectionMethod("individual")}
                  size="sm"
                >
                  Individual Fields
                </Button>
                <Button
                  type="button"
                  variant={connectionMethod === "string" ? "default" : "outline"}
                  onClick={() => setConnectionMethod("string")}
                  size="sm"
                >
                  Connection String
                </Button>
              </div>

              {connectionMethod === "individual" ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="host">Host *</Label>
                      <Input id="host" {...form.register("host")} placeholder="localhost" />
                      {form.formState.errors.host && (
                        <p className="text-sm text-red-600">{form.formState.errors.host.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="port">Port *</Label>
                      <Input
                        id="port"
                        type="number"
                        {...form.register("port", { valueAsNumber: true })}
                        placeholder="5432"
                      />
                      {form.formState.errors.port && (
                        <p className="text-sm text-red-600">{form.formState.errors.port.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="database_name">Database Name *</Label>
                      <Input id="database_name" {...form.register("database_name")} placeholder="myapp_production" />
                      {form.formState.errors.database_name && (
                        <p className="text-sm text-red-600">{form.formState.errors.database_name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="username">Username *</Label>
                      <Input id="username" {...form.register("username")} placeholder="dbuser" />
                      {form.formState.errors.username && (
                        <p className="text-sm text-red-600">{form.formState.errors.username.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password {!isEditing && "*"}</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        {...form.register("password")}
                        placeholder={isEditing ? "Leave blank to keep current password" : "Enter password"}
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
                    {form.formState.errors.password && (
                      <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ssl_mode">SSL Mode</Label>
                    <Select value={form.watch("ssl_mode")} onValueChange={(value) => form.setValue("ssl_mode", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="disable">Disable</SelectItem>
                        <SelectItem value="prefer">Prefer</SelectItem>
                        <SelectItem value="require">Require</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="connection_string">Connection String *</Label>
                  <Textarea
                    id="connection_string"
                    {...form.register("connection_string")}
                    placeholder="postgresql://username:password@host:port/database"
                    rows={3}
                  />
                  {form.formState.errors.connection_string && (
                    <p className="text-sm text-red-600">{form.formState.errors.connection_string.message}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Enter the complete connection string for your database
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Active Connection</Label>
                  <p className="text-sm text-muted-foreground">Enable this connection for use with AI features</p>
                </div>
                <Switch
                  checked={form.watch("is_active")}
                  onCheckedChange={(checked) => form.setValue("is_active", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : isEditing ? "Update Connection" : "Create Connection"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
