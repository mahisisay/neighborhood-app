// =============================================
//  MyRequestsScreen.js — COMPLETE
//  WITH RATE & REVIEW FEATURE
// =============================================

import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  SafeAreaView, ActivityIndicator,
  TouchableOpacity, Alert, RefreshControl,
  Linking
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
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

const STATUS_CONFIG = {
  pending:   { color: '#F59E0B', bg: '#FEF3C7', label: '⏳ Pending',   desc: 'Waiting for a provider' },
  paid:      { color: '#10B981', bg: '#D1FAE5', label: '💳 Paid',      desc: 'Provider contact unlocked' },
  assigned:  { color: BRAND.primary, bg: BRAND.primaryLight, label: '✅ Assigned',  desc: 'Provider accepted' },
  completed: { color: '#6B7280', bg: '#F3F4F6', label: '🏁 Done',      desc: 'Job completed' },
  cancelled: { color: '#EF4444', bg: '#FEE2E2', label: '❌ Cancelled', desc: 'Request cancelled' },
};

export default function MyRequestsScreen() {
  const navigation = useNavigation();
  const { logout, user } = useAuth();
  const { theme } = useSettings();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [payingId, setPayingId] = useState(null);

  useFocusEffect(useCallback(() => { loadRequests(); }, []));

  async function loadRequests() {
    try {
      const data = await requestAPI.getMyRequests();
      setRequests(data.requests || []);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function handlePayment(request) {
    Alert.alert(
      'Pay 100 ETB Commitment Fee',
      'You will be redirected to Chapa to complete the payment.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Pay Now',
          onPress: async () => {
            setPayingId(request.id);
            try {
              const initData = await paymentAPI.initiate({
                request_id: request.id,
                payer_role: 'seeker'
              });

              if (initData.payment_url) {
                Linking.openURL(initData.payment_url);
                setTimeout(() => {
                  Alert.alert(
                    'Did you complete payment?',
                    'Come back here after paying on Chapa.',
                    [
                      { text: 'Not yet', style: 'cancel' },
                      {
                        text: 'Yes, verify',
                        onPress: async () => {
                          try {
                            const verifyData = await paymentAPI.verify({ tx_ref: initData.tx_ref });
                            Alert.alert(
                              '✅ Success!',
                              `Provider:\n👤 ${verifyData.unlocked_contact?.provider_name}\n📞 ${verifyData.unlocked_contact?.provider_phone}`
                            );
                            loadRequests();
                          } catch (err) {
                            Alert.alert('Error', err.message);
                          }
                        }
                      }
                    ]
                  );
                }, 3000);
              } else {
                Alert.alert('Error', 'Could not get payment URL');
              }
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

  function renderRequest({ item }) {
    const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
    const isPaying = payingId === item.id;

    return (
      <View style={[styles.card, { backgroundColor: isDark ? '#1E1E1E' : BRAND.white }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.category, { color: BRAND.primary }]}>{item.category}</Text>
          <View style={[styles.badge, { backgroundColor: status.bg }]}>
            <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>
        <Text style={[styles.description, { color: isDark ? '#CCC' : BRAND.text }]} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={[styles.statusDesc, { color: isDark ? '#AAA' : BRAND.textLight }]}>{status.desc}</Text>
        <Text style={[styles.date, { color: isDark ? '#666' : '#D1D5DB' }]}>
          {new Date(item.created_at).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric'
          })}
        </Text>

        {item.status === 'assigned' && (
          <TouchableOpacity
            style={[styles.payBtn, { backgroundColor: BRAND.primary }, isPaying && { opacity: 0.7 }]}
            onPress={() => handlePayment(item)}
            disabled={isPaying}
          >
            {isPaying
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.payBtnText}>💳 Pay 100 ETB to Unlock Contact</Text>
            }
          </TouchableOpacity>
        )}

        {/* RATE BUTTON - Shows only when job is completed */}
        {item.status === 'completed' && (
          <TouchableOpacity
            style={[styles.rateBtn, { backgroundColor: BRAND.secondary }]}
            onPress={() => navigation.navigate('RateProvider', {
              requestId: item.id,
              providerId: item.provider_id,
              providerName: item.provider_name
            })}
          >
            <Text style={styles.rateBtnText}>⭐ Rate Provider</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F9FAFB' }]}>
        <View style={[styles.header, { backgroundColor: isDark ? '#1E1E1E' : BRAND.white }]}>
          <Text style={[styles.title, { color: isDark ? '#FFF' : BRAND.text }]}>My Requests</Text>
          <TouchableOpacity onPress={logout}>
            <Text style={[styles.logoutText, { color: BRAND.error }]}>Logout</Text>
          </TouchableOpacity>
        </View>
        <ActivityIndicator size="large" color={BRAND.primary} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F9FAFB' }]}>
      <View style={[styles.header, { backgroundColor: isDark ? '#1E1E1E' : BRAND.white }]}>
        <Text style={[styles.title, { color: isDark ? '#FFF' : BRAND.text }]}>My Requests</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={[styles.logoutText, { color: BRAND.error }]}>Logout</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={requests}
        renderItem={renderRequest}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadRequests(); }} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={[styles.emptyTitle, { color: isDark ? '#FFF' : BRAND.text }]}>No requests yet</Text>
            <Text style={[styles.emptyDesc, { color: isDark ? '#AAA' : BRAND.textLight }]}>Post your first service request!</Text>
            <TouchableOpacity style={[styles.postBtn, { backgroundColor: BRAND.primary }]} onPress={() => navigation.navigate('PostRequest')}>
              <Text style={styles.postBtnText}>Post a Request</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  title: { fontSize: 22, fontWeight: 'bold' },
  logoutText: { fontWeight: '600' },
  list: { padding: 16 },
  card: { borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  category: { fontSize: 15, fontWeight: '600' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  description: { fontSize: 14, lineHeight: 20, marginBottom: 4 },
  statusDesc: { fontSize: 12, marginBottom: 4 },
  date: { fontSize: 12 },
  payBtn: { borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 10 },
  payBtnText: { color: '#FFF', fontWeight: '600', fontSize: 14 },
  rateBtn: { borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  rateBtnText: { color: '#FFF', fontWeight: '600', fontSize: 14 },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  emptyDesc: { fontSize: 14, marginBottom: 20 },
  postBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  postBtnText: { color: '#FFF', fontWeight: '600' },
});