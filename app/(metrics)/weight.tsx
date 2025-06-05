import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react-native';

// Sample weight data
const weightEntries = [
  { week: 'Jun 2 - Jun 8', entries: [{ date: 'Jun 3', time: '3:28 PM', weight: 58 }], expanded: true },
  { week: 'May 26 - Jun 1', entries: [{ date: 'May 31', time: '2:15 PM', weight: 52 }], expanded: false },
];

export default function WeightScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('1M'); // 1W, 1M, 2M, 1Y
  const [weeklyData, setWeeklyData] = useState(weightEntries);
  
  const handleAddWeight = () => {
    router.push('/add');
  };
  
  const toggleWeekExpand = (index: number) => {
    const newData = [...weeklyData];
    newData[index].expanded = !newData[index].expanded;
    setWeeklyData(newData);
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Weight',
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
      
      <ScrollView style={styles.scrollView}>
        {/* Time period tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === '1W' && styles.activeTab]}
            onPress={() => setActiveTab('1W')}
          >
            <Text style={[styles.tabText, activeTab === '1W' && styles.activeTabText]}>1W</Text>
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
            <Text style={[styles.tabText, activeTab === '2M' && styles.activeTabText]}>2M</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === '1Y' && styles.activeTab]}
            onPress={() => setActiveTab('1Y')}
          >
            <Text style={[styles.tabText, activeTab === '1Y' && styles.activeTabText]}>1Y</Text>
          </TouchableOpacity>
        </View>
        
        {/* Current weight */}
        <View style={styles.currentWeightContainer}>
          <Text style={[styles.currentLabel, { color: theme.colors.text.secondary }]}>CURRENT</Text>
          <Text style={[styles.currentWeight, { color: theme.colors.text.primary, fontFamily: theme.fontFamily.semiBold }]}>
            58 <Text style={styles.unit}>kg</Text>
          </Text>
          
          {/* Date range */}
          <View style={styles.dateRangeContainer}>
            <TouchableOpacity>
              <ChevronLeft size={20} color={theme.colors.text.secondary} />
            </TouchableOpacity>
            <Text style={[styles.dateRange, { color: theme.colors.text.secondary }]}>May 4 - Jun 3</Text>
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
            <View style={[styles.tooltipContainer, { right: 20, bottom: 80 }]}>
              <Text style={styles.tooltipDate}>May 31</Text>
              <Text style={styles.tooltipWeight}>52 kg</Text>
            </View>
          </View>
          
          {/* X-axis labels */}
          <View style={styles.xAxisContainer}>
            <Text style={styles.xAxisLabel}>5/4</Text>
            <Text style={styles.xAxisLabel}>5/10</Text>
            <Text style={styles.xAxisLabel}>5/16</Text>
            <Text style={styles.xAxisLabel}>5/22</Text>
            <Text style={styles.xAxisLabel}>5/28</Text>
            <Text style={styles.xAxisLabel}>6/3</Text>
          </View>
        </View>
        
        {/* Weight entries section */}
        <View style={styles.entriesContainer}>
          <View style={styles.entriesHeader}>
            <Text style={[styles.entriesTitle, { color: theme.colors.text.primary }]}>Weight</Text>
            <TouchableOpacity style={styles.addButton} onPress={handleAddWeight}>
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
                  <Text style={[styles.weekWeight, { color: theme.colors.text.primary }]}>{week.entries[0].weight} kg</Text>
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
                    {entry.date} {entry.time}
                  </Text>
                  <Text style={[styles.entryWeight, { color: theme.colors.text.primary }]}>
                    {entry.weight} kg
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
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
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    fontWeight: '600',
    color: '#333',
  },
  currentWeightContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  currentLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  currentWeight: {
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
  tooltipWeight: {
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
  addButton: {
    marginLeft: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
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
  weekWeight: {
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
  entryWeight: {
    fontSize: 14,
    fontWeight: '500',
  },
});
