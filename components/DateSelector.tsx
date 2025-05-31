import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Dimensions 
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import dayjs from 'dayjs';

interface DateSelectorProps {
  onDateSelect: (date: Date) => void;
  initialDate?: Date;
  numberOfDays?: number;
}

export default function DateSelector({ 
  onDateSelect, 
  initialDate = new Date(), 
  numberOfDays = 14 
}: DateSelectorProps) {
  const theme = useTheme();
  const flatListRef = useRef<FlatList>(null);
  
  // Generate array of dates
  const generateDates = () => {
    const dates = [];
    const today = dayjs();
    
    // Include past 7 days and future days to total numberOfDays
    for (let i = -7; i < numberOfDays - 7; i++) {
      dates.push(today.add(i, 'day').toDate());
    }
    
    return dates;
  };
  
  const [dates] = useState(generateDates());
  const [selectedDate, setSelectedDate] = useState(initialDate);
  
  // Format date for display
  const formatDate = (date: Date) => {
    const d = dayjs(date);
    return {
      day: d.format('D'),
      weekday: d.format('ddd'),
      isToday: d.isSame(dayjs(), 'day'),
    };
  };
  
  // Select a date
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    onDateSelect(date);
  };
  
  // Calculate item width based on screen width
  const itemWidth = Dimensions.get('window').width / 5;
  
  // Scroll to today on initial render
  useEffect(() => {
    const todayIndex = dates.findIndex(date => 
      dayjs(date).isSame(dayjs(), 'day')
    );
    
    if (todayIndex !== -1 && flatListRef.current) {
      flatListRef.current.scrollToIndex({
        index: todayIndex,
        animated: false,
        viewPosition: 0.5,
      });
    }
  }, []);
  
  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={dates}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => {
          const formattedDate = formatDate(item);
          const isSelected = dayjs(selectedDate).isSame(dayjs(item), 'day');
          
          return (
            <TouchableOpacity
              style={[
                styles.dateItem,
                { width: itemWidth },
                isSelected && { 
                  backgroundColor: theme.colors.primary[500],
                  borderColor: theme.colors.primary[300],
                }
              ]}
              onPress={() => handleDateSelect(item)}
            >
              <Text 
                style={[
                  styles.weekday,
                  { 
                    color: isSelected 
                      ? theme.colors.white 
                      : theme.colors.text.secondary,
                    fontFamily: theme.fontFamily.regular
                  }
                ]}
              >
                {formattedDate.weekday}
              </Text>
              <View 
                style={[
                  styles.dayContainer,
                  formattedDate.isToday && !isSelected && { 
                    borderColor: theme.colors.primary[500] 
                  }
                ]}
              >
                <Text 
                  style={[
                    styles.day,
                    { 
                      color: isSelected 
                        ? theme.colors.white 
                        : formattedDate.isToday 
                          ? theme.colors.primary[500] 
                          : theme.colors.text.primary,
                      fontFamily: theme.fontFamily.semiBold
                    }
                  ]}
                >
                  {formattedDate.day}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        keyExtractor={(item) => item.toISOString()}
        onScrollToIndexFailed={info => {
          const wait = new Promise(resolve => setTimeout(resolve, 500));
          wait.then(() => {
            if (flatListRef.current) {
              flatListRef.current.scrollToIndex({ 
                index: info.index, 
                animated: true,
                viewPosition: 0.5
              });
            }
          });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  dateItem: {
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  weekday: {
    fontSize: 12,
    marginBottom: 4,
  },
  dayContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  day: {
    fontSize: 16,
    fontWeight: '600',
  },
});