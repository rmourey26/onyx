-- Fix infinite recursion in organization_members RLS policies
-- This migration completely removes the recursive policy and replaces it with a simple one

-- Drop ALL existing policies on both tables to ensure clean slate
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename IN ('organizations', 'organization_members')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, 
            CASE WHEN pol.policyname LIKE '%organization_members%' OR pol.policyname LIKE '%members%' 
            THEN 'organization_members' 
            ELSE 'organizations' 
            END);
    END LOOP;
END $$;

-- Also drop by known names to be absolutely sure
DROP POLICY IF EXISTS "Users can view their organizations" ON organization_members;
DROP POLICY IF EXISTS "Users can view organizations they belong to" ON organizations;
DROP POLICY IF EXISTS "Organization members can view member list" ON organization_members;
DROP POLICY IF EXISTS "Users can view organization members" ON organization_members;
DROP POLICY IF EXISTS "Owners and admins can add members" ON organization_members;
DROP POLICY IF EXISTS "Owners and admins can update members" ON organization_members;
DROP POLICY IF EXISTS "Owners and admins can remove members" ON organization_members;
DROP POLICY IF EXISTS "Organization owners and admins can update" ON organizations;
DROP POLICY IF EXISTS "Authenticated users can create organizations" ON organizations;
DROP POLICY IF EXISTS "Organization owners can delete" ON organizations;

-- Create a security definer function to check organization membership
-- This breaks the recursion by executing with elevated privileges
CREATE OR REPLACE FUNCTION is_organization_member(org_id UUID, check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM organization_members 
    WHERE organization_id = org_id 
    AND user_id = check_user_id
  );
END;
$$;

-- Create a security definer function to check if user is owner/admin
CREATE OR REPLACE FUNCTION is_organization_admin(org_id UUID, check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM organization_members 
    WHERE organization_id = org_id 
    AND user_id = check_user_id
    AND role IN ('owner', 'admin')
  );
END;
$$;

-- RLS Policies for organizations table (using security definer functions)
CREATE POLICY "Users can view their organizations"
  ON organizations
  FOR SELECT
  USING (is_organization_member(id, auth.uid()));

CREATE POLICY "Organization owners and admins can update"
  ON organizations
  FOR UPDATE
  USING (is_organization_admin(id, auth.uid()));

CREATE POLICY "Authenticated users can create organizations"
  ON organizations
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Organization owners can delete"
  ON organizations
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 
      FROM organization_members 
      WHERE organization_id = id 
      AND user_id = auth.uid() 
      AND role = 'owner'
    )
  );

-- RLS Policies for organization_members table (SIMPLE, NO RECURSION)
-- Users can only see their own memberships
CREATE POLICY "Users can view their own memberships"
  ON organization_members
  FOR SELECT
  USING (user_id = auth.uid());

-- Organization admins can add members (using security definer function)
CREATE POLICY "Admins can add members"
  ON organization_members
  FOR INSERT
  WITH CHECK (is_organization_admin(organization_id, auth.uid()));

-- Organization admins can update member roles (using security definer function)
CREATE POLICY "Admins can update members"
  ON organization_members
  FOR UPDATE
  USING (is_organization_admin(organization_id, auth.uid()));

-- Organization admins can remove members (using security definer function)
CREATE POLICY "Admins can remove members"
  ON organization_members
  FOR DELETE
  USING (is_organization_admin(organization_id, auth.uid()));

-- Grant execute permissions on the security definer functions
GRANT EXECUTE ON FUNCTION is_organization_member(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_organization_admin(UUID, UUID) TO authenticated;
