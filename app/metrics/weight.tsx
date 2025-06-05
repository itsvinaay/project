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
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

// Sample data
const weightData = [60, 59.5, 58.7, 57.2, 56.5, 52.5, 58.5];
const weightDates = ['5/4', '5/10', '5/16', '5/22', '5/28', '5/31', '6/3'];

// Weekly data
const weeklyData = [
  { week: 'Jun 2 - Jun 8', value: '58 kg', date: 'Jun 3 3:28 PM' },
  { week: 'May 26 - Jun 1', value: '52 kg', date: '' },
];

export default function WeightDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [timeRange, setTimeRange] = useState('1M'); // 1W, 1M, 2M, 1Y
  
  const handleAddWeight = () => {
    router.push('/metrics/add');
  };
  
  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Weight',
          headerTitleStyle: { 
            fontFamily: theme.fontFamily.semiBold,
            color: theme.colors.text.primary
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
        {/* Time range selector */}
        <View style={styles.timeRangeContainer}>
          {['1W', '1M', '2M', '1Y'].map((range) => (
            <TouchableOpacity
              key={range}
              style={[
                styles.timeRangeButton,
                timeRange === range && { backgroundColor: theme.colors.primary[500] },
                { backgroundColor: timeRange === range ? theme.colors.primary[500] : theme.colors.background.card }
              ]}
              onPress={() => handleTimeRangeChange(range)}
            >
              <Text style={[
                styles.timeRangeText,
                { 
                  color: timeRange === range ? '#FFFFFF' : theme.colors.text.secondary,
                  fontFamily: theme.fontFamily.medium
                }
              ]}>
                {range}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Current weight */}
        <View style={styles.currentWeightContainer}>
          <Text style={[styles.currentLabel, { 
            color: theme.colors.text.secondary,
            fontFamily: theme.fontFamily.regular
          }]}>
            CURRENT
          </Text>
          <Text style={[styles.currentWeight, { 
            color: theme.colors.text.primary,
            fontFamily: theme.fontFamily.semiBold
          }]}>
            58 <Text style={styles.unitText}>kg</Text>
          </Text>
          <View style={styles.dateRangeContainer}>
            <TouchableOpacity>
              <ChevronLeft size={20} color={theme.colors.text.secondary} />
            </TouchableOpacity>
            <Text style={[styles.dateRangeText, { 
              color: theme.colors.text.secondary,
              fontFamily: theme.fontFamily.regular
            }]}>
              May 4 - Jun 3
            </Text>
            <TouchableOpacity>
              <ChevronRight size={20} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Chart */}
        <View style={[styles.chartContainer, { backgroundColor: theme.colors.background.card }]}>
          <LineChart
            data={{
              labels: weightDates,
              datasets: [
                {
                  data: weightData,
                  color: () => theme.colors.primary[500],
                  strokeWidth: 2,
                },
              ],
            }}
            width={screenWidth - 32}
            height={180}
            chartConfig={{
              backgroundColor: theme.colors.background.card,
              backgroundGradientFrom: theme.colors.background.card,
              backgroundGradientTo: theme.colors.background.card,
              decimalPlaces: 1,
              color: () => theme.colors.text.secondary,
              labelColor: () => theme.colors.text.secondary,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: theme.colors.primary[500],
                fill: theme.colors.background.card,
              },
              propsForBackgroundLines: {
                strokeDasharray: '',
                stroke: '#E0E0E0',
                strokeWidth: 1,
              },
            }}
            bezier
            style={styles.chart}
            withDots={true}
            withShadow={false}
            withInnerLines={true}
            withOuterLines={false}
            withVerticalLines={false}
            withHorizontalLines={true}
            fromZero={false}
            renderDotContent={({ x, y, index }) => {
              // Only render tooltip for the lowest point (May 31)
              if (index === 5) {
                return (
                  <View 
                    key={index}
                    style={[styles.tooltipContainer, { 
                      left: x - 40,
                      top: y - 60,
                      backgroundColor: theme.colors.text.primary
                    }]}
                  >
                    <Text style={[styles.tooltipDate, { 
                      color: '#FFFFFF',
                      fontFamily: theme.fontFamily.regular
                    }]}>
                      May 31
                    </Text>
                    <Text style={[styles.tooltipValue, { 
                      color: '#FFFFFF',
                      fontFamily: theme.fontFamily.semiBold
                    }]}>
                      52 kg
                    </Text>
                  </View>
                );
              }
              return null;
            }}
          />
        </View>
        
        {/* Weight log section */}
        <View style={styles.weightLogSection}>
          <View style={styles.weightLogHeader}>
            <Text style={[styles.weightLogTitle, { 
              color: theme.colors.text.primary,
              fontFamily: theme.fontFamily.semiBold
            }]}>
              Weight
            </Text>
            <TouchableOpacity 
              style={[styles.addButton, { backgroundColor: theme.colors.primary[500] }]}
              onPress={handleAddWeight}
            >
              <Plus size={20} color="#FFFFFF" />
            </TouchableOpacity>
            
            <View style={styles.filterContainer}>
              <Text style={[styles.filterText, { 
                color: theme.colors.text.secondary,
                fontFamily: theme.fontFamily.medium
              }]}>
                By Week
              </Text>
              <ChevronDown size={16} color={theme.colors.text.secondary} />
            </View>
          </View>
          
          {/* Weekly weight entries */}
          {weeklyData.map((item, index) => (
            <TouchableOpacity 
              key={index}
              style={[styles.weeklyItem, { backgroundColor: theme.colors.background.card }]}
            >
              <View>
                <Text style={[styles.weekText, { 
                  color: theme.colors.text.primary,
                  fontFamily: theme.fontFamily.medium
                }]}>
                  {item.week}
                </Text>
                {item.date && (
                  <Text style={[styles.dateText, { 
                    color: theme.colors.text.secondary,
                    fontFamily: theme.fontFamily.regular
                  }]}>
                    {item.date}
                  </Text>
                )}
              </View>
              <View style={styles.valueContainer}>
                <Text style={[styles.valueText, { 
                  color: theme.colors.text.primary,
                  fontFamily: theme.fontFamily.semiBold
                }]}>
                  {item.value}
                </Text>
                <ChevronDown size={16} color={theme.colors.text.secondary} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Custom ChevronDown component
const ChevronDown = ({ size, color }: { size: number, color: string }) => {
  return (
    <View style={{ transform: [{ rotate: '90deg' }] }}>
      <ChevronRight size={size} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingVertical: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  timeRangeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  timeRangeText: {
    fontSize: 14,
  },
  currentWeightContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  currentLabel: {
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 8,
  },
  currentWeight: {
    fontSize: 36,
  },
  unitText: {
    fontSize: 24,
  },
  dateRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  dateRangeText: {
    fontSize: 14,
    marginHorizontal: 8,
  },
  chartContainer: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 8,
    marginBottom: 24,
  },
  chart: {
    borderRadius: 16,
  },
  tooltipContainer: {
    position: 'absolute',
    padding: 8,
    borderRadius: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  tooltipDate: {
    fontSize: 12,
  },
  tooltipValue: {
    fontSize: 14,
  },
  weightLogSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  weightLogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  weightLogTitle: {
    fontSize: 18,
    flex: 1,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterText: {
    fontSize: 14,
    marginRight: 4,
  },
  weeklyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  weekText: {
    fontSize: 16,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    fontSize: 16,
    marginRight: 8,
  },
});
