// src/screens/RoleSelectScreen.js
import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

const BRAND = {
  primary: '#2E7D32',
  primaryLight: '#E8F5E9',
  text: '#374151',
  textLight: '#6B7280',
  white: '#FFFFFF',
  error: '#DC2626',
};

export default function RoleSelectScreen({ navigation }) {
  const { user, logout, hasProviderRole, hasSeekerRole } = useAuth();
  const { theme, t } = useSettings();
  const isDark = theme === 'dark';

  const canBeSeeker = hasSeekerRole();
  const canBeProvider = hasProviderRole();

  const handleSelectSeeker = () => {
    navigation.replace('SeekerTabs');
  };

  const handleSelectProvider = () => {
    navigation.replace('ProviderTabs');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F9FAFB' }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: isDark ? '#FFF' : BRAND.text }]}>
          {t('welcome_user')}, {user?.name} 👋
        </Text>
        <Text style={[styles.subtitle, { color: isDark ? '#AAA' : BRAND.textLight }]}>
          {t('choose_role')}
        </Text>

        <View style={styles.roleContainer}>
          {canBeSeeker && (
            <TouchableOpacity
              style={[styles.roleCard, { backgroundColor: isDark ? '#1E1E1E' : BRAND.white }]}
              onPress={handleSelectSeeker}
            >
              <Text style={styles.roleIcon}>🔍</Text>
              <Text style={[styles.roleTitle, { color: isDark ? '#FFF' : BRAND.text }]}>
                {t('need_service')}
              </Text>
              <Text style={[styles.roleDesc, { color: isDark ? '#AAA' : BRAND.textLight }]}>
                {t('need_service_desc')}
              </Text>
            </TouchableOpacity>
          )}

          {canBeProvider && (
            <TouchableOpacity
              style={[styles.roleCard, { backgroundColor: isDark ? '#1E1E1E' : BRAND.white }]}
              onPress={handleSelectProvider}
            >
              <Text style={styles.roleIcon}>👷</Text>
              <Text style={[styles.roleTitle, { color: isDark ? '#FFF' : BRAND.text }]}>
                {t('offer_service')}
              </Text>
              <Text style={[styles.roleDesc, { color: isDark ? '#AAA' : BRAND.textLight }]}>
                {t('offer_service_desc')}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: isDark ? '#2C2C2C' : '#F3F4F6' }]}
          onPress={logout}
        >
          <Text style={[styles.logoutText, { color: BRAND.error }]}>{t('logout')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, textAlign: 'center', marginBottom: 40 },
  roleContainer: { gap: 16 },
  roleCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  roleIcon: { fontSize: 48, marginBottom: 12 },
  roleTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  roleDesc: { fontSize: 13, textAlign: 'center' },
  logoutBtn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 32 },
  logoutText: { fontSize: 16, fontWeight: '600' },
});