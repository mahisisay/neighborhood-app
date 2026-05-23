// src/utils/responsive.js
// Responsive design utilities
import { Dimensions, Platform, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base design size (standard phone)
const BASE_WIDTH = 375;  // iPhone 6/7/8 width
const BASE_HEIGHT = 667;

// Scale based on screen width
export const scale = (size) => {
  return (SCREEN_WIDTH / BASE_WIDTH) * size;
};

// Vertical scale
export const verticalScale = (size) => {
  return (SCREEN_HEIGHT / BASE_HEIGHT) * size;
};

// Moderate scale (less extreme)
export const moderateScale = (size, factor = 0.5) => {
  return size + (scale(size) - size) * factor;
};

// Get number of columns based on screen width
export const getGridColumns = () => {
  if (SCREEN_WIDTH >= 800) return 4;
  if (SCREEN_WIDTH >= 600) return 3;
  return 2;
};

// Get font size based on screen
export const getFontSize = (size) => {
  const scaleFactor = Math.min(SCREEN_WIDTH / BASE_WIDTH, 1.2);
  return Math.round(size * scaleFactor);
};

// Check if device is tablet
export const isTablet = () => {
  return SCREEN_WIDTH >= 600 || (Platform.OS === 'ios' && SCREEN_HEIGHT >= 900);
};

// Get spacing based on screen
export const getSpacing = (multiplier = 1) => {
  const baseSpacing = isTablet() ? 20 : 16;
  return baseSpacing * multiplier;
};

export default {
  scale,
  verticalScale,
  moderateScale,
  getGridColumns,
  getFontSize,
  isTablet,
  getSpacing,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
};