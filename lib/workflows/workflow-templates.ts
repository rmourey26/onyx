import type { WorkflowStep } from "@/lib/schemas/ai"

export interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: string
  icon: string
  steps: WorkflowStep[]
  trigger_type: string
  trigger_config: Record<string, any>
  tags: string[]
  difficulty: "beginner" | "intermediate" | "advanced"
  estimated_time: string
}

export const workflowTemplates: WorkflowTemplate[] = [
  // Agentic AI Solutions
  {
    id: "agentic-ai-orchestration",
    name: "Agentic AI Orchestration Hub",
    description:
      "Deploy autonomous AI agents to monitor, analyze, and optimize real-world asset performance across multiple domains",
    category: "Agentic AI",
    icon: "🤖",
    difficulty: "advanced",
    estimated_time: "15-20 minutes",
    tags: ["autonomous", "multi-agent", "real-time", "optimization"],
    trigger_type: "schedule",
    trigger_config: { interval: "5m" },
    steps: [
      {
        id: "deploy-monitoring-agents",
        type: "agent",
        name: "Deploy Asset Monitoring Agents",
        description: "Launch autonomous agents to monitor RWA performance metrics",
        config: {
          agent_id: "monitoring-agent-001",
          query:
            "Monitor real-world asset performance metrics and identify anomalies, optimization opportunities, and critical alerts based on incoming data streams.",
          agent_type: "monitoring",
          system_prompt:
            "You are an autonomous monitoring agent responsible for tracking real-world asset performance. Analyze incoming data streams and identify anomalies, optimization opportunities, and critical alerts.",
          parameters: { temperature: 0.3, max_tokens: 1000 },
        },
        next_steps: ["analyze-performance-data"],
      },
      {
        id: "analyze-performance-data",
        type: "data_analysis",
        name: "Real-Time Performance Analysis",
        description: "Process and analyze asset performance data using AI",
        config: {
          operation: "analyze",
          analysis_type: "real_time_performance",
          data_source: "context.results.deploy-monitoring-agents",
          metrics: ["efficiency", "utilization", "predictive_maintenance", "cost_optimization"],
          ai_model: "gpt-4",
        },
        next_steps: ["generate-optimization-recommendations"],
      },
      {
        id: "generate-optimization-recommendations",
        type: "agent",
        name: "Generate Optimization Strategies",
        description: "Create actionable optimization recommendations",
        config: {
          agent_id: "optimization-agent-001",
          query:
            "Based on the performance analysis results: ${context.results.analyze-performance-data}, generate specific, actionable optimization recommendations for real-world assets focusing on efficiency improvements, cost reduction, and predictive maintenance.",
          agent_type: "optimization",
          system_prompt:
            "Based on the performance analysis, generate specific, actionable optimization recommendations for real-world assets. Focus on efficiency improvements, cost reduction, and predictive maintenance.",
          parameters: { temperature: 0.4, max_tokens: 1500 },
        },
        next_steps: ["execute-autonomous-actions"],
      },
      {
        id: "execute-autonomous-actions",
        type: "custom",
        name: "Execute Autonomous Optimizations",
        description: "Implement approved optimizations automatically",
        config: {
          function_name: "save_data",
          parameters: {
            destination: "supabase",
            table: "optimization_actions",
            operation: "insert",
            data: {
              workflow_id: "${context.workflow_id}",
              recommendations: "${context.results.generate-optimization-recommendations}",
              status: "pending_approval",
              created_at: new Date().toISOString(),
            },
          },
          action_type: "autonomous_execution",
          approval_threshold: 0.8,
          safety_checks: true,
        },
        next_steps: [],
      },
    ],
  },

  // IoT Device Management
  {
    id: "iot-device-intelligence",
    name: "IoT Device Intelligence Network",
    description:
      "Transform IoT sensor data into actionable intelligence with predictive analytics and automated responses",
    category: "IoT Devices",
    icon: "📡",
    difficulty: "intermediate",
    estimated_time: "10-15 minutes",
    tags: ["iot", "sensors", "predictive", "automation"],
    trigger_type: "event",
    trigger_config: { event_type: "iot_data_received" },
    steps: [
      {
        id: "collect-iot-data",
        type: "custom",
        name: "Collect IoT Sensor Data",
        description: "Aggregate data from distributed IoT sensors",
        config: {
          function_name: "fetch_data",
          parameters: {
            source: "supabase",
            query: {
              table: "iot_sensor_data",
              select: "*",
            },
            filters: [
              {
                field: "timestamp",
                operator: "gte",
                value: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
              },
            ],
          },
          data_sources: ["temperature", "humidity", "pressure", "vibration", "location"],
          collection_interval: "30s",
          data_validation: true,
        },
        next_steps: ["process-sensor-data"],
      },
      {
        id: "process-sensor-data",
        type: "data_analysis",
        name: "Process Sensor Intelligence",
        description: "Apply AI to extract insights from sensor data",
        config: {
          operation: "analyze",
          analysis_type: "time_series_prediction",
          data_source: "context.results.collect-iot-data",
          algorithms: ["anomaly_detection", "trend_analysis", "predictive_modeling"],
          window_size: "1h",
        },
        next_steps: ["generate-alerts"],
      },
      {
        id: "generate-alerts",
        type: "agent",
        name: "Intelligent Alert Generation",
        description: "Generate contextual alerts and recommendations",
        config: {
          agent_id: "alert-generator-001",
          query:
            "Analyze the IoT sensor data analysis results: ${context.results.process-sensor-data} and generate intelligent alerts. Prioritize critical issues, provide context, and suggest immediate actions considering historical patterns and predictive indicators.",
          agent_type: "alert_generator",
          system_prompt:
            "Analyze IoT sensor data and generate intelligent alerts. Prioritize critical issues, provide context, and suggest immediate actions. Consider historical patterns and predictive indicators.",
          parameters: { temperature: 0.2, max_tokens: 800 },
        },
        next_steps: ["automated-response"],
      },
      {
        id: "automated-response",
        type: "custom",
        name: "Automated Response System",
        description: "Execute automated responses to sensor alerts",
        config: {
          function_name: "save_data",
          parameters: {
            destination: "supabase",
            table: "automated_responses",
            operation: "insert",
            data: {
              workflow_id: "${context.workflow_id}",
              alerts: "${context.results.generate-alerts}",
              response_type: "automated",
              status: "executed",
              created_at: new Date().toISOString(),
            },
          },
          response_types: ["notification", "system_adjustment", "maintenance_request"],
          escalation_rules: true,
          safety_protocols: true,
        },
        next_steps: [],
      },
    ],
  },

  // Robotics Operations
  {
    id: "robotics-fleet-management",
    name: "Robotics Fleet Intelligence",
    description:
      "Coordinate and optimize robotic fleet operations with AI-driven task allocation and performance monitoring",
    category: "Robotics",
    icon: "🦾",
    difficulty: "advanced",
    estimated_time: "20-25 minutes",
    tags: ["robotics", "fleet", "coordination", "optimization"],
    trigger_type: "manual",
    trigger_config: {},
    steps: [
      {
        id: "assess-fleet-status",
        type: "custom",
        name: "Fleet Status Assessment",
        description: "Evaluate current status and capabilities of robotic fleet",
        config: {
          metrics: ["battery_level", "task_queue", "location", "operational_status", "maintenance_schedule"],
          real_time_monitoring: true,
        },
        next_steps: ["optimize-task-allocation"],
      },
      {
        id: "optimize-task-allocation",
        type: "agent",
        name: "AI Task Allocation",
        description: "Intelligently allocate tasks across robotic fleet",
        config: {
          agent_type: "task_optimizer",
          system_prompt:
            "You are a fleet coordination AI. Analyze robot capabilities, current tasks, locations, and priorities to optimize task allocation. Consider efficiency, battery life, travel time, and robot specializations.",
          parameters: { temperature: 0.3, max_tokens: 1200 },
        },
        next_steps: ["monitor-execution"],
      },
      {
        id: "monitor-execution",
        type: "data_analysis",
        name: "Real-Time Execution Monitoring",
        description: "Monitor task execution and performance metrics",
        config: {
          monitoring_type: "real_time_performance",
          kpis: ["task_completion_rate", "efficiency_score", "error_rate", "energy_consumption"],
          alert_thresholds: true,
        },
        next_steps: ["adaptive-optimization"],
      },
      {
        id: "adaptive-optimization",
        type: "agent",
        name: "Adaptive Fleet Optimization",
        description: "Continuously optimize fleet performance based on real-time data",
        config: {
          agent_type: "adaptive_optimizer",
          system_prompt:
            "Continuously analyze fleet performance and adapt strategies in real-time. Identify bottlenecks, predict maintenance needs, and optimize routes and task sequences for maximum efficiency.",
          parameters: { temperature: 0.4, max_tokens: 1000 },
        },
        next_steps: [],
      },
    ],
  },

  // Supply Chain & Logistics
  {
    id: "supply-chain-intelligence",
    name: "Supply Chain Intelligence Hub",
    description:
      "Transform supply chain operations with AI-powered demand forecasting, route optimization, and risk management",
    category: "Supply Chain",
    icon: "🚚",
    difficulty: "intermediate",
    estimated_time: "12-18 minutes",
    tags: ["supply-chain", "logistics", "forecasting", "optimization"],
    trigger_type: "schedule",
    trigger_config: { interval: "1h" },
    steps: [
      {
        id: "demand-forecasting",
        type: "data_analysis",
        name: "AI Demand Forecasting",
        description: "Predict demand patterns using historical data and market indicators",
        config: {
          analysis_type: "demand_prediction",
          data_sources: ["historical_sales", "market_trends", "seasonal_patterns", "external_factors"],
          prediction_horizon: "30d",
          confidence_intervals: true,
        },
        next_steps: ["inventory-optimization"],
      },
      {
        id: "inventory-optimization",
        type: "agent",
        name: "Inventory Optimization",
        description: "Optimize inventory levels based on demand forecasts",
        config: {
          agent_type: "inventory_optimizer",
          system_prompt:
            "Analyze demand forecasts and current inventory levels to optimize stock allocation. Consider lead times, storage costs, stockout risks, and seasonal variations. Provide specific recommendations for inventory adjustments.",
          parameters: { temperature: 0.2, max_tokens: 1000 },
        },
        next_steps: ["route-optimization"],
      },
      {
        id: "route-optimization",
        type: "supply_chain",
        name: "Dynamic Route Optimization",
        description: "Optimize delivery routes in real-time",
        config: {
          optimization_type: "multi_objective",
          objectives: ["minimize_cost", "minimize_time", "maximize_efficiency"],
          constraints: ["vehicle_capacity", "time_windows", "driver_hours"],
          real_time_traffic: true,
        },
        next_steps: ["risk-assessment"],
      },
      {
        id: "risk-assessment",
        type: "agent",
        name: "Supply Chain Risk Analysis",
        description: "Identify and assess supply chain risks",
        config: {
          agent_type: "risk_analyzer",
          system_prompt:
            "Analyze supply chain data to identify potential risks including supplier disruptions, demand volatility, transportation issues, and external factors. Assess risk probability and impact, and recommend mitigation strategies.",
          parameters: { temperature: 0.3, max_tokens: 1200 },
        },
        next_steps: [],
      },
    ],
  },

  // Autonomous Vehicles
  {
    id: "autonomous-vehicle-coordination",
    name: "Autonomous Vehicle Fleet Coordination",
    description: "Coordinate autonomous vehicle fleets with real-time traffic optimization and predictive maintenance",
    category: "Autonomous Vehicles",
    icon: "🚗",
    difficulty: "advanced",
    estimated_time: "18-22 minutes",
    tags: ["autonomous", "vehicles", "coordination", "traffic"],
    trigger_type: "event",
    trigger_config: { event_type: "vehicle_status_update" },
    steps: [
      {
        id: "vehicle-status-monitoring",
        type: "custom",
        name: "Real-Time Vehicle Monitoring",
        description: "Monitor autonomous vehicle fleet status and performance",
        config: {
          monitoring_metrics: ["location", "battery_level", "passenger_count", "route_progress", "system_health"],
          update_frequency: "10s",
          anomaly_detection: true,
        },
        next_steps: ["traffic-analysis"],
      },
      {
        id: "traffic-analysis",
        type: "data_analysis",
        name: "Traffic Pattern Analysis",
        description: "Analyze real-time traffic patterns and predict congestion",
        config: {
          analysis_type: "traffic_prediction",
          data_sources: ["gps_data", "traffic_sensors", "historical_patterns", "events"],
          prediction_window: "30m",
          route_alternatives: true,
        },
        next_steps: ["fleet-coordination"],
      },
      {
        id: "fleet-coordination",
        type: "agent",
        name: "AI Fleet Coordination",
        description: "Coordinate vehicle movements and optimize routes",
        config: {
          agent_type: "fleet_coordinator",
          system_prompt:
            "Coordinate autonomous vehicle fleet operations. Optimize routes based on traffic conditions, passenger demands, and vehicle capabilities. Ensure efficient distribution and minimize wait times while maximizing fleet utilization.",
          parameters: { temperature: 0.3, max_tokens: 1500 },
        },
        next_steps: ["predictive-maintenance"],
      },
      {
        id: "predictive-maintenance",
        type: "data_analysis",
        name: "Predictive Maintenance Analysis",
        description: "Predict maintenance needs for autonomous vehicles",
        config: {
          analysis_type: "predictive_maintenance",
          sensors: ["engine", "brakes", "battery", "sensors", "software_systems"],
          prediction_horizon: "7d",
          maintenance_scheduling: true,
        },
        next_steps: [],
      },
    ],
  },

  // Drone Operations
  {
    id: "drone-swarm-intelligence",
    name: "Drone Swarm Intelligence Network",
    description:
      "Coordinate drone swarms for surveillance, delivery, and data collection with AI-powered mission planning",
    category: "Drones",
    icon: "🚁",
    difficulty: "advanced",
    estimated_time: "15-20 minutes",
    tags: ["drones", "swarm", "surveillance", "coordination"],
    trigger_type: "manual",
    trigger_config: {},
    steps: [
      {
        id: "mission-planning",
        type: "agent",
        name: "AI Mission Planning",
        description: "Plan optimal drone missions based on objectives and constraints",
        config: {
          agent_type: "mission_planner",
          system_prompt:
            "Plan drone swarm missions considering objectives, weather conditions, airspace restrictions, battery life, and payload requirements. Optimize flight paths, coordinate multiple drones, and ensure mission success while maintaining safety protocols.",
          parameters: { temperature: 0.2, max_tokens: 1200 },
        },
        next_steps: ["swarm-coordination"],
      },
      {
        id: "swarm-coordination",
        type: "custom",
        name: "Swarm Coordination System",
        description: "Coordinate multiple drones in real-time",
        config: {
          coordination_type: "distributed_swarm",
          communication_protocol: "mesh_network",
          collision_avoidance: true,
          formation_control: true,
        },
        next_steps: ["data-collection"],
      },
      {
        id: "data-collection",
        type: "data_analysis",
        name: "Real-Time Data Processing",
        description: "Process data collected by drone swarm",
        config: {
          data_types: ["video", "images", "sensor_data", "gps_coordinates"],
          processing_type: "real_time_analysis",
          ai_enhancement: true,
          pattern_recognition: true,
        },
        next_steps: ["intelligence-synthesis"],
      },
      {
        id: "intelligence-synthesis",
        type: "agent",
        name: "Intelligence Synthesis",
        description: "Synthesize collected data into actionable intelligence",
        config: {
          agent_type: "intelligence_analyst",
          system_prompt:
            "Analyze data collected by drone swarms to generate actionable intelligence. Identify patterns, anomalies, and insights. Provide clear recommendations and highlight critical findings that require immediate attention.",
          parameters: { temperature: 0.3, max_tokens: 1000 },
        },
        next_steps: [],
      },
    ],
  },

  // RWA Tokenization
  {
    id: "rwa-tokenization-pipeline",
    name: "RWA Tokenization Intelligence Pipeline",
    description:
      "Automate real-world asset tokenization with AI-powered valuation, compliance, and smart contract deployment",
    category: "RWA Tokenization",
    icon: "🪙",
    difficulty: "advanced",
    estimated_time: "25-30 minutes",
    tags: ["tokenization", "blockchain", "valuation", "compliance"],
    trigger_type: "manual",
    trigger_config: {},
    steps: [
      {
        id: "asset-valuation",
        type: "agent",
        name: "AI Asset Valuation",
        description: "Perform comprehensive asset valuation using AI analysis",
        config: {
          agent_type: "asset_valuator",
          system_prompt:
            "Conduct comprehensive real-world asset valuation. Analyze market data, comparable sales, asset condition, location factors, and future potential. Provide detailed valuation report with confidence intervals and risk assessments.",
          parameters: { temperature: 0.2, max_tokens: 2000 },
        },
        next_steps: ["compliance-check"],
      },
      {
        id: "compliance-check",
        type: "agent",
        name: "Regulatory Compliance Analysis",
        description: "Verify regulatory compliance for tokenization",
        config: {
          agent_type: "compliance_analyzer",
          system_prompt:
            "Analyze regulatory requirements for asset tokenization. Check compliance with securities laws, KYC/AML requirements, and jurisdiction-specific regulations. Identify any compliance gaps and recommend remediation steps.",
          parameters: { temperature: 0.1, max_tokens: 1500 },
        },
        next_steps: ["smart-contract-generation"],
      },
      {
        id: "smart-contract-generation",
        type: "code_generation",
        name: "Smart Contract Generation",
        description: "Generate secure smart contracts for asset tokenization",
        config: {
          contract_type: "erc721_asset_token",
          security_features: ["multi_sig", "time_locks", "access_control"],
          audit_requirements: true,
          blockchain: "ethereum",
        },
        next_steps: ["tokenization-deployment"],
      },
      {
        id: "tokenization-deployment",
        type: "custom",
        name: "Tokenization Deployment",
        description: "Deploy tokenization infrastructure and mint tokens",
        config: {
          deployment_type: "automated_tokenization",
          verification_steps: true,
          escrow_setup: true,
          metadata_generation: true,
        },
        next_steps: [],
      },
    ],
  },

  // Data Centers
  {
    id: "data-center-optimization",
    name: "Data Center Intelligence Hub",
    description:
      "Optimize data center operations with AI-powered energy management, predictive maintenance, and workload distribution",
    category: "Data Centers",
    icon: "🏢",
    difficulty: "intermediate",
    estimated_time: "12-15 minutes",
    tags: ["data-center", "energy", "optimization", "monitoring"],
    trigger_type: "schedule",
    trigger_config: { interval: "15m" },
    steps: [
      {
        id: "energy-monitoring",
        type: "custom",
        name: "Real-Time Energy Monitoring",
        description: "Monitor data center energy consumption and efficiency",
        config: {
          monitoring_points: ["servers", "cooling", "networking", "storage", "lighting"],
          metrics: ["power_consumption", "pue", "temperature", "humidity"],
          real_time_alerts: true,
        },
        next_steps: ["workload-analysis"],
      },
      {
        id: "workload-analysis",
        type: "data_analysis",
        name: "Workload Pattern Analysis",
        description: "Analyze compute workload patterns and resource utilization",
        config: {
          analysis_type: "workload_optimization",
          metrics: ["cpu_utilization", "memory_usage", "network_traffic", "storage_io"],
          prediction_models: true,
          capacity_planning: true,
        },
        next_steps: ["optimization-recommendations"],
      },
      {
        id: "optimization-recommendations",
        type: "agent",
        name: "AI Optimization Engine",
        description: "Generate data center optimization recommendations",
        config: {
          agent_type: "datacenter_optimizer",
          system_prompt:
            "Analyze data center performance metrics to generate optimization recommendations. Focus on energy efficiency, cooling optimization, workload distribution, and predictive maintenance. Provide specific, actionable recommendations with expected impact.",
          parameters: { temperature: 0.3, max_tokens: 1200 },
        },
        next_steps: ["automated-adjustments"],
      },
      {
        id: "automated-adjustments",
        type: "custom",
        name: "Automated System Adjustments",
        description: "Implement approved optimizations automatically",
        config: {
          function_name: "save_data",
          parameters: {
            destination: "supabase",
            table: "optimization_actions",
            operation: "insert",
            data: {
              workflow_id: "${context.workflow_id}",
              recommendations: "${context.results.optimization-recommendations}",
              status: "pending_approval",
              created_at: new Date().toISOString(),
            },
          },
          adjustment_types: ["cooling_optimization", "workload_migration", "power_management"],
          safety_checks: true,
          rollback_capability: true,
          approval_thresholds: { energy_savings: 5, performance_impact: 2 },
        },
        next_steps: [],
      },
    ],
  },

  // Medical Devices
  {
    id: "medical-device-intelligence",
    name: "Medical Device Intelligence Network",
    description:
      "Monitor and optimize medical device performance with AI-powered diagnostics and predictive maintenance",
    category: "Medical Devices",
    icon: "🏥",
    difficulty: "advanced",
    estimated_time: "20-25 minutes",
    tags: ["medical", "healthcare", "diagnostics", "monitoring"],
    trigger_type: "event",
    trigger_config: { event_type: "device_data_update" },
    steps: [
      {
        id: "device-monitoring",
        type: "custom",
        name: "Medical Device Monitoring",
        description: "Monitor medical device performance and patient data",
        config: {
          function_name: "fetch_data",
          parameters: {
            source: "supabase",
            query: {
              table: "medical_device_data",
              select: "*",
            },
            filters: [
              {
                field: "timestamp",
                operator: "gte",
                value: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // Last 1 hour
              },
            ],
          },
          device_types: ["ventilators", "monitors", "infusion_pumps", "imaging_equipment"],
          monitoring_frequency: "1m",
          patient_safety_alerts: true,
          hipaa_compliance: true,
        },
        next_steps: ["diagnostic-analysis"],
      },
      {
        id: "diagnostic-analysis",
        type: "agent",
        name: "AI Diagnostic Analysis",
        description: "Analyze device data for diagnostic insights",
        config: {
          agent_type: "medical_diagnostician",
          system_prompt:
            "Analyze medical device data to identify patterns, anomalies, and diagnostic insights. Focus on patient safety, device performance, and early warning indicators. Maintain strict medical accuracy and highlight any critical findings requiring immediate attention.",
          parameters: { temperature: 0.1, max_tokens: 1500 },
        },
        next_steps: ["predictive-maintenance"],
      },
      {
        id: "predictive-maintenance",
        type: "data_analysis",
        name: "Predictive Maintenance Analysis",
        description: "Predict maintenance needs for medical devices",
        config: {
          analysis_type: "medical_device_maintenance",
          failure_prediction: true,
          maintenance_scheduling: true,
          compliance_tracking: true,
          criticality_assessment: true,
        },
        next_steps: ["clinical-recommendations"],
      },
      {
        id: "clinical-recommendations",
        type: "agent",
        name: "Clinical Decision Support",
        description: "Generate clinical recommendations based on device data",
        config: {
          agent_type: "clinical_advisor",
          system_prompt:
            "Provide clinical decision support based on medical device data analysis. Generate evidence-based recommendations for patient care, device optimization, and safety protocols. Ensure all recommendations follow medical best practices and regulatory guidelines.",
          parameters: { temperature: 0.1, max_tokens: 1000 },
        },
        next_steps: [],
      },
    ],
  },

  // Product Lifecycle
  {
    id: "product-lifecycle-intelligence",
    name: "Product Lifecycle Intelligence Hub",
    description:
      "Track and optimize product lifecycle from design to disposal with AI-powered insights and sustainability metrics",
    category: "Product Lifecycle",
    icon: "♻️",
    difficulty: "intermediate",
    estimated_time: "15-18 minutes",
    tags: ["lifecycle", "sustainability", "optimization", "tracking"],
    trigger_type: "schedule",
    trigger_config: { interval: "6h" },
    steps: [
      {
        id: "lifecycle-tracking",
        type: "custom",
        name: "Product Lifecycle Tracking",
        description: "Track products through all lifecycle stages",
        config: {
          stages: ["design", "manufacturing", "distribution", "usage", "maintenance", "disposal"],
          tracking_methods: ["rfid", "qr_codes", "iot_sensors", "blockchain"],
          data_collection: true,
        },
        next_steps: ["sustainability-analysis"],
      },
      {
        id: "sustainability-analysis",
        type: "data_analysis",
        name: "Sustainability Impact Analysis",
        description: "Analyze environmental impact across product lifecycle",
        config: {
          analysis_type: "lifecycle_assessment",
          metrics: ["carbon_footprint", "water_usage", "waste_generation", "energy_consumption"],
          benchmarking: true,
          improvement_opportunities: true,
        },
        next_steps: ["optimization-recommendations"],
      },
      {
        id: "optimization-recommendations",
        type: "agent",
        name: "Lifecycle Optimization Engine",
        description: "Generate product lifecycle optimization recommendations",
        config: {
          agent_type: "lifecycle_optimizer",
          system_prompt:
            "Analyze product lifecycle data to identify optimization opportunities. Focus on sustainability improvements, cost reduction, quality enhancement, and circular economy principles. Provide specific recommendations for each lifecycle stage.",
          parameters: { temperature: 0.3, max_tokens: 1500 },
        },
        next_steps: ["circular-economy-planning"],
      },
      {
        id: "circular-economy-planning",
        type: "agent",
        name: "Circular Economy Planning",
        description: "Develop circular economy strategies for products",
        config: {
          agent_type: "circular_economy_planner",
          system_prompt:
            "Develop circular economy strategies for product lifecycle optimization. Focus on reuse, recycling, remanufacturing, and waste reduction. Create actionable plans for implementing circular economy principles throughout the product lifecycle.",
          parameters: { temperature: 0.4, max_tokens: 1200 },
        },
        next_steps: [],
      },
    ],
  },

  // Scientific R&D
  {
    id: "scientific-research-acceleration",
    name: "Scientific Research Acceleration Hub",
    description:
      "Accelerate scientific research with AI-powered hypothesis generation, experiment design, and data analysis",
    category: "Scientific R&D",
    icon: "🔬",
    difficulty: "advanced",
    estimated_time: "22-28 minutes",
    tags: ["research", "science", "experimentation", "discovery"],
    trigger_type: "manual",
    trigger_config: {},
    steps: [
      {
        id: "literature-analysis",
        type: "agent",
        name: "Scientific Literature Analysis",
        description: "Analyze scientific literature for research insights",
        config: {
          agent_type: "research_analyst",
          system_prompt:
            "Analyze scientific literature to identify research gaps, emerging trends, and potential breakthrough opportunities. Synthesize findings from multiple sources and generate novel research hypotheses based on current knowledge and identified gaps.",
          parameters: { temperature: 0.4, max_tokens: 2000 },
        },
        next_steps: ["hypothesis-generation"],
      },
      {
        id: "hypothesis-generation",
        type: "agent",
        name: "AI Hypothesis Generation",
        description: "Generate novel research hypotheses using AI",
        config: {
          agent_type: "hypothesis_generator",
          system_prompt:
            "Generate novel, testable research hypotheses based on literature analysis and scientific principles. Ensure hypotheses are innovative, feasible, and have potential for significant scientific impact. Provide rationale and expected outcomes for each hypothesis.",
          parameters: { temperature: 0.5, max_tokens: 1500 },
        },
        next_steps: ["experiment-design"],
      },
      {
        id: "experiment-design",
        type: "agent",
        name: "Experiment Design Optimization",
        description: "Design optimal experiments to test hypotheses",
        config: {
          agent_type: "experiment_designer",
          system_prompt:
            "Design rigorous experiments to test research hypotheses. Consider statistical power, control variables, sample sizes, and methodological best practices. Optimize for efficiency, accuracy, and reproducibility while minimizing costs and ethical concerns.",
          parameters: { temperature: 0.3, max_tokens: 1800 },
        },
        next_steps: ["data-analysis-pipeline"],
      },
      {
        id: "data-analysis-pipeline",
        type: "data_analysis",
        name: "Advanced Data Analysis",
        description: "Perform sophisticated analysis of experimental data",
        config: {
          analysis_type: "scientific_research",
          methods: ["statistical_analysis", "machine_learning", "pattern_recognition", "visualization"],
          significance_testing: true,
          reproducibility_checks: true,
        },
        next_steps: ["research-synthesis"],
      },
      {
        id: "research-synthesis",
        type: "agent",
        name: "Research Synthesis & Publication",
        description: "Synthesize findings and prepare research outputs",
        config: {
          agent_type: "research_synthesizer",
          system_prompt:
            "Synthesize experimental results and analysis into coherent research findings. Identify implications, limitations, and future research directions. Prepare publication-ready summaries and identify potential applications of the research.",
          parameters: { temperature: 0.3, max_tokens: 2000 },
        },
        next_steps: [],
      },
    ],
  },

  // Business Operations
  {
    id: "business-operations-intelligence",
    name: "Business Operations Intelligence Hub",
    description:
      "Optimize business operations with AI-powered process automation, performance monitoring, and strategic insights",
    category: "Business Operations",
    icon: "📊",
    difficulty: "intermediate",
    estimated_time: "12-16 minutes",
    tags: ["operations", "automation", "analytics", "optimization"],
    trigger_type: "schedule",
    trigger_config: { interval: "2h" },
    steps: [
      {
        id: "process-monitoring",
        type: "custom",
        name: "Business Process Monitoring",
        description: "Monitor key business processes and KPIs",
        config: {
          processes: ["sales", "marketing", "customer_service", "finance", "hr", "operations"],
          kpis: ["revenue", "conversion_rates", "customer_satisfaction", "efficiency_metrics"],
          real_time_dashboards: true,
        },
        next_steps: ["performance-analysis"],
      },
      {
        id: "performance-analysis",
        type: "data_analysis",
        name: "Performance Analytics",
        description: "Analyze business performance across all operations",
        config: {
          analysis_type: "business_intelligence",
          metrics: ["productivity", "profitability", "growth_rates", "market_share"],
          trend_analysis: true,
          benchmarking: true,
          forecasting: true,
        },
        next_steps: ["optimization-opportunities"],
      },
      {
        id: "optimization-opportunities",
        type: "agent",
        name: "Business Optimization Engine",
        description: "Identify and prioritize optimization opportunities",
        config: {
          agent_type: "business_optimizer",
          system_prompt:
            "Analyze business performance data to identify optimization opportunities. Focus on process improvements, cost reduction, revenue enhancement, and strategic advantages. Prioritize recommendations based on impact, feasibility, and resource requirements.",
          parameters: { temperature: 0.3, max_tokens: 1500 },
        },
        next_steps: ["strategic-recommendations"],
      },
      {
        id: "strategic-recommendations",
        type: "agent",
        name: "Strategic Intelligence",
        description: "Generate strategic business recommendations",
        config: {
          agent_type: "strategic_advisor",
          system_prompt:
            "Provide strategic business recommendations based on performance analysis and market insights. Consider competitive landscape, market trends, and organizational capabilities. Focus on sustainable growth, competitive advantage, and long-term value creation.",
          parameters: { temperature: 0.4, max_tokens: 1800 },
        },
        next_steps: [],
      },
    ],
  },
]

export function getTemplatesByCategory(category?: string): WorkflowTemplate[] {
  if (!category) return workflowTemplates
  return workflowTemplates.filter((template) => template.category === category)
}

export function getTemplateById(id: string): WorkflowTemplate | undefined {
  return workflowTemplates.find((template) => template.id === id)
}

export function getCategories(): string[] {
  return Array.from(new Set(workflowTemplates.map((template) => template.category)))
}

export function searchTemplates(query: string): WorkflowTemplate[] {
  const lowercaseQuery = query.toLowerCase()
  return workflowTemplates.filter(
    (template) =>
      template.name.toLowerCase().includes(lowercaseQuery) ||
      template.description.toLowerCase().includes(lowercaseQuery) ||
      template.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery)) ||
      template.category.toLowerCase().includes(lowercaseQuery),
  )
}
