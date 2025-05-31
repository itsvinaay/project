import React, { useState } from 'react';
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
import { Users, UserCheck, UserX, ChartBar as BarChart3, LogOut, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function AdminDashboardScreen() {
  const theme = useTheme();
  const { userProfile, signOut } = useAuth();
  const router = useRouter();
  
  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/(auth)/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
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
              152
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
              12
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
              8
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
          
          <View style={[styles.pendingCard, { backgroundColor: theme.colors.background.card }]}>
            <View style={styles.pendingItem}>
              <View style={styles.pendingInfo}>
                <Text style={[styles.pendingName, { 
                  color: theme.colors.text.primary,
                  fontFamily: theme.fontFamily.medium
                }]}>
                  John Smith
                </Text>
                <Text style={[styles.pendingRole, { 
                  color: theme.colors.text.secondary,
                  fontFamily: theme.fontFamily.regular
                }]}>
                  Trainer Application
                </Text>
              </View>
              
              <View style={styles.pendingActions}>
                <TouchableOpacity style={[styles.actionButton, styles.approveButton, { backgroundColor: theme.colors.success[500] }]}>
                  <Text style={[styles.actionButtonText, { 
                    color: theme.colors.white,
                    fontFamily: theme.fontFamily.medium
                  }]}>
                    Approve
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={[styles.actionButton, styles.rejectButton, { backgroundColor: theme.colors.error[500] }]}>
                  <Text style={[styles.actionButtonText, { 
                    color: theme.colors.white,
                    fontFamily: theme.fontFamily.medium
                  }]}>
                    Decline
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={[styles.pendingDivider, { backgroundColor: theme.colors.dark[800] }]} />
            
            <View style={styles.pendingItem}>
              <View style={styles.pendingInfo}>
                <Text style={[styles.pendingName, { 
                  color: theme.colors.text.primary,
                  fontFamily: theme.fontFamily.medium
                }]}>
                  Emma Wilson
                </Text>
                <Text style={[styles.pendingRole, { 
                  color: theme.colors.text.secondary,
                  fontFamily: theme.fontFamily.regular
                }]}>
                  Nutritionist Application
                </Text>
              </View>
              
              <View style={styles.pendingActions}>
                <TouchableOpacity style={[styles.actionButton, styles.approveButton, { backgroundColor: theme.colors.success[500] }]}>
                  <Text style={[styles.actionButtonText, { 
                    color: theme.colors.white,
                    fontFamily: theme.fontFamily.medium
                  }]}>
                    Approve
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={[styles.actionButton, styles.rejectButton, { backgroundColor: theme.colors.error[500] }]}>
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
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { 
            color: theme.colors.text.primary,
            fontFamily: theme.fontFamily.semiBold
          }]}>
            Quick Actions
          </Text>
          
          <View style={[styles.actionsCard, { backgroundColor: theme.colors.background.card }]}>
            <TouchableOpacity style={styles.actionItem}>
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