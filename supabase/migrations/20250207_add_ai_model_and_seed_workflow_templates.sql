-- Add ai_model column to asset_intelligence_workflow_templates table and seed all templates
-- This migration combines adding the field and seeding the data

-- Step 1: Add ai_model column if it doesn't exist
ALTER TABLE asset_intelligence_workflow_templates 
ADD COLUMN IF NOT EXISTS ai_model TEXT DEFAULT 'google/gemini-3-pro';

-- Add comment for the new column
COMMENT ON COLUMN asset_intelligence_workflow_templates.ai_model IS 'AI model to use for workflow execution (e.g., google/gemini-3-pro, anthropic/claude-sonnet-4.5)';

-- Step 2: Seed all workflow templates
-- Clear existing templates first to avoid duplicates
TRUNCATE asset_intelligence_workflow_templates CASCADE;

-- Insert all 9 workflow templates with ai_model field
INSERT INTO asset_intelligence_workflow_templates (
  id,
  name,
  description,
  category,
  workflow_type,
  steps,
  default_config,
  asset_types,
  estimated_duration,
  complexity,
  expected_outcomes,
  triggers,
  ai_model,
  created_at,
  updated_at
) VALUES
-- 1. Predictive Maintenance Intelligence
(
  'wf-pred-maint-001',
  'Predictive Maintenance Intelligence',
  'Advanced workflow combining real-time sensor data, historical maintenance records, and AI analysis to predict equipment failures and optimize maintenance schedules',
  'maintenance',
  'predictive_maintenance',
  ARRAY[
    'Collect real-time IoT sensor data (vibration, temperature, pressure)',
    'Analyze historical maintenance and failure patterns',
    'Apply machine learning models to predict failure probability',
    'Calculate optimal maintenance windows',
    'Generate prioritized maintenance recommendations',
    'Create work orders and alert maintenance teams'
  ]::TEXT[],
  jsonb_build_object(
    'prediction_window', '30 days',
    'confidence_threshold', 0.75,
    'sensor_types', ARRAY['temperature', 'vibration', 'pressure', 'humidity'],
    'alert_thresholds', jsonb_build_object(
      'critical', 0.9,
      'warning', 0.7,
      'normal', 0.5
    ),
    'analysis_frequency', 'hourly',
    'failure_modes', ARRAY['mechanical', 'electrical', 'thermal', 'wear']
  ),
  ARRAY['equipment', 'machinery', 'vehicles', 'infrastructure']::TEXT[],
  '2-4 hours',
  'advanced',
  ARRAY[
    'Reduced unplanned downtime by 40-60%',
    'Extended asset lifespan by 20-30%',
    'Optimized maintenance costs by 25-35%',
    'Improved equipment reliability and safety'
  ]::TEXT[],
  ARRAY['scheduled', 'threshold_breach', 'manual']::TEXT[],
  'google/gemini-3-pro',
  NOW(),
  NOW()
),

-- 2. Asset Lifecycle Optimization
(
  'wf-lifecycle-opt-002',
  'Asset Lifecycle Optimization',
  'Comprehensive workflow for optimizing asset utilization, performance, and ROI across the entire lifecycle from acquisition to disposal',
  'optimization',
  'lifecycle_management',
  ARRAY[
    'Assess current asset performance and utilization rates',
    'Analyze total cost of ownership (TCO) and depreciation',
    'Evaluate replacement vs. maintenance scenarios',
    'Calculate optimal upgrade and replacement timing',
    'Generate lifecycle strategy recommendations',
    'Create implementation roadmap with budget forecasts'
  ]::TEXT[],
  jsonb_build_object(
    'analysis_period', '5 years',
    'metrics_tracked', ARRAY['utilization', 'maintenance_cost', 'downtime', 'performance', 'energy_efficiency'],
    'optimization_goals', ARRAY['maximize_roi', 'minimize_tco', 'extend_lifespan'],
    'evaluation_criteria', jsonb_build_object(
      'performance_threshold', 0.7,
      'roi_target', 1.5,
      'payback_period', '36 months'
    )
  ),
  ARRAY['equipment', 'vehicles', 'infrastructure', 'technology']::TEXT[],
  '3-6 hours',
  'advanced',
  ARRAY[
    'Optimized asset replacement decisions',
    'Reduced total cost of ownership by 15-25%',
    'Improved capital planning accuracy',
    'Enhanced asset utilization by 30-40%'
  ]::TEXT[],
  ARRAY['scheduled', 'milestone', 'manual']::TEXT[],
  'google/gemini-3-pro',
  NOW(),
  NOW()
),

-- 3. Real-time Performance Monitoring
(
  'wf-perf-monitor-003',
  'Real-time Performance Monitoring',
  'Continuous monitoring workflow that tracks asset performance metrics, detects anomalies, and provides real-time alerts and optimization recommendations',
  'monitoring',
  'performance_tracking',
  ARRAY[
    'Establish performance baseline and KPI targets',
    'Collect real-time operational data from all sensors',
    'Apply anomaly detection algorithms',
    'Compare performance against benchmarks',
    'Generate real-time alerts for deviations',
    'Provide actionable optimization recommendations'
  ]::TEXT[],
  jsonb_build_object(
    'monitoring_frequency', 'real-time',
    'data_retention', '90 days',
    'kpis_tracked', ARRAY['efficiency', 'output', 'quality', 'energy_consumption', 'availability'],
    'anomaly_detection', jsonb_build_object(
      'method', 'statistical',
      'sensitivity', 'medium',
      'alert_delay', '5 minutes'
    ),
    'dashboard_refresh', '30 seconds'
  ),
  ARRAY['equipment', 'machinery', 'production_lines', 'energy_systems']::TEXT[],
  'Continuous',
  'intermediate',
  ARRAY[
    'Real-time visibility into asset performance',
    'Early detection of performance degradation',
    'Reduced response time to issues by 70%',
    'Improved operational efficiency by 15-20%'
  ]::TEXT[],
  ARRAY['continuous', 'threshold_breach']::TEXT[],
  'google/gemini-3-pro',
  NOW(),
  NOW()
),

-- 4. Risk Assessment and Mitigation
(
  'wf-risk-assess-004',
  'Risk Assessment and Mitigation',
  'Systematic workflow for identifying, analyzing, and mitigating asset-related risks including failure, compliance, safety, and financial risks',
  'risk_management',
  'risk_assessment',
  ARRAY[
    'Identify potential risk factors and failure modes',
    'Assess risk probability and impact severity',
    'Calculate risk scores and prioritize threats',
    'Develop mitigation strategies and contingency plans',
    'Estimate costs and resources for risk mitigation',
    'Create risk monitoring and reporting framework'
  ]::TEXT[],
  jsonb_build_object(
    'risk_categories', ARRAY['operational', 'financial', 'safety', 'compliance', 'environmental'],
    'assessment_methodology', 'FMEA',
    'risk_matrix', jsonb_build_object(
      'probability_levels', 5,
      'impact_levels', 5
    ),
    'mitigation_priorities', ARRAY['critical', 'high', 'medium', 'low'],
    'review_frequency', 'quarterly'
  ),
  ARRAY['equipment', 'facilities', 'infrastructure', 'vehicles']::TEXT[],
  '4-8 hours',
  'advanced',
  ARRAY[
    'Comprehensive risk visibility and prioritization',
    'Reduced risk exposure by 50-60%',
    'Improved safety and compliance',
    'Enhanced business continuity planning'
  ]::TEXT[],
  ARRAY['scheduled', 'event_triggered', 'manual']::TEXT[],
  'google/gemini-3-pro',
  NOW(),
  NOW()
),

-- 5. Sustainability and ESG Impact Analysis
(
  'wf-sustainability-005',
  'Sustainability and ESG Impact Analysis',
  'Comprehensive workflow for measuring, analyzing, and optimizing asset environmental impact, energy efficiency, and ESG compliance',
  'sustainability',
  'esg_analysis',
  ARRAY[
    'Calculate carbon footprint and emissions data',
    'Assess energy consumption and efficiency metrics',
    'Evaluate waste generation and recycling rates',
    'Analyze compliance with environmental regulations',
    'Identify sustainability improvement opportunities',
    'Generate ESG reports and sustainability roadmap'
  ]::TEXT[],
  jsonb_build_object(
    'metrics_tracked', ARRAY['carbon_emissions', 'energy_consumption', 'water_usage', 'waste_generation', 'recycling_rate'],
    'reporting_standards', ARRAY['GRI', 'SASB', 'TCFD', 'CDP'],
    'analysis_period', '12 months',
    'improvement_targets', jsonb_build_object(
      'emissions_reduction', '20%',
      'energy_efficiency', '15%',
      'waste_reduction', '25%'
    ),
    'certification_goals', ARRAY['ISO 14001', 'LEED', 'Energy Star']
  ),
  ARRAY['facilities', 'equipment', 'vehicles', 'energy_systems']::TEXT[],
  '6-10 hours',
  'advanced',
  ARRAY[
    'Complete ESG impact visibility',
    'Reduced environmental footprint by 20-30%',
    'Enhanced sustainability reporting',
    'Improved regulatory compliance'
  ]::TEXT[],
  ARRAY['scheduled', 'manual']::TEXT[],
  'google/gemini-3-pro',
  NOW(),
  NOW()
),

-- 6. IoT Sensor Integration and Intelligence
(
  'wf-iot-integration-006',
  'IoT Sensor Integration and Intelligence',
  'Advanced workflow for integrating IoT sensor networks, processing real-time data streams, and generating actionable intelligence from sensor analytics',
  'integration',
  'iot_analytics',
  ARRAY[
    'Configure and calibrate IoT sensor network',
    'Establish data streaming and aggregation pipelines',
    'Apply edge computing and preprocessing',
    'Analyze sensor data patterns and correlations',
    'Generate predictive insights from sensor trends',
    'Create automated responses and control actions'
  ]::TEXT[],
  jsonb_build_object(
    'sensor_types', ARRAY['temperature', 'pressure', 'vibration', 'humidity', 'motion', 'acoustic'],
    'data_frequency', jsonb_build_object(
      'collection', 'every 10 seconds',
      'aggregation', 'every 1 minute',
      'analysis', 'every 5 minutes'
    ),
    'edge_processing', true,
    'ml_models', ARRAY['anomaly_detection', 'pattern_recognition', 'predictive_analytics'],
    'alert_channels', ARRAY['dashboard', 'email', 'sms', 'webhook']
  ),
  ARRAY['equipment', 'facilities', 'infrastructure', 'environmental']::TEXT[],
  '2-4 hours',
  'advanced',
  ARRAY[
    'Real-time asset condition visibility',
    'Predictive insights from sensor data',
    'Automated anomaly detection and alerts',
    'Improved operational intelligence by 40%'
  ]::TEXT[],
  ARRAY['continuous', 'threshold_breach']::TEXT[],
  'google/gemini-3-pro',
  NOW(),
  NOW()
),

-- 7. Cost Optimization and Budget Management
(
  'wf-cost-optimize-007',
  'Cost Optimization and Budget Management',
  'Data-driven workflow for analyzing asset costs, identifying optimization opportunities, and managing budgets across the asset portfolio',
  'financial',
  'cost_optimization',
  ARRAY[
    'Collect and consolidate cost data across all assets',
    'Analyze spending patterns and cost drivers',
    'Benchmark costs against industry standards',
    'Identify cost reduction opportunities',
    'Develop budget optimization recommendations',
    'Create cost monitoring and control framework'
  ]::TEXT[],
  jsonb_build_object(
    'cost_categories', ARRAY['acquisition', 'maintenance', 'operation', 'energy', 'disposal'],
    'analysis_period', '12 months',
    'optimization_targets', jsonb_build_object(
      'maintenance_cost_reduction', '15%',
      'energy_cost_reduction', '20%',
      'operational_efficiency', '10%'
    ),
    'benchmarking_sources', ARRAY['industry_average', 'peer_comparison', 'historical_trends'],
    'reporting_frequency', 'monthly'
  ),
  ARRAY['equipment', 'vehicles', 'facilities', 'infrastructure']::TEXT[],
  '4-6 hours',
  'intermediate',
  ARRAY[
    'Comprehensive cost visibility and analysis',
    'Identified cost savings of 10-20%',
    'Optimized budget allocation',
    'Improved financial decision-making'
  ]::TEXT[],
  ARRAY['scheduled', 'manual']::TEXT[],
  'google/gemini-3-pro',
  NOW(),
  NOW()
),

-- 8. Compliance and Regulatory Automation
(
  'wf-compliance-008',
  'Compliance and Regulatory Automation',
  'Automated workflow for tracking regulatory requirements, ensuring compliance, managing certifications, and generating audit-ready documentation',
  'compliance',
  'regulatory_management',
  ARRAY[
    'Identify applicable regulations and standards',
    'Assess current compliance status and gaps',
    'Track certification and inspection schedules',
    'Monitor regulatory changes and updates',
    'Generate compliance reports and documentation',
    'Create remediation plans for non-compliance'
  ]::TEXT[],
  jsonb_build_object(
    'regulatory_frameworks', ARRAY['OSHA', 'EPA', 'ISO', 'industry_specific'],
    'compliance_areas', ARRAY['safety', 'environmental', 'quality', 'security', 'data_privacy'],
    'tracking_frequency', 'daily',
    'certification_alerts', jsonb_build_object(
      'renewal_notice', '60 days',
      'inspection_reminder', '14 days'
    ),
    'audit_readiness', true,
    'documentation_retention', '7 years'
  ),
  ARRAY['equipment', 'facilities', 'vehicles', 'data_systems']::TEXT[],
  '3-5 hours',
  'intermediate',
  ARRAY[
    'Automated compliance tracking',
    'Reduced compliance risks',
    'Streamlined audit preparation',
    'Improved regulatory reporting accuracy'
  ]::TEXT[],
  ARRAY['scheduled', 'event_triggered', 'manual']::TEXT[],
  'google/gemini-3-pro',
  NOW(),
  NOW()
),

-- 9. Security and Access Control Management
(
  'wf-security-009',
  'Security and Access Control Management',
  'Comprehensive workflow for managing asset security, access control, threat detection, and incident response',
  'security',
  'security_management',
  ARRAY[
    'Assess security posture and vulnerabilities',
    'Configure access control policies and permissions',
    'Monitor security events and access logs',
    'Detect and analyze security threats',
    'Respond to security incidents',
    'Generate security reports and recommendations'
  ]::TEXT[],
  jsonb_build_object(
    'security_layers', ARRAY['physical', 'network', 'application', 'data'],
    'access_control', jsonb_build_object(
      'authentication', 'multi-factor',
      'authorization', 'role-based',
      'audit_logging', true
    ),
    'threat_detection', ARRAY['intrusion', 'anomaly', 'vulnerability'],
    'incident_response', jsonb_build_object(
      'severity_levels', ARRAY['critical', 'high', 'medium', 'low'],
      'response_time', jsonb_build_object(
        'critical', '15 minutes',
        'high', '1 hour',
        'medium', '4 hours'
      )
    ),
    'monitoring_frequency', 'continuous'
  ),
  ARRAY['data_systems', 'facilities', 'equipment', 'infrastructure']::TEXT[],
  '2-4 hours',
  'advanced',
  ARRAY[
    'Enhanced security posture',
    'Reduced security incidents by 60%',
    'Improved incident response time',
    'Comprehensive security visibility'
  ]::TEXT[],
  ARRAY['continuous', 'threshold_breach', 'manual']::TEXT[],
  'google/gemini-3-pro',
  NOW(),
  NOW()
);

-- Create index on ai_model for faster filtering
CREATE INDEX IF NOT EXISTS idx_workflow_templates_ai_model 
ON asset_intelligence_workflow_templates(ai_model);

-- Add comment
COMMENT ON INDEX idx_workflow_templates_ai_model IS 'Index for filtering workflows by AI model';
