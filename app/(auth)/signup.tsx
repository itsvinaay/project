import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  Image, 
  ScrollView,
  Platform
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { ActivityIndicator } from 'react-native';
import { Lock, Mail, User, ChevronDown } from 'lucide-react-native';
import { UserRole } from '@/utils/supabase';

const roles: { label: string; value: UserRole; description: string }[] = [
  {
    label: 'Client',
    value: 'client',
    description: 'Track your fitness journey and connect with trainers'
  },
  {
    label: 'Trainer',
    value: 'trainer',
    description: 'Create workout plans and guide clients (requires approval)'
  },
  {
    label: 'Nutritionist',
    value: 'nutritionist',
    description: 'Create meal plans and guide clients (requires approval)'
  }
];

export default function SignUpScreen() {
  const { signUp, isLoading } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  
  // Component-specific styles that need access to theme
  const componentStyles = StyleSheet.create({
    errorText: {
      textAlign: 'center',
      marginTop: 10, // Add some space above the error message
      marginBottom: 10,
      fontFamily: theme.fontFamily.regular,
      color: theme.colors.error[500], 
    },
  });

  
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('client');
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const handleSignUp = async () => {
    setAuthError(null); // Clear previous errors
    if (!email || !password || !displayName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    
    try {
      await signUp(email, password, displayName, selectedRole);
      
      if (selectedRole === 'client') {
        // Clients are auto-approved, redirect to main app
        router.replace('/(tabs)');
      } else {
        // Show pending approval message for other roles
        Alert.alert(
          'Registration Successful',
          'Your account is pending admin approval. You will be notified when your account is approved.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(auth)/signin')
            }
          ]
        );
      }
    } catch (error: any) {
      console.error('Signup screen error:', error);
      // Extract error message from various possible error object structures
      const errorMessage = 
        (error.message) ? error.message : 
        (error.error?.message) ? error.error.message :
        (typeof error === 'string') ? error : 
        'An unknown error occurred during sign up';
      
      setAuthError(errorMessage);
    }
  };
  
  const selectedRoleData = roles.find(role => role.value === selectedRole);
  
  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background.primary }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.logoContainer}>
        <Image 
          source={{ uri: 'https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' }} 
          style={styles.logoBackground}
        />
        <View style={styles.overlay} />
        <Text style={[styles.appName, { color: theme.colors.white }]}>
          StayFit<Text style={{ color: theme.colors.primary[500] }}>Pro</Text>
        </Text>
        <Text style={[styles.tagline, { color: theme.colors.text.secondary }]}>
          Begin your fitness transformation today
        </Text>
      </View>
      
      <View style={[styles.formContainer, { backgroundColor: theme.colors.background.card }]}>
        <Text style={[styles.title, { 
          color: theme.colors.text.primary,
          fontFamily: theme.fontFamily.semiBold 
        }]}>
          Create Account
        </Text>
        
        <View style={styles.inputWrapper}>
          <User size={20} color={theme.colors.text.secondary} />
          <TextInput
            style={[styles.input, { 
              color: theme.colors.text.primary,
              borderColor: theme.colors.dark[700],
              fontFamily: theme.fontFamily.regular
            }]}
            placeholder="Full Name"
            placeholderTextColor={theme.colors.text.tertiary}
            value={displayName}
            onChangeText={setDisplayName}
          />
        </View>
        
        <View style={styles.inputWrapper}>
          <Mail size={20} color={theme.colors.text.secondary} />
          <TextInput
            style={[styles.input, { 
              color: theme.colors.text.primary,
              borderColor: theme.colors.dark[700],
              fontFamily: theme.fontFamily.regular
            }]}
            placeholder="Email"
            placeholderTextColor={theme.colors.text.tertiary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
        
        <View style={styles.inputWrapper}>
          <Lock size={20} color={theme.colors.text.secondary} />
          <TextInput
            style={[styles.input, { 
              color: theme.colors.text.primary,
              borderColor: theme.colors.dark[700],
              fontFamily: theme.fontFamily.regular
            }]}
            placeholder="Password"
            placeholderTextColor={theme.colors.text.tertiary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        
        <View style={styles.inputWrapper}>
          <Lock size={20} color={theme.colors.text.secondary} />
          <TextInput
            style={[styles.input, { 
              color: theme.colors.text.primary,
              borderColor: theme.colors.dark[700],
              fontFamily: theme.fontFamily.regular
            }]}
            placeholder="Confirm Password"
            placeholderTextColor={theme.colors.text.tertiary}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>
        
        <TouchableOpacity
          style={[styles.roleSelector, { backgroundColor: theme.colors.dark[700] }]}
          onPress={() => setShowRoleSelector(!showRoleSelector)}
        >
          <View style={styles.roleSelectorContent}>
            <Text style={[styles.roleSelectorText, {
              color: theme.colors.text.primary,
              fontFamily: theme.fontFamily.medium
            }]}>
              {selectedRoleData?.label || 'Select Role'}
            </Text>
            <ChevronDown 
              size={20} 
              color={theme.colors.text.secondary}
              style={[
                styles.roleSelectorIcon,
                showRoleSelector && styles.roleSelectorIconOpen
              ]}
            />
          </View>
        </TouchableOpacity>
        
        {showRoleSelector && (
          <View style={[styles.roleOptions, { backgroundColor: theme.colors.dark[800] }]}>
            {roles.map((role) => (
              <TouchableOpacity
                key={role.value}
                style={[
                  styles.roleOption,
                  selectedRole === role.value && { 
                    backgroundColor: theme.colors.primary[900] 
                  }
                ]}
                onPress={() => {
                  setSelectedRole(role.value);
                  setShowRoleSelector(false);
                }}
              >
                <View>
                  <Text style={[styles.roleOptionLabel, {
                    color: theme.colors.text.primary,
                    fontFamily: theme.fontFamily.medium
                  }]}>
                    {role.label}
                  </Text>
                  <Text style={[styles.roleOptionDescription, {
                    color: theme.colors.text.secondary,
                    fontFamily: theme.fontFamily.regular
                  }]}>
                    {role.description}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.primary[500] }]}
          onPress={handleSignUp}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={theme.colors.white} />
          ) : (
            <Text style={[styles.buttonText, { 
              color: theme.colors.white,
              fontFamily: theme.fontFamily.medium
            }]}>
              Sign Up
            </Text>
          )}
        </TouchableOpacity>

        {authError && (
          <Text style={[componentStyles.errorText]}>
            {authError}
          </Text>
        )}
        
        <View style={styles.footer}>
          <Text style={[styles.footerText, { 
            color: theme.colors.text.secondary,
            fontFamily: theme.fontFamily.regular
          }]}>
            Already have an account?{' '}
          </Text>
          <Link href="/(auth)/signin" asChild>
            <TouchableOpacity>
              <Text style={[styles.link, { 
                color: theme.colors.primary[500],
                fontFamily: theme.fontFamily.medium
              }]}>
                Sign In
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  logoContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  logoBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  appName: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
  },
  formContainer: {
    flex: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    marginTop: -30,
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  roleSelector: {
    borderRadius: 8,
    marginBottom: 16,
    padding: 12,
  },
  roleSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roleSelectorText: {
    fontSize: 16,
  },
  roleSelectorIcon: {
    transform: [{ rotate: '0deg' }],
  },
  roleSelectorIconOpen: {
    transform: [{ rotate: '180deg' }],
  },
  roleOptions: {
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  roleOption: {
    padding: 16,
  },
  roleOptionLabel: {
    fontSize: 16,
    marginBottom: 4,
  },
  roleOptionDescription: {
    fontSize: 12,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  footerText: {
    fontSize: 14,
  },
  link: {
    fontSize: 14,
  },
});