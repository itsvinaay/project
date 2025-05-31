import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import DateSelector from '@/components/DateSelector';
import StepCard from '@/components/StepCard';
import SleepCard from '@/components/SleepCard';
import WaterCard from '@/components/WaterCard';
import HeartRateCard from '@/components/HeartRateCard';
import WalkMap from '@/components/WalkMap';
import { Bell } from 'lucide-react-native';
import dayjs from 'dayjs';
import { getActivityLogs, addActivityLog, Timestamp } from '@/utils/firebase';

// Sample data - in a real app, this would come from Firebase and/or Google Fit API
const SAMPLE_DATA = {
  steps: {
    data: [2341, 6423, 5243, 8675, 7654, 9876, 8543],
    dates: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    goal: 10000,
    today: 8543,
  },
  sleep: {
    data: [6.7, 7.2, 5.8, 8.1, 7.5, 6.9, 7.8],
    dates: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    goal: 8,
    today: 7.8,
  },
  heartRate: {
    data: [68, 72, 75, 82, 79, 76, 71, 73],
    times: ['6am', '8am', '10am', '12pm', '2pm', '4pm', '6pm', '8pm'],
    current: 73,
    resting: 65,
  },
  water: {
    goal: 8,
    current: 5,
  },
  recentWalk: {
    route: [
      { latitude: 37.78825, longitude: -122.4324 },
      { latitude: 37.78843, longitude: -122.4325 },
      { latitude: 37.78856, longitude: -122.4332 },
      { latitude: 37.78865, longitude: -122.4341 },
      { latitude: 37.78875, longitude: -122.4350 },
      { latitude: 37.78895, longitude: -122.4365 },
      { latitude: 37.78915, longitude: -122.4380 },
      { latitude: 37.78925, longitude: -122.4390 },
      { latitude: 37.78935, longitude: -122.4395 },
    ],
    distance: 1240, // meters
    duration: 15, // minutes
    date: 'Today, 8:30 AM',
  },
};

export default function DashboardScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [waterCount, setWaterCount] = useState(SAMPLE_DATA.water.current);
  const [isLoading, setIsLoading] = useState(false);
  
  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    // In a real app, this would fetch data for the selected date
    setIsLoading(true);
    
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };
  
  // Handle water increment
  const incrementWater = async () => {
    setWaterCount(prev => {
      const newCount = prev + 1;
      
      // In a real app, this would update Firebase
      if (user) {
        addActivityLog({
          userId: user.uid,
          type: 'water',
          value: newCount,
          unit: 'glasses',
          date: Timestamp.now(),
        });
      }
      
      return newCount;
    });
  };
  
  // Handle water decrement
  const decrementWater = async () => {
    setWaterCount(prev => {
      if (prev <= 0) return 0;
      
      const newCount = prev - 1;
      
      // In a real app, this would update Firebase
      if (user) {
        addActivityLog({
          userId: user.uid,
          type: 'water',
          value: newCount,
          unit: 'glasses',
          date: Timestamp.now(),
        });
      }
      
      return newCount;
    });
  };
  
  // Load user data on component mount
  useEffect(() => {
    if (user) {
      // In a real app, this would fetch user's activity data from Firebase
      // fetchUserData();
    }
  }, [user]);
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { 
              color: theme.colors.text.primary,
              fontFamily: theme.fontFamily.regular
            }]}>
              Good morning,
            </Text>
            <Text style={[styles.userName, { 
              color: theme.colors.text.primary,
              fontFamily: theme.fontFamily.semiBold
            }]}>
              {user?.displayName || 'User'}
            </Text>
          </View>
          
          <TouchableOpacity style={[styles.notificationButton, { backgroundColor: theme.colors.background.card }]}>
            <Bell size={20} color={theme.colors.text.primary} />
          </TouchableOpacity>
        </View>
        
        <DateSelector onDateSelect={handleDateSelect} />
        
        <StepCard 
          steps={SAMPLE_DATA.steps.data}
          dates={SAMPLE_DATA.steps.dates}
          goal={SAMPLE_DATA.steps.goal}
          todaySteps={SAMPLE_DATA.steps.today}
          isLoading={isLoading}
        />
        
        <SleepCard 
          sleepData={SAMPLE_DATA.sleep.data}
          dates={SAMPLE_DATA.sleep.dates}
          todaySleep={SAMPLE_DATA.sleep.today}
          goal={SAMPLE_DATA.sleep.goal}
          isLoading={isLoading}
        />
        
        <WaterCard 
          current={waterCount}
          goal={SAMPLE_DATA.water.goal}
          onIncrement={incrementWater}
          onDecrement={decrementWater}
        />
        
        <HeartRateCard 
          heartRateData={SAMPLE_DATA.heartRate.data}
          times={SAMPLE_DATA.heartRate.times}
          currentRate={SAMPLE_DATA.heartRate.current}
          restingRate={SAMPLE_DATA.heartRate.resting}
          isLoading={isLoading}
        />
        
        <WalkMap 
          route={SAMPLE_DATA.recentWalk.route}
          distance={SAMPLE_DATA.recentWalk.distance}
          duration={SAMPLE_DATA.recentWalk.duration}
          date={SAMPLE_DATA.recentWalk.date}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 56,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 16,
  },
  userName: {
    fontSize: 24,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});