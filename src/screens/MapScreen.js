// =============================================
//  src/screens/MapScreen.js
//  Shows nearby providers on a map.
//  Uses device GPS to find user location.
//  Privacy: providers only see approximate distance!
// =============================================

import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator,
  Alert, TouchableOpacity, FlatList, SafeAreaView
} from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { providerAPI } from '../api/client';

export default function MapScreen({ navigation }) {
  const [location,  setLocation]  = useState(null);
  const [providers, setProviders] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    getLocationAndProviders();
  }, []);

  async function getLocationAndProviders() {
    try {
      // 1. Ask for GPS permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Required',
          'Please enable location access to see nearby providers.'
        );
        setLoading(false);
        return;
      }

      // 2. Get current GPS position
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = loc.coords;
      setLocation({ latitude, longitude });

      // 3. Fetch nearby providers from our backend
      const data = await providerAPI.getNearby(latitude, longitude);
      setProviders(data.providers);

    } catch (err) {
      Alert.alert('Error', 'Could not load map data');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1a56db" />
        <Text style={styles.loadingText}>Finding your location...</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>📍 Location not available</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={getLocationAndProviders}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Map view */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude:       location.latitude,
          longitude:      location.longitude,
          latitudeDelta:  0.05,
          longitudeDelta: 0.05,
        }}
      >
        {/* Blue marker = seeker's location */}
        <Marker
          coordinate={location}
          title="You are here"
          pinColor="#1a56db"
        />

        {/* 10km radius circle — the matching zone */}
        <Circle
          center={location}
          radius={10000}
          strokeColor="rgba(26, 86, 219, 0.3)"
          fillColor="rgba(26, 86, 219, 0.05)"
        />

        {/* Green markers = nearby providers */}
        {providers.map((provider) => (
          <Marker
            key={provider.id}
            coordinate={{
              // Note: we only have approximate distance, not exact coords
              // So we place markers slightly offset for display purposes
              latitude:  location.latitude  + (Math.random() - 0.5) * 0.05,
              longitude: location.longitude + (Math.random() - 0.5) * 0.05,
            }}
            title={provider.name}
            description={`⭐ ${provider.avg_rating} • ${provider.distance_km} km away`}
            pinColor="#10b981"
          />
        ))}
      </MapView>

      {/* Provider list below the map */}
      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>
          {providers.length} provider{providers.length !== 1 ? 's' : ''} nearby
        </Text>
        <FlatList
          data={providers}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.providerCard}>
              <Text style={styles.providerEmoji}>👷</Text>
              <Text style={styles.providerName}>{item.name}</Text>
              <Text style={styles.providerDist}>📍 {item.distance_km} km</Text>
              <Text style={styles.providerRating}>⭐ {item.avg_rating?.toFixed(1) || 'New'}</Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No providers online near you right now</Text>
          }
        />
      </View>

      {/* Post request button */}
      <TouchableOpacity
        style={styles.postBtn}
        onPress={() => navigation.navigate('PostRequest', {})}
      >
        <Text style={styles.postBtnText}>+ Post a Service Request</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#fff' },
  map:          { height: '50%' },
  center:       { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText:  { marginTop: 12, color: '#6b7280' },
  errorText:    { fontSize: 16, color: '#374151', marginBottom: 16 },
  retryBtn:     { backgroundColor: '#1a56db', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  retryText:    { color: '#fff', fontWeight: '600' },
  listContainer:{ padding: 16, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  listTitle:    { fontSize: 15, fontWeight: '600', color: '#374151', marginBottom: 12 },
  providerCard: {
    backgroundColor: '#f9fafb', borderRadius: 12,
    padding: 14, marginRight: 10, alignItems: 'center', minWidth: 110,
    borderWidth: 1, borderColor: '#e5e7eb',
  },
  providerEmoji:  { fontSize: 28, marginBottom: 4 },
  providerName:   { fontSize: 13, fontWeight: '600', color: '#111', textAlign: 'center' },
  providerDist:   { fontSize: 12, color: '#6b7280', marginTop: 2 },
  providerRating: { fontSize: 12, color: '#f59e0b', marginTop: 2 },
  emptyText:      { color: '#9ca3af', fontSize: 14 },
  postBtn: {
    margin: 16, backgroundColor: '#1a56db',
    borderRadius: 14, paddingVertical: 16, alignItems: 'center',
  },
  postBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});