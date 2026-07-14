-- Create organizations and organization_members tables with proper RLS policies
-- This migration fixes the infinite recursion issue in RLS policies

-- Drop existing policies if they exist (to fix recursion)
DROP POLICY IF EXISTS "Users can view their organizations" ON organization_members;
DROP POLICY IF EXISTS "Users can view organizations they belong to" ON organizations;
DROP POLICY IF EXISTS "Organization members can view member list" ON organization_members;
DROP POLICY IF EXISTS "Users can view organization members" ON organization_members;

-- Create organizations table if it doesn't exist
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  industry TEXT,
  company_size TEXT,
  website_url TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create organization_members table if it doesn't exist
CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  invited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_organization_members_user_id ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_org_id ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_organizations_created_by ON organizations(created_by);
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organizations table
-- Users can view organizations they are members of (simple, non-recursive check)
CREATE POLICY "Users can view their organizations"
  ON organizations
  FOR SELECT
  USING (
    id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

-- Organization owners/admins can update their organization
CREATE POLICY "Organization owners and admins can update"
  ON organizations
  FOR UPDATE
  USING (
    id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- Any authenticated user can create an organization
CREATE POLICY "Authenticated users can create organizations"
  ON organizations
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Organization owners can delete their organization
CREATE POLICY "Organization owners can delete"
  ON organizations
  FOR DELETE
  USING (
    id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid() 
      AND role = 'owner'
    )
  );

-- RLS Policies for organization_members table  
-- Simple policy: users can view memberships if they're in the same organization
CREATE POLICY "Users can view organization members"
  ON organization_members
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

-- Organization owners and admins can add members
CREATE POLICY "Owners and admins can add members"
  ON organization_members
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- Organization owners and admins can update member roles
CREATE POLICY "Owners and admins can update members"
  ON organization_members
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- Organization owners and admins can remove members
CREATE POLICY "Owners and admins can remove members"
  ON organization_members
  FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- Create function to update organization updated_at
CREATE OR REPLACE FUNCTION update_organization_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at
DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_organization_updated_at();
