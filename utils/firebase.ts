import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  Timestamp,
  enableIndexedDbPersistence,
} from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBkkFF0XhNZeWuDmOfEhsgdfX1VBG7WTas",
  authDomain: "fitness-tracker-app-dev.firebaseapp.com",
  projectId: "fitness-tracker-app-dev",
  storageBucket: "fitness-tracker-app-dev.appspot.com",
  messagingSenderId: "581326886241",
  appId: "1:581326886241:web:c76de998d69b83632a6145"
};

// Initialize Firebase only if it hasn't been initialized yet
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// Enable offline persistence
try {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time
      console.warn('Firebase persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      // The current browser doesn't support persistence
      console.warn('Firebase persistence not supported in this environment');
    }
  });
} catch (err) {
  console.warn('Firebase persistence error:', err);
}

// User types
export type UserRole = 'admin' | 'trainer' | 'nutritionist' | 'client';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
  isApproved: boolean;
  approvedAt?: Timestamp;
  approvedBy?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Auth functions
export const signIn = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const signUp = async (
  email: string, 
  password: string, 
  displayName: string, 
  role: UserRole = 'client'
) => {
  // Create user with Firebase Auth
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  // Create user profile in Firestore
  const userProfile: UserProfile = {
    uid: user.uid,
    email: user.email || email,
    displayName,
    role,
    isApproved: role === 'client', // Auto-approve clients, others need admin approval
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
  
  await setDoc(doc(db, 'users', user.uid), userProfile);
  
  return userCredential;
};

export const signOut = () => {
  return firebaseSignOut(auth);
};

// User functions
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  
  if (userDoc.exists()) {
    return userDoc.data() as UserProfile;
  }
  
  return null;
};

export const updateUserProfile = async (userId: string, data: Partial<UserProfile>) => {
  const userRef = doc(db, 'users', userId);
  
  await updateDoc(userRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
};

// Get pending approval users
export const getPendingApprovalUsers = async () => {
  const q = query(
    collection(db, 'users'),
    where('isApproved', '==', false)
  );
  
  const querySnapshot = await getDocs(q);
  const users: UserProfile[] = [];
  
  querySnapshot.forEach((doc) => {
    users.push(doc.data() as UserProfile);
  });
  
  return users;
};

// Approve user
export const approveUser = async (userId: string, adminId: string) => {
  const userRef = doc(db, 'users', userId);
  
  await updateDoc(userRef, {
    isApproved: true,
    approvedAt: Timestamp.now(),
    approvedBy: adminId,
    updatedAt: Timestamp.now(),
  });
};

// Reject user
export const rejectUser = async (userId: string) => {
  const userRef = doc(db, 'users', userId);
  
  await updateDoc(userRef, {
    isApproved: false,
    updatedAt: Timestamp.now(),
  });
};

// Activity types
export interface ActivityLog {
  id?: string;
  userId: string;
  type: 'sleep' | 'water' | 'food' | 'workout' | 'steps' | 'heartRate';
  value: number;
  unit: string;
  notes?: string;
  date: Timestamp;
  createdAt: Timestamp;
}

// Activity functions
export const addActivityLog = async (activityData: Omit<ActivityLog, 'createdAt'>) => {
  const activityRef = collection(db, 'activityLogs');
  
  return addDoc(activityRef, {
    ...activityData,
    createdAt: Timestamp.now(),
  });
};

export const getActivityLogs = async (
  userId: string, 
  type?: ActivityLog['type'],
  startDate?: Date,
  endDate?: Date
) => {
  let q = query(
    collection(db, 'activityLogs'),
    where('userId', '==', userId)
  );
  
  if (type) {
    q = query(q, where('type', '==', type));
  }
  
  if (startDate) {
    q = query(q, where('date', '>=', Timestamp.fromDate(startDate)));
  }
  
  if (endDate) {
    q = query(q, where('date', '<=', Timestamp.fromDate(endDate)));
  }
  
  const querySnapshot = await getDocs(q);
  const activities: ActivityLog[] = [];
  
  querySnapshot.forEach((doc) => {
    activities.push({ id: doc.id, ...doc.data() } as ActivityLog);
  });
  
  return activities;
};

// Workout plans
export interface WorkoutPlan {
  id?: string;
  trainerId: string;
  userId: string;
  title: string;
  description: string;
  exercises: {
    name: string;
    sets: number;
    reps: number;
    weight?: number;
    duration?: number;
    notes?: string;
  }[];
  startDate: Timestamp;
  endDate?: Timestamp;
  createdAt: Timestamp;
}

// Meal plans
export interface MealPlan {
  id?: string;
  nutritionistId: string;
  userId: string;
  title: string;
  description: string;
  meals: {
    type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    foods: {
      name: string;
      servingSize: string;
      calories: number;
      protein?: number;
      carbs?: number;
      fat?: number;
    }[];
    notes?: string;
  }[];
  startDate: Timestamp;
  endDate?: Timestamp;
  createdAt: Timestamp;
}

// Plan functions
export const addWorkoutPlan = async (workoutData: Omit<WorkoutPlan, 'createdAt'>) => {
  const workoutRef = collection(db, 'workoutPlans');
  
  return addDoc(workoutRef, {
    ...workoutData,
    createdAt: Timestamp.now(),
  });
};

export const addMealPlan = async (mealData: Omit<MealPlan, 'createdAt'>) => {
  const mealRef = collection(db, 'mealPlans');
  
  return addDoc(mealRef, {
    ...mealData,
    createdAt: Timestamp.now(),
  });
};

// Export the auth and db for direct access if needed
export { auth, db };