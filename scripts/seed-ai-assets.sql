-- Migration to insert AI-focused assets for user fda1917a-08e5-4426-b5cf-e410e454da9d
-- Categories: AI Data Centers, IoT Devices, Robotics, Autonomous Vehicle Fleets

INSERT INTO assets (
  asset_id, name, asset_type, category, description, user_id, status, 
  purchase_cost, current_value, purchase_date, depreciation_rate,
  specifications, ai_agent_config, iot_sensor_id, current_location,
  maintenance_schedule, esg_metrics, risk_score, predictive_data
) VALUES

-- AI Data Centers
-- Set iot_sensor_id to NULL since these data centers don't reference specific IoT sensors
('DC-001', 'NVIDIA DGX SuperPOD Cluster', 'infrastructure', 'AI Data Center', 
 'High-performance AI training cluster with 256 A100 GPUs for large language model training',
 'fda1917a-08e5-4426-b5cf-e410e454da9d', 'active', 
 15000000, 12500000, '2023-01-15', 0.15,
 '{"gpu_count": 256, "memory": "40TB", "compute_power": "5 exaFLOPS", "cooling": "liquid", "power_consumption": "2.5MW"}',
 '{"model_types": ["LLM", "Computer Vision", "NLP"], "auto_scaling": true, "load_balancing": true}',
 NULL, 
 '{"latitude": 37.4419, "longitude": -122.1430, "address": "Palo Alto Data Center, CA"}',
 '{"frequency": "weekly", "next_maintenance": "2024-02-15", "type": "preventive"}',
 '{"carbon_footprint": 1250, "energy_efficiency": 0.85, "renewable_energy": 0.60}',
 0.15, 
 '{"utilization_forecast": 0.92, "failure_probability": 0.02, "maintenance_cost_prediction": 125000}'
),

-- Set iot_sensor_id to NULL since this TPU pod doesn't reference specific IoT sensors
('DC-002', 'Google TPU v4 Pod', 'infrastructure', 'AI Data Center',
 'Tensor Processing Unit pod optimized for machine learning workloads and neural network training',
 'fda1917a-08e5-4426-b5cf-e410e454da9d', 'active',
 8500000, 7200000, '2023-03-20', 0.18,
 '{"tpu_count": 4096, "memory": "32TB", "interconnect": "3D torus", "peak_performance": "1.1 exaFLOPS"}',
 '{"supported_frameworks": ["TensorFlow", "JAX", "PyTorch"], "auto_compilation": true}',
 NULL,
 '{"latitude": 45.5152, "longitude": -122.6784, "address": "Portland AI Campus, OR"}',
 '{"frequency": "bi-weekly", "next_maintenance": "2024-02-28", "type": "predictive"}',
 '{"carbon_footprint": 890, "energy_efficiency": 0.92, "renewable_energy": 0.85}',
 0.12,
 '{"utilization_forecast": 0.88, "failure_probability": 0.01, "maintenance_cost_prediction": 95000}'
),

-- IoT Devices
-- Set iot_sensor_id to NULL since this is an edge gateway, not linked to a specific sensor
('IOT-001', 'Industrial Edge AI Gateway', 'device', 'Edge Computing',
 'NVIDIA Jetson AGX Orin-based edge computing gateway for real-time AI inference',
 'fda1917a-08e5-4426-b5cf-e410e454da9d', 'active',
 12500, 10800, '2023-06-10', 0.25,
 '{"processor": "ARM Cortex-A78AE", "ai_performance": "275 TOPS", "memory": "64GB", "storage": "1TB NVMe"}',
 '{"inference_models": ["YOLOv8", "ResNet", "BERT"], "edge_optimization": true, "real_time_processing": true}',
 NULL,
 '{"latitude": 40.7589, "longitude": -73.9851, "address": "Manufacturing Plant A, NY"}',
 '{"frequency": "monthly", "next_maintenance": "2024-03-01", "type": "routine"}',
 '{"power_consumption": 60, "heat_generation": "low", "recyclable_components": 0.75}',
 0.08,
 '{"uptime_forecast": 0.995, "performance_degradation": 0.02, "replacement_timeline": "2026-06-10"}'
),

-- Set iot_sensor_id to NULL since this sensor array is the sensor itself, not linked to another sensor
('IOT-002', 'Smart Environmental Sensor Array', 'device', 'Environmental Monitoring',
 'Multi-sensor array for air quality, temperature, humidity, and noise monitoring with AI analytics',
 'fda1917a-08e5-4426-b5cf-e410e454da9d', 'active',
 3500, 3100, '2023-08-15', 0.20,
 '{"sensors": ["PM2.5", "CO2", "NOx", "Temperature", "Humidity"], "connectivity": "5G/WiFi", "battery_life": "5 years"}',
 '{"anomaly_detection": true, "predictive_analytics": true, "alert_system": true}',
 NULL,
 '{"latitude": 34.0522, "longitude": -118.2437, "address": "Downtown LA Monitoring Station, CA"}',
 '{"frequency": "quarterly", "next_maintenance": "2024-05-15", "type": "calibration"}',
 '{"environmental_impact": "positive", "data_accuracy": 0.98, "compliance_rating": "A+"}',
 0.05,
 '{"sensor_drift_prediction": 0.03, "calibration_needs": "low", "lifespan_remaining": 0.82}'
),

-- Robotics
-- Set iot_sensor_id to NULL since robot fleets don't reference specific external IoT sensors
('ROB-001', 'Boston Dynamics Spot Fleet', 'equipment', 'Autonomous Inspection',
 'Fleet of 10 quadruped robots for autonomous facility inspection and security patrol',
 'fda1917a-08e5-4426-b5cf-e410e454da9d', 'active',
 750000, 650000, '2023-04-05', 0.22,
 '{"units": 10, "payload": "14kg", "runtime": "90min", "sensors": ["LiDAR", "RGB cameras", "thermal"], "mobility": "all-terrain"}',
 '{"autonomous_navigation": true, "object_detection": true, "anomaly_reporting": true, "fleet_coordination": true}',
 NULL,
 '{"latitude": 29.7604, "longitude": -95.3698, "address": "Houston Energy Complex, TX"}',
 '{"frequency": "weekly", "next_maintenance": "2024-02-20", "type": "preventive"}',
 '{"operational_efficiency": 0.94, "safety_incidents": 0, "inspection_accuracy": 0.97}',
 0.18,
 '{"battery_degradation": 0.08, "component_wear": 0.12, "upgrade_recommendation": "2025-Q2"}'
),

-- Set iot_sensor_id to NULL since manufacturing robots don't reference specific external IoT sensors
('ROB-002', 'ABB Collaborative Manufacturing Robots', 'equipment', 'Manufacturing Automation',
 'Array of 25 collaborative robots for precision assembly and quality control in electronics manufacturing',
 'fda1917a-08e5-4426-b5cf-e410e454da9d', 'active',
 1250000, 1050000, '2023-02-28', 0.20,
 '{"units": 25, "payload": "10kg", "reach": "900mm", "repeatability": "±0.01mm", "safety_rating": "ISO 10218"}',
 '{"vision_system": true, "force_sensing": true, "adaptive_learning": true, "quality_prediction": true}',
 NULL,
 '{"latitude": 37.3382, "longitude": -121.8863, "address": "Silicon Valley Manufacturing, CA"}',
 '{"frequency": "bi-weekly", "next_maintenance": "2024-03-10", "type": "predictive"}',
 '{"production_efficiency": 0.96, "defect_rate": 0.001, "energy_efficiency": 0.88}',
 0.10,
 '{"wear_prediction": 0.15, "calibration_drift": 0.02, "productivity_trend": "increasing"}'
),

-- Autonomous Vehicle Fleet
-- Set iot_sensor_id to NULL since vehicle fleets don't reference specific external IoT sensors
('AV-001', 'Waymo Autonomous Delivery Fleet', 'vehicle', 'Last-Mile Delivery',
 'Fleet of 50 autonomous delivery vehicles for urban logistics and e-commerce fulfillment',
 'fda1917a-08e5-4426-b5cf-e410e454da9d', 'active',
 5000000, 4200000, '2023-05-12', 0.25,
 '{"fleet_size": 50, "range": "300km", "payload": "200kg", "sensors": ["LiDAR", "cameras", "radar"], "autonomy_level": "L4"}',
 '{"route_optimization": true, "traffic_prediction": true, "dynamic_rerouting": true, "fleet_management": true}',
 NULL,
 '{"latitude": 37.7749, "longitude": -122.4194, "address": "San Francisco Distribution Hub, CA"}',
 '{"frequency": "daily", "next_maintenance": "2024-02-16", "type": "routine"}',
 '{"emissions_reduction": 0.85, "delivery_efficiency": 0.92, "safety_score": 0.998}',
 0.22,
 '{"mileage_forecast": 125000, "component_replacement": "2024-Q3", "efficiency_trend": "stable"}'
),

-- Set iot_sensor_id to NULL since Tesla Semi fleet doesn't reference specific external IoT sensors
('AV-002', 'Tesla Semi Autonomous Freight', 'vehicle', 'Long-Haul Transport',
 'Fleet of 20 electric semi-trucks with autonomous driving capabilities for freight transport',
 'fda1917a-08e5-4426-b5cf-e410e454da9d', 'active',
 3600000, 3100000, '2023-07-20', 0.28,
 '{"fleet_size": 20, "range": "800km", "payload": "36000kg", "charging_time": "45min", "autonomy_level": "L3"}',
 '{"convoy_mode": true, "energy_optimization": true, "predictive_maintenance": true, "load_balancing": true}',
 NULL,
 '{"latitude": 39.7392, "longitude": -104.9903, "address": "Denver Logistics Center, CO"}',
 '{"frequency": "weekly", "next_maintenance": "2024-02-25", "type": "comprehensive"}',
 '{"fuel_savings": 0.78, "carbon_reduction": 0.82, "operational_efficiency": 0.89}',
 0.25,
 '{"battery_health": 0.94, "drivetrain_wear": 0.08, "route_efficiency": 0.91}'
),

-- Set iot_sensor_id to NULL since robotaxi fleet doesn't reference specific external IoT sensors
('AV-003', 'Cruise Robotaxi Fleet', 'vehicle', 'Urban Mobility',
 'Fleet of 100 autonomous passenger vehicles for ride-sharing services in metropolitan areas',
 'fda1917a-08e5-4426-b5cf-e410e454da9d', 'active',
 8500000, 7200000, '2023-09-08', 0.30,
 '{"fleet_size": 100, "passenger_capacity": 4, "range": "400km", "sensors": ["360° LiDAR", "HD cameras", "ultrasonic"], "autonomy_level": "L4"}',
 '{"demand_prediction": true, "dynamic_pricing": true, "passenger_safety": true, "traffic_optimization": true}',
 NULL,
 '{"latitude": 25.7617, "longitude": -80.1918, "address": "Miami Mobility Hub, FL"}',
 '{"frequency": "daily", "next_maintenance": "2024-02-18", "type": "safety_inspection"}',
 '{"passenger_satisfaction": 0.94, "safety_incidents": 0, "utilization_rate": 0.87}',
 0.28,
 '{"vehicle_availability": 0.96, "maintenance_cost_trend": "decreasing", "fleet_expansion": "2024-Q4"}'
);
