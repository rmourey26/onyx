export const API_SCOPES = {
  // Agent permissions
  "read:agents": "View agent configurations",
  "write:agents": "Create and modify agents",
  "execute:agents": "Execute agents",
  "delete:agents": "Delete agents",

  // Workflow permissions
  "read:workflows": "View workflow configurations",
  "write:workflows": "Create and modify workflows",
  "execute:workflows": "Execute workflows",
  "delete:workflows": "Delete workflows",

  // Asset permissions
  "read:assets": "View assets",
  "write:assets": "Create and modify assets",
  "delete:assets": "Delete assets",

  // Embedding permissions
  "read:embeddings": "View embeddings",
  "write:embeddings": "Create embeddings",
  "delete:embeddings": "Delete embeddings",

  // Learning layer permissions
  "read:learning": "View learning data",
  "write:learning": "Create learning data",

  // Analytics permissions
  "read:analytics": "View analytics data",

  // Webhook permissions
  "read:webhooks": "View webhooks",
  "write:webhooks": "Create and modify webhooks",

  // Wildcard permissions
  "read:*": "Read access to all resources",
  "write:*": "Write access to all resources",
  "execute:*": "Execute all agents and workflows",
  "admin:*": "Full administrative access",
} as const

export type APIScope = keyof typeof API_SCOPES

export const SCOPE_CATEGORIES = {
  agents: ["read:agents", "write:agents", "execute:agents", "delete:agents"],
  workflows: ["read:workflows", "write:workflows", "execute:workflows", "delete:workflows"],
  assets: ["read:assets", "write:assets", "delete:assets"],
  embeddings: ["read:embeddings", "write:embeddings", "delete:embeddings"],
  learning: ["read:learning", "write:learning"],
  analytics: ["read:analytics"],
  webhooks: ["read:webhooks", "write:webhooks"],
  wildcard: ["read:*", "write:*", "execute:*", "admin:*"],
} as const

export function getScopeDescription(scope: string): string {
  return API_SCOPES[scope as APIScope] || "Unknown scope"
}

export function validateScopes(scopes: string[]): boolean {
  return scopes.every((scope) => scope in API_SCOPES)
}
