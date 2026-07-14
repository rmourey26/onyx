-- Add progress tracking columns to embedding_jobs table
ALTER TABLE embedding_jobs 
ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS estimated_completion_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS processing_started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS processing_completed_at TIMESTAMPTZ;

-- Add index for job status queries
CREATE INDEX IF NOT EXISTS idx_embedding_jobs_status_user 
ON embedding_jobs(user_id, status, created_at DESC);

-- Add index for job type queries
CREATE INDEX IF NOT EXISTS idx_embedding_jobs_type_user 
ON embedding_jobs(user_id, job_type, created_at DESC);

-- Update the embedding_jobs table to support better job tracking
ALTER TABLE embedding_jobs 
ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_retries INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0;

-- Create a function to update job progress
CREATE OR REPLACE FUNCTION update_job_progress(
  job_id UUID,
  new_progress INTEGER,
  new_message TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE embedding_jobs 
  SET 
    progress = new_progress,
    result = COALESCE(result, '{}'::jsonb) || jsonb_build_object(
      'progress', new_progress,
      'message', COALESCE(new_message, (result->>'message')),
      'updated_at', NOW()
    ),
    updated_at = NOW()
  WHERE id = job_id;
END;
$$ LANGUAGE plpgsql;

-- Create a function to mark job as processing
CREATE OR REPLACE FUNCTION start_job_processing(job_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE embedding_jobs 
  SET 
    status = 'processing',
    processing_started_at = NOW(),
    progress = 0,
    result = COALESCE(result, '{}'::jsonb) || jsonb_build_object(
      'message', 'Job processing started',
      'started_at', NOW()
    ),
    updated_at = NOW()
  WHERE id = job_id AND status = 'pending';
END;
$$ LANGUAGE plpgsql;

-- Create a function to complete a job
CREATE OR REPLACE FUNCTION complete_job(
  job_id UUID,
  job_result JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE embedding_jobs 
  SET 
    status = 'completed',
    processing_completed_at = NOW(),
    progress = 100,
    result = COALESCE(result, '{}'::jsonb) || COALESCE(job_result, '{}'::jsonb) || jsonb_build_object(
      'completed_at', NOW(),
      'progress', 100
    ),
    updated_at = NOW()
  WHERE id = job_id;
END;
$$ LANGUAGE plpgsql;

-- Create a function to fail a job
CREATE OR REPLACE FUNCTION fail_job(
  job_id UUID,
  error_message TEXT
)
RETURNS VOID AS $$
BEGIN
  UPDATE embedding_jobs 
  SET 
    status = 'failed',
    error = error_message,
    result = COALESCE(result, '{}'::jsonb) || jsonb_build_object(
      'failed_at', NOW(),
      'error', error_message
    ),
    updated_at = NOW()
  WHERE id = job_id;
END;
$$ LANGUAGE plpgsql;

-- Create a view for job statistics
CREATE OR REPLACE VIEW embedding_job_stats AS
SELECT 
  user_id,
  job_type,
  status,
  COUNT(*) as job_count,
  AVG(EXTRACT(EPOCH FROM (processing_completed_at - processing_started_at))) as avg_processing_time_seconds,
  MIN(created_at) as first_job_at,
  MAX(created_at) as last_job_at
FROM embedding_jobs 
WHERE processing_started_at IS NOT NULL
GROUP BY user_id, job_type, status;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION update_job_progress(UUID, INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION start_job_processing(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION complete_job(UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION fail_job(UUID, TEXT) TO authenticated;
GRANT SELECT ON embedding_job_stats TO authenticated;
