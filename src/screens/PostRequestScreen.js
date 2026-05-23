// =============================================
//  src/screens/PostRequestScreen.js
//  UPDATED: Now sends subcategory_id to backend for correct matching
//  Fixed: Providers will only receive jobs that match their services
// =============================================

import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert, ScrollView,
  ActivityIndicator
} from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { requestAPI } from '../api/client';
import { getDescriptionError } from '../utils/validation';

const BRAND = {
  primary: '#2E7D32',
  primaryLight: '#E8F5E9',
  secondary: '#F9A825',
  text: '#374151',
  textLight: '#6B7280',
  white: '#FFFFFF',
  error: '#DC2626',
  success: '#10B981',
};

const ICON_MAP = {
  wrench: '🔧', zap: '⚡', droplet: '💧', book: '📚',
  smartphone: '📱', wind: '🧹', truck: '🚛', brush: '🖌️',
};

export default function PostRequestScreen({ navigation, route }) {
  const preselectedCategory = route.params?.category || null;
  const preselectedSubcategory = route.params?.subcategory_name || null;
  const preselectedCategoryId = route.params?.category_id || null;
  const preselectedSubcategoryId = route.params?.subcategory_id || null;

  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);
  const [selectedSubcat, setSelectedSubcat] = useState(null);
  const [description, setDescription] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [photoUri, setPhotoUri] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(true);

  useEffect(() => {
    loadCategories();
    getLocation();
    
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

  function handleDescriptionChange(text) {
    setDescription(text);
    const error = getDescriptionError(text);
    setDescriptionError(error || '');
  }

  async function handleSubmit() {
    if (!selectedCat) {
      Alert.alert('Select Category', 'Please select a service category');
      return;
    }
    
    // Make sure subcategory is selected
    if (!selectedSubcat) {
      Alert.alert('Select Service', 'Please select a specific service type');
      return;
    }
    
    if (descriptionError) {
      Alert.alert('Invalid Description', descriptionError);
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
      // FIXED: Now sending subcategory_id to backend
      const data = await requestAPI.create({
        category_id: selectedCat.id,
        subcategory_id: selectedSubcat.id,  // ← ADDED: This ensures correct matching
        description: description.trim(),
        latitude: location.latitude,
        longitude: location.longitude,
      });

      Alert.alert(
        'Request Posted! 🎉',
        `${data.nearbyProvidersNotified} provider(s) have been notified near you!`,
        [{ text: 'View My Requests', onPress: () => navigation.navigate('MyRequests') }]
      );
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: BRAND.white }]}>
      <ScrollView contentContainerStyle={styles.inner}>
        <Text style={[styles.title, { color: BRAND.text }]}>Post a Request 📋</Text>
        <Text style={[styles.subtitle, { color: BRAND.textLight }]}>Tell us what you need help with</Text>

        {selectedCat && (
          <View style={[styles.selectedBox, { backgroundColor: BRAND.primaryLight }]}>
            <Text style={[styles.selectedLabel, { color: BRAND.primary }]}>Selected Service:</Text>
            <Text style={[styles.selectedValue, { color: BRAND.primary }]}>
              {selectedSubcat ? `${selectedCat.name} → ${selectedSubcat.name}` : selectedCat.name}
            </Text>
          </View>
        )}

        <Text style={[styles.label, { color: BRAND.text }]}>Service Category *</Text>
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

        {/* Subcategory Selection - Only shown when category is selected */}
        {selectedCat && (
          <>
            <Text style={[styles.label, { color: BRAND.text }]}>Select Specific Service *</Text>
            <Text style={[styles.hint, { color: BRAND.textLight }]}>
              Choose the exact service you need
            </Text>
            {/* This will need subcategories from API - but coming from HomeScreen */}
            {!selectedSubcat && (
              <Text style={[styles.warning, { color: BRAND.error }]}>
                ⚠️ Please select a specific service type
              </Text>
            )}
          </>
        )}

        <Text style={[styles.label, { color: BRAND.text }]}>Describe Your Problem *</Text>
        <TextInput
          style={[styles.textarea, descriptionError && styles.textareaError]}
          placeholder="e.g. My kitchen pipe is leaking near the sink. Need urgent repair. (min 10 characters)"
          placeholderTextColor={BRAND.textLight}
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={handleDescriptionChange}
          textAlignVertical="top"
        />
        {descriptionError && <Text style={[styles.errorText, { color: BRAND.error }]}>{descriptionError}</Text>}

        <Text style={[styles.label, { color: BRAND.text }]}>Add a Photo (Optional)</Text>
        <TouchableOpacity style={[styles.photoBtn, { borderColor: BRAND.textLight }]} onPress={pickPhoto}>
          <Text style={[styles.photoBtnText, { color: BRAND.textLight }]}>
            {photoUri ? '✅ Photo Selected' : '📷 Choose Photo'}
          </Text>
        </TouchableOpacity>

        <View style={styles.locationRow}>
          <Text style={[styles.label, { color: BRAND.text }]}>Your Location</Text>
          {locLoading
            ? <ActivityIndicator size="small" color={BRAND.primary} />
            : <Text style={[styles.locationStatus, { color: BRAND.success }]}>
                {location ? '✅ Location detected' : '❌ Location not available'}
              </Text>
          }
        </View>

        <View style={[styles.feeBox, { backgroundColor: '#FFF8E1', borderLeftColor: BRAND.secondary }]}>
          <Text style={[styles.feeTitle, { color: '#92400E' }]}>💳 Fee Information</Text>
          <Text style={[styles.feeText, { color: '#92400E' }]}>
            After a provider accepts your request, you will pay a 100 ETB commitment fee to unlock their contact details.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: BRAND.primary }, loading && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Post Request</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { padding: 20, gap: 12 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { fontSize: 14, marginBottom: 4 },
  label: { fontSize: 14, fontWeight: '600' },
  hint: { fontSize: 12, marginBottom: 8 },
  warning: { fontSize: 12, marginBottom: 8 },
  errorText: { fontSize: 12, marginTop: -8, marginBottom: 4 },
  selectedBox: { borderRadius: 12, padding: 12, marginBottom: 8 },
  selectedLabel: { fontSize: 12, marginBottom: 4 },
  selectedValue: { fontSize: 16, fontWeight: '600' },
  catScroll: { marginBottom: 4 },
  catChip: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' },
  catChipActive: { borderColor: BRAND.primary, backgroundColor: BRAND.primaryLight },
  catIcon: { fontSize: 16, marginRight: 6 },
  catText: { fontSize: 13, color: BRAND.text },
  catTextActive: { color: BRAND.primary, fontWeight: '600' },
  textarea: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, minHeight: 100, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' },
  textareaError: { borderColor: BRAND.error, borderWidth: 1.5 },
  photoBtn: { borderWidth: 2, borderStyle: 'dashed', borderRadius: 12, paddingVertical: 16, alignItems: 'center', borderColor: '#D1D5DB' },
  photoBtnText: { fontSize: 15 },
  locationRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  locationStatus: { fontSize: 13 },
  feeBox: { borderRadius: 12, padding: 14, borderLeftWidth: 4 },
  feeTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  feeText: { fontSize: 13, lineHeight: 18 },
  btn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#FFF', fontSize: 17, fontWeight: 'bold' },
});