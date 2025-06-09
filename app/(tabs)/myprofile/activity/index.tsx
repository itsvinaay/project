import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Clock, ChevronLeft, ArrowUp } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface ActivityEntry {
  id: string;
  type: string;
  duration: string;
  timeRange: string;
  date: string;
  icon: string;
}

interface WeekDay {
  day: string;
  date: number;
  isSelected: boolean;
  isToday: boolean;
}

export default function HistoryScreen() {
  const [selectedWeek, setSelectedWeek] = useState(0);
  
  const weekDays: WeekDay[] = [
    { day: 'M', date: 2, isSelected: false, isToday: false },
    { day: 'T', date: 3, isSelected: true, isToday: true },
    { day: 'W', date: 4, isSelected: false, isToday: false },
    { day: 'T', date: 5, isSelected: false, isToday: false },
    { day: 'F', date: 6, isSelected: false, isToday: false },
    { day: 'S', date: 7, isSelected: false, isToday: false },
    { day: 'S', date: 8, isSelected: false, isToday: false },
  ];

  const activities: { [key: string]: ActivityEntry[] } = {
    'JUN 3': [
      {
        id: '1',
        type: 'Walk',
        duration: '1 hr',
        timeRange: '12:10 PM - 1:10 PM',
        date: 'JUN 3',
        icon: '🚶'
      },
      {
        id: '2',
        type: 'Run',
        duration: '1 hr',
        timeRange: '12:10 PM - 1:10 PM',
        date: 'JUN 3',
        icon: '🏃'
      },
      {
        id: '3',
        type: 'Free Diving',
        duration: '1 hr',
        timeRange: '12:10 PM - 1:10 PM',
        date: 'JUN 3',
        icon: '🤿'
      }
    ],
    'JUN 2': [],
    'JUN 1': [],
    'MAY 31': [],
    'MAY 30': []
  };

  const dateGroups = ['JUN 3', 'JUN 2', 'JUN 1', 'MAY 31', 'MAY 30'];

  const scrollToTop = () => {
    // In a real implementation, you'd use a ScrollView ref
    console.log('Scroll to top');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <ChevronLeft size={24} color="#111827" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.title}>History</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.weekSelector}>
        <View style={styles.weekContainer}>
          {weekDays.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayContainer,
                day.isSelected && styles.selectedDay
              ]}
            >
              <Text style={[
                styles.dayLabel,
                day.isSelected && styles.selectedDayLabel
              ]}>
                {day.day}
              </Text>
              <Text style={[
                styles.dateLabel,
                day.isSelected && styles.selectedDateLabel
              ]}>
                {day.date.toString().padStart(2, '0')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {dateGroups.map((dateGroup, groupIndex) => (
          <View key={dateGroup} style={styles.dateGroup}>
            <View style={styles.dateHeader}>
              <View style={styles.dateDot} />
              <Text style={styles.dateTitle}>{dateGroup}</Text>
            </View>
            
            {activities[dateGroup].length > 0 ? (
              <View style={styles.activitiesContainer}>
                {activities[dateGroup].map((activity, index) => (
                  <View key={activity.id} style={styles.activityItem}>
                    <View style={styles.activityContent}>
                      <View style={styles.activityHeader}>
                        <Text style={styles.activityType}>{activity.type}</Text>
                        <Text style={styles.activityIcon}>{activity.icon}</Text>
                      </View>
                      <View style={styles.activityDetails}>
                        <Clock size={16} color="#6B7280" strokeWidth={2} />
                        <Text style={styles.activityDuration}>{activity.duration}</Text>
                        <Text style={styles.activitySeparator}>•</Text>
                        <Text style={styles.activityTime}>{activity.timeRange}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No activities recorded</Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.scrollToTopButton} onPress={scrollToTop}>
        <ArrowUp size={24} color="#FFFFFF" strokeWidth={2} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  placeholder: {
    width: 40,
  },
  weekSelector: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  weekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayContainer: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    minWidth: 44,
  },
  selectedDay: {
    backgroundColor: '#3B82F6',
  },
  dayLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginBottom: 4,
  },
  selectedDayLabel: {
    color: '#FFFFFF',
  },
  dateLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  selectedDateLabel: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  dateGroup: {
    marginBottom: 32,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 24,
  },
  dateDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6B7280',
    marginRight: 12,
  },
  dateTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activitiesContainer: {
    marginLeft: 20,
  },
  activityItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  activityContent: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityType: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  activityIcon: {
    fontSize: 24,
  },
  activityDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityDuration: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginLeft: 8,
  },
  activitySeparator: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginHorizontal: 8,
  },
  activityTime: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  emptyState: {
    marginLeft: 20,
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  scrollToTopButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6B7280',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
});