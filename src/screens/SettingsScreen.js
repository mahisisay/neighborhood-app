// =============================================
//  src/screens/SettingsScreen.js
//  BRAND COLORS: Ethiopian Green (#2E7D32) + Gold (#F9A825)
//  With Role Switcher for both roles
// =============================================

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  TouchableOpacity, ScrollView, Alert,
  Modal, ActivityIndicator
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
  const { logout, user, switchRole, getAvailableRoles } = useAuth();
  const { theme, language, updateTheme, updateLanguage, t } = useSettings();
  const [switching, setSwitching] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);

  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    updateTheme(newTheme);
  };

  const handleSwitchRole = async (newRole) => {
    setSwitching(true);
    try {
      const success = await switchRole(newRole);
      if (success) {
        Alert.alert(
          'Role Switched',
          `You are now in ${newRole === 'seeker' ? '🔍 Seeker' : '👷 Provider'} mode`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Error', 'Could not switch role. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setSwitching(false);
    }
  };

  const availableRoles = getAvailableRoles?.() || [];
  const hasBothRoles = user?.has_both_roles === true || user?.has_both_roles === 1;
  const isDark = theme === 'dark';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F9FAFB' }]}>
      <ScrollView contentContainerStyle={styles.inner}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backBtn, { color: BRAND.primary }]}>← Settings</Text>
          </TouchableOpacity>
        </View>

        {/* Role Switcher Section */}
        {hasBothRoles && (
          <>
            <Text style={[styles.sectionTitle, { color: isDark ? '#AAA' : BRAND.textLight }]}>🔄 Switch Role</Text>
            <View style={[styles.roleSwitcherCard, { backgroundColor: isDark ? '#1E3A5F' : BRAND.primaryLight }]}>
              <Text style={[styles.roleSwitcherTitle, { color: isDark ? '#FFF' : BRAND.text }]}>
                Current Mode: {user?.active_role === 'seeker' ? '🔍 Seeker' : '👷 Provider'}
              </Text>
              <Text style={[styles.roleSwitcherDesc, { color: isDark ? '#AAA' : BRAND.textLight }]}>
                You have both roles. Switch between them anytime.
              </Text>
              <View style={styles.roleButtonsRow}>
                <TouchableOpacity
                  style={[
                    styles.roleSwitchBtn,
                    user?.active_role === 'seeker' && { backgroundColor: BRAND.primary }
                  ]}
                  onPress={() => handleSwitchRole('seeker')}
                  disabled={switching || user?.active_role === 'seeker'}
                >
                  {switching ? (
                    <ActivityIndicator size="small" color={BRAND.primary} />
                  ) : (
                    <Text style={user?.active_role === 'seeker' ? styles.roleSwitchTextActive : [styles.roleSwitchText, { color: BRAND.text }]}>
                      🔍 Seeker Mode
                    </Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.roleSwitchBtn,
                    user?.active_role === 'provider' && { backgroundColor: BRAND.primary }
                  ]}
                  onPress={() => handleSwitchRole('provider')}
                  disabled={switching || user?.active_role === 'provider'}
                >
                  <Text style={user?.active_role === 'provider' ? styles.roleSwitchTextActive : [styles.roleSwitchText, { color: BRAND.text }]}>
                    👷 Provider Mode
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        {/* App Settings Section */}
        <Text style={[styles.sectionTitle, { color: isDark ? '#AAA' : BRAND.textLight }]}>App Settings</Text>
        <View style={[styles.card, { backgroundColor: isDark ? '#1E1E1E' : BRAND.white }]}>
          <TouchableOpacity style={styles.row} onPress={handleThemeToggle}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowIcon}>☀️</Text>
              <Text style={[styles.rowLabel, { color: isDark ? '#FFF' : BRAND.text }]}>App Theme</Text>
            </View>
            <Text style={[styles.rowValue, { color: isDark ? '#AAA' : BRAND.textLight }]}>
              {theme === 'light' ? 'Light' : 'Dark'} →
            </Text>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: isDark ? '#333' : '#E5E7EB' }]} />

          <TouchableOpacity style={styles.row} onPress={() => setShowLanguage(true)}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowIcon}>🌐</Text>
              <Text style={[styles.rowLabel, { color: isDark ? '#FFF' : BRAND.text }]}>App Language</Text>
            </View>
            <Text style={[styles.rowValue, { color: isDark ? '#AAA' : BRAND.textLight }]}>
              {language === 'en' ? 'English' : 'አማርኛ'} →
            </Text>
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <Text style={[styles.sectionTitle, { color: isDark ? '#AAA' : BRAND.textLight }]}>About</Text>
        <View style={[styles.card, { backgroundColor: isDark ? '#1E1E1E' : BRAND.white }]}>
          <TouchableOpacity style={styles.row} onPress={() => setShowAbout(true)}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowIcon}>ℹ️</Text>
              <Text style={[styles.rowLabel, { color: isDark ? '#FFF' : BRAND.text }]}>About App</Text>
            </View>
            <Text style={styles.rowArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View style={[styles.dangerCard, { backgroundColor: isDark ? '#1E1E1E' : BRAND.white }]}>
          <TouchableOpacity style={styles.row} onPress={logout}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowIcon}>🚪</Text>
              <Text style={[styles.dangerLabel, { color: BRAND.error }]}>Logout</Text>
            </View>
            <Text style={styles.rowArrow}>→</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* About Modal */}
      <Modal visible={showAbout} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: isDark ? '#1E1E1E' : BRAND.white }]}>
            <Text style={[styles.modalTitle, { color: isDark ? '#FFF' : BRAND.text }]}>🏘️ Neighborhood Service Finder</Text>
            <Text style={[styles.modalDesc, { color: isDark ? '#AAA' : BRAND.textLight }]}>
              Connect with trusted local service providers in Gondar city.
            </Text>
            <View style={[styles.modalInfo, { backgroundColor: isDark ? '#2C2C2C' : '#F9FAFB' }]}>
              <Text style={[styles.modalInfoRow, { color: isDark ? '#CCC' : BRAND.text }]}>Version: 1.0.0</Text>
              <Text style={[styles.modalInfoRow, { color: isDark ? '#CCC' : BRAND.text }]}>Developer: Mahlat</Text>
              <Text style={[styles.modalInfoRow, { color: isDark ? '#CCC' : BRAND.text }]}>📍 Gondar, Ethiopia</Text>
            </View>
            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: BRAND.primaryLight }]} onPress={() => setShowAbout(false)}>
              <Text style={[styles.modalBtnText, { color: BRAND.primary }]}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Language Modal */}
      <Modal visible={showLanguage} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: isDark ? '#1E1E1E' : BRAND.white }]}>
            <Text style={[styles.modalTitle, { color: isDark ? '#FFF' : BRAND.text }]}>Select Language</Text>

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
              <Text style={[styles.modalBtnText, { color: BRAND.primary }]}>Cancel</Text>
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
  roleSwitcherCard: { borderRadius: 14, padding: 16, gap: 12, marginBottom: 8 },
  roleSwitcherTitle: { fontSize: 16, fontWeight: 'bold' },
  roleSwitcherDesc: { fontSize: 13 },
  roleButtonsRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  roleSwitchBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', backgroundColor: '#E5E7EB' },
  roleSwitchText: { fontSize: 14 },
  roleSwitchTextActive: { fontSize: 14, color: '#FFF', fontWeight: 'bold' },
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
  modalDesc: { fontSize: 14, lineHeight: 22, textAlign: 'center' },
  modalInfo: { borderRadius: 12, padding: 16, gap: 8 },
  modalInfoRow: { fontSize: 14 },
  modalBtn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  modalBtnText: { fontSize: 16, fontWeight: '600' },
  langOption: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E7EB' },
  langFlag: { fontSize: 24 },
  langLabel: { fontSize: 16, flex: 1 },
  langCheck: { fontSize: 16 },
});