-- Add robotics-specific fields to assets table for fleet management workflows

-- Add operational status fields
ALTER TABLE assets
ADD COLUMN IF NOT EXISTS battery_level DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS operational_status TEXT CHECK (operational_status IN ('active', 'idle', 'maintenance', 'offline', 'charging')),
ADD COLUMN IF NOT EXISTS location JSONB,
ADD COLUMN IF NOT EXISTS task_queue JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS maintenance_schedule JSONB;

-- Add robot capabilities fields
ALTER TABLE assets
ADD COLUMN IF NOT EXISTS capabilities JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS payload_capacity DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS speed DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS special_tools TEXT[],
ADD COLUMN IF NOT EXISTS sensors TEXT[];

-- Add task and performance tracking fields
ALTER TABLE assets
ADD COLUMN IF NOT EXISTS current_task JSONB,
ADD COLUMN IF NOT EXISTS task_progress DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS last_maintenance_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS next_maintenance_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS total_runtime_hours DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS error_count INTEGER DEFAULT 0;

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_assets_operational_status ON assets(operational_status);
CREATE INDEX IF NOT EXISTS idx_assets_battery_level ON assets(battery_level);
CREATE INDEX IF NOT EXISTS idx_assets_next_maintenance ON assets(next_maintenance_date);

-- Add comments for documentation
COMMENT ON COLUMN assets.battery_level IS 'Current battery level as percentage (0-100)';
COMMENT ON COLUMN assets.operational_status IS 'Current operational status of the robot';
COMMENT ON COLUMN assets.location IS 'Current location as JSON with coordinates and zone info';
COMMENT ON COLUMN assets.task_queue IS 'Array of pending tasks for the robot';
COMMENT ON COLUMN assets.maintenance_schedule IS 'Scheduled maintenance information';
COMMENT ON COLUMN assets.capabilities IS 'Robot capabilities and specifications';
COMMENT ON COLUMN assets.payload_capacity IS 'Maximum payload capacity in kg';
COMMENT ON COLUMN assets.speed IS 'Maximum speed in m/s';
COMMENT ON COLUMN assets.current_task IS 'Currently executing task details';
COMMENT ON COLUMN assets.task_progress IS 'Progress of current task as percentage (0-100)';
