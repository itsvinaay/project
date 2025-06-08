import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import {
  VictoryChart,
  VictoryLine,
  VictoryAxis,
  VictoryTooltip,
  VictoryVoronoiContainer,
  VictoryScatter,
} from 'victory-native';
import { getMetricEntries, MetricEntry } from '../services/metricDataService';

const WeightChart: React.FC = () => {
  const [data, setData] = useState<{ x: string; y: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Fetch weight entries from the metric service
    const entries: MetricEntry[] = getMetricEntries('weight');
    const chartData = entries.map(entry => ({
      x: new Date(entry.date).toLocaleDateString('en-IN', { month: 'numeric', day: 'numeric' }),
      y: parseFloat(entry.value)
    }));
    setData(chartData);
    setLoading(false);
  }, []);

  if (loading) {
    return <ActivityIndicator />;
  }

  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>WEIGHT (KG)</Text>
        <Text style={styles.noData}>No weight data available.</Text>
      </View>
    );
  }

  // Dynamic y-axis domain
  const weights = data.map(d => d.y);
  const minY = Math.floor(Math.min(...weights) - 2);
  const maxY = Math.ceil(Math.max(...weights) + 2);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>WEIGHT (KG)</Text>
      <VictoryChart
        height={240}
        padding={{ top: 20, bottom: 60, left: 50, right: 20 }}
        domainPadding={{ x: 20, y: 10 }}
        containerComponent={
          <VictoryVoronoiContainer
            labels={({ datum }) => `${datum.y} kg`}
            labelComponent={
              <VictoryTooltip
                cornerRadius={6}
                flyoutStyle={{ fill: '#222', stroke: '#222' }}
                style={{ fill: '#fff', fontSize: 12 }}
              />
            }
          />
        }
      >
        <VictoryAxis
          tickFormat={(t) => t}
          style={{
            axis: { stroke: '#ccc' },
            tickLabels: { fontSize: 11, padding: 10, fill: '#444', angle: -30, textAnchor: 'end' },
            grid: { stroke: 'none' },
          }}
        />
        <VictoryAxis
          dependentAxis
          domain={[minY, maxY]}
          tickFormat={(t) => `${t}`}
          style={{
            axis: { stroke: '#ccc' },
            tickLabels: { fontSize: 11, padding: 6, fill: '#444' },
            grid: { stroke: '#e0e0e0', strokeDasharray: '4,8' },
          }}
        />
        <VictoryLine
          data={data}
          interpolation="monotoneX"
          style={{
            data: { stroke: '#2d7efb', strokeWidth: 3 },
          }}
        />
        <VictoryScatter
          data={data}
          size={5}
          style={{ data: { fill: '#fff', stroke: '#2d7efb', strokeWidth: 2 } }}
        />
      </VictoryChart>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    margin: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  title: {
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 8,
    color: '#2d3540',
  },
  noData: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
    fontSize: 16,
  },
});

export default WeightChart;