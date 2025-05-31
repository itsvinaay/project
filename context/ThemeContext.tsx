import React, { createContext, useContext, ReactNode } from 'react';
import { Colors } from '@/constants/Colors';
import { 
  Spacing,
  BorderRadius,
  FontSize,
  LineHeight,
  FontWeight,
  FontFamily
} from '@/constants/Spacing';

// Theme context type
type ThemeContextType = {
  colors: typeof Colors;
  spacing: typeof Spacing;
  borderRadius: typeof BorderRadius;
  fontSize: typeof FontSize;
  lineHeight: typeof LineHeight;
  fontWeight: typeof FontWeight;
  fontFamily: typeof FontFamily;
};

// Create context with default values
const ThemeContext = createContext<ThemeContextType>({
  colors: Colors,
  spacing: Spacing,
  borderRadius: BorderRadius,
  fontSize: FontSize,
  lineHeight: LineHeight,
  fontWeight: FontWeight,
  fontFamily: FontFamily,
});

// Theme provider props
type ThemeProviderProps = {
  children: ReactNode;
};

// Theme provider component
export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  // Theme value
  const theme: ThemeContextType = {
    colors: Colors,
    spacing: Spacing,
    borderRadius: BorderRadius,
    fontSize: FontSize,
    lineHeight: LineHeight,
    fontWeight: FontWeight,
    fontFamily: FontFamily,
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme
export const useTheme = () => useContext(ThemeContext);