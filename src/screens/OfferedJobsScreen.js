// =============================================
//  src/screens/OfferedJobsScreen.js
//  BRAND COLORS: Ethiopian Green (#2E7D32) + Gold (#F9A825)
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

export default function OfferedJobsScreen() {
  const { user } = useAuth();
  const { t, theme } = useSettings();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [acceptingId, setAcceptingId] = useState(null);

  useFocusEffect(
    useCallback(() => { loadJobs(); }, [])
  );

  async function loadJobs() {
    try {
      const data = await requestAPI.getOffered();
      setJobs(data.jobs || []);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function handleAccept(assignmentId, requestId) {
    Alert.alert(
      'Accept Job?',
      'You will need to pay 20 ETB service fee to unlock the seeker\'s contact details.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept & Pay 20 ETB',
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
                    'Payment Complete?',
                    'Did you complete the 20 ETB payment?',
                    [
                      { text: 'Not yet', style: 'cancel' },
                      {
                        text: 'Yes, verify',
                        onPress: async () => {
                          try {
                            const verifyData = await paymentAPI.verify({ tx_ref: initData.tx_ref });
                            Alert.alert(
                              '✅ Payment Successful!',
                              `Seeker Contact Unlocked!\n\n👤 ${verifyData.unlocked_contact?.seeker_name}\n📞 ${verifyData.unlocked_contact?.seeker_phone}`
                            );
                            loadJobs();
                          } catch (err) {
                            Alert.alert('Error', err.message);
                          }
                        }
                      }
                    ]
                  );
                }, 3000);
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
      'Are you sure you want to reject this offer?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Reject',
          onPress: async () => {
            try {
              await requestAPI.reject(assignmentId);
              loadJobs();
              Alert.alert('Rejected', 'Job offer has been declined');
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
      <View style={[styles.card, { backgroundColor: theme === 'dark' ? '#1E1E1E' : BRAND.white }]}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={[styles.category, { color: BRAND.primary }]}>{item.category}</Text>
            <Text style={[styles.distance, { color: BRAND.secondary }]}>📍 {item.distance_km} km away</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: BRAND.secondaryLight }]}>
            <Text style={[styles.statusText, { color: BRAND.secondary }]}>Offered</Text>
          </View>
        </View>
        
        <Text style={[styles.description, { color: theme === 'dark' ? '#CCC' : BRAND.text }]} numberOfLines={3}>
          {item.description}
        </Text>
        
        <View style={styles.seekerInfo}>
          <Text style={styles.seekerIcon}>👤</Text>
          <Text style={[styles.seekerName, { color: theme === 'dark' ? '#CCC' : BRAND.text }]}>{item.seeker_name}</Text>
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
              <Text style={styles.acceptBtnText}>Accept & Pay 20 ETB</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.rejectBtn, { backgroundColor: theme === 'dark' ? '#2C2C2C' : '#F3F4F6' }]}
            onPress={() => handleReject(item.assignment_id)}
          >
            <Text style={[styles.rejectBtnText, { color: BRAND.error }]}>Reject</Text>
          </TouchableOpacity>
        </View>
        
        <View style={[styles.feeNote, { backgroundColor: BRAND.secondaryLight }]}>
          <Text style={[styles.feeNoteText, { color: '#92400E' }]}>💰 20 ETB fee applies on acceptance</Text>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme === 'dark' ? '#121212' : '#F9FAFB' }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme === 'dark' ? '#FFF' : BRAND.text }]}>Offered Jobs</Text>
        </View>
        <ActivityIndicator size="large" color={BRAND.primary} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme === 'dark' ? '#121212' : '#F9FAFB' }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme === 'dark' ? '#FFF' : BRAND.text }]}>Offered Jobs</Text>
        <Text style={[styles.subtitle, { color: theme === 'dark' ? '#AAA' : BRAND.textLight }]}>
          {jobs.length} job(s) available near you
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
            <Text style={[styles.emptyTitle, { color: theme === 'dark' ? '#FFF' : BRAND.text }]}>No offered jobs</Text>
            <Text style={[styles.emptyDesc, { color: theme === 'dark' ? '#AAA' : BRAND.textLight }]}>
              Go online to receive job offers from nearby seekers
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