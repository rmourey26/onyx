# Kronova Platform Vectorization & Qdrant Migration Plan

## Executive Summary

This document provides a comprehensive analysis of Kronova's current database schema, identifies tables that should be vectorized for optimal AI/ML performance, and outlines a strategic migration plan from Supabase pgvector to Qdrant for enterprise-grade vector search capabilities.

> **Note:** Since Kronova currently has no end users, there are no user data migration concerns. This plan focuses purely on schema preparation and infrastructure setup for optimal enterprise readiness.

---

## Part 1: Current State Analysis

### 1.0 Complete Database Table Inventory

Based on the comprehensive supabase-types.ts analysis, the Kronova platform contains **115+ tables** across the following domains:

| Domain | Tables Count | Key Tables |
|--------|--------------|------------|
| **A2A Protocol** | 6 | `a2a_agent_cards`, `a2a_artifacts`, `a2a_extensions`, `a2a_messages`, `a2a_push_notification_configs`, `a2a_tasks` |
| **AetherNet** | 6 | `aethernet_connections`, `aethernet_delivery_logs`, `aethernet_message_recipients`, `aethernet_messages`, `aethernet_protocol_settings` |
| **AI Agents** | 12 | `ai_agents`, `ai_agent_contexts`, `ai_agent_runs`, `ai_agent_settings`, `ai_analysis_results`, `ai_models`, `ai_request_logs`, `ai_workflows`, `ai_workflow_runs`, `agent_execution_contexts`, `agent_execution_logs`, `agent_memory` |
| **Assets** | 15 | `assets`, `asset_agent_configs`, `asset_events`, `asset_intelligence_agent_templates`, `asset_intelligence_insights`, `asset_intelligence_learning`, `asset_intelligence_template_categories`, `asset_intelligence_template_usage`, `asset_intelligence_workflow_templates`, `asset_lifecycle_events`, `asset_tokens`, `asset_workflow_executions`, `asset_workflow_triggers`, `asset_workflows` |
| **CRM** | 5 | `crm_activities`, `crm_connections`, `crm_contacts`, `crm_data`, `crm_deals` |
| **Support/Learning** | 7 | `support_conversations`, `support_messages`, `support_learning_patterns`, `knowledge_base_learning`, `intent_classification_training`, `chatbot_performance_analytics` |
| **IoT/Fleet** | 6 | `iot_fleet_alerts`, `iot_fleet_devices`, `iot_fleet_driver_performance`, `iot_fleet_telemetry`, `iot_sensor_data`, `iot_sensors` |
| **Blockchain/DeFi** | 8 | `blockchain_connections`, `private_stablecoins`, `xreserve_transactions`, `fractionalization_pools`, `entity_wallets`, `entity_wallet_balances` |
| **Embeddings** | 5 | `data_embeddings`, `embedding_datasets`, `embedding_files`, `embedding_jobs`, `embedding_usage` |
| **Profiles/Auth** | 6 | `profiles`, `organizations`, `organization_members`, `user_preferences`, `api_keys`, `oauth_tokens` |
| **Workflows** | 6 | `workflow_execution_logs`, `workflow_learning_data`, `system_workflow_templates`, `system_agent_templates`, `template_categories`, `template_usage_analytics` |
| **Content** | 5 | `blog_posts`, `blog_categories`, `blog_tags`, `blog_post_tags`, `meetings` |
| **ROI/Analytics** | 4 | `org_roi_baseline_data`, `roi_calc_comparable_plans`, `industry_benchmarks`, `roi_model_parameters` |
| **Shipping/Packaging** | 6 | `shipments`, `iot_shipment_data`, `packaging_orders`, `reusable_packages`, `shipment_documents` |
| **Plaid/Finance** | 3 | `plaid_connections`, `plaid_accounts`, `plaid_transactions` |
| **Other** | 15+ | `admin_settings`, `webhooks`, `webhook_logs`, `tasks`, `task_web3_actions`, `demo_inquiries`, `investor_inquiries`, `consents`, `countries`, etc. |

### 1.1 Existing Vectorized Tables in Supabase

Based on the schema analysis, the following tables currently have embedding/vector columns:

| Table Name | Vector Column | Current Type | Purpose |
|------------|---------------|--------------|---------|
| `assets` | `embedding_vector` | string (pgvector) | Asset semantic search & similarity |
| `asset_events` | `embedding_vector` | string (pgvector) | Event pattern matching |
| `agent_memory` | `vector_data` | string (pgvector) | Agent context retrieval |
| `data_embeddings` | `vector_data` | string (pgvector) | General data embeddings |
| `embedding_datasets` | (container) | - | Dataset management |
| `embedding_files` | (reference) | - | File tracking |
| `embedding_jobs` | (processing) | - | Job queue |
| `embedding_usage` | (analytics) | - | Usage tracking |

### 1.2 Tables That Should Be Vectorized

The following tables contain rich textual content that would benefit significantly from vectorization:

#### High Priority (Critical for AI Operations)

| Table | Fields to Vectorize | Business Value |
|-------|---------------------|----------------|
| `ai_agents` | `system_prompt`, `description` | Agent discovery, similarity matching, prompt optimization |
| `ai_workflows` | `description`, `steps` (JSON) | Workflow recommendation, similar workflow discovery |
| `knowledge_base_learning` | `answer_template`, `question_patterns`, `topic` | Semantic KB search, question matching |
| `support_messages` | `message_text` | Conversation analysis, pattern detection |
| `support_conversations` | Combined: `customer_name`, `final_category`, `resolution_type`, `tags` | Case similarity, resolution matching |
| `blog_posts` | `content`, `title`, `excerpt` | Content discovery, related articles |
| `asset_intelligence_agent_templates` | `system_prompt`, `description` | Template matching, agent recommendation |
| `system_agent_templates` | `system_prompt`, `description`, `use_cases` | Template search, agent creation assistance |
| `system_workflow_templates` | `description`, `steps`, `expected_outcomes` | Workflow template matching |
| `crm_contacts` | `first_name`, `last_name`, `company`, `job_title`, `tags` | Contact search, lead matching |
| `crm_deals` | `name`, `description`, `stage` | Deal similarity, pipeline analysis |

#### Medium Priority (Enhanced User Experience)

| Table | Fields to Vectorize | Business Value |
|-------|---------------------|----------------|
| `a2a_agent_cards` | `description`, `skills` (JSON), `capabilities` (JSON) | Agent-to-agent discovery |
| `a2a_messages` | `parts` (JSON) | Message similarity, conversation threading |
| `a2a_artifacts` | `description`, `name`, `parts` (JSON) | Artifact search, content discovery |
| `aethernet_messages` | `attachments` (JSON), `metadata` (JSON) | Content search across messages |
| `api_routes` | `description`, `path` | API discovery, documentation search |
| `meetings` | `summary`, `description`, `action_items` (JSON) | Meeting search, related meetings |
| `ai_analysis_results` | `results` (JSON), `analysis_type` | Analysis pattern matching |
| `ai_request_logs` | `feedback_text`, `learning_insights` (JSON) | Feedback analysis, improvement identification |
| `asset_intelligence_insights` | `insight_content`, `recommendations` (JSON) | Insight search, recommendation matching |
| `asset_intelligence_learning` | `context_data`, `outcome_data`, `insights_generated` | Learning pattern discovery |
| `reusable_packages` | `name`, `description`, `metadata` (JSON) | Package search, inventory optimization |
| `iot_fleet_devices` | `device_name`, `configuration` (JSON), `metadata` (JSON) | Device discovery, fleet analysis |
| `iot_fleet_alerts` | `title`, `message`, `alert_type` | Alert pattern matching, incident correlation |

#### Lower Priority (Analytics & Optimization)

| Table | Fields to Vectorize | Business Value |
|-------|---------------------|----------------|
| `intent_classification_training` | `example_text`, `intent_label`, `entities` (JSON) | Intent classification improvement |
| `support_learning_patterns` | `pattern_description`, `suggested_response`, `trigger_keywords` | Pattern discovery |
| `org_roi_baseline_data` | Combined metrics text | Similar organization matching |
| `industry_benchmarks` | `industry`, `challenges`, `top_use_cases` | Industry comparison, benchmark matching |
| `workflow_learning_data` | `optimization_suggestions` (JSON), `performance_metrics` (JSON) | Workflow optimization |
| `demo_inquiries` | `message`, `company`, `use_case` | Lead qualification, similar inquiry matching |
| `investor_inquiries` | `message`, `firm`, `investor_type` | Investor relationship management |
| `crm_activities` | `subject`, `description` | Activity search, task correlation |
| `private_stablecoins` | `name`, `description`, `compliance_framework` | Stablecoin discovery, compliance matching |

---

## Part 2: Qdrant Migration Strategy

### 2.1 Why Migrate to Qdrant?

| Feature | Supabase pgvector | Qdrant | Advantage |
|---------|-------------------|--------|-----------|
| **Vector Search Speed** | Good | Excellent | 10-100x faster for large datasets |
| **Filtering** | SQL-based | Native payload filtering | More efficient combined searches |
| **Scalability** | Limited by PostgreSQL | Horizontal sharding | Billions of vectors |
| **Memory Efficiency** | Full vectors in memory | Quantization options | 4-16x memory reduction |
| **Real-time Updates** | Full reindex needed | Instant updates | No downtime |
| **Multi-tenancy** | Schema separation | Collection namespaces | Better isolation |
| **Hybrid Search** | Limited | Native sparse/dense | Better relevance |

### 2.2 Recommended Qdrant Collection Architecture

```
kronova_qdrant/
├── collections/
│   ├── assets                    # Asset embeddings with rich metadata
│   ├── asset_events              # Event pattern vectors
│   ├── ai_agents                 # Agent system prompts & descriptions
│   ├── knowledge_base            # KB articles & Q&A patterns
│   ├── support_conversations     # Conversation history vectors
│   ├── workflows                 # Workflow step embeddings
│   ├── documents                 # Blog posts, documentation
│   ├── agent_memory              # Long-term agent context
│   └── a2a_communications        # Agent-to-agent message vectors
```

### 2.3 Collection Schema Specifications

#### Assets Collection
```json
{
  "collection_name": "assets",
  "vectors": {
    "size": 1536,
    "distance": "Cosine"
  },
  "payload_schema": {
    "asset_id": "keyword",
    "user_id": "keyword",
    "asset_type": "keyword",
    "category": "keyword",
    "status": "keyword",
    "operational_status": "keyword",
    "location_id": "keyword",
    "created_at": "datetime",
    "current_value": "float",
    "risk_score": "float"
  },
  "indexes": [
    { "field": "user_id", "type": "keyword" },
    { "field": "asset_type", "type": "keyword" },
    { "field": "status", "type": "keyword" }
  ]
}
```

#### Knowledge Base Collection
```json
{
  "collection_name": "knowledge_base",
  "vectors": {
    "dense": { "size": 1536, "distance": "Cosine" },
    "sparse": { "type": "sparse", "modifier": "idf" }
  },
  "payload_schema": {
    "topic": "text",
    "category": "keyword",
    "subcategory": "keyword",
    "status": "keyword",
    "confidence_score": "float",
    "times_retrieved": "integer",
    "helpfulness_rate": "float",
    "keywords": "keyword[]"
  }
}
```

#### AI Agents Collection
```json
{
  "collection_name": "ai_agents",
  "vectors": {
    "prompt_vector": { "size": 1536, "distance": "Cosine" },
    "description_vector": { "size": 1536, "distance": "Cosine" }
  },
  "payload_schema": {
    "agent_id": "keyword",
    "user_id": "keyword",
    "category": "keyword",
    "model_id": "keyword",
    "is_active": "bool",
    "template_id": "keyword"
  }
}
```

---

## Part 3: Implementation Plan

### Phase 1: Infrastructure Setup (Week 1-2)

#### 3.1.1 Qdrant Deployment Options

**Option A: Qdrant Cloud (Recommended for Enterprise)**
- Managed service with automatic scaling
- Built-in monitoring and backups
- SOC2 compliant
- Estimated cost: $0.02/GB/hour

**Option B: Self-Hosted on Vercel/AWS**
- Full control over infrastructure
- Lower cost at scale
- Requires DevOps expertise

#### 3.1.2 Environment Setup

```typescript
// lib/qdrant/client.ts
import { QdrantClient } from '@qdrant/js-client-rest';

export const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

// Collection initialization
export async function initializeCollections() {
  const collections = [
    'assets',
    'ai_agents', 
    'knowledge_base',
    'support_conversations',
    'workflows',
    'documents',
    'agent_memory',
    'a2a_communications'
  ];
  
  for (const name of collections) {
    await createCollectionIfNotExists(name);
  }
}
```

### Phase 2: Migration Scripts (Week 3-4)

#### 3.2.1 Supabase to Qdrant Migration

```typescript
// scripts/migrations/migrate-to-qdrant.ts
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { qdrantClient } from '@/lib/qdrant/client';
import { generateEmbedding } from '@/lib/ai/embeddings';

interface MigrationConfig {
  tableName: string;
  collectionName: string;
  textFields: string[];
  metadataFields: string[];
  batchSize: number;
}

async function migrateTable(config: MigrationConfig) {
  const supabase = await createServerSupabaseClient();
  let offset = 0;
  let hasMore = true;
  
  while (hasMore) {
    const { data, error } = await supabase
      .from(config.tableName)
      .select('*')
      .range(offset, offset + config.batchSize - 1);
    
    if (error) throw error;
    if (!data || data.length === 0) {
      hasMore = false;
      continue;
    }
    
    const points = await Promise.all(data.map(async (row) => {
      // Combine text fields for embedding
      const textContent = config.textFields
        .map(field => row[field])
        .filter(Boolean)
        .join(' ');
      
      const vector = await generateEmbedding(textContent);
      
      // Extract metadata
      const payload: Record<string, any> = {};
      for (const field of config.metadataFields) {
        payload[field] = row[field];
      }
      
      return {
        id: row.id,
        vector,
        payload
      };
    }));
    
    await qdrantClient.upsert(config.collectionName, {
      wait: true,
      points
    });
    
    offset += config.batchSize;
    console.log(`Migrated ${offset} records from ${config.tableName}`);
  }
}

// Migration configurations
const migrations: MigrationConfig[] = [
  {
    tableName: 'assets',
    collectionName: 'assets',
    textFields: ['name', 'description', 'category', 'asset_type'],
    metadataFields: ['id', 'user_id', 'asset_id', 'status', 'asset_type', 'category', 'current_value'],
    batchSize: 100
  },
  {
    tableName: 'ai_agents',
    collectionName: 'ai_agents',
    textFields: ['name', 'description', 'system_prompt'],
    metadataFields: ['id', 'user_id', 'category', 'model_id', 'is_active'],
    batchSize: 50
  },
  {
    tableName: 'knowledge_base_learning',
    collectionName: 'knowledge_base',
    textFields: ['topic', 'answer_template', 'question_patterns'],
    metadataFields: ['id', 'category', 'subcategory', 'status', 'confidence_score', 'keywords'],
    batchSize: 100
  },
  // ... additional configurations
];

export async function runMigrations() {
  for (const config of migrations) {
    console.log(`Starting migration for ${config.tableName}...`);
    await migrateTable(config);
    console.log(`Completed migration for ${config.tableName}`);
  }
}
```

### Phase 3: Dual-Write Implementation (Week 5-6)

During transition, implement dual-write to both Supabase and Qdrant:

```typescript
// lib/services/vector-sync.ts
export class VectorSyncService {
  private useQdrant: boolean;
  private useDualWrite: boolean;
  
  constructor() {
    this.useQdrant = process.env.USE_QDRANT === 'true';
    this.useDualWrite = process.env.DUAL_WRITE_VECTORS === 'true';
  }
  
  async upsertAsset(asset: Asset) {
    const embedding = await generateEmbedding(
      `${asset.name} ${asset.description} ${asset.category}`
    );
    
    // Write to Supabase (existing)
    if (this.useDualWrite || !this.useQdrant) {
      await supabase
        .from('assets')
        .update({ embedding_vector: embedding })
        .eq('id', asset.id);
    }
    
    // Write to Qdrant
    if (this.useQdrant) {
      await qdrantClient.upsert('assets', {
        wait: true,
        points: [{
          id: asset.id,
          vector: embedding,
          payload: {
            user_id: asset.user_id,
            asset_type: asset.asset_type,
            status: asset.status,
            // ... other metadata
          }
        }]
      });
    }
  }
  
  async searchSimilar(query: string, collection: string, filters?: Filter) {
    const queryVector = await generateEmbedding(query);
    
    if (this.useQdrant) {
      return qdrantClient.search(collection, {
        vector: queryVector,
        limit: 10,
        filter: filters
      });
    }
    
    // Fallback to Supabase
    return supabase.rpc('match_documents', {
      query_embedding: queryVector,
      match_threshold: 0.7,
      match_count: 10
    });
  }
}
```

### Phase 4: Feature Flag Rollout (Week 7-8)

```typescript
// lib/feature-flags.ts
export const vectorSearchFlags = {
  // Gradually enable Qdrant for different features
  assets: {
    search: process.env.QDRANT_ASSETS_SEARCH === 'true',
    recommendations: process.env.QDRANT_ASSETS_RECS === 'true'
  },
  knowledgeBase: {
    search: process.env.QDRANT_KB_SEARCH === 'true',
    questionMatching: process.env.QDRANT_KB_QA === 'true'
  },
  agents: {
    discovery: process.env.QDRANT_AGENT_DISCOVERY === 'true',
    memory: process.env.QDRANT_AGENT_MEMORY === 'true'
  },
  support: {
    conversationSearch: process.env.QDRANT_SUPPORT_SEARCH === 'true',
    similarCases: process.env.QDRANT_SIMILAR_CASES === 'true'
  }
};
```

---

## Part 4: New Tables to Create for Vectorization

### 4.1 Recommended New Supabase Tables

Before migration to Qdrant, create these supporting tables:

```sql
-- Vector metadata tracking table
CREATE TABLE IF NOT EXISTS public.vector_sync_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_table TEXT NOT NULL,
  source_id UUID NOT NULL,
  qdrant_collection TEXT NOT NULL,
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  sync_status TEXT DEFAULT 'pending',
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source_table, source_id)
);

-- Embedding generation queue
CREATE TABLE IF NOT EXISTS public.embedding_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_table TEXT NOT NULL,
  source_id UUID NOT NULL,
  text_content TEXT NOT NULL,
  priority INTEGER DEFAULT 5,
  status TEXT DEFAULT 'pending',
  processing_started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vector search analytics
CREATE TABLE IF NOT EXISTS public.vector_search_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  collection_name TEXT NOT NULL,
  query_text TEXT,
  query_vector_hash TEXT,
  results_count INTEGER,
  top_score FLOAT,
  response_time_ms INTEGER,
  filters_applied JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_vector_sync_status_pending ON public.vector_sync_status(sync_status) WHERE sync_status = 'pending';
CREATE INDEX idx_embedding_queue_pending ON public.embedding_queue(priority, created_at) WHERE status = 'pending';
CREATE INDEX idx_vector_analytics_user ON public.vector_search_analytics(user_id, created_at DESC);
```

### 4.2 Add Embedding Columns to Existing Tables

```sql
-- Add embedding columns to tables that need vectorization
DO $$
BEGIN
  -- AI Agents
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ai_agents' AND column_name = 'embedding_vector'
  ) THEN
    ALTER TABLE public.ai_agents ADD COLUMN embedding_vector vector(1536);
    CREATE INDEX idx_ai_agents_embedding ON public.ai_agents 
      USING ivfflat (embedding_vector vector_cosine_ops) WITH (lists = 100);
  END IF;

  -- Knowledge Base Learning
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'knowledge_base_learning' AND column_name = 'embedding_vector'
  ) THEN
    ALTER TABLE public.knowledge_base_learning ADD COLUMN embedding_vector vector(1536);
    CREATE INDEX idx_kb_learning_embedding ON public.knowledge_base_learning 
      USING ivfflat (embedding_vector vector_cosine_ops) WITH (lists = 100);
  END IF;

  -- Support Conversations
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'support_conversations' AND column_name = 'embedding_vector'
  ) THEN
    ALTER TABLE public.support_conversations ADD COLUMN embedding_vector vector(1536);
    CREATE INDEX idx_support_conv_embedding ON public.support_conversations 
      USING ivfflat (embedding_vector vector_cosine_ops) WITH (lists = 100);
  END IF;

  -- Blog Posts
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'blog_posts' AND column_name = 'embedding_vector'
  ) THEN
    ALTER TABLE public.blog_posts ADD COLUMN embedding_vector vector(1536);
    CREATE INDEX idx_blog_posts_embedding ON public.blog_posts 
      USING ivfflat (embedding_vector vector_cosine_ops) WITH (lists = 100);
  END IF;

  -- AI Workflows
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ai_workflows' AND column_name = 'embedding_vector'
  ) THEN
    ALTER TABLE public.ai_workflows ADD COLUMN embedding_vector vector(1536);
    CREATE INDEX idx_ai_workflows_embedding ON public.ai_workflows 
      USING ivfflat (embedding_vector vector_cosine_ops) WITH (lists = 100);
  END IF;
END $$;
```

---

## Part 5: API Integration Layer

### 5.1 Unified Vector Search API

```typescript
// app/api/vector-search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { qdrantClient } from '@/lib/qdrant/client';
import { generateEmbedding } from '@/lib/ai/embeddings';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const { query, collection, filters, limit = 10 } = await req.json();
  
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const queryVector = await generateEmbedding(query);
  const startTime = Date.now();
  
  // Build Qdrant filter with user_id for multi-tenancy
  const qdrantFilter = {
    must: [
      { key: 'user_id', match: { value: user.id } },
      ...(filters || [])
    ]
  };
  
  const results = await qdrantClient.search(collection, {
    vector: queryVector,
    limit,
    filter: qdrantFilter,
    with_payload: true
  });
  
  // Log analytics
  await supabase.from('vector_search_analytics').insert({
    user_id: user.id,
    collection_name: collection,
    query_text: query,
    results_count: results.length,
    top_score: results[0]?.score ?? 0,
    response_time_ms: Date.now() - startTime,
    filters_applied: filters
  });
  
  return NextResponse.json({ results });
}
```

### 5.2 Background Embedding Worker

```typescript
// lib/workers/embedding-worker.ts
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { qdrantClient } from '@/lib/qdrant/client';
import { generateEmbedding } from '@/lib/ai/embeddings';

export async function processEmbeddingQueue() {
  const supabase = await createServerSupabaseClient();
  
  // Fetch pending items
  const { data: items } = await supabase
    .from('embedding_queue')
    .select('*')
    .eq('status', 'pending')
    .order('priority', { ascending: true })
    .order('created_at', { ascending: true })
    .limit(10);
  
  if (!items?.length) return;
  
  for (const item of items) {
    try {
      // Mark as processing
      await supabase
        .from('embedding_queue')
        .update({ status: 'processing', processing_started_at: new Date().toISOString() })
        .eq('id', item.id);
      
      // Generate embedding
      const vector = await generateEmbedding(item.text_content);
      
      // Determine collection based on source table
      const collection = getCollectionForTable(item.source_table);
      
      // Upsert to Qdrant
      await qdrantClient.upsert(collection, {
        wait: true,
        points: [{
          id: item.source_id,
          vector,
          payload: { source_table: item.source_table }
        }]
      });
      
      // Update sync status
      await supabase.from('vector_sync_status').upsert({
        source_table: item.source_table,
        source_id: item.source_id,
        qdrant_collection: collection,
        sync_status: 'synced',
        last_synced_at: new Date().toISOString()
      });
      
      // Mark queue item complete
      await supabase
        .from('embedding_queue')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', item.id);
        
    } catch (error) {
      await supabase
        .from('embedding_queue')
        .update({ status: 'failed', error_message: error.message })
        .eq('id', item.id);
    }
  }
}

function getCollectionForTable(tableName: string): string {
  const mapping: Record<string, string> = {
    'assets': 'assets',
    'ai_agents': 'ai_agents',
    'knowledge_base_learning': 'knowledge_base',
    'support_conversations': 'support_conversations',
    'ai_workflows': 'workflows',
    'blog_posts': 'documents',
    'agent_memory': 'agent_memory',
    'a2a_messages': 'a2a_communications'
  };
  return mapping[tableName] || 'general';
}
```

---

## Part 6: Timeline & Resource Requirements

### 6.1 Implementation Timeline

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| **Phase 1: Infrastructure** | 2 weeks | Qdrant deployment, client setup, collection schemas |
| **Phase 2: Migration Scripts** | 2 weeks | Data migration tools, batch processing |
| **Phase 3: Dual-Write** | 2 weeks | Sync service, real-time updates |
| **Phase 4: Feature Rollout** | 2 weeks | Feature flags, gradual migration |
| **Phase 5: Optimization** | Ongoing | Performance tuning, monitoring |

**Total Initial Migration: 8 weeks**

### 6.2 Cost Estimates

| Resource | Monthly Cost (Est.) |
|----------|---------------------|
| Qdrant Cloud (Production) | $200-500 |
| Additional AI API calls (embeddings) | $50-200 |
| Increased storage (Supabase + Qdrant) | $100-200 |
| **Total Additional Cost** | **$350-900/month** |

### 6.3 Performance Expectations

| Metric | Supabase pgvector | Qdrant (Expected) |
|--------|-------------------|-------------------|
| Query latency (p99) | 100-500ms | 10-50ms |
| Throughput | 100 qps | 1000+ qps |
| Index size (1M vectors) | ~6GB | ~1.5GB (quantized) |
| Concurrent searches | 10-20 | 100+ |

---

## Part 7: Recommendations Summary

### 7.1 Immediate Actions (Next 2 Weeks)

1. **Add embedding columns** to `ai_agents`, `knowledge_base_learning`, `ai_workflows`, and `blog_posts`
2. **Create supporting tables** for sync status and queue management
3. **Set up Qdrant Cloud trial** for testing
4. **Develop embedding generation pipeline** using existing AI SDK

### 7.2 Short-Term (1-2 Months)

1. **Migrate high-priority collections** (assets, knowledge_base, ai_agents)
2. **Implement dual-write** for new data
3. **Add vector search to support dashboard** for similar case finding
4. **Enable agent discovery** using vector similarity

### 7.3 Long-Term (3-6 Months)

1. **Full migration** of all vectorized data to Qdrant
2. **Deprecate Supabase pgvector** columns (keep as backup)
3. **Implement hybrid search** (dense + sparse vectors)
4. **Add recommendation engine** using vector similarity
5. **Enable cross-tenant insights** (anonymized patterns)

---

## Appendix A: Environment Variables

```env
# Qdrant Configuration
QDRANT_URL=https://your-cluster.qdrant.cloud
QDRANT_API_KEY=your-api-key
QDRANT_COLLECTION_PREFIX=kronova_

# Feature Flags
USE_QDRANT=false
DUAL_WRITE_VECTORS=true
QDRANT_ASSETS_SEARCH=false
QDRANT_KB_SEARCH=false
QDRANT_AGENT_DISCOVERY=false

# Embedding Configuration
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSIONS=1536
EMBEDDING_BATCH_SIZE=100
```

---

## Appendix B: Monitoring & Observability

### Key Metrics to Track

1. **Vector sync lag** - Time between data change and Qdrant update
2. **Search latency** - P50, P95, P99 response times
3. **Query throughput** - Searches per second by collection
4. **Embedding generation time** - Time to generate embeddings
5. **Error rates** - Failed syncs, search errors
6. **Storage utilization** - Vector storage growth

### Alerting Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| Search latency P99 | > 100ms | > 500ms |
| Sync lag | > 5 min | > 30 min |
| Error rate | > 1% | > 5% |
| Queue depth | > 1000 | > 5000 |

---

*Document Version: 1.0*
*Last Updated: February 2026*
*Author: Kronova Engineering Team*
