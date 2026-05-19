// src/screens/SettingsScreen.js
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  TouchableOpacity, ScrollView, Alert,
  Modal
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

export default function SettingsScreen({ navigation }) {
  const { logout } = useAuth();
  const { theme, language, updateTheme, updateLanguage, t } = useSettings();

  const [showAbout, setShowAbout] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);

  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    updateTheme(newTheme);
    Alert.alert(t('app_theme'), newTheme === 'dark' ? t('dark') : t('light'));
  };

  const handleChangePassword = () => {
    Alert.alert(t('change_password'), t('coming_soon'));
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('delete_account') || 'Delete Account',
      t('confirm_delete') || 'Are you sure?',
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            await logout();
          }
        }
      ]
    );
  };

  // Dynamic styles based on theme
  const dynamicStyles = {
    container: { backgroundColor: theme === 'dark' ? '#121212' : '#f9fafb' },
    card: { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' },
    text: { color: theme === 'dark' ? '#fff' : '#111' },
    subtext: { color: theme === 'dark' ? '#aaa' : '#6b7280' },
    border: { borderBottomColor: theme === 'dark' ? '#333' : '#e5e7eb' },
    sectionTitle: { color: theme === 'dark' ? '#aaa' : '#9ca3af' },
  };

  return (
    <SafeAreaView style={[styles.container, dynamicStyles.container]}>
      <ScrollView contentContainerStyle={styles.inner}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backBtn}>← {t('settings')}</Text>
          </TouchableOpacity>
        </View>

        {/* App Settings Section */}
        <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>{t('app_settings')}</Text>
        <View style={[styles.card, dynamicStyles.card]}>

          {/* Theme Toggle */}
          <TouchableOpacity style={styles.row} onPress={handleThemeToggle}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowIcon}>☀️</Text>
              <Text style={[styles.rowLabel, dynamicStyles.text]}>{t('app_theme')}</Text>
            </View>
            <Text style={[styles.rowValue, dynamicStyles.subtext]}>
              {theme === 'light' ? t('light') : t('dark')} →
            </Text>
          </TouchableOpacity>

          <View style={[styles.divider, dynamicStyles.border]} />

          {/* Change Password */}
          <TouchableOpacity style={styles.row} onPress={handleChangePassword}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowIcon}>🔒</Text>
              <Text style={[styles.rowLabel, dynamicStyles.text]}>{t('change_password')}</Text>
            </View>
            <Text style={styles.rowArrow}>→</Text>
          </TouchableOpacity>

          <View style={[styles.divider, dynamicStyles.border]} />

          {/* App Language */}
          <TouchableOpacity style={styles.row} onPress={() => setShowLanguage(true)}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowIcon}>🌐</Text>
              <Text style={[styles.rowLabel, dynamicStyles.text]}>{t('app_language')}</Text>
            </View>
            <Text style={[styles.rowValue, dynamicStyles.subtext]}>
              {language === 'en' ? 'English' : 'አማርኛ'} →
            </Text>
          </TouchableOpacity>

        </View>

        {/* About Section */}
        <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>{t('about')}</Text>
        <View style={[styles.card, dynamicStyles.card]}>
          <TouchableOpacity style={styles.row} onPress={() => setShowAbout(true)}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowIcon}>ℹ️</Text>
              <Text style={[styles.rowLabel, dynamicStyles.text]}>{t('about_app')}</Text>
            </View>
            <Text style={styles.rowArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View style={[styles.dangerCard, dynamicStyles.card]}>
          <TouchableOpacity style={styles.row} onPress={handleDeleteAccount}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowIcon}>🗑️</Text>
              <Text style={styles.dangerLabel}>{t('delete_account')}</Text>
            </View>
            <Text style={styles.rowArrow}>→</Text>
          </TouchableOpacity>

          <View style={[styles.divider, dynamicStyles.border]} />

          <TouchableOpacity style={styles.row} onPress={logout}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowIcon}>🚪</Text>
              <Text style={styles.dangerLabel}>{t('logout')}</Text>
            </View>
            <Text style={styles.rowArrow}>→</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* About Modal */}
      <Modal visible={showAbout} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, dynamicStyles.card]}>
            <Text style={[styles.modalTitle, dynamicStyles.text]}>🏘️ {t('app_name')}</Text>
            <Text style={[styles.modalDesc, dynamicStyles.subtext]}>Neighborhood Service Finder connects residents with trusted local professionals in Gondar city.</Text>
            <View style={[styles.modalInfo, { backgroundColor: theme === 'dark' ? '#333' : '#f9fafb' }]}>
              <Text style={[styles.modalInfoRow, dynamicStyles.subtext]}>Version: 1.0.0</Text>
              <Text style={[styles.modalInfoRow, dynamicStyles.subtext]}>Developer: Mahlat</Text>
              <Text style={[styles.modalInfoRow, dynamicStyles.subtext]}>📍 Gondar, Ethiopia</Text>
            </View>
            <TouchableOpacity style={styles.modalBtn} onPress={() => setShowAbout(false)}>
              <Text style={styles.modalBtnText}>{t('ok')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Language Modal */}
      <Modal visible={showLanguage} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, dynamicStyles.card]}>
            <Text style={[styles.modalTitle, dynamicStyles.text]}>{t('app_language')}</Text>

            <TouchableOpacity
              style={[styles.langOption, language === 'en' && styles.langOptionActive]}
              onPress={() => { updateLanguage('en'); setShowLanguage(false); }}
            >
              <Text style={styles.langFlag}>🇬🇧</Text>
              <Text style={[styles.langLabel, language === 'en' && styles.langLabelActive]}>English</Text>
              {language === 'en' && <Text style={styles.langCheck}>✅</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.langOption, language === 'am' && styles.langOptionActive]}
              onPress={() => { updateLanguage('am'); setShowLanguage(false); }}
            >
              <Text style={styles.langFlag}>🇪🇹</Text>
              <Text style={[styles.langLabel, language === 'am' && styles.langLabelActive]}>አማርኛ (Amharic)</Text>
              {language === 'am' && <Text style={styles.langCheck}>✅</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalBtn} onPress={() => setShowLanguage(false)}>
              <Text style={styles.modalBtnText}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1 },
  inner:            { padding: 20, gap: 12 },
  header:           { marginBottom: 8 },
  backBtn:          { fontSize: 16, color: '#1a56db', fontWeight: '600' },
  sectionTitle:     { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 8 },
  card:             { borderRadius: 14, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  dangerCard:       { borderRadius: 14, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  row:              { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  rowLeft:          { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowIcon:          { fontSize: 20 },
  rowLabel:         { fontSize: 15 },
  dangerLabel:      { fontSize: 15, color: '#ef4444' },
  rowValue:         { fontSize: 14 },
  rowArrow:         { fontSize: 16, color: '#9ca3af' },
  divider:          { height: 0.5, marginLeft: 52 },
  modalOverlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal:            { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, gap: 16 },
  modalTitle:       { fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  modalDesc:        { fontSize: 14, lineHeight: 22, textAlign: 'center' },
  modalInfo:        { borderRadius: 12, padding: 16, gap: 8 },
  modalInfoRow:     { fontSize: 14 },
  modalBtn:         { borderRadius: 12, paddingVertical: 14, alignItems: 'center', backgroundColor: '#f3f4f6' },
  modalBtnText:     { fontSize: 16, color: '#374151', fontWeight: '600' },
  langOption:       { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 12, borderWidth: 1.5, borderColor: '#e5e7eb' },
  langOptionActive: { borderColor: '#1a56db', backgroundColor: '#eff6ff' },
  langFlag:         { fontSize: 24 },
  langLabel:        { fontSize: 16, color: '#374151', flex: 1 },
  langLabelActive:  { color: '#1a56db', fontWeight: '600' },
  langCheck:        { fontSize: 16 },
});