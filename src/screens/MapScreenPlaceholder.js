// =============================================
//  src/screens/MapScreenPlaceholder.js
//  Web placeholder for MapScreen
//  Maps only work on mobile devices
// =============================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MapScreenPlaceholder() {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🗺️</Text>
      <Text style={styles.title}>Map View</Text>
      <Text style={styles.message}>
        Maps are only available on mobile devices.
      </Text>
      <Text style={styles.note}>
        Please open this app on your Android phone to see nearby providers.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 20,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 4,
  },
  note: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
});