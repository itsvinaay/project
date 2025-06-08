import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, MoveHorizontal as MoreHorizontal, Sun, Moon } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay,
  Easing,
  interpolate
} from 'react-native-reanimated';
import Svg, { Circle, Path, Text as SvgText, Line } from 'react-native-svg';
import { Pedometer } from 'expo-sensors';

type TimeFrame = 'Day' | 'Week' | 'Month';

type StepData = {
  date: string;
  steps: number;
  goal: number;
  calories?: number;
  distance?: number;
};

type HourlyData = {
  hour: number;
  steps: number;
  label: string;
};

export default function StepsScreen() {
  const router = useRouter();
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrame>('Day');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isPedometerAvailable, setIsPedometerAvailable] = useState(false);
  const [realStepCount, setRealStepCount] = useState(0);
  
  // Animation values
  const progressAnimation = useSharedValue(0);
  const chartAnimation = useSharedValue(0);
  const fadeIn = useSharedValue(0);
  
  // Sample data
  const generateStepData = (): StepData => {
    const baseSteps = isPedometerAvailable ? realStepCount : 
                     selectedTimeFrame === 'Day' ? 8456 : 
                     selectedTimeFrame === 'Week' ? 52340 : 
                     225680;
    const goal = selectedTimeFrame === 'Day' ? 10000 : 
                 selectedTimeFrame === 'Week' ? 70000 : 
                 300000;
    
    return {
      date: currentDate.toISOString().split('T')[0],
      steps: baseSteps + Math.floor(Math.random() * 2000),
      goal,
      calories: Math.floor(baseSteps * 0.04),
      distance: Math.round((baseSteps * 0.0008) * 10) / 10
    };
  };
  
  const generateHourlyData = (): HourlyData[] => {
    const hours = [];
    const currentHour = new Date().getHours();
    
    for (let i = 0; i <= 23; i += 6) {
      const steps = i <= currentHour ? Math.floor(Math.random() * 2000) + 500 : 0;
      const label = i === 0 ? '12 AM' : 
                   i === 6 ? '6 AM' : 
                   i === 12 ? '12 PM' : 
                   i === 18 ? '6 PM' : 
                   `${i} ${i < 12 ? 'AM' : 'PM'}`;
      
      hours.push({
        hour: i,
        steps,
        label
      });
    }
    
    return hours;
  };
  
  const stepData = generateStepData();
  const hourlyData = generateHourlyData();
  const progressPercentage = Math.min((stepData.steps / stepData.goal) * 100, 100);
  
  useEffect(() => {
    // Start animations
    fadeIn.value = withTiming(1, { duration: 500 });
    progressAnimation.value = withDelay(300, withTiming(progressPercentage / 100, {
      duration: 1500,
      easing: Easing.out(Easing.cubic)
    }));
    chartAnimation.value = withDelay(600, withTiming(1, {
      duration: 1000,
      easing: Easing.out(Easing.ease)
    }));
  }, [selectedTimeFrame, stepData.steps]);
  
  useEffect(() => {
    let subscription: { remove: () => void } | null = null;

    const subscribe = async () => {
      try {
        const isAvailable = await Pedometer.isAvailableAsync();
        setIsPedometerAvailable(isAvailable);

        if (isAvailable) {
          const end = new Date();
          const start = new Date();
          start.setHours(0, 0, 0, 0);

          const { steps } = await Pedometer.getStepCountAsync(start, end);
          setRealStepCount(steps);

          subscription = Pedometer.watchStepCount((result: { steps: number }) => {
            setRealStepCount(result.steps);
          });
        }
      } catch (error) {
        console.log('Pedometer error: ', error);
      }
    };

    subscribe();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  const CircularProgress = ({ size = 200, strokeWidth = 12 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    
    const animatedStyle = useAnimatedStyle(() => {
      const strokeDashoffset = circumference * (1 - progressAnimation.value);
      return {
        transform: [{ translateX: 0 }], // Required default transform
        strokeDashoffset: withTiming(strokeDashoffset, {
          duration: 1500,
          easing: Easing.out(Easing.cubic)
        })
      };
    });
    
    return (
      <View style={styles.progressContainer}>
        <Svg width={size} height={size} style={styles.progressSvg}>
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#F1F5F9"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <Animated.View style={animatedStyle}>
            <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#5B6EE8"
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={circumference}
                strokeLinecap="round"
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
              />
            </Svg>
          </Animated.View>
        </Svg>
        
        {/* Center content */}
        <View style={styles.progressCenter}>
          <Text style={styles.todayLabel}>TODAY</Text>
          <Text style={styles.stepsCount}>{stepData.steps.toLocaleString()}</Text>
          <Text style={styles.goalText}>of {stepData.goal.toLocaleString()} steps</Text>
        </View>
      </View>
    );
  };
  
  const HourlyChart = () => {
    const screenWidth = Dimensions.get('window').width;
    const chartWidth = screenWidth - 32;
    const chartHeight = 120;
    const padding = { top: 20, right: 16, bottom: 30, left: 16 };
    const contentWidth = chartWidth - padding.left - padding.right;
    const contentHeight = chartHeight - padding.top - padding.bottom;
    
    const maxSteps = Math.max(...hourlyData.map(d => d.steps), 100);
    
    const animatedChartStyle = useAnimatedStyle(() => ({
      opacity: chartAnimation.value,
      transform: [{ 
        translateY: interpolate(chartAnimation.value, [0, 1], [20, 0]) 
      }]
    }));
    
    return (
      <Animated.View style={[styles.chartContainer, animatedChartStyle]}>
        <Text style={styles.chartTitle}>Today's steps</Text>
        
        <Svg width={chartWidth} height={chartHeight}>
          {/* Y-axis labels */}
          <SvgText
            x={padding.left - 8}
            y={padding.top + 5}
            fontSize="12"
            fill="#94A3B8"
            textAnchor="end"
          >
            {Math.round(maxSteps)}
          </SvgText>
          <SvgText
            x={padding.left - 8}
            y={padding.top + contentHeight / 2 + 5}
            fontSize="12"
            fill="#94A3B8"
            textAnchor="end"
          >
            {Math.round(maxSteps / 2)}
          </SvgText>
          
          {/* Grid lines */}
          <Line
            x1={padding.left}
            y1={padding.top + contentHeight / 2}
            x2={padding.left + contentWidth}
            y2={padding.top + contentHeight / 2}
            stroke="#F1F5F9"
            strokeWidth={1}
          />
          
          {/* Bars */}
          {hourlyData.map((data, index) => {
            const barWidth = contentWidth / hourlyData.length * 0.6;
            const barHeight = (data.steps / maxSteps) * contentHeight;
            const x = padding.left + (index / (hourlyData.length - 1)) * contentWidth - barWidth / 2;
            const y = padding.top + contentHeight - barHeight;
            
            return (
              <Animated.View key={index}>
                <Svg>
                  <Path
                    d={`M ${x} ${y + barHeight} L ${x} ${y} L ${x + barWidth} ${y} L ${x + barWidth} ${y + barHeight} Z`}
                    fill={data.hour <= new Date().getHours() ? "#5B6EE8" : "#E2E8F0"}
                  />
                </Svg>
              </Animated.View>
            );
          })}
          
          {/* X-axis labels */}
          {hourlyData.map((data, index) => (
            <SvgText
              key={index}
              x={padding.left + (index / (hourlyData.length - 1)) * contentWidth}
              y={chartHeight - 8}
              fontSize="12"
              fill="#94A3B8"
              textAnchor="middle"
            >
              {data.label}
            </SvgText>
          ))}
          
          {/* Time indicators */}
          <Sun 
            size={16} 
            color="#FCD34D" 
            style={{ 
              position: 'absolute', 
              left: padding.left + (1 / (hourlyData.length - 1)) * contentWidth - 8,
              top: chartHeight - 25 
            }} 
          />
          <Moon 
            size={16} 
            color="#64748B" 
            style={{ 
              position: 'absolute', 
              left: padding.left + (3 / (hourlyData.length - 1)) * contentWidth - 8,
              top: chartHeight - 25 
            }} 
          />
        </Svg>
      </Animated.View>
    );
  };
  
  const animatedContainerStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
    transform: [{ 
      translateY: interpolate(fadeIn.value, [0, 1], [30, 0]) 
    }]
  }));
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.title}>Steps</Text>
        <TouchableOpacity style={styles.moreButton}>
          <MoreHorizontal size={24} color="#1E293B" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={animatedContainerStyle}>
          {/* Time Frame Selector */}
          <View style={styles.timeFrameContainer}>
            {(['Day', 'Week', 'Month'] as TimeFrame[]).map((frame) => (
              <TouchableOpacity
                key={frame}
                style={[
                  styles.timeFrameButton,
                  selectedTimeFrame === frame && styles.timeFrameButtonActive
                ]}
                onPress={() => setSelectedTimeFrame(frame)}
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
          
          {/* Circular Progress */}
          <View style={styles.progressSection}>
            <CircularProgress />
          </View>
          
          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stepData.calories}</Text>
              <Text style={styles.statLabel}>Calories</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stepData.distance} km</Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{Math.round(progressPercentage)}%</Text>
              <Text style={styles.statLabel}>Goal</Text>
            </View>
          </View>
          
          {/* Hourly Chart (only show for Day view) */}
          {selectedTimeFrame === 'Day' && <HourlyChart />}
          
          {/* Weekly/Monthly Summary */}
          {selectedTimeFrame !== 'Day' && (
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>
                {selectedTimeFrame === 'Week' ? 'This Week' : 'This Month'}
              </Text>
              <View style={styles.summaryStats}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>
                    {selectedTimeFrame === 'Week' ? '7,477' : '8,456'}
                  </Text>
                  <Text style={styles.summaryLabel}>Avg Daily</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>
                    {selectedTimeFrame === 'Week' ? '5/7' : '23/30'}
                  </Text>
                  <Text style={styles.summaryLabel}>Goals Met</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>
                    {selectedTimeFrame === 'Week' ? '12,450' : '15,230'}
                  </Text>
                  <Text style={styles.summaryLabel}>Best Day</Text>
                </View>
              </View>
            </View>
          )}
        </Animated.View>
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
    backgroundColor: '#FFFFFF',
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
  },
  moreButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  timeFrameContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  timeFrameButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
  },
  timeFrameButtonActive: {
    backgroundColor: '#64748B',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  timeFrameText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748B',
  },
  timeFrameTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  progressSection: {
    paddingVertical: 40,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  progressContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressSvg: {
    transform: [{ rotate: '-90deg' }],
  },
  progressCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
    letterSpacing: 1,
    marginBottom: 8,
  },
  stepsCount: {
    fontSize: 48,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  goalText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#F8FAFC',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  summaryContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#5B6EE8',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
});