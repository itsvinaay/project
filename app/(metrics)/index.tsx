import React, { useState, useEffect } from 'react';
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
import { hasMetricData, getMetricEntries, MetricEntry } from '@/services/metricDataService';
import { metricConfig } from '@/constants/metrics';

// List of metrics to track
const metricsList = [
  { id: 'weight', name: 'Weight' },
  { id: 'chest', name: 'Chest' },
  { id: 'shoulders', name: 'Shoulders' },
  { id: 'waist', name: 'Waist' },
  { id: 'thigh', name: 'Thigh' },
  { id: 'hip', name: 'Hip' },
  { id: 'bodyFat', name: 'Body Fat' },
  { id: 'bicep', name: 'Bicep' },
  { id: 'waterIntake', name: 'Water Intake' },
  { id: 'steps', name: 'Steps' },
];

export default function MetricsScreen() {
  const theme = useTheme();
  const router = useRouter();
  
  // State to store metric data
  const [metricsData, setMetricsData] = useState<{[key: string]: {value: string, unit: string, updated: string}}>({});
  
  // Fetch metrics data
  useEffect(() => {
    const fetchMetricsData = () => {
      const data: {[key: string]: {value: string, unit: string, updated: string}} = {};
      
      // Fetch data for each metric
      metricsList.forEach(metric => {
        const entries = getMetricEntries(metric.id);
        if (entries.length > 0) {
          const latestEntry = entries[0]; // Entries are already sorted by newest first
          
          // Format the date for "updated" text
          const entryDate = new Date(latestEntry.date);
          const today = new Date();
          let updatedText = '';
          
          if (entryDate.toDateString() === today.toDateString()) {
            updatedText = 'updated today';
          } else {
            // Format as "MM/DD"
            updatedText = `updated ${entryDate.getMonth() + 1}/${entryDate.getDate()}`;
          }
          
          data[metric.id] = {
            value: latestEntry.value,
            unit: latestEntry.unit,
            updated: updatedText
          };
        }
      });
      
      setMetricsData(data);
    };
    
    fetchMetricsData();
    
    // Set up interval to refresh data
    const intervalId = setInterval(fetchMetricsData, 2000);
    return () => clearInterval(intervalId);
  }, []);
  
  const handleMetricPress = (metricId: string) => {
    console.log(`Handling metric press for: ${metricId}`);
    // Check if data exists for this metric
    if (hasMetricData(metricId)) {
      console.log(`Data exists for ${metricId}, navigating to detail screen`);
      // If data exists, navigate to the metric detail screen
      router.push({
        pathname: '/(metrics)/[id]',
        params: { id: metricId }
      });
    } else {
      console.log(`No data for ${metricId}, navigating to add screen`);
      // If no data exists, navigate to the add screen
      router.push({
        pathname: '/(metrics)/add',
        params: { id: metricId }
      });
    }
  };
  
  const handleLogAllMetrics = () => {
    // Navigate to log-all screen for logging all metrics at once
    router.push('/log-all');
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
                {metricsData[metric.id]?.updated && (
                  <Text style={[styles.metricUpdated, { 
                    color: theme.colors.text.secondary,
                    fontFamily: theme.fontFamily.regular
                  }]}>
                    {metricsData[metric.id].updated}
                  </Text>
                )}
              </View>
              
              <View style={styles.metricValueContainer}>
                {metricsData[metric.id]?.value ? (
                  <Text style={[styles.metricValue, { 
                    color: theme.colors.text.primary,
                    fontFamily: theme.fontFamily.semiBold
                  }]}>
                    {metricsData[metric.id].value} {metricsData[metric.id].unit}
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
