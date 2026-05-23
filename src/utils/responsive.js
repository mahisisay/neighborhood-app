// =============================================
//  src/utils/responsive.js
//  Responsive design utilities for all screens
//  Makes app adapt to different screen sizes
// =============================================

import { Dimensions, Platform, PixelRatio } from 'react-native';

// Get screen dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base design size (standard phone - iPhone 6/7/8)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 667;

// =============================================
//  SCALE FUNCTIONS
// =============================================

// Scale width - for horizontal spacing, widths
export const scale = (size) => {
  return (SCREEN_WIDTH / BASE_WIDTH) * size;
};

// Scale height - for vertical spacing, heights
export const verticalScale = (size) => {
  return (SCREEN_HEIGHT / BASE_HEIGHT) * size;
};

// Moderate scale - less extreme (good for fonts, padding)
export const moderateScale = (size, factor = 0.5) => {
  return size + (scale(size) - size) * factor;
};

// =============================================
//  GRID FUNCTIONS
// =============================================

// Get number of columns based on screen width
export const getGridColumns = () => {
  if (SCREEN_WIDTH >= 800) return 4;      // Tablet landscape
  if (SCREEN_WIDTH >= 600) return 3;      // Tablet portrait
  if (SCREEN_WIDTH >= 400) return 2;      // Large phone
  return 2;                                // Standard phone
};

// Get card width based on screen width and number of columns
export const getCardWidth = (columns = 2, gap = 12) => {
  const totalGap = gap * (columns - 1);
  const availableWidth = SCREEN_WIDTH - (gap * 2); // minus horizontal padding
  return (availableWidth - totalGap) / columns;
};

// =============================================
//  TYPOGRAPHY FUNCTIONS
// =============================================

// Get responsive font size
export const getFontSize = (size) => {
  const scaleFactor = Math.min(SCREEN_WIDTH / BASE_WIDTH, 1.2);
  return Math.round(size * scaleFactor);
};

// Get responsive line height
export const getLineHeight = (fontSize, multiplier = 1.4) => {
  return Math.round(fontSize * multiplier);
};

// =============================================
//  SPACING FUNCTIONS
// =============================================

// Get responsive spacing
export const getSpacing = (multiplier = 1) => {
  const baseSpacing = SCREEN_WIDTH >= 600 ? 20 : 16;
  return baseSpacing * multiplier;
};

// Get responsive padding
export const getPadding = (size = 'medium') => {
  const paddings = {
    small: moderateScale(8),
    medium: moderateScale(16),
    large: moderateScale(24),
    xlarge: moderateScale(32),
  };
  return paddings[size] || paddings.medium;
};

// =============================================
//  DEVICE DETECTION
// =============================================

// Check if device is tablet
export const isTablet = () => {
  return SCREEN_WIDTH >= 600 || (Platform.OS === 'ios' && SCREEN_HEIGHT >= 900);
};

// Check if device is small phone
export const isSmallPhone = () => {
  return SCREEN_WIDTH < 375;
};

// Check if device is large phone
export const isLargePhone = () => {
  return SCREEN_WIDTH >= 400 && SCREEN_WIDTH < 600;
};

// =============================================
//  BORDER RADIUS
// =============================================

export const getBorderRadius = (size = 'medium') => {
  const radii = {
    small: moderateScale(8),
    medium: moderateScale(12),
    large: moderateScale(16),
    xlarge: moderateScale(24),
    round: moderateScale(999),
  };
  return radii[size] || radii.medium;
};

// =============================================
//  SHADOW
// =============================================

export const getShadow = (level = 1) => {
  const shadows = {
    1: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    2: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    3: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
    },
  };
  return shadows[level] || shadows[2];
};

// =============================================
//  EXPORTS
// =============================================

export default {
  scale,
  verticalScale,
  moderateScale,
  getGridColumns,
  getCardWidth,
  getFontSize,
  getLineHeight,
  getSpacing,
  getPadding,
  isTablet,
  isSmallPhone,
  isLargePhone,
  getBorderRadius,
  getShadow,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
};