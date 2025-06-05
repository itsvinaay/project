import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { LineChart } from 'react-native-chart-kit';

interface WeightMetricsCardProps {
  weightData: number[];
  dates: string[];
  unit: string;
  isLoading?: boolean;
}

export default function WeightMetricsCard({
  weightData,
  dates,
  unit = 'KG',
  isLoading = false,
}: WeightMetricsCardProps) {
  const theme = useTheme();
  
  // Calculate min and max for y-axis
  const minWeight = Math.min(...weightData) - 2;
  const maxWeight = Math.max(...weightData) + 2;
  
  // Get current weight (last entry)
  const currentWeight = weightData[weightData.length - 1];
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.card }]}>
      <Text style={[styles.title, { 
        color: theme.colors.text.primary,
        fontFamily: theme.fontFamily.semiBold 
      }]}>
        WEIGHT ({unit})
      </Text>
      
      <Text style={[styles.currentWeight, { 
        color: theme.colors.text.primary,
        fontFamily: theme.fontFamily.semiBold 
      }]}>
        {currentWeight}
      </Text>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={{ color: theme.colors.text.secondary }}>Loading...</Text>
        </View>
      ) : (
        <View style={styles.chartContainer}>
          <LineChart
            data={{
              labels: dates,
              datasets: [
                {
                  data: weightData,
                  color: () => theme.colors.primary[500],
                  strokeWidth: 2,
                },
              ],
            }}
            width={Dimensions.get('window').width - 64} // -64 for container padding and margins
            height={180}
            chartConfig={{
              backgroundColor: theme.colors.background.card,
              backgroundGradientFrom: theme.colors.background.card,
              backgroundGradientTo: theme.colors.background.card,
              decimalPlaces: 1,
              color: (opacity = 1) => theme.colors.text.secondary,
              labelColor: (opacity = 1) => theme.colors.text.secondary,
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
                stroke: theme.colors.dark[700],
                strokeOpacity: 0.2,
              },
            }}
            bezier
            style={styles.chart}
            withShadow={false}
            withInnerLines={true}
            withOuterLines={false}
            withVerticalLines={false}
            withHorizontalLines={true}
            fromZero={false}
            yAxisLabel=""
            yAxisSuffix=""
            yMin={minWeight}
            yMax={maxWeight}
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 14,
    marginBottom: 8,
  },
  currentWeight: {
    fontSize: 24,
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'center',
  },
  chart: {
    borderRadius: 16,
    marginVertical: 8,
  },
  loadingContainer: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
