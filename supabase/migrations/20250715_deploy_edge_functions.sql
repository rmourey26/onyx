-- =====================================================
-- Deploy Edge Functions to Supabase and Make Available via API
-- =====================================================

-- Create execution log tables if they don't exist
CREATE TABLE IF NOT EXISTS agent_execution_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed')),
  input TEXT NOT NULL,
  output TEXT,
  error TEXT,
  execution_time INTEGER, -- milliseconds
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workflow_execution_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID NOT NULL REFERENCES ai_workflows(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed')),
  input JSONB DEFAULT '{}'::jsonb,
  output JSONB,
  error TEXT,
  execution_time INTEGER, -- milliseconds
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_agent_logs_agent_id ON agent_execution_logs(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_logs_user_id ON agent_execution_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_logs_created_at ON agent_execution_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workflow_logs_workflow_id ON workflow_execution_logs(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_logs_user_id ON workflow_execution_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_logs_created_at ON workflow_execution_logs(created_at DESC);

-- Enable RLS
ALTER TABLE agent_execution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_execution_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for agent_execution_logs
CREATE POLICY "Users can view their own agent logs"
  ON agent_execution_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert agent logs"
  ON agent_execution_logs FOR INSERT
  WITH CHECK (true);

-- RLS Policies for workflow_execution_logs
CREATE POLICY "Users can view their own workflow logs"
  ON workflow_execution_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert workflow logs"
  ON workflow_execution_logs FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- API Endpoint Configuration
-- =====================================================

-- Create API routes table to map endpoints to Edge Functions
CREATE TABLE IF NOT EXISTS api_routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  path TEXT NOT NULL UNIQUE,
  method TEXT NOT NULL,
  edge_function TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert API route mappings
INSERT INTO api_routes (path, method, edge_function, description) VALUES
  ('/api/v1/agents/:agentId/execute', 'POST', 'execute-agent', 'Execute an AI agent with AgentSystem'),
  ('/api/v1/workflows/:workflowId/execute', 'POST', 'execute-workflow', 'Execute a workflow with WorkflowSystem')
ON CONFLICT (path) DO UPDATE SET
  method = EXCLUDED.method,
  edge_function = EXCLUDED.edge_function,
  description = EXCLUDED.description,
  updated_at = NOW();

-- =====================================================
-- Helper function to get API route configuration
-- =====================================================

-- Fixed ORDER BY to be inside jsonb_agg() instead of outside
CREATE OR REPLACE FUNCTION get_api_routes()
RETURNS JSONB
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    jsonb_agg(to_jsonb(r.*) ORDER BY r.path),
    '[]'::jsonb
  )
  FROM api_routes r
  WHERE r.is_active = true;
$$;

-- =====================================================
-- Helper function to increment workflow execution count
-- =====================================================

-- Added helper function to track workflow executions
CREATE OR REPLACE FUNCTION increment_workflow_execution(
  p_workflow_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE ai_workflows
  SET 
    execution_count = COALESCE(execution_count, 0) + 1,
    last_executed_at = NOW()
  WHERE id = p_workflow_id;
  
  -- Also update asset_workflows if it exists there
  UPDATE asset_workflows
  SET 
    execution_count = COALESCE(execution_count, 0) + 1,
    last_executed_at = NOW()
  WHERE id = p_workflow_id;
END;
$$;

GRANT EXECUTE ON FUNCTION increment_workflow_execution TO authenticated;

-- =====================================================
-- Comments for documentation
-- =====================================================

COMMENT ON TABLE agent_execution_logs IS 'Stores execution logs for AI agents';
COMMENT ON TABLE workflow_execution_logs IS 'Stores execution logs for AI workflows';
COMMENT ON TABLE api_routes IS 'Maps API endpoints to Supabase Edge Functions';

COMMENT ON FUNCTION get_api_routes IS 'Returns active API route configurations';
COMMENT ON FUNCTION increment_workflow_execution IS 'Increments the execution count for a workflow and updates the last executed timestamp';
