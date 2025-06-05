import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, FlatList, Alert } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { 
  User, 
  UserCheck, 
  UserX, 
  Search, 
  ChevronLeft,
  Shield,
  UserCog,
  UserPlus,
  Filter,
  AlertTriangle,
  RefreshCw
} from 'lucide-react-native';
import { getAllUsers, updateUserRole, deactivateUser, UserProfile } from '@/utils/supabase';

// Error types for better error handling
enum ErrorType {
  NETWORK = 'NETWORK',
  UNAUTHORIZED = 'UNAUTHORIZED',
  VALIDATION = 'VALIDATION',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN'
}

interface AppError {
  type: ErrorType;
  message: string;
  details?: string;
}

// Helper function to classify errors
const classifyError = (error: any): AppError => {
  if (!error) {
    return { type: ErrorType.UNKNOWN, message: 'An unknown error occurred' };
  }

  const errorMessage = error.message || error.toString();
  
  // Network errors
  if (errorMessage.includes('network') || errorMessage.includes('fetch') || error.code === 'NETWORK_ERROR') {
    return {
      type: ErrorType.NETWORK,
      message: 'Network connection error',
      details: 'Please check your internet connection and try again'
    };
  }
  
  // Authentication errors
  if (errorMessage.includes('401') || errorMessage.includes('unauthorized') || errorMessage.includes('auth')) {
    return {
      type: ErrorType.UNAUTHORIZED,
      message: 'Authentication error',
      details: 'Please log in again to continue'
    };
  }
  
  // Validation errors
  if (errorMessage.includes('400') || errorMessage.includes('validation') || errorMessage.includes('invalid')) {
    return {
      type: ErrorType.VALIDATION,
      message: 'Invalid data provided',
      details: errorMessage
    };
  }
  
  // Server errors
  if (errorMessage.includes('500') || errorMessage.includes('server')) {
    return {
      type: ErrorType.SERVER,
      message: 'Server error',
      details: 'The server is experiencing issues. Please try again later'
    };
  }
  
  return {
    type: ErrorType.UNKNOWN,
    message: errorMessage || 'An unexpected error occurred',
    details: 'Please try again or contact support if the problem persists'
  };
};

const UserRoleBadge = ({ role, theme }: { role: string, theme: any }) => {
  // Safe theme access with fallbacks
  const safeTheme = theme || {};
  const colors = safeTheme.colors || {};
  const primary = colors.primary || {};
  const success = colors.success || {};
  const info = colors.info || {};
  const gray = colors.gray || {};

  const roleColors = {
    admin: primary[500] || '#007AFF',
    trainer: success[500] || '#34C759',
    nutritionist: info[500] || '#5AC8FA',
    user: gray[500] || '#8E8E93',
  };

  const safeRole = role || 'user';
  const backgroundColor = roleColors[safeRole as keyof typeof roleColors] || gray[200] || '#F2F2F7';

  return (
    <View style={[styles.roleBadge, { backgroundColor }]}>
      <Text style={[styles.roleText, { color: 'white' }]}>
        {safeRole.charAt(0).toUpperCase() + safeRole.slice(1)}
      </Text>
    </View>
  );
};

export default function ManageUsersScreen() {
  const theme = useTheme();
  const { userProfile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AppError | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [operationLoading, setOperationLoading] = useState<{ [key: string]: boolean }>({});

  // Validate user permissions
  const validateUserPermissions = useCallback((): boolean => {
    if (!userProfile) {
      setError({
        type: ErrorType.UNAUTHORIZED,
        message: 'User not authenticated',
        details: 'Please log in to access this feature'
      });
      return false;
    }
    
    if (userProfile.role !== 'admin') {
      setError({
        type: ErrorType.UNAUTHORIZED,
        message: 'Insufficient permissions',
        details: 'Only administrators can manage users'
      });
      return false;
    }
    
    return true;
  }, [userProfile]);

  const fetchUsers = useCallback(async (isRefresh = false) => {
    try {
      console.log('[fetchUsers] Starting to fetch users...', { isRefresh });
      
      if (!validateUserPermissions()) {
        return;
      }

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setIsLoading(true);
      }
      
      setError(null);
      
      const result = await getAllUsers();
      console.log('[fetchUsers] Received response:', result);
      
      // Validate response structure
      if (!result || typeof result !== 'object') {
        throw new Error('Invalid response format from server');
      }
      
      const usersList = result.users;
      
      // Validate users array
      if (!Array.isArray(usersList)) {
        throw new Error('Invalid users data format');
      }
      
      // Validate each user object
      const validUsers = usersList.filter(user => {
        if (!user || typeof user !== 'object') {
          console.warn('[fetchUsers] Invalid user object:', user);
          return false;
        }
        
        if (!user.id || !user.email) {
          console.warn('[fetchUsers] User missing required fields:', user);
          return false;
        }
        
        return true;
      });
      
      console.log(`[fetchUsers] Found ${validUsers.length} valid users out of ${usersList.length} total`);
      
      setUsers(validUsers);
      setFilteredUsers(validUsers);
    } catch (err) {
      console.error('[fetchUsers] Error:', err);
      const appError = classifyError(err);
      setError(appError);
      
      // For certain errors, clear the users list
      if (appError.type === ErrorType.UNAUTHORIZED) {
        setUsers([]);
        setFilteredUsers([]);
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [validateUserPermissions]);

  // Safe filtering with comprehensive error handling
  const applyFilters = useCallback(() => {
    try {
      console.log('[applyFilters] Starting filter update', { 
        usersCount: users?.length || 0, 
        searchQuery, 
        selectedRole 
      });
      
      if (!users || !Array.isArray(users) || users.length === 0) {
        console.warn('[applyFilters] Users is not a valid array:', users);
        setFilteredUsers([]);
        return;
      }
      
      // Create a safe copy of the users array
      let result = [];
      try {
        result = users.slice();
      } catch (sliceError) {
        console.error('[applyFilters] Error copying users array:', sliceError);
        result = [];
      }
      
      // Apply search filter
      if (searchQuery && typeof searchQuery === 'string' && searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        
        result = result.filter(user => {
          try {
            if (!user || typeof user !== 'object') {
              return false;
            }
            
            const fullName = (user.full_name || '').toString().toLowerCase();
            const email = (user.email || '').toString().toLowerCase();
            const role = (user.role || '').toString().toLowerCase();
            
            return fullName.includes(query) || 
                   email.includes(query) || 
                   role.includes(query);
          } catch (filterError) {
            console.error('[applyFilters] Error filtering user:', filterError, user);
            return false;
          }
        });
      }
      
      // Apply role filter
      if (selectedRole && typeof selectedRole === 'string' && selectedRole.trim()) {
        result = result.filter(user => {
          try {
            return user && user.role === selectedRole;
          } catch (roleError) {
            console.error('[applyFilters] Error in role filter:', roleError, user);
            return false;
          }
        });
      }
      
      console.log('[applyFilters] Filtered result count:', result.length);
      setFilteredUsers(result);
    } catch (error) {
      console.error('[applyFilters] Critical error in filter function:', error);
      setFilteredUsers([]);
    }
  }, [users, searchQuery, selectedRole]);

  useEffect(() => {
    if (userProfile?.role === 'admin') {
      fetchUsers();
    } else if (userProfile && userProfile.role !== 'admin') {
      setError({
        type: ErrorType.UNAUTHORIZED,
        message: 'Access denied',
        details: 'You need administrator privileges to access this feature'
      });
      setIsLoading(false);
    }
  }, [userProfile, fetchUsers]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    // Input validation
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      Alert.alert('Error', 'Invalid user ID');
      return;
    }
    
    if (!newRole || typeof newRole !== 'string' || newRole.trim() === '') {
      Alert.alert('Error', 'Invalid role selection');
      return;
    }
    
    const validRoles = ['user', 'trainer', 'nutritionist', 'admin'];
    if (!validRoles.includes(newRole)) {
      Alert.alert('Error', 'Invalid role selected');
      return;
    }

    try {
      setOperationLoading(prev => ({ ...prev, [`role_${userId}`]: true }));
      
      const result = await updateUserRole(userId, newRole);
      console.log('[handleRoleChange] Update result:', result);
      
      // Update local state optimistically
      setUsers(prevUsers => {
        if (!prevUsers || !Array.isArray(prevUsers)) {
          console.warn('[handleRoleChange] Previous users is not valid array');
          return prevUsers || [];
        }
        
        return prevUsers.map(user => {
          if (!user || typeof user !== 'object' || !user.id) {
            return user;
          }
          return user.id === userId ? { ...user, role: newRole } : user;
        });
      });
      
      // Show success feedback
      Alert.alert('Success', 'User role updated successfully');
    } catch (err) {
      console.error('Failed to update user role:', err);
      const appError = classifyError(err);
      
      Alert.alert(
        'Error', 
        `Failed to update user role: ${appError.message}`,
        [
          { text: 'OK' },
          { text: 'Retry', onPress: () => handleRoleChange(userId, newRole) }
        ]
      );
    } finally {
      setOperationLoading(prev => {
        if (!prev || typeof prev !== 'object') {
          return { [`role_${userId}`]: false };
        }
        return { ...prev, [`role_${userId}`]: false };
      });
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    // Input validation
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      Alert.alert('Error', 'Invalid user ID');
      return;
    }
    
    // Find user for confirmation - with safe array check
    if (!users || !Array.isArray(users)) {
      Alert.alert('Error', 'Users data not available');
      return;
    }
    
    const user = users.find(u => u && typeof u === 'object' && u.id === userId);
    if (!user) {
      Alert.alert('Error', 'User not found');
      return;
    }

    const userName = user.full_name || user.email || 'Unknown User';

    Alert.alert(
      'Confirm Deactivation',
      `Are you sure you want to deactivate ${userName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Deactivate', 
          style: 'destructive',
          onPress: async () => {
            try {
              setOperationLoading(prev => ({ ...prev, [`deactivate_${userId}`]: true }));
              
              const result = await deactivateUser(userId);
              console.log('[handleDeactivateUser] Deactivate result:', result);
              
              // Remove from local state
              setUsers(prevUsers => {
                if (!prevUsers || !Array.isArray(prevUsers)) {
                  console.warn('[handleDeactivateUser] Previous users is not valid array');
                  return prevUsers || [];
                }
                
                return prevUsers.filter(user => {
                  if (!user || typeof user !== 'object' || !user.id) {
                    return false;
                  }
                  return user.id !== userId;
                });
              });
              
              Alert.alert('Success', 'User deactivated successfully');
            } catch (err) {
              console.error('Failed to deactivate user:', err);
              const appError = classifyError(err);
              
              Alert.alert(
                'Error', 
                `Failed to deactivate user: ${appError.message}`,
                [
                  { text: 'OK' },
                  { text: 'Retry', onPress: () => handleDeactivateUser(userId) }
                ]
              );
            } finally {
              setOperationLoading(prev => {
                if (!prev || typeof prev !== 'object') {
                  return { [`deactivate_${userId}`]: false };
                }
                return { ...prev, [`deactivate_${userId}`]: false };
              });
            }
          }
        }
      ]
    );
  };

  const handleRefresh = useCallback(() => {
    fetchUsers(true);
  }, [fetchUsers]);

  const renderUserItem = ({ item }: { item: UserProfile }) => {
    // Safety check for item
    if (!item || typeof item !== 'object' || !item.id) {
      console.warn('[renderUserItem] Invalid item:', item);
      return null;
    }

    const isRoleLoading = operationLoading && operationLoading[`role_${item.id}`];
    const isDeactivateLoading = operationLoading && operationLoading[`deactivate_${item.id}`];

    // Safe property access with fallbacks
    const userName = item.full_name || 'No Name';
    const userEmail = item.email || 'No Email';
    const userRole = item.role || 'user';
    const userId = item.id || 'Unknown ID';

    return (
      <View style={[styles.userCard, { backgroundColor: theme?.colors?.background?.card || '#fff' }]}>
        <View style={styles.userInfo}>
          <View style={styles.userHeader}>
            <Text style={[styles.userName, { color: theme?.colors?.text?.primary || '#000' }]}>
              {userName}
            </Text>
            <UserRoleBadge role={userRole} theme={theme} />
          </View>
          <Text style={[styles.userEmail, { color: theme?.colors?.text?.secondary || '#666' }]}>
            {userEmail}
          </Text>
          <Text style={[styles.userId, { color: theme?.colors?.text?.tertiary || '#999' }]}>
            ID: {userId}
          </Text>
        </View>
        
        <View style={styles.userActions}>
          <View style={styles.roleSelector}>
            <Text style={[styles.roleLabel, { color: theme?.colors?.text?.secondary || '#666' }]}>
              Role:
            </Text>
            <View style={styles.roleButtons}>
              {['user', 'trainer', 'nutritionist', 'admin'].map(role => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.roleButton,
                    userRole === role && { 
                      backgroundColor: theme?.colors?.primary?.[500] || '#007AFF',
                      borderColor: theme?.colors?.primary?.[500] || '#007AFF'
                    },
                    userRole !== role && { borderColor: theme?.colors?.border || '#E5E5E7' }
                  ]}
                  onPress={() => handleRoleChange(item.id, role)}
                  disabled={userRole === role || isRoleLoading}
                >
                  {isRoleLoading ? (
                    <ActivityIndicator 
                      size="small" 
                      color={userRole === role ? 'white' : (theme?.colors?.primary?.[500] || '#007AFF')} 
                    />
                  ) : (
                    <Text 
                      style={[
                        styles.roleButtonText, 
                        { 
                          color: userRole === role ? 'white' : (theme?.colors?.text?.primary || '#000'),
                          opacity: userRole === role ? 1 : 0.7
                        }
                      ]}
                    >
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[
                styles.actionButton, 
                { 
                  borderColor: theme?.colors?.error?.[500] || '#FF3B30',
                  opacity: isDeactivateLoading ? 0.6 : 1
                }
              ]}
              onPress={() => handleDeactivateUser(item.id)}
              disabled={isDeactivateLoading}
            >
              {isDeactivateLoading ? (
                <ActivityIndicator size={16} color={theme?.colors?.error?.[500] || '#FF3B30'} />
              ) : (
                <UserX size={16} color={theme?.colors?.error?.[500] || '#FF3B30'} />
              )}
              <Text style={[styles.actionButtonText, { color: theme?.colors?.error?.[500] || '#FF3B30' }]}>
                {isDeactivateLoading ? 'Deactivating...' : 'Deactivate'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
            Manage Users
          </Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[500]} />
          <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
            Loading users...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
          Manage Users
        </Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? (
            <ActivityIndicator size={20} color={theme.colors.primary[500]} />
          ) : (
            <RefreshCw size={20} color={theme.colors.primary[500]} />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={[styles.searchInput, { backgroundColor: theme.colors.background.card }]}>
          <Search size={18} color={theme.colors.text.secondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.input, { color: theme.colors.text.primary }]}
            placeholder="Search users..."
            placeholderTextColor={theme.colors.text.tertiary}
            value={searchQuery}
            onChangeText={(text) => {
              // Sanitize input
              const sanitizedText = text.replace(/[<>]/g, '');
              setSearchQuery(sanitizedText);
            }}
            maxLength={100} // Prevent excessively long searches
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Text style={{ color: theme.colors.text.secondary }}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        
        <View style={styles.filterContainer}>
          <Text style={[styles.filterLabel, { color: theme.colors.text.secondary }]}>
            Filter by role:
          </Text>
          <View style={styles.filterButtons}>
            {[null, 'user', 'trainer', 'nutritionist', 'admin'].map(role => (
              <TouchableOpacity
                key={role || 'all'}
                style={[
                  styles.filterButton,
                  selectedRole === role && { 
                    backgroundColor: theme.colors.primary[500],
                    borderColor: theme.colors.primary[500]
                  },
                  !selectedRole && role === null && { 
                    backgroundColor: theme.colors.primary[500],
                    borderColor: theme.colors.primary[500]
                  },
                  selectedRole !== role && { borderColor: theme.colors.border }
                ]}
                onPress={() => setSelectedRole(role)}
              >
                <Text 
                  style={[
                    styles.filterButtonText, 
                    { 
                      color: selectedRole === role || (!selectedRole && role === null) 
                        ? 'white' 
                        : theme.colors.text.primary,
                      opacity: selectedRole === role || (!selectedRole && role === null) ? 1 : 0.7
                    }
                  ]}
                >
                  {role ? role.charAt(0).toUpperCase() + role.slice(1) : 'All'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <AlertTriangle size={48} color={theme.colors.error[500]} />
          <Text style={[styles.errorTitle, { color: theme.colors.error[500] }]}>
            {error.message}
          </Text>
          {error.details && (
            <Text style={[styles.errorDetails, { color: theme.colors.text.secondary }]}>
              {error.details}
            </Text>
          )}
          <View style={styles.errorActions}>
            <TouchableOpacity 
              style={[styles.retryButton, { backgroundColor: theme.colors.primary[500] }]}
              onPress={() => fetchUsers()}
              disabled={refreshing}
            >
              {refreshing ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <RefreshCw size={16} color="white" />
              )}
              <Text style={styles.retryButtonText}>
                {refreshing ? 'Retrying...' : 'Retry'}
              </Text>
            </TouchableOpacity>
            
            {error.type === ErrorType.UNAUTHORIZED && (
              <TouchableOpacity 
                style={[styles.secondaryButton, { borderColor: theme.colors.primary[500] }]}
                onPress={() => router.back()}
              >
                <Text style={[styles.secondaryButtonText, { color: theme.colors.primary[500] }]}>
                  Go Back
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ) : filteredUsers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <UserCog size={48} color={theme.colors.text.secondary} />
          <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>
            No users found
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.colors.text.tertiary }]}>
            {searchQuery || selectedRole 
              ? 'Try adjusting your search or filter'
              : 'No users in the system yet'}
          </Text>
          {(searchQuery || selectedRole) && (
            <TouchableOpacity 
              style={[styles.clearFiltersButton, { backgroundColor: theme.colors.primary[500] }]}
              onPress={() => {
                setSearchQuery('');
                setSelectedRole(null);
              }}
            >
              <Text style={styles.clearFiltersText}>Clear Filters</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item?.id || Math.random().toString()}
          renderItem={renderUserItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          ListHeaderComponent={
            <Text style={[styles.resultCount, { color: theme.colors.text.secondary }]}>
              {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'} found
            </Text>
          }
          ListFooterComponent={<View style={{ height: 24 }} />}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  addButton: {
    padding: 8,
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  filterContainer: {
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    margin: 4,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 16,
  },
  resultCount: {
    fontSize: 14,
    marginBottom: 12,
  },
  userCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userInfo: {
    marginBottom: 16,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  roleBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 4,
  },
  userId: {
    fontSize: 12,
    opacity: 0.7,
  },
  userActions: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    paddingTop: 12,
  },
  roleSelector: {
    marginBottom: 12,
  },
  roleLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  roleButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  roleButton: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    margin: 4,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginLeft: 8,
    minHeight: 32,
  },
  actionButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorDetails: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
    maxWidth: 300,
  },
  errorActions: {
    flexDirection: 'row',
    gap: 12,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 280,
    marginBottom: 16,
  },
  clearFiltersButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  clearFiltersText: {
    color: 'white',
    fontWeight: '600',
  },
});