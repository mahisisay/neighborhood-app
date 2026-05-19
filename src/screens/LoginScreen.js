// src/screens/LoginScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert,
  KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { authAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

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
    btn: { backgroundColor: theme === 'dark' ? '#2563eb' : '#1a56db' },
    linkText: { color: theme === 'dark' ? '#aaa' : '#6b7280' },
    link: { color: theme === 'dark' ? '#60a5fa' : '#1a56db' },
    backBtn: { color: theme === 'dark' ? '#60a5fa' : '#1a56db' },
  };

  return (
    <SafeAreaView style={[styles.container, dynamicStyles.container]}>
      {/* Top row: Back + Language Toggle */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backBtnText, dynamicStyles.backBtn]}>← {t('back')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleLanguage} style={styles.langBtn}>
          <Text style={styles.langBtnText}>{language === 'en' ? 'አማርኛ' : 'English'}</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>
        <View style={styles.header}>
          <Text style={[styles.title, dynamicStyles.title]}>{t('welcome_back')} 🏘️</Text>
          <Text style={[styles.subtitle, dynamicStyles.subtitle]}>{t('login_to_account')}</Text>
        </View>
        <View style={styles.form}>
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
          <TouchableOpacity style={[styles.btn, dynamicStyles.btn]} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{t('login')}</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={[styles.linkText, dynamicStyles.linkText]}>
              {t('no_account')} <Text style={[styles.link, dynamicStyles.link]}>{t('register')}</Text>
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
  langBtn: { backgroundColor: '#e5e7eb', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
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
  linkText: { textAlign: 'center', marginTop: 12 },
  link: { fontWeight: '600' },
});