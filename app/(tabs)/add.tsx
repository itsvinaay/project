import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  TextInput,
  ScrollView,
  Alert,
  Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { addActivityLog } from '@/utils/supabase';
import { 
  Bed, 
  Droplet, 
  Utensils, 
  Dumbbell, 
  ArrowRight
} from 'lucide-react-native';

type ActivityType = 'sleep' | 'water' | 'food' | 'workout' | 'meal';

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
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [image, setImage] = useState<string | null>(null);
  
  // Function to handle image picking
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please allow access to your photo library to upload images');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };
  
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
      label: 'Quick Food',
      icon: <Utensils size={24} color={theme.colors.primary[500]} />,
      unit: 'calories',
      placeholder: 'e.g., 500',
    },
    {
      type: 'meal',
      label: 'Meal',
      icon: <Utensils size={24} color={theme.colors.primary[500]} />,
      unit: 'details',
      placeholder: 'Add meal details',
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
    
    if (selectedType === 'meal') {
      if (!foodName || !calories) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }
      
      const mealData = {
        type: 'meal',
        foodName,
        calories: parseFloat(calories) || 0,
        notes,
        image,
        timestamp: new Date().toISOString()
      };
      
      console.log('Meal data:', mealData);
      
      // Reset form
      setFoodName('');
      setCalories('');
      setNotes('');
      setImage(null);
      
      Alert.alert('Success', 'Meal logged successfully!');
      return;
    }
    
    // For other activity types
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
        user_id: user.id,
        type: selectedType,
        value: numValue,
        unit: currentActivity?.unit || '',
        notes: notes,
        date: new Date().toISOString(),
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
          {selectedType === 'meal' ? (
            <View style={styles.mealContainer}>
              <Text style={[styles.formLabel, { 
                color: theme.colors.text.primary,
                fontFamily: theme.fontFamily.medium
              }]}>
                Food Name
              </Text>
              <View style={[styles.inputContainer, { borderColor: theme.colors.dark[700] }]}>
                <TextInput
                  style={[styles.input, { 
                    color: theme.colors.text.primary,
                    fontFamily: theme.fontFamily.regular
                  }]}
                  placeholder="Enter food name"
                  placeholderTextColor={theme.colors.text.tertiary}
                  value={foodName}
                  onChangeText={setFoodName}
                />
              </View>
              
              <Text style={[styles.formLabel, { 
                color: theme.colors.text.primary,
                fontFamily: theme.fontFamily.medium,
                marginTop: 16
              }]}>
                Calories
              </Text>
              <View style={[styles.inputContainer, { borderColor: theme.colors.dark[700] }]}>
                <TextInput
                  style={[styles.input, { 
                    color: theme.colors.text.primary,
                    fontFamily: theme.fontFamily.regular
                  }]}
                  placeholder="Enter calories"
                  placeholderTextColor={theme.colors.text.tertiary}
                  value={calories}
                  onChangeText={setCalories}
                  keyboardType="numeric"
                />
              </View>
              
              <TouchableOpacity 
                style={[styles.imageButton, { borderColor: theme.colors.primary[500] }]}
                onPress={pickImage}
              >
                <Text style={[styles.imageButtonText, { color: theme.colors.primary[500] }]}>
                  {image ? 'Change Image' : 'Add Image (Optional)'}
                </Text>
              </TouchableOpacity>
              
              {image && (
                <View style={styles.imagePreview}>
                  <Image source={{ uri: image }} style={styles.previewImage} />
                </View>
              )}
            </View>
          ) : (
            <View>
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
            </View>
          )}
          
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
          style={[styles.submitButton, { 
            backgroundColor: theme.colors.primary[500],
            opacity: isSubmitting ? 0.7 : 1 
          }]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={[styles.submitButtonText, { 
            color: '#fff',
            fontFamily: theme.fontFamily.semiBold
          }]}>
            {isSubmitting ? 'Adding...' : 'Add Activity'}
          </Text>
          {!isSubmitting && <ArrowRight size={20} color="#fff" />}
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
  mealContainer: {
    width: '100%',
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
  imageButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  imageButtonText: {
    fontSize: 16,
  },
  imagePreview: {
    marginTop: 16,
    alignItems: 'center',
  },
  previewImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    resizeMode: 'cover',
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