-- Migration: Add template_id tracking to ai_agents table
-- Purpose: Enable proper relationship between deployed agents and their source templates
-- Date: 2025-01-09

-- ============================================
-- PART 1: Add Missing Columns to ai_agents
-- ============================================

-- Add category column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'ai_agents' 
    AND column_name = 'category'
  ) THEN
    ALTER TABLE ai_agents ADD COLUMN category VARCHAR(50) DEFAULT 'custom';
  END IF;
END $$;

-- Add template_id column to track which template an agent was created from
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'ai_agents' 
    AND column_name = 'template_id'
  ) THEN
    ALTER TABLE ai_agents ADD COLUMN template_id VARCHAR(255);
  END IF;
END $$;

-- Add temperature column if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'ai_agents' 
    AND column_name = 'temperature'
  ) THEN
    ALTER TABLE ai_agents ADD COLUMN temperature DECIMAL(3,2) DEFAULT 0.7;
  END IF;
END $$;

-- Add max_tokens column if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'ai_agents' 
    AND column_name = 'max_tokens'
  ) THEN
    ALTER TABLE ai_agents ADD COLUMN max_tokens INTEGER DEFAULT 2000;
  END IF;
END $$;

-- ============================================
-- PART 2: Create Indexes for Performance
-- ============================================

-- Index for finding agents by template
CREATE INDEX IF NOT EXISTS idx_ai_agents_template_id 
ON ai_agents(template_id) 
WHERE template_id IS NOT NULL;

-- Index for finding user's agents by category
CREATE INDEX IF NOT EXISTS idx_ai_agents_user_category 
ON ai_agents(user_id, category);

-- Index for finding system agents by name
CREATE INDEX IF NOT EXISTS idx_ai_agents_name_category 
ON ai_agents(name, category) 
WHERE category = 'system';

-- ============================================
-- PART 3: Update Existing Asset Insights Agents
-- ============================================

-- Update any existing Asset Insights Generator agents to have proper template_id and category
UPDATE ai_agents 
SET 
  template_id = 'asset-insights-generator',
  category = 'system'
WHERE name ILIKE '%Asset Insights%'
AND (template_id IS NULL OR category IS NULL OR category = 'custom');

-- ============================================
-- PART 4: Comments and Documentation
-- ============================================

COMMENT ON COLUMN ai_agents.template_id IS 
'References the template_id from system_agent_templates that this agent was created from. NULL for custom agents created from scratch.';

COMMENT ON COLUMN ai_agents.category IS 
'Agent category: system (auto-created system agents), template (deployed from template), or custom (user-created from scratch)';
