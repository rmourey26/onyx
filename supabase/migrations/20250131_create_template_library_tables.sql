-- Create tables to store system AI Agent and Workflow templates
-- This distinguishes our library of templates from user's deployed instances

-- Template Categories table for organizing templates
CREATE TABLE IF NOT EXISTS template_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System Agent Templates table (library of predefined templates)
CREATE TABLE IF NOT EXISTS system_agent_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id VARCHAR(255) NOT NULL UNIQUE, -- matches the id from agent-templates.ts
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(50) NOT NULL,
  system_prompt TEXT NOT NULL,
  tools JSONB NOT NULL DEFAULT '[]',
  parameters JSONB NOT NULL DEFAULT '{}',
  category VARCHAR(100) NOT NULL,
  tags TEXT[] DEFAULT '{}',
  difficulty VARCHAR(20) DEFAULT 'beginner', -- beginner, intermediate, advanced
  estimated_setup_time INTEGER, -- in minutes
  use_cases TEXT[],
  version VARCHAR(20) DEFAULT '1.0.0',
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (category) REFERENCES template_categories(name) ON UPDATE CASCADE
);

-- System Workflow Templates table (library of predefined workflows)
CREATE TABLE IF NOT EXISTS system_workflow_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id VARCHAR(255) NOT NULL UNIQUE, -- matches the id from workflow-templates.ts
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  icon VARCHAR(50),
  steps JSONB NOT NULL DEFAULT '[]',
  trigger_type VARCHAR(100),
  trigger_config JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  difficulty VARCHAR(20) DEFAULT 'beginner',
  estimated_time INTEGER, -- in minutes
  prerequisites TEXT[],
  expected_outcomes TEXT[],
  version VARCHAR(20) DEFAULT '1.0.0',
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (category) REFERENCES template_categories(name) ON UPDATE CASCADE
);

-- Template Usage Analytics table
CREATE TABLE IF NOT EXISTS template_usage_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_type VARCHAR(20) NOT NULL, -- 'agent' or 'workflow'
  template_id VARCHAR(255) NOT NULL,
  user_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL, -- 'viewed', 'used', 'deployed', 'customized'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_system_agent_templates_category ON system_agent_templates(category);
CREATE INDEX IF NOT EXISTS idx_system_agent_templates_active ON system_agent_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_system_agent_templates_featured ON system_agent_templates(is_featured);
CREATE INDEX IF NOT EXISTS idx_system_workflow_templates_category ON system_workflow_templates(category);
CREATE INDEX IF NOT EXISTS idx_system_workflow_templates_active ON system_workflow_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_template_usage_analytics_user ON template_usage_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_template_usage_analytics_template ON template_usage_analytics(template_type, template_id);

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_template_categories_updated_at BEFORE UPDATE ON template_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_agent_templates_updated_at BEFORE UPDATE ON system_agent_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_workflow_templates_updated_at BEFORE UPDATE ON system_workflow_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert template categories
INSERT INTO template_categories (name, display_name, description, icon, sort_order) VALUES
('general', 'General', 'General-purpose AI agents for various tasks', 'bot', 1),
('data', 'Data & Analytics', 'Agents specialized in data analysis and insights', 'bar-chart', 2),
('blockchain', 'Blockchain', 'Agents for blockchain analysis and operations', 'blocks', 3),
('supply-chain', 'Supply Chain', 'Logistics and supply chain optimization agents', 'truck', 4),
('developer', 'Developer Tools', 'Agents for software development and coding', 'code', 5),
('business', 'Business Strategy', 'Agents for business analysis and strategy', 'briefcase', 6),
('integration', 'Integration', 'Agents for system integration and automation', 'git-branch', 7),
('analytics', 'Analytics', 'Advanced analytics and reporting agents', 'pie-chart', 8),
('marketing', 'Marketing', 'Marketing and customer engagement agents', 'megaphone', 9),
('smart-contracts', 'Smart Contracts', 'Smart contract analysis and security agents', 'shield', 10),
('quality', 'Quality Management', 'Quality assurance and compliance agents', 'check-circle', 11),
('healthcare', 'Healthcare', 'Healthcare and medical assistance agents', 'stethoscope', 12),
('pharmaceuticals', 'Pharmaceuticals', 'Pharmaceutical research and development agents', 'flask', 13),
('data-center', 'Data Center', 'Data center optimization and management agents', 'server', 14),
('asset-intelligence', 'Asset Intelligence', 'Asset management and optimization agents', 'package', 15)
ON CONFLICT (name) DO NOTHING;

-- Insert workflow categories
INSERT INTO template_categories (name, display_name, description, icon, sort_order) VALUES
('agentic-ai', 'Agentic AI', 'AI-powered autonomous workflow templates', 'bot', 20),
('iot-devices', 'IoT Devices', 'Internet of Things device management workflows', 'wifi', 21),
('robotics', 'Robotics', 'Robotic process automation workflows', 'cpu', 22),
('autonomous-vehicles', 'Autonomous Vehicles', 'Self-driving vehicle management workflows', 'car', 23),
('drones', 'Drones', 'Drone operation and management workflows', 'plane', 24),
('rwa-tokenization', 'RWA Tokenization', 'Real-world asset tokenization workflows', 'coins', 25),
('medical-devices', 'Medical Devices', 'Healthcare device management workflows', 'heart', 26),
('product-lifecycle', 'Product Lifecycle', 'Product lifecycle management workflows', 'package', 27),
('scientific-rd', 'Scientific R&D', 'Research and development workflows', 'microscope', 28),
('business-operations', 'Business Operations', 'General business operation workflows', 'building', 29)
ON CONFLICT (name) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE template_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_agent_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_usage_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for template categories (public read)
CREATE POLICY "Template categories are viewable by everyone" ON template_categories
  FOR SELECT USING (true);

-- Create policies for system agent templates (public read)
CREATE POLICY "System agent templates are viewable by everyone" ON system_agent_templates
  FOR SELECT USING (is_active = true);

-- Create policies for system workflow templates (public read)
CREATE POLICY "System workflow templates are viewable by everyone" ON system_workflow_templates
  FOR SELECT USING (is_active = true);

-- Create policies for template usage analytics (user-specific)
CREATE POLICY "Users can view their own template usage" ON template_usage_analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own template usage" ON template_usage_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add helpful comments
COMMENT ON TABLE template_categories IS 'Categories for organizing AI agent and workflow templates';
COMMENT ON TABLE system_agent_templates IS 'Library of predefined AI agent templates available to all users';
COMMENT ON TABLE system_workflow_templates IS 'Library of predefined workflow templates available to all users';
COMMENT ON TABLE template_usage_analytics IS 'Analytics tracking for template usage and adoption';

COMMENT ON COLUMN system_agent_templates.template_id IS 'Unique identifier matching the template ID in code';
COMMENT ON COLUMN system_agent_templates.difficulty IS 'Template complexity: beginner, intermediate, advanced';
COMMENT ON COLUMN system_agent_templates.estimated_setup_time IS 'Expected time to configure in minutes';
COMMENT ON COLUMN system_workflow_templates.estimated_time IS 'Expected workflow execution time in minutes';
