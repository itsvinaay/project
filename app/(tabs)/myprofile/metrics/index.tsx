import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter, Stack } from 'expo-router';
import { ChevronLeft, ChevronRight, ClipboardList } from 'lucide-react-native';
import { useMetrics } from '@/hooks/useMetrics';
import { useTheme } from '@/context/ThemeContext';

export default function MetricsScreen() {
  const router = useRouter();
  const { metrics } = useMetrics();
  const theme = useTheme();
  
  const containerStyle = {
    ...styles.container,
    backgroundColor: theme.colors.background.primary
  };
  
  const titleStyle = {
    ...styles.title,
    color: theme.colors.text.primary,
    fontFamily: theme.fontFamily.semiBold
  };
  
  const metricCardStyle = {
    ...styles.metricCard,
    backgroundColor: theme.colors.background.card
  };
  
  const metricTitleStyle = {
    ...styles.metricTitle,
    color: theme.colors.text.primary,
    fontFamily: theme.fontFamily.semiBold
  };
  
  const metricUpdatedStyle = {
    ...styles.metricUpdated,
    color: theme.colors.text.secondary,
    fontFamily: theme.fontFamily.regular
  };
  
  const metricValueStyle = {
    ...styles.metricValue,
    color: theme.colors.text.primary,
    fontFamily: theme.fontFamily.semiBold
  };
  
  const logButtonStyle = {
    ...styles.logButton,
    backgroundColor: theme.colors.primary[500]
  };
  
  const logButtonTextStyle = {
    ...styles.logButtonText,
    color: '#FFFFFF',
    fontFamily: theme.fontFamily.semiBold
  };
  
  return (
    <SafeAreaView style={containerStyle} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: '',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: theme.colors.background.primary },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ChevronLeft size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <View style={styles.header}>
        <Text style={titleStyle}>
          Metrics
        </Text>
      </View>
      
      <View style={styles.illustration}>
        <ClipboardList size={48} color={theme.colors.primary[500]} />
      </View>
      
      <ScrollView style={styles.metricsContainer}>
        <Link href="/you/metrics/weight" asChild>
          <TouchableOpacity style={metricCardStyle}>
            <View>
              <Text style={metricTitleStyle}>
                Weight
              </Text>
              {metrics.weight.lastUpdated && (
                <Text style={metricUpdatedStyle}>
                  updated today
                </Text>
              )}
            </View>
            <View style={styles.metricValueContainer}>
              <Text style={metricValueStyle}>
                {metrics.weight.current} kg
              </Text>
              <ChevronRight size={20} color={theme.colors.text.secondary} />
            </View>
          </TouchableOpacity>
        </Link>
        
        <Link href="/you/metrics/chest" asChild>
          <TouchableOpacity style={metricCardStyle}>
            <View>
              <Text style={metricTitleStyle}>
                Chest
              </Text>
              {metrics.chest.lastUpdated && (
                <Text style={metricUpdatedStyle}>
                  updated today
                </Text>
              )}
            </View>
            <View style={styles.metricValueContainer}>
              <Text style={metricValueStyle}>
                {metrics.chest.current} in
              </Text>
              <ChevronRight size={20} color={theme.colors.text.secondary} />
            </View>
          </TouchableOpacity>
        </Link>
        
        <Link href="/you/metrics/shoulders" asChild>
          <TouchableOpacity style={metricCardStyle}>
            <View>
              <Text style={metricTitleStyle}>
                Shoulders
              </Text>
            </View>
            <View style={styles.metricValueContainer}>
              <ChevronRight size={20} color={theme.colors.text.secondary} />
            </View>
          </TouchableOpacity>
        </Link>
        
        <Link href="/you/metrics/waist" asChild>
          <TouchableOpacity style={metricCardStyle}>
            <View>
              <Text style={metricTitleStyle}>
                Waist
              </Text>
            </View>
            <View style={styles.metricValueContainer}>
              <ChevronRight size={20} color={theme.colors.text.secondary} />
            </View>
          </TouchableOpacity>
        </Link>
        
        <Link href="/you/metrics/thigh" asChild>
          <TouchableOpacity style={metricCardStyle}>
            <View>
              <Text style={metricTitleStyle}>
                Thigh
              </Text>
            </View>
            <View style={styles.metricValueContainer}>
              <ChevronRight size={20} color={theme.colors.text.secondary} />
            </View>
          </TouchableOpacity>
        </Link>
        
        <Link href="/you/metrics/hip" asChild>
          <TouchableOpacity style={metricCardStyle}>
            <View>
              <Text style={metricTitleStyle}>
                Hip
              </Text>
            </View>
            <View style={styles.metricValueContainer}>
              <ChevronRight size={20} color={theme.colors.text.secondary} />
            </View>
          </TouchableOpacity>
        </Link>
        
        <Link href="/you/metrics/body-fat" asChild>
          <TouchableOpacity style={metricCardStyle}>
            <View>
              <Text style={metricTitleStyle}>
                Body Fat
              </Text>
            </View>
            <View style={styles.metricValueContainer}>
              <ChevronRight size={20} color={theme.colors.text.secondary} />
            </View>
          </TouchableOpacity>
        </Link>
        
        <Link href="/you/metrics/bicep" asChild>
          <TouchableOpacity style={metricCardStyle}>
            <View>
              <Text style={metricTitleStyle}>
                Bicep
              </Text>
            </View>
            <View style={styles.metricValueContainer}>
              <ChevronRight size={20} color={theme.colors.text.secondary} />
            </View>
          </TouchableOpacity>
        </Link>
        
        <Link href="/you/metrics/water-intake" asChild>
          <TouchableOpacity style={metricCardStyle}>
            <View>
              <Text style={metricTitleStyle}>
                Water intake
              </Text>
            </View>
            <View style={styles.metricValueContainer}>
              <ChevronRight size={20} color={theme.colors.text.secondary} />
            </View>
          </TouchableOpacity>
        </Link>
        
        <Link href="/you/metrics/steps" asChild>
          <TouchableOpacity style={metricCardStyle}>
            <View>
              <Text style={metricTitleStyle}>
                Steps
              </Text>
            </View>
            <View style={styles.metricValueContainer}>
              <ChevronRight size={20} color={theme.colors.text.secondary} />
            </View>
          </TouchableOpacity>
        </Link>
        
        <Link href="/you/metrics/log" asChild>
          <TouchableOpacity style={logButtonStyle}>
            <Text style={logButtonTextStyle}>
              Log all metrics
            </Text>
          </TouchableOpacity>
        </Link>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
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
    marginBottom: 8,
    borderRadius: 12,
  },
  metricTitle: {
    fontSize: 16,
  },
  metricUpdated: {
    fontSize: 12,
    marginTop: 2,
  },
  metricValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 16,
    marginRight: 8,
  },
  logButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 24,
  },
  logButtonText: {
    fontSize: 16,
  },
});