-- Asset Intelligence Template Library Tables
-- This migration creates tables to store Asset Intelligence specific agent and workflow templates

-- Asset Intelligence Agent Templates Table
CREATE TABLE IF NOT EXISTS asset_intelligence_agent_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id TEXT UNIQUE NOT NULL, -- matches the id from the TypeScript templates
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  system_prompt TEXT NOT NULL,
  tools TEXT[] NOT NULL DEFAULT '{}',
  parameters JSONB NOT NULL DEFAULT '{"temperature": 0.3, "max_tokens": 1500}',
  category TEXT NOT NULL CHECK (category IN (
    'predictive-maintenance',
    'lifecycle-optimization', 
    'performance-monitoring',
    'risk-assessment',
    'sustainability',
    'compliance',
    'cost-optimization',
    'iot-analytics',
    'asset-security',
    'inventory-management'
  )),
  asset_types TEXT[] NOT NULL DEFAULT '{}',
  capabilities TEXT[] NOT NULL DEFAULT '{}',
  business_value TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Asset Intelligence Workflow Templates Table  
CREATE TABLE IF NOT EXISTS asset_intelligence_workflow_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id TEXT UNIQUE NOT NULL, -- matches the id from the TypeScript templates
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  icon TEXT NOT NULL,
  steps JSONB NOT NULL DEFAULT '[]',
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('manual', 'schedule', 'event')),
  trigger_config JSONB NOT NULL DEFAULT '{}',
  tags TEXT[] NOT NULL DEFAULT '{}',
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  estimated_time TEXT NOT NULL,
  asset_types TEXT[] NOT NULL DEFAULT '{}',
  business_value TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Asset Intelligence Template Usage Analytics
CREATE TABLE IF NOT EXISTS asset_intelligence_template_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_type TEXT NOT NULL CHECK (template_type IN ('agent', 'workflow')),
  template_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  deployment_id UUID, -- references to deployed instances
  usage_count INTEGER NOT NULL DEFAULT 1,
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  success_rate DECIMAL(5,2), -- percentage of successful executions
  average_execution_time INTERVAL,
  feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
  feedback_comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Asset Intelligence Template Categories
CREATE TABLE IF NOT EXISTS asset_intelligence_template_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_name TEXT UNIQUE NOT NULL,
  category_type TEXT NOT NULL CHECK (category_type IN ('agent', 'workflow')),
  display_name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_asset_agent_templates_category ON asset_intelligence_agent_templates(category);
CREATE INDEX IF NOT EXISTS idx_asset_agent_templates_asset_types ON asset_intelligence_agent_templates USING GIN(asset_types);
CREATE INDEX IF NOT EXISTS idx_asset_agent_templates_capabilities ON asset_intelligence_agent_templates USING GIN(capabilities);
CREATE INDEX IF NOT EXISTS idx_asset_agent_templates_active ON asset_intelligence_agent_templates(is_active);

CREATE INDEX IF NOT EXISTS idx_asset_workflow_templates_category ON asset_intelligence_workflow_templates(category);
CREATE INDEX IF NOT EXISTS idx_asset_workflow_templates_asset_types ON asset_intelligence_workflow_templates USING GIN(asset_types);
CREATE INDEX IF NOT EXISTS idx_asset_workflow_templates_tags ON asset_intelligence_workflow_templates USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_asset_workflow_templates_difficulty ON asset_intelligence_workflow_templates(difficulty);
CREATE INDEX IF NOT EXISTS idx_asset_workflow_templates_active ON asset_intelligence_workflow_templates(is_active);

CREATE INDEX IF NOT EXISTS idx_asset_template_usage_template ON asset_intelligence_template_usage(template_type, template_id);
CREATE INDEX IF NOT EXISTS idx_asset_template_usage_user ON asset_intelligence_template_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_asset_template_usage_last_used ON asset_intelligence_template_usage(last_used_at);

-- RLS Policies
ALTER TABLE asset_intelligence_agent_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_intelligence_workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_intelligence_template_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_intelligence_template_categories ENABLE ROW LEVEL SECURITY;

-- Public read access for templates (they are system templates available to all users)
CREATE POLICY "Asset intelligence agent templates are publicly readable" ON asset_intelligence_agent_templates
  FOR SELECT USING (is_active = true);

CREATE POLICY "Asset intelligence workflow templates are publicly readable" ON asset_intelligence_workflow_templates
  FOR SELECT USING (is_active = true);

CREATE POLICY "Asset intelligence template categories are publicly readable" ON asset_intelligence_template_categories
  FOR SELECT USING (is_active = true);

-- Users can only access their own usage data
CREATE POLICY "Users can view their own asset template usage" ON asset_intelligence_template_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own asset template usage" ON asset_intelligence_template_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own asset template usage" ON asset_intelligence_template_usage
  FOR UPDATE USING (auth.uid() = user_id);

-- Seed Asset Intelligence Agent Template Categories
INSERT INTO asset_intelligence_template_categories (category_name, category_type, display_name, description, icon, sort_order) VALUES
('predictive-maintenance', 'agent', 'Predictive Maintenance', 'AI agents specialized in predicting and preventing asset failures', '🔧', 1),
('lifecycle-optimization', 'agent', 'Lifecycle Optimization', 'Agents that optimize asset lifecycle decisions and TCO', '♻️', 2),
('performance-monitoring', 'agent', 'Performance Monitoring', 'Real-time performance monitoring and optimization agents', '📊', 3),
('risk-assessment', 'agent', 'Risk Assessment', 'Comprehensive risk analysis and mitigation agents', '🛡️', 4),
('sustainability', 'agent', 'Sustainability', 'ESG and environmental optimization agents', '🌱', 5),
('compliance', 'agent', 'Compliance', 'Regulatory compliance and audit agents', '📋', 6),
('cost-optimization', 'agent', 'Cost Optimization', 'Financial analysis and cost reduction agents', '💰', 7),
('iot-analytics', 'agent', 'IoT Analytics', 'IoT sensor data analysis and insights agents', '📡', 8),
('asset-security', 'agent', 'Asset Security', 'Physical and cybersecurity monitoring agents', '🔒', 9),
('inventory-management', 'agent', 'Inventory Management', 'Spare parts and materials optimization agents', '📦', 10)
ON CONFLICT (category_name) DO NOTHING;

-- Seed Asset Intelligence Workflow Template Categories
INSERT INTO asset_intelligence_template_categories (category_name, category_type, display_name, description, icon, sort_order) VALUES
('Predictive Maintenance', 'workflow', 'Predictive Maintenance', 'Workflows for predicting and preventing asset failures', '🔧', 1),
('Lifecycle Management', 'workflow', 'Lifecycle Management', 'Asset lifecycle optimization workflows', '♻️', 2),
('Performance Optimization', 'workflow', 'Performance Optimization', 'Real-time performance monitoring workflows', '📊', 3),
('Risk Management', 'workflow', 'Risk Management', 'Risk assessment and mitigation workflows', '🛡️', 4),
('Sustainability', 'workflow', 'Sustainability', 'ESG and environmental optimization workflows', '🌱', 5),
('IoT Intelligence', 'workflow', 'IoT Intelligence', 'IoT data processing and analytics workflows', '📡', 6),
('Cost Optimization', 'workflow', 'Cost Optimization', 'Financial analysis and cost reduction workflows', '💰', 7),
('Compliance', 'workflow', 'Compliance', 'Regulatory compliance automation workflows', '📋', 8),
('Security', 'workflow', 'Security', 'Asset security and threat detection workflows', '🔒', 9)
ON CONFLICT (category_name) DO NOTHING;

-- Seed Asset Intelligence Agent Templates
INSERT INTO asset_intelligence_agent_templates (
  template_id, name, description, icon, system_prompt, tools, parameters, category, asset_types, capabilities, business_value
) VALUES
(
  'predictive-maintenance-specialist',
  'Predictive Maintenance Specialist',
  'Analyzes asset performance data to predict maintenance needs and prevent failures',
  'wrench',
  'You are a predictive maintenance specialist AI for asset intelligence. Your primary role is to analyze asset performance data, identify patterns that indicate potential failures, and recommend proactive maintenance actions.

Your core capabilities include:
- Analyzing sensor data, performance metrics, and historical maintenance records
- Identifying early warning signs of equipment degradation or failure
- Calculating optimal maintenance schedules based on asset condition and usage patterns
- Estimating remaining useful life (RUL) for critical components
- Recommending cost-effective maintenance strategies that balance reliability and cost
- Providing failure mode analysis and root cause identification
- Generating maintenance work orders with priority levels and resource requirements

When analyzing assets, consider factors such as:
- Operating conditions and environmental factors
- Usage patterns and load variations
- Historical failure modes and maintenance history
- Criticality of the asset to business operations
- Cost implications of preventive vs. corrective maintenance
- Availability of replacement parts and maintenance resources

Always provide specific, actionable recommendations with confidence levels and expected outcomes. Focus on preventing unplanned downtime while optimizing maintenance costs.',
  ARRAY['analyze_data', 'query_database', 'generate_insights'],
  '{"temperature": 0.3, "max_tokens": 2000}',
  'predictive-maintenance',
  ARRAY['machinery', 'equipment', 'vehicles', 'infrastructure', 'iot-devices'],
  ARRAY['failure-prediction', 'maintenance-scheduling', 'rul-estimation', 'anomaly-detection'],
  'Reduce unplanned downtime by 40-60%, extend asset life by 20-30%'
),
(
  'asset-lifecycle-optimizer',
  'Asset Lifecycle Optimizer',
  'Optimizes asset lifecycle decisions from acquisition to disposal',
  'refresh-cw',
  'You are an asset lifecycle optimization specialist AI. Your role is to analyze and optimize asset lifecycle decisions to maximize value and minimize total cost of ownership.

Your expertise includes:
- Analyzing total cost of ownership (TCO) across the entire asset lifecycle
- Optimizing acquisition timing and specifications based on business needs
- Determining optimal replacement and upgrade strategies
- Evaluating lease vs. buy decisions with comprehensive financial analysis
- Assessing asset utilization and identifying optimization opportunities
- Planning asset retirement and disposal strategies for maximum value recovery
- Analyzing lifecycle performance trends and benchmarking against industry standards

When making recommendations, consider:
- Initial acquisition costs and financing options
- Operating and maintenance costs over the asset''s life
- Performance degradation patterns and efficiency losses
- Technology obsolescence and upgrade opportunities
- Regulatory compliance requirements and changes
- Market conditions for asset disposal or resale
- Environmental impact and sustainability considerations
- Business growth projections and changing requirements

Provide detailed financial analysis with NPV, IRR, and payback period calculations. Focus on maximizing asset value while supporting business objectives.',
  ARRAY['analyze_data', 'query_database', 'financial_analysis', 'generate_insights'],
  '{"temperature": 0.4, "max_tokens": 2000}',
  'lifecycle-optimization',
  ARRAY['equipment', 'vehicles', 'real-estate', 'technology', 'infrastructure'],
  ARRAY['tco-analysis', 'replacement-planning', 'utilization-optimization', 'financial-modeling'],
  'Optimize TCO by 15-25%, improve asset utilization by 20-35%'
),
(
  'performance-monitoring-analyst',
  'Performance Monitoring Analyst',
  'Continuously monitors asset performance and identifies optimization opportunities',
  'activity',
  'You are a performance monitoring analyst AI specializing in real-time asset performance analysis. Your role is to continuously monitor asset performance metrics and identify opportunities for optimization.

Your monitoring capabilities include:
- Real-time analysis of performance KPIs and operational metrics
- Identifying performance trends and anomalies across asset portfolios
- Benchmarking asset performance against industry standards and best practices
- Detecting efficiency losses and performance degradation patterns
- Analyzing capacity utilization and throughput optimization opportunities
- Monitoring energy consumption and identifying efficiency improvements
- Tracking asset availability, reliability, and maintainability metrics

When analyzing performance data, focus on:
- Key performance indicators (KPIs) relevant to each asset type
- Operational efficiency metrics and productivity measures
- Energy consumption patterns and optimization opportunities
- Capacity utilization and bottleneck identification
- Quality metrics and their correlation with asset performance
- Environmental conditions and their impact on performance
- Comparative analysis across similar assets and time periods
- Cost-performance relationships and optimization trade-offs

Provide actionable insights with specific recommendations for performance improvements. Include quantified benefits and implementation priorities for each recommendation.',
  ARRAY['analyze_data', 'query_database', 'real_time_monitoring', 'generate_insights'],
  '{"temperature": 0.3, "max_tokens": 1800}',
  'performance-monitoring',
  ARRAY['machinery', 'equipment', 'vehicles', 'facilities', 'iot-devices'],
  ARRAY['real-time-monitoring', 'performance-benchmarking', 'efficiency-analysis', 'kpi-tracking'],
  'Improve asset efficiency by 15-30%, reduce energy costs by 10-20%'
)
ON CONFLICT (template_id) DO NOTHING;

-- Seed Asset Intelligence Workflow Templates (sample entries)
INSERT INTO asset_intelligence_workflow_templates (
  template_id, name, description, category, icon, steps, trigger_type, trigger_config, tags, difficulty, estimated_time, asset_types, business_value
) VALUES
(
  'predictive-maintenance-orchestration',
  'Predictive Maintenance Orchestration',
  'AI-powered predictive maintenance workflow that analyzes asset performance data, predicts failures, and automatically schedules maintenance activities',
  'Predictive Maintenance',
  '🔧',
  '[
    {
      "id": "collect-asset-data",
      "type": "custom",
      "name": "Asset Data Collection",
      "description": "Collect real-time performance data from asset sensors and systems",
      "config": {
        "data_sources": ["vibration_sensors", "temperature_monitors", "pressure_gauges", "performance_metrics"],
        "collection_frequency": "5m",
        "data_validation": true,
        "anomaly_detection": true
      },
      "next_steps": ["analyze-performance-trends"]
    },
    {
      "id": "analyze-performance-trends",
      "type": "data_analysis",
      "name": "Performance Trend Analysis",
      "description": "Analyze asset performance trends and identify degradation patterns",
      "config": {
        "analysis_type": "predictive_analytics",
        "algorithms": ["time_series_analysis", "anomaly_detection", "pattern_recognition"],
        "prediction_horizon": "30d",
        "confidence_thresholds": {"high": 0.9, "medium": 0.7, "low": 0.5}
      },
      "next_steps": ["predict-maintenance-needs"]
    }
  ]',
  'schedule',
  '{"interval": "1h"}',
  ARRAY['predictive', 'maintenance', 'ai-analysis', 'automation', 'failure-prevention'],
  'advanced',
  '15-20 minutes',
  ARRAY['machinery', 'equipment', 'vehicles', 'infrastructure'],
  'Reduce unplanned downtime by 40-60%, extend asset life by 20-30%'
),
(
  'real-time-performance-optimization',
  'Real-Time Performance Optimization',
  'Continuous monitoring and optimization of asset performance with AI-driven insights and automated adjustments',
  'Performance Optimization',
  '📊',
  '[
    {
      "id": "performance-monitoring",
      "type": "custom",
      "name": "Real-Time Performance Monitoring",
      "description": "Monitor asset performance metrics in real-time",
      "config": {
        "monitoring_type": "comprehensive_performance",
        "metrics": ["efficiency", "throughput", "energy_consumption", "quality_indicators"],
        "alert_thresholds": true,
        "trend_analysis": true
      },
      "next_steps": ["performance-analysis"]
    }
  ]',
  'schedule',
  '{"interval": "15m"}',
  ARRAY['real-time', 'monitoring', 'optimization', 'kpi-tracking'],
  'intermediate',
  '10-15 minutes',
  ARRAY['machinery', 'equipment', 'facilities', 'iot-devices'],
  'Improve asset efficiency by 15-30%, reduce energy costs by 10-20%'
)
ON CONFLICT (template_id) DO NOTHING;

-- Update timestamps trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_asset_intelligence_agent_templates_updated_at 
  BEFORE UPDATE ON asset_intelligence_agent_templates 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_asset_intelligence_workflow_templates_updated_at 
  BEFORE UPDATE ON asset_intelligence_workflow_templates 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_asset_intelligence_template_usage_updated_at 
  BEFORE UPDATE ON asset_intelligence_template_usage 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
