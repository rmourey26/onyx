-- Create asset agent configurations table
CREATE TABLE IF NOT EXISTS public.asset_agent_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  template_id text NOT NULL,
  target_assets jsonb NOT NULL DEFAULT '[]'::jsonb,
  auto_insights boolean DEFAULT true,
  notification_threshold text NOT NULL DEFAULT 'medium' CHECK (notification_threshold IN ('low', 'medium', 'high')),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(agent_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_asset_agent_configs_agent_id ON public.asset_agent_configs(agent_id);
CREATE INDEX IF NOT EXISTS idx_asset_agent_configs_user_id ON public.asset_agent_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_asset_agent_configs_template_id ON public.asset_agent_configs(template_id);

-- Enable RLS
ALTER TABLE public.asset_agent_configs ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Users can manage their own asset agent configs" ON public.asset_agent_configs
  FOR ALL USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_asset_agent_configs_updated_at
  BEFORE UPDATE ON public.asset_agent_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_assets_updated_at();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.asset_agent_configs TO authenticated;
GRANT ALL ON public.asset_agent_configs TO service_role;
