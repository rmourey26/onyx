-- Create audit log table for API key operations
CREATE TABLE IF NOT EXISTS public.api_key_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID NOT NULL REFERENCES public.api_keys(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'created', 'revoked', 'deleted', 'rotated', 'used'
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for audit log queries
CREATE INDEX idx_api_key_audit_log_api_key_id ON public.api_key_audit_log(api_key_id);
CREATE INDEX idx_api_key_audit_log_user_id ON public.api_key_audit_log(user_id);
CREATE INDEX idx_api_key_audit_log_created_at ON public.api_key_audit_log(created_at DESC);
CREATE INDEX idx_api_key_audit_log_action ON public.api_key_audit_log(action);

-- Enable RLS
ALTER TABLE public.api_key_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policy - users can only view their own audit logs
CREATE POLICY "Users can view their own API key audit logs"
  ON public.api_key_audit_log
  FOR SELECT
  USING (auth.uid() = user_id);

-- Add usage tracking columns to api_keys table
ALTER TABLE public.api_keys 
  ADD COLUMN IF NOT EXISTS total_requests INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_request_at TIMESTAMPTZ;

-- Create index for usage tracking
CREATE INDEX IF NOT EXISTS idx_api_keys_last_request_at ON public.api_keys(last_request_at DESC);

-- Create function to log API key usage
CREATE OR REPLACE FUNCTION log_api_key_usage()
RETURNS TRIGGER AS $$
BEGIN
  -- Increment total_requests when last_used_at is updated
  IF NEW.last_used_at IS DISTINCT FROM OLD.last_used_at THEN
    NEW.total_requests = COALESCE(OLD.total_requests, 0) + 1;
    NEW.last_request_at = NEW.last_used_at;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for usage tracking
DROP TRIGGER IF EXISTS track_api_key_usage ON public.api_keys;
CREATE TRIGGER track_api_key_usage
  BEFORE UPDATE ON public.api_keys
  FOR EACH ROW
  EXECUTE FUNCTION log_api_key_usage();

-- Create function to automatically log audit events
CREATE OR REPLACE FUNCTION log_api_key_audit()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.api_key_audit_log (api_key_id, user_id, action, metadata)
    VALUES (NEW.id, NEW.user_id, 'created', jsonb_build_object('name', NEW.name, 'expires_at', NEW.expires_at));
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.is_active = false AND OLD.is_active = true THEN
      INSERT INTO public.api_key_audit_log (api_key_id, user_id, action)
      VALUES (NEW.id, NEW.user_id, 'revoked');
    ELSIF NEW.key_hash != OLD.key_hash THEN
      INSERT INTO public.api_key_audit_log (api_key_id, user_id, action)
      VALUES (NEW.id, NEW.user_id, 'rotated');
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.api_key_audit_log (api_key_id, user_id, action)
    VALUES (OLD.id, OLD.user_id, 'deleted');
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for audit logging
DROP TRIGGER IF EXISTS audit_api_key_changes ON public.api_keys;
CREATE TRIGGER audit_api_key_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.api_keys
  FOR EACH ROW
  EXECUTE FUNCTION log_api_key_audit();
