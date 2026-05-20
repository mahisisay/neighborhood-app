// src/screens/MapScreenPlaceholder.js – for web only
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';

export default function MapScreenPlaceholder({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>🗺️</Text>
        <Text style={styles.title}>Map View</Text>
        <Text style={styles.description}>
          Maps are available only on mobile devices.{'\n'}
          Please use the Expo Go app on your phone to see nearby providers.
        </Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  icon: { fontSize: 64, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: '#111' },
  description: { fontSize: 14, textAlign: 'center', marginBottom: 30, color: '#666', lineHeight: 20 },
  button: { backgroundColor: '#1a56db', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});