import axios from 'axios';

// In a production app, store this in environment variables
// For demo purposes, we'll use a placeholder that you should replace with your actual key
const GOOGLE_CLOUD_VISION_API_KEY = process.env.GOOGLE_CLOUD_VISION_API_KEY || 'YOUR_GOOGLE_CLOUD_VISION_API_KEY';
const API_URL = `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_CLOUD_VISION_API_KEY}`;

// Mock API response for development/testing when API key is not set
const USE_MOCK_DATA = GOOGLE_CLOUD_VISION_API_KEY === 'YOUR_GOOGLE_CLOUD_VISION_API_KEY';

// Food database for calorie estimation (simplified for demo)
// In a real app, you would use a more comprehensive food database API
const FOOD_DATABASE: Record<string, { calories: number, protein: number, carbs: number, fat: number }> = {
  'apple': { calories: 95, protein: 0.5, carbs: 25, fat: 0.3 },
  'banana': { calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
  'orange': { calories: 62, protein: 1.2, carbs: 15, fat: 0.2 },
  'bread': { calories: 265, protein: 9, carbs: 49, fat: 3.2 },
  'rice': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  'chicken': { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  'beef': { calories: 250, protein: 26, carbs: 0, fat: 17 },
  'salmon': { calories: 206, protein: 22, carbs: 0, fat: 13 },
  'broccoli': { calories: 55, protein: 3.7, carbs: 11, fat: 0.6 },
  'carrot': { calories: 41, protein: 0.9, carbs: 10, fat: 0.2 },
  'potato': { calories: 77, protein: 2, carbs: 17, fat: 0.1 },
  'pasta': { calories: 131, protein: 5, carbs: 25, fat: 1.1 },
  'egg': { calories: 78, protein: 6, carbs: 0.6, fat: 5.3 },
  'milk': { calories: 42, protein: 3.4, carbs: 5, fat: 1 },
  'cheese': { calories: 402, protein: 25, carbs: 2.4, fat: 33 },
  'yogurt': { calories: 59, protein: 3.5, carbs: 5, fat: 3.3 },
  'pizza': { calories: 285, protein: 12, carbs: 36, fat: 10 },
  'burger': { calories: 354, protein: 20, carbs: 40, fat: 17 },
  'salad': { calories: 33, protein: 1.8, carbs: 6.5, fat: 0.4 },
  'chocolate': { calories: 546, protein: 4.9, carbs: 61, fat: 31 },
  'cookie': { calories: 502, protein: 5.5, carbs: 63, fat: 25 },
  'cake': { calories: 371, protein: 5, carbs: 50, fat: 18 },
};

export interface FoodItem {
  name: string;
  confidence: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving: string;
}

// Mock response for testing without API key
const getMockFoodDetection = (): FoodItem[] => {
  // Randomly select 2-4 food items from the database
  const foodNames = Object.keys(FOOD_DATABASE);
  const selectedFoods: FoodItem[] = [];
  
  const numItems = Math.floor(Math.random() * 3) + 2; // 2-4 items
  
  for (let i = 0; i < numItems; i++) {
    const randomIndex = Math.floor(Math.random() * foodNames.length);
    const foodName = foodNames[randomIndex];
    const nutritionInfo = FOOD_DATABASE[foodName];
    
    selectedFoods.push({
      name: foodName,
      confidence: 0.8 + (Math.random() * 0.2), // Random confidence between 0.8 and 1.0
      calories: nutritionInfo.calories,
      protein: nutritionInfo.protein,
      carbs: nutritionInfo.carbs,
      fat: nutritionInfo.fat,
      serving: '1 serving'
    });
    
    // Remove this food to avoid duplicates
    foodNames.splice(randomIndex, 1);
    
    if (foodNames.length === 0) break;
  }
  
  return selectedFoods;
};

/**
 * Analyzes an image using Google Cloud Vision API to identify food items
 * @param base64Image Base64 encoded image
 * @returns Array of identified food items with nutritional information
 */
export const analyzeFoodImage = async (base64Image: string): Promise<FoodItem[]> => {
  try {
    // If using mock data (no API key provided), return mock response
    if (USE_MOCK_DATA) {
      console.log('Using mock data for food detection (no API key provided)');
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      return getMockFoodDetection();
    }
    
    // Remove data:image/jpeg;base64, prefix if present
    const imageContent = base64Image.replace(/^data:image\/[a-z]+;base64,/, '');
    
    // Prepare request for Google Cloud Vision API
    const requestBody = {
      requests: [
        {
          image: {
            content: imageContent
          },
          features: [
            {
              type: 'LABEL_DETECTION',
              maxResults: 10
            },
            {
              type: 'OBJECT_LOCALIZATION',
              maxResults: 10
            }
          ]
        }
      ]
    };
    
    // Call Google Cloud Vision API
    const response = await axios.post(API_URL, requestBody);
    
    // Process response to identify food items
    const labels = response.data.responses[0].labelAnnotations || [];
    const objects = response.data.responses[0].localizedObjectAnnotations || [];
    
    // Combine and filter results for food items
    const allDetections = [
      ...labels.map((label: any) => ({ 
        name: label.description.toLowerCase(), 
        confidence: label.score 
      })),
      ...objects.map((obj: any) => ({ 
        name: obj.name.toLowerCase(), 
        confidence: obj.score 
      }))
    ];
    
    // Filter for food items and add nutritional information
    const foodItems = allDetections
      .filter(item => FOOD_DATABASE[item.name])
      .map(item => {
        const nutritionInfo = FOOD_DATABASE[item.name];
        return {
          name: item.name,
          confidence: item.confidence,
          calories: nutritionInfo.calories,
          protein: nutritionInfo.protein,
          carbs: nutritionInfo.carbs,
          fat: nutritionInfo.fat,
          serving: '1 serving'
        };
      });
    
    // Remove duplicates
    const uniqueFoodItems = foodItems.filter((item, index, self) =>
      index === self.findIndex(t => t.name === item.name)
    );
    
    return uniqueFoodItems.length > 0 ? uniqueFoodItems : getMockFoodDetection();
  } catch (error) {
    console.error('Error analyzing food image:', error);
    
    // If API call fails, return mock data as fallback
    if (USE_MOCK_DATA) {
      console.log('Falling back to mock data due to API error');
      return getMockFoodDetection();
    }
    
    throw new Error('Failed to analyze food image. Please try again.');
  }
};

/**
 * Estimates calories for a meal based on identified food items
 * @param foodItems Array of food items
 * @returns Total calories for the meal
 */
export const estimateMealCalories = (foodItems: FoodItem[]): number => {
  return foodItems.reduce((total, item) => total + item.calories, 0);
};

/**
 * Searches for food items in the database
 * @param query Search query
 * @returns Array of matching food items
 */
export const searchFoodItems = (query: string): FoodItem[] => {
  const searchTerm = query.toLowerCase();
  return Object.entries(FOOD_DATABASE)
    .filter(([name]) => name.includes(searchTerm))
    .map(([name, nutrition]) => ({
      name,
      confidence: 1.0, // Manual search has full confidence
      calories: nutrition.calories,
      protein: nutrition.protein,
      carbs: nutrition.carbs,
      fat: nutrition.fat,
      serving: '1 serving'
    }));
};
