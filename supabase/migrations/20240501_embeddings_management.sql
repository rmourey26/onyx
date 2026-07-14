-- Create vector extension if not exists
CREATE EXTENSION IF NOT EXISTS vector;

-- Create or update data_embeddings table
CREATE TABLE IF NOT EXISTS data_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  source_type TEXT NOT NULL,
  source_id TEXT,
  embedding_model TEXT NOT NULL,
  vector_data VECTOR(1536),
  metadata JSONB NOT NULL DEFAULT '{}',
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on vector_data for similarity search
CREATE INDEX IF NOT EXISTS data_embeddings_vector_idx ON data_embeddings USING ivfflat (vector_data vector_cosine_ops) WITH (lists = 100);

-- Create user_settings table for embedding preferences
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  settings_type TEXT NOT NULL,
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, settings_type)
);

-- Create ai_agent_settings table for RAG configuration
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

-- Create embedding_files table to track uploaded files
CREATE TABLE IF NOT EXISTS embedding_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  embedding_id UUID REFERENCES data_embeddings(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create embedding_jobs table to track processing status
CREATE TABLE IF NOT EXISTS embedding_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  status TEXT NOT NULL DEFAULT 'pending',
  job_type TEXT NOT NULL,
  embedding_id UUID REFERENCES data_embeddings(id) ON DELETE SET NULL,
  file_ids JSONB,
  parameters JSONB NOT NULL DEFAULT '{}',
  result JSONB,
  error TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create embedding_usage table to track usage metrics
CREATE TABLE IF NOT EXISTS embedding_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  embedding_id UUID NOT NULL REFERENCES data_embeddings(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES ai_agents(id) ON DELETE SET NULL,
  query TEXT,
  tokens_used INTEGER,
  similarity_score FLOAT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function for similarity search
CREATE OR REPLACE FUNCTION match_embeddings(
  query_embedding VECTOR(1536),
  match_threshold FLOAT,
  match_count INT,
  user_id UUID
)
RETURNS TABLE(
  id UUID,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.metadata->>'content' as content,
    e.metadata,
    1 - (e.vector_data <=> query_embedding) as similarity
  FROM
    data_embeddings e
  WHERE
    e.user_id = user_id
    AND 1 - (e.vector_data <=> query_embedding) > match_threshold
  ORDER BY
    e.vector_data <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Enable RLS on all tables
ALTER TABLE data_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agent_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE embedding_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE embedding_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE embedding_usage ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY data_embeddings_policy ON data_embeddings
  USING (auth.uid() = user_id);

CREATE POLICY user_settings_policy ON user_settings
  USING (auth.uid() = user_id);

CREATE POLICY ai_agent_settings_policy ON ai_agent_settings
  USING (auth.uid() = user_id);

CREATE POLICY embedding_files_policy ON embedding_files
  USING (auth.uid() = user_id);

CREATE POLICY embedding_jobs_policy ON embedding_jobs
  USING (auth.uid() = user_id);

CREATE POLICY embedding_usage_policy ON embedding_usage
  USING (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN 
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('data_embeddings', 'user_settings', 'ai_agent_settings', 'embedding_files', 'embedding_jobs')
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS update_timestamp ON %I;
      CREATE TRIGGER update_timestamp
      BEFORE UPDATE ON %I
      FOR EACH ROW
      EXECUTE FUNCTION update_timestamp();
    ', t, t);
  END LOOP;
END;
$$ LANGUAGE plpgsql;
