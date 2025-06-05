import React, { useState, useEffect } from 'react';
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
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { User, Settings, LogOut, Bell, Shield, CircleHelp as HelpCircle, ChevronRight, Moon, Activity, Camera, Dumbbell, Footprints } from 'lucide-react-native';
import { getActivityLogs } from '@/utils/supabase';
import ActivityHistory from '@/components/ActivityHistory';
import ProgressPhotos from '@/components/ProgressPhotos';
import ProfileWeightMetrics from '@/components/ProfileWeightMetrics';
import { getMetricEntries, MetricEntry } from '@/services/metricDataService';

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user, userProfile, signOut } = useAuth();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(true);
  const [userActivities, setUserActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [weightEntries, setWeightEntries] = useState<MetricEntry[]>([]);
  const [weightData, setWeightData] = useState<number[]>([]);
  const [weightDates, setWeightDates] = useState<string[]>([]);

  // Fetch weight metrics data
  useEffect(() => {
    const fetchWeightData = () => {
      const entries = getMetricEntries('weight');
      setWeightEntries(entries);
      
      if (entries.length > 0) {
        // Sort entries by date (oldest to newest) for proper chart display
        const sortedEntries = [...entries].sort((a, b) => {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
        
        // Extract values and dates for the chart
        const values = sortedEntries.map(entry => parseFloat(entry.value));
        
        // Format dates more clearly for the chart
        const dates = sortedEntries.map(entry => {
          const date = new Date(entry.date);
          const month = date.toLocaleString('default', { month: 'short' });
          return `${month} ${date.getDate()}`;
        });
        
        setWeightData(values);
        setWeightDates(dates);
      } else {
        // Set default empty arrays if no data
        setWeightData([]);
        setWeightDates([]);
      }
    };
    
    fetchWeightData();
    
    // Set up interval to refresh weight data
    const weightInterval = setInterval(fetchWeightData, 2000);
    return () => clearInterval(weightInterval);
  }, []);
  
  // Fetch user activities
  useEffect(() => {
    const fetchActivities = async () => {
      if (user?.id) {
        try {
          setIsLoading(true);
          const activities = await getActivityLogs(user.id);
          // Sort activities by date (newest first)
          const sortedActivities = activities?.sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          ) || [];
          setUserActivities(sortedActivities);
        } catch (error) {
          console.error('Error fetching activities:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchActivities();
  }, [user?.id]);
  
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
        
        {/* Metrics Section */}
        <View style={styles.metricsSection}>
          <View style={styles.metricsSectionHeader}>
            <Text style={[styles.metricsSectionTitle, { 
              color: theme.colors.text.primary,
              fontFamily: theme.fontFamily.semiBold
            }]}>
              Metrics
            </Text>
            <TouchableOpacity onPress={() => router.push('/(metrics)')}>
              <Text style={[styles.viewMoreText, { 
                color: theme.colors.primary[500],
                fontFamily: theme.fontFamily.medium
              }]}>
                View more
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={[styles.metricsCard, { backgroundColor: theme.colors.background.card }]}>
            <ProfileWeightMetrics 
              weightData={weightData.length > 0 ? weightData : [0]}
              dates={weightDates.length > 0 ? weightDates : ['Today']}
              unit={weightEntries.length > 0 ? weightEntries[0].unit : 'KG'}
              isLoading={isLoading}
            />
          </View>
        </View>

        {/* Settings Section */}
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
            
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIconContainer, { backgroundColor: theme.colors.primary[900] }]}>
                  <Activity size={20} color={theme.colors.primary[500]} />
                </View>
                <Text style={[styles.settingLabel, { 
                  color: theme.colors.text.primary,
                  fontFamily: theme.fontFamily.medium
                }]}>
                  Activity History
                </Text>
              </View>
              <ChevronRight size={20} color={theme.colors.text.secondary} />
            </TouchableOpacity>

            <View style={[styles.settingDivider, { backgroundColor: theme.colors.dark[800] }]} />
            
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIconContainer, { backgroundColor: theme.colors.primary[900] }]}>
                  <Dumbbell size={20} color={theme.colors.primary[500]} />
                </View>
                <Text style={[styles.settingLabel, { 
                  color: theme.colors.text.primary,
                  fontFamily: theme.fontFamily.medium
                }]}>
                  Your Exercises
                </Text>
              </View>
              <ChevronRight size={20} color={theme.colors.text.secondary} />
            </TouchableOpacity>
            
            <View style={[styles.settingDivider, { backgroundColor: theme.colors.dark[800] }]} />
            
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIconContainer, { backgroundColor: theme.colors.primary[900] }]}>
                  <Camera size={20} color={theme.colors.primary[500]} />
                </View>
                <Text style={[styles.settingLabel, { 
                  color: theme.colors.text.primary,
                  fontFamily: theme.fontFamily.medium
                }]}>
                 Progress Photos
                </Text>
              </View>
              <ChevronRight size={20} color={theme.colors.text.secondary} />
            </TouchableOpacity>

            <View style={[styles.settingDivider, { backgroundColor: theme.colors.dark[800] }]} />
            
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIconContainer, { backgroundColor: theme.colors.primary[900] }]}>
                  <Footprints size={20} color={theme.colors.primary[500]} />
                </View>
                <Text style={[styles.settingLabel, { 
                  color: theme.colors.text.primary,
                  fontFamily: theme.fontFamily.medium
                }]}>
                  Steps
                </Text>
              </View>
              <ChevronRight size={20} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Progress Photos Section */}
        <View style={styles.settingsSection}>
          <View style={styles.sectionHeader}>
            <Camera size={20} color={theme.colors.primary[500]} style={styles.sectionIcon} />
            <Text style={[styles.sectionTitle, { 
              color: theme.colors.text.primary,
              fontFamily: theme.fontFamily.semiBold
            }]}>
              Progress Photos
            </Text>
          </View>
          <View style={[styles.sectionCard, { backgroundColor: theme.colors.background.card }]}>
            <ProgressPhotos userId={user?.id || ''} />
          </View>
        </View>

        {/* Activity History Section */}
        <View style={styles.settingsSection}>
          <View style={styles.sectionHeader}>
            <Activity size={20} color={theme.colors.primary[500]} style={styles.sectionIcon} />
            <Text style={[styles.sectionTitle, { 
              color: theme.colors.text.primary,
              fontFamily: theme.fontFamily.semiBold
            }]}>
              Activity History
            </Text>
          </View>
          <View style={[styles.sectionCard, { backgroundColor: theme.colors.background.card }]}>
            {isLoading ? (
              <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background.card }]}>
                <Text style={{ color: theme.colors.text.secondary }}>Loading activities...</Text>
              </View>
            ) : (
              <ActivityHistory activities={userActivities} />
            )}
          </View>
        </View>

        {/* Sign Out Button */}
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionCard: {
    borderRadius: 12,
    padding: 16,
    overflow: 'hidden',
  },
  loadingContainer: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
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
  // Metrics section styles
  metricsSection: {
    marginBottom: 24,
  },
  metricsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  metricsSectionTitle: {
    fontSize: 20,
  },
  viewMoreText: {
    fontSize: 14,
  },
  metricsCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 8,
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