import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getUserProfile, UserProfile, UserRole } from '@/utils/supabase';
import { supabase } from '@/utils/supabase';
import { useRouter, useSegments } from 'expo-router';
import { User, Session } from '@supabase/supabase-js';
import { Alert } from 'react-native';

// Auth context type
interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string, role?: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  isLoading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
});

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  // Handle routing based on auth state
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // Redirect to sign in if not signed in
      router.replace('/(auth)/signin');
    } else if (user && inAuthGroup) {
      // Check if user is approved before redirecting
      if (userProfile) {
        if (!userProfile.is_approved && userProfile.role !== 'client') {
          // Show pending approval message and redirect to sign in
          Alert.alert(
            'Account Pending Approval',
            'Your account is waiting for admin approval. Please try again later.',
            [
              {
                text: 'OK',
                onPress: () => {
                  handleSignOut();
                  router.replace('/(auth)/signin');
                }
              }
            ]
          );
        } else {
          // Redirect to appropriate dashboard based on role
          switch (userProfile.role) {
            case 'admin':
              router.replace('/(admin)');
              break;
            case 'trainer':
              router.replace('/(trainer)');
              break;
            case 'nutritionist':
              router.replace('/(nutritionist)');
              break;
            default:
              router.replace('/(tabs)');
              break;
          }
        }
      }
    }
  }, [user, isLoading, segments, router, userProfile]);

  // Listen for auth state changes
  useEffect(() => {
    // Set up Supabase auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        
        if (session?.user) {
          // Get user profile from Supabase
          const profile = await getUserProfile(session.user.id);
          setUserProfile(profile);
        } else {
          setUserProfile(null);
        }
        
        setIsLoading(false);
      }
    );

    // Initial session check
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        const profile = await getUserProfile(session.user.id);
        setUserProfile(profile);
      }
      setIsLoading(false);
    };

    initializeAuth();

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Auth methods
  const handleSignIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (
    email: string, 
    password: string, 
    displayName: string, 
    role: UserRole = 'client'
  ) => {
    try {
      setIsLoading(true);
      
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (authError) throw authError;
      
      if (authData.user) {
        // Create user profile in the profiles table
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
          
        if (profileError) throw profileError;
      }
    } catch (error: any) {
      // Improved error handling with more detailed error information
      console.error('Sign up error:', error);
      
      // Format the error message for better user feedback
      const errorMessage = error.message || 
                          (error.error_description || 
                          (error.details || 'An unknown error occurred during sign up'));
      
      // Create a new error with a better message
      const enhancedError = new Error(errorMessage);
      throw enhancedError;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isLoading,
        signIn: handleSignIn,
        signUp: handleSignUp,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth
export const useAuth = () => useContext(AuthContext);
