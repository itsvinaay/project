import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth, getUserProfile, UserProfile, UserRole } from '@/utils/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useRouter, useSegments } from 'expo-router';

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
      // Redirect to appropriate dashboard based on role
      if (userProfile) {
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
      } else {
        // Default to client dashboard if role not determined yet
        router.replace('/(tabs)');
      }
    }
  }, [user, isLoading, segments, router, userProfile]);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Get user profile from Firestore
        const profile = await getUserProfile(firebaseUser.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  // Auth methods
  const handleSignIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      await signIn(email, password);
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
      await signUp(email, password, displayName, role);
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut();
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

// Import firebase functions
import { signIn, signUp, signOut } from '@/utils/firebase';