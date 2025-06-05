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
import { useTheme } from '@/context/ThemeContext';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, ChevronDown } from 'lucide-react-native';
// Using built-in Date functionality instead of date-fns

export default function AddMetricScreen() {
  const theme = useTheme();
  const router = useRouter();
  
  const [weight, setWeight] = useState('58');
  const [unit, setUnit] = useState('kg');
  
  // Format date and time using built-in JavaScript methods
  const now = new Date();
  const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const currentTime = now.toTimeString().substring(0, 5); // HH:MM
  const formattedDateTime = `Today, ${now.toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})}`;
  
  const handleAddMetric = () => {
    // Here you would save the data to your database
    // For now, we'll just navigate back
    router.back();
  };
  
  const handleUnitPress = () => {
    // In a real app, this would show a unit picker
    setUnit(unit === 'kg' ? 'lb' : 'kg');
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
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <Text style={[styles.headerTitle, { 
          color: theme.colors.text.primary,
          fontFamily: theme.fontFamily.semiBold
        }]}>
          Add data
        </Text>
        
        <View style={styles.formSection}>
          <Text style={[styles.sectionLabel, { 
            color: theme.colors.text.primary,
            fontFamily: theme.fontFamily.medium
          }]}>
            Weight
          </Text>
          
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.weightInput, { 
                color: theme.colors.text.primary,
                fontFamily: theme.fontFamily.semiBold
              }]}
              value={weight}
              onChangeText={setWeight}
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
              <ChevronDown size={20} color={theme.colors.text.primary} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
        
        <View style={styles.formSection}>
          <Text style={[styles.sectionLabel, { 
            color: theme.colors.text.primary,
            fontFamily: theme.fontFamily.medium
          }]}>
            Date & Time
          </Text>
          
          <Text style={[styles.dateTimeText, { 
            color: theme.colors.text.primary,
            fontFamily: theme.fontFamily.semiBold
          }]}>
            {formattedDateTime}
          </Text>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: theme.colors.primary[500] }]}
            onPress={handleAddMetric}
          >
            <Text style={[styles.addButtonText, { 
              color: theme.colors.text.white,
              fontFamily: theme.fontFamily.semiBold
            }]}>
              Add
            </Text>
          </TouchableOpacity>
        </View>
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
  contentContainer: {
    padding: 24,
  },
  headerTitle: {
    fontSize: 24,
    marginBottom: 32,
    textAlign: 'center',
  },
  formSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  weightInput: {
    fontSize: 32,
    textAlign: 'center',
    width: 80,
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
  divider: {
    height: 1,
    width: '100%',
    marginVertical: 16,
  },
  dateTimeText: {
    fontSize: 24,
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 48,
  },
  addButton: {
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 18,
  },
});
