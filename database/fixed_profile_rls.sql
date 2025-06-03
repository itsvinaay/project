-- First, drop any existing policies that might be causing recursion
DROP POLICY IF EXISTS "Allow public profile creation during signup" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Create function to handle profile creation during signup
CREATE OR REPLACE FUNCTION create_profile(
  user_id UUID,
  user_email TEXT,
  user_display_name TEXT,
  user_role TEXT DEFAULT 'client',
  user_is_approved BOOLEAN DEFAULT TRUE
) RETURNS VOID AS $$
BEGIN
  INSERT INTO profiles (
    id, 
    email, 
    display_name, 
    role, 
    is_approved, 
    created_at, 
    updated_at
  ) VALUES (
    user_id,
    user_email,
    user_display_name,
    user_role,
    user_is_approved,
    NOW(),
    NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check if a user is an admin without causing recursion
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

-- Add policy to allow public profile creation during signup
CREATE POLICY "Allow public profile creation during signup" 
  ON profiles FOR INSERT 
  WITH CHECK (true);
  
-- Add policy to allow users to read their own profile
CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);
  
-- Add policy to allow users to update their own profile
CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);
  
-- Add policy to allow admins to view all profiles using the is_admin function
CREATE POLICY "Admins can view all profiles" 
  ON profiles FOR SELECT 
  USING (is_admin());
