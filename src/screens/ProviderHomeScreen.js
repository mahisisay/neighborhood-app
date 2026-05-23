// =============================================
//  src/screens/ProviderHomeScreen.js
//  WITH FULL AMHARIC SUPPORT
// =============================================

import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  TouchableOpacity, ScrollView, Alert,
  ActivityIndicator, RefreshControl
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { providerAPI, requestAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import * as Location from 'expo-location';

const BRAND = {
  primary: '#2E7D32',
  primaryLight: '#E8F5E9',
  secondary: '#F9A825',
  text: '#374151',
  textLight: '#6B7280',
  white: '#FFFFFF',
  error: '#DC2626',
  success: '#10B981',
};

export default function ProviderHomeScreen({ navigation }) {
  const { user } = useAuth();
  const { t, theme } = useSettings();
  const [isOnline, setIsOnline] = useState(false);
  const [stats, setStats] = useState({ offered: 0, accepted: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [location, setLocation] = useState(null);

  const isDark = theme === 'dark';

  useFocusEffect(
    useCallback(() => {
      loadStats();
      getLocation();
    }, [])
  );

  async function getLocation() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      }
    } catch (err) {
      console.log('Location error:', err);
    }
  }

  async function loadStats() {
    try {
      const offered = await requestAPI.getOffered();
      const accepted = await requestAPI.getMyRequests ? await requestAPI.getMyRequests() : { requests: [] };
      setStats({
        offered: offered.jobs?.length || 0,
        accepted: accepted.requests?.filter(r => r.status === 'assigned').length || 0,
        completed: accepted.requests?.filter(r => r.status === 'completed').length || 0,
      });
    } catch (err) {
      console.log('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  }

  async function toggleOnlineStatus() {
    if (!location) {
      Alert.alert(t('location_required'), t('enable_gps'));
      return;
    }
    
    setToggling(true);
    try {
      const data = await providerAPI.toggleStatus({
        latitude: location.latitude,
        longitude: location.longitude
      });
      setIsOnline(data.is_online);
      Alert.alert(t('status_updated'), data.message);
    } catch (err) {
      Alert.alert(t('error'), err.message);
    } finally {
      setToggling(false);
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F9FAFB' }]}>
      <ScrollView 
        contentContainerStyle={styles.inner}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadStats} />}
      >
        <View style={styles.welcomeSection}>
          <Text style={[styles.welcomeText, { color: isDark ? '#FFF' : BRAND.text }]}>
            {t('welcome_back')}, 👋
          </Text>
          <Text style={[styles.providerName, { color: BRAND.primary }]}>
            {user?.name?.split(' ')[0] || t('provider')}
          </Text>
          <Text style={[styles.roleBadge, { backgroundColor: BRAND.primaryLight, color: BRAND.primary }]}>
            👷 {t('provider')}
          </Text>
        </View>

        <View style={[styles.statusCard, { backgroundColor: isDark ? '#1E1E1E' : BRAND.white }]}>
          <View style={styles.statusRow}>
            <Text style={[styles.statusLabel, { color: isDark ? '#FFF' : BRAND.text }]}>{t('online_status')}</Text>
            <View style={[styles.statusDot, { backgroundColor: isOnline ? BRAND.success : BRAND.error }]} />
            <Text style={[styles.statusValue, { color: isOnline ? BRAND.success : BRAND.error }]}>
              {isOnline ? t('online') : t('offline')}
            </Text>
          </View>
          
          <TouchableOpacity
            style={[styles.toggleBtn, { backgroundColor: isOnline ? BRAND.error : BRAND.primary }]}
            onPress={toggleOnlineStatus}
            disabled={toggling}
          >
            {toggling ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.toggleBtnText}>
                {isOnline ? t('go_offline') : t('go_online')}
              </Text>
            )}
          </TouchableOpacity>
          
          <Text style={[styles.statusHint, { color: isDark ? '#AAA' : BRAND.textLight }]}>
            {isOnline ? t('online_hint') : t('offline_hint')}
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : BRAND.text }]}>{t('your_dashboard')}</Text>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: isDark ? '#1E1E1E' : BRAND.white }]}>
            <Text style={styles.statIcon}>📋</Text>
            <Text style={[styles.statNumber, { color: BRAND.primary }]}>{stats.offered}</Text>
            <Text style={[styles.statLabel, { color: isDark ? '#AAA' : BRAND.textLight }]}>{t('offered_jobs')}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: isDark ? '#1E1E1E' : BRAND.white }]}>
            <Text style={styles.statIcon}>✅</Text>
            <Text style={[styles.statNumber, { color: BRAND.primary }]}>{stats.accepted}</Text>
            <Text style={[styles.statLabel, { color: isDark ? '#AAA' : BRAND.textLight }]}>{t('accepted_jobs')}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: isDark ? '#1E1E1E' : BRAND.white }]}>
            <Text style={styles.statIcon}>🏁</Text>
            <Text style={[styles.statNumber, { color: BRAND.primary }]}>{stats.completed}</Text>
            <Text style={[styles.statLabel, { color: isDark ? '#AAA' : BRAND.textLight }]}>{t('completed_jobs')}</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : BRAND.text }]}>{t('quick_actions')}</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: isDark ? '#1E1E1E' : BRAND.white }]}
            onPress={() => navigation.navigate('OfferedJobs')}
          >
            <Text style={styles.actionIcon}>📋</Text>
            <Text style={[styles.actionLabel, { color: isDark ? '#FFF' : BRAND.text }]}>{t('view_offered_jobs')}</Text>
            <Text style={[styles.actionBadge, { backgroundColor: BRAND.primary, color: BRAND.white }]}>
              {stats.offered}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: isDark ? '#1E1E1E' : BRAND.white }]}
            onPress={() => navigation.navigate('AcceptedJobs')}
          >
            <Text style={styles.actionIcon}>✅</Text>
            <Text style={[styles.actionLabel, { color: isDark ? '#FFF' : BRAND.text }]}>{t('my_accepted_jobs')}</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.tipsCard, { backgroundColor: BRAND.secondaryLight, borderLeftColor: BRAND.secondary }]}>
          <Text style={[styles.tipsTitle, { color: '#92400E' }]}>{t('pro_tip')}</Text>
          <Text style={[styles.tipsText, { color: '#92400E' }]}>
            {t('pro_tip_text')}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { padding: 20, gap: 20 },
  welcomeSection: { marginBottom: 8 },
  welcomeText: { fontSize: 16, marginBottom: 4 },
  providerName: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  roleBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, fontSize: 12, fontWeight: '600' },
  statusCard: { borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  statusLabel: { fontSize: 15, fontWeight: '600', flex: 1 },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  statusValue: { fontSize: 14, fontWeight: '600' },
  toggleBtn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 12 },
  toggleBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  statusHint: { fontSize: 12, textAlign: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  statsGrid: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, borderRadius: 12, padding: 14, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  statIcon: { fontSize: 28, marginBottom: 8 },
  statNumber: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  statLabel: { fontSize: 12 },
  actionGrid: { gap: 12 },
  actionCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  actionIcon: { fontSize: 28, marginRight: 16 },
  actionLabel: { flex: 1, fontSize: 15, fontWeight: '500' },
  actionBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, fontSize: 12, fontWeight: 'bold' },
  tipsCard: { borderRadius: 12, padding: 16, borderLeftWidth: 4 },
  tipsTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
  tipsText: { fontSize: 13, lineHeight: 18 },
});