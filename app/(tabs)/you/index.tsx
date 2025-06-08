import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { Settings, ChevronRight, Timer, Flame } from 'lucide-react-native';
import { useMetrics } from '@/hooks/useMetrics';
import MetricChart from '@/components/MetricChart';

export default function YouScreen() {
  const { metrics } = useMetrics();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>You</Text>
          <TouchableOpacity style={styles.settingsButton}>
            <View style={styles.profileInitials}>
              <Text style={styles.initialsText}>VD</Text>
            </View>
            <Settings size={20} color="#1E293B" style={styles.settingsIcon} />
          </TouchableOpacity>
        </View>

        <View style={styles.goalSection}>
          <Text style={styles.goalText}>Set your fitness goal (<Text style={styles.addLink}>add</Text>)</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <View style={styles.statIconContainer}>
                <Timer size={24} color="#5B6EE8" />
              </View>
              <View>
                <Text style={styles.statValue}>180</Text>
                <Text style={styles.statLabel}>Training min</Text>
              </View>
            </View>
            
            <View style={styles.statBox}>
              <View style={styles.statIconContainer}>
                <Flame size={24} color="#5B6EE8" />
              </View>
              <View>
                <Text style={styles.statValue}>0</Text>
                <Text style={styles.statLabel}>Streak days</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.metricsHeader}>
          <Text style={styles.sectionTitle}>Metrics</Text>
          <Link href="/you/metrics" asChild>
            <TouchableOpacity>
              <Text style={styles.viewMoreText}>View more</Text>
            </TouchableOpacity>
          </Link>
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>WEIGHT (KG)</Text>
          <MetricChart 
            data={[
              { date: '4/5', value: 58 },
              { date: '4/17', value: 57 },
              { date: '5/23', value: 52 },
              { date: '6/3', value: 58 },
            ]}
            height={200}
          />
        </View>

        <Link href="/you/activity-history" asChild>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Activity history</Text>
            <ChevronRight size={20} color="#94A3B8" />
          </TouchableOpacity>
        </Link>

        <Link href="/you/exercises" asChild>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Your exercises</Text>
            <ChevronRight size={20} color="#94A3B8" />
          </TouchableOpacity>
        </Link>

        <Link href="/you/progress-photos" asChild>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Progress photos</Text>
            <ChevronRight size={20} color="#94A3B8" />
          </TouchableOpacity>
        </Link>

         <Link href="/you/steps" asChild>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Steps</Text>
            <ChevronRight size={20} color="#94A3B8" />
          </TouchableOpacity>
        </Link>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',  // Changed from #F8FAFC to white
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1E293B',
  },
  settingsButton: {
    position: 'relative',
  },
  profileInitials: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  settingsIcon: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 4,
  },
  goalSection: {
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  goalText: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 16,
  },
  addLink: {
    color: '#5B6EE8',
    textDecorationLine: 'underline',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  statLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  metricsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  viewMoreText: {
    fontSize: 14,
    color: '#5B6EE8',
  },
  chartContainer: {
    marginTop: 12,
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  menuItemText: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
  },
});