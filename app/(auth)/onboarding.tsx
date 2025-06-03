import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../utils/supabase';

// Activity level options
const activityLevels = [
  { id: 'sedentary', label: 'Sedentary (little or no exercise)' },
  { id: 'light', label: 'Lightly active (light exercise 1-3 days/week)' },
  { id: 'moderate', label: 'Moderately active (moderate exercise 3-5 days/week)' },
  { id: 'active', label: 'Active (hard exercise 6-7 days/week)' },
  { id: 'very_active', label: 'Very active (very hard exercise & physical job)' }
];

// Goal options
const goals = [
  { id: 'lose_weight', label: 'Lose Weight' },
  { id: 'maintain', label: 'Maintain Weight' },
  { id: 'gain_weight', label: 'Gain Weight' },
  { id: 'build_muscle', label: 'Build Muscle' },
  { id: 'improve_health', label: 'Improve Overall Health' }
];

export default function OnboardingScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user, userProfile } = useAuth();
  
  // State for user inputs
  const [step, setStep] = useState(1);
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [gender, setGender] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const [goal, setGoal] = useState('');
  const [targetCalories, setTargetCalories] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
  const calculateBMR = () => {
    const weightKg = parseFloat(weight);
    const heightCm = parseFloat(height);
    const ageYears = parseInt(age);
    
    if (isNaN(weightKg) || isNaN(heightCm) || isNaN(ageYears)) {
      return 0;
    }
    
    // BMR calculation
    let bmr = 0;
    if (gender === 'male') {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageYears + 5;
    } else {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageYears - 161;
    }
    
    // Adjust for activity level
    let activityMultiplier = 1.2; // Default to sedentary
    switch (activityLevel) {
      case 'sedentary': activityMultiplier = 1.2; break;
      case 'light': activityMultiplier = 1.375; break;
      case 'moderate': activityMultiplier = 1.55; break;
      case 'active': activityMultiplier = 1.725; break;
      case 'very_active': activityMultiplier = 1.9; break;
    }
    
    // Total Daily Energy Expenditure (TDEE)
    const tdee = bmr * activityMultiplier;
    
    // Adjust based on goal
    let goalAdjustment = 0;
    switch (goal) {
      case 'lose_weight': goalAdjustment = -500; break; // Deficit of 500 calories
      case 'gain_weight': goalAdjustment = 500; break; // Surplus of 500 calories
      case 'build_muscle': goalAdjustment = 300; break; // Slight surplus
    }
    
    return Math.round(tdee + goalAdjustment);
  };

  const handleNextStep = () => {
    if (step === 3) {
      // Calculate suggested calories on the final step
      const calculatedCalories = calculateBMR();
      setTargetCalories(calculatedCalories.toString());
    }
    setStep(step + 1);
  };

  const handlePreviousStep = () => {
    setStep(step - 1);
  };

  const handleComplete = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Save user health data to Supabase
      const { error } = await supabase
        .from('health_profiles')
        .upsert({
          user_id: user.id,
          age: parseInt(age),
          weight: parseFloat(weight),
          height: parseFloat(height),
          gender,
          activity_level: activityLevel,
          goal,
          target_calories: parseInt(targetCalories) || calculateBMR(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      // Navigate to the main app
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error saving health profile:', error);
      alert('Failed to save your health profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Render different steps
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: theme.colors.text.primary }]}>
              Basic Information
            </Text>
            <Text style={[styles.stepDescription, { color: theme.colors.text.secondary }]}>
              Let's get to know you better to personalize your experience.
            </Text>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text.primary }]}>Age</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.colors.background.card,
                  color: theme.colors.text.primary,
                  borderColor: theme.colors.dark[300]
                }]}
                placeholder="Enter your age"
                placeholderTextColor={theme.colors.text.secondary}
                keyboardType="numeric"
                value={age}
                onChangeText={setAge}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text.primary }]}>Weight (kg)</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.colors.background.card,
                  color: theme.colors.text.primary,
                  borderColor: theme.colors.dark[300]
                }]}
                placeholder="Enter your weight in kg"
                placeholderTextColor={theme.colors.text.secondary}
                keyboardType="numeric"
                value={weight}
                onChangeText={setWeight}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text.primary }]}>Height (cm)</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.colors.background.card,
                  color: theme.colors.text.primary,
                  borderColor: theme.colors.dark[300]
                }]}
                placeholder="Enter your height in cm"
                placeholderTextColor={theme.colors.text.secondary}
                keyboardType="numeric"
                value={height}
                onChangeText={setHeight}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text.primary }]}>Gender</Text>
              <View style={styles.optionsContainer}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    { 
                      backgroundColor: gender === 'male' 
                        ? theme.colors.primary[900] 
                        : theme.colors.background.card,
                      borderColor: gender === 'male'
                        ? theme.colors.primary[500]
                        : theme.colors.dark[300]
                    }
                  ]}
                  onPress={() => setGender('male')}
                >
                  <Text style={[
                    styles.optionText,
                    { 
                      color: gender === 'male' 
                        ? theme.colors.primary[500] 
                        : theme.colors.text.primary,
                    }
                  ]}>
                    Male
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    { 
                      backgroundColor: gender === 'female' 
                        ? theme.colors.primary[900] 
                        : theme.colors.background.card,
                      borderColor: gender === 'female'
                        ? theme.colors.primary[500]
                        : theme.colors.dark[300]
                    }
                  ]}
                  onPress={() => setGender('female')}
                >
                  <Text style={[
                    styles.optionText,
                    { 
                      color: gender === 'female' 
                        ? theme.colors.primary[500] 
                        : theme.colors.text.primary,
                    }
                  ]}>
                    Female
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    { 
                      backgroundColor: gender === 'other' 
                        ? theme.colors.primary[900] 
                        : theme.colors.background.card,
                      borderColor: gender === 'other'
                        ? theme.colors.primary[500]
                        : theme.colors.dark[300]
                    }
                  ]}
                  onPress={() => setGender('other')}
                >
                  <Text style={[
                    styles.optionText,
                    { 
                      color: gender === 'other' 
                        ? theme.colors.primary[500] 
                        : theme.colors.text.primary,
                    }
                  ]}>
                    Other
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );
        
      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: theme.colors.text.primary }]}>
              Activity Level
            </Text>
            <Text style={[styles.stepDescription, { color: theme.colors.text.secondary }]}>
              Select your typical activity level to help us calculate your calorie needs.
            </Text>
            
            <ScrollView style={styles.optionsScrollView}>
              {activityLevels.map(level => (
                <TouchableOpacity
                  key={level.id}
                  style={[
                    styles.activityOption,
                    { 
                      backgroundColor: activityLevel === level.id 
                        ? theme.colors.primary[900] 
                        : theme.colors.background.card,
                      borderColor: activityLevel === level.id
                        ? theme.colors.primary[500]
                        : theme.colors.dark[300]
                    }
                  ]}
                  onPress={() => setActivityLevel(level.id)}
                >
                  <Text style={[
                    styles.activityOptionText,
                    { 
                      color: activityLevel === level.id 
                        ? theme.colors.primary[500] 
                        : theme.colors.text.primary,
                    }
                  ]}>
                    {level.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        );
        
      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: theme.colors.text.primary }]}>
              Your Goal
            </Text>
            <Text style={[styles.stepDescription, { color: theme.colors.text.secondary }]}>
              What are you looking to achieve with meal tracking?
            </Text>
            
            <ScrollView style={styles.optionsScrollView}>
              {goals.map(goalOption => (
                <TouchableOpacity
                  key={goalOption.id}
                  style={[
                    styles.activityOption,
                    { 
                      backgroundColor: goal === goalOption.id 
                        ? theme.colors.primary[900] 
                        : theme.colors.background.card,
                      borderColor: goal === goalOption.id
                        ? theme.colors.primary[500]
                        : theme.colors.dark[300]
                    }
                  ]}
                  onPress={() => setGoal(goalOption.id)}
                >
                  <Text style={[
                    styles.activityOptionText,
                    { 
                      color: goal === goalOption.id 
                        ? theme.colors.primary[500] 
                        : theme.colors.text.primary,
                    }
                  ]}>
                    {goalOption.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        );
        
      case 4:
        return (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: theme.colors.text.primary }]}>
              Daily Calorie Target
            </Text>
            <Text style={[styles.stepDescription, { color: theme.colors.text.secondary }]}>
              Based on your information, we recommend the following daily calorie target. You can adjust it if needed.
            </Text>
            
            <View style={styles.calorieContainer}>
              <Text style={[styles.calorieValue, { color: theme.colors.primary[500] }]}>
                {targetCalories || calculateBMR()} calories
              </Text>
              <Text style={[styles.calorieLabel, { color: theme.colors.text.secondary }]}>
                Recommended daily intake
              </Text>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text.primary }]}>
                Custom Calorie Target (optional)
              </Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.colors.background.card,
                  color: theme.colors.text.primary,
                  borderColor: theme.colors.dark[300]
                }]}
                placeholder="Enter custom calorie target"
                placeholderTextColor={theme.colors.text.secondary}
                keyboardType="numeric"
                value={targetCalories}
                onChangeText={setTargetCalories}
              />
            </View>
          </View>
        );
        
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <StatusBar style={theme.colors.background.primary === '#121212' ? 'light' : 'dark'} />
      
      <View style={styles.header}>
        {step > 1 && (
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handlePreviousStep}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
        )}
        <View style={styles.progressContainer}>
          {[1, 2, 3, 4].map(stepNumber => (
            <View 
              key={stepNumber}
              style={[
                styles.progressDot,
                { 
                  backgroundColor: stepNumber <= step 
                    ? theme.colors.primary[500] 
                    : theme.colors.dark[300]
                }
              ]}
            />
          ))}
        </View>
      </View>
      
      {renderStep()}
      
      <View style={styles.footer}>
        {step < 4 ? (
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: theme.colors.primary[500] },
              (!age || !weight || !height || !gender) && step === 1 && styles.disabledButton,
              !activityLevel && step === 2 && styles.disabledButton,
              !goal && step === 3 && styles.disabledButton
            ]}
            onPress={handleNextStep}
            disabled={
              ((!age || !weight || !height || !gender) && step === 1) ||
              (!activityLevel && step === 2) ||
              (!goal && step === 3)
            }
          >
            <Text style={[styles.buttonText, { color: theme.colors.white }]}>
              Next
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.primary[500] }]}
            onPress={handleComplete}
            disabled={isLoading}
          >
            <Text style={[styles.buttonText, { color: theme.colors.white }]}>
              {isLoading ? 'Saving...' : 'Complete'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 20,
  },
  backButton: {
    padding: 10,
    marginRight: 10,
  },
  progressContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    marginBottom: 10,
  },
  stepDescription: {
    fontSize: 16,
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  optionButton: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  optionText: {
    fontSize: 16,
  },
  optionsScrollView: {
    flex: 1,
  },
  activityOption: {
    padding: 15,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
  },
  activityOptionText: {
    fontSize: 16,
  },
  calorieContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  calorieValue: {
    fontSize: 36,
    marginBottom: 5,
  },
  calorieLabel: {
    fontSize: 16,
  },
  footer: {
    marginTop: 'auto',
    paddingVertical: 20,
  },
  button: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
  },
  disabledButton: {
    opacity: 0.5,
  },
});
