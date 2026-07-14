-- Fix organization creation flow
-- The issue: After INSERT, we SELECT the org, but the user isn't a member yet
-- Solution: Allow creators to see their own newly created organizations

-- Drop the existing INSERT and SELECT policies for organizations
DROP POLICY IF EXISTS "Authenticated users can create organizations" ON organizations;
DROP POLICY IF EXISTS "Users can view their organizations" ON organizations;

-- Recreate INSERT policy with a clause to return the created row
CREATE POLICY "Authenticated users can create organizations"
  ON organizations
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND created_by = auth.uid());

-- Recreate SELECT policy to allow users to see orgs they created OR are members of
CREATE POLICY "Users can view their organizations"
  ON organizations
  FOR SELECT
  USING (
    created_by = auth.uid() 
    OR 
    is_organization_member(id, auth.uid())
  );

-- Also need to ensure the creator can add themselves as a member
-- Drop and recreate the INSERT policy for organization_members
DROP POLICY IF EXISTS "Admins can add members" ON organization_members;

-- Allow both admins AND the organization creator to add members
CREATE POLICY "Admins and creators can add members"
  ON organization_members
  FOR INSERT
  WITH CHECK (
    is_organization_admin(organization_id, auth.uid())
    OR
    EXISTS (
      SELECT 1 FROM organizations 
      WHERE id = organization_id 
      AND created_by = auth.uid()
    )
  );
