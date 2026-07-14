-- Migration: ROI Analytics Platform, IoT Fleet, and AI Learning Layer Enhancement
-- Date: 2026-02-02
-- Description: Creates platform-specific ROI baseline data table (org_roi_baseline_data),
--              enhances IoT fleet tracking, and adds enterprise AI logging with learning layer integration
--
-- NOTE: This migration uses the existing roi_public_assessments table as a reference
--       for the column structure to create org_roi_baseline_data for continuous ROI calculation
--       within the platform. The roi_public_assessments table is managed by the ROI Calculator
--       service and stores assessment data from the public calculator at roi.kronova.io

-- ============================================================================
-- TABLE: Organization ROI Baseline Data
-- ============================================================================
-- This table stores ROI baseline data for organizations using the same structure as
-- roi_public_assessments to enable continuous ROI calculation and display within the platform

CREATE TABLE IF NOT EXISTS public.org_roi_baseline_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID,
  
  -- Assessment Identification (matching roi_public_assessments structure)
  assessment_reference TEXT NOT NULL UNIQUE,
  company_name TEXT,
  company_size TEXT NOT NULL,
  industry TEXT NOT NULL,
  employees INTEGER NOT NULL,
  email TEXT,
  
  -- Financial Metrics
  current_annual_cost NUMERIC(15,2) NOT NULL DEFAULT 0,
  kronova_annual_cost NUMERIC(15,2) NOT NULL DEFAULT 0,
  annual_savings NUMERIC(15,2) NOT NULL DEFAULT 0,
  three_year_savings NUMERIC(15,2) NOT NULL DEFAULT 0,
  five_year_value NUMERIC(15,2) NOT NULL DEFAULT 0,
  roi_percentage NUMERIC(8,4) NOT NULL DEFAULT 0,
  payback_months INTEGER NOT NULL DEFAULT 0,
  
  -- Cost Breakdowns
  operational_savings NUMERIC(15,2) DEFAULT 0,
  productivity_gain NUMERIC(15,2) DEFAULT 0,
  quality_savings NUMERIC(15,2) DEFAULT 0,
  error_reduction NUMERIC(15,2) DEFAULT 0,
  hidden_cost_reduction NUMERIC(15,2) DEFAULT 0,
  strategic_value NUMERIC(15,2) DEFAULT 0,
  compliance_costs NUMERIC(15,2) DEFAULT 0,
  maintenance_costs NUMERIC(15,2),
  training_costs NUMERIC(15,2),
  security_costs NUMERIC(15,2),
  data_preparation_costs NUMERIC(15,2),
  
  -- Operational Metrics
  manual_hours_per_week NUMERIC(10,2) NOT NULL DEFAULT 0,
  avg_salary NUMERIC(15,2) NOT NULL DEFAULT 0,
  error_rate_percentage NUMERIC(5,2) DEFAULT 0,
  system_downtime_percentage NUMERIC(5,2) DEFAULT 0,
  legacy_system_age_years INTEGER DEFAULT 0,
  
  -- Readiness Scores (0-100)
  ai_maturity_score INTEGER CHECK (ai_maturity_score BETWEEN 0 AND 100),
  data_quality_score INTEGER CHECK (data_quality_score BETWEEN 0 AND 100),
  cloud_readiness_score INTEGER CHECK (cloud_readiness_score BETWEEN 0 AND 100),
  change_readiness_score INTEGER CHECK (change_readiness_score BETWEEN 0 AND 100),
  executive_support_score INTEGER CHECK (executive_support_score BETWEEN 0 AND 100),
  competitive_pressure_score INTEGER CHECK (competitive_pressure_score BETWEEN 0 AND 100),
  
  -- Risk Scores (0-100, higher = more risk)
  adoption_risk INTEGER CHECK (adoption_risk BETWEEN 0 AND 100),
  data_quality_risk INTEGER CHECK (data_quality_risk BETWEEN 0 AND 100),
  implementation_risk INTEGER CHECK (implementation_risk BETWEEN 0 AND 100),
  integration_complexity INTEGER CHECK (integration_complexity BETWEEN 0 AND 100),
  
  -- Timeline
  time_to_value_months INTEGER,
  selected_plan TEXT,
  
  -- Tracking
  source TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  is_demo BOOLEAN DEFAULT FALSE,
  consent_follow_up BOOLEAN DEFAULT FALSE,
  consent_marketing BOOLEAN DEFAULT FALSE,
  pdf_generated_count INTEGER DEFAULT 0,
  last_pdf_generated_at TIMESTAMPTZ,
  
  -- Status for Continuous Tracking
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  baseline_date DATE NOT NULL DEFAULT CURRENT_DATE,
  last_reviewed_at TIMESTAMPTZ,
  next_review_date DATE,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TABLE: IoT Fleet Devices Enhancement
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.iot_fleet_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID,
  
  -- Device Identification
  device_id TEXT NOT NULL UNIQUE,
  device_name TEXT NOT NULL,
  device_type TEXT NOT NULL CHECK (device_type IN ('truck', 'trailer', 'container', 'sensor', 'gateway', 'camera')),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'maintenance', 'alert', 'inactive')),
  last_seen TIMESTAMPTZ,
  
  -- Location
  current_latitude NUMERIC(10,7),
  current_longitude NUMERIC(10,7),
  current_address TEXT,
  geofence_id UUID,
  
  -- Vehicle-specific (for trucks/trailers)
  license_plate TEXT,
  vin TEXT,
  make TEXT,
  model TEXT,
  year INTEGER,
  
  -- Maintenance
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  maintenance_status TEXT CHECK (maintenance_status IN ('good', 'attention', 'critical', 'overdue')),
  odometer_reading NUMERIC(12,2),
  
  -- Driver Assignment
  assigned_driver_id UUID,
  
  -- Metadata
  firmware_version TEXT,
  configuration JSONB DEFAULT '{}',
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- IoT Telemetry Table
CREATE TABLE IF NOT EXISTS public.iot_fleet_telemetry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID REFERENCES public.iot_fleet_devices(id) ON DELETE CASCADE,
  
  -- Timestamp
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Location
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  altitude NUMERIC(8,2),
  speed NUMERIC(6,2),
  heading NUMERIC(5,2),
  
  -- Engine Metrics
  engine_rpm INTEGER,
  fuel_level NUMERIC(5,2),
  fuel_consumption_rate NUMERIC(6,3),
  engine_temperature NUMERIC(5,2),
  oil_pressure NUMERIC(6,2),
  
  -- Environmental
  ambient_temperature NUMERIC(5,2),
  humidity NUMERIC(5,2),
  cargo_temperature NUMERIC(5,2),
  
  -- Driver Behavior
  harsh_braking_events INTEGER DEFAULT 0,
  harsh_acceleration_events INTEGER DEFAULT 0,
  speeding_events INTEGER DEFAULT 0,
  idle_time_minutes INTEGER DEFAULT 0,
  
  -- Diagnostics
  dtc_codes TEXT[],
  battery_voltage NUMERIC(5,2),
  tire_pressure JSONB,
  
  -- Metadata
  raw_data JSONB
);

-- IoT Alerts Table
CREATE TABLE IF NOT EXISTS public.iot_fleet_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID REFERENCES public.iot_fleet_devices(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  
  alert_type TEXT NOT NULL CHECK (alert_type IN ('maintenance', 'geofence', 'speed', 'temperature', 'fuel', 'driver_behavior', 'diagnostic', 'security')),
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  
  -- Context
  trigger_value NUMERIC,
  threshold_value NUMERIC,
  location_latitude NUMERIC(10,7),
  location_longitude NUMERIC(10,7),
  
  metadata JSONB DEFAULT '{}'
);

-- Driver Performance Table
CREATE TABLE IF NOT EXISTS public.iot_fleet_driver_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Scores (0-100)
  overall_score INTEGER CHECK (overall_score BETWEEN 0 AND 100),
  safety_score INTEGER CHECK (safety_score BETWEEN 0 AND 100),
  efficiency_score INTEGER CHECK (efficiency_score BETWEEN 0 AND 100),
  compliance_score INTEGER CHECK (compliance_score BETWEEN 0 AND 100),
  
  -- Metrics
  total_miles NUMERIC(10,2),
  total_hours NUMERIC(8,2),
  fuel_efficiency_mpg NUMERIC(6,2),
  on_time_delivery_rate NUMERIC(5,2),
  
  -- Events
  harsh_braking_count INTEGER DEFAULT 0,
  harsh_acceleration_count INTEGER DEFAULT 0,
  speeding_count INTEGER DEFAULT 0,
  idle_time_total_minutes INTEGER DEFAULT 0,
  
  -- Gamification
  badges_earned TEXT[],
  points_earned INTEGER DEFAULT 0,
  rank_in_fleet INTEGER,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TABLE: Enhanced AI Request Logs
-- ============================================================================

-- Add learning layer integration columns if they don't exist
DO $$
BEGIN
  -- Add learning_layer_processed if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'ai_request_logs' AND column_name = 'learning_layer_processed'
  ) THEN
    ALTER TABLE public.ai_request_logs ADD COLUMN learning_layer_processed BOOLEAN DEFAULT FALSE;
  END IF;

  -- Add learning_layer_processed_at if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'ai_request_logs' AND column_name = 'learning_layer_processed_at'
  ) THEN
    ALTER TABLE public.ai_request_logs ADD COLUMN learning_layer_processed_at TIMESTAMPTZ;
  END IF;

  -- Add learning_insights if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'ai_request_logs' AND column_name = 'learning_insights'
  ) THEN
    ALTER TABLE public.ai_request_logs ADD COLUMN learning_insights JSONB DEFAULT '{}';
  END IF;

  -- Add feedback_score if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'ai_request_logs' AND column_name = 'feedback_score'
  ) THEN
    ALTER TABLE public.ai_request_logs ADD COLUMN feedback_score INTEGER CHECK (feedback_score BETWEEN 1 AND 5);
  END IF;

  -- Add feedback_text if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'ai_request_logs' AND column_name = 'feedback_text'
  ) THEN
    ALTER TABLE public.ai_request_logs ADD COLUMN feedback_text TEXT;
  END IF;

  -- Add cost_usd if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'ai_request_logs' AND column_name = 'cost_usd'
  ) THEN
    ALTER TABLE public.ai_request_logs ADD COLUMN cost_usd NUMERIC(10,6);
  END IF;

  -- Add latency_p95_ms if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'ai_request_logs' AND column_name = 'latency_p95_ms'
  ) THEN
    ALTER TABLE public.ai_request_logs ADD COLUMN latency_p95_ms INTEGER;
  END IF;

  -- Add error_category if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'ai_request_logs' AND column_name = 'error_category'
  ) THEN
    ALTER TABLE public.ai_request_logs ADD COLUMN error_category TEXT;
  END IF;

  -- Add retry_count if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'ai_request_logs' AND column_name = 'retry_count'
  ) THEN
    ALTER TABLE public.ai_request_logs ADD COLUMN retry_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Organization ROI Baseline Data indexes
CREATE INDEX IF NOT EXISTS idx_org_roi_baseline_user_id ON public.org_roi_baseline_data(user_id);
CREATE INDEX IF NOT EXISTS idx_org_roi_baseline_org_id ON public.org_roi_baseline_data(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_roi_baseline_status ON public.org_roi_baseline_data(status);
CREATE INDEX IF NOT EXISTS idx_org_roi_baseline_industry ON public.org_roi_baseline_data(industry);
CREATE INDEX IF NOT EXISTS idx_org_roi_baseline_created_at ON public.org_roi_baseline_data(created_at DESC);

-- IoT Fleet indexes
CREATE INDEX IF NOT EXISTS idx_iot_fleet_devices_user ON public.iot_fleet_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_iot_fleet_devices_status ON public.iot_fleet_devices(status);
CREATE INDEX IF NOT EXISTS idx_iot_fleet_telemetry_device ON public.iot_fleet_telemetry(device_id);
CREATE INDEX IF NOT EXISTS idx_iot_fleet_telemetry_time ON public.iot_fleet_telemetry(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_iot_fleet_alerts_device ON public.iot_fleet_alerts(device_id);
CREATE INDEX IF NOT EXISTS idx_iot_fleet_alerts_unresolved ON public.iot_fleet_alerts(resolved_at) WHERE resolved_at IS NULL;

-- AI Request Logs indexes for learning layer
CREATE INDEX IF NOT EXISTS idx_ai_request_logs_learning_unprocessed 
  ON public.ai_request_logs(created_at) 
  WHERE learning_layer_processed = FALSE;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE public.org_roi_baseline_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iot_fleet_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iot_fleet_telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iot_fleet_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iot_fleet_driver_performance ENABLE ROW LEVEL SECURITY;

-- Organization ROI Baseline Data policies
CREATE POLICY "Users can view own baseline data" ON public.org_roi_baseline_data
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own baseline data" ON public.org_roi_baseline_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own baseline data" ON public.org_roi_baseline_data
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own baseline data" ON public.org_roi_baseline_data
  FOR DELETE USING (auth.uid() = user_id);

-- IoT Fleet Device policies
CREATE POLICY "Users can view own fleet devices" ON public.iot_fleet_devices
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own fleet devices" ON public.iot_fleet_devices
  FOR ALL USING (auth.uid() = user_id);

-- IoT Telemetry policies
CREATE POLICY "Users can view own device telemetry" ON public.iot_fleet_telemetry
  FOR SELECT USING (
    device_id IN (SELECT id FROM public.iot_fleet_devices WHERE user_id = auth.uid())
  );

-- IoT Alerts policies
CREATE POLICY "Users can view own alerts" ON public.iot_fleet_alerts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own alerts" ON public.iot_fleet_alerts
  FOR ALL USING (auth.uid() = user_id);

-- Driver Performance policies
CREATE POLICY "Users can view own performance" ON public.iot_fleet_driver_performance
  FOR SELECT USING (auth.uid() = driver_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update timestamp trigger to relevant tables
CREATE TRIGGER update_org_roi_baseline_updated_at
  BEFORE UPDATE ON public.org_roi_baseline_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_iot_fleet_devices_updated_at
  BEFORE UPDATE ON public.iot_fleet_devices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- GRANTS
-- ============================================================================

-- Grant access to authenticated users for the new tables
GRANT ALL ON public.org_roi_baseline_data TO authenticated;
GRANT ALL ON public.iot_fleet_devices TO authenticated;
GRANT ALL ON public.iot_fleet_telemetry TO authenticated;
GRANT ALL ON public.iot_fleet_alerts TO authenticated;
GRANT ALL ON public.iot_fleet_driver_performance TO authenticated;

-- Service role has full access
GRANT ALL ON public.org_roi_baseline_data TO service_role;
GRANT ALL ON public.iot_fleet_devices TO service_role;
GRANT ALL ON public.iot_fleet_telemetry TO service_role;
GRANT ALL ON public.iot_fleet_alerts TO service_role;
GRANT ALL ON public.iot_fleet_driver_performance TO service_role;
