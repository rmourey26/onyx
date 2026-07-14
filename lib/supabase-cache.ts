import type { QueryClient } from "@tanstack/react-query"
import { createClient } from "@supabase/supabase-js"

export function invalidateSupabaseQueries(queryClient: QueryClient, tableName: string) {
  const queries = queryClient.getQueryCache().findAll({
    predicate: (query) => query.queryKey[0] === tableName,
  })
  queries.forEach((query) => queryClient.invalidateQueries({ queryKey: query.queryKey }))
}

export function invalidateAISuiteQueries(queryClient: QueryClient, tables: string[] = []) {
  const aiSuiteTables = [
    "ai-models",
    "ai-agents",
    "ai-workflows",
    "ai-workflow-runs",
    "ai-analysis-results",
    "assets",
    "asset-intelligence-agent-templates",
    "asset-agent-configs",
    "asset-workflows",
    "data-embeddings",
    "system-ai-agents",
    "dashboard-metrics",
    "workflow_learning_data",
    "system_workflow_templates",
    ...tables,
  ]

  aiSuiteTables.forEach((table) => {
    invalidateSupabaseQueries(queryClient, table)
  })
}

export function setupRealtimeSubscription(
  supabase: ReturnType<typeof createClient>,
  table: string,
  userId: string,
  callback: (payload: any) => void,
) {
  return supabase
    .channel(`${table}-changes-${userId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: table,
        filter: `user_id=eq.${userId}`,
      },
      callback,
    )
    .subscribe()
}

export const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
