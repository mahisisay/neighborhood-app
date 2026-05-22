// =============================================
//  src/screens/MapScreenWrapper.js
//  Wrapper that selects the correct MapScreen based on platform
// =============================================

import React from 'react';
import { Platform } from 'react-native';

// Import both versions
import MapScreenNative from './MapScreen';
import MapScreenWeb from './MapScreenPlaceholder';

// Export the correct one based on platform
export default Platform.OS === 'web' ? MapScreenWeb : MapScreenNative;