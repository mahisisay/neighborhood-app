// =============================================
//  MyRequestsScreen.js — COMPLETE FIX
//  Fixed: navigation to PostRequest, logout handling
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

const STATUS_CONFIG = {
  pending:   { color: '#f59e0b', bg: '#fef3c7', label: '⏳ Pending',   desc: 'Waiting for a provider' },
  paid:      { color: '#10b981', bg: '#d1fae5', label: '💳 Paid',      desc: 'Provider contact unlocked' },
  assigned:  { color: '#1a56db', bg: '#eff6ff', label: '✅ Assigned',  desc: 'Provider accepted' },
  completed: { color: '#6b7280', bg: '#f3f4f6', label: '🏁 Done',      desc: 'Job completed' },
  cancelled: { color: '#ef4444', bg: '#fee2e2', label: '❌ Cancelled', desc: 'Request cancelled' },
};

export default function MyRequestsScreen() {
  const navigation = useNavigation();
  const { logout, user } = useAuth();
  
  const [requests,   setRequests]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [payingId,   setPayingId]   = useState(null);

  useFocusEffect(
    useCallback(() => { loadRequests(); }, [])
  );

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
                            const verifyData = await paymentAPI.verify({
                              tx_ref: initData.tx_ref
                            });
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

  function renderRequest({ item }) {
    const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
    const isPaying = payingId === item.id;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.category}>{item.category}</Text>
          <View style={[styles.badge, { backgroundColor: status.bg }]}>
            <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
        <Text style={styles.statusDesc}>{status.desc}</Text>
        <Text style={styles.date}>
          {new Date(item.created_at).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric'
          })}
        </Text>

        {item.status === 'assigned' && (
          <TouchableOpacity
            style={[styles.payBtn, isPaying && { opacity: 0.7 }]}
            onPress={() => handlePayment(item)}
            disabled={isPaying}
          >
            {isPaying
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.payBtnText}>💳 Pay 100 ETB to Unlock Contact</Text>
            }
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>My Requests</Text>
          <TouchableOpacity onPress={logout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
        <ActivityIndicator size="large" color="#1a56db" style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Requests</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={requests}
        renderItem={renderRequest}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {
            setRefreshing(true);
            loadRequests();
          }} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No requests yet</Text>
            <Text style={styles.emptyDesc}>Post your first service request!</Text>
            <TouchableOpacity
              style={styles.postBtn}
              onPress={() => navigation.navigate('PostRequest')}
            >
              <Text style={styles.postBtnText}>Post a Request</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#f9fafb' },
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title:       { fontSize: 22, fontWeight: 'bold', color: '#111' },
  logoutText:  { color: '#ef4444', fontWeight: '600' },
  list:        { padding: 16 },
  card:        { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  cardHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  category:    { fontSize: 15, fontWeight: '600', color: '#111' },
  badge:       { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText:   { fontSize: 12, fontWeight: '600' },
  description: { fontSize: 14, color: '#374151', lineHeight: 20, marginBottom: 4 },
  statusDesc:  { fontSize: 12, color: '#9ca3af', marginBottom: 4 },
  date:        { fontSize: 12, color: '#d1d5db' },
  payBtn:      { backgroundColor: '#1a56db', borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 10 },
  payBtnText:  { color: '#fff', fontWeight: '600', fontSize: 14 },
  empty:       { alignItems: 'center', marginTop: 60 },
  emptyIcon:   { fontSize: 48, marginBottom: 12 },
  emptyTitle:  { fontSize: 18, fontWeight: 'bold', color: '#374151', marginBottom: 4 },
  emptyDesc:   { fontSize: 14, color: '#9ca3af', marginBottom: 20 },
  postBtn:     { backgroundColor: '#1a56db', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  postBtnText: { color: '#fff', fontWeight: '600' },
});