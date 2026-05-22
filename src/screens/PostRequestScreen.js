// =============================================
//  src/screens/PostRequestScreen.js
//  BRAND COLORS: Ethiopian Green (#2E7D32) + Gold (#F9A825)
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

const BRAND = {
  primary: '#2E7D32',
  primaryDark: '#1B5E20',
  primaryLight: '#E8F5E9',
  secondary: '#F9A825',
  secondaryLight: '#FFF8E1',
  text: '#374151',
  textLight: '#6B7280',
  white: '#FFFFFF',
  error: '#DC2626',
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
              style={[
                styles.catChip, 
                { backgroundColor: '#F9FAFB', borderColor: '#E5E7EB' },
                selectedCat?.id === cat.id && { borderColor: BRAND.primary, backgroundColor: BRAND.primaryLight }
              ]}
              onPress={() => {
                setSelectedCat(cat);
                setSelectedSubcat(null);
              }}
            >
              <Text style={styles.catIcon}>{ICON_MAP[cat.icon] || '🔨'}</Text>
              <Text style={[
                styles.catText, 
                { color: BRAND.text },
                selectedCat?.id === cat.id && { color: BRAND.primary, fontWeight: '600' }
              ]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={[styles.label, { color: BRAND.text }]}>Describe Your Problem *</Text>
        <TextInput
          style={[styles.textarea, { backgroundColor: '#F9FAFB', borderColor: '#E5E7EB', color: BRAND.text }]}
          placeholder="e.g. My kitchen pipe is leaking near the sink. Need urgent repair."
          placeholderTextColor={BRAND.textLight}
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
          textAlignVertical="top"
        />

        <Text style={[styles.label, { color: BRAND.text }]}>Add a Photo (Optional)</Text>
        <TouchableOpacity style={[styles.photoBtn, { borderColor: '#D1D5DB' }]} onPress={pickPhoto}>
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

        <View style={[styles.feeBox, { backgroundColor: BRAND.secondaryLight, borderLeftColor: BRAND.secondary }]}>
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
  selectedBox: { borderRadius: 12, padding: 12, marginBottom: 8 },
  selectedLabel: { fontSize: 12, marginBottom: 4 },
  selectedValue: { fontSize: 16, fontWeight: '600' },
  catScroll: { marginBottom: 4 },
  catChip: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8 },
  catIcon: { fontSize: 16, marginRight: 6 },
  catText: { fontSize: 13 },
  textarea: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, minHeight: 100 },
  photoBtn: { borderWidth: 2, borderStyle: 'dashed', borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  photoBtnText: { fontSize: 15 },
  locationRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  locationStatus: { fontSize: 13 },
  feeBox: { borderRadius: 12, padding: 14, borderLeftWidth: 4 },
  feeTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  feeText: { fontSize: 13, lineHeight: 18 },
  btn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
});