import { z } from "zod"

export const userSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters long"),
  email: z.string().email("Invalid email address"),
  company: z.string().min(2, "Company name must be at least 2 characters long"),
  job_title: z.string().optional(),
  website: z.string().url("Invalid website URL").or(z.string().min(1, "Website is required")),
  linkedin_url: z.string().url("Invalid LinkedIn URL").optional().or(z.string().max(0)),
  avatar_url: z.string().url("Invalid avatar URL").optional().or(z.string().max(0)),
  company_logo_url: z.string().url("Invalid company logo URL").optional().or(z.string().max(0)),
  password: z.string().min(8, "Password must be at least 8 characters long"),
})

export const businessCardStyleSchema = z.object({
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"),
  textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"),
  backgroundImage: z.string().url("Invalid background image URL").optional(),
  logo: z.string().url("Invalid logo URL").optional(),
})

export const businessCardSchema = z.object({
  name: z.string().min(2, "Card name must be at least 2 characters long"),
  businesscard_name: z.string().min(2, "Card name must be at least 2 characters long").optional(),
  style: businessCardStyleSchema,
})

export const nftSchema = z.object({
  name: z.string().min(2, "NFT name must be at least 2 characters long"),
  txHash: z.string().min(1, "Transaction hash is required"),
  tokenId: z.string().min(1, "Token ID is required"),
})

export type User = z.infer<typeof userSchema>
export type BusinessCardStyle = z.infer<typeof businessCardStyleSchema>
export type BusinessCard = z.infer<typeof businessCardSchema>
export type NFT = z.infer<typeof nftSchema>

export const AVAILABLE_SCOPES = [
  { value: "execute:agents", label: "Execute Agents", description: "Run AI agents via API" },
  { value: "execute:workflows", label: "Execute Workflows", description: "Run workflows via API" },
  { value: "read:agents", label: "Read Agents", description: "View agent configurations" },
  { value: "write:agents", label: "Write Agents", description: "Create and modify agents" },
  { value: "read:workflows", label: "Read Workflows", description: "View workflow configurations" },
  { value: "write:workflows", label: "Write Workflows", description: "Create and modify workflows" },
  { value: "read:assets", label: "Read Assets", description: "View asset data" },
  { value: "write:assets", label: "Write Assets", description: "Create and modify assets" },
  { value: "read:analytics", label: "Read Analytics", description: "Access analytics data" },
  { value: "execute:*", label: "Execute All", description: "Execute any operation" },
  { value: "*:*", label: "Full Access", description: "Complete API access (admin)" },
] as const

export type APIScope = (typeof AVAILABLE_SCOPES)[number]["value"]

export const apiKeyCreateSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  expiresInDays: z.number().min(1).max(365).optional(),
  scopes: z.array(z.string()).min(1, "At least one scope is required"),
})

export const apiKeyUpdateSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long").optional(),
  scopes: z.array(z.string()).optional(),
})

export type APIKeyCreate = z.infer<typeof apiKeyCreateSchema>
export type APIKeyUpdate = z.infer<typeof apiKeyUpdateSchema>
