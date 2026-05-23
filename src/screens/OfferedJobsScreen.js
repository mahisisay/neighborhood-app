// =============================================
//  src/screens/OfferedJobsScreen.js
//  WITH FULL AMHARIC SUPPORT
// =============================================

import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  SafeAreaView, ActivityIndicator,
  TouchableOpacity, Alert, RefreshControl,
  Linking
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { requestAPI, paymentAPI } from '../api/client';
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

export default function OfferedJobsScreen() {
  const { user } = useAuth();
  const { t, theme } = useSettings();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [acceptingId, setAcceptingId] = useState(null);

  const isDark = theme === 'dark';

  useFocusEffect(
    useCallback(() => { loadJobs(); }, [])
  );

  async function loadJobs() {
    try {
      const data = await requestAPI.getOffered();
      setJobs(data.jobs || []);
    } catch (err) {
      Alert.alert(t('error'), err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function handleAccept(assignmentId, requestId) {
    Alert.alert(
      t('accept_job'),
      t('accept_fee_warning'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('accept_pay'),
          onPress: async () => {
            setAcceptingId(assignmentId);
            try {
              const data = await requestAPI.accept(assignmentId);
              const initData = await paymentAPI.initiate({
                request_id: requestId,
                payer_role: 'provider'
              });

              if (initData.payment_url) {
                Linking.openURL(initData.payment_url);
                setTimeout(() => {
                  Alert.alert(
                    t('payment_complete'),
                    t('payment_verify_message'),
                    [
                      { text: t('not_yet'), style: 'cancel' },
                      {
                        text: t('yes_verify'),
                        onPress: async () => {
                          try {
                            const verifyData = await paymentAPI.verify({ tx_ref: initData.tx_ref });
                            Alert.alert(
                              t('payment_success'),
                              `${t('seeker_contact')}:\n👤 ${verifyData.unlocked_contact?.seeker_name}\n📞 ${verifyData.unlocked_contact?.seeker_phone}`
                            );
                            loadJobs();
                          } catch (err) {
                            Alert.alert(t('error'), err.message);
                          }
                        }
                      }
                    ]
                  );
                }, 3000);
              }
            } catch (err) {
              Alert.alert(t('error'), err.message);
            } finally {
              setAcceptingId(null);
            }
          }
        }
      ]
    );
  }

  async function handleReject(assignmentId) {
    Alert.alert(
      t('reject_job'),
      t('reject_confirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('reject'),
          onPress: async () => {
            try {
              await requestAPI.reject(assignmentId);
              loadJobs();
              Alert.alert(t('success'), t('job_rejected'));
            } catch (err) {
              Alert.alert(t('error'), err.message);
            }
          }
        }
      ]
    );
  }

  function renderJob({ item }) {
    const isAccepting = acceptingId === item.assignment_id;
    
    return (
      <View style={[styles.card, { backgroundColor: isDark ? '#1E1E1E' : BRAND.white }]}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={[styles.category, { color: BRAND.primary }]}>{item.category}</Text>
            <Text style={[styles.distance, { color: BRAND.secondary }]}>📍 {item.distance_km} km {t('away')}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: BRAND.secondaryLight }]}>
            <Text style={[styles.statusText, { color: BRAND.secondary }]}>{t('offered')}</Text>
          </View>
        </View>
        
        <Text style={[styles.description, { color: isDark ? '#CCC' : BRAND.text }]} numberOfLines={3}>
          {item.description}
        </Text>
        
        <View style={styles.seekerInfo}>
          <Text style={styles.seekerIcon}>👤</Text>
          <Text style={[styles.seekerName, { color: isDark ? '#CCC' : BRAND.text }]}>{item.seeker_name}</Text>
        </View>
        
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={[styles.acceptBtn, { backgroundColor: BRAND.primary }]}
            onPress={() => handleAccept(item.assignment_id, item.request_id)}
            disabled={isAccepting}
          >
            {isAccepting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.acceptBtnText}>{t('accept_pay')}</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.rejectBtn, { backgroundColor: isDark ? '#2C2C2C' : '#F3F4F6' }]}
            onPress={() => handleReject(item.assignment_id)}
          >
            <Text style={[styles.rejectBtnText, { color: BRAND.error }]}>{t('reject')}</Text>
          </TouchableOpacity>
        </View>
        
        <View style={[styles.feeNote, { backgroundColor: BRAND.secondaryLight }]}>
          <Text style={[styles.feeNoteText, { color: '#92400E' }]}>💰 20 ETB {t('fee_applies')}</Text>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F9FAFB' }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: isDark ? '#FFF' : BRAND.text }]}>{t('offered_jobs')}</Text>
        </View>
        <ActivityIndicator size="large" color={BRAND.primary} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F9FAFB' }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? '#FFF' : BRAND.text }]}>{t('offered_jobs')}</Text>
        <Text style={[styles.subtitle, { color: isDark ? '#AAA' : BRAND.textLight }]}>
          {jobs.length} {t('jobs_available')}
        </Text>
      </View>

      <FlatList
        data={jobs}
        renderItem={renderJob}
        keyExtractor={(item) => item.assignment_id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {
            setRefreshing(true);
            loadJobs();
          }} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={[styles.emptyTitle, { color: isDark ? '#FFF' : BRAND.text }]}>{t('no_offered_jobs')}</Text>
            <Text style={[styles.emptyDesc, { color: isDark ? '#AAA' : BRAND.textLight }]}>
              {t('go_online_hint')}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { fontSize: 14, marginTop: 4 },
  list: { padding: 16, gap: 12 },
  card: { borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  category: { fontSize: 16, fontWeight: 'bold' },
  distance: { fontSize: 12, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: '600' },
  description: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
  seekerInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  seekerIcon: { fontSize: 16 },
  seekerName: { fontSize: 13, fontWeight: '500' },
  actionRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  acceptBtn: { flex: 2, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  acceptBtnText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  rejectBtn: { flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  rejectBtnText: { fontSize: 14, fontWeight: '600' },
  feeNote: { borderRadius: 8, padding: 8, alignItems: 'center' },
  feeNoteText: { fontSize: 11 },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 16, opacity: 0.5 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  emptyDesc: { fontSize: 14, textAlign: 'center', paddingHorizontal: 40 },
});