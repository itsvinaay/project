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
import DateSelector from '@/components/DateSelector';
import { getStreakDays, updateStreakDays } from '@/utils/supabase';
import { getMetricEntries, MetricEntry } from '@/services/metricDataService';
import WeightChart from '@/components/WeightChart';
import MetricChart from '@/components/MetricChart';

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
  const [streakDays, setStreakDays] = useState<Set<string>>(new Set());
  const [isLoadingStreakDays, setIsLoadingStreakDays] = useState(true);

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
  
  
  // Fetch streak days on load
  useEffect(() => {
    const fetchUserStreakDays = async () => {
      if (user?.id) {
        setIsLoadingStreakDays(true);
        try {
          const fetchedStreakDaysArray = await getStreakDays(user.id);
          if (fetchedStreakDaysArray) {
            setStreakDays(new Set(fetchedStreakDaysArray));
          }
        } catch (error) {
          console.error('Error fetching streak days:', error);
          // Optionally, show an alert to the user
        } finally {
          setIsLoadingStreakDays(false);
        }
      }
    };
    fetchUserStreakDays();
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

  const handleStreakDaysChange = async (newStreakDays: Set<string>) => {
    setStreakDays(newStreakDays);
    if (user?.id) {
      try {
        await updateStreakDays(user.id, Array.from(newStreakDays));
      } catch (error) {
        console.error('Error updating streak days in Supabase:', error);
        // Optionally, show an alert to the user and revert local state if needed
      }
    }
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Fixed Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { 
            color: theme.colors.text.primary,
            fontFamily: theme.fontFamily.semiBold
          }]}>
            You
          </Text>
          <TouchableOpacity style={styles.settingsButton}>
            <View style={styles.profileInitials}>
              <Text style={styles.initialsText}>VD</Text>
            </View>
            <View style={styles.settingsIconWrapper}>
              <Settings size={16} color={theme.colors.text.primary} />
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Stats Card */}
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
              {streakDays.size}
            </Text>
            <Text style={[styles.statLabel, { 
              color: theme.colors.text.secondary,
              fontFamily: theme.fontFamily.regular
            }]}>
              Days
            </Text>
          </View>
        </View>

        
          <View style={styles.metricsSection}>
                    <View style={styles.metricsSectionHeader}>
                      <Text style={[styles.metricsSectionTitle, { 
                        color: theme.colors.text.primary,
                        fontFamily: theme.fontFamily.semiBold
                      }]}>
                        Metrics
                      </Text>
                      <TouchableOpacity onPress={() => router.push('/myprofile/metrics')}>
                        <Text style={[styles.viewMoreText, { 
                          color: theme.colors.primary[500],
                          fontFamily: theme.fontFamily.medium
                        }]}>
                          View more
                        </Text>
                      </TouchableOpacity>
                    </View>
                    
                    <View style={[styles.metricsCard, { backgroundColor: theme.colors.background.card }]}>
                              <Text style={styles.chartTitle}>WEIGHT (KG)</Text>
                    
                             <MetricChart 
                               data={[
                                 { date: '4/5', value: 58 },
                                 { date: '4/17', value: 57 },
                                 { date: '5/23', value: 52 },
                                 { date: '6/3', value: 58 },
                               ]}
                               height={200}
                             />
                    </View>
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
            
            <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/activity')}>
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
            
            <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/myprofile/steps')}>
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
    paddingTop: 16, // Reduced from 56 to fix spacing
  },
  // Fixed Header Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  settingsButton: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitials: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  settingsIconWrapper: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
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
   chartTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  statsCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    marginBottom: 4,
    fontWeight: '600',
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
    fontSize: 20,
    marginBottom: 12,
  },
  settingsCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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