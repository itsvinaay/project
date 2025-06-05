import { Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function AdminLayout() {
  const { userProfile } = useAuth();
  const router = useRouter();
  
  // Redirect if not an admin
  useEffect(() => {
    if (userProfile && userProfile.role !== 'admin') {
      router.replace('/(tabs)');
    }
  }, [userProfile, router]);
  
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="manage-users" />
    </Stack>
  );
}