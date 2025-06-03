-- Create a function to create the get_profile_direct function
-- This is a meta-function that creates another function
CREATE OR REPLACE FUNCTION create_get_profile_function() RETURNS void AS $$
BEGIN
  -- Drop the function if it already exists
  DROP FUNCTION IF EXISTS get_profile_direct(uuid);
  
  -- Create the function that bypasses RLS
  EXECUTE '
    CREATE OR REPLACE FUNCTION get_profile_direct(user_id uuid) 
    RETURNS SETOF profiles AS $$
      SELECT * FROM profiles WHERE id = user_id;
    $$ LANGUAGE sql SECURITY DEFINER;
  ';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute the function to create get_profile_direct
SELECT create_get_profile_function();

-- Test the function
-- SELECT * FROM get_profile_direct('your-user-id-here');

-- Fix the RLS policies to avoid recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Create a safer admin check function
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Direct query to get the role without using RLS
  SELECT role INTO user_role FROM profiles WHERE id = auth.uid();
  RETURN user_role = 'admin';
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add policy to allow admins to view all profiles using the is_admin function
CREATE POLICY "Admins can view all profiles" 
  ON profiles FOR SELECT 
  USING (is_admin());
