import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  TouchableOpacity,
  Image
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { 
  Users, 
  Plus, 
  FileText, 
  LogOut,
  ChevronRight
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function TrainerDashboardScreen() {
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
              Trainer Dashboard
            </Text>
            <Text style={[styles.subtitle, { 
              color: theme.colors.text.secondary,
              fontFamily: theme.fontFamily.regular
            }]}>
              Manage your clients and workout plans
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
              8
            </Text>
            <Text style={[styles.statLabel, { 
              color: theme.colors.text.secondary,
              fontFamily: theme.fontFamily.regular
            }]}>
              Active Clients
            </Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: theme.colors.background.card }]}>
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.success[900] }]}>
              <FileText size={24} color={theme.colors.success[500]} />
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
              Workout Plans
            </Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { 
              color: theme.colors.text.primary,
              fontFamily: theme.fontFamily.semiBold
            }]}>
              Your Clients
            </Text>
            
            <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.colors.primary[500] }]}>
              <Plus size={16} color={theme.colors.white} />
            </TouchableOpacity>
          </View>
          
          <View style={[styles.clientsCard, { backgroundColor: theme.colors.background.card }]}>
            <TouchableOpacity style={styles.clientItem}>
              <Image 
                source={{ uri: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' }} 
                style={styles.clientImage}
              />
              <View style={styles.clientInfo}>
                <Text style={[styles.clientName, { 
                  color: theme.colors.text.primary,
                  fontFamily: theme.fontFamily.medium
                }]}>
                  David Johnson
                </Text>
                <Text style={[styles.clientGoal, { 
                  color: theme.colors.text.secondary,
                  fontFamily: theme.fontFamily.regular
                }]}>
                  Weight loss
                </Text>
              </View>
              <ChevronRight size={20} color={theme.colors.text.secondary} />
            </TouchableOpacity>
            
            <View style={[styles.clientDivider, { backgroundColor: theme.colors.dark[800] }]} />
            
            <TouchableOpacity style={styles.clientItem}>
              <Image 
                source={{ uri: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' }} 
                style={styles.clientImage}
              />
              <View style={styles.clientInfo}>
                <Text style={[styles.clientName, { 
                  color: theme.colors.text.primary,
                  fontFamily: theme.fontFamily.medium
                }]}>
                  Sarah Miller
                </Text>
                <Text style={[styles.clientGoal, { 
                  color: theme.colors.text.secondary,
                  fontFamily: theme.fontFamily.regular
                }]}>
                  Muscle gain
                </Text>
              </View>
              <ChevronRight size={20} color={theme.colors.text.secondary} />
            </TouchableOpacity>
            
            <View style={[styles.clientDivider, { backgroundColor: theme.colors.dark[800] }]} />
            
            <TouchableOpacity style={styles.clientItem}>
              <Image 
                source={{ uri: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' }} 
                style={styles.clientImage}
              />
              <View style={styles.clientInfo}>
                <Text style={[styles.clientName, { 
                  color: theme.colors.text.primary,
                  fontFamily: theme.fontFamily.medium
                }]}>
                  Michael Brown
                </Text>
                <Text style={[styles.clientGoal, { 
                  color: theme.colors.text.secondary,
                  fontFamily: theme.fontFamily.regular
                }]}>
                  General fitness
                </Text>
              </View>
              <ChevronRight size={20} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={[styles.viewAllButton, { borderColor: theme.colors.primary[500] }]}>
            <Text style={[styles.viewAllText, { 
              color: theme.colors.primary[500],
              fontFamily: theme.fontFamily.medium
            }]}>
              View All Clients
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { 
              color: theme.colors.text.primary,
              fontFamily: theme.fontFamily.semiBold
            }]}>
              Recent Workout Plans
            </Text>
            
            <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.colors.primary[500] }]}>
              <Plus size={16} color={theme.colors.white} />
            </TouchableOpacity>
          </View>
          
          <View style={[styles.plansCard, { backgroundColor: theme.colors.background.card }]}>
            <TouchableOpacity style={styles.planItem}>
              <View style={styles.planInfo}>
                <Text style={[styles.planTitle, { 
                  color: theme.colors.text.primary,
                  fontFamily: theme.fontFamily.medium
                }]}>
                  Full Body Strength
                </Text>
                <Text style={[styles.planClient, { 
                  color: theme.colors.text.secondary,
                  fontFamily: theme.fontFamily.regular
                }]}>
                  For: David Johnson
                </Text>
              </View>
              <ChevronRight size={20} color={theme.colors.text.secondary} />
            </TouchableOpacity>
            
            <View style={[styles.planDivider, { backgroundColor: theme.colors.dark[800] }]} />
            
            <TouchableOpacity style={styles.planItem}>
              <View style={styles.planInfo}>
                <Text style={[styles.planTitle, { 
                  color: theme.colors.text.primary,
                  fontFamily: theme.fontFamily.medium
                }]}>
                  HIIT Cardio
                </Text>
                <Text style={[styles.planClient, { 
                  color: theme.colors.text.secondary,
                  fontFamily: theme.fontFamily.regular
                }]}>
                  For: Sarah Miller
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
    width: '48%',
    borderRadius: 16,
    padding: 16,
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
    fontSize: 24,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clientsCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  clientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  clientImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  clientInfo: {
    flex: 1,
    marginLeft: 16,
  },
  clientName: {
    fontSize: 16,
    marginBottom: 4,
  },
  clientGoal: {
    fontSize: 14,
  },
  clientDivider: {
    height: 1,
    width: '100%',
  },
  viewAllButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
  },
  plansCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  planItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  planInfo: {
    flex: 1,
  },
  planTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  planClient: {
    fontSize: 14,
  },
  planDivider: {
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