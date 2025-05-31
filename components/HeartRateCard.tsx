import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { Heart } from 'lucide-react-native';
import { ActivityIndicator } from 'react-native';

interface HeartRateCardProps {
  heartRateData: number[];
  times: string[];
  currentRate: number;
  restingRate: number;
  isLoading?: boolean;
}

export default function HeartRateCard({
  heartRateData,
  times,
  currentRate,
  restingRate,
  isLoading = false
}: HeartRateCardProps) {
  const theme = useTheme();
  
  // Calculate width based on screen size
  const screenWidth = Dimensions.get('window').width - 32;
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.card }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { 
          color: theme.colors.text.primary,
          fontFamily: theme.fontFamily.semiBold
        }]}>
          Heart Rate
        </Text>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.heartRateInfoContainer}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.accent[900] }]}>
            <Heart size={24} color={theme.colors.accent[500]} fill={theme.colors.accent[500]} />
          </View>
          <View style={styles.heartRateTextContainer}>
            <Text style={[styles.heartRateValue, { 
              color: theme.colors.accent[500],
              fontFamily: theme.fontFamily.semiBold
            }]}>
              {currentRate} <Text style={styles.bpmLabel}>BPM</Text>
            </Text>
            <Text style={[styles.heartRateLabel, { 
              color: theme.colors.text.secondary,
              fontFamily: theme.fontFamily.regular
            }]}>
              current
            </Text>
          </View>
        </View>
        
        <View style={styles.restingContainer}>
          <Text style={[styles.restingValue, { 
            color: theme.colors.text.primary,
            fontFamily: theme.fontFamily.semiBold
          }]}>
            {restingRate} <Text style={[styles.bpmLabel, { color: theme.colors.text.secondary }]}>BPM</Text>
          </Text>
          <Text style={[styles.restingLabel, { 
            color: theme.colors.text.secondary,
            fontFamily: theme.fontFamily.regular
          }]}>
            resting rate
          </Text>
        </View>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.accent[500]} />
        </View>
      ) : (
        <View style={styles.chartContainer}>
          <LineChart
            data={{
              labels: times,
              datasets: [
                {
                  data: heartRateData,
                  color: (opacity = 1) => `rgba(255, 82, 82, ${opacity})`,
                  strokeWidth: 2,
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
                stroke: theme.colors.accent[500],
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heartRateInfoContainer: {
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
  heartRateTextContainer: {
    justifyContent: 'center',
  },
  heartRateValue: {
    fontSize: 24,
  },
  bpmLabel: {
    fontSize: 14,
  },
  heartRateLabel: {
    fontSize: 12,
  },
  restingContainer: {
    alignItems: 'flex-end',
  },
  restingValue: {
    fontSize: 18,
  },
  restingLabel: {
    fontSize: 12,
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