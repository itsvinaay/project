import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Link } from 'expo-router';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react-native';
import { useMetrics } from '@/hooks/useMetrics';
import MetricChart from '@/components/MetricChart';
import MetricHistoryList from '@/components/MetricHistoryList';

type TimeFrame = '1W' | '1M' | '2M' | '1Y';

type DateRange = {
  start: Date;
  end: Date;
  label: string;
};

export default function MetricDetailScreen() {
  const router = useRouter();
  const { metric } = useLocalSearchParams<{ metric: string }>();
  const { getMetricDetails } = useMetrics();
  
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrame>('1M');
  const [currentDateRange, setCurrentDateRange] = useState<DateRange>({
    start: new Date(2024, 4, 4), // May 4
    end: new Date(2024, 5, 3),   // Jun 3
    label: 'May 4 - Jun 3'
  });
  
  const metricDetails = getMetricDetails(metric);
  const displayName = metricDetails?.name || metric?.replace('-', ' ') || 'Metric';
  const unit = metricDetails?.unit || 'kg';
  
  const timeFrames: TimeFrame[] = ['1W', '1M', '2M', '1Y'];
  
  // Generate sample data based on time frame and date range
  const generateChartData = () => {
    const dataPoints = [];
    const daysDiff = Math.ceil((currentDateRange.end.getTime() - currentDateRange.start.getTime()) / (1000 * 60 * 60 * 24));
    const pointCount = Math.min(daysDiff, selectedTimeFrame === '1W' ? 7 : selectedTimeFrame === '1M' ? 30 : selectedTimeFrame === '2M' ? 60 : 365);
    
    // Base values for different metrics
    const baseValues: Record<string, number> = {
      weight: 58,
      chest: 36,
      shoulders: 40,
      waist: 32,
      thigh: 22,
      hip: 36,
      'body-fat': 15,
      bicep: 13,
      'water-intake': 64,
      steps: 8456
    };
    
    const baseValue = baseValues[metric || 'weight'] || 58;
    const variance = baseValue * 0.1; // 10% variance
    
    for (let i = 0; i < Math.min(pointCount, 8); i++) {
      const date = new Date(currentDateRange.start);
      date.setDate(date.getDate() + Math.floor((i / (Math.min(pointCount, 8) - 1)) * daysDiff));
      
      const randomVariation = (Math.random() - 0.5) * variance;
      const value = Math.round((baseValue + randomVariation) * 10) / 10;
      
      dataPoints.push({
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        value: value
      });
    }
    
    return dataPoints;
  };
  
  const chartData = generateChartData();
  const currentValue = chartData[chartData.length - 1]?.value || metricDetails?.current || 58;
  
  const navigateDateRange = (direction: 'prev' | 'next') => {
    const daysDiff = Math.ceil((currentDateRange.end.getTime() - currentDateRange.start.getTime()) / (1000 * 60 * 60 * 24));
    
    const newStart = new Date(currentDateRange.start);
    const newEnd = new Date(currentDateRange.end);
    
    if (direction === 'prev') {
      newStart.setDate(newStart.getDate() - daysDiff);
      newEnd.setDate(newEnd.getDate() - daysDiff);
    } else {
      newStart.setDate(newStart.getDate() + daysDiff);
      newEnd.setDate(newEnd.getDate() + daysDiff);
    }
    
    const formatDate = (date: Date) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[date.getMonth()]} ${date.getDate()}`;
    };
    
    setCurrentDateRange({
      start: newStart,
      end: newEnd,
      label: `${formatDate(newStart)} - ${formatDate(newEnd)}`
    });
  };
  
  const handleTimeFrameChange = (timeFrame: TimeFrame) => {
    setSelectedTimeFrame(timeFrame);
    
    // Adjust date range based on time frame
    const now = new Date();
    const start = new Date(now);
    
    switch (timeFrame) {
      case '1W':
        start.setDate(now.getDate() - 7);
        break;
      case '1M':
        start.setMonth(now.getMonth() - 1);
        break;
      case '2M':
        start.setMonth(now.getMonth() - 2);
        break;
      case '1Y':
        start.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    const formatDate = (date: Date) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[date.getMonth()]} ${date.getDate()}`;
    };
    
    setCurrentDateRange({
      start,
      end: now,
      label: `${formatDate(start)} - ${formatDate(now)}`
    });
  };
  
  // Generate history data
  const generateHistoryData = () => {
    const weeks = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 4; i++) {
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() - (i * 7) - 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      const formatDate = (date: Date) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[date.getMonth()]} ${date.getDate()}`;
      };
      
      const baseValue = currentValue + (Math.random() - 0.5) * 6;
      const value = Math.round(baseValue * 10) / 10;
      
      weeks.push({
        label: `${formatDate(weekStart)} - ${formatDate(weekEnd)}`,
        value: `${value} ${unit}`,
        expanded: i === 0,
        entries: [
          {
            date: formatDate(weekEnd),
            time: `${Math.floor(Math.random() * 12) + 1}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')} ${Math.random() > 0.5 ? 'AM' : 'PM'}`,
            value: `${value} ${unit}`
          }
        ]
      });
    }
    
    return weeks;
  };
  
  const historyData = generateHistoryData();
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.title}>{displayName}</Text>
        <Link href={{ pathname: "/you/metrics/log", params: { metric } }} asChild>
          <TouchableOpacity style={styles.addButton}>
            <Plus size={24} color="#5B6EE8" />
          </TouchableOpacity>
        </Link>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.timeFrameContainer}>
          {timeFrames.map((frame) => (
            <TouchableOpacity 
              key={frame} 
              style={[
                styles.timeFrameButton, 
                selectedTimeFrame === frame && styles.timeFrameButtonActive
              ]}
              onPress={() => handleTimeFrameChange(frame)}
            >
              <Text 
                style={[
                  styles.timeFrameText, 
                  selectedTimeFrame === frame && styles.timeFrameTextActive
                ]}
              >
                {frame}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.currentContainer}>
          <Text style={styles.currentLabel}>CURRENT</Text>
          <View style={styles.currentValueContainer}>
            <Text style={styles.currentValue}>
              {currentValue}
            </Text>
            <Text style={styles.currentUnit}>
              {unit}
            </Text>
          </View>
          
          <View style={styles.dateRangeContainer}>
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => navigateDateRange('prev')}
            >
              <ChevronLeft size={20} color="#64748B" />
            </TouchableOpacity>
            <Text style={styles.dateRange}>{currentDateRange.label}</Text>
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => navigateDateRange('next')}
            >
              <ChevronRight size={20} color="#64748B" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.chartWrapper}>
            <MetricChart 
              data={chartData}
              height={200}
              showDataPoints={true}
            />
          </View>
        </View>
        
        <View style={styles.historyContainer}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>{displayName}</Text>
            <TouchableOpacity style={styles.sortButton}>
              <Text style={styles.sortButtonText}>By Week</Text>
              <ChevronRight size={16} color="#64748B" />
            </TouchableOpacity>
          </View>
          
          <MetricHistoryList data={historyData} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  timeFrameContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  timeFrameButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timeFrameButtonActive: {
    backgroundColor: '#5B6EE8',
    borderColor: '#5B6EE8',
    shadowColor: '#5B6EE8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  timeFrameText: {
    color: '#64748B',
    fontWeight: '500',
    fontSize: 14,
  },
  timeFrameTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  currentContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  currentLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    textAlign: 'center',
    letterSpacing: 1,
  },
  currentValueContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  currentValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#1E293B',
  },
  currentUnit: {
    fontSize: 24,
    fontWeight: '600',
    color: '#64748B',
    marginLeft: 4,
    marginBottom: 8,
  },
  dateRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  navButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dateRange: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
    marginHorizontal: 20,
    minWidth: 120,
    textAlign: 'center',
  },
  chartWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  historyContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
  },
  sortButtonText: {
    fontSize: 14,
    color: '#64748B',
    marginRight: 4,
    fontWeight: '500',
  },
});