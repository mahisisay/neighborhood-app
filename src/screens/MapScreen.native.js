// =============================================
//  src/screens/MapScreen.native.js
//  BRAND COLORS: Ethiopian Green (#2E7D32) + Gold (#F9A825)
//  Shows nearby providers on Google Maps
// =============================================

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  ActivityIndicator, TouchableOpacity, Alert
} from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { providerAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';

const BRAND = {
  primary: '#2E7D32',
  primaryLight: '#E8F5E9',
  secondary: '#F9A825',
  text: '#374151',
  textLight: '#6B7280',
  white: '#FFFFFF',
};

export default function MapScreen() {
  const { user } = useAuth();
  const mapRef = useRef(null);
  const [region, setRegion] = useState(null);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  async function getCurrentLocation() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location access is needed to see nearby providers');
        return;
      }
      
      const location = await Location.getCurrentPositionAsync({});
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
      setRegion(newRegion);
      loadNearbyProviders(location.coords.latitude, location.coords.longitude);
    } catch (error) {
      console.log('Location error:', error);
      setLoading(false);
    }
  }

  async function loadNearbyProviders(lat, lon) {
    try {
      const data = await providerAPI.getNearby(lat, lon);
      setProviders(data.providers || []);
    } catch (err) {
      console.log('Error loading providers:', err);
    } finally {
      setLoading(false);
    }
  }

  function onRegionChangeComplete(newRegion) {
    setRegion(newRegion);
    loadNearbyProviders(newRegion.latitude, newRegion.longitude);
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: BRAND.white }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND.primary} />
          <Text style={[styles.loadingText, { color: BRAND.textLight }]}>Loading nearby providers...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!region) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: BRAND.white }]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>📍</Text>
          <Text style={[styles.errorText, { color: BRAND.text }]}>Unable to get your location</Text>
          <TouchableOpacity style={[styles.retryBtn, { backgroundColor: BRAND.primary }]} onPress={getCurrentLocation}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={region}
        onRegionChangeComplete={onRegionChangeComplete}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {/* 10km Radius Circle */}
        <Circle
          center={{ latitude: region.latitude, longitude: region.longitude }}
          radius={10000}
          strokeColor={BRAND.primary}
          fillColor="rgba(46, 125, 50, 0.1)"
          strokeWidth={2}
        />

        {/* Provider Markers */}
        {providers.map(provider => (
          <Marker
            key={provider.id}
            coordinate={{
              latitude: parseFloat(provider.latitude),
              longitude: parseFloat(provider.longitude)
            }}
            onPress={() => setSelectedProvider(provider)}
            title={provider.name}
            description={`${provider.distance_km} km away`}
          >
            <View style={styles.markerContainer}>
              <Text style={styles.markerIcon}>👷</Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Info Card for Selected Provider */}
      {selectedProvider && (
        <View style={[styles.infoCard, { backgroundColor: BRAND.white }]}>
          <View style={styles.infoHeader}>
            <Text style={[styles.infoName, { color: BRAND.primary }]}>{selectedProvider.name}</Text>
            <TouchableOpacity onPress={() => setSelectedProvider(null)}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.infoDistance, { color: BRAND.secondary }]}>
            📍 {selectedProvider.distance_km} km away
          </Text>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingStar}>⭐</Text>
            <Text style={[styles.ratingText, { color: BRAND.text }]}>{selectedProvider.avg_rating || 'New'}</Text>
          </View>
          <Text style={[styles.infoHint, { color: BRAND.textLight }]}>
            {selectedProvider.is_online ? '🟢 Currently Online' : '⚫ Offline'}
          </Text>
        </View>
      )}

      {/* Legend */}
      <View style={[styles.legend, { backgroundColor: BRAND.white }]}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: BRAND.primary }]} />
          <Text style={[styles.legendText, { color: BRAND.text }]}>10km Search Radius</Text>
        </View>
        <View style={styles.legendItem}>
          <Text style={styles.legendIcon}>👷</Text>
          <Text style={[styles.legendText, { color: BRAND.text }]}>Available Provider</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorIcon: { fontSize: 48, marginBottom: 16 },
  errorText: { fontSize: 16, marginBottom: 20 },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  retryBtnText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  markerContainer: { backgroundColor: '#2E7D32', borderRadius: 20, padding: 6, borderWidth: 2, borderColor: '#FFF' },
  markerIcon: { fontSize: 16 },
  infoCard: { position: 'absolute', bottom: 20, left: 16, right: 16, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
  infoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  infoName: { fontSize: 18, fontWeight: 'bold' },
  closeIcon: { fontSize: 20, color: '#9CA3AF', padding: 4 },
  infoDistance: { fontSize: 14, marginBottom: 8 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  ratingStar: { fontSize: 14 },
  ratingText: { fontSize: 13 },
  infoHint: { fontSize: 12, marginTop: 4 },
  legend: { position: 'absolute', top: 60, right: 16, borderRadius: 12, padding: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  legendDot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  legendIcon: { fontSize: 14, marginRight: 8 },
  legendText: { fontSize: 12 },
});