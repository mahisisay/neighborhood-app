// =============================================
//  src/screens/AcceptedJobsScreen.js
//  BRAND COLORS: Ethiopian Green (#2E7D32) + Gold (#F9A825)
//  Shows jobs the provider accepted.
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
  primaryDark: '#1B5E20',
  primaryLight: '#E8F5E9',
  secondary: '#F9A825',
  secondaryLight: '#FFF8E1',
  text: '#374151',
  textLight: '#6B7280',
  white: '#FFFFFF',
  dark: '#1F2937',
  error: '#DC2626',
  success: '#10B981',
};

export default function AcceptedJobsScreen() {
  const { user } = useAuth();
  const { theme } = useSettings();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [payingId, setPayingId] = useState(null);

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
      'Pay 20 ETB Service Fee',
      'Pay to unlock the seeker\'s contact details and confirm the job.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Pay 20 ETB',
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
                '✅ Payment Successful!',
                `Seeker Contact Unlocked!\n\n👤 Name: ${contact.seeker_name}\n📞 Phone: ${contact.seeker_phone}\n\nCall them to confirm the job details!`
              );
              loadJobs();
            } catch (err) {
              Alert.alert('Payment Error', err.message);
            } finally {
              setPayingId(null);
            }
          }
        }
      ]
    );
  }

  const isDark = theme === 'dark';

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F9FAFB' }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: isDark ? '#FFF' : BRAND.text }]}>Accepted Jobs</Text>
        </View>
        <ActivityIndicator size="large" color={BRAND.primary} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F9FAFB' }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? '#FFF' : BRAND.text }]}>Accepted Jobs</Text>
        <Text style={[styles.subtitle, { color: isDark ? '#AAA' : BRAND.textLight }]}>
          {jobs.length} job(s) accepted
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
              <Text style={[styles.distance, { color: BRAND.secondary }]}>📍 {item.distance_km} km away</Text>
              
              <TouchableOpacity
                style={[styles.payBtn, { backgroundColor: BRAND.secondary }]}
                onPress={() => handlePayFee(item.request_id)}
                disabled={payingId === item.request_id}
              >
                {payingId === item.request_id ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.payBtnText}>💳 Pay 20 ETB to Unlock Contact</Text>
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
          <Text style={[styles.emptyTitle, { color: isDark ? '#FFF' : BRAND.text }]}>No Accepted Jobs</Text>
          <Text style={[styles.emptyDesc, { color: isDark ? '#AAA' : BRAND.textLight }]}>
            Jobs you accept will appear here.
          </Text>
          <View style={[styles.stepsBox, { backgroundColor: isDark ? '#1E1E1E' : BRAND.white }]}>
            <Text style={[styles.stepsTitle, { color: isDark ? '#FFF' : BRAND.text }]}>How to complete a job:</Text>
            <Text style={[styles.step, { color: isDark ? '#CCC' : BRAND.text }]}>1️⃣ Accept a job from "Offered Jobs"</Text>
            <Text style={[styles.step, { color: isDark ? '#CCC' : BRAND.text }]}>2️⃣ Pay 20 ETB service fee</Text>
            <Text style={[styles.step, { color: isDark ? '#CCC' : BRAND.text }]}>3️⃣ Get seeker's phone number</Text>
            <Text style={[styles.step, { color: isDark ? '#CCC' : BRAND.text }]}>4️⃣ Call seeker and go to location</Text>
            <Text style={[styles.step, { color: isDark ? '#CCC' : BRAND.text }]}>5️⃣ Complete the job</Text>
            <Text style={[styles.step, { color: isDark ? '#CCC' : BRAND.text }]}>6️⃣ Seeker will rate you ⭐</Text>
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