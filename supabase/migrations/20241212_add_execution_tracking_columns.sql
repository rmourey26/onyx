-- Add columns to track API executions

-- Add execution tracking columns to ai_agents
ALTER TABLE ai_agents
ADD COLUMN IF NOT EXISTS last_executed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS execution_count INTEGER DEFAULT 0;

-- Add execution tracking columns to ai_workflows
ALTER TABLE ai_workflows
ADD COLUMN IF NOT EXISTS last_executed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS execution_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add is_active column to ai_agents if it doesn't exist
ALTER TABLE ai_agents
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_ai_agents_last_executed ON ai_agents(last_executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_workflows_last_executed ON ai_workflows(last_executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_agents_is_active ON ai_agents(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_workflows_is_active ON ai_workflows(is_active);

-- Add api_key_id to ai_workflow_runs for tracking
ALTER TABLE ai_workflow_runs
ADD COLUMN IF NOT EXISTS start_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS end_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS error TEXT;

-- Add comments
COMMENT ON COLUMN ai_agents.last_executed_at IS 'Timestamp of the last execution (via UI or API)';
COMMENT ON COLUMN ai_agents.execution_count IS 'Total number of times this agent has been executed';
COMMENT ON COLUMN ai_agents.is_active IS 'Whether this agent can be executed';
COMMENT ON COLUMN ai_workflows.last_executed_at IS 'Timestamp of the last execution (via UI or API)';
COMMENT ON COLUMN ai_workflows.execution_count IS 'Total number of times this workflow has been executed';
COMMENT ON COLUMN ai_workflows.is_active IS 'Whether this workflow can be executed';
