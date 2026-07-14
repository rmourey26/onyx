-- =====================================================
-- Add ai_model column to workflow tables
-- Align schemas across ai_workflows, asset_workflows, and system_workflow_templates
-- =====================================================

-- Add ai_model column to ai_workflows
ALTER TABLE ai_workflows 
ADD COLUMN IF NOT EXISTS ai_model TEXT DEFAULT 'gemini-3-pro-20251115';

-- Add ai_model column to asset_workflows
ALTER TABLE asset_workflows 
ADD COLUMN IF NOT EXISTS ai_model TEXT DEFAULT 'gemini-3-pro-20251115';

-- Add ai_model column to system_workflow_templates
ALTER TABLE system_workflow_templates 
ADD COLUMN IF NOT EXISTS ai_model TEXT DEFAULT 'gemini-3-pro-20251115';

-- Add comments
COMMENT ON COLUMN ai_workflows.ai_model IS 'AI model to use for workflow execution (e.g., claude-3-5-sonnet-20241022, gpt-4, etc.)';
COMMENT ON COLUMN asset_workflows.ai_model IS 'AI model to use for asset workflow execution';
COMMENT ON COLUMN system_workflow_templates.ai_model IS 'Default AI model for workflow template';

-- =====================================================
-- Align schema: Add missing columns to ensure consistency
-- =====================================================

-- Add trigger_type and trigger_config to asset_workflows if missing
ALTER TABLE asset_workflows 
ADD COLUMN IF NOT EXISTS trigger_type TEXT;

-- Rename trigger_conditions to trigger_config in asset_workflows for consistency
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'asset_workflows' 
    AND column_name = 'trigger_conditions'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'asset_workflows' 
    AND column_name = 'trigger_config'
  ) THEN
    ALTER TABLE asset_workflows RENAME COLUMN trigger_conditions TO trigger_config;
  END IF;
END $$;

-- Rename workflow_steps to steps in asset_workflows for consistency
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'asset_workflows' 
    AND column_name = 'workflow_steps'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'asset_workflows' 
    AND column_name = 'steps'
  ) THEN
    ALTER TABLE asset_workflows RENAME COLUMN workflow_steps TO steps;
  END IF;
END $$;

-- Add execution tracking to ai_workflows (already in asset_workflows)
ALTER TABLE ai_workflows 
ADD COLUMN IF NOT EXISTS execution_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_executed_at TIMESTAMPTZ;

-- Add asset_type to ai_workflows for asset context
ALTER TABLE ai_workflows 
ADD COLUMN IF NOT EXISTS asset_type TEXT;

-- =====================================================
-- Update indexes for performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_ai_workflows_ai_model ON ai_workflows(ai_model);
CREATE INDEX IF NOT EXISTS idx_asset_workflows_ai_model ON asset_workflows(ai_model);
CREATE INDEX IF NOT EXISTS idx_system_workflow_templates_ai_model ON system_workflow_templates(ai_model);

-- =====================================================
-- Create view for unified workflow schema
-- =====================================================

CREATE OR REPLACE VIEW unified_workflows AS
SELECT 
  'ai_workflow' as source_table,
  id,
  user_id,
  name,
  description,
  steps,
  trigger_type,
  trigger_config,
  ai_model,
  is_active,
  execution_count,
  last_executed_at,
  asset_type,
  created_at,
  updated_at
FROM ai_workflows

UNION ALL

SELECT 
  'asset_workflow' as source_table,
  id,
  user_id,
  name,
  description,
  steps,
  trigger_type,
  trigger_config,
  ai_model,
  is_active,
  execution_count,
  last_executed_at,
  asset_type,
  created_at,
  updated_at
FROM asset_workflows;

COMMENT ON VIEW unified_workflows IS 'Unified view of all user workflows with consistent schema';

-- Grant permissions
GRANT SELECT ON unified_workflows TO authenticated;
