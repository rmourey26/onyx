# AI Agent Tools Format Standard

## Overview

All AI agent tools in the `ai_agents` and `system_agent_templates` tables **MUST** use the simple string array format (Method 2).

## Correct Format (Method 2)

```json
["query_database", "analyze_data", "generate_asset_insights", "web_search"]
```

### Characteristics
- Simple array of strings
- Each string is the tool name identifier
- No nested objects or metadata
- Clean and efficient for storage and querying

## Deprecated Formats

### Method 1 (Object Array) - DO NOT USE

```json
[
  {"name": "query_database", "parameters": {}, "description": "Tool: query_database"},
  {"name": "analyze_data", "parameters": {}, "description": "Tool: analyze_data"}
]
```

**Issues:**
- Redundant data (description duplicates name)
- Empty parameters object adds no value
- Larger storage footprint
- More complex to query

### Method 3 (Mixed/Broken Format) - DO NOT USE

```json
[
  {"parameters": {}, "description": "Tool: undefined"},
  {"parameters": {}, "description": "Tool: undefined"},
  {"name": "web_search", "parameters": {}, "description": "Tool: web_search"}
]
```

**Issues:**
- Contains undefined/null entries
- Inconsistent format within single array
- Causes UI display errors
- Results from improper data handling

## Implementation Guidelines

### Server Actions

When creating or updating agents:

```typescript
// ✅ CORRECT
const agentData = {
  name: "My Agent",
  tools: ["query_database", "analyze_data"], // Simple string array
  // ... other fields
}

// ❌ INCORRECT
const agentData = {
  name: "My Agent",
  tools: formData.tools.map(t => ({
    name: t,
    description: `Tool: ${t}`,
    parameters: {}
  })),
  // ... other fields
}
```

### Reading Tools

When reading from database:

```typescript
// Tools are stored as simple string array
const { data: agent } = await supabase
  .from('ai_agents')
  .select('tools')
  .single()

// agent.tools is now: ["query_database", "analyze_data"]
```

### UI Display

Format tool names for display:

```typescript
const formatToolName = (toolName: string): string => {
  return toolName
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase())
}

// "query_database" → "Query Database"
```

## Tool Definitions

Tool metadata (description, parameters, category, etc.) is defined in `/lib/ai/available-tools.ts`:

```typescript
export const AVAILABLE_AI_TOOLS: AITool[] = [
  {
    name: "query_database",
    description: "Query Supabase database tables with SQL",
    category: "data",
    icon: "database",
    parameters: {
      table: { type: "string", required: true },
      query: { type: "string", required: true },
    },
    requiresAuth: true,
  },
  // ... more tools
]
```

## Agent Execution

When executing agents, the system:

1. Reads tool names from `agent.tools` (string array)
2. Looks up full tool definitions from `AVAILABLE_AI_TOOLS`
3. Converts to AI SDK format with parameters
4. Passes to LLM with proper tool schemas

```typescript
// In agent-system.ts
private getAvailableTools(agentTools: string[]): any[] {
  return agentTools
    .map((toolName) => this.tools.get(toolName))
    .filter((tool) => tool !== undefined)
    .map((tool) => ({
      type: "function",
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      },
    }))
}
```

## Migration

The migration `20250102_normalize_ai_agent_tools.sql` automatically converts all existing records from Methods 1 and 3 to Method 2.

### What the migration does:
1. Backs up current tools data
2. Extracts tool names from all three formats
3. Normalizes to simple string arrays
4. Validates the conversion
5. Adds column documentation

### Running the migration:

The migration is idempotent and safe to run multiple times.

## Validation

To verify tools format compliance:

```sql
-- Check for non-string elements in tools arrays
SELECT id, name, tools
FROM ai_agents
WHERE tools IS NOT NULL 
  AND EXISTS (
    SELECT 1 
    FROM jsonb_array_elements(tools::jsonb) AS elem
    WHERE jsonb_typeof(elem) != 'string'
  );
```

Should return 0 rows after migration.

## Best Practices

1. **Always use Method 2** when creating or updating agents
2. **Never manually construct tool objects** - just use string names
3. **Tool metadata lives in code**, not database
4. **Reference AVAILABLE_AI_TOOLS** for tool definitions
5. **Use helper functions** for formatting tool names in UI
6. **Run the migration** on existing databases to normalize data

## Related Files

- `/app/actions/ai-actions.ts` - Agent CRUD operations
- `/app/actions/asset-agent-actions.ts` - Asset agent operations
- `/lib/ai/agent-system.ts` - Agent execution logic
- `/lib/ai/available-tools.ts` - Tool definitions
- `/components/ai-suite/ai-agents-list.tsx` - UI for agent management
- `/supabase/migrations/20250102_normalize_ai_agent_tools.sql` - Normalization migration

---

**Version:** 1.0  
**Last Updated:** 2025-01-02  
**Migration Required:** Yes (`20250102_normalize_ai_agent_tools.sql`)
