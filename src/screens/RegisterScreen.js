// =============================================
//  src/screens/RegisterScreen.js
//  UPDATED: Full validation for all fields
//  Phone: +2519XXXXXXXX format
//  Password: min 6 chars with 1 number
//  Name: min 2 chars, letters only
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
  const [validationErrors, setValidationErrors] = useState({});
  
  const [subcategories, setSubcategories] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);

  // Live validation on field change
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

  useEffect(() => {
    if (role === 'provider' || registerBoth) {
      loadSubcategories();
    } else {
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
    // Final validation before submission
    const errors = validateRegisterForm({
      name,
      phone,
      password,
      role,
      registerBoth,
      idPhoto,
      selectedServices
    });
    
    setValidationErrors(errors);
    
    if (!isFormValid(errors)) {
      const firstError = Object.values(errors)[0];
      Alert.alert('Validation Error', firstError);
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = formatPhoneForDisplay(phone);
      
      if (registerBoth) {
        await authAPI.register({ name, phone: formattedPhone, password, role: 'seeker' });
        await authAPI.register({ name, phone: formattedPhone, password, role: 'provider' });
        await uploadDocuments();
        
        const token = await loginForUpload(formattedPhone, password);
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
        await authAPI.register({ name, phone: formattedPhone, password, role: 'provider' });
        await uploadDocuments();
        Alert.alert(
          'Registration Successful',
          'Your account is pending admin verification.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
      } else {
        await authAPI.register({ name, phone: formattedPhone, password, role: 'seeker' });
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
              style={[styles.roleBtn, role === 'seeker' && !registerBoth && styles.roleBtnActive]}
              onPress={() => { setRole('seeker'); setRegisterBoth(false); }}
            >
              <Text style={styles.roleIcon}>🔍</Text>
              <Text style={[styles.roleText, role === 'seeker' && !registerBoth && styles.roleTextActive]}>Service Seeker</Text>
              <Text style={[styles.roleDesc, { color: isDark ? '#888' : BRAND.textLight }]}>Need a service done</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleBtn, role === 'provider' && !registerBoth && styles.roleBtnActive]}
              onPress={() => { setRole('provider'); setRegisterBoth(false); }}
            >
              <Text style={styles.roleIcon}>👷</Text>
              <Text style={[styles.roleText, role === 'provider' && !registerBoth && styles.roleTextActive]}>Service Provider</Text>
              <Text style={[styles.roleDesc, { color: isDark ? '#888' : BRAND.textLight }]}>Offer your skills</Text>
            </TouchableOpacity>
          </View>

          {/* Both Roles Option */}
          <TouchableOpacity
            style={[styles.bothRolesCard, registerBoth && styles.bothRolesCardActive]}
            onPress={() => { setRegisterBoth(true); setRole('seeker'); }}
          >
            <Text style={styles.bothRolesIcon}>🔄</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.bothRolesTitle, { color: BRAND.primary }]}>Be Both!</Text>
              <Text style={[styles.bothRolesDesc, { color: BRAND.textLight }]}>Register as both Seeker and Provider</Text>
            </View>
            {registerBoth && <Text style={styles.checkMark}>✅</Text>}
          </TouchableOpacity>

          <Text style={[styles.label, { color: isDark ? '#DDD' : BRAND.text }]}>Full Name</Text>
          <TextInput
            style={[styles.input, validationErrors.name && styles.inputError]}
            placeholder="Your full name"
            placeholderTextColor={isDark ? '#888' : BRAND.textLight}
            value={name}
            onChangeText={setName}
          />
          {validationErrors.name && <Text style={[styles.errorText, { color: BRAND.error }]}>{validationErrors.name}</Text>}

          <Text style={[styles.label, { color: isDark ? '#DDD' : BRAND.text }]}>Phone Number</Text>
          <TextInput
            style={[styles.input, validationErrors.phone && styles.inputError]}
            placeholder="+251912345678"
            placeholderTextColor={isDark ? '#888' : BRAND.textLight}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
          {validationErrors.phone && <Text style={[styles.errorText, { color: BRAND.error }]}>{validationErrors.phone}</Text>}

          <Text style={[styles.label, { color: isDark ? '#DDD' : BRAND.text }]}>Password</Text>
          <TextInput
            style={[styles.input, validationErrors.password && styles.inputError]}
            placeholder="At least 6 characters with 1 number"
            placeholderTextColor={isDark ? '#888' : BRAND.textLight}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          {validationErrors.password && <Text style={[styles.errorText, { color: BRAND.error }]}>{validationErrors.password}</Text>}

          {needsProviderFields && (
            <>
              <View style={styles.divider} />
              
              <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : BRAND.text }]}>Select Your Services</Text>
              <Text style={[styles.sectionDesc, { color: isDark ? '#AAA' : BRAND.textLight }]}>Choose all services you offer</Text>
              
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
                          style={[styles.serviceBtn, selectedServices.includes(service.id) && styles.serviceBtnSelected]}
                          onPress={() => toggleService(service.id)}
                        >
                          <Text style={styles.serviceIcon}>{service.icon || '📌'}</Text>
                          <Text style={[styles.serviceName, selectedServices.includes(service.id) && styles.serviceNameSelected]}>
                            {service.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ))
              )}
              
              <View style={styles.divider} />
              <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : BRAND.text }]}>Verification Documents</Text>
              <Text style={[styles.sectionDesc, { color: isDark ? '#AAA' : BRAND.textLight }]}>These will be reviewed by admin</Text>

              <Text style={[styles.label, { color: isDark ? '#DDD' : BRAND.text }]}>National ID Photo *</Text>
              <TouchableOpacity
                style={[styles.uploadBtn, idPhoto && styles.uploadBtnDone]}
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
                style={[styles.uploadBtn, certificate && styles.uploadBtnDone]}
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
                style={[styles.input, styles.textArea]}
                placeholder="Tell us about your experience..."
                placeholderTextColor={isDark ? '#888' : BRAND.textLight}
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
            style={[styles.btn, loading && { opacity: 0.7 }]}
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
  bothRolesCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5, borderRadius: 12, padding: 16, marginBottom: 8, borderColor: '#E5E7EB', backgroundColor: '#FFF' },
  bothRolesCardActive: { borderColor: '#2E7D32', backgroundColor: '#E8F5E9' },
  bothRolesIcon: { fontSize: 28 },
  bothRolesTitle: { fontSize: 15, fontWeight: 'bold', color: '#2E7D32' },
  bothRolesDesc: { fontSize: 12, color: '#6B7280' },
  checkMark: { fontSize: 18 },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4, color: '#111' },
  sectionDesc: { fontSize: 13, lineHeight: 18, marginBottom: 12, color: '#6B7280' },
  categoryGroup: { marginBottom: 16 },
  categoryTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, color: '#2E7D32' },
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  serviceBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 8, marginBottom: 8, backgroundColor: '#F3F4F6' },
  serviceBtnSelected: { backgroundColor: '#2E7D32' },
  serviceIcon: { fontSize: 14 },
  serviceName: { fontSize: 12, color: '#374151' },
  serviceNameSelected: { color: '#FFF' },
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