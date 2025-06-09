import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, ChevronDown, Calendar, Clock } from 'lucide-react-native';
import { useMetrics } from '@/hooks/useMetrics';

export default function LogMetricsScreen() {
  const router = useRouter();
  const { metric } = useLocalSearchParams<{ metric?: string }>();
  const { logMetric, getMetricDetails } = useMetrics();
  
  const [values, setValues] = useState({
    weight: '',
    chest: '',
    shoulders: '',
    waist: '',
    thigh: '',
    hip: '',
    bodyFat: '',
    bicep: '',
    waterIntake: '',
  });
  
  const [date, setDate] = useState(new Date());
  const formattedDate = date.toLocaleDateString('en-US', { 
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  const formattedTime = date.toLocaleTimeString('en-US', { 
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  
  const handleUpdateMetrics = () => {
    // Here you would implement the logic to save the metrics
    // For now we'll just navigate back
    router.back();
  };
  
  const renderUnitSelector = (unit: string) => (
    <TouchableOpacity style={styles.unitSelector}>
      <Text style={styles.unitText}>{unit}</Text>
      <ChevronDown size={16} color="#64748B" />
    </TouchableOpacity>
  );
  
  const pageTitle = metric ? 
    `Add ${getMetricDetails(metric)?.name || metric.replace('-', ' ')}` : 
    'Log all metrics';
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.title}>{pageTitle}</Text>
      </View>
      
      <ScrollView style={styles.content}>
        {(!metric || metric === 'weight') && (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Weight</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="0"
                keyboardType="numeric"
                value={values.weight}
                onChangeText={(text) => setValues(prev => ({ ...prev, weight: text }))}
              />
              {renderUnitSelector('kg')}
            </View>
            <View style={styles.separator} />
          </View>
        )}
        
        {(!metric || metric === 'chest') && (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Chest</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="0"
                keyboardType="numeric"
                value={values.chest}
                onChangeText={(text) => setValues(prev => ({ ...prev, chest: text }))}
              />
              {renderUnitSelector('in')}
            </View>
            <View style={styles.separator} />
          </View>
        )}
        
        {(!metric || metric === 'shoulders') && (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Shoulders</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="0"
                keyboardType="numeric"
                value={values.shoulders}
                onChangeText={(text) => setValues(prev => ({ ...prev, shoulders: text }))}
              />
              {renderUnitSelector('in')}
            </View>
            <View style={styles.separator} />
          </View>
        )}
        
        {(!metric || metric === 'waist') && (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Waist</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="0"
                keyboardType="numeric"
                value={values.waist}
                onChangeText={(text) => setValues(prev => ({ ...prev, waist: text }))}
              />
              {renderUnitSelector('in')}
            </View>
            <View style={styles.separator} />
          </View>
        )}
        
        {(!metric || metric === 'thigh') && (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Thigh</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="0"
                keyboardType="numeric"
                value={values.thigh}
                onChangeText={(text) => setValues(prev => ({ ...prev, thigh: text }))}
              />
              {renderUnitSelector('in')}
            </View>
            <View style={styles.separator} />
          </View>
        )}
        
        {(!metric || metric === 'hip') && (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Hip</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="0"
                keyboardType="numeric"
                value={values.hip}
                onChangeText={(text) => setValues(prev => ({ ...prev, hip: text }))}
              />
              {renderUnitSelector('in')}
            </View>
            <View style={styles.separator} />
          </View>
        )}
        
        {(!metric || metric === 'body-fat') && (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Body Fat</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="0"
                keyboardType="numeric"
                value={values.bodyFat}
                onChangeText={(text) => setValues(prev => ({ ...prev, bodyFat: text }))}
              />
              <Text style={styles.fixedUnit}>%</Text>
            </View>
            <View style={styles.separator} />
          </View>
        )}
        
        {(!metric || metric === 'bicep') && (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Bicep</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="0"
                keyboardType="numeric"
                value={values.bicep}
                onChangeText={(text) => setValues(prev => ({ ...prev, bicep: text }))}
              />
              {renderUnitSelector('in')}
            </View>
            <View style={styles.separator} />
          </View>
        )}
        
        {(!metric || metric === 'water-intake') && (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Water intake</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="0"
                keyboardType="numeric"
                value={values.waterIntake}
                onChangeText={(text) => setValues(prev => ({ ...prev, waterIntake: text }))}
              />
              {renderUnitSelector('oz')}
            </View>
            <View style={styles.separator} />
          </View>
        )}
        
        <View style={styles.dateTimeContainer}>
          <Text style={styles.dateTimeLabel}>Date & Time</Text>
          
          <View style={styles.dateTimeRow}>
            <View style={styles.dateContainer}>
              <Calendar size={16} color="#64748B" style={styles.dateTimeIcon} />
              <Text style={styles.dateTimeText}>{formattedDate}</Text>
            </View>
            
            <View style={styles.timeContainer}>
              <Clock size={16} color="#64748B" style={styles.dateTimeIcon} />
              <Text style={styles.dateTimeText}>{formattedTime}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.updateButton}
          onPress={handleUpdateMetrics}
        >
          <Text style={styles.updateButtonText}>
            {metric ? 'Add' : 'Update'}
          </Text>
        </TouchableOpacity>
      </View>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  content: {
    flex: 1,
  },
  inputContainer: {
    paddingHorizontal: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
    marginTop: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: '#1E293B',
    paddingVertical: 8,
  },
  unitSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  unitText: {
    fontSize: 16,
    color: '#64748B',
    marginRight: 4,
  },
  fixedUnit: {
    fontSize: 16,
    color: '#64748B',
    marginHorizontal: 8,
  },
  separator: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginTop: 8,
  },
  dateTimeContainer: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  dateTimeLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 8,
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  dateTimeIcon: {
    marginRight: 8,
  },
  dateTimeText: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  updateButton: {
    backgroundColor: '#5B6EE8',
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#5B6EE8',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  updateButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});