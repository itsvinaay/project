import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Droplet, Plus, Minus } from 'lucide-react-native';

interface WaterCardProps {
  current: number;
  goal: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

export default function WaterCard({ 
  current, 
  goal, 
  onIncrement, 
  onDecrement 
}: WaterCardProps) {
  const theme = useTheme();
  
  // Calculate percentage of goal
  const percentage = Math.min(Math.round((current / goal) * 100), 100);
  
  // Generate water glass elements
  const renderWaterGlasses = () => {
    const glasses = [];
    const filled = Math.min(current, goal);
    
    for (let i = 0; i < goal; i++) {
      glasses.push(
        <View 
          key={i} 
          style={[
            styles.glass, 
            i < filled 
              ? { backgroundColor: theme.colors.primary[500] } 
              : { backgroundColor: theme.colors.dark[700] }
          ]}
        >
          <Droplet 
            size={16} 
            color={i < filled ? theme.colors.white : theme.colors.dark[500]} 
          />
        </View>
      );
    }
    
    return glasses;
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.card }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { 
          color: theme.colors.text.primary,
          fontFamily: theme.fontFamily.semiBold
        }]}>
          Water Intake
        </Text>
        <View style={styles.goalContainer}>
          <Text style={[styles.goalText, { 
            color: theme.colors.text.secondary,
            fontFamily: theme.fontFamily.regular
          }]}>
            Goal: {goal} glasses
          </Text>
        </View>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.waterInfoContainer}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary[900] }]}>
            <Droplet size={24} color={theme.colors.primary[500]} />
          </View>
          <View style={styles.waterTextContainer}>
            <Text style={[styles.waterValue, { 
              color: theme.colors.primary[500],
              fontFamily: theme.fontFamily.semiBold
            }]}>
              {current} / {goal}
            </Text>
            <Text style={[styles.waterLabel, { 
              color: theme.colors.text.secondary,
              fontFamily: theme.fontFamily.regular
            }]}>
              glasses today
            </Text>
          </View>
        </View>
        
        <View style={styles.controlsContainer}>
          <TouchableOpacity 
            style={[styles.controlButton, { backgroundColor: theme.colors.dark[700] }]}
            onPress={onDecrement}
            disabled={current <= 0}
          >
            <Minus size={16} color={current <= 0 ? theme.colors.dark[500] : theme.colors.white} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.controlButton, { backgroundColor: theme.colors.primary[500] }]}
            onPress={onIncrement}
          >
            <Plus size={16} color={theme.colors.white} />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.progressContainer}>
        <View style={[styles.progressBackground, { backgroundColor: theme.colors.dark[700] }]}>
          <View 
            style={[
              styles.progressFill, 
              { 
                backgroundColor: theme.colors.primary[500],
                width: `${percentage}%` 
              }
            ]}
          />
        </View>
        <Text style={[styles.progressText, { 
          color: theme.colors.text.secondary,
          fontFamily: theme.fontFamily.medium
        }]}>
          {percentage}% of daily goal
        </Text>
      </View>
      
      <View style={styles.glassesContainer}>
        {renderWaterGlasses()}
      </View>
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
  goalContainer: {
    backgroundColor: 'rgba(0, 191, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  goalText: {
    fontSize: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  waterInfoContainer: {
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
  waterTextContainer: {
    justifyContent: 'center',
  },
  waterValue: {
    fontSize: 18,
  },
  waterLabel: {
    fontSize: 12,
  },
  controlsContainer: {
    flexDirection: 'row',
  },
  controlButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBackground: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
  glassesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  glass: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
  },
});