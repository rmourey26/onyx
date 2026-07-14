-- Fix RLS policy for api_key_audit_log to allow inserts from triggers

-- Drop existing policy
DROP POLICY IF EXISTS "Users can view their own API key audit logs" ON public.api_key_audit_log;

-- RLS Policy - users can view their own audit logs
CREATE POLICY "Users can view their own API key audit logs"
  ON public.api_key_audit_log
  FOR SELECT
  USING (auth.uid() = user_id);

-- Add INSERT policy to allow trigger function to insert audit logs
CREATE POLICY "Users can insert their own API key audit logs"
  ON public.api_key_audit_log
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add policy to allow service role to insert audit logs (for triggers)
CREATE POLICY "Service role can insert audit logs"
  ON public.api_key_audit_log
  FOR INSERT
  TO service_role
  WITH CHECK (true);
