-- Create crm_connections table to store user's CRM connection details
CREATE TABLE IF NOT EXISTS public.crm_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL, -- 'salesforce', 'crmone', 'netsuite'
  name VARCHAR(100) NOT NULL,
  api_key TEXT,
  refresh_token TEXT,
  access_token TEXT,
  instance_url TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Create crm_contacts table to store contacts from CRM
CREATE TABLE IF NOT EXISTS public.crm_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  connection_id UUID REFERENCES public.crm_connections(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  external_id TEXT NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(50),
  company VARCHAR(100),
  job_title VARCHAR(100),
  address TEXT,
  last_contacted TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50),
  tags TEXT[],
  custom_fields JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_connection FOREIGN KEY (connection_id) REFERENCES public.crm_connections(id),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Create crm_deals table to store deals/opportunities from CRM
CREATE TABLE IF NOT EXISTS public.crm_deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  connection_id UUID REFERENCES public.crm_connections(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  external_id TEXT NOT NULL,
  name VARCHAR(255) NOT NULL,
  stage VARCHAR(100),
  amount DECIMAL(15, 2),
  currency VARCHAR(10) DEFAULT 'USD',
  close_date TIMESTAMP WITH TIME ZONE,
  probability INTEGER,
  contact_id UUID REFERENCES public.crm_contacts(id),
  description TEXT,
  custom_fields JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_connection FOREIGN KEY (connection_id) REFERENCES public.crm_connections(id),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Create crm_activities table to store activities/tasks from CRM
CREATE TABLE IF NOT EXISTS public.crm_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  connection_id UUID REFERENCES public.crm_connections(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  external_id TEXT NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'call', 'email', 'meeting', 'task'
  subject VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50),
  priority VARCHAR(50),
  due_date TIMESTAMP WITH TIME ZONE,
  completed_date TIMESTAMP WITH TIME ZONE,
  contact_id UUID REFERENCES public.crm_contacts(id),
  deal_id UUID REFERENCES public.crm_deals(id),
  custom_fields JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_connection FOREIGN KEY (connection_id) REFERENCES public.crm_connections(id),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Set up Row Level Security for crm_connections
ALTER TABLE public.crm_connections ENABLE ROW LEVEL SECURITY;

-- Create policies for crm_connections
CREATE POLICY "Users can view their own CRM connections"
  ON public.crm_connections
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own CRM connections"
  ON public.crm_connections
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own CRM connections"
  ON public.crm_connections
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own CRM connections"
  ON public.crm_connections
  FOR DELETE
  USING (auth.uid() = user_id);

-- Set up Row Level Security for crm_contacts
ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;

-- Create policies for crm_contacts
CREATE POLICY "Users can view their own CRM contacts"
  ON public.crm_contacts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own CRM contacts"
  ON public.crm_contacts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own CRM contacts"
  ON public.crm_contacts
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own CRM contacts"
  ON public.crm_contacts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Set up Row Level Security for crm_deals
ALTER TABLE public.crm_deals ENABLE ROW LEVEL SECURITY;

-- Create policies for crm_deals
CREATE POLICY "Users can view their own CRM deals"
  ON public.crm_deals
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own CRM deals"
  ON public.crm_deals
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own CRM deals"
  ON public.crm_deals
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own CRM deals"
  ON public.crm_deals
  FOR DELETE
  USING (auth.uid() = user_id);

-- Set up Row Level Security for crm_activities
ALTER TABLE public.crm_activities ENABLE ROW LEVEL SECURITY;

-- Create policies for crm_activities
CREATE POLICY "Users can view their own CRM activities"
  ON public.crm_activities
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own CRM activities"
  ON public.crm_activities
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own CRM activities"
  ON public.crm_activities
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own CRM activities"
  ON public.crm_activities
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS crm_connections_user_id_idx ON public.crm_connections(user_id);
CREATE INDEX IF NOT EXISTS crm_contacts_connection_id_idx ON public.crm_contacts(connection_id);
CREATE INDEX IF NOT EXISTS crm_contacts_user_id_idx ON public.crm_contacts(user_id);
CREATE INDEX IF NOT EXISTS crm_contacts_external_id_idx ON public.crm_contacts(external_id);
CREATE INDEX IF NOT EXISTS crm_deals_connection_id_idx ON public.crm_deals(connection_id);
CREATE INDEX IF NOT EXISTS crm_deals_user_id_idx ON public.crm_deals(user_id);
CREATE INDEX IF NOT EXISTS crm_deals_external_id_idx ON public.crm_deals(external_id);
CREATE INDEX IF NOT EXISTS crm_activities_connection_id_idx ON public.crm_activities(connection_id);
CREATE INDEX IF NOT EXISTS crm_activities_user_id_idx ON public.crm_activities(user_id);
CREATE INDEX IF NOT EXISTS crm_activities_external_id_idx ON public.crm_activities(external_id);
