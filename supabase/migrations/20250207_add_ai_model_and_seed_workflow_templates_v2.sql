-- Add ai_model column to asset_intelligence_workflow_templates table
ALTER TABLE asset_intelligence_workflow_templates
ADD COLUMN IF NOT EXISTS ai_model TEXT NOT NULL DEFAULT 'google/gemini-3-pro';

-- Create index for efficient filtering by AI model
CREATE INDEX IF NOT EXISTS idx_asset_workflow_templates_ai_model 
ON asset_intelligence_workflow_templates(ai_model);

-- Seed all Asset Intelligence Workflow Templates from TypeScript definitions
INSERT INTO asset_intelligence_workflow_templates (
  template_id,
  name,
  description,
  category,
  icon,
  steps,
  trigger_type,
  trigger_config,
  tags,
  difficulty,
  estimated_time,
  asset_types,
  business_value,
  ai_model,
  is_active,
  version
) VALUES
-- 1. Predictive Maintenance Orchestration
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
      }
    },
    {
      "id": "analyze-performance-trends",
      "type": "data_analysis",
      "name": "Performance Trend Analysis",
      "description": "Analyze asset performance trends and identify degradation patterns",
      "config": {
        "analysis_type": "predictive_analytics",
        "algorithms": ["time_series_analysis", "anomaly_detection", "pattern_recognition"],
        "prediction_horizon": "30d"
      }
    },
    {
      "id": "predict-maintenance-needs",
      "type": "ai_agent",
      "name": "AI-Powered Failure Prediction",
      "description": "Use AI to predict potential failures and maintenance needs",
      "config": {
        "agent_type": "predictive_maintenance",
        "prediction_models": ["remaining_useful_life", "failure_probability", "degradation_trends"],
        "confidence_threshold": 0.7
      }
    },
    {
      "id": "schedule-maintenance",
      "type": "automation",
      "name": "Automated Maintenance Scheduling",
      "description": "Automatically schedule maintenance based on predictions",
      "config": {
        "scheduling_logic": "priority_based",
        "maintenance_window": "optimal",
        "resource_allocation": true
      }
    }
  ]'::jsonb,
  'schedule',
  '{"interval": "1h", "enabled": true}'::jsonb,
  ARRAY['predictive', 'maintenance', 'ai-analysis', 'automation', 'failure-prevention'],
  'advanced',
  '15-20 minutes',
  ARRAY['machinery', 'equipment', 'vehicles', 'infrastructure'],
  'Reduce unplanned downtime by 40-60%, extend asset life by 20-30%',
  'google/gemini-3-pro',
  true,
  1
),
-- 2. Lifecycle Optimization Workflow
(
  'asset-lifecycle-optimization',
  'Asset Lifecycle Optimization',
  'Comprehensive lifecycle management workflow that optimizes acquisition, utilization, and disposal decisions',
  'Lifecycle Management',
  '♻️',
  '[
    {
      "id": "lifecycle-analysis",
      "type": "data_analysis",
      "name": "Lifecycle Data Analysis",
      "description": "Analyze asset lifecycle data including TCO, utilization, and performance",
      "config": {
        "analysis_scope": ["acquisition", "operation", "maintenance", "disposal"],
        "tco_calculation": true,
        "benchmarking": true
      }
    },
    {
      "id": "optimization-recommendations",
      "type": "ai_agent",
      "name": "AI Optimization Recommendations",
      "description": "Generate AI-powered recommendations for lifecycle optimization",
      "config": {
        "recommendation_types": ["replacement_timing", "upgrade_opportunities", "utilization_improvements"],
        "financial_analysis": true
      }
    },
    {
      "id": "decision-support",
      "type": "reporting",
      "name": "Decision Support Dashboard",
      "description": "Generate comprehensive decision support reports",
      "config": {
        "report_types": ["financial_analysis", "performance_projections", "risk_assessment"],
        "visualization": true
      }
    }
  ]'::jsonb,
  'manual',
  '{}'::jsonb,
  ARRAY['lifecycle', 'optimization', 'tco-analysis', 'decision-support'],
  'intermediate',
  '20-30 minutes',
  ARRAY['equipment', 'vehicles', 'real-estate', 'technology'],
  'Optimize TCO by 15-25%, improve asset utilization by 20-35%',
  'google/gemini-3-pro',
  true,
  1
),
-- 3. Real-Time Performance Monitoring
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
        "sampling_rate": "1m"
      }
    },
    {
      "id": "performance-analysis",
      "type": "ai_agent",
      "name": "Performance Analysis & Insights",
      "description": "AI-powered analysis of performance trends and anomalies",
      "config": {
        "analysis_type": "real_time_analytics",
        "anomaly_detection": true,
        "trend_prediction": true
      }
    },
    {
      "id": "optimization-actions",
      "type": "automation",
      "name": "Automated Performance Optimization",
      "description": "Execute automated optimization actions based on AI recommendations",
      "config": {
        "action_types": ["parameter_tuning", "resource_allocation", "scheduling_adjustments"],
        "approval_required": false
      }
    }
  ]'::jsonb,
  'schedule',
  '{"interval": "15m", "enabled": true}'::jsonb,
  ARRAY['real-time', 'monitoring', 'optimization', 'kpi-tracking'],
  'intermediate',
  '10-15 minutes',
  ARRAY['machinery', 'equipment', 'facilities', 'iot-devices'],
  'Improve asset efficiency by 15-30%, reduce energy costs by 10-20%',
  'google/gemini-3-pro',
  true,
  1
),
-- 4. Risk Assessment & Mitigation
(
  'comprehensive-risk-assessment',
  'Comprehensive Risk Assessment',
  'Multi-dimensional risk assessment workflow covering operational, financial, and compliance risks',
  'Risk Management',
  '🛡️',
  '[
    {
      "id": "risk-identification",
      "type": "data_analysis",
      "name": "Risk Identification & Classification",
      "description": "Identify and classify potential risks across all asset dimensions",
      "config": {
        "risk_categories": ["operational", "financial", "compliance", "safety", "environmental"],
        "data_sources": ["performance_data", "maintenance_history", "regulatory_databases"]
      }
    },
    {
      "id": "risk-analysis",
      "type": "ai_agent",
      "name": "AI-Powered Risk Analysis",
      "description": "Analyze risk probability, impact, and interdependencies",
      "config": {
        "analysis_methods": ["probability_assessment", "impact_analysis", "correlation_analysis"],
        "risk_modeling": true
      }
    },
    {
      "id": "mitigation-planning",
      "type": "ai_agent",
      "name": "Risk Mitigation Planning",
      "description": "Generate risk mitigation strategies and action plans",
      "config": {
        "strategy_types": ["preventive", "corrective", "contingency"],
        "cost_benefit_analysis": true
      }
    }
  ]'::jsonb,
  'manual',
  '{}'::jsonb,
  ARRAY['risk-assessment', 'compliance', 'safety', 'mitigation'],
  'advanced',
  '25-35 minutes',
  ARRAY['all-assets'],
  'Reduce risk exposure by 30-50%, improve compliance by 25%',
  'google/gemini-3-pro',
  true,
  1
),
-- 5. Sustainability & ESG Optimization
(
  'sustainability-esg-optimization',
  'Sustainability & ESG Optimization',
  'Comprehensive ESG workflow that optimizes environmental impact, social responsibility, and governance practices',
  'Sustainability',
  '🌱',
  '[
    {
      "id": "esg-data-collection",
      "type": "custom",
      "name": "ESG Data Collection",
      "description": "Collect environmental, social, and governance data",
      "config": {
        "data_categories": ["emissions", "energy_consumption", "waste_generation", "water_usage", "social_metrics"],
        "reporting_standards": ["GRI", "SASB", "TCFD"]
      }
    },
    {
      "id": "sustainability-analysis",
      "type": "ai_agent",
      "name": "Sustainability Analysis",
      "description": "AI-powered analysis of sustainability metrics and trends",
      "config": {
        "analysis_type": "comprehensive_esg",
        "benchmarking": true,
        "improvement_opportunities": true
      }
    },
    {
      "id": "optimization-recommendations",
      "type": "ai_agent",
      "name": "ESG Optimization Recommendations",
      "description": "Generate actionable recommendations for ESG improvements",
      "config": {
        "recommendation_areas": ["carbon_reduction", "efficiency_improvements", "waste_minimization"],
        "roi_calculation": true
      }
    }
  ]'::jsonb,
  'schedule',
  '{"interval": "1d", "enabled": true}'::jsonb,
  ARRAY['sustainability', 'esg', 'environmental', 'carbon-reduction'],
  'intermediate',
  '20-30 minutes',
  ARRAY['facilities', 'equipment', 'vehicles', 'infrastructure'],
  'Reduce carbon footprint by 20-40%, improve ESG scores by 15-25%',
  'google/gemini-3-pro',
  true,
  1
),
-- 6. IoT Intelligence & Analytics
(
  'iot-intelligence-analytics',
  'IoT Intelligence & Analytics',
  'Advanced IoT data processing and analytics workflow for sensor-equipped assets',
  'IoT Intelligence',
  '📡',
  '[
    {
      "id": "iot-data-ingestion",
      "type": "custom",
      "name": "IoT Data Ingestion",
      "description": "Real-time ingestion and processing of IoT sensor data",
      "config": {
        "data_sources": ["temperature_sensors", "vibration_sensors", "pressure_sensors", "gps_trackers"],
        "processing_mode": "stream",
        "data_validation": true
      }
    },
    {
      "id": "edge-analytics",
      "type": "data_analysis",
      "name": "Edge Analytics Processing",
      "description": "Process and analyze IoT data at the edge for immediate insights",
      "config": {
        "analytics_type": "real_time_edge",
        "algorithms": ["anomaly_detection", "pattern_recognition", "predictive_models"],
        "latency_optimization": true
      }
    },
    {
      "id": "ai-insights-generation",
      "type": "ai_agent",
      "name": "AI-Powered IoT Insights",
      "description": "Generate comprehensive insights from IoT data using AI",
      "config": {
        "insight_types": ["performance_optimization", "failure_prediction", "efficiency_improvements"],
        "visualization": true
      }
    }
  ]'::jsonb,
  'schedule',
  '{"interval": "5m", "enabled": true}'::jsonb,
  ARRAY['iot', 'real-time', 'analytics', 'sensors', 'edge-computing'],
  'advanced',
  '5-10 minutes',
  ARRAY['iot-devices', 'machinery', 'vehicles', 'infrastructure'],
  'Improve IoT insights by 40-60%, reduce latency by 70%',
  'google/gemini-3-pro',
  true,
  1
),
-- 7. Cost Optimization & Financial Analysis
(
  'cost-optimization-financial',
  'Cost Optimization & Financial Analysis',
  'Comprehensive financial analysis and cost optimization workflow for asset management',
  'Cost Optimization',
  '💰',
  '[
    {
      "id": "cost-data-collection",
      "type": "custom",
      "name": "Cost Data Collection",
      "description": "Collect comprehensive cost data across all asset lifecycle stages",
      "config": {
        "cost_categories": ["acquisition", "operation", "maintenance", "disposal", "overhead"],
        "time_periods": ["monthly", "quarterly", "annual"]
      }
    },
    {
      "id": "financial-analysis",
      "type": "data_analysis",
      "name": "Financial Analysis",
      "description": "Detailed financial analysis including TCO, ROI, and cost trends",
      "config": {
        "analysis_types": ["tco", "roi", "payback_period", "npv", "irr"],
        "variance_analysis": true
      }
    },
    {
      "id": "optimization-opportunities",
      "type": "ai_agent",
      "name": "AI Cost Optimization",
      "description": "Identify and quantify cost optimization opportunities using AI",
      "config": {
        "optimization_areas": ["energy_efficiency", "maintenance_optimization", "procurement_savings"],
        "savings_quantification": true
      }
    }
  ]'::jsonb,
  'manual',
  '{}'::jsonb,
  ARRAY['cost-optimization', 'financial-analysis', 'roi', 'savings'],
  'intermediate',
  '15-25 minutes',
  ARRAY['all-assets'],
  'Reduce operating costs by 10-20%, improve financial efficiency by 15%',
  'google/gemini-3-pro',
  true,
  1
),
-- 8. Compliance Automation
(
  'regulatory-compliance-automation',
  'Regulatory Compliance Automation',
  'Automated compliance monitoring and reporting workflow for regulatory requirements',
  'Compliance',
  '📋',
  '[
    {
      "id": "compliance-monitoring",
      "type": "custom",
      "name": "Compliance Monitoring",
      "description": "Continuous monitoring of compliance requirements and asset status",
      "config": {
        "regulatory_frameworks": ["ISO", "OSHA", "EPA", "industry_specific"],
        "monitoring_frequency": "continuous",
        "alert_thresholds": true
      }
    },
    {
      "id": "compliance-assessment",
      "type": "ai_agent",
      "name": "AI Compliance Assessment",
      "description": "AI-powered assessment of compliance status and gaps",
      "config": {
        "assessment_scope": "comprehensive",
        "gap_analysis": true,
        "risk_scoring": true
      }
    },
    {
      "id": "automated-reporting",
      "type": "reporting",
      "name": "Automated Compliance Reporting",
      "description": "Generate compliance reports and documentation automatically",
      "config": {
        "report_types": ["audit_reports", "certification_documents", "regulatory_filings"],
        "scheduling": "as_required"
      }
    }
  ]'::jsonb,
  'schedule',
  '{"interval": "1d", "enabled": true}'::jsonb,
  ARRAY['compliance', 'regulatory', 'audit', 'certification', 'automation'],
  'intermediate',
  '15-20 minutes',
  ARRAY['all-assets'],
  'Improve compliance by 30-40%, reduce audit time by 50%',
  'google/gemini-3-pro',
  true,
  1
),
-- 9. Security & Threat Detection
(
  'asset-security-threat-detection',
  'Asset Security & Threat Detection',
  'Comprehensive security monitoring and threat detection workflow for physical and cyber assets',
  'Security',
  '🔒',
  '[
    {
      "id": "security-monitoring",
      "type": "custom",
      "name": "Security Monitoring",
      "description": "Real-time monitoring of asset security and access controls",
      "config": {
        "monitoring_types": ["physical_security", "cyber_security", "access_control"],
        "threat_detection": true,
        "real_time_alerts": true
      }
    },
    {
      "id": "threat-analysis",
      "type": "ai_agent",
      "name": "AI Threat Analysis",
      "description": "AI-powered analysis of security threats and vulnerabilities",
      "config": {
        "analysis_scope": ["threat_detection", "vulnerability_assessment", "risk_analysis"],
        "machine_learning": true
      }
    },
    {
      "id": "incident-response",
      "type": "automation",
      "name": "Automated Incident Response",
      "description": "Automated response protocols for detected security incidents",
      "config": {
        "response_types": ["alert", "isolate", "investigate", "remediate"],
        "escalation_procedures": true
      }
    }
  ]'::jsonb,
  'event',
  '{"event_type": "security_alert", "enabled": true}'::jsonb,
  ARRAY['security', 'threat-detection', 'cybersecurity', 'access-control'],
  'advanced',
  '10-15 minutes',
  ARRAY['all-assets'],
  'Reduce security incidents by 40-60%, improve response time by 70%',
  'google/gemini-3-pro',
  true,
  1
)
ON CONFLICT (template_id) 
DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  icon = EXCLUDED.icon,
  steps = EXCLUDED.steps,
  trigger_type = EXCLUDED.trigger_type,
  trigger_config = EXCLUDED.trigger_config,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  estimated_time = EXCLUDED.estimated_time,
  asset_types = EXCLUDED.asset_types,
  business_value = EXCLUDED.business_value,
  ai_model = EXCLUDED.ai_model,
  updated_at = NOW();
