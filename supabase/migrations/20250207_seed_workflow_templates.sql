-- Comprehensive seed migration for all Asset Intelligence Workflow Templates
-- Inserts all workflow templates from TypeScript definitions into the database

-- Clear existing templates to avoid duplicates (optional - remove if you want to keep existing data)
-- DELETE FROM asset_intelligence_workflow_templates WHERE template_id IN (
--   'predictive-maintenance-orchestration',
--   'asset-lifecycle-optimization',
--   'real-time-performance-optimization',
--   'comprehensive-risk-assessment',
--   'sustainability-esg-optimization',
--   'iot-asset-intelligence-hub',
--   'asset-cost-optimization',
--   'regulatory-compliance-automation',
--   'asset-security-intelligence'
-- );

-- Insert all workflow templates
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
-- Predictive Maintenance Orchestration
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
    },
    {
      "id": "predict-maintenance-needs",
      "type": "agent",
      "name": "AI Maintenance Predictor",
      "description": "Predict specific maintenance needs and failure probabilities",
      "config": {
        "agent_type": "maintenance_predictor",
        "system_prompt": "Analyze asset performance data to predict maintenance needs and potential failures. Consider historical patterns, current conditions, and degradation trends. Provide specific maintenance recommendations with confidence levels, urgency ratings, and estimated time to failure. Focus on preventing unplanned downtime while optimizing maintenance costs.",
        "parameters": {"temperature": 0.2, "max_tokens": 1500}
      },
      "next_steps": ["schedule-maintenance"]
    },
    {
      "id": "schedule-maintenance",
      "type": "custom",
      "name": "Automated Maintenance Scheduling",
      "description": "Automatically schedule maintenance activities based on predictions",
      "config": {
        "scheduling_type": "predictive_optimization",
        "constraints": ["resource_availability", "production_schedule", "maintenance_windows"],
        "priority_levels": ["critical", "high", "medium", "low"],
        "notification_system": true
      },
      "next_steps": ["generate-work-orders"]
    },
    {
      "id": "generate-work-orders",
      "type": "agent",
      "name": "Work Order Generation",
      "description": "Generate detailed maintenance work orders with specifications",
      "config": {
        "agent_type": "work_order_generator",
        "system_prompt": "Generate comprehensive maintenance work orders based on predictive analysis. Include specific tasks, required parts, estimated labor hours, safety requirements, and step-by-step procedures. Ensure work orders are clear, actionable, and include all necessary information for maintenance teams.",
        "parameters": {"temperature": 0.3, "max_tokens": 1200}
      },
      "next_steps": []
    }
  ]'::jsonb,
  'schedule',
  '{"interval": "1h"}'::jsonb,
  ARRAY['predictive', 'maintenance', 'ai-analysis', 'automation', 'failure-prevention'],
  'advanced',
  '15-20 minutes',
  ARRAY['machinery', 'equipment', 'vehicles', 'infrastructure'],
  'Reduce unplanned downtime by 40-60%, extend asset life by 20-30%',
  'google/gemini-3-pro',
  true,
  1
),

-- Asset Lifecycle Optimization Hub
(
  'asset-lifecycle-optimization',
  'Asset Lifecycle Optimization Hub',
  'Comprehensive workflow for optimizing asset lifecycle decisions from acquisition to disposal with AI-powered TCO analysis',
  'Lifecycle Management',
  '♻️',
  '[
    {
      "id": "lifecycle-assessment",
      "type": "data_analysis",
      "name": "Lifecycle Performance Assessment",
      "description": "Assess current asset performance and lifecycle stage",
      "config": {
        "assessment_type": "comprehensive_lifecycle",
        "metrics": ["performance_efficiency", "maintenance_costs", "utilization_rates", "depreciation"],
        "benchmarking": true,
        "industry_comparisons": true
      },
      "next_steps": ["tco-analysis"]
    },
    {
      "id": "tco-analysis",
      "type": "agent",
      "name": "Total Cost of Ownership Analysis",
      "description": "Perform comprehensive TCO analysis with future projections",
      "config": {
        "agent_type": "tco_analyzer",
        "system_prompt": "Conduct comprehensive Total Cost of Ownership analysis for assets. Include acquisition costs, operating expenses, maintenance costs, depreciation, and disposal value. Consider future scenarios, technology changes, and market conditions. Provide detailed financial projections with sensitivity analysis and risk assessments.",
        "parameters": {"temperature": 0.2, "max_tokens": 2000}
      },
      "next_steps": ["optimization-scenarios"]
    },
    {
      "id": "optimization-scenarios",
      "type": "agent",
      "name": "Lifecycle Optimization Scenarios",
      "description": "Generate and evaluate lifecycle optimization scenarios",
      "config": {
        "agent_type": "scenario_optimizer",
        "system_prompt": "Generate multiple lifecycle optimization scenarios including continue current operations, upgrade/retrofit, replace with new, or alternative solutions. Evaluate each scenario considering financial impact, operational efficiency, risk factors, and strategic alignment. Provide detailed recommendations with implementation timelines.",
        "parameters": {"temperature": 0.4, "max_tokens": 1800}
      },
      "next_steps": ["decision-support"]
    },
    {
      "id": "decision-support",
      "type": "agent",
      "name": "Strategic Decision Support",
      "description": "Provide strategic recommendations for lifecycle decisions",
      "config": {
        "agent_type": "strategic_advisor",
        "system_prompt": "Provide strategic decision support for asset lifecycle management. Consider financial analysis, operational requirements, market conditions, and organizational goals. Recommend optimal timing for major lifecycle decisions and provide implementation roadmaps with risk mitigation strategies.",
        "parameters": {"temperature": 0.3, "max_tokens": 1500}
      },
      "next_steps": []
    }
  ]'::jsonb,
  'event',
  '{"event_type": "asset_lifecycle_milestone"}'::jsonb,
  ARRAY['lifecycle', 'tco-analysis', 'optimization', 'financial-modeling'],
  'intermediate',
  '12-18 minutes',
  ARRAY['equipment', 'vehicles', 'real-estate', 'technology'],
  'Optimize TCO by 15-25%, improve asset utilization by 20-35%',
  'google/gemini-3-pro',
  true,
  1
),

-- Real-Time Performance Optimization
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
    },
    {
      "id": "performance-analysis",
      "type": "data_analysis",
      "name": "Performance Analytics Engine",
      "description": "Analyze performance data and identify optimization opportunities",
      "config": {
        "analysis_type": "performance_optimization",
        "algorithms": ["statistical_analysis", "machine_learning", "benchmarking"],
        "comparison_baselines": ["historical_performance", "industry_standards", "optimal_conditions"],
        "optimization_targets": true
      },
      "next_steps": ["generate-insights"]
    },
    {
      "id": "generate-insights",
      "type": "agent",
      "name": "Performance Insights Generator",
      "description": "Generate actionable insights for performance improvement",
      "config": {
        "agent_type": "performance_analyst",
        "system_prompt": "Analyze asset performance data to generate actionable insights and optimization recommendations. Identify bottlenecks, inefficiencies, and improvement opportunities. Provide specific recommendations with expected impact, implementation difficulty, and resource requirements. Focus on measurable improvements that deliver clear business value.",
        "parameters": {"temperature": 0.3, "max_tokens": 1500}
      },
      "next_steps": ["automated-optimization"]
    },
    {
      "id": "automated-optimization",
      "type": "custom",
      "name": "Automated Performance Optimization",
      "description": "Implement approved optimizations automatically",
      "config": {
        "optimization_type": "automated_adjustments",
        "adjustment_categories": ["operational_parameters", "scheduling_optimization", "resource_allocation"],
        "safety_checks": true,
        "rollback_capability": true,
        "approval_thresholds": {"performance_impact": 5, "cost_impact": 1000}
      },
      "next_steps": []
    }
  ]'::jsonb,
  'schedule',
  '{"interval": "15m"}'::jsonb,
  ARRAY['real-time', 'monitoring', 'optimization', 'kpi-tracking'],
  'intermediate',
  '10-15 minutes',
  ARRAY['machinery', 'equipment', 'facilities', 'iot-devices'],
  'Improve asset efficiency by 15-30%, reduce energy costs by 10-20%',
  'google/gemini-3-pro',
  true,
  1
),

-- Comprehensive Risk Assessment & Mitigation
(
  'comprehensive-risk-assessment',
  'Comprehensive Risk Assessment & Mitigation',
  'AI-powered risk assessment workflow that identifies, evaluates, and mitigates risks across asset portfolios',
  'Risk Management',
  '🛡️',
  '[
    {
      "id": "risk-identification",
      "type": "agent",
      "name": "AI Risk Identification",
      "description": "Identify potential risks across asset portfolio",
      "config": {
        "agent_type": "risk_identifier",
        "system_prompt": "Systematically identify risks across asset portfolios including operational, financial, regulatory, cybersecurity, and environmental risks. Consider internal factors, external threats, and emerging risks. Analyze historical incidents, industry trends, and current conditions to create comprehensive risk inventory.",
        "parameters": {"temperature": 0.3, "max_tokens": 2000}
      },
      "next_steps": ["risk-analysis"]
    },
    {
      "id": "risk-analysis",
      "type": "data_analysis",
      "name": "Quantitative Risk Analysis",
      "description": "Perform quantitative analysis of identified risks",
      "config": {
        "analysis_type": "quantitative_risk_assessment",
        "methodologies": ["monte_carlo_simulation", "fault_tree_analysis", "bow_tie_analysis"],
        "risk_metrics": ["probability", "impact", "exposure", "velocity"],
        "scenario_modeling": true
      },
      "next_steps": ["risk-prioritization"]
    },
    {
      "id": "risk-prioritization",
      "type": "agent",
      "name": "Risk Prioritization Matrix",
      "description": "Prioritize risks based on impact and probability",
      "config": {
        "agent_type": "risk_prioritizer",
        "system_prompt": "Prioritize identified risks using comprehensive risk assessment criteria. Consider probability, impact, velocity, and detectability. Create risk matrix with clear prioritization levels and recommended response strategies. Focus on risks that could significantly impact business operations or strategic objectives.",
        "parameters": {"temperature": 0.2, "max_tokens": 1500}
      },
      "next_steps": ["mitigation-planning"]
    },
    {
      "id": "mitigation-planning",
      "type": "agent",
      "name": "Risk Mitigation Strategy",
      "description": "Develop comprehensive risk mitigation strategies",
      "config": {
        "agent_type": "mitigation_planner",
        "system_prompt": "Develop comprehensive risk mitigation strategies for prioritized risks. Consider risk treatment options: avoid, mitigate, transfer, or accept. Create detailed implementation plans with timelines, resource requirements, and success metrics. Ensure mitigation strategies are cost-effective and aligned with business objectives.",
        "parameters": {"temperature": 0.3, "max_tokens": 1800}
      },
      "next_steps": ["monitoring-setup"]
    },
    {
      "id": "monitoring-setup",
      "type": "custom",
      "name": "Risk Monitoring System",
      "description": "Set up continuous risk monitoring and alerting",
      "config": {
        "monitoring_type": "continuous_risk_monitoring",
        "key_risk_indicators": true,
        "automated_alerts": true,
        "dashboard_creation": true,
        "reporting_schedule": "weekly"
      },
      "next_steps": []
    }
  ]'::jsonb,
  'schedule',
  '{"interval": "24h"}'::jsonb,
  ARRAY['risk-assessment', 'mitigation', 'compliance', 'security'],
  'advanced',
  '18-25 minutes',
  ARRAY['all-assets', 'critical-infrastructure', 'facilities'],
  'Reduce risk exposure by 30-50%, improve compliance by 95%+',
  'google/gemini-3-pro',
  true,
  1
),

-- Sustainability & ESG Optimization
(
  'sustainability-esg-optimization',
  'Sustainability & ESG Optimization',
  'Optimize asset operations for environmental sustainability and ESG compliance with AI-powered carbon footprint analysis',
  'Sustainability',
  '🌱',
  '[
    {
      "id": "sustainability-assessment",
      "type": "data_analysis",
      "name": "Sustainability Impact Assessment",
      "description": "Assess environmental impact and sustainability metrics",
      "config": {
        "assessment_type": "comprehensive_sustainability",
        "metrics": ["carbon_footprint", "energy_consumption", "water_usage", "waste_generation"],
        "scope_levels": ["scope1", "scope2", "scope3"],
        "benchmarking": true
      },
      "next_steps": ["esg-analysis"]
    },
    {
      "id": "esg-analysis",
      "type": "agent",
      "name": "ESG Performance Analysis",
      "description": "Analyze ESG performance and identify improvement opportunities",
      "config": {
        "agent_type": "esg_analyzer",
        "system_prompt": "Analyze Environmental, Social, and Governance (ESG) performance across asset operations. Evaluate current performance against industry standards and regulatory requirements. Identify improvement opportunities that align with sustainability goals and business objectives. Consider stakeholder expectations and emerging ESG trends.",
        "parameters": {"temperature": 0.3, "max_tokens": 1800}
      },
      "next_steps": ["optimization-recommendations"]
    },
    {
      "id": "optimization-recommendations",
      "type": "agent",
      "name": "Sustainability Optimization Engine",
      "description": "Generate sustainability optimization recommendations",
      "config": {
        "agent_type": "sustainability_optimizer",
        "system_prompt": "Generate specific sustainability optimization recommendations based on ESG analysis. Focus on energy efficiency, waste reduction, carbon footprint minimization, and circular economy principles. Provide implementation roadmaps with cost-benefit analysis, timeline, and expected environmental impact. Ensure recommendations are practical and economically viable.",
        "parameters": {"temperature": 0.4, "max_tokens": 1600}
      },
      "next_steps": ["compliance-monitoring"]
    },
    {
      "id": "compliance-monitoring",
      "type": "custom",
      "name": "ESG Compliance Monitoring",
      "description": "Set up continuous ESG compliance monitoring and reporting",
      "config": {
        "monitoring_type": "esg_compliance",
        "regulatory_frameworks": ["ghg_protocol", "tcfd", "sasb", "gri"],
        "automated_reporting": true,
        "stakeholder_dashboards": true,
        "audit_trail": true
      },
      "next_steps": []
    }
  ]'::jsonb,
  'schedule',
  '{"interval": "6h"}'::jsonb,
  ARRAY['sustainability', 'esg', 'carbon-footprint', 'compliance'],
  'intermediate',
  '14-20 minutes',
  ARRAY['facilities', 'equipment', 'vehicles', 'manufacturing'],
  'Reduce carbon footprint by 20-40%, improve ESG ratings, ensure compliance',
  'google/gemini-3-pro',
  true,
  1
),

-- IoT Asset Intelligence Hub
(
  'iot-asset-intelligence-hub',
  'IoT Asset Intelligence Hub',
  'Transform IoT sensor data into actionable asset intelligence with edge computing and predictive analytics',
  'IoT Intelligence',
  '📡',
  '[
    {
      "id": "iot-data-ingestion",
      "type": "custom",
      "name": "IoT Data Ingestion & Processing",
      "description": "Ingest and process real-time IoT sensor data",
      "config": {
        "ingestion_type": "real_time_streaming",
        "data_sources": ["temperature", "vibration", "pressure", "humidity", "location", "energy"],
        "processing_type": "edge_computing",
        "data_quality_checks": true
      },
      "next_steps": ["sensor-analytics"]
    },
    {
      "id": "sensor-analytics",
      "type": "data_analysis",
      "name": "Advanced Sensor Analytics",
      "description": "Apply advanced analytics to IoT sensor data",
      "config": {
        "analysis_type": "iot_sensor_analytics",
        "algorithms": ["anomaly_detection", "pattern_recognition", "predictive_modeling"],
        "real_time_processing": true,
        "edge_analytics": true
      },
      "next_steps": ["asset-intelligence"]
    },
    {
      "id": "asset-intelligence",
      "type": "agent",
      "name": "Asset Intelligence Engine",
      "description": "Generate asset intelligence insights from IoT data",
      "config": {
        "agent_type": "iot_intelligence_analyst",
        "system_prompt": "Analyze IoT sensor data to generate comprehensive asset intelligence insights. Identify performance patterns, predict maintenance needs, detect anomalies, and optimize operations. Correlate data from multiple sensors to provide holistic asset health assessments. Focus on actionable insights that improve asset performance and reduce operational costs.",
        "parameters": {"temperature": 0.3, "max_tokens": 1500}
      },
      "next_steps": ["automated-responses"]
    },
    {
      "id": "automated-responses",
      "type": "custom",
      "name": "Intelligent Automated Responses",
      "description": "Execute automated responses based on IoT insights",
      "config": {
        "response_type": "intelligent_automation",
        "response_categories": ["alerts", "adjustments", "maintenance_requests", "optimization"],
        "machine_learning": true,
        "feedback_loop": true
      },
      "next_steps": []
    }
  ]'::jsonb,
  'event',
  '{"event_type": "iot_data_stream"}'::jsonb,
  ARRAY['iot', 'sensors', 'edge-computing', 'predictive-analytics'],
  'advanced',
  '16-22 minutes',
  ARRAY['iot-devices', 'connected-equipment', 'smart-facilities'],
  'Improve asset visibility by 90%+, enable predictive insights, reduce manual monitoring',
  'google/gemini-3-pro',
  true,
  1
),

-- Asset Cost Optimization & Financial Analysis
(
  'asset-cost-optimization',
  'Asset Cost Optimization & Financial Analysis',
  'Comprehensive cost optimization workflow with AI-powered financial analysis and ROI optimization',
  'Cost Optimization',
  '💰',
  '[
    {
      "id": "cost-analysis",
      "type": "data_analysis",
      "name": "Comprehensive Cost Analysis",
      "description": "Analyze all asset-related costs and spending patterns",
      "config": {
        "analysis_type": "comprehensive_cost_analysis",
        "cost_categories": ["acquisition", "operation", "maintenance", "energy", "disposal"],
        "time_periods": ["monthly", "quarterly", "annual"],
        "trend_analysis": true
      },
      "next_steps": ["optimization-identification"]
    },
    {
      "id": "optimization-identification",
      "type": "agent",
      "name": "Cost Optimization Identifier",
      "description": "Identify cost optimization opportunities across asset portfolio",
      "config": {
        "agent_type": "cost_optimizer",
        "system_prompt": "Analyze asset cost data to identify optimization opportunities. Focus on reducing operational expenses, improving efficiency, and maximizing ROI. Consider energy optimization, maintenance efficiency, utilization improvements, and procurement strategies. Provide specific recommendations with quantified savings potential and implementation requirements.",
        "parameters": {"temperature": 0.3, "max_tokens": 1600}
      },
      "next_steps": ["financial-modeling"]
    },
    {
      "id": "financial-modeling",
      "type": "agent",
      "name": "Financial Impact Modeling",
      "description": "Model financial impact of optimization initiatives",
      "config": {
        "agent_type": "financial_modeler",
        "system_prompt": "Create detailed financial models for cost optimization initiatives. Calculate ROI, payback periods, NPV, and IRR for each recommendation. Consider implementation costs, ongoing savings, risk factors, and sensitivity analysis. Provide comprehensive business cases with financial projections and risk assessments.",
        "parameters": {"temperature": 0.2, "max_tokens": 1800}
      },
      "next_steps": ["implementation-planning"]
    },
    {
      "id": "implementation-planning",
      "type": "agent",
      "name": "Implementation Strategy",
      "description": "Develop implementation strategy for cost optimization initiatives",
      "config": {
        "agent_type": "implementation_planner",
        "system_prompt": "Develop comprehensive implementation strategies for cost optimization initiatives. Prioritize initiatives based on ROI, feasibility, and strategic importance. Create detailed implementation timelines, resource requirements, and success metrics. Consider change management, risk mitigation, and stakeholder communication requirements.",
        "parameters": {"temperature": 0.3, "max_tokens": 1500}
      },
      "next_steps": []
    }
  ]'::jsonb,
  'schedule',
  '{"interval": "weekly"}'::jsonb,
  ARRAY['cost-optimization', 'financial-analysis', 'roi', 'efficiency'],
  'intermediate',
  '12-16 minutes',
  ARRAY['all-assets', 'equipment', 'facilities', 'vehicles'],
  'Reduce operational costs by 15-25%, improve ROI by 20-35%',
  'google/gemini-3-pro',
  true,
  1
),

-- Regulatory Compliance Automation
(
  'regulatory-compliance-automation',
  'Regulatory Compliance Automation',
  'Automated compliance monitoring and management workflow with AI-powered regulatory tracking and reporting',
  'Compliance',
  '📋',
  '[
    {
      "id": "regulatory-monitoring",
      "type": "custom",
      "name": "Regulatory Change Monitoring",
      "description": "Monitor regulatory changes and updates across jurisdictions",
      "config": {
        "monitoring_type": "regulatory_intelligence",
        "jurisdictions": ["federal", "state", "local", "international"],
        "regulatory_areas": ["safety", "environmental", "quality", "security"],
        "change_detection": true
      },
      "next_steps": ["compliance-assessment"]
    },
    {
      "id": "compliance-assessment",
      "type": "agent",
      "name": "AI Compliance Assessment",
      "description": "Assess current compliance status against regulations",
      "config": {
        "agent_type": "compliance_assessor",
        "system_prompt": "Conduct comprehensive compliance assessments for asset operations. Evaluate current practices against applicable regulations and standards. Identify compliance gaps, risks, and required actions. Consider regulatory changes and their impact on operations. Provide detailed compliance status reports with remediation recommendations.",
        "parameters": {"temperature": 0.2, "max_tokens": 2000}
      },
      "next_steps": ["gap-analysis"]
    },
    {
      "id": "gap-analysis",
      "type": "data_analysis",
      "name": "Compliance Gap Analysis",
      "description": "Perform detailed analysis of compliance gaps and risks",
      "config": {
        "analysis_type": "compliance_gap_analysis",
        "risk_assessment": true,
        "impact_analysis": true,
        "remediation_planning": true,
        "priority_scoring": true
      },
      "next_steps": ["automated-reporting"]
    },
    {
      "id": "automated-reporting",
      "type": "agent",
      "name": "Automated Compliance Reporting",
      "description": "Generate automated compliance reports and documentation",
      "config": {
        "agent_type": "compliance_reporter",
        "system_prompt": "Generate comprehensive compliance reports and documentation. Create regulatory submissions, audit reports, and compliance dashboards. Ensure reports meet regulatory requirements and include all necessary documentation. Provide clear summaries of compliance status, actions taken, and ongoing monitoring activities.",
        "parameters": {"temperature": 0.1, "max_tokens": 1800}
      },
      "next_steps": ["continuous-monitoring"]
    },
    {
      "id": "continuous-monitoring",
      "type": "custom",
      "name": "Continuous Compliance Monitoring",
      "description": "Set up continuous monitoring and alerting for compliance",
      "config": {
        "monitoring_type": "continuous_compliance",
        "automated_alerts": true,
        "audit_trails": true,
        "documentation_management": true,
        "stakeholder_notifications": true
      },
      "next_steps": []
    }
  ]'::jsonb,
  'schedule',
  '{"interval": "daily"}'::jsonb,
  ARRAY['compliance', 'regulatory', 'automation', 'monitoring'],
  'advanced',
  '20-25 minutes',
  ARRAY['regulated-equipment', 'facilities', 'medical-devices', 'vehicles'],
  'Ensure 99%+ compliance, reduce audit costs by 40-60%, automate reporting',
  'google/gemini-3-pro',
  true,
  1
),

-- Asset Security Intelligence Hub
(
  'asset-security-intelligence',
  'Asset Security Intelligence Hub',
  'Comprehensive security monitoring and threat detection for physical and digital assets with AI-powered analysis',
  'Security',
  '🔒',
  '[
    {
      "id": "security-monitoring",
      "type": "custom",
      "name": "Comprehensive Security Monitoring",
      "description": "Monitor physical and digital security across asset portfolio",
      "config": {
        "monitoring_type": "comprehensive_security",
        "security_domains": ["physical", "cyber", "operational", "personnel"],
        "threat_intelligence": true,
        "real_time_monitoring": true
      },
      "next_steps": ["threat-analysis"]
    },
    {
      "id": "threat-analysis",
      "type": "agent",
      "name": "AI Threat Analysis Engine",
      "description": "Analyze security threats and vulnerabilities using AI",
      "config": {
        "agent_type": "threat_analyzer",
        "system_prompt": "Analyze security threats and vulnerabilities across asset portfolio. Evaluate threat intelligence, assess risk levels, and identify potential attack vectors. Consider both external threats and internal risks. Provide detailed threat assessments with impact analysis and recommended countermeasures. Focus on proactive threat prevention and rapid response capabilities.",
        "parameters": {"temperature": 0.2, "max_tokens": 1800}
      },
      "next_steps": ["vulnerability-assessment"]
    },
    {
      "id": "vulnerability-assessment",
      "type": "data_analysis",
      "name": "Vulnerability Assessment & Scoring",
      "description": "Assess and score security vulnerabilities",
      "config": {
        "assessment_type": "comprehensive_vulnerability",
        "scoring_system": "cvss",
        "penetration_testing": true,
        "compliance_checking": true,
        "remediation_prioritization": true
      },
      "next_steps": ["incident-response"]
    },
    {
      "id": "incident-response",
      "type": "agent",
      "name": "Automated Incident Response",
      "description": "Execute automated incident response procedures",
      "config": {
        "agent_type": "incident_responder",
        "system_prompt": "Execute automated incident response procedures for security events. Assess incident severity, contain threats, preserve evidence, and coordinate response activities. Follow established incident response playbooks while adapting to specific threat characteristics. Provide clear communication to stakeholders and ensure proper documentation of all response activities.",
        "parameters": {"temperature": 0.1, "max_tokens": 1500}
      },
      "next_steps": ["security-optimization"]
    },
    {
      "id": "security-optimization",
      "type": "agent",
      "name": "Security Posture Optimization",
      "description": "Continuously optimize security posture based on threat landscape",
      "config": {
        "agent_type": "security_optimizer",
        "system_prompt": "Continuously optimize security posture based on threat analysis and incident learnings. Recommend security improvements, update policies and procedures, and enhance detection capabilities. Consider emerging threats, technology changes, and business requirements. Provide strategic security recommendations that balance protection with operational efficiency.",
        "parameters": {"temperature": 0.3, "max_tokens": 1600}
      },
      "next_steps": []
    }
  ]'::jsonb,
  'event',
  '{"event_type": "security_event"}'::jsonb,
  ARRAY['security', 'cybersecurity', 'threat-detection', 'monitoring'],
  'advanced',
  '18-24 minutes',
  ARRAY['iot-devices', 'facilities', 'data-centers', 'critical-infrastructure'],
  'Reduce security incidents by 70%+, improve threat detection by 90%+',
  'google/gemini-3-pro',
  true,
  1
)
ON CONFLICT (template_id) DO UPDATE SET
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
  updated_at = NOW(),
  version = asset_intelligence_workflow_templates.version + 1;
