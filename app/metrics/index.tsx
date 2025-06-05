import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
  Image,
  ScrollView
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useRouter, Stack } from 'expo-router';
import { ChevronRight, ChevronLeft, BarChart2 } from 'lucide-react-native';

// List of metrics to track
const metricsList = [
  { id: 'weight', name: 'Weight', value: '58 kg', updated: 'updated today' },
  { id: 'chest', name: 'Chest', value: '36 in', updated: 'updated today' },
  { id: 'shoulders', name: 'Shoulders', value: '', updated: '' },
  { id: 'waist', name: 'Waist', value: '', updated: '' },
  { id: 'thigh', name: 'Thigh', value: '', updated: '' },
  { id: 'hip', name: 'Hip', value: '', updated: '' },
  { id: 'bodyFat', name: 'Body Fat', value: '', updated: '' },
  { id: 'bicep', name: 'Bicep', value: '', updated: '' },
  { id: 'waterIntake', name: 'Water Intake', value: '', updated: '' },
  { id: 'steps', name: 'Steps', value: '', updated: '' },
];

export default function MetricsScreen() {
  const theme = useTheme();
  const router = useRouter();
  
  const handleMetricPress = (metricId: string) => {
    // For weight, we have a dedicated screen
    if (metricId === 'weight') {
      router.push('/(metrics)/weight');
    } else {
      // For other metrics, navigate to the add screen with the metric ID
      router.push({
        pathname: '/(metrics)/add',
        params: { id: metricId }
      });
    }
  };
  
  const handleLogAllMetrics = () => {
    // Navigate to add screen with weight as default
    router.push({
      pathname: '/(metrics)/add',
      params: { id: 'weight' }
    });
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: '',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: theme.colors.background.primary },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ChevronLeft size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.headerContainer}>
          <View style={styles.iconContainer}>
            <BarChart2 size={64} color={theme.colors.primary[500]} />
          </View>
          <Text style={[styles.headerTitle, { 
            color: theme.colors.text.primary,
            fontFamily: theme.fontFamily.semiBold
          }]}>
            Metrics
          </Text>
        </View>
        
        <View style={styles.metricsContainer}>
          {metricsList.map((metric) => (
            <TouchableOpacity
              key={metric.id}
              style={[styles.metricItem, { backgroundColor: theme.colors.background.card }]}
              onPress={() => handleMetricPress(metric.id)}
            >
              <View style={styles.metricInfo}>
                <Text style={[styles.metricName, { 
                  color: theme.colors.text.primary,
                  fontFamily: theme.fontFamily.semiBold
                }]}>
                  {metric.name}
                </Text>
                {metric.updated && (
                  <Text style={[styles.metricUpdated, { 
                    color: theme.colors.text.secondary,
                    fontFamily: theme.fontFamily.regular
                  }]}>
                    {metric.updated}
                  </Text>
                )}
              </View>
              
              <View style={styles.metricValueContainer}>
                {metric.value ? (
                  <Text style={[styles.metricValue, { 
                    color: theme.colors.text.primary,
                    fontFamily: theme.fontFamily.semiBold
                  }]}>
                    {metric.value}
                  </Text>
                ) : null}
                <ChevronRight size={20} color={theme.colors.text.secondary} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
        
        <TouchableOpacity 
          style={styles.logAllButton}
          onPress={handleLogAllMetrics}
        >
          <Text style={[styles.logAllText, { 
            color: theme.colors.text.secondary,
            fontFamily: theme.fontFamily.medium
          }]}>
            Log all metrics
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  headerContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
  },
  metricsContainer: {
    paddingHorizontal: 16,
  },
  metricItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
  },
  metricInfo: {
    flex: 1,
  },
  metricName: {
    fontSize: 16,
    marginBottom: 4,
  },
  metricUpdated: {
    fontSize: 12,
  },
  metricValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 16,
    marginRight: 8,
  },
  logAllButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 16,
    marginBottom: 32,
  },
  logAllText: {
    fontSize: 16,
  },
});
