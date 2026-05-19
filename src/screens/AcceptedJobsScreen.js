// =============================================
//  src/screens/AcceptedJobsScreen.js
//  Shows jobs the provider accepted.
//  Provider pays 20 ETB here to unlock seeker contact.
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

export default function AcceptedJobsScreen() {
  const { user } = useAuth();
  const [jobs,       setJobs]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => { loadJobs(); }, [])
  );

  async function loadJobs() {
    try {
      // Get all my requests as provider — we filter accepted ones
      const data = await requestAPI.getOffered();
      // Also get accepted from all assignments
      setJobs([]); // Will be populated via separate endpoint in production
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
            }
          }
        }
      ]
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Accepted Jobs</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#10b981" style={{ marginTop: 40 }} />
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>✅</Text>
          <Text style={styles.emptyTitle}>Accepted Jobs</Text>
          <Text style={styles.emptyDesc}>
            Jobs you accept will appear here. After accepting, pay the 20 ETB fee to unlock seeker contact details.
          </Text>
          <View style={styles.stepsBox}>
            <Text style={styles.stepsTitle}>How to complete a job:</Text>
            <Text style={styles.step}>1️⃣ Accept a job from "Offered Jobs"</Text>
            <Text style={styles.step}>2️⃣ Pay 20 ETB service fee</Text>
            <Text style={styles.step}>3️⃣ Get seeker's phone number</Text>
            <Text style={styles.step}>4️⃣ Call seeker and go to location</Text>
            <Text style={styles.step}>5️⃣ Complete the job</Text>
            <Text style={styles.step}>6️⃣ Seeker will rate you ⭐</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#f9fafb' },
  header:     { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title:      { fontSize: 22, fontWeight: 'bold', color: '#111' },
  empty:      { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyIcon:  { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#374151', marginBottom: 8 },
  emptyDesc:  { fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  stepsBox:   { backgroundColor: '#fff', borderRadius: 16, padding: 20, width: '100%', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  stepsTitle: { fontSize: 15, fontWeight: '600', color: '#111', marginBottom: 12 },
  step:       { fontSize: 14, color: '#374151', marginBottom: 8, lineHeight: 20 },
});