import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  withTiming,
  interpolate,
  runOnJS,
  withDelay,
  Easing
} from 'react-native-reanimated';
import Svg, { Path, Circle, Line, Text as SvgText, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';

type DataPoint = {
  date: string;
  value: number;
};

type MetricChartProps = {
  data?: DataPoint[];
  height?: number;
  showDataPoints?: boolean;
  loading?: boolean;
};

const sampleData: DataPoint[] = [
  { date: '4/5', value: 58 },
  { date: '4/17', value: 57 },
  { date: '5/23', value: 52 },
  { date: '6/3', value: 58 },
];

export default function MetricChart({ 
  data = sampleData, 
  height = 200, 
  showDataPoints = false,
  loading = false 
}: MetricChartProps) {
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 32;
  const chartHeight = height;
  const padding = { top: 20, right: 20, bottom: 40, left: 40 };
  
  const contentWidth = chartWidth - padding.left - padding.right;
  const contentHeight = chartHeight - padding.top - padding.bottom;
  
  // Animation values
  const fadeInOpacity = useSharedValue(0);
  const lineProgress = useSharedValue(0);
  const pointsScale = useSharedValue(0);
  const loadingProgress = useSharedValue(0);
  const shimmerX = useSharedValue(-chartWidth);
  
  // Tooltip state
  const tooltipX = useSharedValue(0);
  const tooltipY = useSharedValue(0);
  const tooltipVisible = useSharedValue(0);
  const [tooltipData, setTooltipData] = useState({ value: 0, date: '' });

  useEffect(() => {
    if (loading) {
      // Reset animations for loading state
      fadeInOpacity.value = 0;
      lineProgress.value = 0;
      pointsScale.value = 0;
      
      // Start loading animations
      loadingProgress.value = withTiming(1, { 
        duration: 2000, 
        easing: Easing.inOut(Easing.ease) 
      });
      
      // Shimmer animation
      shimmerX.value = withTiming(chartWidth, {
        duration: 1500,
        easing: Easing.inOut(Easing.ease),
      }, () => {
        shimmerX.value = -chartWidth;
        if (loading) {
          shimmerX.value = withTiming(chartWidth, {
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
          });
        }
      });
    } else if (data && data.length > 0) {
      // Stop loading animations
      loadingProgress.value = withTiming(0, { duration: 300 });
      shimmerX.value = -chartWidth;
      
      // Start chart animations
      fadeInOpacity.value = withTiming(1, { 
        duration: 500, 
        easing: Easing.out(Easing.ease) 
      });
      
      lineProgress.value = withDelay(200, withTiming(1, { 
        duration: 1200, 
        easing: Easing.out(Easing.cubic) 
      }));
      
      pointsScale.value = withDelay(600, withSpring(1, { 
        damping: 15, 
        stiffness: 200 
      }));
    }
  }, [loading, data]);

  if (!data || data.length === 0) {
    return <LoadingState height={height} />;
  }

  // Calculate scales
  const values = data.map(d => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1; // Prevent division by zero
  
  // Add padding to the range for better visualization
  const paddedMin = Math.max(0, minVal - range * 0.1);
  const paddedMax = maxVal + range * 0.1;
  const paddedRange = paddedMax - paddedMin;
  
  const xScale = (i: number) => padding.left + (i / Math.max(1, data.length - 1)) * contentWidth;
  const yScale = (val: number) => padding.top + contentHeight - ((val - paddedMin) / paddedRange) * contentHeight;
  
  // Generate LINEAR path for the line (no curves)
  const generateLinearPath = () => {
    if (data.length < 2) return '';
    
    let path = '';
    const points = data.map((point, i) => ({
      x: xScale(i),
      y: yScale(point.value)
    }));
    
    // Start with the first point
    path += `M ${points[0].x},${points[0].y}`;
    
    // Draw straight lines to each subsequent point
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x},${points[i].y}`;
    }
    
    return path;
  };

  const linePath = generateLinearPath();
  
  // Generate area path for gradient fill (also linear)
  const generateLinearAreaPath = () => {
    if (data.length < 2) return '';
    
    let path = generateLinearPath();
    const lastPoint = data[data.length - 1];
    const firstPoint = data[0];
    
    // Close the path to create an area
    path += ` L ${xScale(data.length - 1)},${padding.top + contentHeight}`;
    path += ` L ${xScale(0)},${padding.top + contentHeight}`;
    path += ` Z`;
    
    return path;
  };

  const areaPath = generateLinearAreaPath();
  
  const updateTooltip = (value: number, date: string) => {
    setTooltipData({ value, date });
  };

  const gesture = Gesture.Pan()
    .onBegin((e) => {
      const touchX = Math.max(0, Math.min(contentWidth, e.x - padding.left));
      const segmentWidth = contentWidth / Math.max(1, data.length - 1);
      const index = Math.max(0, Math.min(data.length - 1, Math.round(touchX / segmentWidth)));
      
      const point = data[index];
      const x = xScale(index);
      const y = yScale(point.value);
      
      tooltipX.value = x;
      tooltipY.value = y;
      tooltipVisible.value = withSpring(1, { damping: 15, stiffness: 150 });
      
      runOnJS(updateTooltip)(point.value, point.date);
    })
    .onUpdate((e) => {
      const touchX = Math.max(0, Math.min(contentWidth, e.x - padding.left));
      const segmentWidth = contentWidth / Math.max(1, data.length - 1);
      const index = Math.max(0, Math.min(data.length - 1, Math.round(touchX / segmentWidth)));
      
      const point = data[index];
      const x = xScale(index);
      const y = yScale(point.value);
      
      tooltipX.value = withSpring(x, { damping: 20, stiffness: 300 });
      tooltipY.value = withSpring(y, { damping: 20, stiffness: 300 });
      
      runOnJS(updateTooltip)(point.value, point.date);
    })
    .onFinalize(() => {
      tooltipVisible.value = withSpring(0, { damping: 15, stiffness: 150 });
    });

  // Animated styles
  const chartContainerStyle = useAnimatedStyle(() => ({
    opacity: loading ? 0.3 : fadeInOpacity.value,
  }));

  const loadingOverlayStyle = useAnimatedStyle(() => ({
    opacity: loadingProgress.value,
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerX.value }],
  }));

  const tooltipStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: tooltipX.value - 30 },
        { translateY: tooltipY.value - 50 },
      ],
      opacity: tooltipVisible.value,
    };
  });

  const activePointStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: tooltipX.value - 6 },
        { translateY: tooltipY.value - 6 },
      ],
      opacity: tooltipVisible.value,
    };
  });
  
  return (
    <View style={styles.container}>
      {/* Chart */}
      <View style={[styles.chartContainer, { height: chartHeight }]}>
        {loading && <LoadingOverlay height={chartHeight} width={chartWidth} />}
        
        <Animated.View style={[{ width: chartWidth, height: chartHeight }, chartContainerStyle]}>
          <GestureDetector gesture={gesture}>
            <View>
              <Svg width={chartWidth} height={chartHeight}>
                <Defs>
                  <LinearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <Stop offset="0%" stopColor="#5B6EE8" stopOpacity={0.3} />
                    <Stop offset="100%" stopColor="#5B6EE8" stopOpacity={0.05} />
                  </LinearGradient>
                </Defs>
                
                {/* Grid lines */}
                <Line
                  x1={padding.left}
                  y1={padding.top + contentHeight / 3}
                  x2={padding.left + contentWidth}
                  y2={padding.top + contentHeight / 3}
                  stroke="#F1F5F9"
                  strokeWidth={1}
                />
                <Line
                  x1={padding.left}
                  y1={padding.top + (2 * contentHeight) / 3}
                  x2={padding.left + contentWidth}
                  y2={padding.top + (2 * contentHeight) / 3}
                  stroke="#F1F5F9"
                  strokeWidth={1}
                />
                
                {/* Area fill */}
                <Path
                  d={areaPath}
                  fill="url(#areaGradient)"
                />
                
                {/* Main line - now linear instead of curved */}
                <Path
                  d={linePath}
                  fill="none"
                  stroke="#5B6EE8"
                  strokeWidth={3}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                
                {/* Data points */}
                {(showDataPoints || data.length <= 4) && data.map((point, i) => (
                  <Circle
                    key={i}
                    cx={xScale(i)}
                    cy={yScale(point.value)}
                    r={4}
                    fill="#FFFFFF"
                    stroke="#5B6EE8"
                    strokeWidth={2}
                  />
                ))}
                
                {/* Y-axis labels */}
                <SvgText
                  x={padding.left - 8}
                  y={padding.top + 5}
                  fontSize="12"
                  fill="#94A3B8"
                  textAnchor="end"
                >
                  {Math.round(paddedMax)}
                </SvgText>
                <SvgText
                  x={padding.left - 8}
                  y={padding.top + contentHeight / 2 + 5}
                  fontSize="12"
                  fill="#94A3B8"
                  textAnchor="end"
                >
                  {Math.round((paddedMax + paddedMin) / 2)}
                </SvgText>
                <SvgText
                  x={padding.left - 8}
                  y={padding.top + contentHeight + 5}
                  fontSize="12"
                  fill="#94A3B8"
                  textAnchor="end"
                >
                  {Math.round(paddedMin)}
                </SvgText>
                
                {/* X-axis labels */}
                {data.map((point, i) => (
                  <SvgText
                    key={i}
                    x={xScale(i)}
                    y={chartHeight - 8}
                    fontSize="12"
                    fill="#94A3B8"
                    textAnchor="middle"
                  >
                    {point.date}
                  </SvgText>
                ))}
              </Svg>

              {/* Active point indicator */}
              <Animated.View style={[styles.activePoint, activePointStyle]} />

              {/* Tooltip */}
              <Animated.View style={[styles.tooltip, tooltipStyle]}>
                <Text style={styles.tooltipText}>
                  {tooltipData.value} kg
                </Text>
                <Text style={styles.tooltipDate}>
                  {tooltipData.date}
                </Text>
              </Animated.View>
            </View>
          </GestureDetector>
        </Animated.View>
      </View>
    </View>
  );
}

function LoadingState({ height }: { height: number }) {
  return (
    <View style={[styles.loadingChart, { height }]}>
      <Text style={styles.loadingText}>Loading chart...</Text>
    </View>
  );
}

function LoadingOverlay({ height, width }: { height: number; width: number }) {
  const shimmerX = useSharedValue(-width);
  
  useEffect(() => {
    const animate = () => {
      shimmerX.value = withTiming(width, {
        duration: 1500,
        easing: Easing.inOut(Easing.ease),
      }, () => {
        shimmerX.value = -width;
        animate();
      });
    };
    animate();
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerX.value }],
  }));

  return (
    <View style={[styles.loadingOverlay, { height, width }]}>
      {/* Skeleton chart structure */}
      <View style={styles.skeletonContainer}>
        {/* Skeleton lines */}
        <View style={[styles.skeletonLine, { top: height * 0.2 }]} />
        <View style={[styles.skeletonLine, { top: height * 0.5 }]} />
        <View style={[styles.skeletonLine, { top: height * 0.8 }]} />
        
        {/* Skeleton data points */}
        <View style={[styles.skeletonPoint, { left: width * 0.2, top: height * 0.3 }]} />
        <View style={[styles.skeletonPoint, { left: width * 0.4, top: height * 0.6 }]} />
        <View style={[styles.skeletonPoint, { left: width * 0.6, top: height * 0.4 }]} />
        <View style={[styles.skeletonPoint, { left: width * 0.8, top: height * 0.7 }]} />
      </View>
      
      {/* Shimmer effect */}
      <Animated.View style={[styles.shimmer, shimmerStyle, { height }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  chartContainer: {
    width: '100%',
    position: 'relative',
  },
  activePoint: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#5B6EE8',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#5B6EE8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 60,
    alignItems: 'center',
  },
  tooltipText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  tooltipDate: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  loadingChart: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    overflow: 'hidden',
  },
  skeletonContainer: {
    flex: 1,
    position: 'relative',
  },
  skeletonLine: {
    position: 'absolute',
    left: 40,
    right: 20,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  skeletonPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    width: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    opacity: 0.7,
  },
});