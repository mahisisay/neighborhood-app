// =============================================
//  src/screens/MapScreen.native.js
//  Shows nearby providers on Google Maps
// =============================================

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  ActivityIndicator, TouchableOpacity, Alert,
  Dimensions
} from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { providerAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

const BRAND = {
  primary: '#2E7D32',
  primaryDark: '#1B5E20',
  primaryLight: '#E8F5E9',
  secondary: '#F9A825',
  text: '#374151',
  textLight: '#6B7280',
  white: '#FFFFFF',
  error: '#DC2626',
  success: '#10B981',
};

export default function MapScreen() {
  const { user } = useAuth();
  const { theme } = useSettings();
  const mapRef = useRef(null);
  const [region, setRegion] = useState(null);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  const isDark = theme === 'dark';

  useEffect(() => {
    getCurrentLocation();
  }, []);

  async function getCurrentLocation() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location access is needed to see nearby providers');
        setLoading(false);
        return;
      }
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
      
      setRegion(newRegion);
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
      
      await loadNearbyProviders(location.coords.latitude, location.coords.longitude);
    } catch (error) {
      console.log('Location error:', error);
      Alert.alert('Error', 'Could not get your location');
      setLoading(false);
    }
  }

  async function loadNearbyProviders(lat, lon) {
    try {
      const data = await providerAPI.getNearby(lat, lon);
      setProviders(data.providers || []);
    } catch (err) {
      console.log('Error loading providers:', err);
      Alert.alert('Error', 'Could not load nearby providers');
    } finally {
      setLoading(false);
    }
  }

  function onRegionChangeComplete(newRegion) {
    setRegion(newRegion);
    loadNearbyProviders(newRegion.latitude, newRegion.longitude);
  }

  function focusOnUserLocation() {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 1000);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F9FAFB' }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND.primary} />
          <Text style={[styles.loadingText, { color: isDark ? '#AAA' : BRAND.textLight }]}>
            Loading nearby providers...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!region) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F9FAFB' }]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>📍</Text>
          <Text style={[styles.errorText, { color: isDark ? '#FFF' : BRAND.text }]}>
            Unable to get your location
          </Text>
          <TouchableOpacity 
            style={[styles.retryBtn, { backgroundColor: BRAND.primary }]} 
            onPress={getCurrentLocation}
          >
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={region}
        onRegionChangeComplete={onRegionChangeComplete}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
      >
        {/* 10km Radius Circle around user */}
        {userLocation && (
          <Circle
            center={userLocation}
            radius={10000}
            strokeColor={BRAND.primary}
            fillColor="rgba(46, 125, 50, 0.1)"
            strokeWidth={2}
          />
        )}

        {/* Provider Markers */}
        {providers.map(provider => (
          <Marker
            key={provider.id}
            coordinate={{
              latitude: provider.latitude,
              longitude: provider.longitude
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

      {/* My Location Button */}
      <TouchableOpacity 
        style={[styles.myLocationBtn, { backgroundColor: isDark ? '#1E1E1E' : BRAND.white }]}
        onPress={focusOnUserLocation}
      >
        <Text style={styles.myLocationIcon}>📍</Text>
      </TouchableOpacity>

      {/* Provider Info Card (when selected) */}
      {selectedProvider && (
        <View style={[styles.infoCard, { backgroundColor: isDark ? '#1E1E1E' : BRAND.white }]}>
          <View style={styles.infoHeader}>
            <View style={styles.infoHeaderLeft}>
              <Text style={styles.infoIcon}>👷</Text>
              <Text style={[styles.infoName, { color: isDark ? '#FFF' : BRAND.text }]}>
                {selectedProvider.name}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setSelectedProvider(null)}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.infoDetails}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📍 Distance:</Text>
              <Text style={[styles.infoValue, { color: BRAND.secondary }]}>
                {selectedProvider.distance_km} km away
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>⭐ Rating:</Text>
              <Text style={[styles.infoValue, { color: isDark ? '#FFF' : BRAND.text }]}>
                {selectedProvider.avg_rating || 'New'} / 5
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📊 Status:</Text>
              <Text style={[styles.infoValue, { color: selectedProvider.is_online ? BRAND.success : BRAND.error }]}>
                {selectedProvider.is_online ? '🟢 Online' : '⚫ Offline'}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Legend */}
      <View style={[styles.legend, { backgroundColor: isDark ? '#1E1E1E' : BRAND.white }]}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: BRAND.primary }]} />
          <Text style={[styles.legendText, { color: isDark ? '#FFF' : BRAND.text }]}>
            10km Search Radius
          </Text>
        </View>
        <View style={styles.legendItem}>
          <Text style={styles.legendIcon}>👷</Text>
          <Text style={[styles.legendText, { color: isDark ? '#FFF' : BRAND.text }]}>
            Available Provider
          </Text>
        </View>
      </View>
    </View>
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
  
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E7D32',
    borderRadius: 20,
    padding: 6,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  markerIcon: { fontSize: 18 },
  
  myLocationBtn: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  myLocationIcon: { fontSize: 24 },
  
  infoCard: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoIcon: { fontSize: 28 },
  infoName: { fontSize: 18, fontWeight: 'bold' },
  closeIcon: { fontSize: 20, color: '#9CA3AF', padding: 4 },
  infoDetails: { marginBottom: 16 },
  infoRow: { flexDirection: 'row', marginBottom: 6 },
  infoLabel: { width: 70, fontSize: 13, color: '#6B7280' },
  infoValue: { flex: 1, fontSize: 13, fontWeight: '500' },
  
  legend: {
    position: 'absolute',
    top: 60,
    right: 16,
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  legendDot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  legendIcon: { fontSize: 14, marginRight: 8 },
  legendText: { fontSize: 11 },
});