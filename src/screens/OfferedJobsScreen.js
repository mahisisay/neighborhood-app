// =============================================
//  src/screens/OfferedJobsScreen.js
//  UPDATED — Provider pays 20 ETB via Chapa
//  FIXED: safe hooks, error handling
// =============================================

import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  SafeAreaView, TouchableOpacity, Alert,
  ActivityIndicator, RefreshControl, Linking
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { requestAPI, paymentAPI } from '../api/client';

export default function OfferedJobsScreen({ navigation }) {
  const [jobs,       setJobs]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [acceptingId, setAcceptingId] = useState(null);

  useFocusEffect(
    useCallback(() => {
      loadJobs();
      return () => {}; // cleanup (optional)
    }, [])
  );

  async function loadJobs() {
    try {
      const data = await requestAPI.getOffered();
      setJobs(data.jobs || []);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to load offered jobs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function handleAccept(assignmentId, requestId) {
    Alert.alert(
      'Accept Job?',
      'After accepting, you will pay 20 ETB via Chapa to unlock the seeker\'s contact details.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept & Pay 20 ETB',
          onPress: async () => {
            setAcceptingId(assignmentId);
            try {
              // Step 1 — Accept the job assignment
              await requestAPI.accept(assignmentId);

              // Step 2 — Initiate 20 ETB Chapa payment
              const initData = await paymentAPI.initiate({
                request_id: requestId,
                payer_role: 'provider'
              });

              if (initData.payment_url) {
                // Step 3 — Open Chapa checkout in browser
                Linking.openURL(initData.payment_url);

                // Step 4 — After 3 seconds ask if payment done
                setTimeout(() => {
                  Alert.alert(
                    'Payment Complete?',
                    'Did you complete the 20 ETB payment on Chapa?',
                    [
                      { text: 'Not yet', style: 'cancel' },
                      {
                        text: 'Yes, verify',
                        onPress: async () => {
                          try {
                            const verifyData = await paymentAPI.verify({
                              tx_ref: initData.tx_ref
                            });
                            const contact = verifyData.unlocked_contact;
                            Alert.alert(
                              '✅ Payment Successful!',
                              `Seeker Contact Unlocked!\n\n👤 Name: ${contact?.seeker_name}\n📞 Phone: ${contact?.seeker_phone}\n\nCall them to confirm the job details!`
                            );
                            loadJobs();
                          } catch (err) {
                            Alert.alert('Verification Error', err.message);
                          }
                        }
                      }
                    ]
                  );
                }, 3000);

              } else {
                Alert.alert('Error', 'Could not get payment URL from Chapa');
              }

            } catch (err) {
              Alert.alert('Error', err.message);
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
      'Reject Job?',
      'Are you sure you want to reject this job?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await requestAPI.reject(assignmentId);
              Alert.alert('Job Rejected', 'You have rejected this job.');
              loadJobs();
            } catch (err) {
              Alert.alert('Error', err.message);
            }
          }
        }
      ]
    );
  }

  function renderJob({ item }) {
    const isAccepting = acceptingId === item.assignment_id;
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.category}>{item.category}</Text>
          <View style={styles.distanceBadge}>
            <Text style={styles.distanceText}>📍 {item.distance_km} km</Text>
          </View>
        </View>
        <Text style={styles.description} numberOfLines={3}>
          {item.description}
        </Text>
        <Text style={styles.seekerName}>👤 {item.seeker_name}</Text>
        <Text style={styles.date}>
          Posted: {new Date(item.created_at).toLocaleString('en-GB', {
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
          })}
        </Text>
        <View style={styles.feeNotice}>
          <Text style={styles.feeText}>💳 Accepting costs 20 ETB service fee via Chapa</Text>
        </View>
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={styles.rejectBtn}
            onPress={() => handleReject(item.assignment_id)}
            disabled={isAccepting}
          >
            <Text style={styles.rejectBtnText}>❌ Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.acceptBtn, isAccepting && { opacity: 0.7 }]}
            onPress={() => handleAccept(item.assignment_id, item.request_id)}
            disabled={isAccepting}
          >
            {isAccepting
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.acceptBtnText}>✅ Accept & Pay</Text>
            }
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Offered Jobs</Text>
        <Text style={styles.count}>{jobs.length} available</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#10b981" style={{ marginTop: 40 }} />
      ) : (
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
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyTitle}>No jobs offered yet</Text>
              <Text style={styles.emptyDesc}>
                Make sure you are online to receive job notifications!
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#f9fafb' },
  header:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title:         { fontSize: 22, fontWeight: 'bold', color: '#111' },
  count:         { fontSize: 14, color: '#6b7280' },
  list:          { padding: 16 },
  card:          { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  cardHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  category:      { fontSize: 16, fontWeight: 'bold', color: '#111' },
  distanceBadge: { backgroundColor: '#eff6ff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  distanceText:  { fontSize: 12, color: '#1a56db', fontWeight: '600' },
  description:   { fontSize: 14, color: '#374151', lineHeight: 20, marginBottom: 8 },
  seekerName:    { fontSize: 13, color: '#6b7280', marginBottom: 4 },
  date:          { fontSize: 12, color: '#9ca3af', marginBottom: 10 },
  feeNotice:     { backgroundColor: '#fef3c7', borderRadius: 8, padding: 8, marginBottom: 12 },
  feeText:       { fontSize: 12, color: '#92400e' },
  btnRow:        { flexDirection: 'row', gap: 10 },
  rejectBtn:     { flex: 1, borderWidth: 1.5, borderColor: '#ef4444', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  rejectBtnText: { color: '#ef4444', fontWeight: '600', fontSize: 14 },
  acceptBtn:     { flex: 1, backgroundColor: '#10b981', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  acceptBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  empty:         { alignItems: 'center', marginTop: 60 },
  emptyIcon:     { fontSize: 48, marginBottom: 12 },
  emptyTitle:    { fontSize: 18, fontWeight: 'bold', color: '#374151', marginBottom: 4 },
  emptyDesc:     { fontSize: 14, color: '#9ca3af', textAlign: 'center', paddingHorizontal: 20 },
});