// =============================================
//  src/screens/LoginScreen.js
//  BRAND COLORS: Ethiopian Green (#2E7D32) + Gold (#F9A825)
//  ADDED: Forgot Password link
// =============================================

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert,
  KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { authAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

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
};

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const { t, theme, language, updateLanguage } = useSettings();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleLanguage = () => {
    updateLanguage(language === 'en' ? 'am' : 'en');
  };

  async function handleLogin() {
    if (!phone || !password) {
      Alert.alert(t('missing_fields'), t('enter_phone_password'));
      return;
    }
    setLoading(true);
    try {
      const data = await authAPI.login({ phone, password });
      if (data.message === 'pending') {
        Alert.alert(t('account_pending'), t('pending_message'));
        return;
      }
      await login(data.token, data.user);
    } catch (err) {
      Alert.alert(t('login_failed'), err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme === 'dark' ? '#121212' : BRAND.white }]}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backBtnText, { color: BRAND.primary }]}>← {t('back')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleLanguage} style={styles.langBtn}>
          <Text style={styles.langBtnText}>{language === 'en' ? 'አማርኛ' : 'English'}</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme === 'dark' ? '#FFF' : BRAND.text }]}>
            {t('welcome_back')} 🏘️
          </Text>
          <Text style={[styles.subtitle, { color: theme === 'dark' ? '#AAA' : BRAND.textLight }]}>
            {t('login_to_account')}
          </Text>
        </View>
        
        <View style={styles.form}>
          <Text style={[styles.label, { color: theme === 'dark' ? '#DDD' : BRAND.text }]}>
            {t('phone_number')}
          </Text>
          <TextInput
            style={[
              styles.input, 
              { 
                backgroundColor: theme === 'dark' ? '#2C2C2C' : BRAND.white,
                borderColor: theme === 'dark' ? '#444' : '#E5E7EB',
                color: theme === 'dark' ? '#FFF' : BRAND.text
              }
            ]}
            placeholder={t('phone_placeholder')}
            placeholderTextColor={theme === 'dark' ? '#888' : '#9CA3AF'}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
          
          <Text style={[styles.label, { color: theme === 'dark' ? '#DDD' : BRAND.text }]}>
            {t('password')}
          </Text>
          <TextInput
            style={[
              styles.input, 
              { 
                backgroundColor: theme === 'dark' ? '#2C2C2C' : BRAND.white,
                borderColor: theme === 'dark' ? '#444' : '#E5E7EB',
                color: theme === 'dark' ? '#FFF' : BRAND.text
              }
            ]}
            placeholder={t('password_placeholder')}
            placeholderTextColor={theme === 'dark' ? '#888' : '#9CA3AF'}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          
          <TouchableOpacity 
            style={[styles.btn, { backgroundColor: BRAND.primary }]} 
            onPress={handleLogin} 
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{t('login')}</Text>}
          </TouchableOpacity>
          
          {/* Forgot Password Link */}
          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={[styles.forgotText, { color: BRAND.primary }]}>Forgot Password?</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={[styles.linkText, { color: theme === 'dark' ? '#AAA' : BRAND.textLight }]}>
              {t('no_account')} <Text style={[styles.link, { color: BRAND.primary }]}>{t('register')}</Text>
            </Text>
          </TouchableOpacity>
        </View>
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
    marginBottom: 20,
  },
  backBtn: { padding: 8 },
  backBtnText: { fontSize: 16, fontWeight: '600' },
  langBtn: { backgroundColor: '#E5E7EB', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  langBtnText: { fontSize: 14, fontWeight: '600', color: '#111' },
  inner: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
  header: { marginBottom: 32 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 6 },
  subtitle: { fontSize: 15 },
  form: { gap: 12 },
  label: { fontSize: 14, fontWeight: '600' },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15 },
  btn: { borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  forgotText: { textAlign: 'center', marginTop: 4, fontSize: 13, fontWeight: '500' },
  linkText: { textAlign: 'center', marginTop: 12 },
  link: { fontWeight: '600' },
});