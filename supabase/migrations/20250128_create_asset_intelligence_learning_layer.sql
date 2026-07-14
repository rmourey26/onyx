-- Create the asset intelligence learning layer table
-- This table stores vectorized execution results from agents and workflows
-- to enable continuous AI intelligence optimization through RAG

CREATE TABLE IF NOT EXISTS asset_intelligence_learning (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Core identification
  name TEXT NOT NULL,
  description TEXT,
  
  -- Execution metadata
  execution_type TEXT NOT NULL CHECK (execution_type IN ('agent', 'workflow')),
  execution_id UUID NOT NULL,
  execution_name TEXT NOT NULL,
  
  -- Asset context
  asset_ids UUID[] DEFAULT '{}',
  asset_context JSONB DEFAULT '{}',
  
  -- Execution results
  execution_input JSONB NOT NULL DEFAULT '{}',
  execution_output JSONB NOT NULL DEFAULT '{}',
  execution_metrics JSONB DEFAULT '{}', -- tokens, time, iterations, etc.
  
  -- Performance and quality metrics
  success_score FLOAT CHECK (success_score >= 0 AND success_score <= 1),
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  user_feedback TEXT,
  
  -- Vector embedding for semantic search
  embedding_model TEXT NOT NULL DEFAULT 'text-embedding-3-small',
  vector_data VECTOR(1536),
  
  -- Additional metadata
  metadata JSONB NOT NULL DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  
  -- Ownership and timestamps
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_asset_intelligence_learning_user_id 
  ON asset_intelligence_learning(user_id);

CREATE INDEX IF NOT EXISTS idx_asset_intelligence_learning_execution_type 
  ON asset_intelligence_learning(execution_type);

CREATE INDEX IF NOT EXISTS idx_asset_intelligence_learning_execution_id 
  ON asset_intelligence_learning(execution_id);

CREATE INDEX IF NOT EXISTS idx_asset_intelligence_learning_asset_ids 
  ON asset_intelligence_learning USING GIN(asset_ids);

CREATE INDEX IF NOT EXISTS idx_asset_intelligence_learning_tags 
  ON asset_intelligence_learning USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_asset_intelligence_learning_created_at 
  ON asset_intelligence_learning(created_at DESC);

-- Create vector similarity search index
CREATE INDEX IF NOT EXISTS asset_intelligence_learning_vector_idx 
  ON asset_intelligence_learning 
  USING ivfflat (vector_data vector_cosine_ops) 
  WITH (lists = 100);

-- Enable Row Level Security
ALTER TABLE asset_intelligence_learning ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own learning data" 
  ON asset_intelligence_learning 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own learning data" 
  ON asset_intelligence_learning 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own learning data" 
  ON asset_intelligence_learning 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own learning data" 
  ON asset_intelligence_learning 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create function for similarity search in learning layer
CREATE OR REPLACE FUNCTION match_learning_data(
  query_embedding VECTOR(1536),
  match_threshold FLOAT,
  match_count INT,
  filter_user_id UUID,
  filter_execution_type TEXT DEFAULT NULL,
  filter_asset_ids UUID[] DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  name TEXT,
  description TEXT,
  execution_type TEXT,
  execution_name TEXT,
  execution_output JSONB,
  asset_context JSONB,
  similarity FLOAT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.id,
    l.name,
    l.description,
    l.execution_type,
    l.execution_name,
    l.execution_output,
    l.asset_context,
    1 - (l.vector_data <=> query_embedding) as similarity,
    l.created_at
  FROM
    asset_intelligence_learning l
  WHERE
    l.user_id = filter_user_id
    AND l.vector_data IS NOT NULL
    AND 1 - (l.vector_data <=> query_embedding) > match_threshold
    AND (filter_execution_type IS NULL OR l.execution_type = filter_execution_type)
    AND (filter_asset_ids IS NULL OR l.asset_ids && filter_asset_ids)
  ORDER BY
    l.vector_data <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_asset_intelligence_learning_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_asset_intelligence_learning_timestamp
BEFORE UPDATE ON asset_intelligence_learning
FOR EACH ROW
EXECUTE FUNCTION update_asset_intelligence_learning_timestamp();

-- Create view for learning analytics
CREATE OR REPLACE VIEW asset_intelligence_learning_stats AS
SELECT
  user_id,
  execution_type,
  COUNT(*) as total_executions,
  AVG(success_score) as avg_success_score,
  AVG(quality_rating) as avg_quality_rating,
  COUNT(DISTINCT execution_id) as unique_executions,
  -- Fixed array_agg with unnest by using a subquery to flatten tags first
  (
    SELECT array_agg(DISTINCT tag)
    FROM asset_intelligence_learning l2
    CROSS JOIN LATERAL unnest(l2.tags) AS tag
    WHERE l2.user_id = l.user_id 
      AND l2.execution_type = l.execution_type
      AND l2.tags IS NOT NULL 
      AND array_length(l2.tags, 1) > 0
  ) as all_tags,
  MIN(created_at) as first_execution,
  MAX(created_at) as last_execution
FROM
  asset_intelligence_learning l
GROUP BY
  user_id,
  execution_type;

-- Grant access to the view
GRANT SELECT ON asset_intelligence_learning_stats TO authenticated;

-- Add helpful comment
COMMENT ON TABLE asset_intelligence_learning IS 'Stores vectorized execution results from AI agents and workflows to enable continuous learning and optimization through RAG-based context retrieval';
