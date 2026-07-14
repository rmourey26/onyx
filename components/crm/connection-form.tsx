"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useCreateCrmConnection, useUpdateCrmConnection, useAuthenticateCrmProvider } from "@/lib/hooks/use-crm"
import { crmProviderSchema, salesforceAuthSchema, crmOneAuthSchema, netsuiteAuthSchema } from "@/lib/schemas/crm"
import type { CrmConnection } from "@/lib/schemas/crm"

interface ConnectionFormProps {
  initialData?: CrmConnection
  onSuccess?: () => void
}

export function ConnectionForm({ initialData, onSuccess }: ConnectionFormProps) {
  const [activeTab, setActiveTab] = useState<string>(initialData ? "manual" : "oauth")
  const createMutation = useCreateCrmConnection()
  const updateMutation = useUpdateCrmConnection()
  const authMutation = useAuthenticateCrmProvider()

  // Form for manual connection
  const manualForm = useForm<z.infer<typeof manualFormSchema>>({
    resolver: zodResolver(manualFormSchema),
    defaultValues: initialData
      ? {
          id: initialData.id,
          name: initialData.name,
          provider: initialData.provider,
          api_key: initialData.api_key || "",
          instance_url: initialData.instance_url || "",
        }
      : {
          name: "",
          provider: "salesforce",
          api_key: "",
          instance_url: "",
        },
  })

  // Form for Salesforce OAuth
  const salesforceForm = useForm<z.infer<typeof salesforceAuthSchema>>({
    resolver: zodResolver(salesforceAuthSchema),
    defaultValues: {
      client_id: "",
      client_secret: "",
      username: "",
      password: "",
      security_token: "",
    },
  })

  // Form for CrmOne OAuth
  const crmOneForm = useForm<z.infer<typeof crmOneAuthSchema>>({
    resolver: zodResolver(crmOneAuthSchema),
    defaultValues: {
      api_key: "",
      subdomain: "",
    },
  })

  // Form for NetSuite OAuth
  const netsuiteForm = useForm<z.infer<typeof netsuiteAuthSchema>>({
    resolver: zodResolver(netsuiteAuthSchema),
    defaultValues: {
      account_id: "",
      consumer_key: "",
      consumer_secret: "",
      token_id: "",
      token_secret: "",
    },
  })

  // Handle manual form submission
  const onManualSubmit = async (data: z.infer<typeof manualFormSchema>) => {
    try {
      if (initialData) {
        await updateMutation.mutateAsync(data)
      } else {
        await createMutation.mutateAsync(data)
      }
      onSuccess?.()
    } catch (error) {
      console.error("Error submitting form:", error)
    }
  }

  // Handle Salesforce OAuth form submission
  const onSalesforceSubmit = async (data: z.infer<typeof salesforceAuthSchema>) => {
    try {
      await authMutation.mutateAsync({
        provider: "salesforce",
        credentials: data,
      })
      onSuccess?.()
    } catch (error) {
      console.error("Error authenticating with Salesforce:", error)
    }
  }

  // Handle CrmOne OAuth form submission
  const onCrmOneSubmit = async (data: z.infer<typeof crmOneAuthSchema>) => {
    try {
      await authMutation.mutateAsync({
        provider: "crmone",
        credentials: data,
      })
      onSuccess?.()
    } catch (error) {
      console.error("Error authenticating with CrmOne:", error)
    }
  }

  // Handle NetSuite OAuth form submission
  const onNetSuiteSubmit = async (data: z.infer<typeof netsuiteAuthSchema>) => {
    try {
      await authMutation.mutateAsync({
        provider: "netsuite",
        credentials: data,
      })
      onSuccess?.()
    } catch (error) {
      console.error("Error authenticating with NetSuite:", error)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{initialData ? "Edit Connection" : "Add CRM Connection"}</CardTitle>
        <CardDescription>
          {initialData
            ? "Update your CRM connection details"
            : "Connect your CRM to import contacts, deals, and activities"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="oauth" disabled={!!initialData}>
              OAuth
            </TabsTrigger>
            <TabsTrigger value="manual">Manual Setup</TabsTrigger>
          </TabsList>

          {/* OAuth Tab */}
          <TabsContent value="oauth" className="space-y-4 py-4">
            <Tabs defaultValue="salesforce" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="salesforce">Salesforce</TabsTrigger>
                <TabsTrigger value="crmone">CrmOne</TabsTrigger>
                <TabsTrigger value="netsuite">NetSuite</TabsTrigger>
              </TabsList>

              {/* Salesforce OAuth Form */}
              <TabsContent value="salesforce" className="space-y-4 py-4">
                <Form {...salesforceForm}>
                  <form onSubmit={salesforceForm.handleSubmit(onSalesforceSubmit)} className="space-y-4">
                    <FormField
                      control={salesforceForm.control}
                      name="client_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client ID</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter Salesforce client ID" {...field} />
                          </FormControl>
                          <FormDescription>The client ID from your Salesforce connected app</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={salesforceForm.control}
                      name="client_secret"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client Secret</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Enter client secret" {...field} />
                          </FormControl>
                          <FormDescription>The client secret from your Salesforce connected app</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={salesforceForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Enter Salesforce username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={salesforceForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Enter password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={salesforceForm.control}
                      name="security_token"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Security Token</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter security token (optional)" {...field} />
                          </FormControl>
                          <FormDescription>Your Salesforce security token (if required)</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={authMutation.isPending}>
                      {authMutation.isPending ? "Connecting..." : "Connect to Salesforce"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              {/* CrmOne OAuth Form */}
              <TabsContent value="crmone" className="space-y-4 py-4">
                <Form {...crmOneForm}>
                  <form onSubmit={crmOneForm.handleSubmit(onCrmOneSubmit)} className="space-y-4">
                    <FormField
                      control={crmOneForm.control}
                      name="api_key"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>API Key</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter CrmOne API key" {...field} />
                          </FormControl>
                          <FormDescription>The API key from your CrmOne account</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={crmOneForm.control}
                      name="subdomain"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subdomain</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter CrmOne subdomain" {...field} />
                          </FormControl>
                          <FormDescription>
                            Your CrmOne subdomain (e.g., "company" in company.crmone.com)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={authMutation.isPending}>
                      {authMutation.isPending ? "Connecting..." : "Connect to CrmOne"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              {/* NetSuite OAuth Form */}
              <TabsContent value="netsuite" className="space-y-4 py-4">
                <Form {...netsuiteForm}>
                  <form onSubmit={netsuiteForm.handleSubmit(onNetSuiteSubmit)} className="space-y-4">
                    <FormField
                      control={netsuiteForm.control}
                      name="account_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account ID</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter NetSuite account ID" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={netsuiteForm.control}
                      name="consumer_key"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Consumer Key</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter consumer key" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={netsuiteForm.control}
                      name="consumer_secret"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Consumer Secret</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Enter consumer secret" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={netsuiteForm.control}
                      name="token_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Token ID</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter token ID" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={netsuiteForm.control}
                      name="token_secret"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Token Secret</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Enter token secret" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={authMutation.isPending}>
                      {authMutation.isPending ? "Connecting..." : "Connect to NetSuite"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Manual Setup Tab */}
          <TabsContent value="manual" className="space-y-4 py-4">
            <Form {...manualForm}>
              <form onSubmit={manualForm.handleSubmit(onManualSubmit)} className="space-y-4">
                {initialData && (
                  <FormField
                    control={manualForm.control}
                    name="id"
                    render={({ field }) => (
                      <FormItem className="hidden">
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={manualForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Connection Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter a name for this connection" {...field} />
                      </FormControl>
                      <FormDescription>A friendly name to identify this connection</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={manualForm.control}
                  name="provider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CRM Provider</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!initialData}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a CRM provider" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="salesforce">Salesforce</SelectItem>
                          <SelectItem value="crmone">CrmOne</SelectItem>
                          <SelectItem value="netsuite">NetSuite</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>The CRM provider you want to connect to</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={manualForm.control}
                  name="api_key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Key</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter API key" {...field} />
                      </FormControl>
                      <FormDescription>The API key for your CRM account</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={manualForm.control}
                  name="instance_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instance URL</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter instance URL" {...field} />
                      </FormControl>
                      <FormDescription>The URL of your CRM instance</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {initialData
                    ? updateMutation.isPending
                      ? "Updating..."
                      : "Update Connection"
                    : createMutation.isPending
                      ? "Creating..."
                      : "Create Connection"}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
      </CardFooter>
    </Card>
  )
}

// Schema for manual connection form
const manualFormSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Connection name is required"),
  provider: crmProviderSchema,
  api_key: z.string().optional(),
  instance_url: z.string().url().optional().or(z.string().max(0)),
})
