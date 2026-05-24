// =============================================
//  src/screens/AdminDashboardScreen.js
//  WITH FULL AMHARIC SUPPORT - FIXED API COMPATIBILITY
// =============================================

import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  ScrollView, TouchableOpacity, Alert,
  ActivityIndicator, RefreshControl, Linking
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { adminAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

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

export default function AdminDashboardScreen() {
  const { user } = useAuth();
  const { theme, t } = useSettings();
  const [stats, setStats] = useState({
    total_seekers: 0, 
    active_providers: 0, 
    pending_providers: 0,
    total_requests: 0, 
    completed_jobs: 0, 
    total_revenue_ETB: '0'
  });
  const [pendingProviders, setPendingProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const isDark = theme === 'dark';

  useFocusEffect(
    useCallback(() => { loadData(); }, [])
  );

  async function loadData() {
    try {
      const [statsData, pendingData] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getPending()
      ]);
      
      // Handle different API response formats
      const apiStats = statsData.stats || statsData;
      
      setStats({
        total_seekers: apiStats.totalSeekers || apiStats.total_seekers || 0,
        active_providers: apiStats.totalProviders || apiStats.active_providers || apiStats.totalProviders || 0,
        pending_providers: apiStats.pendingApprovals || apiStats.pending_providers || 0,
        total_requests: apiStats.totalRequests || apiStats.total_requests || 0,
        completed_jobs: apiStats.completedJobs || apiStats.completed_jobs || 0,
        total_revenue_ETB: apiStats.totalRevenue || apiStats.total_revenue_ETB || '0'
      });
      
      setPendingProviders(pendingData.providers || []);
    } catch (err) {
      console.log('Error loading admin data:', err);
      Alert.alert(t('error'), err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function handleVerify(providerId) {
    setProcessingId(providerId);
    try {
      await adminAPI.verifyProvider(providerId);
      Alert.alert(t('success'), t('provider_verified'));
      loadData();
    } catch (err) {
      Alert.alert(t('error'), err.message);
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(providerId) {
    Alert.alert(
      t('reject_provider'),
      t('reject_confirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('reject'),
          style: 'destructive',
          onPress: async () => {
            setProcessingId(providerId);
            try {
              await adminAPI.rejectProvider(providerId);
              Alert.alert(t('success'), t('provider_rejected'));
              loadData();
            } catch (err) {
              Alert.alert(t('error'), err.message);
            } finally {
              setProcessingId(null);
            }
          }
        }
      ]
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F9FAFB' }]}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={BRAND.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F9FAFB' }]}>
      <ScrollView
        contentContainerStyle={styles.inner}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: isDark ? '#FFF' : BRAND.text }]}>{t('admin_panel')}</Text>
          <Text style={[styles.adminName, { color: BRAND.primary }]}>👮 {user?.name || 'Admin'}</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: isDark ? '#1E1E1E' : BRAND.white }]}>
            <Text style={styles.statIcon}>🔍</Text>
            <Text style={[styles.statNumber, { color: BRAND.primary }]}>{stats.total_seekers}</Text>
            <Text style={[styles.statLabel, { color: isDark ? '#AAA' : BRAND.textLight }]}>{t('total_seekers')}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: isDark ? '#1E1E1E' : BRAND.white }]}>
            <Text style={styles.statIcon}>👷</Text>
            <Text style={[styles.statNumber, { color: BRAND.primary }]}>{stats.active_providers}</Text>
            <Text style={[styles.statLabel, { color: isDark ? '#AAA' : BRAND.textLight }]}>{t('active_providers')}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: isDark ? '#1E1E1E' : BRAND.white }]}>
            <Text style={styles.statIcon}>⏳</Text>
            <Text style={[styles.statNumber, { color: BRAND.secondary }]}>{stats.pending_providers}</Text>
            <Text style={[styles.statLabel, { color: isDark ? '#AAA' : BRAND.textLight }]}>{t('pending_providers')}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: isDark ? '#1E1E1E' : BRAND.white }]}>
            <Text style={styles.statIcon}>📋</Text>
            <Text style={[styles.statNumber, { color: BRAND.primary }]}>{stats.total_requests}</Text>
            <Text style={[styles.statLabel, { color: isDark ? '#AAA' : BRAND.textLight }]}>{t('total_requests')}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: isDark ? '#1E1E1E' : BRAND.white }]}>
            <Text style={styles.statIcon}>🏁</Text>
            <Text style={[styles.statNumber, { color: BRAND.primary }]}>{stats.completed_jobs}</Text>
            <Text style={[styles.statLabel, { color: isDark ? '#AAA' : BRAND.textLight }]}>{t('completed_jobs')}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: isDark ? '#1E1E1E' : BRAND.white }]}>
            <Text style={styles.statIcon}>💰</Text>
            <Text style={[styles.statNumber, { color: BRAND.secondary }]}>{stats.total_revenue_ETB}</Text>
            <Text style={[styles.statLabel, { color: isDark ? '#AAA' : BRAND.textLight }]}>{t('total_revenue')}</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : BRAND.text }]}>
          {t('pending_verification')} ({pendingProviders.length})
        </Text>

        {pendingProviders.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: isDark ? '#1E1E1E' : BRAND.white }]}>
            <Text style={styles.emptyIcon}>✅</Text>
            <Text style={[styles.emptyText, { color: isDark ? '#AAA' : BRAND.textLight }]}>
              {t('no_pending_providers')}
            </Text>
          </View>
        ) : (
          pendingProviders.map(provider => (
            <View key={provider.id} style={[styles.providerCard, { backgroundColor: isDark ? '#1E1E1E' : BRAND.white }]}>
              <View style={styles.providerHeader}>
                <Text style={[styles.providerName, { color: isDark ? '#FFF' : BRAND.text }]}>{provider.name}</Text>
                <Text style={[styles.providerDate, { color: isDark ? '#AAA' : BRAND.textLight }]}>
                  {t('registered')}: {new Date(provider.created_at).toLocaleDateString()}
                </Text>
              </View>

              {provider.experience_description && (
                <Text style={[styles.experienceText, { color: isDark ? '#CCC' : BRAND.text }]}>
                  💼 {provider.experience_description}
                </Text>
              )}

              <View style={styles.documentsRow}>
                {provider.id_document_url ? (
                  <TouchableOpacity
                    style={[styles.docBtn, { backgroundColor: BRAND.primaryLight }]}
                    onPress={() => Linking.openURL(provider.id_document_url)}
                  >
                    <Text style={[styles.docBtnText, { color: BRAND.primary }]}>🪪 {t('view_id')}</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={[styles.docBtn, { backgroundColor: '#FEE2E2' }]}>
                    <Text style={[styles.docBtnText, { color: BRAND.error }]}>❌ {t('no_id')}</Text>
                  </View>
                )}
                {provider.cert_url ? (
                  <TouchableOpacity
                    style={[styles.docBtn, { backgroundColor: BRAND.secondaryLight }]}
                    onPress={() => Linking.openURL(provider.cert_url)}
                  >
                    <Text style={[styles.docBtnText, { color: BRAND.secondary }]}>📜 {t('view_certificate')}</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={[styles.docBtn, { backgroundColor: '#F3F4F6' }]}>
                    <Text style={[styles.docBtnText, { color: BRAND.textLight }]}>📄 {t('no_certificate')}</Text>
                  </View>
                )}
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.verifyBtn, { backgroundColor: BRAND.primary }]}
                  onPress={() => handleVerify(provider.id)}
                  disabled={processingId === provider.id}
                >
                  {processingId === provider.id ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.verifyBtnText}>✅ {t('verify')}</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.rejectBtn, { backgroundColor: isDark ? '#2C2C2C' : '#F3F4F6' }]}
                  onPress={() => handleReject(provider.id)}
                  disabled={processingId === provider.id}
                >
                  <Text style={[styles.rejectBtnText, { color: BRAND.error }]}>❌ {t('reject')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { padding: 20, gap: 20 },
  header: { marginBottom: 8 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 4 },
  adminName: { fontSize: 14 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
  statCard: { width: '31%', borderRadius: 12, padding: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  statIcon: { fontSize: 24, marginBottom: 6 },
  statNumber: { fontSize: 18, fontWeight: 'bold', marginBottom: 2 },
  statLabel: { fontSize: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 8, marginBottom: 12 },
  emptyCard: { borderRadius: 12, padding: 40, alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 12, opacity: 0.5 },
  emptyText: { fontSize: 14, textAlign: 'center' },
  providerCard: { borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  providerHeader: { marginBottom: 12 },
  providerName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  providerDate: { fontSize: 11 },
  experienceText: { fontSize: 13, marginBottom: 12, fontStyle: 'italic' },
  documentsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  docBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  docBtnText: { fontSize: 12, fontWeight: '600' },
  actionRow: { flexDirection: 'row', gap: 12 },
  verifyBtn: { flex: 1, borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  verifyBtnText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  rejectBtn: { flex: 1, borderRadius: 8, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  rejectBtnText: { fontSize: 14, fontWeight: '600' },
});