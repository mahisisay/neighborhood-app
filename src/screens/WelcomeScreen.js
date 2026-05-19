// src/screens/WelcomeScreen.js
import React from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, SafeAreaView, Image
} from 'react-native';
import { useSettings } from '../context/SettingsContext';

export default function WelcomeScreen({ navigation }) {
  const { t, language, updateLanguage, theme } = useSettings();

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'am' : 'en';
    updateLanguage(newLang);
  };

  const dynamicStyles = {
    container: { backgroundColor: theme === 'dark' ? '#121212' : '#fff' },
    title: { color: theme === 'dark' ? '#fff' : '#111' },
    subtitle: { color: theme === 'dark' ? '#aaa' : '#6b7280' },
    btn: { backgroundColor: theme === 'dark' ? '#2563eb' : '#1a56db' },
  };

  return (
    <SafeAreaView style={[styles.container, dynamicStyles.container]}>
      {/* Language switcher button */}
      <TouchableOpacity style={styles.langButton} onPress={toggleLanguage}>
        <Text style={styles.langButtonText}>{language === 'en' ? 'አማርኛ' : 'English'}</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={[styles.logo, dynamicStyles.title]}>🏘️</Text>
        <Text style={[styles.title, dynamicStyles.title]}>{t('app_name')}</Text>
        <Text style={[styles.subtitle, dynamicStyles.subtitle]}>
          {t('welcome_subtitle')}
        </Text>
        <TouchableOpacity
          style={[styles.btn, dynamicStyles.btn]}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.btnText}>{t('login')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btnOutline]}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={[styles.btnOutlineText, { color: theme === 'dark' ? '#60a5fa' : '#1a56db' }]}>
            {t('register')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  langButton: {
    position: 'absolute',
    top: 16,
    right: 20,
    zIndex: 10,
    padding: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 20,
    paddingHorizontal: 12,
  },
  langButtonText: { fontSize: 14, fontWeight: '600', color: '#111' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  logo: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 32, paddingHorizontal: 20 },
  btn: { width: '100%', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  btnOutline: { width: '100%', paddingVertical: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#1a56db' },
  btnOutlineText: { fontSize: 16, fontWeight: 'bold' },
});