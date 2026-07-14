-- ============================================================================
-- Migration: AI Token Usage Metering Table
-- ============================================================================
-- Tracks every AI token consumption event at the operation level.
-- This table is the source of truth for:
--   1. Stripe billing meter events (event_name = "ai_tokens")
--   2. In-app usage dashboards and quota enforcement
--   3. Audit trail for all AI operations
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ai_token_usage (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who performed the operation
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Operation metadata
  operation_id          TEXT NOT NULL,   -- Caller-supplied ID, used as idempotency base
  operation_type        TEXT NOT NULL,   -- agent | embedding | voice | workflow | analysis
  model_id              TEXT,            -- e.g. gpt-4o, claude-3-5-sonnet-20241022
  agent_id              UUID,
  workflow_id           UUID,

  -- Token counts
  total_tokens          INTEGER NOT NULL DEFAULT 0,
  prompt_tokens         INTEGER NOT NULL DEFAULT 0,
  completion_tokens     INTEGER NOT NULL DEFAULT 0,

  -- Stripe metering state
  stripe_meter_sent     BOOLEAN NOT NULL DEFAULT FALSE,
  stripe_meter_event_id TEXT,            -- identifier returned by Stripe meter event API

  created_at            TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- -----------------------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_ai_token_usage_user_id
  ON public.ai_token_usage (user_id);

CREATE INDEX IF NOT EXISTS idx_ai_token_usage_created_at
  ON public.ai_token_usage (created_at);

CREATE INDEX IF NOT EXISTS idx_ai_token_usage_unsent
  ON public.ai_token_usage (stripe_meter_sent)
  WHERE stripe_meter_sent = FALSE;

-- Compound index for billing period queries (most common analytics pattern)
CREATE INDEX IF NOT EXISTS idx_ai_token_usage_user_period
  ON public.ai_token_usage (user_id, created_at);

-- -----------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------
ALTER TABLE public.ai_token_usage ENABLE ROW LEVEL SECURITY;

-- Users can only read their own usage records
CREATE POLICY "Users can view own token usage"
  ON public.ai_token_usage
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role can insert/update (all writes go through server actions)
CREATE POLICY "Service role full access"
  ON public.ai_token_usage
  FOR ALL
  USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------
-- Aggregation View
-- -----------------------------------------------------------------------
-- Provides a per-user, per-month rollup used by the subscriptions page
-- and quota-enforcement logic.
CREATE OR REPLACE VIEW public.ai_token_usage_monthly AS
SELECT
  user_id,
  date_trunc('month', created_at) AS billing_month,
  operation_type,
  COUNT(*)                        AS operation_count,
  SUM(total_tokens)               AS total_tokens,
  SUM(prompt_tokens)              AS prompt_tokens,
  SUM(completion_tokens)          AS completion_tokens,
  SUM(CASE WHEN stripe_meter_sent THEN total_tokens ELSE 0 END) AS metered_tokens
FROM public.ai_token_usage
GROUP BY user_id, date_trunc('month', created_at), operation_type;

COMMENT ON TABLE public.ai_token_usage IS
  'Per-operation AI token consumption. Drives Stripe billing meter events (ai_tokens) and in-app usage dashboards.';
