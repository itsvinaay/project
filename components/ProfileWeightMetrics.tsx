import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { LineChart } from 'react-native-chart-kit';

interface ProfileWeightMetricsProps {
  weightData: number[];
  dates: string[];
  unit?: string;
  isLoading?: boolean;
}

export default function ProfileWeightMetrics({
  weightData,
  dates,
  unit = 'KG',
  isLoading = false,
}: ProfileWeightMetricsProps) {
  const theme = useTheme();
  
  // Debug the incoming data
  console.log('ProfileWeightMetrics - weightData:', weightData);
  console.log('ProfileWeightMetrics - dates:', dates);
  
  // Make sure we have valid data for the chart
  const validWeightData = weightData && weightData.length > 0 && !weightData.includes(NaN) ? weightData : [50, 51, 52];
  const validDates = dates && dates.length > 0 ? dates : ['Jan 1', 'Jan 15', 'Jan 30'];
  
  // Get current weight (last entry)
  const currentWeight = validWeightData.length > 0 ? validWeightData[validWeightData.length - 1] : 0;
  
  // Ensure we have at least 2 data points for the chart
  if (validWeightData.length === 1) {
    validWeightData.push(validWeightData[0]);
    validDates.push('Today');
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>
          WEIGHT ({unit})
        </Text>
        <Text style={styles.currentWeight}>
          {currentWeight}
        </Text>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      ) : (
        <View style={styles.chartContainer}>
          <LineChart
            data={{
              labels: validDates,
              datasets: [{
                data: validWeightData,
                color: () => '#000000', // Black for high contrast
                strokeWidth: 3 // Thicker line
              }]
            }}
            width={Dimensions.get('window').width - 40}
            height={200}
            yAxisInterval={1}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: () => '#000000', // Black for high contrast
              labelColor: () => '#000000', // Black for high contrast
              propsForDots: {
                r: "8", // Larger dots
                strokeWidth: "2",
                stroke: "#000000",
                fill: "#000000"
              },
              propsForLabels: {
                fontSize: 14, // Larger font
                fontWeight: '600',
              },
              propsForBackgroundLines: {
                strokeWidth: 1,
                stroke: '#cccccc', // Light gray grid lines
              },
            }}
            style={{
              marginVertical: 16,
              borderRadius: 16,
              padding: 10,
              backgroundColor: '#ffffff',
            }}
            bezier={false}
            withInnerLines={true}
            withOuterLines={true}
            withVerticalLabels={true}
            withHorizontalLabels={true}
            withVerticalLines={false}
            withHorizontalLines={true}
            withShadow={false}
            fromZero={false}
          />
          
          {/* Debug info - remove in production */}
          <Text style={{color: 'transparent', fontSize: 1}}>
            Data: {JSON.stringify(validWeightData)}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    textTransform: 'uppercase',
  },
  currentWeight: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
