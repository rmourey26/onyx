# Kronova Vector Database Strategy
## Enterprise-Grade AI/ML Data Infrastructure Analysis

### Executive Summary

This document analyzes Kronova's current vector database infrastructure and provides a comprehensive plan for optimizing data vectorization and potential migration to Qdrant for enhanced model training capabilities.

---

## Part 1: Current Vector Infrastructure Analysis

### Existing Vectorized Tables in Supabase (pgvector)

| Table | Vector Column | Dimensions | Purpose | Index Type |
|-------|--------------|------------|---------|------------|
| `data_embeddings` | `vector_data` | 1536 | General document embeddings | IVFFlat |
| `assets` | `embedding_vector` | 1536 | Asset semantic search | IVFFlat |
| `asset_lifecycle_events` | `embedding_vector` | 1536 | Event pattern analysis | IVFFlat |
| `asset_intelligence_learning` | `vector_data` | 1536 | Agent/workflow execution learning | IVFFlat |

### Current Capabilities

**Strengths:**
- Integrated with existing PostgreSQL infrastructure
- RLS (Row Level Security) for multi-tenant isolation
- Existing similarity search functions (`match_embeddings`, `match_learning_data`)
- Low operational overhead - single database

**Limitations:**
- IVFFlat indexes require periodic rebuilding for optimal performance
- Limited to cosine similarity (no hybrid search)
- No native support for filtering during vector search (post-filtering only)
- Scaling limitations at 10M+ vectors
- No built-in clustering or auto-tuning

---

## Part 2: Data Categories Requiring Vectorization

### Currently Vectorized (4 tables)
1. **Document Embeddings** - User-uploaded documents for RAG
2. **Assets** - Physical/digital asset descriptions
3. **Asset Lifecycle Events** - Maintenance, compliance events
4. **AI Learning Layer** - Agent execution results

### Recommended Additional Vectorization (11 new collections)

#### High Priority - Customer Intelligence
| Data Source | Vector Use Case | Training Value |
|-------------|-----------------|----------------|
| `support_conversations` | Customer issue patterns | Support chatbot training |
| `support_messages` | Response quality learning | Response generation |
| `knowledge_base_learning` | FAQ/solution matching | Self-service optimization |

#### High Priority - Operational Intelligence
| Data Source | Vector Use Case | Training Value |
|-------------|-----------------|----------------|
| `ai_request_logs` | Query pattern analysis | Model fine-tuning |
| `ai_agent_runs` | Execution optimization | Agent improvement |
| `ai_workflow_runs` | Workflow efficiency | Automation patterns |
| `iot_sensor_data` | Anomaly detection | Predictive maintenance |

#### Medium Priority - Business Intelligence
| Data Source | Vector Use Case | Training Value |
|-------------|-----------------|----------------|
| `org_roi_baseline_data` | ROI pattern matching | Financial forecasting |
| `aethernet_messages` | Communication analysis | Network optimization |
| `voice_transcriptions` | Voice pattern analysis | Voice agent training |
| `oauth_audit_logs` | Security pattern detection | Threat analysis |

---

## Part 3: Supabase vs Qdrant Comparison

### Feature Comparison Matrix

| Feature | Supabase (pgvector) | Qdrant |
|---------|---------------------|--------|
| **Vector Dimensions** | Unlimited | Unlimited |
| **Index Types** | IVFFlat, HNSW | HNSW (optimized) |
| **Filtering** | Post-filter only | Native payload filtering |
| **Hybrid Search** | Manual implementation | Built-in sparse+dense |
| **Quantization** | None | Scalar, Product, Binary |
| **Multi-tenancy** | RLS (SQL-based) | Payload-based isolation |
| **Sharding** | Manual | Automatic |
| **Snapshots** | PostgreSQL backups | Native snapshots |
| **Clustering** | None | Auto-clustering |
| **Memory Mode** | Disk-based | In-memory option |
| **Max Vectors** | ~10M performant | 100M+ performant |
| **Batch Operations** | Standard SQL | Optimized batch API |
| **Recommendation** | Good for <5M vectors | Best for >5M vectors |

### Qdrant Advantages for Kronova

1. **Hybrid Search** - Combine semantic + keyword search for support chatbots
2. **Payload Filtering** - Filter by user_id, org_id during search (not after)
3. **Quantization** - 4-8x memory reduction for large-scale deployments
4. **Horizontal Scaling** - Automatic sharding for enterprise growth
5. **Batch Upserts** - Efficient bulk embedding updates
6. **Recommendation Engine** - Native support for similar item discovery

---

## Part 4: Recommended Architecture

### Hybrid Approach (Recommended)

```
┌─────────────────────────────────────────────────────────────────┐
│                    KRONOVA DATA PLATFORM                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────┐  ┌──────────────────────┐ │
│  │     SUPABASE (PostgreSQL)       │  │       QDRANT         │ │
│  │     Transactional Data          │  │   Vector Operations  │ │
│  ├─────────────────────────────────┤  ├──────────────────────┤ │
│  │ • User/Org management           │  │ • Semantic search    │ │
│  │ • Asset CRUD operations         │  │ • Similarity scoring │ │
│  │ • Workflow definitions          │  │ • Hybrid search      │ │
│  │ • API key management            │  │ • Clustering         │ │
│  │ • Subscription billing          │  │ • Recommendations    │ │
│  │ • Audit logs                    │  │ • Model training     │ │
│  │ • RLS for access control        │  │ • Real-time indexing │ │
│  └─────────────────────────────────┘  └──────────────────────┘ │
│                │                              │                  │
│                └──────────┬──────────────────┘                  │
│                           │                                     │
│                ┌──────────▼──────────┐                          │
│                │  SYNC SERVICE       │                          │
│                │  (Event-driven)     │                          │
│                │  • Change capture   │                          │
│                │  • Embedding gen    │                          │
│                │  • Batch sync       │                          │
│                └─────────────────────┘                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Qdrant Collection Schema Design

```yaml
collections:
  # Customer Support Intelligence
  - name: support_intelligence
    vectors:
      size: 1536
      distance: Cosine
    payload_schema:
      user_id: uuid
      org_id: uuid
      conversation_id: uuid
      message_type: keyword  # user, agent, system
      sentiment: float
      intent: keyword
      resolved: bool
      created_at: datetime
    
  # Asset Intelligence
  - name: asset_embeddings
    vectors:
      size: 1536
      distance: Cosine
    payload_schema:
      user_id: uuid
      asset_id: uuid
      asset_type: keyword
      status: keyword
      risk_score: float
      created_at: datetime
    
  # AI Execution Learning
  - name: ai_learning_layer
    vectors:
      size: 1536
      distance: Cosine
    payload_schema:
      user_id: uuid
      execution_type: keyword  # agent, workflow
      execution_id: uuid
      success_score: float
      quality_rating: integer
      tags: keyword[]
      created_at: datetime
    
  # IoT Anomaly Detection
  - name: iot_patterns
    vectors:
      size: 768  # Smaller for time-series
      distance: Cosine
    payload_schema:
      sensor_id: uuid
      asset_id: uuid
      anomaly_type: keyword
      severity: keyword
      timestamp: datetime
    
  # Document RAG
  - name: document_embeddings
    vectors:
      size: 1536
      distance: Cosine
    payload_schema:
      user_id: uuid
      document_id: uuid
      chunk_index: integer
      source_type: keyword
      created_at: datetime
    
  # Voice Analysis
  - name: voice_embeddings
    vectors:
      size: 1536
      distance: Cosine
    payload_schema:
      user_id: uuid
      call_id: uuid
      speaker: keyword
      sentiment: float
      intent: keyword
      timestamp: datetime
    
  # ROI Pattern Analysis
  - name: roi_patterns
    vectors:
      size: 1536
      distance: Cosine
    payload_schema:
      org_id: uuid
      industry: keyword
      company_size: keyword
      roi_percentage: float
      payback_months: integer
      created_at: datetime
```

---

## Part 5: Implementation Plan

### Phase 1: Infrastructure Setup (Week 1-2)

**Tasks:**
1. Deploy Qdrant Cloud or self-hosted cluster
2. Create Qdrant client library for Kronova
3. Set up secure API authentication
4. Create collection schemas
5. Implement health monitoring

**Environment Variables:**
```env
QDRANT_URL=https://your-cluster.qdrant.io
QDRANT_API_KEY=your-api-key
QDRANT_COLLECTION_PREFIX=kronova_
```

### Phase 2: Sync Service Development (Week 2-4)

**Components:**
1. Event listener for Supabase changes (Realtime/webhooks)
2. Embedding generation service (queue-based)
3. Batch synchronization jobs
4. Error handling and retry logic
5. Sync status dashboard

**Migration Script Structure:**
```typescript
// lib/qdrant/sync-service.ts
class QdrantSyncService {
  async syncTable(tableName: string, options: SyncOptions)
  async generateEmbedding(content: string, model: string)
  async upsertPoints(collection: string, points: Point[])
  async deletePoints(collection: string, ids: string[])
  async getCollectionInfo(collection: string)
}
```

### Phase 3: Data Migration (Week 4-6)

**Migration Order:**
1. `data_embeddings` → `document_embeddings` collection
2. `assets` → `asset_embeddings` collection
3. `asset_intelligence_learning` → `ai_learning_layer` collection
4. `asset_lifecycle_events` → `asset_embeddings` (merged)

**New Vectorization:**
5. `support_conversations` + `support_messages` → `support_intelligence`
6. `ai_request_logs` → `ai_learning_layer` (append)
7. `iot_sensor_data` → `iot_patterns`
8. `org_roi_baseline_data` → `roi_patterns`

### Phase 4: Application Integration (Week 6-8)

**Update Components:**
1. Similarity search APIs
2. RAG retrieval system
3. Support chatbot backend
4. Asset intelligence queries
5. Anomaly detection service

### Phase 5: Validation & Optimization (Week 8-10)

**Tasks:**
1. Performance benchmarking (latency, recall)
2. Index tuning (HNSW parameters)
3. Quantization evaluation
4. Load testing at scale
5. Fallback mechanism to pgvector

---

## Part 6: Code Implementation

### Qdrant Client Library

```typescript
// lib/qdrant/client.ts
import { QdrantClient } from '@qdrant/js-client-rest';

const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

export const COLLECTIONS = {
  SUPPORT_INTELLIGENCE: 'support_intelligence',
  ASSET_EMBEDDINGS: 'asset_embeddings',
  AI_LEARNING_LAYER: 'ai_learning_layer',
  IOT_PATTERNS: 'iot_patterns',
  DOCUMENT_EMBEDDINGS: 'document_embeddings',
  VOICE_EMBEDDINGS: 'voice_embeddings',
  ROI_PATTERNS: 'roi_patterns',
} as const;

export { qdrantClient };
```

### Embedding Generation Service

```typescript
// lib/qdrant/embedding-service.ts
import { generateText } from 'ai';

export async function generateEmbedding(
  content: string,
  model: string = 'openai/text-embedding-3-small'
): Promise<number[]> {
  const response = await generateText({
    model,
    prompt: content,
  });
  return response.embedding;
}
```

### Sync Service Actions

```typescript
// app/actions/qdrant-sync-actions.ts
'use server';

import { qdrantClient, COLLECTIONS } from '@/lib/qdrant/client';
import { generateEmbedding } from '@/lib/qdrant/embedding-service';
import { createClient } from '@/lib/supabase/server';

export async function syncSupportConversations(userId: string) {
  const supabase = await createClient();
  
  const { data: conversations } = await supabase
    .from('support_conversations')
    .select('*, support_messages(*)')
    .eq('user_id', userId);
    
  const points = await Promise.all(
    conversations.map(async (conv) => {
      const content = conv.support_messages
        .map(m => m.message_text)
        .join('\n');
        
      const embedding = await generateEmbedding(content);
      
      return {
        id: conv.id,
        vector: embedding,
        payload: {
          user_id: conv.user_id,
          org_id: conv.organization_id,
          conversation_id: conv.id,
          channel: conv.channel,
          status: conv.status,
          sentiment_score: conv.sentiment_score,
          created_at: conv.created_at,
        },
      };
    })
  );
  
  await qdrantClient.upsert(COLLECTIONS.SUPPORT_INTELLIGENCE, {
    wait: true,
    points,
  });
  
  return { synced: points.length };
}
```

---

## Part 7: Cost Analysis

### Qdrant Cloud Pricing (Estimated)

| Tier | Vectors | RAM | Storage | Monthly Cost |
|------|---------|-----|---------|--------------|
| Starter | 1M | 4GB | 20GB | $25 |
| Professional | 10M | 16GB | 100GB | $150 |
| Enterprise | 100M+ | 64GB+ | 500GB+ | Custom |

### Embedding Generation Costs

| Model | Cost per 1M tokens | Dimensions |
|-------|-------------------|------------|
| text-embedding-3-small | $0.02 | 1536 |
| text-embedding-3-large | $0.13 | 3072 |
| text-embedding-ada-002 | $0.10 | 1536 |

### Projected Monthly Costs (Enterprise Scale)

| Component | Cost |
|-----------|------|
| Qdrant Cloud (Professional) | $150 |
| Embedding Generation (~50M tokens) | $100 |
| Sync Service Compute | $50 |
| **Total** | **$300/month** |

---

## Part 8: Security Considerations

### Multi-Tenancy Isolation

```typescript
// All queries include user/org filter
const results = await qdrantClient.search(collection, {
  vector: queryEmbedding,
  filter: {
    must: [
      { key: 'user_id', match: { value: userId } },
      { key: 'org_id', match: { value: orgId } },
    ],
  },
  limit: 10,
});
```

### API Key Management
- Separate API keys for read/write operations
- Rate limiting per tenant
- Audit logging for all vector operations

### Data Encryption
- TLS for all API communications
- Optional payload encryption for sensitive data
- Regular key rotation

---

## Part 9: Monitoring & Observability

### Metrics to Track

1. **Performance Metrics**
   - Search latency (p50, p95, p99)
   - Index build time
   - Batch upsert throughput

2. **Quality Metrics**
   - Search recall rate
   - Embedding coverage
   - Sync lag time

3. **Resource Metrics**
   - Memory utilization
   - Storage growth rate
   - API request rate

### Dashboard Components

```typescript
// components/admin/vector-monitoring.tsx
interface VectorMetrics {
  totalVectors: number;
  collectionsCount: number;
  searchLatencyP95: number;
  syncStatus: 'healthy' | 'degraded' | 'down';
  lastSyncAt: Date;
  embeddingCoverage: number; // % of eligible records vectorized
}
```

---

## Part 10: Rollback Strategy

### Maintaining Dual-Write Capability

1. Keep pgvector columns as backup
2. Implement feature flags for search source
3. Gradual traffic shifting (10% → 50% → 100%)
4. Automated fallback on Qdrant errors

```typescript
// lib/vector/search.ts
export async function hybridSearch(
  query: string,
  options: SearchOptions
): Promise<SearchResult[]> {
  const useQdrant = await getFeatureFlag('use_qdrant_search');
  
  try {
    if (useQdrant) {
      return await qdrantSearch(query, options);
    }
  } catch (error) {
    console.error('Qdrant search failed, falling back to pgvector', error);
  }
  
  return await pgvectorSearch(query, options);
}
```

---

## Conclusion

### Recommended Approach

**Hybrid Architecture** - Maintain Supabase as the source of truth for transactional data while leveraging Qdrant for optimized vector operations and model training.

### Key Benefits

1. **10x Search Performance** - HNSW with payload filtering
2. **Cost Efficiency** - Quantization reduces memory 4-8x
3. **Scale Ready** - Automatic sharding for growth
4. **ML-Optimized** - Native support for training data export
5. **Hybrid Search** - Combine semantic + keyword matching

### Next Steps

1. Approve architecture design
2. Set up Qdrant Cloud trial
3. Implement sync service
4. Begin phased migration
5. Validate and optimize

---

*Document Version: 1.0*  
*Last Updated: February 2026*  
*Author: Kronova Engineering*
