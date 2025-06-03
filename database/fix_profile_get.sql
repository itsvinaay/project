-- Create a function to safely get a profile by ID
-- This avoids the infinite recursion in RLS policies
CREATE OR REPLACE FUNCTION get_profile_by_id(user_id UUID)
RETURNS SETOF profiles AS $$
BEGIN
  -- Only return the profile if it belongs to the requesting user
  -- or if the requesting user is an admin
  RETURN QUERY
  SELECT p.*
  FROM profiles p
  WHERE p.id = user_id
  AND (
    -- User is requesting their own profile
    auth.uid() = user_id
    OR
    -- User is an admin
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
