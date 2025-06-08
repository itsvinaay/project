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
  Image,
  ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { addActivityLog } from '@/utils/supabase';
import { 
  Bed, 
  Droplet, 
  Utensils, 
  Dumbbell, 
  ArrowRight,
  Camera
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
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  
  // Function to open the camera, capture a meal photo, and analyze it
  const handleTakeMealPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please allow access to your camera to take photos');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setImage(uri);
        analyzeImageWithVisionAPI(uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  // Function to take a photo using the camera
  const takePhotoAsync = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please allow access to your camera to take photos');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setImage(uri);
        analyzeImageWithVisionAPI(uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };



  // Function to analyze image with Google Cloud Vision API
  const analyzeImageWithVisionAPI = async (imageUri: string) => {
    if (!imageUri) return;

    // Replace with your actual API key
    const GOOGLE_CLOUD_VISION_API_KEY = "AIzaSyAGqRkkmYWPWIQVUgyKEasYASNrDypkPog";
    const apiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_CLOUD_VISION_API_KEY}`;

    setIsAnalyzingImage(true);
    try {
      const base64ImageData = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const requestBody = {
        requests: [
          {
            image: {
              content: base64ImageData,
            },
            features: [
              { type: 'LABEL_DETECTION', maxResults: 5 },
              // You can add other features like 'OBJECT_LOCALIZATION'
            ],
          },
        ],
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (response.ok && result.responses && result.responses.length > 0) {
        const labels = result.responses[0].labelAnnotations;
        if (labels && labels.length > 0) {
          // Let's use the top label for the food name for now
          const topLabel = labels[0].description;
          setFoodName(prev => prev ? `${prev} (${topLabel})` : topLabel); // Append or set
          // You could also populate notes with other labels
          const otherLabels = labels.slice(1).map((l: any) => l.description).join(', ');
          if (otherLabels) {
            setNotes(prev => prev ? `${prev}\nDetected: ${otherLabels}` : `Detected: ${otherLabels}`);
          }
          Alert.alert('Image Analyzed', `Detected: ${topLabel}`);
        } else {
          Alert.alert('Image Analyzed', 'No specific labels detected.');
        }
      } else {
        console.error('Google Vision API error:', result);
        Alert.alert('API Error', result.error?.message || 'Failed to analyze image.');
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      Alert.alert('Error', 'An error occurred while analyzing the image.');
    } finally {
      setIsAnalyzingImage(false);
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

  // --- MAIN RENDER ---
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]} > 
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View>
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { 
                color: theme.colors.text.primary,
                fontFamily: theme.fontFamily.semiBold
              }]}>Add Activity</Text>
              <Text style={[styles.subtitle, { 
                color: theme.colors.text.secondary,
                fontFamily: theme.fontFamily.regular
              }]}>Log your daily activities to track your progress</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                if (selectedType === 'meal') {
                  handleTakeMealPhoto();
                } else {
                  Alert.alert('Switch to Meal', 'Switch to "Meal" to add a meal photo.');
                }
              }}
              style={styles.cameraIconContainer}
              disabled={isAnalyzingImage}
            >
              {isAnalyzingImage ? (
                <ActivityIndicator size="small" color={theme.colors.primary[500]} />
              ) : (
                <Camera size={28} color={theme.colors.primary[500]} />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.activityTypesContainer}>
            {activityOptions.map(option => (
              <TouchableOpacity
                key={option.type}
                style={[
                  styles.activityTypeButton,
                  {
                    backgroundColor: selectedType === option.type
                      ? theme.colors.primary[900]
                      : theme.colors.background.card,
                  },
                ]}
                onPress={() => setSelectedType(option.type)}
              >
                <View style={styles.activityTypeContent}>
                  {option.icon}
                  <Text
                    style={[
                      styles.activityTypeLabel,
                      {
                        color: selectedType === option.type
                          ? theme.colors.primary[500]
                          : theme.colors.text.primary,
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {selectedType === 'meal' ? (
            <View>
              <Text style={styles.formLabel}>Food Name</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter food name"
                  placeholderTextColor={theme.colors.text.tertiary}
                  value={foodName}
                  onChangeText={setFoodName}
                />
              </View>

              <Text style={styles.formLabel}>Calories</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter calories"
                  placeholderTextColor={theme.colors.text.tertiary}
                  value={calories}
                  onChangeText={setCalories}
                  keyboardType="numeric"
                />
              </View>

              {image && (
                <View style={styles.imagePreview}>
                  <Image source={{ uri: image }} style={styles.previewImage} />
                </View>
              )}
            </View>
          ) : (
            <View>
              <Text style={styles.formLabel}>
                {currentActivity?.label} ({currentActivity?.unit})
              </Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder={currentActivity?.placeholder}
                  placeholderTextColor={theme.colors.text.tertiary}
                  value={value}
                  onChangeText={setValue}
                  keyboardType="numeric"
                />
                <View style={styles.unitContainer}>
                  <Text style={styles.unitText}>{currentActivity?.unit}</Text>
                </View>
              </View>
            </View>
          )}

          <Text style={styles.formLabel}>Notes (optional)</Text>
          <View style={styles.textareaContainer}>
            <TextInput
              style={styles.textarea}
              placeholder="Add any additional details..."
              placeholderTextColor={theme.colors.text.tertiary}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              {
                backgroundColor: theme.colors.primary[500],
                opacity: isSubmitting ? 0.7 : 1,
              },
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Adding...' : 'Add Activity'}
            </Text>
            {!isSubmitting && <ArrowRight size={20} color="#fff" />}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16, // Added for better spacing of the icon
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
  cameraIconContainer: {
    padding: 8, // Added for easier touchability
  },
});