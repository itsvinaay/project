import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  Image, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  Switch
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { User, Settings, LogOut, Bell, Shield, CircleHelp as HelpCircle, ChevronRight, Moon } from 'lucide-react-native';

export default function ProfileScreen() {
  const theme = useTheme();
  const { user, userProfile, signOut } = useAuth();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(true);
  
  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };
  
  // Toggle settings
  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
  };
  
  const toggleDarkMode = () => {
    setDarkModeEnabled(!darkModeEnabled);
    // In a real app, this would update the theme
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { 
            color: theme.colors.text.primary,
            fontFamily: theme.fontFamily.semiBold
          }]}>
            Profile
          </Text>
        </View>
        
        <View style={[styles.profileCard, { backgroundColor: theme.colors.background.card }]}>
          <Image 
            source={{ uri: userProfile?.photoURL || 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' }} 
            style={styles.profileImage}
          />
          
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { 
              color: theme.colors.text.primary,
              fontFamily: theme.fontFamily.semiBold
            }]}>
              {userProfile?.displayName || user?.displayName || 'User'}
            </Text>
            <Text style={[styles.profileEmail, { 
              color: theme.colors.text.secondary,
              fontFamily: theme.fontFamily.regular
            }]}>
              {user?.email || 'user@example.com'}
            </Text>
            
            <TouchableOpacity style={[styles.editButton, { borderColor: theme.colors.primary[500] }]}>
              <Text style={[styles.editButtonText, { 
                color: theme.colors.primary[500],
                fontFamily: theme.fontFamily.medium
              }]}>
                Edit Profile
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={[styles.statsCard, { backgroundColor: theme.colors.background.card }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { 
              color: theme.colors.text.primary,
              fontFamily: theme.fontFamily.semiBold
            }]}>
              32
            </Text>
            <Text style={[styles.statLabel, { 
              color: theme.colors.text.secondary,
              fontFamily: theme.fontFamily.regular
            }]}>
              Workouts
            </Text>
          </View>
          
          <View style={[styles.statDivider, { backgroundColor: theme.colors.dark[700] }]} />
          
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { 
              color: theme.colors.text.primary,
              fontFamily: theme.fontFamily.semiBold
            }]}>
              128k
            </Text>
            <Text style={[styles.statLabel, { 
              color: theme.colors.text.secondary,
              fontFamily: theme.fontFamily.regular
            }]}>
              Steps
            </Text>
          </View>
          
          <View style={[styles.statDivider, { backgroundColor: theme.colors.dark[700] }]} />
          
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { 
              color: theme.colors.text.primary,
              fontFamily: theme.fontFamily.semiBold
            }]}>
              12
            </Text>
            <Text style={[styles.statLabel, { 
              color: theme.colors.text.secondary,
              fontFamily: theme.fontFamily.regular
            }]}>
              Days
            </Text>
          </View>
        </View>
        
        <View style={styles.settingsSection}>
          <Text style={[styles.sectionTitle, { 
            color: theme.colors.text.primary,
            fontFamily: theme.fontFamily.semiBold
          }]}>
            Settings
          </Text>
          
          <View style={[styles.settingsCard, { backgroundColor: theme.colors.background.card }]}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIconContainer, { backgroundColor: theme.colors.primary[900] }]}>
                  <Bell size={20} color={theme.colors.primary[500]} />
                </View>
                <Text style={[styles.settingLabel, { 
                  color: theme.colors.text.primary,
                  fontFamily: theme.fontFamily.medium
                }]}>
                  Notifications
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={toggleNotifications}
                trackColor={{ false: theme.colors.dark[700], true: theme.colors.primary[500] }}
                thumbColor={theme.colors.white}
              />
            </View>
            
            <View style={[styles.settingDivider, { backgroundColor: theme.colors.dark[800] }]} />
            
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIconContainer, { backgroundColor: theme.colors.primary[900] }]}>
                  <Moon size={20} color={theme.colors.primary[500]} />
                </View>
                <Text style={[styles.settingLabel, { 
                  color: theme.colors.text.primary,
                  fontFamily: theme.fontFamily.medium
                }]}>
                  Dark Mode
                </Text>
              </View>
              <Switch
                value={darkModeEnabled}
                onValueChange={toggleDarkMode}
                trackColor={{ false: theme.colors.dark[700], true: theme.colors.primary[500] }}
                thumbColor={theme.colors.white}
              />
            </View>
            
            <View style={[styles.settingDivider, { backgroundColor: theme.colors.dark[800] }]} />
            
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIconContainer, { backgroundColor: theme.colors.primary[900] }]}>
                  <Shield size={20} color={theme.colors.primary[500]} />
                </View>
                <Text style={[styles.settingLabel, { 
                  color: theme.colors.text.primary,
                  fontFamily: theme.fontFamily.medium
                }]}>
                  Privacy & Security
                </Text>
              </View>
              <ChevronRight size={20} color={theme.colors.text.secondary} />
            </TouchableOpacity>
            
            <View style={[styles.settingDivider, { backgroundColor: theme.colors.dark[800] }]} />
            
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIconContainer, { backgroundColor: theme.colors.primary[900] }]}>
                  <HelpCircle size={20} color={theme.colors.primary[500]} />
                </View>
                <Text style={[styles.settingLabel, { 
                  color: theme.colors.text.primary,
                  fontFamily: theme.fontFamily.medium
                }]}>
                  Help & Support
                </Text>
              </View>
              <ChevronRight size={20} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          </View>
        </View>
        
        <TouchableOpacity 
          style={[styles.signOutButton, { backgroundColor: theme.colors.background.card }]}
          onPress={handleSignOut}
        >
          <LogOut size={20} color={theme.colors.error[500]} />
          <Text style={[styles.signOutText, { 
            color: theme.colors.error[500],
            fontFamily: theme.fontFamily.medium
          }]}>
            Sign Out
          </Text>
        </TouchableOpacity>
        
        <Text style={[styles.versionText, { 
          color: theme.colors.text.tertiary,
          fontFamily: theme.fontFamily.regular
        }]}>
          Version 1.0.0
        </Text>
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
  },
  profileCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    marginBottom: 12,
  },
  editButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  editButtonText: {
    fontSize: 14,
  },
  statsCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  statDivider: {
    width: 1,
    height: '70%',
    alignSelf: 'center',
  },
  settingsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  settingsCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
  },
  settingDivider: {
    height: 1,
    width: '100%',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  signOutText: {
    fontSize: 16,
    marginLeft: 8,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    marginBottom: 24,
  },
});