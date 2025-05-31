import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { ActivityIndicator } from 'react-native';
import { Lock, Mail } from 'lucide-react-native';

export default function SignInScreen() {
  const { signIn, isLoading } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }
    
    try {
      await signIn(email, password);
      // Navigation is handled in AuthContext
    } catch (error: any) {
      Alert.alert('Sign In Failed', error.message || 'Please check your credentials');
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
          FitTrack<Text style={{ color: theme.colors.primary[500] }}>Pro</Text>
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