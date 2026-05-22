// =============================================
//  src/screens/RegisterScreen.js
//  BRAND COLORS: Ethiopian Green (#2E7D32) + Gold (#F9A825)
//  With Both Roles option, validation, and service selection
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

// Brand Colors
const BRAND = {
  primary: '#2E7D32',
  primaryDark: '#1B5E20',
  primaryLight: '#E8F5E9',
  secondary: '#F9A825',
  secondaryLight: '#FFF8E1',
  text: '#374151',
  textLight: '#6B7280',
  white: '#FFFFFF',
  dark: '#1F2937',
  error: '#DC2626',
  success: '#10B981',
};

// Validation helpers
const validatePhone = (phone) => /^09[0-9]{8}$/.test(phone);
const validatePassword = (password) => password.length >= 6;
const validateName = (name) => name.trim().length >= 2;

export default function RegisterScreen({ navigation }) {
  const { t, theme, language, updateLanguage } = useSettings();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('seeker');
  const [registerBoth, setRegisterBoth] = useState(false);
  const [experienceDescription, setExperienceDescription] = useState('');
  const [idPhoto, setIdPhoto] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [subcategories, setSubcategories] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [showServiceSelector, setShowServiceSelector] = useState(false);

  useEffect(() => {
    if (role === 'provider' || registerBoth) {
      loadSubcategories();
      setShowServiceSelector(true);
    } else {
      setShowServiceSelector(false);
      setSelectedServices([]);
    }
  }, [role, registerBoth]);

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

  function validateForm() {
    const newErrors = {};
    
    if (!name.trim()) newErrors.name = 'Name is required';
    else if (!validateName(name)) newErrors.name = 'Name must be at least 2 characters';
    
    if (!phone) newErrors.phone = 'Phone is required';
    else if (!validatePhone(phone)) newErrors.phone = 'Phone must be 09xxxxxxxx format';
    
    if (!password) newErrors.password = 'Password is required';
    else if (!validatePassword(password)) newErrors.password = 'Password must be at least 6 characters';
    
    if ((role === 'provider' || registerBoth) && !idPhoto) {
      newErrors.idPhoto = 'National ID photo is required';
    }
    
    if ((role === 'provider' || registerBoth) && selectedServices.length === 0) {
      newErrors.services = 'Select at least one service';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (registerBoth) {
        await authAPI.register({ name, phone, password, role: 'seeker' });
        await authAPI.register({ name, phone, password, role: 'provider' });
        await uploadDocuments();
        
        const token = await loginForUpload(phone, password);
        await fetch(`${BASE_URL}/api/auth/mark-both-roles`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ has_both_roles: true })
        });
        
        Alert.alert(
          'Registration Successful',
          'You are now registered as both Seeker and Provider!',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
      } else if (role === 'provider') {
        await authAPI.register({ name, phone, password, role: 'provider' });
        await uploadDocuments();
        Alert.alert(
          'Registration Successful',
          'Your account is pending admin verification.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
      } else {
        await authAPI.register({ name, phone, password, role: 'seeker' });
        Alert.alert(
          'Registration Successful',
          'You can now login to your account.',
          [{ text: 'Login Now', onPress: () => navigation.navigate('Login') }]
        );
      }
    } catch (err) {
      Alert.alert('Registration Failed', err.message);
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

  const needsProviderFields = role === 'provider' || registerBoth;
  const isDark = theme === 'dark';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F9FAFB' }]}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backBtnText, { color: BRAND.primary }]}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleLanguage} style={styles.langBtn}>
          <Text style={styles.langBtnText}>{language === 'en' ? 'አማርኛ' : 'English'}</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.inner}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: isDark ? '#FFF' : BRAND.text }]}>Create Account 🏘️</Text>
            <Text style={[styles.subtitle, { color: isDark ? '#AAA' : BRAND.textLight }]}>Join our community</Text>
          </View>

          <Text style={[styles.label, { color: isDark ? '#DDD' : BRAND.text }]}>I am a</Text>
          <View style={styles.roleRow}>
            <TouchableOpacity
              style={[
                styles.roleBtn, 
                { borderColor: isDark ? '#555' : '#E5E7EB', backgroundColor: isDark ? '#2C2C2C' : BRAND.white },
                role === 'seeker' && !registerBoth && { borderColor: BRAND.primary, backgroundColor: BRAND.primaryLight }
              ]}
              onPress={() => { setRole('seeker'); setRegisterBoth(false); }}
            >
              <Text style={styles.roleIcon}>🔍</Text>
              <Text style={[styles.roleText, { color: isDark ? '#CCC' : BRAND.text }, role === 'seeker' && !registerBoth && { color: BRAND.primary }]}>
                Service Seeker
              </Text>
              <Text style={[styles.roleDesc, { color: isDark ? '#888' : BRAND.textLight }]}>Need a service done</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.roleBtn, 
                { borderColor: isDark ? '#555' : '#E5E7EB', backgroundColor: isDark ? '#2C2C2C' : BRAND.white },
                role === 'provider' && !registerBoth && { borderColor: BRAND.primary, backgroundColor: BRAND.primaryLight }
              ]}
              onPress={() => { setRole('provider'); setRegisterBoth(false); }}
            >
              <Text style={styles.roleIcon}>👷</Text>
              <Text style={[styles.roleText, { color: isDark ? '#CCC' : BRAND.text }, role === 'provider' && !registerBoth && { color: BRAND.primary }]}>
                Service Provider
              </Text>
              <Text style={[styles.roleDesc, { color: isDark ? '#888' : BRAND.textLight }]}>Offer your skills</Text>
            </TouchableOpacity>
          </View>

          {/* Both Roles Option */}
          <TouchableOpacity
            style={[
              styles.bothRolesCard, 
              { backgroundColor: isDark ? '#1E3A5F' : BRAND.primaryLight, borderColor: BRAND.primary },
              registerBoth && { borderWidth: 2 }
            ]}
            onPress={() => { setRegisterBoth(true); setRole('seeker'); }}
          >
            <Text style={[styles.bothRolesIcon, { color: BRAND.primary }]}>🔄</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.bothRolesTitle, { color: BRAND.primary }]}>Be Both!</Text>
              <Text style={[styles.bothRolesDesc, { color: BRAND.primary }]}>Register as both Seeker and Provider</Text>
            </View>
            {registerBoth && <Text style={styles.checkMark}>✅</Text>}
          </TouchableOpacity>

          <Text style={[styles.label, { color: isDark ? '#DDD' : BRAND.text }]}>Full Name</Text>
          <TextInput
            style={[
              styles.input, 
              { 
                backgroundColor: isDark ? '#2C2C2C' : BRAND.white,
                borderColor: errors.name ? BRAND.error : (isDark ? '#444' : '#E5E7EB'),
                color: isDark ? '#FFF' : BRAND.text
              }
            ]}
            placeholder="Your full name"
            placeholderTextColor={isDark ? '#888' : '#9CA3AF'}
            value={name}
            onChangeText={setName}
          />
          {errors.name && <Text style={[styles.errorText, { color: BRAND.error }]}>{errors.name}</Text>}

          <Text style={[styles.label, { color: isDark ? '#DDD' : BRAND.text }]}>Phone Number</Text>
          <TextInput
            style={[
              styles.input, 
              { 
                backgroundColor: isDark ? '#2C2C2C' : BRAND.white,
                borderColor: errors.phone ? BRAND.error : (isDark ? '#444' : '#E5E7EB'),
                color: isDark ? '#FFF' : BRAND.text
              }
            ]}
            placeholder="e.g. 0912345678"
            placeholderTextColor={isDark ? '#888' : '#9CA3AF'}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
          {errors.phone && <Text style={[styles.errorText, { color: BRAND.error }]}>{errors.phone}</Text>}

          <Text style={[styles.label, { color: isDark ? '#DDD' : BRAND.text }]}>Password</Text>
          <TextInput
            style={[
              styles.input, 
              { 
                backgroundColor: isDark ? '#2C2C2C' : BRAND.white,
                borderColor: errors.password ? BRAND.error : (isDark ? '#444' : '#E5E7EB'),
                color: isDark ? '#FFF' : BRAND.text
              }
            ]}
            placeholder="At least 6 characters"
            placeholderTextColor={isDark ? '#888' : '#9CA3AF'}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          {errors.password && <Text style={[styles.errorText, { color: BRAND.error }]}>{errors.password}</Text>}

          {needsProviderFields && (
            <>
              <View style={[styles.divider, { backgroundColor: isDark ? '#333' : '#E5E7EB' }]} />
              
              <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : BRAND.text }]}>Select Your Services</Text>
              <Text style={[styles.sectionDesc, { color: isDark ? '#AAA' : BRAND.textLight }]}>Choose all services you offer</Text>
              
              {errors.services && <Text style={[styles.errorText, { color: BRAND.error }]}>{errors.services}</Text>}
              
              {loadingServices ? (
                <ActivityIndicator size="large" color={BRAND.primary} style={{ marginVertical: 20 }} />
              ) : (
                Object.entries(groupedSubcategories).map(([categoryName, services]) => (
                  <View key={categoryName} style={styles.categoryGroup}>
                    <Text style={[styles.categoryTitle, { color: BRAND.primary }]}>{categoryName}</Text>
                    <View style={styles.servicesGrid}>
                      {services.map(service => (
                        <TouchableOpacity
                          key={service.id}
                          style={[
                            styles.serviceBtn,
                            { backgroundColor: isDark ? '#2C2C2C' : '#F3F4F6' },
                            selectedServices.includes(service.id) && { backgroundColor: BRAND.primary }
                          ]}
                          onPress={() => toggleService(service.id)}
                        >
                          <Text style={styles.serviceIcon}>{service.icon || '📌'}</Text>
                          <Text style={[
                            styles.serviceName,
                            { color: isDark ? '#CCC' : BRAND.text },
                            selectedServices.includes(service.id) && { color: '#FFF' }
                          ]}>{service.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ))
              )}
              
              <View style={[styles.divider, { backgroundColor: isDark ? '#333' : '#E5E7EB' }]} />
              <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : BRAND.text }]}>Verification Documents</Text>
              <Text style={[styles.sectionDesc, { color: isDark ? '#AAA' : BRAND.textLight }]}>These will be reviewed by admin</Text>

              <Text style={[styles.label, { color: isDark ? '#DDD' : BRAND.text }]}>National ID Photo *</Text>
              {errors.idPhoto && <Text style={[styles.errorText, { color: BRAND.error }]}>{errors.idPhoto}</Text>}
              <TouchableOpacity
                style={[
                  styles.uploadBtn, 
                  { 
                    backgroundColor: isDark ? '#2C2C2C' : '#F9FAFB',
                    borderColor: errors.idPhoto ? BRAND.error : (isDark ? '#555' : '#D1D5DB')
                  },
                  idPhoto && { borderColor: BRAND.success, backgroundColor: BRAND.primaryLight }
                ]}
                onPress={() => pickImage(setIdPhoto)}
              >
                {idPhoto ? (
                  <View style={styles.uploadedRow}>
                    <Image source={{ uri: idPhoto.uri }} style={styles.thumbImage} />
                    <Text style={[styles.uploadedText, { color: BRAND.success }]}>ID Photo Selected</Text>
                  </View>
                ) : (
                  <Text style={[styles.uploadBtnText, { color: isDark ? '#AAA' : BRAND.textLight }]}>📷 Upload National ID</Text>
                )}
              </TouchableOpacity>

              <Text style={[styles.label, { color: isDark ? '#DDD' : BRAND.text }]}>Certificate (Optional)</Text>
              <TouchableOpacity
                style={[
                  styles.uploadBtn, 
                  { 
                    backgroundColor: isDark ? '#2C2C2C' : '#F9FAFB',
                    borderColor: isDark ? '#555' : '#D1D5DB'
                  },
                  certificate && { borderColor: BRAND.success, backgroundColor: BRAND.primaryLight }
                ]}
                onPress={() => pickImage(setCertificate)}
              >
                {certificate ? (
                  <View style={styles.uploadedRow}>
                    <Image source={{ uri: certificate.uri }} style={styles.thumbImage} />
                    <Text style={[styles.uploadedText, { color: BRAND.success }]}>Certificate Selected</Text>
                  </View>
                ) : (
                  <Text style={[styles.uploadBtnText, { color: isDark ? '#AAA' : BRAND.textLight }]}>📄 Upload Certificate</Text>
                )}
              </TouchableOpacity>

              <Text style={[styles.label, { color: isDark ? '#DDD' : BRAND.text }]}>Experience Description</Text>
              <TextInput
                style={[
                  styles.input, styles.textArea,
                  { 
                    backgroundColor: isDark ? '#2C2C2C' : BRAND.white,
                    borderColor: isDark ? '#444' : '#E5E7EB',
                    color: isDark ? '#FFF' : BRAND.text
                  }
                ]}
                placeholder="Tell us about your experience..."
                placeholderTextColor={isDark ? '#888' : '#9CA3AF'}
                multiline
                numberOfLines={4}
                value={experienceDescription}
                onChangeText={setExperienceDescription}
                textAlignVertical="top"
              />

              <View style={[styles.noteBox, { backgroundColor: isDark ? '#5C1E1E' : '#FEF3C7', borderLeftColor: '#F59E0B' }]}>
                <Text style={[styles.noteText, { color: isDark ? '#FFB3B3' : '#92400E' }]}>
                  Your documents will be reviewed. You will be notified once verified.
                </Text>
              </View>
            </>
          )}

          <TouchableOpacity
            style={[styles.btn, { backgroundColor: BRAND.primary }, loading && { opacity: 0.7 }]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Create Account</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={[styles.linkText, { color: isDark ? '#AAA' : BRAND.textLight }]}>
              Already have an account? <Text style={[styles.link, { color: BRAND.primary }]}>Login</Text>
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
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15 },
  textArea: { minHeight: 100 },
  roleRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  roleBtn: { flex: 1, borderWidth: 2, borderRadius: 12, padding: 14, alignItems: 'center' },
  roleIcon: { fontSize: 28, marginBottom: 4 },
  roleText: { fontSize: 13, fontWeight: '600' },
  roleDesc: { fontSize: 11, marginTop: 2 },
  bothRolesCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5, borderRadius: 12, padding: 16, marginBottom: 8 },
  bothRolesIcon: { fontSize: 28 },
  bothRolesTitle: { fontSize: 15, fontWeight: 'bold' },
  bothRolesDesc: { fontSize: 12 },
  checkMark: { fontSize: 18 },
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