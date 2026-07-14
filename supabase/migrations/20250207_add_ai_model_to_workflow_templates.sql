-- Add ai_model field to asset_intelligence_workflow_templates table
-- This allows users to choose which AI model to use for each workflow template

ALTER TABLE asset_intelligence_workflow_templates 
ADD COLUMN IF NOT EXISTS ai_model TEXT DEFAULT 'google/gemini-3-pro';

-- Add comment for documentation
COMMENT ON COLUMN asset_intelligence_workflow_templates.ai_model IS 'AI model to use for workflow execution (e.g., google/gemini-3-pro, anthropic/claude-sonnet-4.5, openai/gpt-5-mini)';

-- Create index for model filtering
CREATE INDEX IF NOT EXISTS idx_asset_workflow_templates_ai_model 
ON asset_intelligence_workflow_templates(ai_model);
