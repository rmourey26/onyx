-- ============================================================================
-- Create voice_analysis_results table for storing voice agent execution results
-- Version: 1.0.0
-- Created: 2026-01-21
-- ============================================================================

-- Drop table if exists (for development/testing)
-- DROP TABLE IF EXISTS public.voice_analysis_results CASCADE;

-- Create voice_analysis_results table
CREATE TABLE IF NOT EXISTS public.voice_analysis_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  voice_execution_log_id UUID REFERENCES public.voice_execution_logs(id) ON DELETE CASCADE,
  
  -- Execution metadata
  agent_id UUID REFERENCES public.ai_agents(id) ON DELETE SET NULL,
  agent_name TEXT,
  execution_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Voice-specific data
  audio_input_url TEXT,
  audio_output_url TEXT,
  transcription_input TEXT,
  transcription_output TEXT,
  voice_duration_seconds DECIMAL(10, 2),
  voice_model TEXT,
  
  -- Analysis results
  analysis_type TEXT NOT NULL, -- 'sentiment', 'intent', 'entity_extraction', 'summary', 'decision', etc.
  analysis_result JSONB NOT NULL, -- Flexible storage for various analysis types
  confidence_score DECIMAL(5, 4), -- 0.0000 to 1.0000
  
  -- Performance metrics
  processing_time_ms INTEGER,
  tokens_used INTEGER,
  cost_usd DECIMAL(10, 6),
  
  -- Context and metadata
  context_snapshot_id UUID REFERENCES public.voice_context_snapshots(id) ON DELETE SET NULL,
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  
  -- Status and error handling
  status TEXT DEFAULT 'completed', -- 'completed', 'failed', 'partial'
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_voice_analysis_results_user_id ON public.voice_analysis_results(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_analysis_results_voice_execution_log_id ON public.voice_analysis_results(voice_execution_log_id);
CREATE INDEX IF NOT EXISTS idx_voice_analysis_results_agent_id ON public.voice_analysis_results(agent_id);
CREATE INDEX IF NOT EXISTS idx_voice_analysis_results_analysis_type ON public.voice_analysis_results(analysis_type);
CREATE INDEX IF NOT EXISTS idx_voice_analysis_results_created_at ON public.voice_analysis_results(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_voice_analysis_results_status ON public.voice_analysis_results(status);
CREATE INDEX IF NOT EXISTS idx_voice_analysis_results_context_snapshot_id ON public.voice_analysis_results(context_snapshot_id);

-- Create GIN index for JSONB columns for efficient queries
CREATE INDEX IF NOT EXISTS idx_voice_analysis_results_analysis_result_gin ON public.voice_analysis_results USING GIN (analysis_result);
CREATE INDEX IF NOT EXISTS idx_voice_analysis_results_metadata_gin ON public.voice_analysis_results USING GIN (metadata);
CREATE INDEX IF NOT EXISTS idx_voice_analysis_results_tags_gin ON public.voice_analysis_results USING GIN (tags);

-- Enable Row Level Security
ALTER TABLE public.voice_analysis_results ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own voice analysis results
CREATE POLICY "Users can view their own voice analysis results"
  ON public.voice_analysis_results
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own voice analysis results"
  ON public.voice_analysis_results
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own voice analysis results"
  ON public.voice_analysis_results
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own voice analysis results"
  ON public.voice_analysis_results
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_voice_analysis_results_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_voice_analysis_results_updated_at ON public.voice_analysis_results;
CREATE TRIGGER trigger_voice_analysis_results_updated_at
  BEFORE UPDATE ON public.voice_analysis_results
  FOR EACH ROW
  EXECUTE FUNCTION update_voice_analysis_results_updated_at();

-- Add helpful comments
COMMENT ON TABLE public.voice_analysis_results IS 'Stores results and analysis from voice agent executions';
COMMENT ON COLUMN public.voice_analysis_results.analysis_type IS 'Type of analysis performed: sentiment, intent, entity_extraction, summary, decision, etc.';
COMMENT ON COLUMN public.voice_analysis_results.analysis_result IS 'Flexible JSONB storage for various analysis result types';
COMMENT ON COLUMN public.voice_analysis_results.confidence_score IS 'Confidence score of the analysis result (0.0 to 1.0)';
COMMENT ON COLUMN public.voice_analysis_results.voice_duration_seconds IS 'Duration of the voice interaction in seconds';
COMMENT ON COLUMN public.voice_analysis_results.context_snapshot_id IS 'Reference to the voice context snapshot at time of analysis';

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.voice_analysis_results TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.voice_analysis_results TO service_role;

-- ============================================================================
-- End of voice_analysis_results table creation
-- ============================================================================
