-- Seed test data for robotics fleet management for specific user

-- Update existing assets with robotics data for testing
-- Added user_id filter to target only assets for user fda1917a-08e5-4426-b5cf-e410e454da9d
UPDATE assets
SET 
  battery_level = CASE 
    WHEN name LIKE '%Boston Dynamics%' THEN 85.5
    WHEN name LIKE '%Test Asset%' THEN 92.0
    ELSE 75.0
  END,
  operational_status = 'active',
  location = jsonb_build_object(
    'x', (RANDOM() * 100)::numeric(10,2),
    'y', (RANDOM() * 100)::numeric(10,2),
    'zone', 'warehouse-a',
    'floor', 1
  ),
  task_queue = jsonb_build_array(
    jsonb_build_object(
      'id', gen_random_uuid()::text,
      'type', 'transport',
      'priority', 'high',
      'destination', 'zone-b'
    )
  ),
  capabilities = jsonb_build_object(
    'navigation', true,
    'object_detection', true,
    'autonomous_operation', true,
    'collision_avoidance', true
  ),
  payload_capacity = CASE 
    WHEN type = 'equipment' THEN 50.0
    WHEN type = 'container' THEN 100.0
    ELSE 25.0
  END,
  speed = 1.5,
  special_tools = ARRAY['gripper', 'camera', 'lidar'],
  sensors = ARRAY['proximity', 'temperature', 'pressure'],
  current_task = jsonb_build_object(
    'id', gen_random_uuid()::text,
    'type', 'inspection',
    'started_at', NOW(),
    'estimated_completion', NOW() + INTERVAL '30 minutes'
  ),
  task_progress = (RANDOM() * 100)::numeric(5,2),
  last_maintenance_date = NOW() - INTERVAL '7 days',
  next_maintenance_date = NOW() + INTERVAL '23 days',
  total_runtime_hours = (RANDOM() * 1000)::numeric(10,2),
  error_count = (RANDOM() * 5)::integer
WHERE user_id = 'fda1917a-08e5-4426-b5cf-e410e454da9d'
  AND type IN ('equipment', 'container')
  AND (name LIKE '%Boston Dynamics%' OR name LIKE '%Test%' OR name LIKE '%Container%');

-- Log the update
DO $$
BEGIN
  RAISE NOTICE 'Robotics test data seeded successfully for user fda1917a-08e5-4426-b5cf-e410e454da9d';
END $$;
