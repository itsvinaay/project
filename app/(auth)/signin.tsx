import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { ActivityIndicator } from 'react-native';
import { Lock, Mail } from 'lucide-react-native';

export default function SignInScreen() {
  const { signIn, isLoading, resendConfirmationEmail } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [showResendButton, setShowResendButton] = useState<boolean>(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  const componentStyles = StyleSheet.create({
    errorText: {
      textAlign: 'center',
      marginBottom: 10,
      fontFamily: theme.fontFamily.regular,
      color: theme.colors.error[500], // Use error color from theme
    },
  });
  
  const handleSignIn = async () => {
    setAuthError(null); // Clear previous errors
    setShowResendButton(false); // Reset resend button visibility
    setResendStatus(null); // Clear previous resend status
    if (!email || !password) {
      setAuthError('Please enter both email and password');
      return;
    }
    
    try {
      await signIn(email, password);
      // Navigation is handled in AuthContext
    } catch (error: any) {
      const errorMessage = error.message || 'Sign In Failed. Please check your credentials';
      setAuthError(errorMessage);
      if (errorMessage.includes('Email not confirmed')) {
        setShowResendButton(true);
      }
    }
  };

  const handleResendEmail = async () => {
    if (!email) {
      setResendStatus('Please enter your email address first.');
      return;
    }
    setResendStatus('Sending...');
    try {
      await resendConfirmationEmail(email);
      setResendStatus('Confirmation email resent! Please check your inbox (and spam folder).');
      setShowResendButton(false); // Optionally hide button after successful resend
    } catch (error: any) {
      if (error.message.includes('Email already confirmed')) {
        setResendStatus('This email address has already been confirmed.');
      } else {
        setResendStatus(error.message || 'Failed to resend confirmation email.');
      }
      console.error('Resend email error:', error);
    }
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <View style={styles.logoContainer}>
        <Image 
          source={{ uri: 'https://images.pexels.com/photos/3758056/pexels-photo-3758056.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' }} 
          style={styles.logoBackground}
        />
        <View style={styles.overlay} />
        <Text style={[styles.appName, { color: theme.colors.white }]}>
          StayFit<Text style={{ color: theme.colors.primary[500] }}>Pro</Text>
        </Text>
        <Text style={[styles.tagline, { color: theme.colors.text.secondary }]}>
          Your personal fitness journey starts here
        </Text>
      </View>
      
      <View style={[styles.formContainer, { backgroundColor: theme.colors.background.card }]}>
        <Text style={[styles.title, { 
          color: theme.colors.text.primary,
          fontFamily: theme.fontFamily.semiBold 
        }]}>
          Sign In
        </Text>
        
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

        {authError && (
          <Text style={componentStyles.errorText}>
            {authError}
          </Text>
        )}

        {showResendButton && (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.secondary[500], marginTop: 10 }]} // Use a different color for distinction
            onPress={handleResendEmail}
            disabled={isLoading} // Can use isLoading or a new state for resend loading
          >
            <Text style={[styles.buttonText, { color: theme.colors.white }]}>
              Resend Confirmation Email
            </Text>
          </TouchableOpacity>
        )}

        {resendStatus && (
          <Text style={[componentStyles.errorText, { marginTop: 10, color: resendStatus.includes('Failed') || resendStatus.includes('Please enter') ? theme.colors.error[500] : theme.colors.success[500] }]}>
            {resendStatus}
          </Text>
        )}
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.primary[500] }]}
          onPress={handleSignIn}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={theme.colors.white} />
          ) : (
            <Text style={[styles.buttonText, { 
              color: theme.colors.white,
              fontFamily: theme.fontFamily.medium
            }]}>
              Sign In
            </Text>
          )}
        </TouchableOpacity>
        
        <View style={styles.footer}>
          <Text style={[styles.footerText, { 
            color: theme.colors.text.secondary,
            fontFamily: theme.fontFamily.regular
          }]}>
            Don't have an account?{' '}
          </Text>
          <Link href="/(auth)/signup" asChild>
            <TouchableOpacity>
              <Text style={[styles.link, { 
                color: theme.colors.primary[500],
                fontFamily: theme.fontFamily.medium
              }]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logoContainer: {
    height: '40%',
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
  },
  footerText: {
    fontSize: 14,
  },
  link: {
    fontSize: 14,
  },
});