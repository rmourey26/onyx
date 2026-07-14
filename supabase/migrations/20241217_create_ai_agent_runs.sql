-- Create ai_agent_runs table for tracking agent execution history
CREATE TABLE IF NOT EXISTS public.ai_agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL,
  agent_name TEXT NOT NULL,
  model_name TEXT,
  prompt TEXT NOT NULL,
  response TEXT,
  tokens_used INTEGER DEFAULT 0,
  prompt_tokens INTEGER DEFAULT 0,
  completion_tokens INTEGER DEFAULT 0,
  execution_time_ms INTEGER DEFAULT 0,
  iterations INTEGER DEFAULT 1,
  tool_calls JSONB DEFAULT '[]'::jsonb,
  context_data JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'failed', 'cancelled')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_agent_runs_user_id ON public.ai_agent_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_agent_runs_agent_id ON public.ai_agent_runs(agent_id);
CREATE INDEX IF NOT EXISTS idx_ai_agent_runs_created_at ON public.ai_agent_runs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_agent_runs_status ON public.ai_agent_runs(status);

-- Enable RLS
ALTER TABLE public.ai_agent_runs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own agent runs"
  ON public.ai_agent_runs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own agent runs"
  ON public.ai_agent_runs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agent runs"
  ON public.ai_agent_runs
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ai_agent_runs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_ai_agent_runs_updated_at_trigger
  BEFORE UPDATE ON public.ai_agent_runs
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_agent_runs_updated_at();
