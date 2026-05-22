// =============================================
//  src/screens/WelcomeScreen.js
//  BRAND COLORS: Ethiopian Green (#2E7D32) + Gold (#F9A825)
// =============================================

import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, Image, Platform
} from 'react-native';
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
};

export default function WelcomeScreen({ navigation }) {
  const { t, theme, language, updateLanguage } = useSettings();
  const isDark = theme === 'dark';

  const toggleLanguage = () => {
    updateLanguage(language === 'en' ? 'am' : 'en');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#121212' : BRAND.white }]}>
      {/* Language Toggle Button */}
      <TouchableOpacity onPress={toggleLanguage} style={styles.langBtn}>
        <Text style={styles.langBtnText}>{language === 'en' ? 'አማርኛ' : 'English'}</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/logo.jpg')} 
            style={styles.logo}
            defaultSource={require('../../assets/logo.jpg')}
          />
          <Text style={[styles.appName, { color: BRAND.primary }]}>Neighborhood</Text>
          <Text style={[styles.appSubtitle, { color: isDark ? '#AAA' : BRAND.textLight }]}>Service Finder</Text>
        </View>

        {/* Tagline */}
        <View style={styles.taglineContainer}>
          <Text style={[styles.tagline, { color: isDark ? '#FFF' : BRAND.text }]}>
            {language === 'en' ? 'Find trusted local professionals in your neighborhood' : 'በአካባቢዎ የሚገኙ አስተማማኝ ባለሙያዎችን ያግኙ'}
          </Text>
        </View>

        {/* Features List */}
        <View style={styles.features}>
          <View style={styles.featureRow}>
            <Text style={styles.featureIcon}>🔧</Text>
            <Text style={[styles.featureText, { color: isDark ? '#CCC' : BRAND.text }]}>
              {language === 'en' ? 'Home Maintenance & Repairs' : 'የቤት ጥገና እና እርማት'}
            </Text>
          </View>
          <View style={styles.featureRow}>
            <Text style={styles.featureIcon}>🧹</Text>
            <Text style={[styles.featureText, { color: isDark ? '#CCC' : BRAND.text }]}>
              {language === 'en' ? 'Cleaning & Domestic Services' : 'የጽዳት እና የቤት አገልግሎቶች'}
            </Text>
          </View>
          <View style={styles.featureRow}>
            <Text style={styles.featureIcon}>📚</Text>
            <Text style={[styles.featureText, { color: isDark ? '#CCC' : BRAND.text }]}>
              {language === 'en' ? 'Tutoring & Skill Training' : 'አጋዥ ትምህርት እና ክህሎት ስልጠና'}
            </Text>
          </View>
          <View style={styles.featureRow}>
            <Text style={styles.featureIcon}>📱</Text>
            <Text style={[styles.featureText, { color: isDark ? '#CCC' : BRAND.text }]}>
              {language === 'en' ? 'Technical & Digital Services' : 'ቴክኒካዊ እና ዲጂታል አገልግሎቶች'}
            </Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.loginBtn, { backgroundColor: BRAND.primary }]}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginBtnText}>{t('login') || 'Login'}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.registerBtn, { borderColor: BRAND.primary }]}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={[styles.registerBtnText, { color: BRAND.primary }]}>
              {t('create_account') || 'Create Account'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.guestBtn}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={[styles.guestBtnText, { color: isDark ? '#AAA' : BRAND.textLight }]}>
              {language === 'en' ? 'Browse as Guest →' : 'እንግዳ ሆነው ይመልከቱ →'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  langBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 20,
    backgroundColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    zIndex: 10,
  },
  langBtnText: { fontSize: 14, fontWeight: '600', color: '#111' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  logoContainer: { alignItems: 'center', marginBottom: 32 },
  logo: { width: 120, height: 120, borderRadius: 60, marginBottom: 16 },
  appName: { fontSize: 28, fontWeight: 'bold' },
  appSubtitle: { fontSize: 14, letterSpacing: 1 },
  taglineContainer: { marginBottom: 40 },
  tagline: { fontSize: 16, textAlign: 'center', lineHeight: 24, paddingHorizontal: 20 },
  features: { marginBottom: 40, width: '100%' },
  featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, paddingHorizontal: 20 },
  featureIcon: { fontSize: 24, marginRight: 12, width: 32 },
  featureText: { fontSize: 14, flex: 1 },
  buttonContainer: { width: '100%', gap: 12 },
  loginBtn: { borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  loginBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  registerBtn: { borderRadius: 12, paddingVertical: 16, alignItems: 'center', borderWidth: 2 },
  registerBtnText: { fontSize: 16, fontWeight: 'bold' },
  guestBtn: { alignItems: 'center', paddingVertical: 12 },
  guestBtnText: { fontSize: 14 },
});