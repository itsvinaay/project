import React from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import { ActivityLog } from '@/utils/supabase';
import { useTheme } from '@/context/ThemeContext';
import { Clock, Droplet, Utensils, Dumbbell, Footprints, Heart } from 'lucide-react-native';

interface ActivityHistoryProps {
  activities: ActivityLog[];
}

const ActivityHistory: React.FC<ActivityHistoryProps> = ({ activities = [] }) => {
  const theme = useTheme();

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'sleep':
        return <Clock size={20} color={theme.colors.primary[500]} />;
      case 'water':
        return <Droplet size={20} color={theme.colors.primary[500]} />;
      case 'food':
        return <Utensils size={20} color={theme.colors.primary[500]} />;
      case 'workout':
        return <Dumbbell size={20} color={theme.colors.primary[500]} />;
      case 'steps':
        return <Footprints size={20} color={theme.colors.primary[500]} />;
      case 'heartRate':
        return <Heart size={20} color={theme.colors.primary[500]} />;
      default:
        return <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary[100] }]} />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActivityTitle = (activity: ActivityLog) => {
    switch (activity.type) {
      case 'sleep':
        return `${activity.value} hours of sleep`;
      case 'water':
        return `Drank ${activity.value} ${activity.unit} of water`;
      case 'food':
        return `Ate ${activity.notes || 'food'}`;
      case 'workout':
        return `Workout: ${activity.notes || 'Activity'}`;
      case 'steps':
        return `${activity.value} steps`;
      case 'heartRate':
        return `Heart rate: ${activity.value} bpm`;
      default:
        return 'Activity logged';
    }
  };

  if (activities.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>
          No activities logged yet
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={activities}
      keyExtractor={(item) => item.id || item.date}
      renderItem={({ item }) => (
        <View style={[styles.activityItem, { backgroundColor: theme.colors.background.card }]}>
          <View style={styles.activityIcon}>
            {getActivityIcon(item.type)}
          </View>
          <View style={styles.activityContent}>
            <Text style={[styles.activityTitle, { color: theme.colors.text.primary }]}>
              {getActivityTitle(item)}
            </Text>
            <Text style={[styles.activityDate, { color: theme.colors.text.secondary }]}>
              {formatDate(item.date)}
            </Text>
            {item.notes && item.type !== 'food' && (
              <Text style={[styles.activityNotes, { color: theme.colors.text.secondary }]}>
                {item.notes}
              </Text>
            )}
          </View>
          <Text style={[styles.activityValue, { color: theme.colors.primary[500] }]}>
            {item.value} {item.unit}
          </Text>
        </View>
      )}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  activityIcon: {
    marginRight: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
    marginRight: 8,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  activityDate: {
    fontSize: 12,
    opacity: 0.8,
  },
  activityNotes: {
    fontSize: 14,
    marginTop: 4,
    opacity: 0.8,
  },
  activityValue: {
    fontWeight: '600',
    fontSize: 16,
  },
});

export default ActivityHistory;
