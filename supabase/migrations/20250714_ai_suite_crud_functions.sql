-- =====================================================
-- AI Suite CRUD Functions with Webhook Integration
-- Simple database operations that complement AgentSystem and WorkflowSystem
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_net";

-- =====================================================
-- AGENT CRUD FUNCTIONS
-- =====================================================

-- Create Agent (Simple INSERT with webhook trigger)
CREATE OR REPLACE FUNCTION create_agent(
  p_user_id UUID,
  p_name TEXT,
  p_description TEXT DEFAULT NULL,
  p_model TEXT DEFAULT 'gemini-3-pro-20251115', -- Updated to Gemini 3 Pro (most capable model)
  p_system_prompt TEXT DEFAULT NULL,
  p_tools JSONB DEFAULT '[]'::jsonb,
  p_temperature NUMERIC DEFAULT 0.7,
  p_max_tokens INTEGER DEFAULT 2000,
  p_data_sources JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_agent_id UUID;
  v_agent JSONB;
BEGIN
  -- Insert agent
  INSERT INTO ai_agents (
    user_id,
    name,
    description,
    model,
    system_prompt,
    tools,
    temperature,
    max_tokens,
    data_sources,
    is_active
  ) VALUES (
    p_user_id,
    p_name,
    p_description,
    p_model,
    p_system_prompt,
    p_tools,
    p_temperature,
    p_max_tokens,
    p_data_sources,
    true
  )
  RETURNING id INTO v_agent_id;

  -- Trigger webhook
  PERFORM trigger_webhook(
    p_user_id,
    'agent.created',
    jsonb_build_object(
      'agent_id', v_agent_id,
      'name', p_name,
      'model', p_model
    )
  );

  -- Return created agent
  SELECT to_jsonb(a.*) INTO v_agent
  FROM ai_agents a
  WHERE a.id = v_agent_id;

  RETURN v_agent;
END;
$$;

-- Update Agent (Simple UPDATE with webhook trigger)
CREATE OR REPLACE FUNCTION update_agent(
  p_agent_id UUID,
  p_user_id UUID,
  p_name TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_model TEXT DEFAULT NULL,
  p_system_prompt TEXT DEFAULT NULL,
  p_tools JSONB DEFAULT NULL,
  p_temperature NUMERIC DEFAULT NULL,
  p_max_tokens INTEGER DEFAULT NULL,
  p_data_sources JSONB DEFAULT NULL,
  p_is_active BOOLEAN DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_agent JSONB;
BEGIN
  -- Check ownership
  IF NOT EXISTS (
    SELECT 1 FROM ai_agents 
    WHERE id = p_agent_id AND user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'Agent not found or access denied';
  END IF;

  -- Update agent (only non-null fields)
  UPDATE ai_agents
  SET
    name = COALESCE(p_name, name),
    description = COALESCE(p_description, description),
    model = COALESCE(p_model, model),
    system_prompt = COALESCE(p_system_prompt, system_prompt),
    tools = COALESCE(p_tools, tools),
    temperature = COALESCE(p_temperature, temperature),
    max_tokens = COALESCE(p_max_tokens, max_tokens),
    data_sources = COALESCE(p_data_sources, data_sources),
    is_active = COALESCE(p_is_active, is_active),
    updated_at = NOW()
  WHERE id = p_agent_id;

  -- Trigger webhook
  PERFORM trigger_webhook(
    p_user_id,
    'agent.updated',
    jsonb_build_object(
      'agent_id', p_agent_id,
      'name', p_name
    )
  );

  -- Return updated agent
  SELECT to_jsonb(a.*) INTO v_agent
  FROM ai_agents a
  WHERE a.id = p_agent_id;

  RETURN v_agent;
END;
$$;

-- Delete Agent (Simple DELETE with webhook trigger)
CREATE OR REPLACE FUNCTION delete_agent(
  p_agent_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_agent_name TEXT;
BEGIN
  -- Check ownership and get name
  SELECT name INTO v_agent_name
  FROM ai_agents 
  WHERE id = p_agent_id AND user_id = p_user_id;

  IF v_agent_name IS NULL THEN
    RAISE EXCEPTION 'Agent not found or access denied';
  END IF;

  -- Delete agent
  DELETE FROM ai_agents
  WHERE id = p_agent_id AND user_id = p_user_id;

  -- Trigger webhook
  PERFORM trigger_webhook(
    p_user_id,
    'agent.deleted',
    jsonb_build_object(
      'agent_id', p_agent_id,
      'name', v_agent_name
    )
  );

  RETURN true;
END;
$$;

-- =====================================================
-- WORKFLOW CRUD FUNCTIONS
-- =====================================================

-- Create Workflow (Simple INSERT with webhook trigger)
CREATE OR REPLACE FUNCTION create_workflow(
  p_user_id UUID,
  p_name TEXT,
  p_description TEXT DEFAULT NULL,
  p_steps JSONB DEFAULT '[]'::jsonb,
  p_trigger_type TEXT DEFAULT NULL,
  p_trigger_config JSONB DEFAULT '{}'::jsonb,
  p_ai_model TEXT DEFAULT 'gemini-3-pro-20251115' -- Updated to Gemini 3 Pro (most capable model)
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_workflow_id UUID;
  v_workflow JSONB;
BEGIN
  -- Insert workflow
  INSERT INTO ai_workflows (
    user_id,
    name,
    description,
    steps,
    trigger_type,
    trigger_config,
    ai_model, -- Added ai_model column
    is_active
  ) VALUES (
    p_user_id,
    p_name,
    p_description,
    p_steps,
    p_trigger_type,
    p_trigger_config,
    p_ai_model, -- Pass ai_model value
    true
  )
  RETURNING id INTO v_workflow_id;

  -- Trigger webhook
  PERFORM trigger_webhook(
    p_user_id,
    'workflow.created',
    jsonb_build_object(
      'workflow_id', v_workflow_id,
      'name', p_name,
      'ai_model', p_ai_model -- Include ai_model in webhook
    )
  );

  -- Return created workflow
  SELECT to_jsonb(w.*) INTO v_workflow
  FROM ai_workflows w
  WHERE w.id = v_workflow_id;

  RETURN v_workflow;
END;
$$;

-- Update Workflow (Simple UPDATE with webhook trigger)
CREATE OR REPLACE FUNCTION update_workflow(
  p_workflow_id UUID,
  p_user_id UUID,
  p_name TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_steps JSONB DEFAULT NULL,
  p_trigger_type TEXT DEFAULT NULL,
  p_trigger_config JSONB DEFAULT NULL,
  p_ai_model TEXT DEFAULT NULL, -- Added ai_model parameter
  p_is_active BOOLEAN DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_workflow JSONB;
BEGIN
  -- Check ownership
  IF NOT EXISTS (
    SELECT 1 FROM ai_workflows 
    WHERE id = p_workflow_id AND user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'Workflow not found or access denied';
  END IF;

  -- Update workflow (only non-null fields)
  UPDATE ai_workflows
  SET
    name = COALESCE(p_name, name),
    description = COALESCE(p_description, description),
    steps = COALESCE(p_steps, steps),
    trigger_type = COALESCE(p_trigger_type, trigger_type),
    trigger_config = COALESCE(p_trigger_config, trigger_config),
    ai_model = COALESCE(p_ai_model, ai_model), -- Update ai_model if provided
    is_active = COALESCE(p_is_active, is_active),
    updated_at = NOW()
  WHERE id = p_workflow_id;

  -- Trigger webhook
  PERFORM trigger_webhook(
    p_user_id,
    'workflow.updated',
    jsonb_build_object(
      'workflow_id', p_workflow_id,
      'name', p_name,
      'ai_model', p_ai_model -- Include ai_model in webhook
    )
  );

  -- Return updated workflow
  SELECT to_jsonb(w.*) INTO v_workflow
  FROM ai_workflows w
  WHERE w.id = p_workflow_id;

  RETURN v_workflow;
END;
$$;

-- Delete Workflow (Simple DELETE with webhook trigger)
CREATE OR REPLACE FUNCTION delete_workflow(
  p_workflow_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_workflow_name TEXT;
BEGIN
  -- Check ownership and get name
  SELECT name INTO v_workflow_name
  FROM ai_workflows 
  WHERE id = p_workflow_id AND user_id = p_user_id;

  IF v_workflow_name IS NULL THEN
    RAISE EXCEPTION 'Workflow not found or access denied';
  END IF;

  -- Delete workflow
  DELETE FROM ai_workflows
  WHERE id = p_workflow_id AND user_id = p_user_id;

  -- Trigger webhook
  PERFORM trigger_webhook(
    p_user_id,
    'workflow.deleted',
    jsonb_build_object(
      'workflow_id', p_workflow_id,
      'name', v_workflow_name
    )
  );

  RETURN true;
END;
$$;

-- =====================================================
-- EXECUTION LOG FUNCTIONS
-- =====================================================

-- Log Agent Execution (Called from Edge Function)
CREATE OR REPLACE FUNCTION log_agent_execution(
  p_agent_id UUID,
  p_user_id UUID,
  p_status TEXT,
  p_input TEXT,
  p_output TEXT DEFAULT NULL,
  p_error TEXT DEFAULT NULL,
  p_execution_time INTEGER DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO agent_execution_logs (
    agent_id,
    user_id,
    status,
    input,
    output,
    error,
    execution_time,
    created_at
  ) VALUES (
    p_agent_id,
    p_user_id,
    p_status,
    p_input,
    p_output,
    p_error,
    p_execution_time,
    NOW()
  )
  RETURNING id INTO v_log_id;

  -- Trigger webhook for completed/failed executions
  IF p_status IN ('completed', 'failed') THEN
    PERFORM trigger_webhook(
      p_user_id,
      'agent.executed',
      jsonb_build_object(
        'agent_id', p_agent_id,
        'log_id', v_log_id,
        'status', p_status,
        'execution_time', p_execution_time
      )
    );
  END IF;

  RETURN v_log_id;
END;
$$;

-- Log Workflow Execution (Called from Edge Function)
CREATE OR REPLACE FUNCTION log_workflow_execution(
  p_workflow_id UUID,
  p_user_id UUID,
  p_status TEXT,
  p_input JSONB DEFAULT '{}'::jsonb,
  p_output JSONB DEFAULT NULL,
  p_error TEXT DEFAULT NULL,
  p_execution_time INTEGER DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO workflow_execution_logs (
    workflow_id,
    user_id,
    status,
    input,
    output,
    error,
    execution_time,
    created_at
  ) VALUES (
    p_workflow_id,
    p_user_id,
    p_status,
    p_input,
    p_output,
    p_error,
    p_execution_time,
    NOW()
  )
  RETURNING id INTO v_log_id;

  -- Trigger webhook for completed/failed executions
  IF p_status IN ('completed', 'failed') THEN
    PERFORM trigger_webhook(
      p_user_id,
      'workflow.executed',
      jsonb_build_object(
        'workflow_id', p_workflow_id,
        'log_id', v_log_id,
        'status', p_status,
        'execution_time', p_execution_time
      )
    );
  END IF;

  RETURN v_log_id;
END;
$$;

-- =====================================================
-- QUERY FUNCTIONS
-- =====================================================

-- Get Agent Execution History
CREATE OR REPLACE FUNCTION get_agent_execution_history(
  p_agent_id UUID,
  p_user_id UUID,
  p_limit INTEGER DEFAULT 50
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_logs JSONB;
BEGIN
  -- Verify ownership
  IF NOT EXISTS (
    SELECT 1 FROM ai_agents 
    WHERE id = p_agent_id AND user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'Agent not found or access denied';
  END IF;

  -- Get execution logs
  SELECT jsonb_agg(to_jsonb(l.*) ORDER BY l.created_at DESC)
  INTO v_logs
  FROM (
    SELECT * FROM agent_execution_logs
    WHERE agent_id = p_agent_id
    ORDER BY created_at DESC
    LIMIT p_limit
  ) l;

  RETURN COALESCE(v_logs, '[]'::jsonb);
END;
$$;

-- Get Workflow Execution History
CREATE OR REPLACE FUNCTION get_workflow_execution_history(
  p_workflow_id UUID,
  p_user_id UUID,
  p_limit INTEGER DEFAULT 50
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_logs JSONB;
BEGIN
  -- Verify ownership
  IF NOT EXISTS (
    SELECT 1 FROM ai_workflows 
    WHERE id = p_workflow_id AND user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'Workflow not found or access denied';
  END IF;

  -- Get execution logs
  SELECT jsonb_agg(to_jsonb(l.*) ORDER BY l.created_at DESC)
  INTO v_logs
  FROM (
    SELECT * FROM workflow_execution_logs
    WHERE workflow_id = p_workflow_id
    ORDER BY created_at DESC
    LIMIT p_limit
  ) l;

  RETURN COALESCE(v_logs, '[]'::jsonb);
END;
$$;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION create_agent TO authenticated;
GRANT EXECUTE ON FUNCTION update_agent TO authenticated;
GRANT EXECUTE ON FUNCTION delete_agent TO authenticated;
GRANT EXECUTE ON FUNCTION create_workflow TO authenticated;
GRANT EXECUTE ON FUNCTION update_workflow TO authenticated;
GRANT EXECUTE ON FUNCTION delete_workflow TO authenticated;
GRANT EXECUTE ON FUNCTION log_agent_execution TO authenticated;
GRANT EXECUTE ON FUNCTION log_workflow_execution TO authenticated;
GRANT EXECUTE ON FUNCTION get_agent_execution_history TO authenticated;
GRANT EXECUTE ON FUNCTION get_workflow_execution_history TO authenticated;
