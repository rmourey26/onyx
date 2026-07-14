-- Create feedback and bug reports table
CREATE TABLE IF NOT EXISTS feedback_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('feedback', 'bug', 'feature_request')),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  page_url VARCHAR(500),
  user_agent TEXT,
  browser_info JSONB,
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  tags TEXT[],
  attachments JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_feedback_reports_user_id ON feedback_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_reports_type ON feedback_reports(type);
CREATE INDEX IF NOT EXISTS idx_feedback_reports_status ON feedback_reports(status);
CREATE INDEX IF NOT EXISTS idx_feedback_reports_created_at ON feedback_reports(created_at);

-- Enable RLS
ALTER TABLE feedback_reports ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create feedback reports" ON feedback_reports
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own feedback reports" ON feedback_reports
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- Admin policy (you can adjust this based on your admin setup)
CREATE POLICY "Admins can view all feedback reports" ON feedback_reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_feedback_reports_updated_at 
  BEFORE UPDATE ON feedback_reports 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
