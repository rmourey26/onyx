-- =====================================================
-- Kronova Platform Vectorization Migration
-- Add embedding columns to tables for AI/ML operations
-- Based on: /docs/KRONOVA_VECTORIZATION_MIGRATION_PLAN.md
-- =====================================================
-- This migration adds vector embedding columns to tables
-- identified in the vectorization plan (Section 1.2)
-- Uses pgvector extension with 1536 dimensions (OpenAI ada-002)
-- =====================================================

-- Enable pgvector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- =====================================================
-- HIGH PRIORITY TABLES
-- =====================================================

-- AI Agents: Agent discovery, similarity matching, prompt optimization
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'ai_agents' AND column_name = 'embedding_vector'
  ) THEN
    ALTER TABLE public.ai_agents ADD COLUMN embedding_vector vector(1536);
    CREATE INDEX idx_ai_agents_embedding ON public.ai_agents 
      USING ivfflat (embedding_vector vector_cosine_ops) WITH (lists = 100);
    COMMENT ON COLUMN public.ai_agents.embedding_vector IS 'Semantic embedding of system_prompt and description for agent discovery';
  END IF;
END $$;

-- AI Workflows: Workflow recommendation, similar workflow discovery
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'ai_workflows' AND column_name = 'embedding_vector'
  ) THEN
    ALTER TABLE public.ai_workflows ADD COLUMN embedding_vector vector(1536);
    CREATE INDEX idx_ai_workflows_embedding ON public.ai_workflows 
      USING ivfflat (embedding_vector vector_cosine_ops) WITH (lists = 100);
    COMMENT ON COLUMN public.ai_workflows.embedding_vector IS 'Semantic embedding of description and steps for workflow matching';
  END IF;
END $$;

-- Knowledge Base Learning: Semantic KB search, question matching
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'knowledge_base_learning' AND column_name = 'embedding_vector'
  ) THEN
    ALTER TABLE public.knowledge_base_learning ADD COLUMN embedding_vector vector(1536);
    CREATE INDEX idx_kb_learning_embedding ON public.knowledge_base_learning 
      USING ivfflat (embedding_vector vector_cosine_ops) WITH (lists = 100);
    COMMENT ON COLUMN public.knowledge_base_learning.embedding_vector IS 'Semantic embedding of topic, question_patterns, and answer_template';
  END IF;
END $$;

-- Support Messages: Conversation analysis, pattern detection
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'support_messages' AND column_name = 'embedding_vector'
  ) THEN
    ALTER TABLE public.support_messages ADD COLUMN embedding_vector vector(1536);
    CREATE INDEX idx_support_messages_embedding ON public.support_messages 
      USING ivfflat (embedding_vector vector_cosine_ops) WITH (lists = 100);
    COMMENT ON COLUMN public.support_messages.embedding_vector IS 'Semantic embedding of message_text for conversation analysis';
  END IF;
END $$;

-- Support Conversations: Case similarity, resolution matching
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'support_conversations' AND column_name = 'embedding_vector'
  ) THEN
    ALTER TABLE public.support_conversations ADD COLUMN embedding_vector vector(1536);
    CREATE INDEX idx_support_conversations_embedding ON public.support_conversations 
      USING ivfflat (embedding_vector vector_cosine_ops) WITH (lists = 100);
    COMMENT ON COLUMN public.support_conversations.embedding_vector IS 'Semantic embedding of customer_name, category, resolution_type, and tags';
  END IF;
END $$;

-- Blog Posts: Content discovery, related articles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'blog_posts' AND column_name = 'embedding_vector'
  ) THEN
    ALTER TABLE public.blog_posts ADD COLUMN embedding_vector vector(1536);
    CREATE INDEX idx_blog_posts_embedding ON public.blog_posts 
      USING ivfflat (embedding_vector vector_cosine_ops) WITH (lists = 100);
    COMMENT ON COLUMN public.blog_posts.embedding_vector IS 'Semantic embedding of title, excerpt, and content';
  END IF;
END $$;

-- Asset Intelligence Agent Templates: Template matching, agent recommendation
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'asset_intelligence_agent_templates' AND column_name = 'embedding_vector'
  ) THEN
    ALTER TABLE public.asset_intelligence_agent_templates ADD COLUMN embedding_vector vector(1536);
    CREATE INDEX idx_asset_intel_agent_templates_embedding ON public.asset_intelligence_agent_templates 
      USING ivfflat (embedding_vector vector_cosine_ops) WITH (lists = 100);
    COMMENT ON COLUMN public.asset_intelligence_agent_templates.embedding_vector IS 'Semantic embedding of system_prompt and description';
  END IF;
END $$;

-- System Agent Templates: Template search, agent creation assistance
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'system_agent_templates' AND column_name = 'embedding_vector'
  ) THEN
    ALTER TABLE public.system_agent_templates ADD COLUMN embedding_vector vector(1536);
    CREATE INDEX idx_system_agent_templates_embedding ON public.system_agent_templates 
      USING ivfflat (embedding_vector vector_cosine_ops) WITH (lists = 100);
    COMMENT ON COLUMN public.system_agent_templates.embedding_vector IS 'Semantic embedding of system_prompt, description, and use_cases';
  END IF;
END $$;

-- System Workflow Templates: Workflow template matching
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'system_workflow_templates' AND column_name = 'embedding_vector'
  ) THEN
    ALTER TABLE public.system_workflow_templates ADD COLUMN embedding_vector vector(1536);
    CREATE INDEX idx_system_workflow_templates_embedding ON public.system_workflow_templates 
      USING ivfflat (embedding_vector vector_cosine_ops) WITH (lists = 100);
    COMMENT ON COLUMN public.system_workflow_templates.embedding_vector IS 'Semantic embedding of description, steps, and expected_outcomes';
  END IF;
END $$;

-- CRM Contacts: Contact search, lead matching
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'crm_contacts' AND column_name = 'embedding_vector'
  ) THEN
    ALTER TABLE public.crm_contacts ADD COLUMN embedding_vector vector(1536);
    CREATE INDEX idx_crm_contacts_embedding ON public.crm_contacts 
      USING ivfflat (embedding_vector vector_cosine_ops) WITH (lists = 100);
    COMMENT ON COLUMN public.crm_contacts.embedding_vector IS 'Semantic embedding of name, company, job_title, and tags';
  END IF;
END $$;

-- CRM Deals: Deal similarity, pipeline analysis
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'crm_deals' AND column_name = 'embedding_vector'
  ) THEN
    ALTER TABLE public.crm_deals ADD COLUMN embedding_vector vector(1536);
    CREATE INDEX idx_crm_deals_embedding ON public.crm_deals 
      USING ivfflat (embedding_vector vector_cosine_ops) WITH (lists = 100);
    COMMENT ON COLUMN public.crm_deals.embedding_vector IS 'Semantic embedding of name, description, and stage';
  END IF;
END $$;

-- =====================================================
-- MEDIUM PRIORITY TABLES
-- =====================================================

-- A2A Agent Cards: Agent-to-agent discovery
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'a2a_agent_cards' AND column_name = 'embedding_vector'
  ) THEN
    ALTER TABLE public.a2a_agent_cards ADD COLUMN embedding_vector vector(1536);
    CREATE INDEX idx_a2a_agent_cards_embedding ON public.a2a_agent_cards 
      USING ivfflat (embedding_vector vector_cosine_ops) WITH (lists = 100);
    COMMENT ON COLUMN public.a2a_agent_cards.embedding_vector IS 'Semantic embedding of description, skills, and capabilities';
  END IF;
END $$;

-- A2A Messages: Message similarity, conversation threading
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'a2a_messages' AND column_name = 'embedding_vector'
  ) THEN
    ALTER TABLE public.a2a_messages ADD COLUMN embedding_vector vector(1536);
    CREATE INDEX idx_a2a_messages_embedding ON public.a2a_messages 
      USING ivfflat (embedding_vector vector_cosine_ops) WITH (lists = 100);
    COMMENT ON COLUMN public.a2a_messages.embedding_vector IS 'Semantic embedding of message parts';
  END IF;
END $$;

-- A2A Artifacts: Artifact search, content discovery
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'a2a_artifacts' AND column_name = 'embedding_vector'
  ) THEN
    ALTER TABLE public.a2a_artifacts ADD COLUMN embedding_vector vector(1536);
    CREATE INDEX idx_a2a_artifacts_embedding ON public.a2a_artifacts 
      USING ivfflat (embedding_vector vector_cosine_ops) WITH (lists = 100);
    COMMENT ON COLUMN public.a2a_artifacts.embedding_vector IS 'Semantic embedding of name, description, and parts';
  END IF;
END $$;

-- AetherNet Messages: Content search across messages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'aethernet_messages' AND column_name = 'embedding_vector'
  ) THEN
    ALTER TABLE public.aethernet_messages ADD COLUMN embedding_vector vector(1536);
    CREATE INDEX idx_aethernet_messages_embedding ON public.aethernet_messages 
      USING ivfflat (embedding_vector vector_cosine_ops) WITH (lists = 100);
    COMMENT ON COLUMN public.aethernet_messages.embedding_vector IS 'Semantic embedding of attachments and metadata';
  END IF;
END $$;

-- API Routes: API discovery, documentation search
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'api_routes' AND column_name = 'embedding_vector'
  ) THEN
    ALTER TABLE public.api_routes ADD COLUMN embedding_vector vector(1536);
    CREATE INDEX idx_api_routes_embedding ON public.api_routes 
      USING ivfflat (embedding_vector vector_cosine_ops) WITH (lists = 100);
    COMMENT ON COLUMN public.api_routes.embedding_vector IS 'Semantic embedding of path and description';
  END IF;
END $$;

-- Meetings: Meeting search, related meetings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'meetings' AND column_name = 'embedding_vector'
  ) THEN
    ALTER TABLE public.meetings ADD COLUMN embedding_vector vector(1536);
    CREATE INDEX idx_meetings_embedding ON public.meetings 
      USING ivfflat (embedding_vector vector_cosine_ops) WITH (lists = 100);
    COMMENT ON COLUMN public.meetings.embedding_vector IS 'Semantic embedding of summary, description, and action_items';
  END IF;
END $$;

-- AI Analysis Results: Analysis pattern matching
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'ai_analysis_results' AND column_name = 'embedding_vector'
  ) THEN
    ALTER TABLE public.ai_analysis_results ADD COLUMN embedding_vector vector(1536);
    CREATE INDEX idx_ai_analysis_results_embedding ON public.ai_analysis_results 
      USING ivfflat (embedding_vector vector_cosine_ops) WITH (lists = 100);
    COMMENT ON COLUMN public.ai_analysis_results.embedding_vector IS 'Semantic embedding of results and analysis_type';
  END IF;
END $$;

-- Asset Intelligence Insights: Insight search, recommendation matching
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'asset_intelligence_insights' AND column_name = 'embedding_vector'
  ) THEN
    ALTER TABLE public.asset_intelligence_insights ADD COLUMN embedding_vector vector(1536);
    CREATE INDEX idx_asset_intel_insights_embedding ON public.asset_intelligence_insights 
      USING ivfflat (embedding_vector vector_cosine_ops) WITH (lists = 100);
    COMMENT ON COLUMN public.asset_intelligence_insights.embedding_vector IS 'Semantic embedding of insight_content and recommendations';
  END IF;
END $$;

-- Asset Intelligence Learning: Learning pattern discovery
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'asset_intelligence_learning' AND column_name = 'embedding_vector'
  ) THEN
    ALTER TABLE public.asset_intelligence_learning ADD COLUMN embedding_vector vector(1536);
    CREATE INDEX idx_asset_intel_learning_embedding ON public.asset_intelligence_learning 
      USING ivfflat (embedding_vector vector_cosine_ops) WITH (lists = 100);
    COMMENT ON COLUMN public.asset_intelligence_learning.embedding_vector IS 'Semantic embedding of context_data, outcome_data, and insights';
  END IF;
END $$;

-- Reusable Packages: Package search, inventory optimization
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'reusable_packages' AND column_name = 'embedding_vector'
  ) THEN
    ALTER TABLE public.reusable_packages ADD COLUMN embedding_vector vector(1536);
    CREATE INDEX idx_reusable_packages_embedding ON public.reusable_packages 
      USING ivfflat (embedding_vector vector_cosine_ops) WITH (lists = 100);
    COMMENT ON COLUMN public.reusable_packages.embedding_vector IS 'Semantic embedding of name, description, and metadata';
  END IF;
END $$;

-- IoT Fleet Devices: Device discovery, fleet analysis
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'iot_fleet_devices' AND column_name = 'embedding_vector'
  ) THEN
    ALTER TABLE public.iot_fleet_devices ADD COLUMN embedding_vector vector(1536);
    CREATE INDEX idx_iot_fleet_devices_embedding ON public.iot_fleet_devices 
      USING ivfflat (embedding_vector vector_cosine_ops) WITH (lists = 100);
    COMMENT ON COLUMN public.iot_fleet_devices.embedding_vector IS 'Semantic embedding of device_name, configuration, and metadata';
  END IF;
END $$;

-- IoT Fleet Alerts: Alert pattern matching, incident correlation
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'iot_fleet_alerts' AND column_name = 'embedding_vector'
  ) THEN
    ALTER TABLE public.iot_fleet_alerts ADD COLUMN embedding_vector vector(1536);
    CREATE INDEX idx_iot_fleet_alerts_embedding ON public.iot_fleet_alerts 
      USING ivfflat (embedding_vector vector_cosine_ops) WITH (lists = 100);
    COMMENT ON COLUMN public.iot_fleet_alerts.embedding_vector IS 'Semantic embedding of title, message, and alert_type';
  END IF;
END $$;

-- =====================================================
-- LOWER PRIORITY TABLES
-- =====================================================

-- Intent Classification Training: Intent classification improvement
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'intent_classification_training' AND column_name = 'embedding_vector'
  ) THEN
    ALTER TABLE public.intent_classification_training ADD COLUMN embedding_vector vector(1536);
    CREATE INDEX idx_intent_classification_embedding ON public.intent_classification_training 
      USING ivfflat (embedding_vector vector_cosine_ops) WITH (lists = 100);
    COMMENT ON COLUMN public.intent_classification_training.embedding_vector IS 'Semantic embedding of example_text, intent_label, and entities';
  END IF;
END $$;

-- Support Learning Patterns: Pattern discovery
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'support_learning_patterns' AND column_name = 'embedding_vector'
  ) THEN
    ALTER TABLE public.support_learning_patterns ADD COLUMN embedding_vector vector(1536);
    CREATE INDEX idx_support_learning_patterns_embedding ON public.support_learning_patterns 
      USING ivfflat (embedding_vector vector_cosine_ops) WITH (lists = 100);
    COMMENT ON COLUMN public.support_learning_patterns.embedding_vector IS 'Semantic embedding of pattern_description, suggested_response, and trigger_keywords';
  END IF;
END $$;

-- Org ROI Baseline Data: Similar organization matching
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'org_roi_baseline_data' AND column_name = 'embedding_vector'
  ) THEN
    ALTER TABLE public.org_roi_baseline_data ADD COLUMN embedding_vector vector(1536);
    CREATE INDEX idx_org_roi_baseline_embedding ON public.org_roi_baseline_data 
      USING ivfflat (embedding_vector vector_cosine_ops) WITH (lists = 100);
    COMMENT ON COLUMN public.org_roi_baseline_data.embedding_vector IS 'Semantic embedding of combined metrics for organization matching';
  END IF;
END $$;

-- Industry Benchmarks: Industry comparison, benchmark matching
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'industry_benchmarks' AND column_name = 'embedding_vector'
  ) THEN
    ALTER TABLE public.industry_benchmarks ADD COLUMN embedding_vector vector(1536);
    CREATE INDEX idx_industry_benchmarks_embedding ON public.industry_benchmarks 
      USING ivfflat (embedding_vector vector_cosine_ops) WITH (lists = 100);
    COMMENT ON COLUMN public.industry_benchmarks.embedding_vector IS 'Semantic embedding of industry, challenges, and top_use_cases';
  END IF;
END $$;

-- Workflow Learning Data: Workflow optimization
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'workflow_learning_data' AND column_name = 'embedding_vector'
  ) THEN
    ALTER TABLE public.workflow_learning_data ADD COLUMN embedding_vector vector(1536);
    CREATE INDEX idx_workflow_learning_embedding ON public.workflow_learning_data 
      USING ivfflat (embedding_vector vector_cosine_ops) WITH (lists = 100);
    COMMENT ON COLUMN public.workflow_learning_data.embedding_vector IS 'Semantic embedding of optimization_suggestions and performance_metrics';
  END IF;
END $$;

-- Demo Inquiries: Lead qualification, similar inquiry matching
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'demo_inquiries' AND column_name = 'embedding_vector'
  ) THEN
    ALTER TABLE public.demo_inquiries ADD COLUMN embedding_vector vector(1536);
    CREATE INDEX idx_demo_inquiries_embedding ON public.demo_inquiries 
      USING ivfflat (embedding_vector vector_cosine_ops) WITH (lists = 100);
    COMMENT ON COLUMN public.demo_inquiries.embedding_vector IS 'Semantic embedding of message, company, and use_case';
  END IF;
END $$;

-- Investor Inquiries: Investor relationship management
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'investor_inquiries' AND column_name = 'embedding_vector'
  ) THEN
    ALTER TABLE public.investor_inquiries ADD COLUMN embedding_vector vector(1536);
    CREATE INDEX idx_investor_inquiries_embedding ON public.investor_inquiries 
      USING ivfflat (embedding_vector vector_cosine_ops) WITH (lists = 100);
    COMMENT ON COLUMN public.investor_inquiries.embedding_vector IS 'Semantic embedding of message, firm, and investor_type';
  END IF;
END $$;

-- CRM Activities: Activity search, task correlation
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'crm_activities' AND column_name = 'embedding_vector'
  ) THEN
    ALTER TABLE public.crm_activities ADD COLUMN embedding_vector vector(1536);
    CREATE INDEX idx_crm_activities_embedding ON public.crm_activities 
      USING ivfflat (embedding_vector vector_cosine_ops) WITH (lists = 100);
    COMMENT ON COLUMN public.crm_activities.embedding_vector IS 'Semantic embedding of subject and description';
  END IF;
END $$;

-- Private Stablecoins: Stablecoin discovery, compliance matching
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'private_stablecoins' AND column_name = 'embedding_vector'
  ) THEN
    ALTER TABLE public.private_stablecoins ADD COLUMN embedding_vector vector(1536);
    CREATE INDEX idx_private_stablecoins_embedding ON public.private_stablecoins 
      USING ivfflat (embedding_vector vector_cosine_ops) WITH (lists = 100);
    COMMENT ON COLUMN public.private_stablecoins.embedding_vector IS 'Semantic embedding of name, description, and compliance_framework';
  END IF;
END $$;

-- =====================================================
-- HELPER FUNCTIONS FOR VECTOR OPERATIONS
-- =====================================================

-- Function to find similar records using cosine similarity
CREATE OR REPLACE FUNCTION match_records(
  table_name TEXT,
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY EXECUTE format(
    'SELECT id, 1 - (embedding_vector <=> $1) as similarity 
     FROM %I 
     WHERE embedding_vector IS NOT NULL 
     AND 1 - (embedding_vector <=> $1) > $2
     ORDER BY embedding_vector <=> $1 
     LIMIT $3',
    table_name
  )
  USING query_embedding, match_threshold, match_count;
END;
$$;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✓ Vectorization migration completed successfully';
  RAISE NOTICE '✓ Added embedding_vector columns to 30+ tables';
  RAISE NOTICE '✓ Created IVFFlat indexes for efficient similarity search';
  RAISE NOTICE '✓ Added helper function: match_records()';
  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '1. Generate embeddings for existing records using /lib/ai/embeddings service';
  RAISE NOTICE '2. Implement background workers to keep embeddings in sync';
  RAISE NOTICE '3. Test vector search functionality across different tables';
  RAISE NOTICE '4. Monitor performance and adjust IVFFlat list parameters if needed';
  RAISE NOTICE '5. Consider migrating to Qdrant for enhanced performance (see migration plan)';
END $$;
