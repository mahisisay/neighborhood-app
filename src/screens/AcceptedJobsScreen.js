// =============================================
//  src/screens/AcceptedJobsScreen.js
//  WITH FULL AMHARIC SUPPORT
// =============================================

import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  SafeAreaView, TouchableOpacity, Alert,
  ActivityIndicator, RefreshControl
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

export default function AcceptedJobsScreen() {
  const { user } = useAuth();
  const { t, theme } = useSettings();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [payingId, setPayingId] = useState(null);

  const isDark = theme === 'dark';

  useFocusEffect(
    useCallback(() => { loadJobs(); }, [])
  );

  async function loadJobs() {
    try {
      const data = await requestAPI.getOffered();
      const accepted = data.jobs?.filter(job => job.assignment_status === 'accepted') || [];
      setJobs(accepted);
    } catch (err) {
      console.log(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function handlePayFee(requestId) {
    Alert.alert(
      t('pay_20_title'),
      t('pay_20_message'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('pay_20'),
          onPress: async () => {
            setPayingId(requestId);
            try {
              const initData = await paymentAPI.initiate({
                request_id: requestId,
                payer_role: 'provider'
              });
              const verifyData = await paymentAPI.verify({ tx_ref: initData.tx_ref });
              const contact = verifyData.unlocked_contact;
              Alert.alert(
                t('payment_success'),
                `${t('seeker_contact')}:\n👤 ${contact.seeker_name}\n📞 ${contact.seeker_phone}`
              );
              loadJobs();
            } catch (err) {
              Alert.alert(t('error'), err.message);
            } finally {
              setPayingId(null);
            }
          }
        }
      ]
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F9FAFB' }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: isDark ? '#FFF' : BRAND.text }]}>{t('accepted_jobs')}</Text>
        </View>
        <ActivityIndicator size="large" color={BRAND.primary} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F9FAFB' }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? '#FFF' : BRAND.text }]}>{t('accepted_jobs')}</Text>
        <Text style={[styles.subtitle, { color: isDark ? '#AAA' : BRAND.textLight }]}>
          {jobs.length} {t('jobs_accepted')}
        </Text>
      </View>

      {jobs.length > 0 ? (
        <FlatList
          data={jobs}
          keyExtractor={(item) => item.request_id.toString()}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: isDark ? '#1E1E1E' : BRAND.white }]}>
              <Text style={[styles.category, { color: BRAND.primary }]}>{item.category}</Text>
              <Text style={[styles.description, { color: isDark ? '#CCC' : BRAND.text }]} numberOfLines={2}>
                {item.description}
              </Text>
              <Text style={[styles.distance, { color: BRAND.secondary }]}>📍 {item.distance_km} km {t('away')}</Text>
              
              <TouchableOpacity
                style={[styles.payBtn, { backgroundColor: BRAND.secondary }]}
                onPress={() => handlePayFee(item.request_id)}
                disabled={payingId === item.request_id}
              >
                {payingId === item.request_id ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.payBtnText}>💳 {t('pay_20_btn')}</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadJobs(); }} />}
        />
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>✅</Text>
          <Text style={[styles.emptyTitle, { color: isDark ? '#FFF' : BRAND.text }]}>{t('no_accepted_jobs')}</Text>
          <Text style={[styles.emptyDesc, { color: isDark ? '#AAA' : BRAND.textLight }]}>
            {t('accepted_jobs_hint')}
          </Text>
          <View style={[styles.stepsBox, { backgroundColor: isDark ? '#1E1E1E' : BRAND.white }]}>
            <Text style={[styles.stepsTitle, { color: isDark ? '#FFF' : BRAND.text }]}>{t('how_to_complete')}</Text>
            <Text style={[styles.step, { color: isDark ? '#CCC' : BRAND.text }]}>1️⃣ {t('step1')}</Text>
            <Text style={[styles.step, { color: isDark ? '#CCC' : BRAND.text }]}>2️⃣ {t('step2')}</Text>
            <Text style={[styles.step, { color: isDark ? '#CCC' : BRAND.text }]}>3️⃣ {t('step3')}</Text>
            <Text style={[styles.step, { color: isDark ? '#CCC' : BRAND.text }]}>4️⃣ {t('step4')}</Text>
            <Text style={[styles.step, { color: isDark ? '#CCC' : BRAND.text }]}>5️⃣ {t('step5')}</Text>
            <Text style={[styles.step, { color: isDark ? '#CCC' : BRAND.text }]}>6️⃣ {t('step6')}</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { fontSize: 14, marginTop: 4 },
  list: { padding: 16, gap: 12 },
  card: { borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  category: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  description: { fontSize: 14, lineHeight: 20, marginBottom: 8 },
  distance: { fontSize: 12, marginBottom: 12 },
  payBtn: { borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  payBtnText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  emptyDesc: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  stepsBox: { borderRadius: 16, padding: 20, width: '100%', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  stepsTitle: { fontSize: 15, fontWeight: '600', marginBottom: 12 },
  step: { fontSize: 14, marginBottom: 8, lineHeight: 20 },
});