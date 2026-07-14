-- Migration: Create Asset Insights System Agent Template and Auto-Create on User Signup
-- Purpose: Provide dedicated AI agent for asset intelligence insights generation
-- Date: 2025-01-07

-- ============================================
-- PART 1: Create System Agent Template
-- ============================================

-- Insert the Asset Insights Generator system template
INSERT INTO system_agent_templates (
  id,
  name,
  description,
  category,
  default_model_id,
  system_prompt,
  temperature,
  max_tokens,
  tools,
  is_active,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Asset Insights Generator',
  'Dedicated AI agent for generating comprehensive asset intelligence insights including predictive maintenance, cost optimization, utilization analysis, compliance risk assessment, and ESG impact evaluation',
  'system',
  'gemini-2.5-pro',
  'You are an Asset Intelligence Specialist AI agent. Your purpose is to analyze physical assets, IoT sensor data, lifecycle events, and operational history to generate actionable insights and strategic recommendations.

Your expertise includes:

1. PREDICTIVE MAINTENANCE: Analyze maintenance history, sensor data, and asset condition to predict failures, recommend preventive actions, and optimize maintenance schedules.

2. COST OPTIMIZATION: Identify opportunities to reduce operational costs, improve asset efficiency, and maximize return on investment through data-driven recommendations.

3. UTILIZATION ANALYSIS: Assess asset usage patterns, identify underutilized resources, and provide strategies to improve operational efficiency and capacity planning.

4. COMPLIANCE & RISK: Evaluate regulatory compliance status, identify potential risks, and recommend actions to maintain standards and certifications.

5. ESG IMPACT: Calculate environmental footprint, sustainability scores, and circular economy metrics. Provide recommendations for improving ESG performance.

6. LIFECYCLE PREDICTIONS: Forecast asset lifecycle stages, estimate remaining useful life, and recommend optimal replacement timing based on total cost of ownership.

When analyzing assets, you should:
- Process structured data including specifications, maintenance records, costs, and performance metrics
- Correlate IoT sensor readings with operational patterns and failure indicators
- Consider historical trends and industry benchmarks for accurate predictions
- Provide confidence scores (0-100%) for each insight based on data quality and completeness
- Prioritize insights by business impact (critical, high, medium, low)
- Generate specific, actionable recommendations with clear implementation steps
- Quantify expected outcomes including cost savings, risk reduction, and efficiency gains

Always base your analysis on available data and clearly indicate when additional information would improve accuracy. Your insights should be concise, business-focused, and immediately actionable.',
  0.4,
  2000,
  ARRAY['query_database', 'analyze_data', 'generate_asset_insights', 'web_search']::text[],
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- ============================================
-- PART 2: Auto-Create Agent Function
-- ============================================

-- Function to create asset insights agent for new users
CREATE OR REPLACE FUNCTION create_asset_insights_agent_for_user()
RETURNS TRIGGER AS $$
DECLARE
  template_record RECORD;
BEGIN
  -- Get the Asset Insights Generator template
  SELECT * INTO template_record
  FROM system_agent_templates
  WHERE name = 'Asset Insights Generator'
  AND category = 'system'
  AND is_active = true
  LIMIT 1;

  -- Create the agent instance for the new user if template exists
  IF template_record.id IS NOT NULL THEN
    INSERT INTO ai_agents (
      id,
      user_id,
      name,
      description,
      category,
      model_id,
      system_prompt,
      temperature,
      max_tokens,
      tools,
      is_active,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      NEW.id,
      template_record.name,
      template_record.description,
      'system',
      template_record.default_model_id,
      template_record.system_prompt,
      template_record.temperature,
      template_record.max_tokens,
      template_record.tools,
      true,
      NOW(),
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PART 3: Create Trigger
-- ============================================

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created_asset_insights_agent ON auth.users;

-- Create trigger to auto-create agent when user signs up
CREATE TRIGGER on_auth_user_created_asset_insights_agent
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_asset_insights_agent_for_user();

-- ============================================
-- PART 4: Backfill Existing Users
-- ============================================

-- Create asset insights agents for existing users who don't have one
DO $$
DECLARE
  template_record RECORD;
  user_record RECORD;
BEGIN
  -- Get the template
  SELECT * INTO template_record
  FROM system_agent_templates
  WHERE name = 'Asset Insights Generator'
  AND category = 'system'
  AND is_active = true
  LIMIT 1;

  -- If template exists, create agents for existing users
  IF template_record.id IS NOT NULL THEN
    FOR user_record IN
      SELECT id FROM auth.users
      WHERE NOT EXISTS (
        SELECT 1 FROM ai_agents
        WHERE ai_agents.user_id = auth.users.id
        AND ai_agents.name = 'Asset Insights Generator'
        AND ai_agents.category = 'system'
      )
    LOOP
      INSERT INTO ai_agents (
        id,
        user_id,
        name,
        description,
        category,
        model_id,
        system_prompt,
        temperature,
        max_tokens,
        tools,
        is_active,
        created_at,
        updated_at
      ) VALUES (
        gen_random_uuid(),
        user_record.id,
        template_record.name,
        template_record.description,
        'system',
        template_record.default_model_id,
        template_record.system_prompt,
        template_record.temperature,
        template_record.max_tokens,
        template_record.tools,
        true,
        NOW(),
        NOW()
      );
    END LOOP;
  END IF;
END $$;

-- ============================================
-- PART 5: Add Indexes for Performance
-- ============================================

-- Index for finding user's system agents
CREATE INDEX IF NOT EXISTS idx_ai_agents_user_category 
ON ai_agents(user_id, category) 
WHERE category = 'system';

-- Index for finding active system templates
CREATE INDEX IF NOT EXISTS idx_system_agent_templates_active 
ON system_agent_templates(category, is_active) 
WHERE category = 'system' AND is_active = true;

-- ============================================
-- PART 6: Comments and Documentation
-- ============================================

COMMENT ON FUNCTION create_asset_insights_agent_for_user() IS 
'Automatically creates an Asset Insights Generator agent for each new user upon signup. This agent is used for generating predictive maintenance schedules, cost optimization strategies, and ESG impact assessments.';

COMMENT ON TRIGGER on_auth_user_created_asset_insights_agent ON auth.users IS 
'Triggers automatic creation of Asset Insights Generator agent when a new user account is created';
