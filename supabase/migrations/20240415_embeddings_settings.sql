-- Create table for user settings
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  settings_type TEXT NOT NULL,
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, settings_type)
);

-- Create table for AI agent settings
CREATE TABLE IF NOT EXISTS ai_agent_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
  settings_type TEXT NOT NULL,
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(agent_id, settings_type)
);

-- Create function to append a tool to an array if it doesn't exist
CREATE OR REPLACE FUNCTION append_tool_if_not_exists(agent_tools JSONB, new_tool JSONB)
RETURNS JSONB AS $$
DECLARE
  tool_exists BOOLEAN;
BEGIN
  -- Check if a tool with the same type already exists
  SELECT EXISTS (
    SELECT 1 FROM jsonb_array_elements(agent_tools) AS tool
    WHERE tool->>'type' = new_tool->>'type'
  ) INTO tool_exists;
  
  -- If the tool doesn't exist, append it to the array
  IF NOT tool_exists THEN
    RETURN agent_tools || new_tool;
  ELSE
    RETURN agent_tools;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create RLS policies
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agent_settings ENABLE ROW LEVEL SECURITY;

-- Policy for user_settings
CREATE POLICY user_settings_policy ON user_settings
  USING (auth.uid() = user_id);

-- Policy for ai_agent_settings
CREATE POLICY ai_agent_settings_policy ON ai_agent_settings
  USING (auth.uid() = user_id);
