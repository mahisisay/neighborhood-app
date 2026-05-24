// src/screens/SettingsScreen.js
// FULLY WORKING LOGOUT - Same UI design

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  TouchableOpacity, ScrollView, Alert,
  Modal
} from 'react-native';
import { CommonActions } from '@react-navigation/native';
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

const translations = {
  en: {
    settings: 'Settings',
    back: 'Back',
    app_settings: 'App Settings',
    app_theme: 'App Theme',
    light: 'Light',
    dark: 'Dark',
    app_language: 'App Language',
    english: 'English',
    amharic: 'Amharic',
    about: 'About',
    about_app: 'About App',
    logout: 'Logout',
    logout_confirm: 'Are you sure you want to logout?',
    cancel: 'Cancel',
    logged_in_as: 'Logged in as:',
    role: 'Role',
    seeker: 'Seeker',
    provider: 'Provider',
    admin: 'Admin',
    select_language: 'Select Language',
    language_selected: 'Selected'
  },
  am: {
    settings: 'ቅንብሮች',
    back: 'ተመለስ',
    app_settings: 'የአፕል ቅንብሮች',
    app_theme: 'የአፕል ገጽታ',
    light: 'ብርሃን',
    dark: 'ጨለማ',
    app_language: 'የአፕል ቋንቋ',
    english: 'እንግሊዝኛ',
    amharic: 'አማርኛ',
    about: 'ስለ አፕል',
    about_app: 'ስለ አፕል',
    logout: 'ውጣ',
    logout_confirm: 'ከመውጣትዎ እርግጠኛ ነዎት?',
    cancel: 'ተወው',
    logged_in_as: 'እንደሚከተለው ገብተዋል:',
    role: 'ሚና',
    seeker: 'ፈላጊ',
    provider: 'አገልግሎት ሰጪ',
    admin: 'አስተዳዳሪ',
    select_language: 'ቋንቋ ይምረጡ',
    language_selected: 'ተመርጧል'
  }
};

export default function SettingsScreen({ navigation }) {
  const { logout, user } = useAuth();
  const { theme, language, updateTheme, updateLanguage } = useSettings();
  const [showLanguage, setShowLanguage] = useState(false);

  const t = translations[language] || translations.en;
  const isDark = theme === 'dark';

  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    updateTheme(newTheme);
  };

  const handleLogout = () => {
    Alert.alert(
      t.logout,
      t.logout_confirm,
      [
        { text: t.cancel, style: 'cancel' },
        { 
          text: t.logout, 
          style: 'destructive',
          onPress: () => {
            // Clear auth state
            logout();
            // Reset navigation to Login screen
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              })
            );
          }
        }
      ]
    );
  };

  const getUserRoleDisplay = () => {
    const role = user?.role || 'seeker';
    switch(role) {
      case 'seeker': return t.seeker;
      case 'provider': return t.provider;
      case 'admin': return t.admin;
      default: return t.seeker;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F9FAFB' }]}>
      <ScrollView contentContainerStyle={styles.inner}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backBtn, { color: BRAND.primary }]}>
              {t.back}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: isDark ? '#FFF' : BRAND.text }]}>
            {t.settings}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* User Info Section */}
        <View style={[styles.userCard, { backgroundColor: isDark ? '#1E1E1E' : BRAND.white }]}>
          <Text style={[styles.userLabel, { color: isDark ? '#AAA' : BRAND.textLight }]}>
            {t.logged_in_as}
          </Text>
          <Text style={[styles.userEmail, { color: isDark ? '#FFF' : BRAND.text }]}>
            {user?.email || 'user@example.com'}
          </Text>
          <View style={styles.userRoleBadge}>
            <Text style={[styles.userRole, { color: BRAND.primary }]}>
              {t.role}: {getUserRoleDisplay()}
            </Text>
          </View>
        </View>

        {/* App Settings Section */}
        <Text style={[styles.sectionTitle, { color: isDark ? '#AAA' : BRAND.textLight }]}>
          {t.app_settings}
        </Text>
        
        <View style={[styles.card, { backgroundColor: isDark ? '#1E1E1E' : BRAND.white }]}>
          <TouchableOpacity style={styles.row} onPress={handleThemeToggle}>
            <View style={styles.rowLeft}>
              <Text style={[styles.rowIcon, { color: isDark ? '#FFF' : BRAND.text }]}>
                {theme === 'light' ? '☀️' : '🌙'}
              </Text>
              <Text style={[styles.rowLabel, { color: isDark ? '#FFF' : BRAND.text }]}>
                {t.app_theme}
              </Text>
            </View>
            <Text style={[styles.rowValue, { color: isDark ? '#AAA' : BRAND.textLight }]}>
              {theme === 'light' ? t.light : t.dark}
            </Text>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: isDark ? '#333' : '#E5E7EB' }]} />

          <TouchableOpacity style={styles.row} onPress={() => setShowLanguage(true)}>
            <View style={styles.rowLeft}>
              <Text style={[styles.rowIcon, { color: isDark ? '#FFF' : BRAND.text }]}>
                🌐
              </Text>
              <Text style={[styles.rowLabel, { color: isDark ? '#FFF' : BRAND.text }]}>
                {t.app_language}
              </Text>
            </View>
            <Text style={[styles.rowValue, { color: isDark ? '#AAA' : BRAND.textLight }]}>
              {language === 'en' ? t.english : t.amharic}
            </Text>
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <Text style={[styles.sectionTitle, { color: isDark ? '#AAA' : BRAND.textLight }]}>
          {t.about}
        </Text>
        
        <View style={[styles.card, { backgroundColor: isDark ? '#1E1E1E' : BRAND.white }]}>
          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('About')}>
            <View style={styles.rowLeft}>
              <Text style={[styles.rowIcon, { color: isDark ? '#FFF' : BRAND.text }]}>
                ℹ️
              </Text>
              <Text style={[styles.rowLabel, { color: isDark ? '#FFF' : BRAND.text }]}>
                {t.about_app}
              </Text>
            </View>
            <Text style={[styles.rowArrow, { color: isDark ? '#AAA' : '#9CA3AF' }]}>
              →
            </Text>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <View style={[styles.dangerCard, { backgroundColor: isDark ? '#1E1E1E' : BRAND.white, marginTop: 20 }]}>
          <TouchableOpacity style={styles.row} onPress={handleLogout}>
            <View style={styles.rowLeft}>
              <Text style={[styles.rowIcon, { color: BRAND.error }]}>
                🚪
              </Text>
              <Text style={[styles.dangerLabel, { color: BRAND.error }]}>
                {t.logout}
              </Text>
            </View>
            <Text style={[styles.rowArrow, { color: isDark ? '#AAA' : '#9CA3AF' }]}>
              →
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Language Modal */}
      <Modal 
        visible={showLanguage} 
        transparent 
        animationType="slide"
        onRequestClose={() => setShowLanguage(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: isDark ? '#1E1E1E' : BRAND.white }]}>
            <Text style={[styles.modalTitle, { color: isDark ? '#FFF' : BRAND.text }]}>
              {t.select_language}
            </Text>

            <TouchableOpacity
              style={[styles.langOption, language === 'en' && { borderColor: BRAND.primary, backgroundColor: BRAND.primaryLight }]}
              onPress={() => { updateLanguage('en'); setShowLanguage(false); }}
            >
              <Text style={styles.langFlag}>🇬🇧</Text>
              <Text style={[styles.langLabel, language === 'en' && { color: BRAND.primary, fontWeight: '600' }]}>
                {t.english}
              </Text>
              {language === 'en' && (
                <Text style={[styles.langCheck, { color: BRAND.primary }]}>
                  ✓
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.langOption, language === 'am' && { borderColor: BRAND.primary, backgroundColor: BRAND.primaryLight }]}
              onPress={() => { updateLanguage('am'); setShowLanguage(false); }}
            >
              <Text style={styles.langFlag}>🇪🇹</Text>
              <Text style={[styles.langLabel, language === 'am' && { color: BRAND.primary, fontWeight: '600' }]}>
                {t.amharic}
              </Text>
              {language === 'am' && (
                <Text style={[styles.langCheck, { color: BRAND.primary }]}>
                  ✓
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.modalBtn, { backgroundColor: BRAND.primaryLight }]} 
              onPress={() => setShowLanguage(false)}
            >
              <Text style={[styles.modalBtnText, { color: BRAND.primary }]}>
                {t.cancel}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { padding: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backBtn: { fontSize: 16, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  sectionTitle: { 
    fontSize: 13, 
    fontWeight: '600', 
    textTransform: 'uppercase', 
    letterSpacing: 0.5, 
    marginTop: 16,
    marginBottom: 8,
  },
  card: { 
    borderRadius: 14, 
    overflow: 'hidden', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.06, 
    shadowRadius: 8, 
    elevation: 3 
  },
  dangerCard: { 
    borderRadius: 14, 
    overflow: 'hidden', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.06, 
    shadowRadius: 8, 
    elevation: 3,
    marginTop: 20,
  },
  userCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  userLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  userRoleBadge: {
    backgroundColor: BRAND.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  userRole: {
    fontSize: 12,
    fontWeight: '600',
  },
  row: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    paddingVertical: 14 
  },
  rowLeft: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12 
  },
  rowIcon: { 
    fontSize: 18,
  },
  rowLabel: { 
    fontSize: 15,
    fontWeight: '500',
  },
  dangerLabel: { 
    fontSize: 15,
    fontWeight: '600',
  },
  rowValue: { 
    fontSize: 14,
  },
  rowArrow: { 
    fontSize: 16,
  },
  divider: { 
    height: 0.5, 
    marginLeft: 52 
  },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'flex-end' 
  },
  modal: { 
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20, 
    padding: 24, 
    gap: 16 
  },
  modalTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    textAlign: 'center',
    marginBottom: 8,
  },
  modalBtn: { 
    borderRadius: 12, 
    paddingVertical: 14, 
    alignItems: 'center',
    marginTop: 8,
  },
  modalBtnText: { 
    fontSize: 16, 
    fontWeight: '600' 
  },
  langOption: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12, 
    padding: 14, 
    borderRadius: 12, 
    borderWidth: 1.5, 
    borderColor: '#E5E7EB' 
  },
  langFlag: { 
    fontSize: 24,
  },
  langLabel: { 
    fontSize: 16, 
    flex: 1,
  },
  langCheck: { 
    fontSize: 18,
    fontWeight: 'bold',
  },
});