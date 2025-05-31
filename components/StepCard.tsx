import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { ActivityIndicator } from 'react-native';

interface StepCardProps {
  steps: number[];
  dates: string[];
  goal: number;
  todaySteps: number;
  isLoading?: boolean;
}

export default function StepCard({ 
  steps, 
  dates, 
  goal, 
  todaySteps,
  isLoading = false 
}: StepCardProps) {
  const theme = useTheme();
  
  // Calculate width based on screen size
  const screenWidth = Dimensions.get('window').width - 32;
  
  // Calculate percentage of goal
  const goalPercentage = Math.min(Math.round((todaySteps / goal) * 100), 100);
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.card }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { 
          color: theme.colors.text.primary,
          fontFamily: theme.fontFamily.semiBold
        }]}>
          Steps
        </Text>
        <View style={styles.goalContainer}>
          <Text style={[styles.goalText, { 
            color: theme.colors.text.secondary,
            fontFamily: theme.fontFamily.regular
          }]}>
            Goal: {goal.toLocaleString()}
          </Text>
        </View>
      </View>
      
      <View style={styles.statsContainer}>
        <View>
          <Text style={[styles.stepsCount, { 
            color: theme.colors.primary[500],
            fontFamily: theme.fontFamily.semiBold
          }]}>
            {todaySteps.toLocaleString()}
          </Text>
          <Text style={[styles.stepsLabel, { 
            color: theme.colors.text.secondary,
            fontFamily: theme.fontFamily.regular
          }]}>
            steps today
          </Text>
        </View>
        
        <View style={styles.progressContainer}>
          <View style={[styles.progressBackground, { backgroundColor: theme.colors.dark[700] }]}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  backgroundColor: theme.colors.primary[500],
                  width: `${goalPercentage}%` 
                }
              ]}
            />
          </View>
          <Text style={[styles.progressText, { 
            color: theme.colors.text.secondary,
            fontFamily: theme.fontFamily.medium
          }]}>
            {goalPercentage}% of daily goal
          </Text>
        </View>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        </View>
      ) : (
        <View style={styles.chartContainer}>
          <LineChart
            data={{
              labels: dates,
              datasets: [
                {
                  data: steps,
                  color: (opacity = 1) => `rgba(0, 191, 255, ${opacity})`,
                  strokeWidth: 2,
                },
                {
                  data: Array(steps.length).fill(goal),
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity * 0.3})`,
                  strokeWidth: 1,
                  strokeDashArray: [5, 5],
                },
              ],
            }}
            width={screenWidth}
            height={180}
            chartConfig={{
              backgroundColor: theme.colors.background.card,
              backgroundGradientFrom: theme.colors.background.card,
              backgroundGradientTo: theme.colors.background.card,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity * 0.6})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: theme.colors.primary[500],
              },
              propsForBackgroundLines: {
                strokeDasharray: '', 
                strokeWidth: 0.5,
                stroke: `rgba(255, 255, 255, 0.1)`,
              },
            }}
            bezier
            style={{
              marginTop: 16,
              borderRadius: 16,
            }}
            withInnerLines={true}
            withOuterLines={false}
            withDots={true}
            withShadow={false}
            withVerticalLines={false}
            withHorizontalLines={true}
            fromZero={true}
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
  stepsCount: {
    fontSize: 32,
  },
  stepsLabel: {
    fontSize: 14,
  },
  progressContainer: {
    width: '60%',
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