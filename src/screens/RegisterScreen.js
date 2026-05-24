// =============================================
//  src/screens/RegisterScreen.js
//  FULL AMHARIC SUPPORT - All text uses t() function
// =============================================

import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert,
  KeyboardAvoidingView, Platform,
  ActivityIndicator, ScrollView, Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { authAPI, loginForUpload, BASE_URL, subcategoryAPI } from '../api/client';
import { useSettings } from '../context/SettingsContext';
import { 
  getNameError, 
  getPhoneError, 
  getPasswordError,
  formatPhoneForDisplay,
  validateRegisterForm,
  isFormValid
} from '../utils/validation';

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

const getIconForService = (serviceName) => {
  const iconMap = {
    'Electrician': '⚡', 'Plumber': '💧', 'Carpenter': '🔨', 'Painter': '🎨',
    'Appliance Repair': '🔧', 'House Cleaning': '🧹', 'Laundry Services': '👕',
    'Compound Cleaning': '🌳', 'Office Cleaning': '🏢', 'Barber': '✂️',
    'Makeup Artist': '💄', 'Tailor': '📏', 'Photographer': '📷', 'Event Helpers': '🎉',
    'Private Tutor (Math)': '📐', 'Private Tutor (English)': '📖', 'Computer Training': '💻',
    'Language Tutoring': '🗣️', 'Grocery Pickup': '🛒', 'Medicine Delivery': '💊',
    'Document Delivery': '📄', 'Small Shopping': '🏪', 'Computer Repair': '🖥️',
    'Phone Repair': '📱', 'Software Installation': '💿', 'Printing/IT Support': '🖨️'
  };
  return iconMap[serviceName] || '🔧';
};

export default function RegisterScreen({ navigation }) {
  const { t, theme, language, updateLanguage } = useSettings();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('seeker');
  const [experienceDescription, setExperienceDescription] = useState('');
  const [idPhoto, setIdPhoto] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  
  const [subcategories, setSubcategories] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});

  useEffect(() => {
    if (role === 'provider') {
      loadSubcategories();
    } else {
      setSelectedServices([]);
    }
  }, [role]);

  async function loadSubcategories() {
    setLoadingServices(true);
    try {
      const data = await subcategoryAPI.getAll();
      setSubcategories(data.subcategories || []);
      
      const categories = {};
      (data.subcategories || []).forEach(sub => {
        if (sub && sub.category_name && !categories[sub.category_name]) {
          categories[sub.category_name] = true;
        }
      });
      setExpandedCategories(categories);
    } catch (err) {
      console.log('Error loading subcategories:', err);
      Alert.alert(t('error'), t('could_not_load_categories'));
      setSubcategories([]);
    } finally {
      setLoadingServices(false);
    }
  }

  useEffect(() => {
    const errors = {};
    const nameErr = getNameError(name);
    if (nameErr) errors.name = nameErr;
    const phoneErr = getPhoneError(phone);
    if (phoneErr) errors.phone = phoneErr;
    const passwordErr = getPasswordError(password);
    if (passwordErr) errors.password = passwordErr;
    setValidationErrors(errors);
  }, [name, phone, password]);

  const toggleLanguage = () => {
    updateLanguage(language === 'en' ? 'am' : 'en');
  };

  async function pickImage(setter) {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) setter(result.assets[0]);
  }

  function toggleService(subcategoryId) {
    if (selectedServices.includes(subcategoryId)) {
      setSelectedServices(selectedServices.filter(id => id !== subcategoryId));
    } else {
      setSelectedServices([...selectedServices, subcategoryId]);
    }
  }

  function toggleCategory(categoryName) {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  }

  function getFilteredSubcategories(services) {
    if (!searchQuery) return services;
    return services.filter(service => 
      service.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  async function uploadDocuments() {
    try {
      const formData = new FormData();
      formData.append('id_document', {
        uri: idPhoto.uri, type: 'image/jpeg', name: 'id_document.jpg',
      });
      if (certificate) {
        formData.append('certificate', {
          uri: certificate.uri, type: 'image/jpeg', name: 'certificate.jpg',
        });
      }
      if (experienceDescription) {
        formData.append('experience_description', experienceDescription);
      }

      const formattedPhone = formatPhoneForDisplay(phone);
      const token = await loginForUpload(formattedPhone, password);
      const response = await fetch(`${BASE_URL}/api/providers/onboard`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      
      if (selectedServices.length > 0) {
        await fetch(`${BASE_URL}/api/subcategories/save-services`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ subcategory_ids: selectedServices })
        });
      }
      
      return true;
    } catch (err) {
      console.error('Upload error:', err);
      return false;
    }
  }

  async function handleRegister() {
    if (role === 'provider' && selectedServices.length === 0) {
      Alert.alert(t('error'), t('select_at_least_one_service'));
      return;
    }

    const errors = validateRegisterForm({
      name,
      phone,
      password,
      role,
      registerBoth: false,
      idPhoto,
      selectedServices
    });
    
    setValidationErrors(errors);
    
    if (!isFormValid(errors)) {
      const firstError = Object.values(errors)[0];
      Alert.alert(t('error'), firstError);
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = formatPhoneForDisplay(phone);
      
      await authAPI.register({ name, phone: formattedPhone, password, role });
      
      if (role === 'provider') {
        await uploadDocuments();
        Alert.alert(
          t('registration_success'),
          t('provider_pending_message'),
          [{ text: t('ok'), onPress: () => navigation.navigate('Login') }]
        );
      } else {
        Alert.alert(
          t('registration_success'),
          t('seeker_success_message'),
          [{ text: t('login_now'), onPress: () => navigation.navigate('Login') }]
        );
      }
    } catch (err) {
      Alert.alert(t('registration_failed'), err.message);
    } finally {
      setLoading(false);
    }
  }

  const groupedSubcategories = subcategories.reduce((groups, sub) => {
    const catName = sub.category_name;
    if (!groups[catName]) groups[catName] = [];
    groups[catName].push(sub);
    return groups;
  }, {});

  const isDark = theme === 'dark';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F9FAFB' }]}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backBtnText, { color: BRAND.primary }]}>← {t('back')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleLanguage} style={styles.langBtn}>
          <Text style={styles.langBtnText}>{language === 'en' ? 'አማርኛ' : 'English'}</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.inner}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: isDark ? '#FFF' : BRAND.text }]}>{t('create_account')} 🏘️</Text>
            <Text style={[styles.subtitle, { color: isDark ? '#AAA' : BRAND.textLight }]}>{t('join_us')}</Text>
          </View>

          <Text style={[styles.label, { color: isDark ? '#DDD' : BRAND.text }]}>{t('i_am_a')}</Text>
          <View style={styles.roleRow}>
            <TouchableOpacity
              style={[styles.roleBtn, role === 'seeker' && styles.roleBtnActive]}
              onPress={() => setRole('seeker')}
            >
              <Text style={styles.roleIcon}>🔍</Text>
              <Text style={[styles.roleText, role === 'seeker' && styles.roleTextActive]}>{t('seeker')}</Text>
              <Text style={[styles.roleDesc, { color: isDark ? '#888' : BRAND.textLight }]}>{t('seeker_desc')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleBtn, role === 'provider' && styles.roleBtnActive]}
              onPress={() => setRole('provider')}
            >
              <Text style={styles.roleIcon}>👷</Text>
              <Text style={[styles.roleText, role === 'provider' && styles.roleTextActive]}>{t('provider')}</Text>
              <Text style={[styles.roleDesc, { color: isDark ? '#888' : BRAND.textLight }]}>{t('provider_desc')}</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.label, { color: isDark ? '#DDD' : BRAND.text }]}>{t('full_name')}</Text>
          <TextInput
            style={[styles.input, validationErrors.name && styles.inputError]}
            placeholder={t('name_placeholder')}
            placeholderTextColor={isDark ? '#888' : BRAND.textLight}
            value={name}
            onChangeText={setName}
          />
          {validationErrors.name && <Text style={[styles.errorText, { color: BRAND.error }]}>{validationErrors.name}</Text>}

          <Text style={[styles.label, { color: isDark ? '#DDD' : BRAND.text }]}>{t('phone_number')}</Text>
          <TextInput
            style={[styles.input, validationErrors.phone && styles.inputError]}
            placeholder={t('phone_placeholder')}
            placeholderTextColor={isDark ? '#888' : BRAND.textLight}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
          {validationErrors.phone && <Text style={[styles.errorText, { color: BRAND.error }]}>{validationErrors.phone}</Text>}

          <Text style={[styles.label, { color: isDark ? '#DDD' : BRAND.text }]}>{t('password')}</Text>
          <TextInput
            style={[styles.input, validationErrors.password && styles.inputError]}
            placeholder={t('password_placeholder')}
            placeholderTextColor={isDark ? '#888' : BRAND.textLight}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          {validationErrors.password && <Text style={[styles.errorText, { color: BRAND.error }]}>{validationErrors.password}</Text>}

          {role === 'provider' && (
            <>
              <View style={styles.divider} />
              
              <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : BRAND.text }]}>{t('select_services')}</Text>
              <Text style={[styles.sectionDesc, { color: isDark ? '#AAA' : BRAND.textLight }]}>{t('select_services_desc')}</Text>

              <View style={[styles.searchContainer, { backgroundColor: isDark ? '#2C2C2C' : '#F3F4F6' }]}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                  style={[styles.searchInput, { color: isDark ? '#FFF' : BRAND.text }]}
                  placeholder={t('search_services')}
                  placeholderTextColor={isDark ? '#888' : BRAND.textLight}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery !== '' && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Text style={styles.clearIcon}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>

              {selectedServices.length > 0 && (
                <View style={[styles.selectedBadge, { backgroundColor: BRAND.primaryLight }]}>
                  <Text style={[styles.selectedBadgeText, { color: BRAND.primary }]}>
                    ✅ {selectedServices.length} {t('services_selected')}
                  </Text>
                </View>
              )}

              {loadingServices ? (
                <ActivityIndicator size="large" color={BRAND.primary} style={{ marginVertical: 20 }} />
              ) : subcategories.length === 0 ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{ color: BRAND.error }}>⚠️ {t('no_services')}</Text>
                  <TouchableOpacity onPress={loadSubcategories} style={{ marginTop: 10 }}>
                    <Text style={{ color: BRAND.primary }}>{t('retry')}</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                Object.entries(groupedSubcategories).map(([categoryName, services]) => {
                  const filteredServices = getFilteredSubcategories(services);
                  const isExpanded = expandedCategories[categoryName] !== false;
                  const selectedCount = services.filter(s => selectedServices.includes(s.id)).length;
                  
                  if (filteredServices.length === 0 && searchQuery) return null;
                  
                  return (
                    <View key={categoryName} style={[styles.categoryCard, { backgroundColor: isDark ? '#1E1E1E' : BRAND.white }]}>
                      <TouchableOpacity 
                        style={styles.categoryHeader} 
                        onPress={() => toggleCategory(categoryName)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.categoryTitleRow}>
                          <Text style={styles.categoryHeaderIcon}>📁</Text>
                          <Text style={[styles.categoryHeaderText, { color: isDark ? '#FFF' : BRAND.text }]}>
                            {categoryName}
                          </Text>
                          {selectedCount > 0 && (
                            <View style={[styles.selectedCountBadge, { backgroundColor: BRAND.primary }]}>
                              <Text style={styles.selectedCountText}>{selectedCount}</Text>
                            </View>
                          )}
                        </View>
                        <Text style={[styles.categoryArrow, { color: BRAND.primary }]}>
                          {isExpanded ? '▲' : '▼'}
                        </Text>
                      </TouchableOpacity>
                      
                      {isExpanded && (
                        <View style={styles.servicesGridContainer}>
                          <View style={styles.servicesGrid}>
                            {filteredServices.map(service => (
                              <TouchableOpacity
                                key={service.id}
                                style={[
                                  styles.serviceCard,
                                  { backgroundColor: isDark ? '#2C2C2C' : '#F3F4F6' },
                                  selectedServices.includes(service.id) && { backgroundColor: BRAND.primary }
                                ]}
                                onPress={() => toggleService(service.id)}
                                activeOpacity={0.6}
                              >
                                <Text style={styles.serviceIcon}>
                                  {service.icon || getIconForService(service.name)}
                                </Text>
                                <Text style={[
                                  styles.serviceName,
                                  { color: isDark ? '#CCC' : BRAND.text },
                                  selectedServices.includes(service.id) && { color: '#FFF' }
                                ]}>
                                  {service.name}
                                </Text>
                                {selectedServices.includes(service.id) && (
                                  <Text style={styles.serviceCheck}>✓</Text>
                                )}
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>
                      )}
                    </View>
                  );
                })
              )}
              
              <View style={styles.divider} />
              <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : BRAND.text }]}>{t('verification_docs')}</Text>
              <Text style={[styles.sectionDesc, { color: isDark ? '#AAA' : BRAND.textLight }]}>{t('admin_review_note')}</Text>

              <Text style={[styles.label, { color: isDark ? '#DDD' : BRAND.text }]}>{t('national_id')} *</Text>
              <TouchableOpacity
                style={[styles.uploadBtn, idPhoto && styles.uploadBtnDone]}
                onPress={() => pickImage(setIdPhoto)}
              >
                {idPhoto ? (
                  <View style={styles.uploadedRow}>
                    <Image source={{ uri: idPhoto.uri }} style={styles.thumbImage} />
                    <Text style={[styles.uploadedText, { color: BRAND.success }]}>{t('id_selected')}</Text>
                  </View>
                ) : (
                  <Text style={[styles.uploadBtnText, { color: isDark ? '#AAA' : BRAND.textLight }]}>📷 {t('upload_id_btn')}</Text>
                )}
              </TouchableOpacity>

              <Text style={[styles.label, { color: isDark ? '#DDD' : BRAND.text }]}>{t('certificate')} ({t('optional')})</Text>
              <TouchableOpacity
                style={[styles.uploadBtn, certificate && styles.uploadBtnDone]}
                onPress={() => pickImage(setCertificate)}
              >
                {certificate ? (
                  <View style={styles.uploadedRow}>
                    <Image source={{ uri: certificate.uri }} style={styles.thumbImage} />
                    <Text style={[styles.uploadedText, { color: BRAND.success }]}>{t('cert_selected')}</Text>
                  </View>
                ) : (
                  <Text style={[styles.uploadBtnText, { color: isDark ? '#AAA' : BRAND.textLight }]}>📄 {t('upload_cert_btn')}</Text>
                )}
              </TouchableOpacity>

              <Text style={[styles.label, { color: isDark ? '#DDD' : BRAND.text }]}>{t('experience_desc')}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={t('experience_placeholder')}
                placeholderTextColor={isDark ? '#888' : BRAND.textLight}
                multiline
                numberOfLines={4}
                value={experienceDescription}
                onChangeText={setExperienceDescription}
                textAlignVertical="top"
              />

              <View style={[styles.noteBox, { backgroundColor: isDark ? '#5C1E1E' : '#FEF3C7', borderLeftColor: '#F59E0B' }]}>
                <Text style={[styles.noteText, { color: isDark ? '#FFB3B3' : '#92400E' }]}>
                  {t('verification_note')}
                </Text>
              </View>
            </>
          )}

          <TouchableOpacity
            style={[styles.btn, loading && { opacity: 0.7 }]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{t('create_account')}</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={[styles.linkText, { color: isDark ? '#AAA' : BRAND.textLight }]}>
              {t('have_account')} <Text style={[styles.link, { color: BRAND.primary }]}>{t('login')}</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    marginBottom: 10,
  },
  backBtn: { padding: 8 },
  backBtnText: { fontSize: 16, fontWeight: '600' },
  langBtn: { backgroundColor: '#E5E7EB', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  langBtnText: { fontSize: 14, fontWeight: '600', color: '#111' },
  inner: { paddingHorizontal: 24, paddingVertical: 32, gap: 12 },
  header: { marginBottom: 8 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 6 },
  subtitle: { fontSize: 15 },
  label: { fontSize: 14, fontWeight: '600' },
  errorText: { fontSize: 12, marginTop: -8, marginBottom: 4 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, backgroundColor: '#F9FAFB', borderColor: '#D1D5DB' },
  inputError: { borderColor: '#DC2626', borderWidth: 1.5 },
  textArea: { minHeight: 100 },
  roleRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  roleBtn: { flex: 1, borderWidth: 2, borderRadius: 12, padding: 14, alignItems: 'center', borderColor: '#E5E7EB', backgroundColor: '#FFF' },
  roleBtnActive: { borderColor: '#2E7D32', backgroundColor: '#E8F5E9' },
  roleIcon: { fontSize: 28, marginBottom: 4 },
  roleText: { fontSize: 13, fontWeight: '600', color: '#374151' },
  roleTextActive: { color: '#2E7D32' },
  roleDesc: { fontSize: 11, marginTop: 2, color: '#6B7280' },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4, color: '#111' },
  sectionDesc: { fontSize: 13, lineHeight: 18, marginBottom: 12, color: '#6B7280' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 12, marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  searchIcon: { fontSize: 16, marginRight: 8, color: '#9CA3AF' },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14 },
  clearIcon: { fontSize: 16, color: '#9CA3AF', padding: 8 },
  selectedBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginBottom: 16 },
  selectedBadgeText: { fontSize: 13, fontWeight: '600' },
  categoryCard: { borderRadius: 12, marginBottom: 12, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  categoryTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  categoryHeaderIcon: { fontSize: 20 },
  categoryHeaderText: { fontSize: 15, fontWeight: '600' },
  selectedCountBadge: { minWidth: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  selectedCountText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
  categoryArrow: { fontSize: 12, fontWeight: '600' },
  servicesGridContainer: { paddingHorizontal: 16, paddingBottom: 16 },
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  serviceCard: { width: '31%', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 8, alignItems: 'center', position: 'relative' },
  serviceIcon: { fontSize: 22, marginBottom: 6 },
  serviceName: { fontSize: 11, textAlign: 'center', fontWeight: '500' },
  serviceCheck: { position: 'absolute', top: 4, right: 8, fontSize: 12, color: '#FFF', fontWeight: 'bold' },
  uploadBtn: { borderWidth: 2, borderStyle: 'dashed', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 12, borderColor: '#D1D5DB', backgroundColor: '#F9FAFB' },
  uploadBtnDone: { borderColor: '#10B981', backgroundColor: '#E8F5E9' },
  uploadBtnText: { fontSize: 15, color: '#6B7280' },
  uploadedRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  thumbImage: { width: 40, height: 40, borderRadius: 6 },
  uploadedText: { fontWeight: '600', color: '#10B981' },
  noteBox: { borderRadius: 10, padding: 12, borderLeftWidth: 4, marginBottom: 8 },
  noteText: { fontSize: 13, lineHeight: 18, color: '#92400E' },
  btn: { borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 8, backgroundColor: '#2E7D32' },
  btnText: { color: '#FFF', fontSize: 17, fontWeight: 'bold' },
  linkText: { textAlign: 'center', marginTop: 4, color: '#6B7280' },
  link: { fontWeight: '600', color: '#2E7D32' },
});