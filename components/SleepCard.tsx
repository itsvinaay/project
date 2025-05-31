import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { Moon } from 'lucide-react-native';
import { ActivityIndicator } from 'react-native';

interface SleepCardProps {
  sleepData: number[];
  dates: string[];
  todaySleep: number;
  goal: number;
  isLoading?: boolean;
}

export default function SleepCard({
  sleepData,
  dates,
  todaySleep,
  goal,
  isLoading = false
}: SleepCardProps) {
  const theme = useTheme();
  
  // Calculate width based on screen size
  const screenWidth = Dimensions.get('window').width - 32;
  
  // Calculate percentage of goal
  const goalPercentage = Math.min(Math.round((todaySleep / goal) * 100), 100);
  
  // Convert hours to hours and minutes format
  const formatHours = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.card }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { 
          color: theme.colors.text.primary,
          fontFamily: theme.fontFamily.semiBold
        }]}>
          Sleep
        </Text>
        <View style={styles.goalContainer}>
          <Text style={[styles.goalText, { 
            color: theme.colors.text.secondary,
            fontFamily: theme.fontFamily.regular
          }]}>
            Goal: {goal} hours
          </Text>
        </View>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.sleepInfoContainer}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary[900] }]}>
            <Moon size={24} color={theme.colors.primary[400]} />
          </View>
          <View style={styles.sleepTextContainer}>
            <Text style={[styles.sleepValue, { 
              color: theme.colors.primary[400],
              fontFamily: theme.fontFamily.semiBold
            }]}>
              {formatHours(todaySleep)}
            </Text>
            <Text style={[styles.sleepLabel, { 
              color: theme.colors.text.secondary,
              fontFamily: theme.fontFamily.regular
            }]}>
              last night
            </Text>
          </View>
        </View>
        
        <View style={styles.progressContainer}>
          <View style={[styles.progressBackground, { backgroundColor: theme.colors.dark[700] }]}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  backgroundColor: theme.colors.primary[400],
                  width: `${goalPercentage}%` 
                }
              ]}
            />
          </View>
          <Text style={[styles.progressText, { 
            color: theme.colors.text.secondary,
            fontFamily: theme.fontFamily.medium
          }]}>
            {goalPercentage}% of goal
          </Text>
        </View>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[400]} />
        </View>
      ) : (
        <View style={styles.chartContainer}>
          <BarChart
            data={{
              labels: dates,
              datasets: [
                {
                  data: sleepData,
                  colors: sleepData.map(value => 
                    value >= goal 
                      ? (opacity = 1) => `rgba(102, 219, 255, ${opacity})` 
                      : (opacity = 1) => `rgba(0, 191, 255, ${opacity})` 
                  )
                }
              ],
            }}
            width={screenWidth}
            height={180}
            yAxisSuffix="h"
            chartConfig={{
              backgroundColor: theme.colors.background.card,
              backgroundGradientFrom: theme.colors.background.card,
              backgroundGradientTo: theme.colors.background.card,
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity * 0.6})`,
              style: {
                borderRadius: 16,
              },
              barPercentage: 0.5,
              propsForBackgroundLines: {
                strokeDasharray: '', 
                strokeWidth: 0.5,
                stroke: `rgba(255, 255, 255, 0.1)`,
              },
            }}
            style={{
              marginTop: 16,
              borderRadius: 16,
            }}
            withInnerLines={true}
            withHorizontalLabels={true}
            showBarTops={false}
            fromZero={true}
            withCustomBarColorFromData={true}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
  },
  goalContainer: {
    backgroundColor: 'rgba(0, 191, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  goalText: {
    fontSize: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sleepInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sleepTextContainer: {
    justifyContent: 'center',
  },
  sleepValue: {
    fontSize: 18,
  },
  sleepLabel: {
    fontSize: 12,
  },
  progressContainer: {
    width: '50%',
  },
  progressBackground: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
  chartContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  loadingContainer: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
});