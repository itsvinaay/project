import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  TextInput,
  ScrollView,
  Alert
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { addActivityLog, Timestamp } from '@/utils/firebase';
import { 
  Bed, 
  Droplet, 
  Utensils, 
  Dumbbell, 
  ChevronDown, 
  ChevronUp,
  ArrowRight
} from 'lucide-react-native';

type ActivityType = 'sleep' | 'water' | 'food' | 'workout';

interface ActivityOption {
  type: ActivityType;
  label: string;
  icon: React.ReactNode;
  unit: string;
  placeholder: string;
}

export default function AddActivityScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  
  const [selectedType, setSelectedType] = useState<ActivityType>('sleep');
  const [value, setValue] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Activity options
  const activityOptions: ActivityOption[] = [
    {
      type: 'sleep',
      label: 'Sleep',
      icon: <Bed size={24} color={theme.colors.primary[500]} />,
      unit: 'hours',
      placeholder: 'e.g., 7.5',
    },
    {
      type: 'water',
      label: 'Water',
      icon: <Droplet size={24} color={theme.colors.primary[500]} />,
      unit: 'glasses',
      placeholder: 'e.g., 8',
    },
    {
      type: 'food',
      label: 'Food',
      icon: <Utensils size={24} color={theme.colors.primary[500]} />,
      unit: 'calories',
      placeholder: 'e.g., 500',
    },
    {
      type: 'workout',
      label: 'Workout',
      icon: <Dumbbell size={24} color={theme.colors.primary[500]} />,
      unit: 'minutes',
      placeholder: 'e.g., 45',
    },
  ];
  
  // Get current selected activity
  const currentActivity = activityOptions.find(option => option.type === selectedType);
  
  // Handle activity submission
  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to add an activity');
      return;
    }
    
    if (!value) {
      Alert.alert('Error', 'Please enter a value');
      return;
    }
    
    const numValue = parseFloat(value);
    
    if (isNaN(numValue)) {
      Alert.alert('Error', 'Please enter a valid number');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await addActivityLog({
        userId: user.uid,
        type: selectedType,
        value: numValue,
        unit: currentActivity?.unit || '',
        notes: notes,
        date: Timestamp.now(),
      });
      
      Alert.alert('Success', 'Activity added successfully');
      setValue('');
      setNotes('');
    } catch (error) {
      console.error('Error adding activity:', error);
      Alert.alert('Error', 'Failed to add activity. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={[styles.title, { 
            color: theme.colors.text.primary,
            fontFamily: theme.fontFamily.semiBold
          }]}>
            Add Activity
          </Text>
          <Text style={[styles.subtitle, { 
            color: theme.colors.text.secondary,
            fontFamily: theme.fontFamily.regular
          }]}>
            Log your daily activities to track your progress
          </Text>
        </View>
        
        <View style={styles.activityTypesContainer}>
          {activityOptions.map((option) => (
            <TouchableOpacity
              key={option.type}
              style={[
                styles.activityTypeButton,
                { 
                  backgroundColor: selectedType === option.type 
                    ? theme.colors.primary[900] 
                    : theme.colors.background.card 
                }
              ]}
              onPress={() => setSelectedType(option.type)}
            >
              <View style={styles.activityTypeContent}>
                {option.icon}
                <Text style={[styles.activityTypeLabel, { 
                  color: selectedType === option.type 
                    ? theme.colors.primary[500] 
                    : theme.colors.text.primary,
                  fontFamily: theme.fontFamily.medium
                }]}>
                  {option.label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={[styles.formCard, { backgroundColor: theme.colors.background.card }]}>
          <Text style={[styles.formLabel, { 
            color: theme.colors.text.primary,
            fontFamily: theme.fontFamily.medium
          }]}>
            {currentActivity?.label} ({currentActivity?.unit})
          </Text>
          
          <View style={[styles.inputContainer, { borderColor: theme.colors.dark[700] }]}>
            <TextInput
              style={[styles.input, { 
                color: theme.colors.text.primary,
                fontFamily: theme.fontFamily.regular
              }]}
              placeholder={currentActivity?.placeholder}
              placeholderTextColor={theme.colors.text.tertiary}
              value={value}
              onChangeText={setValue}
              keyboardType="numeric"
            />
            
            <View style={styles.unitContainer}>
              <Text style={[styles.unitText, { 
                color: theme.colors.text.secondary,
                fontFamily: theme.fontFamily.regular
              }]}>
                {currentActivity?.unit}
              </Text>
            </View>
          </View>
          
          <Text style={[styles.formLabel, { 
            color: theme.colors.text.primary,
            fontFamily: theme.fontFamily.medium,
            marginTop: 16,
          }]}>
            Notes (optional)
          </Text>
          
          <View style={[styles.textareaContainer, { borderColor: theme.colors.dark[700] }]}>
            <TextInput
              style={[styles.textarea, { 
                color: theme.colors.text.primary,
                fontFamily: theme.fontFamily.regular
              }]}
              placeholder="Add any additional details..."
              placeholderTextColor={theme.colors.text.tertiary}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>
        
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: theme.colors.primary[500] }]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={[styles.submitButtonText, { 
            color: theme.colors.white,
            fontFamily: theme.fontFamily.medium
          }]}>
            {isSubmitting ? 'Adding...' : 'Add Activity'}
          </Text>
          {!isSubmitting && <ArrowRight size={20} color={theme.colors.white} />}
        </TouchableOpacity>
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
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  activityTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  activityTypeButton: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  activityTypeContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityTypeLabel: {
    marginTop: 12,
    fontSize: 16,
  },
  formCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 16,
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  unitContainer: {
    paddingHorizontal: 16,
  },
  unitText: {
    fontSize: 14,
  },
  textareaContainer: {
    borderWidth: 1,
    borderRadius: 8,
  },
  textarea: {
    padding: 16,
    fontSize: 16,
    height: 120,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  submitButtonText: {
    fontSize: 16,
    marginRight: 8,
  },
});