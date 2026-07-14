export interface APIScope {
  value: string
  label: string
  description: string
}

export const API_SCOPES: APIScope[] = [
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
]
