// =============================================
//  src/screens/PostRequestScreen.js
//  COMPLETE FIXED VERSION - With Role Check & Working Success Modal
// =============================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
  ActivityIndicator,
  Modal
} from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { requestAPI } from '../api/client';
import { getDescriptionError } from '../utils/validation';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';

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
  wrench: '🔧',
  zap: '⚡',
  droplet: '💧',
  book: '📚',
  smartphone: '📱',
  wind: '🧹',
  truck: '🚛',
  brush: '🖌️',
};

export default function PostRequestScreen({ navigation, route }) {
  const { t, theme } = useSettings();
  const { user } = useAuth();
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
  
  // Success Modal States
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState({
    requestId: null,
    nearbyProviders: 0,
    message: ''
  });

  const isDark = theme === 'dark';

  useEffect(() => {
    // ✅ CHECK ROLE ON SCREEN LOAD
    if (user?.role !== 'seeker') {
      Alert.alert(
        'Access Denied',
        'Only seekers can post requests. Please switch to Seeker mode in Settings.',
        [
          { 
            text: 'Go to Settings', 
            onPress: () => navigation.navigate('Settings')
          },
          { 
            text: 'Go Back', 
            onPress: () => navigation.goBack()
          }
        ]
      );
      return;
    }

    loadCategories();
    getLocation();

    if (preselectedCategoryId && preselectedSubcategoryId) {
      setSelectedCat({ id: preselectedCategoryId, name: route.params?.category_name });
      setSelectedSubcat({ id: preselectedSubcategoryId, name: preselectedSubcategory });
    } else if (preselectedCategory) {
      setSelectedCat(preselectedCategory);
    }
  }, [user?.role]);

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
        Alert.alert('Location Needed', 'We need your location to find nearby providers.');
        setLocLoading(false);
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
      mediaTypes: ['images'],
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
    // ✅ DOUBLE CHECK ROLE BEFORE SUBMITTING
    if (user?.role !== 'seeker') {
      Alert.alert(
        'Access Denied',
        'Only seekers can post requests.'
      );
      return;
    }

    if (!selectedCat) {
      Alert.alert('Error', 'Please select a service category');
      return;
    }

    if (!selectedSubcat) {
      Alert.alert('Error', 'Please select a specific service type');
      return;
    }

    if (descriptionError) {
      Alert.alert('Error', descriptionError);
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please describe what you need');
      return;
    }

    if (!location) {
      Alert.alert('Error', 'We need your location to match providers');
      return;
    }

    setLoading(true);
    try {
      const requestData = {
        category_id: selectedCat.id,
        subcategory_id: selectedSubcat.id,
        description: description.trim(),
        latitude: location.latitude,
        longitude: location.longitude,
      };

      const data = await requestAPI.create(requestData);
      
      // Store success data and show modal
      setSuccessData({
        requestId: data.requestId,
        nearbyProviders: data.nearbyProvidersNotified || 0,
        message: data.message || 'Request posted successfully!'
      });
      setShowSuccessModal(true);
      
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleModalClose = (navigateToRequests = false) => {
    setShowSuccessModal(false);
    // Reset form
    setDescription('');
    setPhotoUri(null);
    setSelectedSubcat(null);
    
    if (navigateToRequests) {
      navigation.navigate('MyRequests');
    }
  };

  const renderSelectedCategory = () => {
    if (!selectedCat) return null;
    
    const displayText = selectedSubcat 
      ? selectedCat.name + ' -> ' + selectedSubcat.name 
      : selectedCat.name;
    
    return (
      <View style={[styles.selectedBox, { backgroundColor: BRAND.primaryLight }]}>
        <Text style={[styles.selectedLabel, { color: BRAND.primary }]}>
          Selected Service
        </Text>
        <Text style={[styles.selectedValue, { color: BRAND.primary }]}>
          {displayText}
        </Text>
      </View>
    );
  };

  const renderCategories = () => {
    if (categories.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Loading categories...</Text>
        </View>
      );
    }
    
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
        {categories.map((cat) => (
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
    );
  };

  const renderSubcategories = () => {
    const hasSubcategories = selectedCat && selectedCat.subcategories && selectedCat.subcategories.length > 0;
    
    if (!hasSubcategories) {
      return null;
    }
    
    return (
      <View style={styles.subcatContainer}>
        <Text style={[styles.label, { color: BRAND.text }]}>Service Type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {selectedCat.subcategories.map((sub) => (
            <TouchableOpacity
              key={sub.id}
              style={[styles.catChip, selectedSubcat?.id === sub.id && styles.catChipActive]}
              onPress={() => setSelectedSubcat(sub)}
            >
              <Text style={[styles.catText, selectedSubcat?.id === sub.id && styles.catTextActive]}>
                {sub.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderLocation = () => {
    if (locLoading) {
      return <ActivityIndicator size="small" color={BRAND.primary} />;
    }
    return (
      <Text style={[styles.locationStatus, { color: location ? BRAND.success : BRAND.error }]}>
        {location ? 'Location detected' : 'Location not available'}
      </Text>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#121212' : BRAND.white }]}>
      <ScrollView contentContainerStyle={styles.inner}>
        <Text style={[styles.title, { color: isDark ? '#FFF' : BRAND.text }]}>Post a Request</Text>
        <Text style={[styles.subtitle, { color: isDark ? '#AAA' : BRAND.textLight }]}>
          Tell us what you need help with
        </Text>

        {renderSelectedCategory()}

        <Text style={[styles.label, { color: isDark ? '#FFF' : BRAND.text }]}>Service Category</Text>
        {renderCategories()}
        {renderSubcategories()}

        <Text style={[styles.label, { color: isDark ? '#FFF' : BRAND.text }]}>Describe Your Problem</Text>
        <TextInput
          style={[styles.textarea, descriptionError && styles.textareaError, { backgroundColor: isDark ? '#1E1E1E' : '#F9FAFB', color: isDark ? '#FFF' : BRAND.text }]}
          placeholder="Example: My kitchen pipe is leaking near the sink"
          placeholderTextColor={isDark ? '#666' : BRAND.textLight}
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={handleDescriptionChange}
          textAlignVertical="top"
        />
        
        {descriptionError ? (
          <Text style={[styles.errorText, { color: BRAND.error }]}>
            {descriptionError}
          </Text>
        ) : null}

        <Text style={[styles.label, { color: isDark ? '#FFF' : BRAND.text }]}>Add a Photo (Optional)</Text>
        <TouchableOpacity style={[styles.photoBtn, { borderColor: isDark ? '#444' : BRAND.textLight }]} onPress={pickPhoto}>
          <Text style={[styles.photoBtnText, { color: isDark ? '#AAA' : BRAND.textLight }]}>
            {photoUri ? 'Photo Selected' : 'Choose Photo'}
          </Text>
        </TouchableOpacity>

        <View style={styles.locationRow}>
          <Text style={[styles.label, { color: isDark ? '#FFF' : BRAND.text }]}>Your Location</Text>
          {renderLocation()}
        </View>

        <View style={[styles.feeBox, { backgroundColor: isDark ? '#1E1E1E' : '#FFF8E1', borderLeftColor: BRAND.secondary }]}>
          <Text style={[styles.feeTitle, { color: '#92400E' }]}>Fee Information</Text>
          <Text style={[styles.feeText, { color: '#92400E' }]}>
            After a provider accepts your request, you will pay a 100 ETB commitment fee
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: BRAND.primary }, loading && styles.btnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Post Request</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* SUCCESS MODAL - This will show on your interface */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => handleModalClose(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.successModal, { backgroundColor: isDark ? '#1E1E1E' : BRAND.white }]}>
            <View style={styles.successIconContainer}>
              <Text style={styles.successIcon}>✓</Text>
            </View>
            
            <Text style={[styles.successTitle, { color: isDark ? '#FFF' : BRAND.text }]}>
              Request Posted Successfully!
            </Text>
            
            <Text style={[styles.successMessage, { color: isDark ? '#CCC' : BRAND.textLight }]}>
              Your request has been posted and is now visible to providers in your area.
            </Text>
            
            <View style={styles.successDetails}>
              <Text style={[styles.detailLabel, { color: isDark ? '#AAA' : BRAND.textLight }]}>
                Request ID:
              </Text>
              <Text style={[styles.detailValue, { color: BRAND.primary, fontWeight: 'bold' }]}>
                #{successData.requestId}
              </Text>
              
              <Text style={[styles.detailLabel, { color: isDark ? '#AAA' : BRAND.textLight, marginTop: 8 }]}>
                Providers Notified:
              </Text>
              <Text style={[styles.detailValue, { color: BRAND.success, fontWeight: 'bold' }]}>
                {successData.nearbyProviders} provider(s) near you
              </Text>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnSecondary]}
                onPress={() => handleModalClose(false)}
              >
                <Text style={[styles.modalBtnText, { color: BRAND.primary }]}>
                  Stay Here
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnPrimary, { backgroundColor: BRAND.primary }]}
                onPress={() => handleModalClose(true)}
              >
                <Text style={[styles.modalBtnText, { color: '#FFF' }]}>
                  View My Requests
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    marginTop: -8,
    marginBottom: 4,
  },
  selectedBox: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  selectedLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  selectedValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  catScroll: {
    marginBottom: 4,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  catChipActive: {
    borderColor: BRAND.primary,
    backgroundColor: BRAND.primaryLight,
  },
  catIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  catText: {
    fontSize: 13,
    color: BRAND.text,
  },
  catTextActive: {
    color: BRAND.primary,
    fontWeight: '600',
  },
  textarea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    minHeight: 100,
    borderColor: '#E5E7EB',
  },
  textareaError: {
    borderColor: BRAND.error,
    borderWidth: 1.5,
  },
  photoBtn: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  photoBtnText: {
    fontSize: 15,
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationStatus: {
    fontSize: 13,
    fontWeight: '500',
  },
  feeBox: {
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
  },
  feeTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  feeText: {
    fontSize: 13,
    lineHeight: 18,
  },
  btn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  btnText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: BRAND.textLight,
  },
  subcatContainer: {
    marginTop: 8,
  },
  // Success Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModal: {
    width: '85%',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  successIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: BRAND.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successIcon: {
    fontSize: 32,
    color: '#FFF',
    fontWeight: 'bold',
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  successDetails: {
    width: '100%',
    padding: 16,
    backgroundColor: BRAND.primaryLight,
    borderRadius: 12,
    marginBottom: 24,
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 18,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalBtnPrimary: {
    backgroundColor: BRAND.primary,
  },
  modalBtnSecondary: {
    backgroundColor: BRAND.primaryLight,
    borderWidth: 1,
    borderColor: BRAND.primary,
  },
  modalBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
