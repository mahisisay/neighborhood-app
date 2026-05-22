// =============================================
//  src/screens/RegisterScreen.js
//  UPDATED: Added subcategory/service selection for providers
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
  
  // NEW: Subcategory selection states
  const [subcategories, setSubcategories] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [showServiceSelector, setShowServiceSelector] = useState(false);

  // Load subcategories when role changes to provider
  useEffect(() => {
    if (role === 'provider') {
      loadSubcategories();
      setShowServiceSelector(true);
    } else {
      setShowServiceSelector(false);
      setSelectedServices([]);
    }
  }, [role]);

  async function loadSubcategories() {
    setLoadingServices(true);
    try {
      const data = await subcategoryAPI.getAll();
      setSubcategories(data.subcategories || []);
    } catch (err) {
      console.log('Error loading subcategories:', err);
    } finally {
      setLoadingServices(false);
    }
  }

  // Language toggle
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

      const token = await loginForUpload(phone, password);
      const response = await fetch(`${BASE_URL}/api/providers/onboard`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      
      // Save selected services
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
    if (!name || !phone || !password) {
      Alert.alert(t('missing_fields'), t('fill_all_fields'));
      return;
    }
    if (password.length < 6) {
      Alert.alert(t('weak_password'), t('password_length'));
      return;
    }
    if (role === 'provider' && !idPhoto) {
      Alert.alert(t('id_required'), t('upload_id'));
      return;
    }
    if (role === 'provider' && selectedServices.length === 0) {
      Alert.alert(t('service_required'), t('select_at_least_one_service'));
      return;
    }

    setLoading(true);
    try {
      await authAPI.register({ name, phone, password, role });

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

  // Group subcategories by category name
  const groupedSubcategories = subcategories.reduce((groups, sub) => {
    const catName = sub.category_name;
    if (!groups[catName]) groups[catName] = [];
    groups[catName].push(sub);
    return groups;
  }, {});

  // Dynamic styles based on theme
  const dynamicStyles = {
    container: { backgroundColor: theme === 'dark' ? '#121212' : '#fff' },
    title: { color: theme === 'dark' ? '#fff' : '#111' },
    subtitle: { color: theme === 'dark' ? '#aaa' : '#6b7280' },
    label: { color: theme === 'dark' ? '#ddd' : '#374151' },
    input: {
      backgroundColor: theme === 'dark' ? '#2c2c2c' : '#f9fafb',
      borderColor: theme === 'dark' ? '#444' : '#d1d5db',
      color: theme === 'dark' ? '#fff' : '#111',
    },
    roleBtn: {
      borderColor: theme === 'dark' ? '#555' : '#e5e7eb',
      backgroundColor: theme === 'dark' ? '#2c2c2c' : '#fff',
    },
    roleBtnActive: { borderColor: '#1a56db', backgroundColor: theme === 'dark' ? '#1e3a5f' : '#eff6ff' },
    roleText: { color: theme === 'dark' ? '#ccc' : '#374151' },
    roleTextActive: { color: '#1a56db' },
    roleDesc: { color: theme === 'dark' ? '#888' : '#9ca3af' },
    divider: { backgroundColor: theme === 'dark' ? '#333' : '#e5e7eb' },
    sectionTitle: { color: theme === 'dark' ? '#fff' : '#111' },
    sectionDesc: { color: theme === 'dark' ? '#aaa' : '#6b7280' },
    uploadBtn: {
      backgroundColor: theme === 'dark' ? '#2c2c2c' : '#f9fafb',
      borderColor: theme === 'dark' ? '#555' : '#d1d5db',
    },
    uploadBtnDone: { borderColor: '#10b981', backgroundColor: theme === 'dark' ? '#1e3a5f' : '#f0fdf4' },
    uploadBtnText: { color: theme === 'dark' ? '#aaa' : '#6b7280' },
    serviceBtn: {
      backgroundColor: theme === 'dark' ? '#2c2c2c' : '#f3f4f6',
    },
    serviceBtnSelected: {
      backgroundColor: '#1a56db',
    },
    serviceName: { color: theme === 'dark' ? '#ccc' : '#374151' },
    serviceNameSelected: { color: '#fff' },
    noteBox: { backgroundColor: theme === 'dark' ? '#5c1e1e' : '#fef3c7', borderLeftColor: '#f59e0b' },
    noteText: { color: theme === 'dark' ? '#ffb3b3' : '#92400e' },
    btn: { backgroundColor: theme === 'dark' ? '#2563eb' : '#1a56db' },
    linkText: { color: theme === 'dark' ? '#aaa' : '#6b7280' },
    link: { color: theme === 'dark' ? '#60a5fa' : '#1a56db' },
    backBtnText: { color: theme === 'dark' ? '#60a5fa' : '#1a56db' },
    categoryTitle: { color: theme === 'dark' ? '#60a5fa' : '#1a56db' },
  };

  return (
    <SafeAreaView style={[styles.container, dynamicStyles.container]}>
      {/* Top row: Back + Language Toggle */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backBtnText, dynamicStyles.backBtnText]}>← {t('back')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleLanguage} style={styles.langBtn}>
          <Text style={styles.langBtnText}>{language === 'en' ? 'አማርኛ' : 'English'}</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.inner}>
          <View style={styles.header}>
            <Text style={[styles.title, dynamicStyles.title]}>{t('create_account')} 🏘️</Text>
            <Text style={[styles.subtitle, dynamicStyles.subtitle]}>{t('join_us')}</Text>
          </View>

          <Text style={[styles.label, dynamicStyles.label]}>{t('i_am_a')}</Text>
          <View style={styles.roleRow}>
            <TouchableOpacity
              style={[styles.roleBtn, dynamicStyles.roleBtn, role === 'seeker' && dynamicStyles.roleBtnActive]}
              onPress={() => setRole('seeker')}
            >
              <Text style={styles.roleIcon}>🔍</Text>
              <Text style={[styles.roleText, dynamicStyles.roleText, role === 'seeker' && dynamicStyles.roleTextActive]}>{t('seeker')}</Text>
              <Text style={[styles.roleDesc, dynamicStyles.roleDesc]}>{t('seeker_desc')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleBtn, dynamicStyles.roleBtn, role === 'provider' && dynamicStyles.roleBtnActive]}
              onPress={() => setRole('provider')}
            >
              <Text style={styles.roleIcon}>👷</Text>
              <Text style={[styles.roleText, dynamicStyles.roleText, role === 'provider' && dynamicStyles.roleTextActive]}>{t('provider')}</Text>
              <Text style={[styles.roleDesc, dynamicStyles.roleDesc]}>{t('provider_desc')}</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.label, dynamicStyles.label]}>{t('full_name')}</Text>
          <TextInput
            style={[styles.input, dynamicStyles.input]}
            placeholder={t('name_placeholder')}
            placeholderTextColor={theme === 'dark' ? '#888' : '#9ca3af'}
            value={name}
            onChangeText={setName}
          />

          <Text style={[styles.label, dynamicStyles.label]}>{t('phone_number')}</Text>
          <TextInput
            style={[styles.input, dynamicStyles.input]}
            placeholder={t('phone_placeholder')}
            placeholderTextColor={theme === 'dark' ? '#888' : '#9ca3af'}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          <Text style={[styles.label, dynamicStyles.label]}>{t('password')}</Text>
          <TextInput
            style={[styles.input, dynamicStyles.input]}
            placeholder={t('password_placeholder')}
            placeholderTextColor={theme === 'dark' ? '#888' : '#9ca3af'}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {role === 'provider' && (
            <>
              <View style={[styles.divider, dynamicStyles.divider]} />
              
              {/* NEW: Service Selection Section */}
              <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>{t('select_services')}</Text>
              <Text style={[styles.sectionDesc, dynamicStyles.sectionDesc]}>{t('select_services_desc')}</Text>
              
              {loadingServices ? (
                <ActivityIndicator size="large" color="#1a56db" style={{ marginVertical: 20 }} />
              ) : (
                Object.entries(groupedSubcategories).map(([categoryName, services]) => (
                  <View key={categoryName} style={styles.categoryGroup}>
                    <Text style={[styles.categoryTitle, dynamicStyles.categoryTitle]}>{categoryName}</Text>
                    <View style={styles.servicesGrid}>
                      {services.map(service => (
                        <TouchableOpacity
                          key={service.id}
                          style={[
                            styles.serviceBtn,
                            dynamicStyles.serviceBtn,
                            selectedServices.includes(service.id) && dynamicStyles.serviceBtnSelected
                          ]}
                          onPress={() => toggleService(service.id)}
                        >
                          <Text style={styles.serviceIcon}>{service.icon || '📌'}</Text>
                          <Text style={[
                            styles.serviceName,
                            dynamicStyles.serviceName,
                            selectedServices.includes(service.id) && dynamicStyles.serviceNameSelected
                          ]}>{service.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ))
              )}
              
              <View style={[styles.divider, dynamicStyles.divider]} />
              <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>{t('verification_docs')}</Text>
              <Text style={[styles.sectionDesc, dynamicStyles.sectionDesc]}>{t('admin_review_note')}</Text>

              <Text style={[styles.label, dynamicStyles.label]}>{t('national_id')} <Text style={styles.required}>*</Text></Text>
              <TouchableOpacity
                style={[styles.uploadBtn, dynamicStyles.uploadBtn, idPhoto && dynamicStyles.uploadBtnDone]}
                onPress={() => pickImage(setIdPhoto)}
              >
                {idPhoto ? (
                  <View style={styles.uploadedRow}>
                    <Image source={{ uri: idPhoto.uri }} style={styles.thumbImage} />
                    <Text style={[styles.uploadedText, { color: '#10b981' }]}>{t('id_selected')}</Text>
                  </View>
                ) : (
                  <Text style={[styles.uploadBtnText, dynamicStyles.uploadBtnText]}>{t('upload_id')}</Text>
                )}
              </TouchableOpacity>

              <Text style={[styles.label, dynamicStyles.label]}>{t('certificate')} <Text style={styles.optional}>({t('optional')})</Text></Text>
              <TouchableOpacity
                style={[styles.uploadBtn, dynamicStyles.uploadBtn, certificate && dynamicStyles.uploadBtnDone]}
                onPress={() => pickImage(setCertificate)}
              >
                {certificate ? (
                  <View style={styles.uploadedRow}>
                    <Image source={{ uri: certificate.uri }} style={styles.thumbImage} />
                    <Text style={[styles.uploadedText, { color: '#10b981' }]}>{t('cert_selected')}</Text>
                  </View>
                ) : (
                  <Text style={[styles.uploadBtnText, dynamicStyles.uploadBtnText]}>{t('upload_cert')}</Text>
                )}
              </TouchableOpacity>

              <Text style={[styles.label, dynamicStyles.label]}>{t('experience_desc')} <Text style={styles.optional}>({t('optional')})</Text></Text>
              <TextInput
                style={[styles.input, dynamicStyles.input, { minHeight: 100 }]}
                placeholder={t('experience_placeholder')}
                placeholderTextColor={theme === 'dark' ? '#888' : '#9ca3af'}
                multiline
                numberOfLines={4}
                value={experienceDescription}
                onChangeText={setExperienceDescription}
                textAlignVertical="top"
              />

              <View style={[styles.noteBox, dynamicStyles.noteBox]}>
                <Text style={[styles.noteText, dynamicStyles.noteText]}>{t('verification_note')}</Text>
              </View>
            </>
          )}

          <TouchableOpacity
            style={[styles.btn, dynamicStyles.btn, loading && { opacity: 0.7 }]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{t('create_account')}</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={[styles.linkText, dynamicStyles.linkText]}>
              {t('have_account')} <Text style={[styles.link, dynamicStyles.link]}>{t('login')}</Text>
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
  langBtn: { backgroundColor: '#e5e7eb', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  langBtnText: { fontSize: 14, fontWeight: '600', color: '#111' },
  inner: { paddingHorizontal: 24, paddingVertical: 32, gap: 12 },
  header: { marginBottom: 8 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 6 },
  subtitle: { fontSize: 15 },
  label: { fontSize: 14, fontWeight: '600' },
  required: { color: '#ef4444', fontWeight: '400' },
  optional: { color: '#9ca3af', fontWeight: '400' },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15 },
  roleRow: { flexDirection: 'row', gap: 12, marginBottom: 4 },
  roleBtn: { flex: 1, borderWidth: 2, borderRadius: 12, padding: 14, alignItems: 'center' },
  roleIcon: { fontSize: 28, marginBottom: 4 },
  roleText: { fontSize: 13, fontWeight: '600' },
  roleDesc: { fontSize: 11, marginTop: 2 },
  divider: { height: 1, marginVertical: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  sectionDesc: { fontSize: 13, lineHeight: 18, marginBottom: 12 },
  categoryGroup: { marginBottom: 16 },
  categoryTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  serviceBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 8, marginBottom: 8 },
  serviceIcon: { fontSize: 14 },
  serviceName: { fontSize: 12 },
  uploadBtn: { borderWidth: 2, borderStyle: 'dashed', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 12 },
  uploadBtnDone: { borderStyle: 'solid' },
  uploadBtnText: { fontSize: 15 },
  uploadedRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  thumbImage: { width: 40, height: 40, borderRadius: 6 },
  uploadedText: { fontWeight: '600' },
  noteBox: { borderRadius: 10, padding: 12, borderLeftWidth: 4, marginBottom: 8 },
  noteText: { fontSize: 13, lineHeight: 18 },
  btn: { borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  linkText: { textAlign: 'center', marginTop: 4 },
  link: { fontWeight: '600' },
});