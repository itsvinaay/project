import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react-native';
import { getMetricEntries, MetricEntry } from '@/services/metricDataService';
import { metricConfig } from '@/constants/metrics';

// Helper function to validate date string
const isValidDate = (dateString: string): boolean => {
  // Check if the date string is in a valid format
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

// Helper function to format date safely
const formatDate = (dateString: string, format: Intl.DateTimeFormatOptions): string => {
  if (!isValidDate(dateString)) {
    return dateString; // Return the original string if it's not a valid date
  }
  return new Date(dateString).toLocaleDateString('en-US', format);
};

// Helper function to get formatted date for display
const getFormattedDate = (entry: MetricEntry): string => {
  if (!isValidDate(entry.date)) {
    return entry.date;
  }
  const date = new Date(entry.date);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Helper function to get formatted time for display
const getFormattedTime = (entry: MetricEntry): string => {
  return entry.time || '';
};

// Helper function to group entries by week
const groupEntriesByWeek = (entries: MetricEntry[]) => {
  // Sort entries by date (newest first)
  const sortedEntries = [...entries].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB.getTime() - dateA.getTime();
  });
  
  const weeks: { week: string, entries: MetricEntry[], expanded: boolean }[] = [];
  let currentWeek = '';
  let currentEntries: MetricEntry[] = [];
  
  sortedEntries.forEach(entry => {
    if (!isValidDate(entry.date)) {
      return; // Skip invalid dates
    }
    
    const entryDate = new Date(entry.date);
    const weekStart = new Date(entryDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Set to Sunday
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6); // Set to Saturday
    
    const weekLabel = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    
    if (weekLabel !== currentWeek) {
      // Add the previous week to the list
      if (currentEntries.length > 0) {
        weeks.push({
          week: currentWeek,
          entries: currentEntries,
          expanded: weeks.length === 0 // Expand first week by default
        });
      }
      
      // Start a new week
      currentWeek = weekLabel;
      currentEntries = [entry];
    } else {
      // Add to the current week
      currentEntries.push(entry);
    }
  });
  
  // Add the last week
  if (currentEntries.length > 0) {
    weeks.push({
      week: currentWeek,
      entries: currentEntries,
      expanded: weeks.length === 0 // Expand first week by default
    });
  }
  
  return weeks;
};

export default function MetricDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const metricId = typeof params.id === 'string' ? params.id : '';
  
  const [entries, setEntries] = useState<MetricEntry[]>([]);
  const [activeTab, setActiveTab] = useState('1M'); // 1W, 1M, 2M, 1Y
  const [weeklyData, setWeeklyData] = useState<{week: string, entries: MetricEntry[], expanded: boolean}[]>([]);
  const config = metricConfig[metricId as keyof typeof metricConfig];
  
  // Load metric data whenever the component renders or metricId changes
  useEffect(() => {
    console.log('Loading metric data for:', metricId);
    // Load metric entries
    const metricEntries = getMetricEntries(metricId);
    console.log('Found entries:', metricEntries.length);
    setEntries(metricEntries);
    
    // Group entries by week
    if (metricEntries.length > 0) {
      const groupedData = groupEntriesByWeek(metricEntries);
      console.log('Grouped data:', groupedData.length, 'weeks');
      setWeeklyData(groupedData);
    } else {
      console.log('No entries found, setting empty weekly data');
      setWeeklyData([]);
    }
  }, [metricId]);
  
  // Force refresh when screen comes into focus
  useEffect(() => {
    const refreshData = () => {
      console.log('Screen focused, refreshing data for:', metricId);
      const metricEntries = getMetricEntries(metricId);
      console.log('Refreshed entries:', metricEntries.length);
      setEntries(metricEntries);
      
      if (metricEntries.length > 0) {
        const groupedData = groupEntriesByWeek(metricEntries);
        setWeeklyData(groupedData);
      } else {
        setWeeklyData([]);
      }
    };
    
    // Set up an interval to refresh data every 2 seconds
    const intervalId = setInterval(refreshData, 2000);
    
    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [metricId]);
  
  const handleAddPress = () => {
    router.push({
      pathname: '/(metrics)/add',
      params: { id: metricId }
    });
  };
  
  const toggleWeekExpand = (index: number) => {
    const newData = [...weeklyData];
    newData[index].expanded = !newData[index].expanded;
    setWeeklyData(newData);
  };
  
  // Get current value (most recent entry)
  const currentValue = entries.length > 0 ? entries[0].value : config?.defaultValue;
  const currentUnit = entries.length > 0 ? entries[0].unit : config?.units[0];
  
  // If config is not found, show an error
  if (!config) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { 
            color: theme.colors.text.primary,
            fontFamily: theme.fontFamily.semiBold
          }]}>
            Error
          </Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.content}>
          <Text style={{ color: theme.colors.text.primary }}>Metric not found</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: config.label,
          headerTitleStyle: {
            fontFamily: theme.fontFamily.semiBold,
            color: theme.colors.text.primary,
          },
          headerShadowVisible: false,
          headerStyle: { backgroundColor: theme.colors.background.primary },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ChevronLeft size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      
      {entries.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyStateText, { 
            color: theme.colors.text.secondary,
            fontFamily: theme.fontFamily.medium
          }]}>
            No {config.label.toLowerCase()} data yet
          </Text>
          <TouchableOpacity 
            style={[{
              backgroundColor: theme.colors.primary[500],
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 8,
              alignItems: 'center',
              justifyContent: 'center'
            }]}
            onPress={handleAddPress}
          >
            <Text style={[styles.addButtonText, { 
              color: theme.colors.text.primary,
              fontFamily: theme.fontFamily.semiBold
            }]}>
              Add {config.label}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          {/* Time period tabs */}
          <View style={[styles.tabContainer, { backgroundColor: theme.colors.background.secondary }]}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === '1W' && styles.activeTab]}
              onPress={() => setActiveTab('1W')}
            >
              <Text style={[styles.tabText, { color: theme.colors.text.secondary, fontFamily: theme.fontFamily.medium }, activeTab === '1W' && [styles.activeTabText, { color: theme.colors.text.primary, fontFamily: theme.fontFamily.semiBold }]]}>1W</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === '1M' && [styles.activeTab, { backgroundColor: theme.colors.primary[100] }]]}
              onPress={() => setActiveTab('1M')}
            >
              <Text style={[styles.tabText, activeTab === '1M' && [styles.activeTabText, { color: theme.colors.primary[500] }]]}>1M</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === '2M' && styles.activeTab]}
              onPress={() => setActiveTab('2M')}
            >
              <Text style={[styles.tabText, { color: theme.colors.text.secondary, fontFamily: theme.fontFamily.medium }, activeTab === '2M' && [styles.activeTabText, { color: theme.colors.text.primary, fontFamily: theme.fontFamily.semiBold }]]}>2M</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === '1Y' && styles.activeTab]}
              onPress={() => setActiveTab('1Y')}
            >
              <Text style={[styles.tabText, { color: theme.colors.text.secondary, fontFamily: theme.fontFamily.medium }, activeTab === '1Y' && [styles.activeTabText, { color: theme.colors.text.primary, fontFamily: theme.fontFamily.semiBold }]]}>1Y</Text>
            </TouchableOpacity>
          </View>
          
          {/* Current Value */}
          <View style={styles.currentValueContainer}>
            <Text style={[styles.currentLabel, { color: theme.colors.text.secondary }]}>
              CURRENT
            </Text>
            <Text style={[styles.currentValue, { color: theme.colors.text.primary, fontFamily: theme.fontFamily.semiBold }]}>
              {entries.length > 0 ? entries[0].value : '--'} 
              <Text style={styles.unit}>{entries.length > 0 ? entries[0].unit : ''}</Text>
            </Text>
            
            {/* Last updated */}
            {entries.length > 0 && (
              <Text style={[{ color: theme.colors.text.secondary, fontSize: 12, marginTop: 4 }]}>
                Last updated: {getFormattedDate(entries[0])}
              </Text>
            )}
            
            {/* Date range */}
            <View style={styles.dateRangeContainer}>
              <TouchableOpacity>
                <ChevronLeft size={20} color={theme.colors.text.secondary} />
              </TouchableOpacity>
              <Text style={[styles.dateRange, { color: theme.colors.text.secondary }]}>
                {entries.length > 0 ? 
                  `${formatDate(entries[entries.length - 1].date, { month: 'short', day: 'numeric' })} - ${formatDate(entries[0].date, { month: 'short', day: 'numeric' })}` : 
                  'No data'}
              </Text>
              <TouchableOpacity>
                <ChevronRight size={20} color={theme.colors.text.secondary} />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Chart placeholder */}
          <View style={[styles.chartContainer, { backgroundColor: theme.colors.background.secondary }]}>
            {/* This would be replaced with an actual chart component */}
            <View style={styles.chartPlaceholder}>
              {/* Chart visualization would go here */}
              <View style={styles.chartLine}></View>
              <View style={[styles.dataPoint, { right: 10, bottom: 50 }]}></View>
              <View style={[styles.tooltipContainer, { backgroundColor: theme.colors.primary[500], right: 20, bottom: 80 }]}>
                <Text style={[styles.tooltipDate, { color: theme.colors.text.primary, fontFamily: theme.fontFamily.regular }]}>{entries.length > 0 && isValidDate(entries[0].date) ? formatDate(entries[0].date, { month: 'short', day: 'numeric' }) : ''}</Text>
                <Text style={[styles.tooltipValue, { color: theme.colors.text.primary, fontFamily: theme.fontFamily.semiBold }]}>{currentValue} {currentUnit}</Text>
              </View>
            </View>
            
            {/* X-axis labels */}
            <View style={styles.xAxisContainer}>
              {entries.length > 0 && Array(6).fill(0).map((_, i) => {
                if (!entries.length || !isValidDate(entries[0].date)) {
                  return <Text key={i} style={styles.xAxisLabel}></Text>;
                }
                const date = new Date(entries[0].date);
                date.setDate(date.getDate() - (5-i) * 5);
                return (
                  <Text key={i} style={styles.xAxisLabel}>
                    {formatDate(date.toISOString(), { month: 'numeric', day: 'numeric' })}
                  </Text>
                );
              })}
            </View>
          </View>
          
          {/* Entries section */}
          <View style={styles.entriesContainer}>
            <View style={styles.entriesHeader}>
              <Text style={[styles.entriesTitle, { color: theme.colors.text.primary }]}>{config.label}</Text>
              <TouchableOpacity 
                style={[styles.addButton, { backgroundColor: theme.colors.background.secondary }]} 
                onPress={handleAddPress}>
                <Plus size={20} color={theme.colors.text.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterContainer}>
                <Text style={[styles.filterText, { color: theme.colors.text.secondary }]}>By Week</Text>
                <ChevronRight size={16} color={theme.colors.text.secondary} style={{ transform: [{ rotate: '90deg' }] }} />
              </TouchableOpacity>
            </View>
            
            {/* Weekly entries */}
            {weeklyData.map((week, index) => (
              <View key={index} style={[styles.weekContainer, { backgroundColor: theme.colors.background.card }]}>
                <TouchableOpacity 
                  style={styles.weekHeader}
                  onPress={() => toggleWeekExpand(index)}
                >
                  <Text style={[styles.weekTitle, { color: theme.colors.text.primary }]}>{week.week}</Text>
                  <View style={styles.weekRight}>
                    <Text style={[styles.weekValue, { color: theme.colors.text.primary }]}>
                      {week.entries[0].value} {week.entries[0].unit}
                    </Text>
                    <ChevronRight 
                      size={16} 
                      color={theme.colors.text.secondary} 
                      style={{ transform: [{ rotate: week.expanded ? '90deg' : '0deg' }] }} 
                    />
                  </View>
                </TouchableOpacity>
                
                {week.expanded && week.entries.map((entry, entryIndex) => (
                  <View key={entryIndex} style={styles.entryItem}>
                    <Text style={[styles.entryDate, { color: theme.colors.text.secondary }]}>
                      {getFormattedDate(entry)} {getFormattedTime(entry)}
                    </Text>
                    <Text style={[styles.entryValue, { color: theme.colors.text.primary }]}>
                      {entry.value} {entry.unit}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  addButton: {
    marginLeft: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    marginVertical: 16,
    marginHorizontal: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#e0e0e0',
  },
  tabText: {
    fontSize: 14,
  },
  activeTabText: {
    fontWeight: '600',
  },
  currentValueContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  currentLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  currentValue: {
    fontSize: 36,
    fontWeight: '700',
  },
  unit: {
    fontSize: 24,
  },
  dateRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  dateRange: {
    fontSize: 14,
    marginHorizontal: 8,
  },
  chartContainer: {
    height: 200,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    paddingBottom: 24,
  },
  chartPlaceholder: {
    flex: 1,
    position: 'relative',
  },
  chartLine: {
    position: 'absolute',
    height: 2,
    width: '100%',
    backgroundColor: '#ccc',
    borderStyle: 'dashed',
    top: '50%',
    transform: [{ rotate: '-10deg' }],
  },
  dataPoint: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#333',
  },
  tooltipContainer: {
    position: 'absolute',
    backgroundColor: '#333',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  tooltipDate: {
    color: '#fff',
    fontSize: 12,
  },
  tooltipValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  xAxisContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  xAxisLabel: {
    fontSize: 10,
    color: '#999',
  },
  entriesContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  entriesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  entriesTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  filterContainer: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterText: {
    fontSize: 14,
    marginRight: 4,
  },
  weekContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  weekTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  weekRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weekValue: {
    fontSize: 15,
    fontWeight: '500',
    marginRight: 8,
  },
  entryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  entryDate: {
    fontSize: 14,
  },
  entryValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  entryCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  entryHeader: {
    marginBottom: 8,
  },
  entryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  listContent: {
    paddingBottom: 20,
  },
});
