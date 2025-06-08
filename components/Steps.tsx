import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

export default function StepsScreen() {
  const router = useRouter();
  const theme = useTheme();

  // Mock data - replace with real data
  const stepsData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: [6500, 8200, 7800, 9000, 7500, 10000, 8800]
    }]
  };

  const avgSteps = Math.round(stepsData.datasets[0].data.reduce((a, b) => a + b, 0) / 7);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.background.card }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { 
          color: theme.colors.text.primary,
          fontFamily: theme.fontFamily.semiBold 
        }]}>Steps</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.statsCard, { backgroundColor: theme.colors.background.card }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { 
              color: theme.colors.text.primary,
              fontFamily: theme.fontFamily.semiBold 
            }]}>{avgSteps.toLocaleString()}</Text>
            <Text style={[styles.statLabel, { 
              color: theme.colors.text.secondary,
              fontFamily: theme.fontFamily.regular 
            }]}>Daily Average</Text>
          </View>
          
          <View style={[styles.statDivider, { backgroundColor: theme.colors.dark[700] }]} />
          
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { 
              color: theme.colors.text.primary,
              fontFamily: theme.fontFamily.semiBold 
            }]}>10,000</Text>
            <Text style={[styles.statLabel, { 
              color: theme.colors.text.secondary,
              fontFamily: theme.fontFamily.regular 
            }]}>Daily Goal</Text>
          </View>
        </View>

        <View style={[styles.chartCard, { backgroundColor: theme.colors.background.card }]}>
          <Text style={[styles.chartTitle, { 
            color: theme.colors.text.primary,
            fontFamily: theme.fontFamily.semiBold 
          }]}>Weekly Overview</Text>
          
          <LineChart
            data={stepsData}
            width={Dimensions.get('window').width - 48}
            height={220}
            chartConfig={{
              backgroundColor: theme.colors.background.card,
              backgroundGradientFrom: theme.colors.background.card,
              backgroundGradientTo: theme.colors.background.card,
              decimalPlaces: 0,
              color: (opacity = 1) => theme.colors.primary[500],
              labelColor: (opacity = 1) => theme.colors.text.secondary,
              style: {
                borderRadius: 16
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: theme.colors.primary[500]
              }
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16
            }}
          />
        </View>
        
        <View style={[styles.historyCard, { backgroundColor: theme.colors.background.card }]}>
          <Text style={[styles.historyTitle, { 
            color: theme.colors.text.primary,
            fontFamily: theme.fontFamily.semiBold 
          }]}>History</Text>
          
          {stepsData.labels.map((day, index) => (
            <View key={day} style={styles.historyItem}>
              <Text style={[styles.historyDay, { 
                color: theme.colors.text.primary,
                fontFamily: theme.fontFamily.medium 
              }]}>{day}</Text>
              <Text style={[styles.historySteps, { 
                color: theme.colors.text.primary,
                fontFamily: theme.fontFamily.regular 
              }]}>{stepsData.datasets[0].data[index].toLocaleString()} steps</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
  },
  statsCard: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  statDivider: {
    width: 1,
    height: '70%',
    alignSelf: 'center',
  },
  chartCard: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  historyCard: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  historyTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  historyDay: {
    fontSize: 16,
  },
  historySteps: {
    fontSize: 16,
  },
});