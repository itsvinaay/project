import { Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function NutritionistLayout() {
  const { userProfile } = useAuth();
  const router = useRouter();
  
  // Redirect if not a nutritionist
  useEffect(() => {
    if (userProfile && userProfile.role !== 'nutritionist') {
      router.replace('/(tabs)');
    }
  }, [userProfile, router]);
  
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}