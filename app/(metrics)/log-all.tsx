import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
  TextInput,
  ScrollView
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '@/context/ThemeContext';
import { useRouter, Stack } from 'expo-router';
import { ChevronDown, ChevronLeft } from 'lucide-react-native';
import { addMultipleMetricEntries } from '@/services/metricDataService';

// Define metric types and their default units
const metricsList = [
  { id: 'weight', label: 'Weight', defaultValue: '', units: ['kg', 'lbs'] },
  { id: 'chest', label: 'Chest', defaultValue: '', units: ['in', 'cm'] },
  { id: 'shoulders', label: 'Shoulders', defaultValue: '', units: ['in', 'cm'] },
  { id: 'waist', label: 'Waist', defaultValue: '', units: ['in', 'cm'] },
  { id: 'thigh', label: 'Thigh', defaultValue: '', units: ['in', 'cm'] },
  { id: 'hip', label: 'Hip', defaultValue: '', units: ['in', 'cm'] },
  { id: 'bodyFat', label: 'Body Fat', defaultValue: '', units: ['%'] },
  { id: 'bicep', label: 'Bicep', defaultValue: '', units: ['in', 'cm'] },
  { id: 'waterIntake', label: 'Water Intake', defaultValue: '', units: ['ml', 'oz'] },
];

export default function LogAllMetricsScreen() {
  const theme = useTheme();
  const router = useRouter();
  
  // State for metric values and units
  const [metrics, setMetrics] = useState(
    metricsList.map(metric => ({
      id: metric.id,
      value: metric.defaultValue,
      unit: metric.units[0]
    }))
  );
  
  // State for date and time
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedTime, setSelectedTime] = useState(today);
  
  // Formatted date and time strings for display
  const [date, setDate] = useState(today.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  }));
  
  const [time, setTime] = useState(today.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }));
  
  // State for showing pickers
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  const handleUpdateMetric = (id: string, value: string) => {
    setMetrics(metrics.map(metric => 
      metric.id === id ? { ...metric, value } : metric
    ));
  };
  
  const handleUpdateUnit = (id: string) => {
    // Find the metric
    const metricIndex = metrics.findIndex(m => m.id === id);
    if (metricIndex === -1) return;
    
    // Get the metric config
    const config = metricsList.find(m => m.id === id);
    if (!config) return;
    
    // Get current unit and find next unit
    const currentUnit = metrics[metricIndex].unit;
    const currentUnitIndex = config.units.indexOf(currentUnit);
    const nextUnitIndex = (currentUnitIndex + 1) % config.units.length;
    
    // Update the unit
    const updatedMetrics = [...metrics];
    updatedMetrics[metricIndex].unit = config.units[nextUnitIndex];
    setMetrics(updatedMetrics);
  };
  
  // Date picker handlers
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSelectedDate(selectedDate);
      setDate(selectedDate.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
      }));
    }
  };
  
  // Time picker handlers
  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setSelectedTime(selectedTime);
      setTime(selectedTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }));
    }
  };
  
  const handleUpdate = () => {
    // Create entries for all metrics with values
    const entries = metrics
      .filter(metric => metric.value.trim() !== '') // Only include metrics with values
      .map(metric => ({
        metricId: metric.id,
        value: metric.value,
        unit: metric.unit,
        date: date,
        time: time
      }));
    
    // Save all entries
    if (entries.length > 0) {
      addMultipleMetricEntries(entries);
    }
    
    // Navigate back to metrics index
    router.push('/(metrics)');
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Log all metrics',
          headerTitleStyle: { 
            fontFamily: theme.fontFamily.semiBold,
            color: theme.colors.text.primary
          },
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
        {/* Metrics Inputs */}
        {metricsList.map((metricConfig) => {
          const metric = metrics.find(m => m.id === metricConfig.id) || { 
            id: metricConfig.id, 
            value: '', 
            unit: metricConfig.units[0] 
          };
          
          return (
            <View key={metricConfig.id} style={styles.metricContainer}>
              <Text style={[styles.metricLabel, { 
                color: theme.colors.text.primary,
                fontFamily: theme.fontFamily.medium
              }]}>
                {metricConfig.label}
              </Text>
              
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, { 
                    color: theme.colors.text.primary,
                    fontFamily: theme.fontFamily.regular
                  }]}
                  value={metric.value}
                  onChangeText={(value) => handleUpdateMetric(metricConfig.id, value)}
                  placeholder="-"
                  placeholderTextColor={theme.colors.text.primary}
                  keyboardType="numeric"
                />
                
                <TouchableOpacity 
                  style={styles.unitSelector}
                  onPress={() => handleUpdateUnit(metricConfig.id)}
                  disabled={metricConfig.units.length <= 1}
                >
                  <Text style={[styles.unitText, { 
                    color: theme.colors.text.primary,
                    fontFamily: theme.fontFamily.medium
                  }]}>
                    {metric.unit}
                  </Text>
                  {metricConfig.units.length > 1 && (
                    <ChevronDown size={16} color={theme.colors.text.secondary} />
                  )}
                </TouchableOpacity>
              </View>
              
              <View style={[styles.divider, { backgroundColor: theme.colors.text.secondary + '20' }]} />
            </View>
          );
        })}
        
        {/* Date Section */}
        <View style={styles.metricContainer}>
          <Text style={[styles.metricLabel, { 
            color: theme.colors.text.primary,
            fontFamily: theme.fontFamily.medium
          }]}>
            Date
          </Text>
          
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={[styles.dateTimeText, { 
              color: theme.colors.text.primary,
              fontFamily: theme.fontFamily.semiBold
            }]}>
              {date}
            </Text>
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
          
          <View style={[styles.divider, { backgroundColor: theme.colors.text.secondary + '20' }]} />
        </View>
        
        {/* Time Section */}
        <View style={styles.metricContainer}>
          <Text style={[styles.metricLabel, { 
            color: theme.colors.text.primary,
            fontFamily: theme.fontFamily.medium
          }]}>
            Time
          </Text>
          
          <TouchableOpacity
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={[styles.dateTimeText, { 
              color: theme.colors.text.primary,
              fontFamily: theme.fontFamily.semiBold
            }]}>
              {time}
            </Text>
          </TouchableOpacity>
          
          {showTimePicker && (
            <DateTimePicker
              value={selectedTime}
              mode="time"
              display="default"
              onChange={handleTimeChange}
            />
          )}
          
          <View style={[styles.divider, { backgroundColor: theme.colors.text.secondary + '20' }]} />
        </View>
      </ScrollView>
      
      {/* Update Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.updateButton, { backgroundColor: theme.colors.primary[500] }]}
          onPress={handleUpdate}
        >
          <Text style={[styles.updateButtonText, { 
            color: theme.colors.white,
            fontFamily: theme.fontFamily.semiBold
          }]}>
            Update
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  metricContainer: {
    marginVertical: 12,
  },
  metricLabel: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  input: {
    fontSize: 18,
    textAlign: 'center',
    minWidth: 40,
  },
  unitSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  unitText: {
    fontSize: 18,
    marginRight: 4,
  },
  divider: {
    height: 1,
    marginTop: 12,
  },
  dateTimeText: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 8,
  },
  buttonContainer: {
    padding: 24,
  },
  updateButton: {
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  updateButtonText: {
    fontSize: 16,
  },
});
