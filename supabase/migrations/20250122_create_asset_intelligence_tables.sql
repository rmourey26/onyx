-- Create Asset Intelligence tables for comprehensive asset lifecycle management

-- Assets table - core asset registry
CREATE TABLE IF NOT EXISTS public.assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  asset_type text NOT NULL CHECK (asset_type IN ('equipment', 'vehicle', 'container', 'device', 'infrastructure', 'inventory')),
  category text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance', 'retired', 'lost')),
  location_id text,
  current_location jsonb,
  specifications jsonb DEFAULT '{}'::jsonb,
  purchase_date date,
  purchase_cost numeric(12,2),
  depreciation_rate numeric(5,2) DEFAULT 0.00,
  current_value numeric(12,2),
  maintenance_schedule jsonb DEFAULT '[]'::jsonb,
  compliance_data jsonb DEFAULT '{}'::jsonb,
  esg_metrics jsonb DEFAULT '{}'::jsonb,
  iot_sensor_id text REFERENCES public.iot_sensors(sensor_id),
  nfc_tag_id text,
  qr_code text UNIQUE,
  metadata jsonb DEFAULT '{}'::jsonb,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Adding ALTER TABLE statements for existing assets table modifications
-- Add columns if they don't exist (safe for existing tables)
DO $$ 
BEGIN
  -- Add embedding_vector column for RAG analytics
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assets' AND column_name = 'embedding_vector') THEN
    ALTER TABLE public.assets ADD COLUMN embedding_vector vector(1536);
  END IF;
  
  -- Add AI agent configuration columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assets' AND column_name = 'ai_agent_config') THEN
    ALTER TABLE public.assets ADD COLUMN ai_agent_config jsonb DEFAULT '{}'::jsonb;
  END IF;
  
  -- Add workflow automation settings
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assets' AND column_name = 'workflow_settings') THEN
    ALTER TABLE public.assets ADD COLUMN workflow_settings jsonb DEFAULT '{}'::jsonb;
  END IF;
  
  -- Add predictive analytics data
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assets' AND column_name = 'predictive_data') THEN
    ALTER TABLE public.assets ADD COLUMN predictive_data jsonb DEFAULT '{}'::jsonb;
  END IF;
  
  -- Add risk assessment score
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assets' AND column_name = 'risk_score') THEN
    ALTER TABLE public.assets ADD COLUMN risk_score numeric(3,2) CHECK (risk_score >= 0 AND risk_score <= 1);
  END IF;
END $$;

-- Asset lifecycle events table
CREATE TABLE IF NOT EXISTS public.asset_lifecycle_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('created', 'deployed', 'maintenance', 'repair', 'moved', 'retired', 'lost', 'found', 'inspection', 'compliance_check')),
  event_status text NOT NULL DEFAULT 'completed' CHECK (event_status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'failed')),
  event_date timestamptz NOT NULL DEFAULT now(),
  location jsonb,
  cost numeric(12,2),
  description text,
  performed_by text,
  documentation jsonb DEFAULT '{}'::jsonb,
  ai_analysis_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Adding ALTER TABLE statements for existing asset_lifecycle_events table modifications
DO $$ 
BEGIN
  -- Add embedding vector for event analysis
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'asset_lifecycle_events' AND column_name = 'embedding_vector') THEN
    ALTER TABLE public.asset_lifecycle_events ADD COLUMN embedding_vector vector(1536);
  END IF;
  
  -- Add AI-generated insights
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'asset_lifecycle_events' AND column_name = 'ai_insights') THEN
    ALTER TABLE public.asset_lifecycle_events ADD COLUMN ai_insights jsonb DEFAULT '{}'::jsonb;
  END IF;
  
  -- Add workflow execution reference
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'asset_lifecycle_events' AND column_name = 'workflow_execution_id') THEN
    ALTER TABLE public.asset_lifecycle_events ADD COLUMN workflow_execution_id uuid;
  END IF;
  
  -- Add automated event flag
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'asset_lifecycle_events' AND column_name = 'is_automated') THEN
    ALTER TABLE public.asset_lifecycle_events ADD COLUMN is_automated boolean DEFAULT false;
  END IF;
  
  -- Add severity level for events
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'asset_lifecycle_events' AND column_name = 'severity') THEN
    ALTER TABLE public.asset_lifecycle_events ADD COLUMN severity text DEFAULT 'normal' CHECK (severity IN ('low', 'normal', 'high', 'critical'));
  END IF;
END $$;

-- Asset intelligence insights table
CREATE TABLE IF NOT EXISTS public.asset_intelligence_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  insight_type text NOT NULL CHECK (insight_type IN ('predictive_maintenance', 'cost_optimization', 'utilization_analysis', 'compliance_risk', 'esg_impact', 'lifecycle_prediction')),
  confidence_score numeric(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  insight_data jsonb NOT NULL,
  recommendations jsonb DEFAULT '[]'::jsonb,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'dismissed')),
  ai_agent_id uuid,
  workflow_run_id uuid,
  expires_at timestamptz,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Asset workflows table for automation
CREATE TABLE IF NOT EXISTS public.asset_workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  asset_type text,
  trigger_conditions jsonb NOT NULL,
  workflow_steps jsonb NOT NULL,
  is_active boolean DEFAULT true,
  execution_count integer DEFAULT 0,
  last_executed_at timestamptz,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_assets_asset_id ON public.assets(asset_id);
CREATE INDEX IF NOT EXISTS idx_assets_asset_type ON public.assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_assets_status ON public.assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_user_id ON public.assets(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_iot_sensor_id ON public.assets(iot_sensor_id);
CREATE INDEX IF NOT EXISTS idx_assets_qr_code ON public.assets(qr_code);

-- Adding indexes for new columns
CREATE INDEX IF NOT EXISTS idx_assets_embedding_vector ON public.assets USING ivfflat (embedding_vector vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_assets_risk_score ON public.assets(risk_score);
CREATE INDEX IF NOT EXISTS idx_asset_lifecycle_events_embedding_vector ON public.asset_lifecycle_events USING ivfflat (embedding_vector vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_asset_lifecycle_events_workflow_execution_id ON public.asset_lifecycle_events(workflow_execution_id);
CREATE INDEX IF NOT EXISTS idx_asset_lifecycle_events_severity ON public.asset_lifecycle_events(severity);
CREATE INDEX IF NOT EXISTS idx_asset_lifecycle_events_is_automated ON public.asset_lifecycle_events(is_automated);

CREATE INDEX IF NOT EXISTS idx_asset_lifecycle_events_asset_id ON public.asset_lifecycle_events(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_lifecycle_events_event_type ON public.asset_lifecycle_events(event_type);
CREATE INDEX IF NOT EXISTS idx_asset_lifecycle_events_event_date ON public.asset_lifecycle_events(event_date);

CREATE INDEX IF NOT EXISTS idx_asset_intelligence_insights_asset_id ON public.asset_intelligence_insights(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_intelligence_insights_insight_type ON public.asset_intelligence_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_asset_intelligence_insights_priority ON public.asset_intelligence_insights(priority);
CREATE INDEX IF NOT EXISTS idx_asset_intelligence_insights_status ON public.asset_intelligence_insights(status);

-- Enable RLS
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_lifecycle_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_intelligence_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_workflows ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can manage their own assets" ON public.assets
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own asset events" ON public.asset_lifecycle_events
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own asset insights" ON public.asset_intelligence_insights
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own asset workflows" ON public.asset_workflows
  FOR ALL USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_assets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_assets_updated_at
  BEFORE UPDATE ON public.assets
  FOR EACH ROW
  EXECUTE FUNCTION update_assets_updated_at();

CREATE TRIGGER update_asset_intelligence_insights_updated_at
  BEFORE UPDATE ON public.asset_intelligence_insights
  FOR EACH ROW
  EXECUTE FUNCTION update_assets_updated_at();

CREATE TRIGGER update_asset_workflows_updated_at
  BEFORE UPDATE ON public.asset_workflows
  FOR EACH ROW
  EXECUTE FUNCTION update_assets_updated_at();

-- Create views for analytics
CREATE OR REPLACE VIEW public.asset_analytics AS
SELECT 
  a.user_id,
  a.asset_type,
  COUNT(*) as total_assets,
  COUNT(*) FILTER (WHERE a.status = 'active') as active_assets,
  COUNT(*) FILTER (WHERE a.status = 'maintenance') as maintenance_assets,
  COUNT(*) FILTER (WHERE a.iot_sensor_id IS NOT NULL) as iot_enabled_assets,
  AVG(a.current_value) as avg_asset_value,
  SUM(a.current_value) as total_asset_value,
  COUNT(DISTINCT ale.id) as total_lifecycle_events,
  COUNT(DISTINCT aii.id) as total_insights
FROM public.assets a
LEFT JOIN public.asset_lifecycle_events ale ON a.id = ale.asset_id
LEFT JOIN public.asset_intelligence_insights aii ON a.id = aii.asset_id
GROUP BY a.user_id, a.asset_type;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.asset_lifecycle_events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.asset_intelligence_insights TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.asset_workflows TO authenticated;
GRANT SELECT ON public.asset_analytics TO authenticated;

GRANT ALL ON public.assets TO service_role;
GRANT ALL ON public.asset_lifecycle_events TO service_role;
GRANT ALL ON public.asset_intelligence_insights TO service_role;
GRANT ALL ON public.asset_workflows TO service_role;
GRANT ALL ON public.asset_analytics TO service_role;
