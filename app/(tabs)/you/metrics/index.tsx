import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight, ClipboardList } from 'lucide-react-native';
import { useMetrics } from '@/hooks/useMetrics';

export default function MetricsScreen() {
  const router = useRouter();
  const { metrics } = useMetrics();
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.title}>Metrics</Text>
      </View>
      
      <View style={styles.illustration}>
        <ClipboardList size={48} color="#5B6EE8" />
      </View>
      
      <ScrollView style={styles.metricsContainer}>
        <Link href="/you/metrics/weight" asChild>
          <TouchableOpacity style={styles.metricCard}>
            <View>
              <Text style={styles.metricTitle}>Weight</Text>
              {metrics.weight.lastUpdated && (
                <Text style={styles.metricUpdated}>updated today</Text>
              )}
            </View>
            <View style={styles.metricValueContainer}>
              <Text style={styles.metricValue}>{metrics.weight.current} kg</Text>
              <ChevronRight size={20} color="#94A3B8" />
            </View>
          </TouchableOpacity>
        </Link>
        
        <Link href="/you/metrics/chest" asChild>
          <TouchableOpacity style={styles.metricCard}>
            <View>
              <Text style={styles.metricTitle}>Chest</Text>
              {metrics.chest.lastUpdated && (
                <Text style={styles.metricUpdated}>updated today</Text>
              )}
            </View>
            <View style={styles.metricValueContainer}>
              <Text style={styles.metricValue}>{metrics.chest.current} in</Text>
              <ChevronRight size={20} color="#94A3B8" />
            </View>
          </TouchableOpacity>
        </Link>
        
        <Link href="/you/metrics/shoulders" asChild>
          <TouchableOpacity style={styles.metricCard}>
            <View>
              <Text style={styles.metricTitle}>Shoulders</Text>
            </View>
            <View style={styles.metricValueContainer}>
              <ChevronRight size={20} color="#94A3B8" />
            </View>
          </TouchableOpacity>
        </Link>
        
        <Link href="/you/metrics/waist" asChild>
          <TouchableOpacity style={styles.metricCard}>
            <View>
              <Text style={styles.metricTitle}>Waist</Text>
            </View>
            <View style={styles.metricValueContainer}>
              <ChevronRight size={20} color="#94A3B8" />
            </View>
          </TouchableOpacity>
        </Link>
        
        <Link href="/you/metrics/thigh" asChild>
          <TouchableOpacity style={styles.metricCard}>
            <View>
              <Text style={styles.metricTitle}>Thigh</Text>
            </View>
            <View style={styles.metricValueContainer}>
              <ChevronRight size={20} color="#94A3B8" />
            </View>
          </TouchableOpacity>
        </Link>
        
        <Link href="/you/metrics/hip" asChild>
          <TouchableOpacity style={styles.metricCard}>
            <View>
              <Text style={styles.metricTitle}>Hip</Text>
            </View>
            <View style={styles.metricValueContainer}>
              <ChevronRight size={20} color="#94A3B8" />
            </View>
          </TouchableOpacity>
        </Link>
        
        <Link href="/you/metrics/body-fat" asChild>
          <TouchableOpacity style={styles.metricCard}>
            <View>
              <Text style={styles.metricTitle}>Body Fat</Text>
            </View>
            <View style={styles.metricValueContainer}>
              <ChevronRight size={20} color="#94A3B8" />
            </View>
          </TouchableOpacity>
        </Link>
        
        <Link href="/you/metrics/bicep" asChild>
          <TouchableOpacity style={styles.metricCard}>
            <View>
              <Text style={styles.metricTitle}>Bicep</Text>
            </View>
            <View style={styles.metricValueContainer}>
              <ChevronRight size={20} color="#94A3B8" />
            </View>
          </TouchableOpacity>
        </Link>
        
        <Link href="/you/metrics/water-intake" asChild>
          <TouchableOpacity style={styles.metricCard}>
            <View>
              <Text style={styles.metricTitle}>Water intake</Text>
            </View>
            <View style={styles.metricValueContainer}>
              <ChevronRight size={20} color="#94A3B8" />
            </View>
          </TouchableOpacity>
        </Link>
        
        <Link href="/you/metrics/steps" asChild>
          <TouchableOpacity style={styles.metricCard}>
            <View>
              <Text style={styles.metricTitle}>Steps</Text>
            </View>
            <View style={styles.metricValueContainer}>
              <ChevronRight size={20} color="#94A3B8" />
            </View>
          </TouchableOpacity>
        </Link>
        
        <Link href="/you/metrics/log" asChild>
          <TouchableOpacity style={styles.logButton}>
            <Text style={styles.logButtonText}>Log all metrics</Text>
          </TouchableOpacity>
        </Link>
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
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  backButton: {
    marginRight: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1E293B',
  },
  illustration: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  metricsContainer: {
    paddingHorizontal: 16,
  },
  metricCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  metricTitle: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
  },
  metricUpdated: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  metricValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
    marginRight: 8,
  },
  logButton: {
    backgroundColor: '#5B6EE8',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 24,
    shadowColor: '#5B6EE8',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  logButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});