import { Stack } from 'expo-router';

export default function YouLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="metrics"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="metrics/[metric]"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="metrics/log"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="steps"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="activity-history"
        options={{
          title: 'Activity History',
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: '#F8FAFC',
          },
          headerTintColor: '#1E293B',
        }}
      />
      <Stack.Screen
        name="exercises"
        options={{
          title: 'Your Exercises',
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: '#F8FAFC',
          },
          headerTintColor: '#1E293B',
        }}
      />
      <Stack.Screen
        name="progress-photos"
        options={{
          title: 'Progress Photos',
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: '#F8FAFC',
          },
          headerTintColor: '#1E293B',
        }}
      />
    </Stack>
  );
}