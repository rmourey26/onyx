-- Create tables for agentic workflow orchestration
CREATE TABLE IF NOT EXISTS asset_workflow_triggers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('insight_generated', 'threshold_exceeded', 'schedule', 'manual', 'agent_recommendation')),
  conditions JSONB NOT NULL DEFAULT '{}',
  workflow_template_id UUID NOT NULL,
  auto_execute BOOLEAN DEFAULT false,
  requires_approval BOOLEAN DEFAULT true,
  active BOOLEAN DEFAULT true,
  created_by_agent TEXT,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workflow_learning_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID NOT NULL,
  run_id TEXT NOT NULL,
  user_id UUID NOT NULL,
  decision_outcomes JSONB DEFAULT '[]',
  performance_metrics JSONB DEFAULT '{}',
  optimization_suggestions JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS asset_workflow_executions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID NOT NULL,
  run_id TEXT NOT NULL,
  user_id UUID NOT NULL,
  trigger_id UUID,
  status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed', 'paused')),
  autonomous_mode BOOLEAN DEFAULT false,
  agent_decisions JSONB DEFAULT '{}',
  performance_metrics JSONB DEFAULT '{}',
  learning_insights JSONB DEFAULT '{}',
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_asset_workflow_triggers_type ON asset_workflow_triggers(trigger_type);
CREATE INDEX IF NOT EXISTS idx_asset_workflow_triggers_active ON asset_workflow_triggers(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_workflow_learning_data_workflow ON workflow_learning_data(workflow_id);
CREATE INDEX IF NOT EXISTS idx_asset_workflow_executions_status ON asset_workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_asset_workflow_executions_user ON asset_workflow_executions(user_id);

-- Create RLS policies
ALTER TABLE asset_workflow_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_learning_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_workflow_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own workflow triggers" ON asset_workflow_triggers
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can access their own learning data" ON workflow_learning_data
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can access their own workflow executions" ON asset_workflow_executions
  FOR ALL USING (user_id = auth.uid());

-- Create functions for workflow automation
CREATE OR REPLACE FUNCTION notify_workflow_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify the application about new insights that might trigger workflows
  PERFORM pg_notify('asset_insight_created', json_build_object(
    'insight_id', NEW.id,
    'asset_id', NEW.asset_id,
    'insight_type', NEW.insight_type,
    'priority', NEW.priority,
    'user_id', NEW.user_id
  )::text);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic workflow triggering
CREATE TRIGGER asset_insight_workflow_trigger
  AFTER INSERT ON asset_intelligence_insights
  FOR EACH ROW
  EXECUTE FUNCTION notify_workflow_trigger();
