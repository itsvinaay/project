import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';
import * as FileSystem from 'expo-file-system';

// Replace with your Supabase URL and anon key
const supabaseUrl = 'https://xmnvxcdyiurzzmcvoaal.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtbnZ4Y2R5aXVyenptY3ZvYWFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4NjkyMTIsImV4cCI6MjA2NDQ0NTIxMn0.kQZ3GI9w_DxNx_8FTtkfoi2s5BRysQlwWv0H8xYsoS0';

// For operations that need to bypass RLS (like creating profiles during signup)
// You'll need to create a service role key in your Supabase dashboard
// WARNING: Keep this key secure and never expose it to clients
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtbnZ4Y2R5aXVyenptY3ZvYWFsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODg2OTIxMiwiZXhwIjoyMDY0NDQ1MjEyfQ.-Q4crg7q026QYRr4h5ZyjoMNC1jRgxFJmYo_WC7xHTg'; // Replace with your actual service role key

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Service role client for admin operations (bypasses RLS)
// Only use this for server-side operations or in secure contexts
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// User types
export type UserRole = 'admin' | 'trainer' | 'nutritionist' | 'client';

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  role: UserRole;
  photo_url?: string;
  is_approved: boolean;
  approved_at?: string;
  approved_by?: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalTrainers: number;
  totalNutritionists: number;
}

// Auth functions
export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      // Handle 'Email not confirmed' error specifically
      if (error.message.includes('Email not confirmed')) {
        console.log('Email not confirmed, attempting to resend confirmation email...');
        
        // Try to resend confirmation email
        const { error: resendError } = await supabase.auth.resend({
          type: 'signup',
          email,
        });
        
        if (resendError) {
          console.error('Error resending confirmation email:', resendError);
        } else {
          console.log('Confirmation email resent successfully');
        }
        
        // For development purposes, we can try to auto-confirm the email
        // by signing in again (only works if email confirmation is disabled in Supabase)
        const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (!retryError) {
          return retryData;
        }
        
        // If we still have an error, throw a more user-friendly message
        throw new Error('Your email is not confirmed. Please check your inbox for a confirmation email.');
      }
      
      // Handle other errors
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
};

export const signUp = async (email: string, password: string, displayName: string, role: UserRole = 'client') => {
  try {
    // Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (authError) {
      console.error('Auth error during signup:', authError);
      const errorMessage = authError.message || 'Authentication failed';
      throw new Error(errorMessage);
    }
    
    if (authData.user) {
      try {
        // Use the RPC function first as it's designed to bypass RLS
        // This calls a server-side function that can bypass RLS
        const { error: rpcError } = await supabase.rpc('create_profile', {
          user_id: authData.user.id,
          user_email: email,
          user_display_name: displayName,
          user_role: role,
          user_is_approved: role === 'client'
        });
        
        if (rpcError) {
          console.error('Profile creation error with RPC:', rpcError);
          
          // Fallback to direct insert if RPC fails (maybe function doesn't exist yet)
          console.log('Falling back to direct insert method...');
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: authData.user.id,
              email: email,
              display_name: displayName,
              role: role,
              is_approved: role === 'client', // Auto-approve clients
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
            
          if (profileError) {
            console.error('Profile creation error with direct insert:', profileError);
            throw new Error(profileError.message || 'Failed to create user profile');
          }
        }
      } catch (insertError: any) {
        console.error('Error creating profile:', insertError);
        throw new Error(insertError.message || 'Failed to create user profile');
      }
    } else {
      throw new Error('User registration failed - no user data returned');
    }
    
    return authData;
  } catch (error: any) {
    console.error('Sign up error:', error);
    throw error;
  }
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    console.log('Fetching profile for user:', userId);
    
    // Try direct query first with RLS
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (!error && data) {
      console.log('Successfully fetched profile with direct query');
      return data as UserProfile;
    }

    console.log('Direct query failed, trying with RPC function...');
    
    // Try with RPC function if direct query fails
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('get_profile_bypass_rls', { p_user_id: userId });
      
    if (!rpcError && rpcData) {
      console.log('Successfully fetched profile with RPC function, raw rpcData:', JSON.stringify(rpcData, null, 2));
      // If rpcData is an array, take the first element, otherwise use it directly
      const profileData = Array.isArray(rpcData) ? rpcData[0] : rpcData;
      if (profileData) {
        return profileData as UserProfile;
      }
    }
    
    console.error('RPC function failed:', rpcError);
    
    // If we have a service role key, try with admin client
    if (supabaseServiceKey && supabaseServiceKey !== 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtbnZ4Y2R5aXVyenptY3ZvYWFsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODg2OTIxMiwiZXhwIjoyMDY0NDQ1MjEyfQ.-Q4crg7q026QYRr4h5ZyjoMNC1jRgxFJmYo_WC7xHTg') {
      console.log('Trying with admin client...');
      const { data: adminData, error: adminError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      if (!adminError && adminData) {
        console.log('Successfully fetched profile with admin client');
        return adminData as UserProfile;
      }
      console.error('Admin client fetch failed:', adminError);
    }
    
    // If all else fails, create a minimal profile
    const currentUser = await supabase.auth.getUser();
    if (currentUser.data?.user) {
      console.log('Creating minimal profile from auth data');
      return {
        id: currentUser.data.user.id,
        email: currentUser.data.user.email || '',
        display_name: currentUser.data.user.email?.split('@')[0] || 'User',
        role: 'client',
        is_approved: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as UserProfile;
    }
    
    console.error('All profile fetch attempts failed');
    return null;
    
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return null;
  }
};

export const updateUserProfile = async (userId: string, data: Partial<UserProfile>) => {
  const { error } = await supabase
    .from('profiles')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);
    
  if (error) throw error;
};

export const getPendingApprovalUsers = async (): Promise<UserProfile[]> => {
  console.log('[Supabase] Fetching pending approval users...');
  try {
    console.log('[Supabase] Using supabaseAdmin client');
    
    const { data, error, status, count } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact' })
      .eq('is_approved', false)
      .in('role', ['trainer', 'nutritionist']);

    console.log('[Supabase] Query completed with status:', status);
    console.log('[Supabase] Raw response data:', JSON.stringify(data, null, 2));
    console.log('[Supabase] Total count of pending users:', count);
    
    if (error) {
      console.error('[Supabase] Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }

    console.log(`[Supabase] Successfully fetched ${data?.length || 0} pending users`);
    return data || [];
  } catch (error) {
    console.error('[Supabase] Unexpected error in getPendingApprovalUsers:', error);
    throw error;
  }
};

export const approveUser = async (userId: string, adminId: string): Promise<UserProfile | null> => {
  console.log(`[SupabaseAdmin] Approving user ${userId} by admin ${adminId}`);
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({
      is_approved: true,
      approved_at: new Date().toISOString(),
      approved_by: adminId,
      updated_at: new Date().toISOString(), // Also update updated_at
    })
    .eq('id', userId)
    .select()
    .single(); // Expect a single profile back

  if (error) {
    console.error('[SupabaseAdmin] Error approving user:', error);
    throw error;
  }
  console.log('[SupabaseAdmin] User approved:', data);
  return data;
};

export const rejectUser = async (userId: string): Promise<void> => {
  console.log(`[SupabaseAdmin] Rejecting (deleting) user profile ${userId}`);
  // Correctly await the full Supabase operation before destructuring
  const { error } = await supabaseAdmin
    .from('profiles')
    .delete()
    .eq('id', userId);

  if (error) {
    console.error('[SupabaseAdmin] Error rejecting user profile:', error);
    throw error;
  }
  console.log('[SupabaseAdmin] User profile rejected (deleted) successfully.');
};

export interface ActivityLog {
  id?: string;
  user_id: string;
  type: 'sleep' | 'water' | 'food' | 'workout' | 'steps' | 'heartRate';
  value: number;
  unit: string;
  notes?: string;
  date: string;
  created_at: string;
}

export const addActivityLog = async (activityData: Omit<ActivityLog, 'created_at'>) => {
  const { data, error } = await supabase
    .from('activity_logs')
    .insert({
      ...activityData,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const getActivityLogs = async (
  userId: string, 
  type?: ActivityLog['type'],
  startDate?: Date,
  endDate?: Date
) => {
  let query = supabase
    .from('activity_logs')
    .select('*')
    .eq('user_id', userId);
    
  if (type) query = query.eq('type', type);
  if (startDate) query = query.gte('date', startDate.toISOString());
  if (endDate) query = query.lte('date', endDate.toISOString());
  
  const { data, error } = await query;
  if (error) throw error;
  return data as ActivityLog[];
};

export interface WorkoutPlan {
  id?: string;
  trainer_id: string;
  user_id: string;
  title: string;
  description: string;
  exercises: {
    name: string;
    sets: number;
    reps: number;
    weight?: number;
    duration?: number;
    notes?: string;
  }[];
  start_date: string;
  end_date?: string;
  created_at: string;
}

export interface MealPlan {
  id?: string;
  nutritionist_id: string;
  user_id: string;
  title: string;
  description: string;
  meals: {
    type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    foods: {
      name: string;
      serving_size: string;
      calories: number;
      protein?: number;
      carbs?: number;
      fat?: number;
    }[];
    notes?: string;
  }[];
  start_date: string;
  end_date?: string;
  created_at: string;
}

export const addWorkoutPlan = async (workoutData: Omit<WorkoutPlan, 'created_at'>) => {
  const { data, error } = await supabase
    .from('workout_plans')
    .insert({
      ...workoutData,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const addMealPlan = async (mealData: Omit<MealPlan, 'created_at'>) => {
  const { data, error } = await supabase
    .from('meal_plans')
    .insert({
      ...mealData,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding meal plan:', error);
    throw error;
  }

  return data;
};

export interface ProgressPhoto {
  id?: string;
  user_id: string;
  image_url: string;
  thumbnail_url: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export const uploadProgressPhoto = async (userId: string, fileUri: string, notes?: string): Promise<ProgressPhoto> => {
  try {
    // Generate a unique file name
    const fileName = `${userId}/${Date.now()}.jpg`;
    const fileExt = fileUri.split('.').pop();
    const filePath = `progress_photos/${fileName}.${fileExt}`;
    
    // Read the file
    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    // Upload the file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('progress-photos')
      .upload(filePath, FileSystem.EncodingType.Base64, {
        contentType: `image/${fileExt}`,
        upsert: false,
      });
    
    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      throw uploadError;
    }
    
    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('progress-photos')
      .getPublicUrl(filePath);
    
    // Create a thumbnail (in a real app, you might want to generate a thumbnail)
    const thumbnailUrl = publicUrl; // Use the same URL for now
    
    // Save the photo metadata to the database
    const { data: photoData, error: dbError } = await supabase
      .from('progress_photos')
      .insert({
        user_id: userId,
        image_url: publicUrl,
        thumbnail_url: thumbnailUrl,
        notes,
      })
      .select()
      .single();
    
    if (dbError) {
      console.error('Error saving photo metadata:', dbError);
      throw dbError;
    }
    
    return photoData;
  } catch (error) {
    console.error('Error in uploadProgressPhoto:', error);
    throw error;
  }
};

export const getProgressPhotos = async (userId: string): Promise<ProgressPhoto[]> => {
  try {
    const { data, error } = await supabase
      .from('progress_photos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching progress photos:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getProgressPhotos:', error);
    throw error;
  }
};

/**
 * Fetches all users with pagination and filtering
 * @param page Page number (1-based)
 * @param pageSize Number of users per page
 * @param searchQuery Optional search query to filter users by name or email
 * @param role Optional role to filter users by
 */
export const getAllUsers = async (
  page: number = 1,
  pageSize: number = 10,
  searchQuery: string = '',
  role?: string
): Promise<{ users: UserProfile[], total: number }> => {
  console.log('[getAllUsers] Starting with params:', { page, pageSize, searchQuery, role });
  
  try {
    if (!supabaseAdmin) {
      throw new Error('Supabase client is not initialized');
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    console.log('[getAllUsers] Building query...');
    
    // Initialize the base query
    let query = supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact' });

    // Apply ordering
    query = query.order('created_at', { ascending: false });
    
    // Apply pagination only if pageSize is greater than 0
    if (pageSize > 0) {
      query = query.range(from, to);
    }
    
    // Apply search filter if provided
    if (searchQuery && searchQuery.trim() !== '') {
      console.log('[getAllUsers] Applying search filter:', searchQuery);
      query = query.or(`display_name.ilike.%${searchQuery.trim()}%,email.ilike.%${searchQuery.trim()}%`);
    }
    
    // Apply role filter if provided
    if (role && role.trim() !== '') {
      console.log('[getAllUsers] Applying role filter:', role);
      query = query.eq('role', role.trim());
    }
    
    console.log('[getAllUsers] Executing query...');
    const { data, error, count } = await query;
    
    if (error) {
      console.error('[getAllUsers] Error from Supabase:', error);
      throw error;
    }
    
    console.log(`[getAllUsers] Query successful. Found ${data?.length || 0} users (total: ${count || 0})`);
    
    // Ensure we always return an array, even if data is null/undefined
    const users = Array.isArray(data) ? data : [];
    
    return {
      users,
      total: count || 0
    };
  } catch (error) {
    console.error('Failed to fetch users:', error);
    throw error;
  }
};

/**
 * Updates a user's role
 * @param userId The ID of the user to update
 * @param role The new role
 * @param adminId The ID of the admin making the change
 */
export const updateUserRole = async (
  userId: string,
  role: UserRole,
  adminId: string
): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ 
        role,
        updated_at: new Date().toISOString(),
        approved_by: adminId,
        is_approved: true
      })
      .eq('id', userId)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

/**
 * Deactivates a user
 * @param userId The ID of the user to deactivate
 */
export const deactivateUser = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deactivating user:', error);
    throw error;
  }
};

export const getDashboardStats = async (): Promise<DashboardStats> => {
  console.log('[SupabaseAdmin] Fetching dashboard stats...');
  try {
    const { count: totalUsers, error: usersError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (usersError) {
      console.error('[SupabaseAdmin] Error fetching total users count:', usersError);
      throw usersError;
    }

    const { count: totalTrainers, error: trainersError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'trainer');

    if (trainersError) {
      console.error('[SupabaseAdmin] Error fetching total trainers count:', trainersError);
      throw trainersError;
    }

    const { count: totalNutritionists, error: nutritionistsError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'nutritionist');

    if (nutritionistsError) {
      console.error('[SupabaseAdmin] Error fetching total nutritionists count:', nutritionistsError);
      throw nutritionistsError;
    }
    
    const stats: DashboardStats = {
      totalUsers: totalUsers ?? 0,
      totalTrainers: totalTrainers ?? 0,
      totalNutritionists: totalNutritionists ?? 0,
    };
    console.log('[SupabaseAdmin] Dashboard stats fetched:', stats);
    return stats;

  } catch (error) {
    console.error('[SupabaseAdmin] Error in getDashboardStats:', error);
    throw new Error('Failed to fetch dashboard statistics.');
  }
};