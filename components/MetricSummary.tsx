import { View, Text, StyleSheet } from 'react-native';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react-native';
import MetricChart from './MetricChart';

type MetricSummaryProps = {
  title: string;
  value: number | string;
  unit: string;
  change?: number;
  showChart?: boolean;
};

export default function MetricSummary({
  title,
  value,
  unit,
  change,
  showChart = false
}: MetricSummaryProps) {
  const isPositiveChange = change && change > 0;
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.valueContainer}>
          <Text style={styles.value}>{value} <Text style={styles.unit}>{unit}</Text></Text>
          {change !== undefined && (
            <View style={[
              styles.changeContainer, 
              isPositiveChange ? styles.positiveChangeContainer : styles.negativeChangeContainer
            ]}>
              {isPositiveChange ? (
                <ArrowUpRight size={12} color="#16A34A" />
              ) : (
                <ArrowDownRight size={12} color="#DC2626" />
              )}
              <Text style={[
                styles.changeText, 
                isPositiveChange ? styles.positiveChangeText : styles.negativeChangeText
              ]}>
                {Math.abs(change)}{unit}
              </Text>
            </View>
          )}
        </View>
      </View>
      
      {showChart && (
        <View style={styles.chartContainer}>
          <MetricChart 
            data={[
              { date: '1', value: 55 },
              { date: '2', value: 54 },
              { date: '3', value: 56 },
              { date: '4', value: 52 },
              { date: '5', value: 58 },
            ]}
            height={100}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
  },
  valueContainer: {
    alignItems: 'flex-end',
  },
  value: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  unit: {
    fontSize: 14,
    fontWeight: '400',
    color: '#64748B',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  positiveChangeContainer: {
    backgroundColor: '#DCFCE7',
  },
  negativeChangeContainer: {
    backgroundColor: '#FEE2E2',
  },
  changeText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 2,
  },
  positiveChangeText: {
    color: '#16A34A',
  },
  negativeChangeText: {
    color: '#DC2626',
  },
  chartContainer: {
    marginTop: 16,
  },
});