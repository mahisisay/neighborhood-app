// =============================================
//  src/screens/PostRequestScreen.js
//  Seeker fills out a form to post a job request.
//  UPDATED: Accepts subcategory from HomeScreen
// =============================================

import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert, ScrollView,
  ActivityIndicator
} from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { requestAPI, subcategoryAPI } from '../api/client';

const ICON_MAP = {
  wrench: '🔧', zap: '⚡', droplet: '💧', book: '📚',
  smartphone: '📱', wind: '🧹', truck: '🚛', brush: '🖌️',
};

export default function PostRequestScreen({ navigation, route }) {
  const preselectedCategory = route.params?.category || null;
  const preselectedSubcategory = route.params?.subcategory_name || null;
  const preselectedCategoryId = route.params?.category_id || null;
  const preselectedSubcategoryId = route.params?.subcategory_id || null;

  const [categories,   setCategories]   = useState([]);
  const [selectedCat,  setSelectedCat]  = useState(null);
  const [selectedSubcat, setSelectedSubcat] = useState(null);
  const [description,  setDescription]  = useState('');
  const [photoUri,     setPhotoUri]     = useState(null);
  const [location,     setLocation]     = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [locLoading,   setLocLoading]   = useState(true);

  useEffect(() => {
    loadCategories();
    getLocation();
    
    // Set preselected values if coming from HomeScreen
    if (preselectedCategoryId && preselectedSubcategoryId) {
      setSelectedCat({ id: preselectedCategoryId, name: route.params?.category_name });
      setSelectedSubcat({ id: preselectedSubcategoryId, name: preselectedSubcategory });
    } else if (preselectedCategory) {
      setSelectedCat(preselectedCategory);
    }
  }, []);

  async function loadCategories() {
    try {
      const data = await requestAPI.getCategories();
      setCategories(data.categories || []);
    } catch (err) {
      console.log('Could not load categories');
    }
  }

  async function getLocation() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location needed', 'We need your location to find nearby providers.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    } catch (err) {
      Alert.alert('Error', 'Could not get your location');
    } finally {
      setLocLoading(false);
    }
  }

  async function pickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  }

  async function handleSubmit() {
    if (!selectedCat) {
      Alert.alert('Select Category', 'Please select a service category');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Add Description', 'Please describe what you need');
      return;
    }
    if (!location) {
      Alert.alert('Location Required', 'We need your location to match providers');
      return;
    }

    setLoading(true);
    try {
      const data = await requestAPI.create({
        category_id: selectedCat.id,
        description:  description.trim(),
        latitude:     location.latitude,
        longitude:    location.longitude,
      });

      Alert.alert(
        'Request Posted! 🎉',
        `${data.nearbyProvidersNotified} provider(s) have been notified near you!`,
        [
          { 
            text: 'View My Requests', 
            onPress: () => {
              if (navigation) navigation.navigate('MyRequests');
              else Alert.alert('Navigation error', 'Could not go to My Requests');
            }
          }
        ]
      );
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner}>
        <Text style={styles.title}>Post a Request 📋</Text>
        <Text style={styles.subtitle}>Tell us what you need help with</Text>

        {/* Selected Category Display */}
        {selectedCat && (
          <View style={styles.selectedBox}>
            <Text style={styles.selectedLabel}>Selected Service:</Text>
            <Text style={styles.selectedValue}>
              {selectedSubcat ? `${selectedCat.name} → ${selectedSubcat.name}` : selectedCat.name}
            </Text>
          </View>
        )}

        <Text style={styles.label}>Service Category *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.catChip, selectedCat?.id === cat.id && styles.catChipActive]}
              onPress={() => {
                setSelectedCat(cat);
                setSelectedSubcat(null);
              }}
            >
              <Text style={styles.catIcon}>{ICON_MAP[cat.icon] || '🔨'}</Text>
              <Text style={[styles.catText, selectedCat?.id === cat.id && styles.catTextActive]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Describe Your Problem *</Text>
        <TextInput
          style={styles.textarea}
          placeholder="e.g. My kitchen pipe is leaking near the sink. Need urgent repair."
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
          textAlignVertical="top"
        />

        <Text style={styles.label}>Add a Photo (Optional)</Text>
        <TouchableOpacity style={styles.photoBtn} onPress={pickPhoto}>
          <Text style={styles.photoBtnText}>
            {photoUri ? '✅ Photo Selected' : '📷 Choose Photo'}
          </Text>
        </TouchableOpacity>

        <View style={styles.locationRow}>
          <Text style={styles.label}>Your Location</Text>
          {locLoading
            ? <ActivityIndicator size="small" color="#1a56db" />
            : <Text style={styles.locationStatus}>
                {location ? '✅ Location detected' : '❌ Location not available'}
              </Text>
          }
        </View>

        <View style={styles.feeBox}>
          <Text style={styles.feeTitle}>💳 Fee Information</Text>
          <Text style={styles.feeText}>
            After a provider accepts your request, you will pay a 100 ETB commitment fee to unlock their contact details.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.btn, loading && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>Post Request</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#fff' },
  inner:       { padding: 20, gap: 12 },
  title:       { fontSize: 24, fontWeight: 'bold', color: '#111' },
  subtitle:    { fontSize: 14, color: '#6b7280', marginBottom: 4 },
  label:       { fontSize: 14, fontWeight: '600', color: '#374151' },
  selectedBox: { backgroundColor: '#eff6ff', borderRadius: 12, padding: 12, marginBottom: 8 },
  selectedLabel: { fontSize: 12, color: '#1a56db', marginBottom: 4 },
  selectedValue: { fontSize: 16, fontWeight: '600', color: '#1a56db' },
  catScroll:   { marginBottom: 4 },
  catChip: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#e5e7eb',
    borderRadius: 20, paddingHorizontal: 14,
    paddingVertical: 8, marginRight: 8,
    backgroundColor: '#f9fafb',
  },
  catChipActive: { borderColor: '#1a56db', backgroundColor: '#eff6ff' },
  catIcon:       { fontSize: 16, marginRight: 6 },
  catText:       { fontSize: 13, color: '#374151' },
  catTextActive: { color: '#1a56db', fontWeight: '600' },
  textarea: {
    borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 12,
    fontSize: 15, backgroundColor: '#f9fafb', minHeight: 100,
  },
  photoBtn: {
    borderWidth: 2, borderColor: '#d1d5db', borderStyle: 'dashed',
    borderRadius: 12, paddingVertical: 16, alignItems: 'center',
  },
  photoBtnText: { color: '#6b7280', fontSize: 15 },
  locationRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  locationStatus:{ fontSize: 13, color: '#10b981' },
  feeBox: {
    backgroundColor: '#fef3c7', borderRadius: 12,
    padding: 14, borderLeftWidth: 4, borderLeftColor: '#f59e0b',
  },
  feeTitle: { fontSize: 14, fontWeight: '600', color: '#92400e', marginBottom: 4 },
  feeText:  { fontSize: 13, color: '#92400e', lineHeight: 18 },
  btn: {
    backgroundColor: '#1a56db', borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginTop: 8,
  },
  btnText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
});