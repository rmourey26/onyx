-- Migration: Administrative Learning Layer for Customer Support Intelligence
-- Date: 2026-02-03
-- Description: Creates intelligent customer support learning layer that enables
--              chatbots to learn from support experiences, track patterns, and improve responses

-- ============================================================================
-- TABLE: Customer Support Conversations
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.support_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Conversation Tracking
  conversation_reference TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  
  -- Customer Context
  customer_email TEXT,
  customer_name TEXT,
  customer_organization TEXT,
  customer_tier TEXT CHECK (customer_tier IN ('free', 'starter', 'professional', 'enterprise')),
  is_authenticated BOOLEAN DEFAULT FALSE,
  
  -- Conversation Metadata
  channel TEXT NOT NULL CHECK (channel IN ('web_chat', 'email', 'voice', 'api', 'mobile')),
  initial_category TEXT, -- First categorization attempt
  final_category TEXT, -- Resolved category
  subcategory TEXT,
  
  -- Status Tracking
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'escalated', 'abandoned')),
  resolution_type TEXT CHECK (resolution_type IN ('self_service', 'chatbot', 'human_agent', 'escalated_external')),
  
  -- Timing Metrics
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  first_response_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  total_duration_seconds INTEGER,
  active_duration_seconds INTEGER, -- Time with active engagement
  
  -- Interaction Counts
  total_messages INTEGER DEFAULT 0,
  user_messages INTEGER DEFAULT 0,
  bot_messages INTEGER DEFAULT 0,
  agent_messages INTEGER DEFAULT 0,
  
  -- Escalation
  escalated_to_human BOOLEAN DEFAULT FALSE,
  escalated_at TIMESTAMPTZ,
  escalated_agent_id UUID REFERENCES auth.users(id),
  escalation_reason TEXT,
  
  -- Quality Metrics
  sentiment_score NUMERIC(4,2) CHECK (sentiment_score BETWEEN -1 AND 1), -- -1 (negative) to 1 (positive)
  satisfaction_rating INTEGER CHECK (satisfaction_rating BETWEEN 1 AND 5),
  satisfaction_feedback TEXT,
  bot_confidence_avg NUMERIC(4,2) CHECK (bot_confidence_avg BETWEEN 0 AND 1),
  
  -- Learning Layer Integration
  learning_processed BOOLEAN DEFAULT FALSE,
  learning_processed_at TIMESTAMPTZ,
  learning_insights JSONB DEFAULT '{}',
  knowledge_gaps_identified TEXT[],
  successful_patterns TEXT[],
  
  -- Tags and Classification
  tags TEXT[],
  priority_level TEXT CHECK (priority_level IN ('low', 'medium', 'high', 'urgent')),
  
  -- Metadata
  user_agent TEXT,
  ip_address INET,
  referrer_url TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TABLE: Support Messages
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.support_conversations(id) ON DELETE CASCADE,
  
  -- Message Content
  message_text TEXT NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('user', 'bot', 'agent', 'system')),
  
  -- AI Response Details (for bot messages)
  model_used TEXT,
  prompt_template TEXT,
  response_tokens INTEGER,
  cost_usd NUMERIC(10,6),
  latency_ms INTEGER,
  
  -- Confidence & Classification
  intent_detected TEXT,
  intent_confidence NUMERIC(4,2) CHECK (intent_confidence BETWEEN 0 AND 1),
  entities_extracted JSONB DEFAULT '{}',
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  sentiment_score NUMERIC(4,2) CHECK (sentiment_score BETWEEN -1 AND 1),
  
  -- Context
  tools_used TEXT[], -- Which tools/APIs were called
  knowledge_base_sources TEXT[], -- Which KB articles were referenced
  similar_past_conversations UUID[], -- References to similar past convos
  
  -- Quality & Feedback
  was_helpful BOOLEAN,
  user_feedback TEXT,
  flagged_for_review BOOLEAN DEFAULT FALSE,
  flag_reason TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  
  -- Learning Integration
  learning_value INTEGER CHECK (learning_value BETWEEN 0 AND 10), -- How valuable for learning
  patterns_identified TEXT[],
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TABLE: Knowledge Base Learning
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.knowledge_base_learning (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Knowledge Item
  topic TEXT NOT NULL,
  question_patterns TEXT[] NOT NULL, -- Common ways users ask this
  answer_template TEXT NOT NULL,
  
  -- Category
  category TEXT NOT NULL,
  subcategory TEXT,
  keywords TEXT[],
  
  -- Effectiveness Tracking
  times_retrieved INTEGER DEFAULT 0,
  times_helpful INTEGER DEFAULT 0,
  times_unhelpful INTEGER DEFAULT 0,
  helpfulness_rate NUMERIC(5,2), -- Percentage
  
  -- Learning Metrics
  confidence_score NUMERIC(4,2) DEFAULT 0.5 CHECK (confidence_score BETWEEN 0 AND 1),
  source_conversations UUID[], -- Which convos taught us this
  last_used_at TIMESTAMPTZ,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'needs_review', 'archived')),
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  
  -- Version Control
  version INTEGER DEFAULT 1,
  parent_id UUID REFERENCES public.knowledge_base_learning(id),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TABLE: Learning Patterns
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.support_learning_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Pattern Identification
  pattern_type TEXT NOT NULL CHECK (pattern_type IN (
    'common_question',
    'escalation_trigger',
    'knowledge_gap',
    'successful_resolution',
    'user_frustration',
    'topic_drift',
    'unclear_intent',
    'feature_request'
  )),
  
  pattern_name TEXT NOT NULL,
  pattern_description TEXT NOT NULL,
  
  -- Detection Criteria
  detection_rules JSONB NOT NULL, -- Rules for identifying this pattern
  trigger_keywords TEXT[],
  trigger_intents TEXT[],
  
  -- Frequency Tracking
  occurrence_count INTEGER DEFAULT 0,
  last_detected_at TIMESTAMPTZ,
  first_detected_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Impact Analysis
  avg_resolution_time_seconds INTEGER,
  avg_satisfaction_rating NUMERIC(3,2),
  escalation_rate NUMERIC(5,2), -- Percentage
  
  -- Recommended Actions
  suggested_response TEXT,
  suggested_kb_articles TEXT[],
  suggested_improvements TEXT,
  
  -- Priority
  priority_score INTEGER CHECK (priority_score BETWEEN 0 AND 100),
  requires_action BOOLEAN DEFAULT FALSE,
  assigned_to UUID REFERENCES auth.users(id),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'monitoring', 'archived')),
  
  -- Related Data
  related_conversations UUID[],
  related_patterns UUID[],
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TABLE: Chatbot Performance Analytics
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.chatbot_performance_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Time Period
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  period_type TEXT NOT NULL CHECK (period_type IN ('hourly', 'daily', 'weekly', 'monthly')),
  
  -- Conversation Metrics
  total_conversations INTEGER DEFAULT 0,
  resolved_by_bot INTEGER DEFAULT 0,
  escalated_to_human INTEGER DEFAULT 0,
  abandoned INTEGER DEFAULT 0,
  
  -- Resolution Rates
  bot_resolution_rate NUMERIC(5,2),
  first_contact_resolution_rate NUMERIC(5,2),
  escalation_rate NUMERIC(5,2),
  
  -- Timing Metrics
  avg_response_time_ms INTEGER,
  avg_resolution_time_seconds INTEGER,
  median_resolution_time_seconds INTEGER,
  p95_resolution_time_seconds INTEGER,
  
  -- Quality Metrics
  avg_satisfaction_rating NUMERIC(3,2),
  avg_sentiment_score NUMERIC(4,2),
  avg_bot_confidence NUMERIC(4,2),
  
  -- Interaction Metrics
  avg_messages_per_conversation NUMERIC(5,2),
  avg_turns_to_resolution NUMERIC(5,2),
  
  -- Cost Metrics
  total_ai_requests INTEGER DEFAULT 0,
  total_cost_usd NUMERIC(10,2),
  cost_per_conversation NUMERIC(8,4),
  
  -- Learning Metrics
  new_patterns_identified INTEGER DEFAULT 0,
  knowledge_gaps_found INTEGER DEFAULT 0,
  kb_articles_created INTEGER DEFAULT 0,
  kb_articles_updated INTEGER DEFAULT 0,
  
  -- Category Breakdown
  top_categories JSONB DEFAULT '{}', -- {'billing': 45, 'technical': 30, ...}
  top_intents JSONB DEFAULT '{}',
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TABLE: Intent Classification Training
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.intent_classification_training (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Training Example
  example_text TEXT NOT NULL,
  intent_label TEXT NOT NULL,
  entities JSONB DEFAULT '{}',
  
  -- Context
  category TEXT NOT NULL,
  subcategory TEXT,
  
  -- Source
  source_type TEXT NOT NULL CHECK (source_type IN ('manual', 'conversation', 'imported', 'synthetic')),
  source_conversation_id UUID REFERENCES public.support_conversations(id),
  source_message_id UUID REFERENCES public.support_messages(id),
  
  -- Quality
  confidence NUMERIC(4,2) DEFAULT 1.0 CHECK (confidence BETWEEN 0 AND 1),
  verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  
  -- Usage Tracking
  used_in_training BOOLEAN DEFAULT FALSE,
  training_accuracy_contribution NUMERIC(5,4),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'rejected', 'needs_review', 'archived')),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Support Conversations
CREATE INDEX IF NOT EXISTS idx_support_conversations_user ON public.support_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_support_conversations_status ON public.support_conversations(status);
CREATE INDEX IF NOT EXISTS idx_support_conversations_created ON public.support_conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_conversations_unprocessed 
  ON public.support_conversations(created_at) 
  WHERE learning_processed = FALSE;
CREATE INDEX IF NOT EXISTS idx_support_conversations_category ON public.support_conversations(final_category);
CREATE INDEX IF NOT EXISTS idx_support_conversations_satisfaction ON public.support_conversations(satisfaction_rating);

-- Support Messages
CREATE INDEX IF NOT EXISTS idx_support_messages_conversation ON public.support_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_type ON public.support_messages(message_type);
CREATE INDEX IF NOT EXISTS idx_support_messages_flagged 
  ON public.support_messages(created_at DESC) 
  WHERE flagged_for_review = TRUE;
CREATE INDEX IF NOT EXISTS idx_support_messages_intent ON public.support_messages(intent_detected);

-- Knowledge Base Learning
CREATE INDEX IF NOT EXISTS idx_kb_learning_topic ON public.knowledge_base_learning(topic);
CREATE INDEX IF NOT EXISTS idx_kb_learning_category ON public.knowledge_base_learning(category);
CREATE INDEX IF NOT EXISTS idx_kb_learning_status ON public.knowledge_base_learning(status);
CREATE INDEX IF NOT EXISTS idx_kb_learning_helpfulness ON public.knowledge_base_learning(helpfulness_rate DESC);

-- Learning Patterns
CREATE INDEX IF NOT EXISTS idx_learning_patterns_type ON public.support_learning_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_learning_patterns_priority ON public.support_learning_patterns(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_learning_patterns_status ON public.support_learning_patterns(status);
CREATE INDEX IF NOT EXISTS idx_learning_patterns_requires_action 
  ON public.support_learning_patterns(created_at DESC) 
  WHERE requires_action = TRUE;

-- Chatbot Performance Analytics
CREATE INDEX IF NOT EXISTS idx_chatbot_analytics_period ON public.chatbot_performance_analytics(period_start DESC, period_type);

-- Intent Training
CREATE INDEX IF NOT EXISTS idx_intent_training_label ON public.intent_classification_training(intent_label);
CREATE INDEX IF NOT EXISTS idx_intent_training_status ON public.intent_classification_training(status);
CREATE INDEX IF NOT EXISTS idx_intent_training_unverified 
  ON public.intent_classification_training(created_at DESC) 
  WHERE verified = FALSE AND status = 'active';

-- Full-text search indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_support_messages_text_search 
  ON public.support_messages 
  USING gin(to_tsvector('english', message_text));

-- GIN index on keywords array for faster keyword lookups
CREATE INDEX IF NOT EXISTS idx_kb_learning_keywords_search 
  ON public.knowledge_base_learning 
  USING gin(keywords);

-- GIN index on question_patterns array
CREATE INDEX IF NOT EXISTS idx_kb_learning_patterns_array 
  ON public.knowledge_base_learning 
  USING gin(question_patterns);

-- Full-text search on topic and answer for knowledge base
CREATE INDEX IF NOT EXISTS idx_kb_learning_topic_search 
  ON public.knowledge_base_learning 
  USING gin(to_tsvector('english', topic || ' ' || COALESCE(answer_template, '')));

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.support_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base_learning ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_learning_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_performance_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intent_classification_training ENABLE ROW LEVEL SECURITY;

-- Admin-only access for most learning layer tables
-- Regular users can only see their own support conversations

CREATE POLICY "Users can view own conversations" ON public.support_conversations
  FOR SELECT USING (
    auth.uid() = user_id OR
    auth.jwt() ->> 'role' = 'admin' OR
    auth.jwt() ->> 'role' = 'support_agent'
  );

CREATE POLICY "Users can create conversations" ON public.support_conversations
  FOR INSERT WITH CHECK (true); -- Anyone can create (for unauthenticated support)

CREATE POLICY "Admins can manage all conversations" ON public.support_conversations
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin' OR
    auth.jwt() ->> 'role' = 'support_agent'
  );

-- Messages: Tied to conversation permissions
CREATE POLICY "Users can view own conversation messages" ON public.support_messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM public.support_conversations 
      WHERE user_id = auth.uid() OR 
            auth.jwt() ->> 'role' = 'admin' OR
            auth.jwt() ->> 'role' = 'support_agent'
    )
  );

CREATE POLICY "Anyone can create messages" ON public.support_messages
  FOR INSERT WITH CHECK (true);

-- Knowledge Base: Public read, admin write
CREATE POLICY "Anyone can read active knowledge base" ON public.knowledge_base_learning
  FOR SELECT USING (status = 'active' OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage knowledge base" ON public.knowledge_base_learning
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Learning Patterns: Admin only
CREATE POLICY "Admins can view learning patterns" ON public.support_learning_patterns
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage learning patterns" ON public.support_learning_patterns
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Analytics: Admin only
CREATE POLICY "Admins can view analytics" ON public.chatbot_performance_analytics
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "System can create analytics" ON public.chatbot_performance_analytics
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'service_role');

-- Intent Training: Admin only
CREATE POLICY "Admins can manage intent training" ON public.intent_classification_training
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_support_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_support_conversations_timestamp
  BEFORE UPDATE ON public.support_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_support_updated_at();

CREATE TRIGGER update_kb_learning_timestamp
  BEFORE UPDATE ON public.knowledge_base_learning
  FOR EACH ROW
  EXECUTE FUNCTION public.update_support_updated_at();

CREATE TRIGGER update_learning_patterns_timestamp
  BEFORE UPDATE ON public.support_learning_patterns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_support_updated_at();

CREATE TRIGGER update_intent_training_timestamp
  BEFORE UPDATE ON public.intent_classification_training
  FOR EACH ROW
  EXECUTE FUNCTION public.update_support_updated_at();

-- Auto-increment conversation message count
CREATE OR REPLACE FUNCTION public.increment_conversation_message_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.support_conversations
  SET 
    total_messages = total_messages + 1,
    user_messages = user_messages + CASE WHEN NEW.message_type = 'user' THEN 1 ELSE 0 END,
    bot_messages = bot_messages + CASE WHEN NEW.message_type = 'bot' THEN 1 ELSE 0 END,
    agent_messages = agent_messages + CASE WHEN NEW.message_type = 'agent' THEN 1 ELSE 0 END,
    last_activity_at = NOW()
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_message_count_on_insert
  AFTER INSERT ON public.support_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_conversation_message_count();

-- Auto-update KB helpfulness rate
CREATE OR REPLACE FUNCTION public.update_kb_helpfulness_rate()
RETURNS TRIGGER AS $$
BEGIN
  NEW.helpfulness_rate = CASE 
    WHEN (NEW.times_helpful + NEW.times_unhelpful) > 0 
    THEN (NEW.times_helpful::NUMERIC / (NEW.times_helpful + NEW.times_unhelpful)) * 100
    ELSE NULL
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_kb_helpfulness_on_change
  BEFORE UPDATE ON public.knowledge_base_learning
  FOR EACH ROW
  WHEN (OLD.times_helpful IS DISTINCT FROM NEW.times_helpful OR OLD.times_unhelpful IS DISTINCT FROM NEW.times_unhelpful)
  EXECUTE FUNCTION public.update_kb_helpfulness_rate();

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT ALL ON public.support_conversations TO authenticated;
GRANT ALL ON public.support_messages TO authenticated;
GRANT ALL ON public.knowledge_base_learning TO authenticated;
GRANT ALL ON public.support_learning_patterns TO authenticated;
GRANT ALL ON public.chatbot_performance_analytics TO authenticated;
GRANT ALL ON public.intent_classification_training TO authenticated;

GRANT ALL ON public.support_conversations TO service_role;
GRANT ALL ON public.support_messages TO service_role;
GRANT ALL ON public.knowledge_base_learning TO service_role;
GRANT ALL ON public.support_learning_patterns TO service_role;
GRANT ALL ON public.chatbot_performance_analytics TO service_role;
GRANT ALL ON public.intent_classification_training TO service_role;

-- ============================================================================
-- INITIAL DATA SEEDING (Optional)
-- ============================================================================

-- Seed common support categories
INSERT INTO public.knowledge_base_learning (topic, question_patterns, answer_template, category, keywords, confidence_score)
VALUES
  ('Platform Overview', ARRAY['what is kronova', 'tell me about kronova', 'how does kronova work'], 
   'Kronova is an enterprise AI platform that provides intelligent automation, asset management, and business intelligence tools.', 
   'general', ARRAY['platform', 'overview', 'introduction'], 0.9),
  
  ('Billing Questions', ARRAY['how much does it cost', 'pricing information', 'subscription plans'], 
   'We offer flexible pricing plans including Free, Starter, Professional, and Enterprise tiers. Visit our pricing page for details.', 
   'billing', ARRAY['pricing', 'cost', 'billing', 'subscription'], 0.85),
  
  ('Technical Support', ARRAY['having technical issues', 'error message', 'not working'], 
   'I''d be happy to help with technical issues. Can you describe what you''re experiencing?', 
   'technical', ARRAY['technical', 'error', 'issue', 'bug'], 0.75)
ON CONFLICT DO NOTHING;
