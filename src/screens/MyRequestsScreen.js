// =============================================
//  src/screens/MyRequestsScreen.js
//  WITH FULL AMHARIC SUPPORT
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
  primaryLight: '#E8F5E9',
  secondary: '#F9A825',
  text: '#374151',
  textLight: '#6B7280',
  white: '#FFFFFF',
  error: '#DC2626',
  success: '#10B981',
};

const STATUS_CONFIG = {
  pending:   { color: '#F59E0B', bg: '#FEF3C7', label: '⏳ ' },
  paid:      { color: '#10B981', bg: '#D1FAE5', label: '💳 ' },
  assigned:  { color: BRAND.primary, bg: BRAND.primaryLight, label: '✅ ' },
  completed: { color: '#6B7280', bg: '#F3F4F6', label: '🏁 ' },
  cancelled: { color: '#EF4444', bg: '#FEE2E2', label: '❌ ' },
};

export default function MyRequestsScreen() {
  const navigation = useNavigation();
  const { logout, user } = useAuth();
  const { theme, t } = useSettings();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [payingId, setPayingId] = useState(null);

  const isDark = theme === 'dark';

  useFocusEffect(useCallback(() => { loadRequests(); }, []));

  async function loadRequests() {
    try {
      const data = await requestAPI.getMyRequests();
      setRequests(data.requests || []);
    } catch (err) {
      Alert.alert(t('error'), err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function handlePayment(request) {
    Alert.alert(
      t('pay_100_title'),
      t('pay_100_message'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('pay_now'),
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
                              `${t('provider')}:\n👤 ${verifyData.unlocked_contact?.provider_name}\n📞 ${verifyData.unlocked_contact?.provider_phone}`
                            );
                            loadRequests();
                          } catch (err) {
                            Alert.alert(t('error'), err.message);
                          }
                        }
                      }
                    ]
                  );
                }, 3000);
              } else {
                Alert.alert(t('error'), t('payment_url_error'));
              }
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

  function renderRequest({ item }) {
    const statusConfig = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
    const isPaying = payingId === item.id;
    const statusLabel = t(item.status) || item.status;

    return (
      <View style={[styles.card, { backgroundColor: isDark ? '#1E1E1E' : BRAND.white }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.category, { color: BRAND.primary }]}>{item.category}</Text>
          <View style={[styles.badge, { backgroundColor: statusConfig.bg }]}>
            <Text style={[styles.badgeText, { color: statusConfig.color }]}>
              {statusConfig.label} {statusLabel}
            </Text>
          </View>
        </View>
        <Text style={[styles.description, { color: isDark ? '#CCC' : BRAND.text }]} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={[styles.date, { color: isDark ? '#666' : '#D1D5DB' }]}>
          {new Date(item.created_at).toLocaleDateString('en-GB')}
        </Text>

        {item.status === 'assigned' && (
          <TouchableOpacity
            style={[styles.payBtn, { backgroundColor: BRAND.primary }, isPaying && { opacity: 0.7 }]}
            onPress={() => handlePayment(item)}
            disabled={isPaying}
          >
            {isPaying
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.payBtnText}>💳 {t('pay_now')}</Text>
            }
          </TouchableOpacity>
        )}

        {item.status === 'completed' && (
          <TouchableOpacity
            style={[styles.rateBtn, { backgroundColor: BRAND.secondary }]}
            onPress={() => navigation.navigate('RateProvider', {
              requestId: item.id,
              providerId: item.provider_id,
              providerName: item.provider_name
            })}
          >
            <Text style={styles.rateBtnText}>⭐ {t('rate_provider')}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F9FAFB' }]}>
        <View style={[styles.header, { backgroundColor: isDark ? '#1E1E1E' : BRAND.white }]}>
          <Text style={[styles.title, { color: isDark ? '#FFF' : BRAND.text }]}>{t('my_requests')}</Text>
          <TouchableOpacity onPress={logout}>
            <Text style={[styles.logoutText, { color: BRAND.error }]}>{t('logout')}</Text>
          </TouchableOpacity>
        </View>
        <ActivityIndicator size="large" color={BRAND.primary} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F9FAFB' }]}>
      <View style={[styles.header, { backgroundColor: isDark ? '#1E1E1E' : BRAND.white }]}>
        <Text style={[styles.title, { color: isDark ? '#FFF' : BRAND.text }]}>{t('my_requests')}</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={[styles.logoutText, { color: BRAND.error }]}>{t('logout')}</Text>
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
            <Text style={[styles.emptyTitle, { color: isDark ? '#FFF' : BRAND.text }]}>{t('no_requests')}</Text>
            <Text style={[styles.emptyDesc, { color: isDark ? '#AAA' : BRAND.textLight }]}>{t('no_requests_desc')}</Text>
            <TouchableOpacity style={[styles.postBtn, { backgroundColor: BRAND.primary }]} onPress={() => navigation.navigate('PostRequest')}>
              <Text style={styles.postBtnText}>{t('post_request_btn')}</Text>
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
  date: { fontSize: 12, marginBottom: 8 },
  payBtn: { borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 8 },
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