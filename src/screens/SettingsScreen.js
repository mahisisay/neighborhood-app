// =============================================
//  src/screens/SettingsScreen.js
//  COMPLETE - Working Language, Theme, and About Page
//  REMOVED: Role Switcher (now handled by RoleSelectScreen)
// =============================================

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  TouchableOpacity, ScrollView, Alert,
  Modal
} from 'react-native';
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

export default function SettingsScreen({ navigation }) {
  const { logout } = useAuth();
  const { theme, language, updateTheme, updateLanguage, t } = useSettings();
  const [showLanguage, setShowLanguage] = useState(false);

  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    updateTheme(newTheme);
  };

  const isDark = theme === 'dark';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F9FAFB' }]}>
      <ScrollView contentContainerStyle={styles.inner}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backBtn, { color: BRAND.primary }]}>← {t('settings') || 'Settings'}</Text>
          </TouchableOpacity>
        </View>

        {/* App Settings Section */}
        <Text style={[styles.sectionTitle, { color: isDark ? '#AAA' : BRAND.textLight }]}>{t('app_settings') || 'App Settings'}</Text>
        <View style={[styles.card, { backgroundColor: isDark ? '#1E1E1E' : BRAND.white }]}>
          <TouchableOpacity style={styles.row} onPress={handleThemeToggle}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowIcon}>{theme === 'light' ? '☀️' : '🌙'}</Text>
              <Text style={[styles.rowLabel, { color: isDark ? '#FFF' : BRAND.text }]}>{t('app_theme') || 'App Theme'}</Text>
            </View>
            <Text style={[styles.rowValue, { color: isDark ? '#AAA' : BRAND.textLight }]}>
              {theme === 'light' ? (t('light') || 'Light') : (t('dark') || 'Dark')} →
            </Text>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: isDark ? '#333' : '#E5E7EB' }]} />

          <TouchableOpacity style={styles.row} onPress={() => setShowLanguage(true)}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowIcon}>🌐</Text>
              <Text style={[styles.rowLabel, { color: isDark ? '#FFF' : BRAND.text }]}>{t('app_language') || 'App Language'}</Text>
            </View>
            <Text style={[styles.rowValue, { color: isDark ? '#AAA' : BRAND.textLight }]}>
              {language === 'en' ? 'English' : 'አማርኛ'} →
            </Text>
          </TouchableOpacity>
        </View>

        {/* About Section - Navigates to About Screen */}
        <Text style={[styles.sectionTitle, { color: isDark ? '#AAA' : BRAND.textLight }]}>{t('about') || 'About'}</Text>
        <View style={[styles.card, { backgroundColor: isDark ? '#1E1E1E' : BRAND.white }]}>
          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('About')}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowIcon}>ℹ️</Text>
              <Text style={[styles.rowLabel, { color: isDark ? '#FFF' : BRAND.text }]}>{t('about_app') || 'About App'}</Text>
            </View>
            <Text style={styles.rowArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <View style={[styles.dangerCard, { backgroundColor: isDark ? '#1E1E1E' : BRAND.white }]}>
          <TouchableOpacity style={styles.row} onPress={logout}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowIcon}>🚪</Text>
              <Text style={[styles.dangerLabel, { color: BRAND.error }]}>{t('logout') || 'Logout'}</Text>
            </View>
            <Text style={styles.rowArrow}>→</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Language Modal */}
      <Modal visible={showLanguage} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: isDark ? '#1E1E1E' : BRAND.white }]}>
            <Text style={[styles.modalTitle, { color: isDark ? '#FFF' : BRAND.text }]}>{t('app_language') || 'Select Language'}</Text>

            <TouchableOpacity
              style={[styles.langOption, language === 'en' && { borderColor: BRAND.primary, backgroundColor: BRAND.primaryLight }]}
              onPress={() => { updateLanguage('en'); setShowLanguage(false); }}
            >
              <Text style={styles.langFlag}>🇬🇧</Text>
              <Text style={[styles.langLabel, language === 'en' && { color: BRAND.primary, fontWeight: '600' }]}>English</Text>
              {language === 'en' && <Text style={[styles.langCheck, { color: BRAND.primary }]}>✅</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.langOption, language === 'am' && { borderColor: BRAND.primary, backgroundColor: BRAND.primaryLight }]}
              onPress={() => { updateLanguage('am'); setShowLanguage(false); }}
            >
              <Text style={styles.langFlag}>🇪🇹</Text>
              <Text style={[styles.langLabel, language === 'am' && { color: BRAND.primary, fontWeight: '600' }]}>አማርኛ (Amharic)</Text>
              {language === 'am' && <Text style={[styles.langCheck, { color: BRAND.primary }]}>✅</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: BRAND.primaryLight }]} onPress={() => setShowLanguage(false)}>
              <Text style={[styles.modalBtnText, { color: BRAND.primary }]}>{t('cancel') || 'Cancel'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { padding: 20, gap: 12 },
  header: { marginBottom: 8 },
  backBtn: { fontSize: 16, fontWeight: '600' },
  sectionTitle: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 8 },
  card: { borderRadius: 14, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  dangerCard: { borderRadius: 14, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowIcon: { fontSize: 20 },
  rowLabel: { fontSize: 15 },
  dangerLabel: { fontSize: 15 },
  rowValue: { fontSize: 14 },
  rowArrow: { fontSize: 16, color: '#9CA3AF' },
  divider: { height: 0.5, marginLeft: 52 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, gap: 16 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  modalBtn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  modalBtnText: { fontSize: 16, fontWeight: '600' },
  langOption: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E7EB' },
  langFlag: { fontSize: 24 },
  langLabel: { fontSize: 16, flex: 1 },
  langCheck: { fontSize: 16 },
});