import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { 
  Users, 
  UserCheck, 
  UserX, 
  ChartBar as BarChart3, 
  LogOut, 
  ChevronRight 
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { getPendingApprovalUsers, approveUser, rejectUser, UserProfile, getDashboardStats, DashboardStats } from '@/utils/supabase';
import { Alert, ActivityIndicator } from 'react-native';

export default function AdminDashboardScreen() {
  const theme = useTheme();
  const { userProfile, signOut } = useAuth();
  const router = useRouter();
  const [pendingUsers, setPendingUsers] = React.useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = React.useState<DashboardStats | null>(null);
  const [isStatsLoading, setIsStatsLoading] = React.useState(true);
  
  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/(auth)/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const fetchPendingUsers = async () => {
    console.log('[AdminDashboard] fetchPendingUsers called');
    try {
      console.log('[AdminDashboard] Calling getPendingApprovalUsers...');
      const users = await getPendingApprovalUsers();
      console.log('[AdminDashboard] Fetched pending users:', JSON.stringify(users, null, 2));
      setPendingUsers(users);
      setError(null);
      return users; // Return the users for the .then() chain
    } catch (err) {
      console.error('[AdminDashboard] Failed to fetch pending users:', err);
      setError('Failed to fetch pending users');
      throw err; // Re-throw to be caught by the .catch()
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    console.log('[AdminDashboard] useEffect triggered. UserProfile:', JSON.stringify(userProfile, null, 2)); // Log entire profile for inspection
    if (userProfile?.role === 'admin') {
      console.log('[AdminDashboard] User is admin, fetching data...');
      fetchPendingUsers().then(() => console.log('[AdminDashboard] Fetched pending users.'));
      fetchDashboardData().then(() => console.log('[AdminDashboard] Fetched dashboard stats.'));
    } else {
      console.log('[AdminDashboard] User is NOT admin or profile not loaded. Current role:', userProfile?.role);
    }
  }, [userProfile]);

  const fetchDashboardData = async () => {
    try {
      setIsStatsLoading(true);
      const stats = await getDashboardStats();
      setDashboardStats(stats);
    } catch (e: any) {
      console.error('Failed to fetch dashboard stats:', e);
      // Optionally set an error state for stats specifically
      Alert.alert('Error', e.message || 'Failed to load dashboard statistics.');
    } finally {
      setIsStatsLoading(false);
    }
  };

  const handleApprove = async (userIdToApprove: string) => {
    if (!userProfile?.id) {
      Alert.alert('Error', 'Admin user ID not found.');
      return;
    }
    try {
      await approveUser(userIdToApprove, userProfile.id);
      Alert.alert('Success', 'User approved.');
      fetchPendingUsers(); // Refresh list
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to approve user.');
    }
  };

  const handleReject = async (userIdToReject: string) => {
    Alert.alert(
      'Confirm Rejection',
      'Are you sure you want to reject and delete this user profile?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject & Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await rejectUser(userIdToReject);
              Alert.alert('Success', 'User rejected and profile deleted.');
              fetchPendingUsers(); // Refresh list
            } catch (e: any) {
              Alert.alert('Error', e.message || 'Failed to reject user.');
            }
          },
        },
      ]
    );
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { 
              color: theme.colors.text.primary,
              fontFamily: theme.fontFamily.semiBold
            }]}>
              Admin Dashboard
            </Text>
            <Text style={[styles.subtitle, { 
              color: theme.colors.text.secondary,
              fontFamily: theme.fontFamily.regular
            }]}>
              Manage users and applications
            </Text>
          </View>
        </View>
        
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: theme.colors.background.card }]}>
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary[900] }]}>
              <Users size={24} color={theme.colors.primary[500]} />
            </View>
            <Text style={[styles.statValue, { 
              color: theme.colors.text.primary,
              fontFamily: theme.fontFamily.semiBold
            }]}>
              {isStatsLoading ? '...' : dashboardStats?.totalUsers ?? '0'}
            </Text>
            <Text style={[styles.statLabel, { 
              color: theme.colors.text.secondary,
              fontFamily: theme.fontFamily.regular
            }]}>
              Total Users
            </Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: theme.colors.background.card }]}>
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.success[900] }]}>
              <UserCheck size={24} color={theme.colors.success[500]} />
            </View>
            <Text style={[styles.statValue, { 
              color: theme.colors.text.primary,
              fontFamily: theme.fontFamily.semiBold
            }]}>
              {isStatsLoading ? '...' : dashboardStats?.totalTrainers ?? '0'}
            </Text>
            <Text style={[styles.statLabel, { 
              color: theme.colors.text.secondary,
              fontFamily: theme.fontFamily.regular
            }]}>
              Trainers
            </Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: theme.colors.background.card }]}>
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.warning[900] }]}>
              <UserX size={24} color={theme.colors.warning[500]} />
            </View>
            <Text style={[styles.statValue, { 
              color: theme.colors.text.primary,
              fontFamily: theme.fontFamily.semiBold
            }]}>
              {isStatsLoading ? '...' : dashboardStats?.totalNutritionists ?? '0'}
            </Text>
            <Text style={[styles.statLabel, { 
              color: theme.colors.text.secondary,
              fontFamily: theme.fontFamily.regular
            }]}>
              Nutritionists
            </Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { 
            color: theme.colors.text.primary,
            fontFamily: theme.fontFamily.semiBold
          }]}>
            Pending Applications
          </Text>
          
          {isLoading ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={theme.colors.primary[500]} />
              <Text style={{ marginTop: 10, color: theme.colors.text.secondary }}>Loading pending applications...</Text>
            </View>
          ) : error ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: theme.colors.error[500] }}>{error}</Text>
              <TouchableOpacity 
                onPress={fetchPendingUsers}
                style={{ 
                  marginTop: 10, 
                  padding: 10, 
                  backgroundColor: theme.colors.primary[500],
                  borderRadius: 8
                }}
              >
                <Text style={{ color: 'white' }}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : pendingUsers.length === 0 ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: theme.colors.text.secondary }}>No pending applications.</Text>
            </View>
          ) : (
            <View style={[styles.pendingCard, { backgroundColor: theme.colors.background.card }]}>
              {pendingUsers.map((user, index) => (
                <View key={user.id}>
                  {index > 0 && <View style={[styles.pendingDivider, { backgroundColor: theme.colors.dark[800] }]} />}
                  <View style={styles.pendingItem}>
                    <View style={styles.pendingInfo}>
                      <Text style={[styles.pendingName, { 
                        color: theme.colors.text.primary,
                        fontFamily: theme.fontFamily.medium
                      }]}>
                        {user.full_name || 'No Name'}
                      </Text>
                      <Text style={[styles.pendingRole, { 
                        color: theme.colors.text.secondary,
                        fontFamily: theme.fontFamily.regular
                      }]}>
                        {user.role === 'trainer' ? 'Trainer' : 'Nutritionist'} Application
                      </Text>
                    </View>
                    
                    <View style={styles.pendingActions}>
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.approveButton, { backgroundColor: theme.colors.success[500] }]}
                        onPress={() => handleApprove(user.id)}
                      >
                        <Text style={[styles.actionButtonText, { 
                          color: theme.colors.white,
                          fontFamily: theme.fontFamily.medium
                        }]}>
                          Approve
                        </Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.rejectButton, { backgroundColor: theme.colors.error[500] }]}
                        onPress={() => handleReject(user.id)}
                      >
                        <Text style={[styles.actionButtonText, { 
                          color: theme.colors.white,
                          fontFamily: theme.fontFamily.medium
                        }]}>
                          Decline
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { 
            color: theme.colors.text.primary,
            fontFamily: theme.fontFamily.semiBold
          }]}>
            Quick Actions
          </Text>
          
          <View style={[styles.actionsCard, { backgroundColor: theme.colors.background.card }]}>
            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => router.push('/(admin)/manage-users')}
            >
              <View style={styles.actionLeft}>
                <View style={[styles.actionIconContainer, { backgroundColor: theme.colors.primary[900] }]}>
                  <Users size={20} color={theme.colors.primary[500]} />
                </View>
                <Text style={[styles.actionLabel, { 
                  color: theme.colors.text.primary,
                  fontFamily: theme.fontFamily.medium
                }]}>
                  Manage Users
                </Text>
              </View>
              <ChevronRight size={20} color={theme.colors.text.secondary} />
            </TouchableOpacity>
            
            <View style={[styles.actionDivider, { backgroundColor: theme.colors.dark[800] }]} />
            
            <TouchableOpacity style={styles.actionItem}>
              <View style={styles.actionLeft}>
                <View style={[styles.actionIconContainer, { backgroundColor: theme.colors.primary[900] }]}>
                  <BarChart3 size={20} color={theme.colors.primary[500]} />
                </View>
                <Text style={[styles.actionLabel, { 
                  color: theme.colors.text.primary,
                  fontFamily: theme.fontFamily.medium
                }]}>
                  View Analytics
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '31%',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  pendingCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  pendingItem: {
    padding: 16,
  },
  pendingInfo: {
    marginBottom: 12,
  },
  pendingName: {
    fontSize: 16,
    marginBottom: 4,
  },
  pendingRole: {
    fontSize: 14,
  },
  pendingActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8,
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    fontSize: 14,
  },
  pendingDivider: {
    height: 1,
    width: '100%',
  },
  actionsCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionLabel: {
    fontSize: 16,
  },
  actionDivider: {
    height: 1,
    width: '100%',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  signOutText: {
    fontSize: 16,
    marginLeft: 8,
  },
});