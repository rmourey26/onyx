-- Create voice execution logs table
CREATE TABLE IF NOT EXISTS voice_execution_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  agent_id UUID REFERENCES ai_agents(id) ON DELETE SET NULL,
  
  -- Audio metadata
  transcription TEXT NOT NULL,
  confidence NUMERIC(3, 2),
  language VARCHAR(10) DEFAULT 'en',
  audio_duration NUMERIC(10, 2),
  audio_format VARCHAR(20) DEFAULT 'wav',
  
  -- Intent and execution
  intent_action VARCHAR(100),
  intent_confidence NUMERIC(3, 2),
  intent_entities JSONB DEFAULT '{}'::jsonb,
  
  -- Results
  execution_result JSONB,
  response_text TEXT,
  status VARCHAR(50) DEFAULT 'processing',
  error TEXT,
  
  -- Context
  context_type VARCHAR(50) DEFAULT 'standard',
  aethernet_metadata JSONB,
  asset_ids UUID[],
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  -- Indexing
  CONSTRAINT valid_confidence CHECK (confidence >= 0 AND confidence <= 1),
  CONSTRAINT valid_intent_confidence CHECK (intent_confidence >= 0 AND intent_confidence <= 1)
);

-- Create indexes for performance
CREATE INDEX idx_voice_logs_user_id ON voice_execution_logs(user_id);
CREATE INDEX idx_voice_logs_session_id ON voice_execution_logs(session_id);
CREATE INDEX idx_voice_logs_agent_id ON voice_execution_logs(agent_id) WHERE agent_id IS NOT NULL;
CREATE INDEX idx_voice_logs_created_at ON voice_execution_logs(created_at DESC);
CREATE INDEX idx_voice_logs_status ON voice_execution_logs(status);
CREATE INDEX idx_voice_logs_intent_action ON voice_execution_logs(intent_action);

-- Create voice sessions table for conversation tracking
CREATE TABLE IF NOT EXISTS voice_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_name VARCHAR(255),
  
  -- Session metadata
  context_type VARCHAR(50) DEFAULT 'standard',
  aethernet_connection_id UUID REFERENCES aethernet_connections(id) ON DELETE SET NULL,
  
  -- Statistics
  total_commands INTEGER DEFAULT 0,
  successful_commands INTEGER DEFAULT 0,
  failed_commands INTEGER DEFAULT 0,
  total_audio_duration NUMERIC(10, 2) DEFAULT 0,
  
  -- Session state
  is_active BOOLEAN DEFAULT true,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

CREATE INDEX idx_voice_sessions_user_id ON voice_sessions(user_id);
CREATE INDEX idx_voice_sessions_is_active ON voice_sessions(is_active) WHERE is_active = true;
CREATE INDEX idx_voice_sessions_created_at ON voice_sessions(created_at DESC);

-- Create voice context snapshots for multi-context support
CREATE TABLE IF NOT EXISTS voice_context_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES voice_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Snapshot data
  snapshot_type VARCHAR(50) NOT NULL,
  context_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Metadata
  sequence_number INTEGER NOT NULL,
  is_current BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(session_id, sequence_number)
);

CREATE INDEX idx_voice_snapshots_session_id ON voice_context_snapshots(session_id);
CREATE INDEX idx_voice_snapshots_is_current ON voice_context_snapshots(is_current) WHERE is_current = true;

-- Row Level Security policies
ALTER TABLE voice_execution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_context_snapshots ENABLE ROW LEVEL SECURITY;

-- Voice execution logs policies
CREATE POLICY "Users can view their own voice logs"
  ON voice_execution_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own voice logs"
  ON voice_execution_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own voice logs"
  ON voice_execution_logs FOR UPDATE
  USING (auth.uid() = user_id);

-- Voice sessions policies
CREATE POLICY "Users can view their own voice sessions"
  ON voice_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own voice sessions"
  ON voice_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own voice sessions"
  ON voice_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Voice context snapshots policies
CREATE POLICY "Users can view their own context snapshots"
  ON voice_context_snapshots FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own context snapshots"
  ON voice_context_snapshots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to update session statistics
CREATE OR REPLACE FUNCTION update_voice_session_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE voice_sessions
  SET 
    total_commands = total_commands + 1,
    successful_commands = successful_commands + CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END,
    failed_commands = failed_commands + CASE WHEN NEW.status = 'failed' THEN 1 ELSE 0 END,
    total_audio_duration = total_audio_duration + COALESCE(NEW.audio_duration, 0),
    last_activity_at = NOW()
  WHERE id = NEW.session_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_voice_session_stats
  AFTER INSERT ON voice_execution_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_voice_session_stats();

-- Function to create voice context snapshot
CREATE OR REPLACE FUNCTION create_voice_context_snapshot(
  p_session_id UUID,
  p_snapshot_type VARCHAR,
  p_context_data JSONB
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
  v_sequence_number INTEGER;
  v_snapshot_id UUID;
BEGIN
  -- Get user ID from session
  SELECT user_id INTO v_user_id
  FROM voice_sessions
  WHERE id = p_session_id;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Session not found';
  END IF;
  
  -- Get next sequence number
  SELECT COALESCE(MAX(sequence_number), 0) + 1
  INTO v_sequence_number
  FROM voice_context_snapshots
  WHERE session_id = p_session_id;
  
  -- Mark all previous snapshots as not current
  UPDATE voice_context_snapshots
  SET is_current = false
  WHERE session_id = p_session_id AND is_current = true;
  
  -- Insert new snapshot
  INSERT INTO voice_context_snapshots (
    session_id,
    user_id,
    snapshot_type,
    context_data,
    sequence_number,
    is_current
  ) VALUES (
    p_session_id,
    v_user_id,
    p_snapshot_type,
    p_context_data,
    v_sequence_number,
    true
  ) RETURNING id INTO v_snapshot_id;
  
  RETURN v_snapshot_id;
END;
$$ LANGUAGE plpgsql;
