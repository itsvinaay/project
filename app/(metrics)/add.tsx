import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '@/context/ThemeContext';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import { ChevronDown, ChevronLeft } from 'lucide-react-native';
import { metricConfig } from '@/constants/metrics';
import { addMetricEntry } from '@/services/metricDataService';

export default function AddMetricScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Get metric type from params or default to 'weight'
  const metricId = typeof params.id === 'string' ? params.id : 'weight';
  
  // Get config for this metric type
  const config = metricConfig[metricId as keyof typeof metricConfig] || metricConfig.weight;
  
  const [value, setValue] = useState(config.defaultValue);
  const [unit, setUnit] = useState(config.units[0]);
  // Initialize with current date and time
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
  
  const handleAddMetric = () => {
    // Format date as ISO string for consistent storage
    const entryDate = new Date(selectedDate);
    // Combine date and time
    entryDate.setHours(selectedTime.getHours());
    entryDate.setMinutes(selectedTime.getMinutes());
    
    // Save the metric entry to our data service
    addMetricEntry({
      metricId: metricId,
      value: value,
      unit: unit,
      date: entryDate.toISOString(), // Store as ISO string for consistent parsing
      time: time
    });
    
    // Navigate to the metric detail screen using replace to force a refresh
    router.replace({
      pathname: '/(metrics)/[id]',
      params: { id: metricId }
    });
  };
  
  const handleUnitPress = () => {
    // Toggle between available units
    const currentIndex = config.units.indexOf(unit);
    const nextIndex = (currentIndex + 1) % config.units.length;
    setUnit(config.units[nextIndex]);
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
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.content}>
          <Text style={[styles.headerTitle, { 
            color: theme.colors.text.primary,
            fontFamily: theme.fontFamily.semiBold
          }]}>
            Add data
          </Text>
          
          {/* Metric Input Section */}
          <View style={styles.inputSection}>
            <Text style={[styles.inputLabel, { 
              color: theme.colors.text.primary,
              fontFamily: theme.fontFamily.medium
            }]}>
              {config.label}
            </Text>
            
            <View style={styles.weightInputContainer}>
              <TextInput
                style={[styles.weightInput, { 
                  color: theme.colors.text.primary,
                  fontFamily: theme.fontFamily.semiBold
                }]}
                value={value}
                onChangeText={setValue}
                keyboardType="numeric"
              />
              
              <TouchableOpacity 
                style={styles.unitSelector}
                onPress={handleUnitPress}
              >
                <Text style={[styles.unitText, { 
                  color: theme.colors.text.primary,
                  fontFamily: theme.fontFamily.medium
                }]}>
                  {unit}
                </Text>
                {config.units.length > 1 && (
                  <ChevronDown size={16} color={theme.colors.text.secondary} />
                )}
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Date Section */}
          <View style={styles.inputSection}>
            <Text style={[styles.inputLabel, { 
              color: theme.colors.text.primary,
              fontFamily: theme.fontFamily.medium
            }]}>
              Date
            </Text>
            
            <TouchableOpacity 
              style={styles.dateTimeContainer}
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
          </View>
          
          {/* Time Section */}
          <View style={styles.inputSection}>
            <Text style={[styles.inputLabel, { 
              color: theme.colors.text.primary,
              fontFamily: theme.fontFamily.medium
            }]}>
              Time
            </Text>
            
            <TouchableOpacity 
              style={styles.dateTimeContainer}
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
          </View>
        </View>
        
        {/* Add Button */}
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: theme.colors.primary[500] }]}
          onPress={handleAddMetric}
        >
          <Text style={[styles.addButtonText, { 
            color: theme.colors.white,
            fontFamily: theme.fontFamily.semiBold
          }]}>
            Add
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  headerTitle: {
    fontSize: 24,
    textAlign: 'center',
    marginVertical: 24,
  },
  inputSection: {
    marginBottom: 32,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 16,
  },
  weightInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 8,
  },
  weightInput: {
    fontSize: 32,
    textAlign: 'center',
    minWidth: 80,
  },
  unitSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  unitText: {
    fontSize: 24,
    marginRight: 4,
  },
  dateTimeContainer: {
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 8,
  },
  dateTimeText: {
    fontSize: 24,
  },
  addButton: {
    marginHorizontal: 24,
    marginBottom: 24,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
  },
});
