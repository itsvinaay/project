import React from 'react';
import { Tabs } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { Chrome as Home, Plus, User } from 'lucide-react-native';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { useAuth } from '@/context/AuthContext';

export default function TabLayout() {
  const theme = useTheme();
  const { userProfile } = useAuth();
  
  if (!userProfile || userProfile.role !== 'client') {
    return null;
  }
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary[500],
        tabBarInactiveTintColor: theme.colors.dark[400],
        tabBarStyle: {
          backgroundColor: theme.colors.dark[950],
          borderTopColor: theme.colors.dark[800],
          height: theme.spacing[15],
          paddingBottom: theme.spacing[2],
        },
        tabBarLabelStyle: {
          fontFamily: theme.fontFamily.medium,
          fontSize: theme.fontSize.sm,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="add"
        options={{
          title: '',
          tabBarIcon: ({ color }) => (
            <View style={[styles.addButton, { backgroundColor: theme.colors.primary[500] }]}>
              <Plus size={24} color={theme.colors.dark[950]} />
            </View>
          ),
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <User size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: 'currentColor',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
  },
});