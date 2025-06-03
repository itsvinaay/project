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

-- First, drop any existing policies that might be causing recursion
DROP POLICY IF EXISTS "Allow public profile creation during signup" ON profiles;

-- Add policy to allow public profile creation during signup
CREATE POLICY "Allow public profile creation during signup" 
  ON profiles FOR INSERT 
  WITH CHECK (true);
  
-- Add policy to allow users to read their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);
  
-- Add policy to allow users to update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);
  
-- Add policy to allow admins to view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" 
  ON profiles FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
