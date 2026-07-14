-- Create a table for AI models configuration
CREATE TABLE ai_models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  provider VARCHAR(100) NOT NULL,
  model_id VARCHAR(255) NOT NULL,
  description TEXT,
  capabilities JSONB DEFAULT '[]',
  parameters JSONB DEFAULT '{}',
  cost_per_1k_tokens DECIMAL(10, 6),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a table for AI agents
CREATE TABLE ai_agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  system_prompt TEXT,
  model_id UUID REFERENCES ai_models(id),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  parameters JSONB DEFAULT '{}',
  tools JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a table for data embeddings
CREATE TABLE data_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  source_type VARCHAR(100) NOT NULL,
  source_id VARCHAR(255),
  embedding_model VARCHAR(255) NOT NULL,
  vector_data VECTOR(1536),
  metadata JSONB DEFAULT '{}',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a table for supply chain data
CREATE TABLE supply_chain_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  data_type VARCHAR(100) NOT NULL,
  data JSONB NOT NULL,
  metadata JSONB DEFAULT '{}',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a table for reusable packages (referenced in the requirements)
CREATE TABLE reusable_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  package_id VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  dimensions JSONB NOT NULL,
  weight_capacity DECIMAL(10, 2) NOT NULL,
  material VARCHAR(100),
  reuse_count INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'available',
  location_id VARCHAR(255),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a table for shipping data (referenced in the requirements)
CREATE TABLE shipping (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tracking_number VARCHAR(255) NOT NULL UNIQUE,
  origin_address JSONB NOT NULL,
  destination_address JSONB NOT NULL,
  package_ids JSONB DEFAULT '[]',
  carrier VARCHAR(100),
  shipping_date TIMESTAMP WITH TIME ZONE,
  estimated_delivery TIMESTAMP WITH TIME ZONE,
  actual_delivery TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'pending',
  cost DECIMAL(10, 2),
  weight DECIMAL(10, 2),
  dimensions JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a table for AI analysis results
CREATE TABLE ai_analysis_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_type VARCHAR(100) NOT NULL,
  source_type VARCHAR(100) NOT NULL,
  source_id UUID NOT NULL,
  agent_id UUID REFERENCES ai_agents(id),
  results JSONB NOT NULL,
  metadata JSONB DEFAULT '{}',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a table for AI workflows
CREATE TABLE ai_workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  steps JSONB NOT NULL,
  trigger_type VARCHAR(100),
  trigger_config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a table for AI workflow runs
CREATE TABLE ai_workflow_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID REFERENCES ai_workflows(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending',
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  results JSONB DEFAULT '{}',
  error TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a table for developer tools configurations
CREATE TABLE developer_tools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  tool_type VARCHAR(100) NOT NULL,
  configuration JSONB NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_ai_models_provider ON ai_models(provider);
CREATE INDEX idx_ai_agents_user_id ON ai_agents(user_id);
CREATE INDEX idx_data_embeddings_user_id ON data_embeddings(user_id);
CREATE INDEX idx_supply_chain_data_user_id ON supply_chain_data(user_id);
CREATE INDEX idx_reusable_packages_status ON reusable_packages(status);
CREATE INDEX idx_shipping_status ON shipping(status);
CREATE INDEX idx_ai_analysis_results_user_id ON ai_analysis_results(user_id);
CREATE INDEX idx_ai_workflows_user_id ON ai_workflows(user_id);
CREATE INDEX idx_developer_tools_user_id ON developer_tools(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE ai_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE supply_chain_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE reusable_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_workflow_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE developer_tools ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own data" ON ai_agents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own data" ON ai_agents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own data" ON ai_agents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own data" ON ai_agents FOR DELETE USING (auth.uid() = user_id);

-- Repeat similar policies for other tables
CREATE POLICY "Users can view their own data" ON data_embeddings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own data" ON data_embeddings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own data" ON data_embeddings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own data" ON data_embeddings FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own data" ON supply_chain_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own data" ON supply_chain_data FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own data" ON supply_chain_data FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own data" ON supply_chain_data FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own data" ON ai_analysis_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own data" ON ai_analysis_results FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own data" ON ai_analysis_results FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own data" ON ai_analysis_results FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own data" ON ai_workflows FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own data" ON ai_workflows FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own data" ON ai_workflows FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own data" ON ai_workflows FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own data" ON ai_workflow_runs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own data" ON ai_workflow_runs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own data" ON ai_workflow_runs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own data" ON ai_workflow_runs FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own data" ON developer_tools FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own data" ON developer_tools FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own data" ON developer_tools FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own data" ON developer_tools FOR DELETE USING (auth.uid() = user_id);

-- Public tables can be viewed by anyone but only modified by admins
CREATE POLICY "Anyone can view AI models" ON ai_models FOR SELECT USING (true);
CREATE POLICY "Only admins can modify AI models" ON ai_models FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users));
CREATE POLICY "Only admins can modify AI models" ON ai_models FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM admin_users));
CREATE POLICY "Only admins can modify AI models" ON ai_models FOR DELETE USING (auth.uid() IN (SELECT user_id FROM admin_users));

-- Create a view for shipping analytics
CREATE VIEW shipping_analytics AS
SELECT 
  DATE_TRUNC('day', shipping_date) AS shipping_day,
  COUNT(*) AS total_shipments,
  AVG(EXTRACT(EPOCH FROM (estimated_delivery - shipping_date))/86400) AS avg_estimated_delivery_days,
  AVG(EXTRACT(EPOCH FROM (actual_delivery - shipping_date))/86400) AS avg_actual_delivery_days,
  SUM(cost) AS total_cost,
  AVG(cost) AS avg_cost,
  SUM(weight) AS total_weight,
  AVG(weight) AS avg_weight,
  COUNT(CASE WHEN status = 'delivered' THEN 1 END) AS delivered_count,
  COUNT(CASE WHEN status = 'in_transit' THEN 1 END) AS in_transit_count,
  COUNT(CASE WHEN status = 'delayed' THEN 1 END) AS delayed_count
FROM shipping
GROUP BY DATE_TRUNC('day', shipping_date)
ORDER BY shipping_day DESC;

-- Create a view for package utilization
CREATE VIEW package_utilization AS
SELECT 
  p.id,
  p.package_id,
  p.name,
  p.reuse_count,
  p.status,
  COUNT(s.id) AS shipment_count,
  MAX(s.shipping_date) AS last_used_date,
  p.created_at,
  EXTRACT(EPOCH FROM (NOW() - p.created_at))/86400 AS days_since_creation,
  CASE WHEN p.reuse_count > 0 THEN p.reuse_count / (EXTRACT(EPOCH FROM (NOW() - p.created_at))/86400) ELSE 0 END AS reuses_per_day
FROM reusable_packages p
LEFT JOIN shipping s ON p.id::text = ANY(ARRAY(SELECT jsonb_array_elements_text(s.package_ids)))
GROUP BY p.id, p.package_id, p.name, p.reuse_count, p.status, p.created_at;

-- Seed data for AI models
INSERT INTO ai_models (name, provider, model_id, description, capabilities, parameters, cost_per_1k_tokens, is_active)
VALUES
  ('GPT-4o', 'openai', 'gpt-4o', 'OpenAI''s most advanced model with vision capabilities', '["text", "vision", "reasoning", "coding"]', '{"temperature": 0.7, "max_tokens": 4096}', 0.01, true),
  ('GPT-4 Turbo', 'openai', 'gpt-4-turbo-preview', 'OpenAI''s high-performance model with extended context', '["text", "reasoning", "coding"]', '{"temperature": 0.7, "max_tokens": 4096}', 0.01, true),
  ('GPT-3.5 Turbo', 'openai', 'gpt-3.5-turbo', 'OpenAI''s efficient model for most tasks', '["text", "reasoning", "coding"]', '{"temperature": 0.7, "max_tokens": 4096}', 0.002, true),
  ('Claude 3 Opus', 'anthropic', 'claude-3-opus-20240229', 'Anthropic''s most capable model', '["text", "vision", "reasoning", "coding"]', '{"temperature": 0.7, "max_tokens": 4096}', 0.015, true),
  ('Claude 3 Sonnet', 'anthropic', 'claude-3-sonnet-20240229', 'Anthropic''s balanced model', '["text", "vision", "reasoning", "coding"]', '{"temperature": 0.7, "max_tokens": 4096}', 0.003, true),
  ('Claude 3 Haiku', 'anthropic', 'claude-3-haiku-20240307', 'Anthropic''s fastest model', '["text", "vision", "reasoning", "coding"]', '{"temperature": 0.7, "max_tokens": 4096}', 0.00025, true),
  ('Llama 3 70B', 'meta', 'meta/llama-3-70b-instruct', 'Meta''s largest open model', '["text", "reasoning", "coding"]', '{"temperature": 0.7, "max_tokens": 4096}', 0.0, true),
  ('Llama 3 8B', 'meta', 'meta/llama-3-8b-instruct', 'Meta''s efficient open model', '["text", "reasoning", "coding"]', '{"temperature": 0.7, "max_tokens": 4096}', 0.0, true),
  ('Mistral Large', 'mistral', 'mistral-large-latest', 'Mistral''s most capable model', '["text", "reasoning", "coding"]', '{"temperature": 0.7, "max_tokens": 4096}', 0.008, true),
  ('Mistral Medium', 'mistral', 'mistral-medium-latest', 'Mistral''s balanced model', '["text", "reasoning", "coding"]', '{"temperature": 0.7, "max_tokens": 4096}', 0.003, true),
  ('Mistral Small', 'mistral', 'mistral-small-latest', 'Mistral''s efficient model', '["text", "reasoning", "coding"]', '{"temperature": 0.7, "max_tokens": 4096}', 0.0006, true),
  ('Gemini 1.5 Pro', 'google', 'gemini-1.5-pro', 'Google''s advanced model with long context', '["text", "vision", "reasoning", "coding"]', '{"temperature": 0.7, "max_tokens": 8192}', 0.0035, true),
  ('Gemini 1.5 Flash', 'google', 'gemini-1.5-flash', 'Google''s efficient model', '["text", "vision", "reasoning", "coding"]', '{"temperature": 0.7, "max_tokens": 8192}', 0.0007, true),
  ('DALL-E 3', 'openai', 'dall-e-3', 'OpenAI''s image generation model', '["image_generation"]', '{"quality": "hd", "style": "vivid", "size": "1024x1024"}', 0.04, true),
  ('Stable Diffusion XL', 'stability', 'stable-diffusion-xl', 'Stability AI''s image generation model', '["image_generation"]', '{"steps": 30, "cfg_scale": 7.5}', 0.002, true);
