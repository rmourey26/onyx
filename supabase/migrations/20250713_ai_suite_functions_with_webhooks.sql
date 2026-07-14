-- AI Suite Functions with Webhook Integration
-- This migration creates database functions for AI agent and workflow management
-- with integrated webhook notifications

-- ============================================================================
-- AGENT MANAGEMENT FUNCTIONS
-- ============================================================================

-- Function: Create AI Agent
CREATE OR REPLACE FUNCTION create_ai_agent(
  p_user_id UUID,
  p_name VARCHAR(255),
  p_description TEXT DEFAULT NULL,
  p_system_prompt TEXT DEFAULT NULL,
  p_model_id UUID DEFAULT NULL,
  p_parameters JSONB DEFAULT '{}',
  p_tools JSONB DEFAULT '[]',
  p_temperature DECIMAL DEFAULT 0.7,
  p_max_tokens INTEGER DEFAULT 4096
)
RETURNS TABLE(
  id UUID,
  name VARCHAR(255),
  description TEXT,
  created_at TIMESTAMPTZ
) AS $$
DECLARE
  v_agent_id UUID;
  v_created_at TIMESTAMPTZ;
BEGIN
  -- Insert the new agent
  INSERT INTO ai_agents (
    user_id,
    name,
    description,
    system_prompt,
    model_id,
    parameters,
    tools,
    temperature,
    max_tokens,
    is_active
  ) VALUES (
    p_user_id,
    p_name,
    p_description,
    p_system_prompt,
    p_model_id,
    p_parameters,
    p_tools,
    p_temperature,
    p_max_tokens,
    true
  )
  RETURNING ai_agents.id, ai_agents.created_at INTO v_agent_id, v_created_at;

  -- Trigger webhooks for 'agent.created' event
  PERFORM trigger_webhooks(
    p_user_id,
    'agent.created',
    jsonb_build_object(
      'agent_id', v_agent_id,
      'name', p_name,
      'description', p_description,
      'created_at', v_created_at
    )
  );

  -- Return the created agent
  RETURN QUERY
  SELECT v_agent_id, p_name, p_description, v_created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Update AI Agent
CREATE OR REPLACE FUNCTION update_ai_agent(
  p_agent_id UUID,
  p_user_id UUID,
  p_name VARCHAR(255) DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_system_prompt TEXT DEFAULT NULL,
  p_model_id UUID DEFAULT NULL,
  p_parameters JSONB DEFAULT NULL,
  p_tools JSONB DEFAULT NULL,
  p_temperature DECIMAL DEFAULT NULL,
  p_max_tokens INTEGER DEFAULT NULL,
  p_is_active BOOLEAN DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  name VARCHAR(255),
  updated_at TIMESTAMPTZ
) AS $$
DECLARE
  v_updated_at TIMESTAMPTZ;
  v_name VARCHAR(255);
BEGIN
  -- Update the agent
  UPDATE ai_agents
  SET
    name = COALESCE(p_name, ai_agents.name),
    description = COALESCE(p_description, ai_agents.description),
    system_prompt = COALESCE(p_system_prompt, ai_agents.system_prompt),
    model_id = COALESCE(p_model_id, ai_agents.model_id),
    parameters = COALESCE(p_parameters, ai_agents.parameters),
    tools = COALESCE(p_tools, ai_agents.tools),
    temperature = COALESCE(p_temperature, ai_agents.temperature),
    max_tokens = COALESCE(p_max_tokens, ai_agents.max_tokens),
    is_active = COALESCE(p_is_active, ai_agents.is_active),
    updated_at = NOW()
  WHERE ai_agents.id = p_agent_id
    AND ai_agents.user_id = p_user_id
  RETURNING ai_agents.name, ai_agents.updated_at INTO v_name, v_updated_at;

  -- Trigger webhooks for 'agent.updated' event
  PERFORM trigger_webhooks(
    p_user_id,
    'agent.updated',
    jsonb_build_object(
      'agent_id', p_agent_id,
      'name', v_name,
      'updated_at', v_updated_at
    )
  );

  -- Return the updated agent
  RETURN QUERY
  SELECT p_agent_id, v_name, v_updated_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Delete AI Agent
CREATE OR REPLACE FUNCTION delete_ai_agent(
  p_agent_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_name VARCHAR(255);
  v_deleted BOOLEAN := false;
BEGIN
  -- Get agent name before deletion
  SELECT name INTO v_name
  FROM ai_agents
  WHERE id = p_agent_id AND user_id = p_user_id;

  -- Delete the agent
  DELETE FROM ai_agents
  WHERE id = p_agent_id
    AND user_id = p_user_id;

  GET DIAGNOSTICS v_deleted = ROW_COUNT;

  -- Trigger webhooks for 'agent.deleted' event if deletion was successful
  IF v_deleted THEN
    PERFORM trigger_webhooks(
      p_user_id,
      'agent.deleted',
      jsonb_build_object(
        'agent_id', p_agent_id,
        'name', v_name,
        'deleted_at', NOW()
      )
    );
  END IF;

  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Execute AI Agent
CREATE OR REPLACE FUNCTION execute_ai_agent(
  p_agent_id UUID,
  p_user_id UUID,
  p_prompt TEXT,
  p_context JSONB DEFAULT '{}'
)
RETURNS TABLE(
  execution_id UUID,
  status VARCHAR(50),
  started_at TIMESTAMPTZ
) AS $$
DECLARE
  v_execution_id UUID;
  v_started_at TIMESTAMPTZ := NOW();
BEGIN
  -- Create execution record in ai_analysis_results
  INSERT INTO ai_analysis_results (
    analysis_type,
    source_type,
    source_id,
    agent_id,
    user_id,
    results,
    metadata
  ) VALUES (
    'agent_execution',
    'prompt',
    gen_random_uuid(),
    p_agent_id,
    p_user_id,
    jsonb_build_object(
      'prompt', p_prompt,
      'status', 'pending',
      'started_at', v_started_at
    ),
    p_context
  )
  RETURNING ai_analysis_results.id INTO v_execution_id;

  -- Trigger webhooks for 'agent.executed' event
  PERFORM trigger_webhooks(
    p_user_id,
    'agent.executed',
    jsonb_build_object(
      'agent_id', p_agent_id,
      'execution_id', v_execution_id,
      'prompt', p_prompt,
      'context', p_context,
      'started_at', v_started_at
    )
  );

  -- Return execution info
  RETURN QUERY
  SELECT v_execution_id, 'pending'::VARCHAR(50), v_started_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- WORKFLOW MANAGEMENT FUNCTIONS
-- ============================================================================

-- Function: Create AI Workflow
CREATE OR REPLACE FUNCTION create_ai_workflow(
  p_user_id UUID,
  p_name VARCHAR(255),
  p_description TEXT DEFAULT NULL,
  p_steps JSONB,
  p_trigger_type VARCHAR(100) DEFAULT NULL,
  p_trigger_config JSONB DEFAULT '{}'
)
RETURNS TABLE(
  id UUID,
  name VARCHAR(255),
  description TEXT,
  created_at TIMESTAMPTZ
) AS $$
DECLARE
  v_workflow_id UUID;
  v_created_at TIMESTAMPTZ;
BEGIN
  -- Insert the new workflow
  INSERT INTO ai_workflows (
    user_id,
    name,
    description,
    steps,
    trigger_type,
    trigger_config,
    is_active
  ) VALUES (
    p_user_id,
    p_name,
    p_description,
    p_steps,
    p_trigger_type,
    p_trigger_config,
    true
  )
  RETURNING ai_workflows.id, ai_workflows.created_at INTO v_workflow_id, v_created_at;

  -- Trigger webhooks for 'workflow.created' event
  PERFORM trigger_webhooks(
    p_user_id,
    'workflow.created',
    jsonb_build_object(
      'workflow_id', v_workflow_id,
      'name', p_name,
      'description', p_description,
      'trigger_type', p_trigger_type,
      'created_at', v_created_at
    )
  );

  -- Return the created workflow
  RETURN QUERY
  SELECT v_workflow_id, p_name, p_description, v_created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Update AI Workflow
CREATE OR REPLACE FUNCTION update_ai_workflow(
  p_workflow_id UUID,
  p_user_id UUID,
  p_name VARCHAR(255) DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_steps JSONB DEFAULT NULL,
  p_trigger_type VARCHAR(100) DEFAULT NULL,
  p_trigger_config JSONB DEFAULT NULL,
  p_is_active BOOLEAN DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  name VARCHAR(255),
  updated_at TIMESTAMPTZ
) AS $$
DECLARE
  v_updated_at TIMESTAMPTZ;
  v_name VARCHAR(255);
BEGIN
  -- Update the workflow
  UPDATE ai_workflows
  SET
    name = COALESCE(p_name, ai_workflows.name),
    description = COALESCE(p_description, ai_workflows.description),
    steps = COALESCE(p_steps, ai_workflows.steps),
    trigger_type = COALESCE(p_trigger_type, ai_workflows.trigger_type),
    trigger_config = COALESCE(p_trigger_config, ai_workflows.trigger_config),
    is_active = COALESCE(p_is_active, ai_workflows.is_active),
    updated_at = NOW()
  WHERE ai_workflows.id = p_workflow_id
    AND ai_workflows.user_id = p_user_id
  RETURNING ai_workflows.name, ai_workflows.updated_at INTO v_name, v_updated_at;

  -- Trigger webhooks for 'workflow.updated' event
  PERFORM trigger_webhooks(
    p_user_id,
    'workflow.updated',
    jsonb_build_object(
      'workflow_id', p_workflow_id,
      'name', v_name,
      'updated_at', v_updated_at
    )
  );

  -- Return the updated workflow
  RETURN QUERY
  SELECT p_workflow_id, v_name, v_updated_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Delete AI Workflow
CREATE OR REPLACE FUNCTION delete_ai_workflow(
  p_workflow_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_name VARCHAR(255);
  v_deleted BOOLEAN := false;
BEGIN
  -- Get workflow name before deletion
  SELECT name INTO v_name
  FROM ai_workflows
  WHERE id = p_workflow_id AND user_id = p_user_id;

  -- Delete the workflow
  DELETE FROM ai_workflows
  WHERE id = p_workflow_id
    AND user_id = p_user_id;

  GET DIAGNOSTICS v_deleted = ROW_COUNT;

  -- Trigger webhooks for 'workflow.deleted' event if deletion was successful
  IF v_deleted THEN
    PERFORM trigger_webhooks(
      p_user_id,
      'workflow.deleted',
      jsonb_build_object(
        'workflow_id', p_workflow_id,
        'name', v_name,
        'deleted_at', NOW()
      )
    );
  END IF;

  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Execute AI Workflow
CREATE OR REPLACE FUNCTION execute_ai_workflow(
  p_workflow_id UUID,
  p_user_id UUID,
  p_context JSONB DEFAULT '{}'
)
RETURNS TABLE(
  run_id UUID,
  status VARCHAR(50),
  started_at TIMESTAMPTZ
) AS $$
DECLARE
  v_run_id UUID;
  v_started_at TIMESTAMPTZ := NOW();
BEGIN
  -- Create workflow run record
  INSERT INTO ai_workflow_runs (
    workflow_id,
    user_id,
    status,
    start_time,
    results
  ) VALUES (
    p_workflow_id,
    p_user_id,
    'pending',
    v_started_at,
    p_context
  )
  RETURNING ai_workflow_runs.id INTO v_run_id;

  -- Trigger webhooks for 'workflow.executed' event
  PERFORM trigger_webhooks(
    p_user_id,
    'workflow.executed',
    jsonb_build_object(
      'workflow_id', p_workflow_id,
      'run_id', v_run_id,
      'context', p_context,
      'started_at', v_started_at
    )
  );

  -- Return run info
  RETURN QUERY
  SELECT v_run_id, 'pending'::VARCHAR(50), v_started_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Update Workflow Run Status
CREATE OR REPLACE FUNCTION update_workflow_run_status(
  p_run_id UUID,
  p_user_id UUID,
  p_status VARCHAR(50),
  p_results JSONB DEFAULT NULL,
  p_error TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_updated BOOLEAN := false;
  v_workflow_id UUID;
BEGIN
  -- Update the workflow run
  UPDATE ai_workflow_runs
  SET
    status = p_status,
    results = COALESCE(p_results, ai_workflow_runs.results),
    error = p_error,
    end_time = CASE WHEN p_status IN ('completed', 'failed') THEN NOW() ELSE end_time END,
    updated_at = NOW()
  WHERE ai_workflow_runs.id = p_run_id
    AND ai_workflow_runs.user_id = p_user_id
  RETURNING workflow_id INTO v_workflow_id;

  GET DIAGNOSTICS v_updated = ROW_COUNT;

  -- Trigger webhooks for status change events
  IF v_updated THEN
    IF p_status = 'completed' THEN
      PERFORM trigger_webhooks(
        p_user_id,
        'workflow.completed',
        jsonb_build_object(
          'workflow_id', v_workflow_id,
          'run_id', p_run_id,
          'results', p_results,
          'completed_at', NOW()
        )
      );
    ELSIF p_status = 'failed' THEN
      PERFORM trigger_webhooks(
        p_user_id,
        'workflow.failed',
        jsonb_build_object(
          'workflow_id', v_workflow_id,
          'run_id', p_run_id,
          'error', p_error,
          'failed_at', NOW()
        )
      );
    END IF;
  END IF;

  RETURN v_updated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- WEBHOOK MANAGEMENT FUNCTIONS
-- ============================================================================

-- Function: Trigger Webhooks
-- This function is called by other functions to trigger webhooks for specific events
CREATE OR REPLACE FUNCTION trigger_webhooks(
  p_user_id UUID,
  p_event_type TEXT,
  p_payload JSONB
)
RETURNS VOID AS $$
DECLARE
  v_webhook RECORD;
BEGIN
  -- Find all active webhooks for this user and event type
  FOR v_webhook IN
    SELECT id, url, secret
    FROM webhooks
    WHERE user_id = p_user_id
      AND is_active = true
      AND p_event_type = ANY(events)
  LOOP
    -- Log the webhook delivery attempt
    INSERT INTO webhook_logs (
      webhook_id,
      event_type,
      payload,
      delivered_at
    ) VALUES (
      v_webhook.id,
      p_event_type,
      p_payload,
      NOW()
    );

    -- Update webhook last_triggered_at
    UPDATE webhooks
    SET last_triggered_at = NOW()
    WHERE id = v_webhook.id;

    -- Note: Actual HTTP delivery would be handled by an external service
    -- This function just records the webhook event for processing
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Create Webhook
CREATE OR REPLACE FUNCTION create_webhook(
  p_user_id UUID,
  p_name TEXT,
  p_url TEXT,
  p_description TEXT DEFAULT NULL,
  p_events TEXT[] DEFAULT '{}',
  p_secret TEXT DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  name TEXT,
  url TEXT,
  created_at TIMESTAMPTZ
) AS $$
DECLARE
  v_webhook_id UUID;
  v_created_at TIMESTAMPTZ;
  v_secret TEXT;
BEGIN
  -- Generate secret if not provided
  v_secret := COALESCE(p_secret, encode(gen_random_bytes(32), 'hex'));

  -- Insert the new webhook
  INSERT INTO webhooks (
    user_id,
    name,
    url,
    description,
    events,
    secret,
    is_active
  ) VALUES (
    p_user_id,
    p_name,
    p_url,
    p_description,
    p_events,
    v_secret,
    true
  )
  RETURNING webhooks.id, webhooks.created_at INTO v_webhook_id, v_created_at;

  -- Return the created webhook
  RETURN QUERY
  SELECT v_webhook_id, p_name, p_url, v_created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Update Webhook
CREATE OR REPLACE FUNCTION update_webhook(
  p_webhook_id UUID,
  p_user_id UUID,
  p_name TEXT DEFAULT NULL,
  p_url TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_events TEXT[] DEFAULT NULL,
  p_is_active BOOLEAN DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_updated BOOLEAN := false;
BEGIN
  -- Update the webhook
  UPDATE webhooks
  SET
    name = COALESCE(p_name, webhooks.name),
    url = COALESCE(p_url, webhooks.url),
    description = COALESCE(p_description, webhooks.description),
    events = COALESCE(p_events, webhooks.events),
    is_active = COALESCE(p_is_active, webhooks.is_active),
    updated_at = NOW()
  WHERE webhooks.id = p_webhook_id
    AND webhooks.user_id = p_user_id;

  GET DIAGNOSTICS v_updated = ROW_COUNT;

  RETURN v_updated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Delete Webhook
CREATE OR REPLACE FUNCTION delete_webhook(
  p_webhook_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_deleted BOOLEAN := false;
BEGIN
  -- Delete the webhook
  DELETE FROM webhooks
  WHERE id = p_webhook_id
    AND user_id = p_user_id;

  GET DIAGNOSTICS v_deleted = ROW_COUNT;

  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Function: Get Agent Execution History
CREATE OR REPLACE FUNCTION get_agent_execution_history(
  p_agent_id UUID,
  p_user_id UUID,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE(
  execution_id UUID,
  prompt TEXT,
  status VARCHAR(50),
  results JSONB,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    id,
    (results->>'prompt')::TEXT,
    (results->>'status')::VARCHAR(50),
    results,
    created_at
  FROM ai_analysis_results
  WHERE agent_id = p_agent_id
    AND user_id = p_user_id
    AND analysis_type = 'agent_execution'
  ORDER BY created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get Workflow Run History
CREATE OR REPLACE FUNCTION get_workflow_run_history(
  p_workflow_id UUID,
  p_user_id UUID,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE(
  run_id UUID,
  status VARCHAR(50),
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  results JSONB,
  error TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    id,
    status,
    start_time,
    end_time,
    results,
    error
  FROM ai_workflow_runs
  WHERE workflow_id = p_workflow_id
    AND user_id = p_user_id
  ORDER BY start_time DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get Webhook Delivery Logs
CREATE OR REPLACE FUNCTION get_webhook_logs(
  p_webhook_id UUID,
  p_user_id UUID,
  p_limit INTEGER DEFAULT 100
)
RETURNS TABLE(
  log_id UUID,
  event_type TEXT,
  payload JSONB,
  response_status INTEGER,
  response_body TEXT,
  error_message TEXT,
  delivered_at TIMESTAMPTZ
) AS $$
BEGIN
  -- Verify webhook belongs to user
  IF NOT EXISTS (
    SELECT 1 FROM webhooks
    WHERE id = p_webhook_id AND user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'Webhook not found or access denied';
  END IF;

  RETURN QUERY
  SELECT
    id,
    event_type,
    payload,
    response_status,
    response_body,
    error_message,
    delivered_at
  FROM webhook_logs
  WHERE webhook_id = p_webhook_id
  ORDER BY delivered_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION create_ai_agent TO authenticated;
GRANT EXECUTE ON FUNCTION update_ai_agent TO authenticated;
GRANT EXECUTE ON FUNCTION delete_ai_agent TO authenticated;
GRANT EXECUTE ON FUNCTION execute_ai_agent TO authenticated;
GRANT EXECUTE ON FUNCTION create_ai_workflow TO authenticated;
GRANT EXECUTE ON FUNCTION update_ai_workflow TO authenticated;
GRANT EXECUTE ON FUNCTION delete_ai_workflow TO authenticated;
GRANT EXECUTE ON FUNCTION execute_ai_workflow TO authenticated;
GRANT EXECUTE ON FUNCTION update_workflow_run_status TO authenticated;
GRANT EXECUTE ON FUNCTION create_webhook TO authenticated;
GRANT EXECUTE ON FUNCTION update_webhook TO authenticated;
GRANT EXECUTE ON FUNCTION delete_webhook TO authenticated;
GRANT EXECUTE ON FUNCTION get_agent_execution_history TO authenticated;
GRANT EXECUTE ON FUNCTION get_workflow_run_history TO authenticated;
GRANT EXECUTE ON FUNCTION get_webhook_logs TO authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION create_ai_agent IS 'Create a new AI agent with webhook notification';
COMMENT ON FUNCTION update_ai_agent IS 'Update an existing AI agent with webhook notification';
COMMENT ON FUNCTION delete_ai_agent IS 'Delete an AI agent with webhook notification';
COMMENT ON FUNCTION execute_ai_agent IS 'Execute an AI agent with a given prompt and context';
COMMENT ON FUNCTION create_ai_workflow IS 'Create a new AI workflow with webhook notification';
COMMENT ON FUNCTION update_ai_workflow IS 'Update an existing AI workflow with webhook notification';
COMMENT ON FUNCTION delete_ai_workflow IS 'Delete an AI workflow with webhook notification';
COMMENT ON FUNCTION execute_ai_workflow IS 'Execute an AI workflow with given context';
COMMENT ON FUNCTION update_workflow_run_status IS 'Update the status of a workflow run';
COMMENT ON FUNCTION trigger_webhooks IS 'Internal function to trigger webhooks for events';
COMMENT ON FUNCTION create_webhook IS 'Create a new webhook subscription';
COMMENT ON FUNCTION update_webhook IS 'Update an existing webhook subscription';
COMMENT ON FUNCTION delete_webhook IS 'Delete a webhook subscription';
COMMENT ON FUNCTION get_agent_execution_history IS 'Get execution history for an agent';
COMMENT ON FUNCTION get_workflow_run_history IS 'Get run history for a workflow';
COMMENT ON FUNCTION get_webhook_logs IS 'Get delivery logs for a webhook';
