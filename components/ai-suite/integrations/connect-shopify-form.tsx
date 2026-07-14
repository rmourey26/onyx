"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

const formSchema = z.object({
  shopUrl: z
    .string()
    .min(1, "Shopify store URL is required.")
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/, "Please enter a valid .myshopify.com URL."),
})

interface ConnectShopifyFormProps {
  onSubmit: (shopUrl: string) => void
  isLoading: boolean
}

export function ConnectShopifyForm({ onSubmit, isLoading }: ConnectShopifyFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      shopUrl: "",
    },
  })

  function handleSubmit(values: z.infer<typeof formSchema>) {
    onSubmit(values.shopUrl)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="shopUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shopify Store URL</FormLabel>
              <FormControl>
                <Input
                  placeholder="your-store.myshopify.com"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Connecting..." : "Connect Shopify"}
        </Button>
      </form>
    </Form>
  )
}
