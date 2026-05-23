// =============================================
//  src/screens/PostRequestScreen.js
//  WITH FULL AMHARIC SUPPORT
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
import { useSettings } from '../context/SettingsContext';

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
  const { t, theme } = useSettings();
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

  const isDark = theme === 'dark';

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
        Alert.alert(t('location_needed'), t('location_permission'));
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    } catch (err) {
      Alert.alert(t('error'), t('location_error'));
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
      Alert.alert(t('error'), t('select_category_error'));
      return;
    }
    
    if (!selectedSubcat) {
      Alert.alert(t('error'), t('select_service_error'));
      return;
    }
    
    if (descriptionError) {
      Alert.alert(t('error'), descriptionError);
      return;
    }
    
    if (!description.trim()) {
      Alert.alert(t('error'), t('description_required'));
      return;
    }
    
    if (!location) {
      Alert.alert(t('error'), t('location_required'));
      return;
    }

    setLoading(true);
    try {
      const data = await requestAPI.create({
        category_id: selectedCat.id,
        subcategory_id: selectedSubcat.id,
        description: description.trim(),
        latitude: location.latitude,
        longitude: location.longitude,
      });

      Alert.alert(
        t('success'),
        `${data.nearbyProvidersNotified} ${t('providers_notified')}`,
        [{ text: t('view_requests'), onPress: () => navigation.navigate('MyRequests') }]
      );
    } catch (err) {
      Alert.alert(t('error'), err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: BRAND.white }]}>
      <ScrollView contentContainerStyle={styles.inner}>
        <Text style={[styles.title, { color: BRAND.text }]}>{t('post_request')} 📋</Text>
        <Text style={[styles.subtitle, { color: BRAND.textLight }]}>{t('tell_us')}</Text>

        {selectedCat && (
          <View style={[styles.selectedBox, { backgroundColor: BRAND.primaryLight }]}>
            <Text style={[styles.selectedLabel, { color: BRAND.primary }]}>{t('selected_service')}:</Text>
            <Text style={[styles.selectedValue, { color: BRAND.primary }]}>
              {selectedSubcat ? `${selectedCat.name} → ${selectedSubcat.name}` : selectedCat.name}
            </Text>
          </View>
        )}

        <Text style={[styles.label, { color: BRAND.text }]}>{t('service_category')} *</Text>
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

        <Text style={[styles.label, { color: BRAND.text }]}>{t('describe_problem')} *</Text>
        <TextInput
          style={[styles.textarea, descriptionError && styles.textareaError]}
          placeholder={t('description_placeholder')}
          placeholderTextColor={BRAND.textLight}
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={handleDescriptionChange}
          textAlignVertical="top"
        />
        {descriptionError && <Text style={[styles.errorText, { color: BRAND.error }]}>{descriptionError}</Text>}

        <Text style={[styles.label, { color: BRAND.text }]}>{t('add_photo')}</Text>
        <TouchableOpacity style={[styles.photoBtn, { borderColor: BRAND.textLight }]} onPress={pickPhoto}>
          <Text style={[styles.photoBtnText, { color: BRAND.textLight }]}>
            {photoUri ? '✅ ' + t('photo_selected') : '📷 ' + t('choose_photo')}
          </Text>
        </TouchableOpacity>

        <View style={styles.locationRow}>
          <Text style={[styles.label, { color: BRAND.text }]}>{t('your_location')}</Text>
          {locLoading
            ? <ActivityIndicator size="small" color={BRAND.primary} />
            : <Text style={[styles.locationStatus, { color: BRAND.success }]}>
                {location ? '✅ ' + t('location_detected') : '❌ ' + t('location_unavailable')}
              </Text>
          }
        </View>

        <View style={[styles.feeBox, { backgroundColor: '#FFF8E1', borderLeftColor: BRAND.secondary }]}>
          <Text style={[styles.feeTitle, { color: '#92400E' }]}>💳 {t('fee_info')}</Text>
          <Text style={[styles.feeText, { color: '#92400E' }]}>
            {t('fee_description')}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: BRAND.primary }, loading && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{t('post_button')}</Text>}
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