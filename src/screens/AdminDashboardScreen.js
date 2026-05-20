// =============================================
//  src/screens/AdminDashboardScreen.js
//  Implements BR12 and all admin use cases
// =============================================

import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  ScrollView, ActivityIndicator, TouchableOpacity,
  Alert, RefreshControl, Linking, Image,
  FlatList, Modal
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { adminAPI } from '../api/client';

export default function AdminDashboardScreen() {
  const { logout } = useAuth();
  const { t, theme } = useSettings();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);
  const [users, setUsers] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState('users');
  const [reportData, setReportData] = useState(null);

  const handleLogout = () => {
    if (logout) logout();
    else Alert.alert(t('error'), t('logout_unavailable'));
  };

  useFocusEffect(useCallback(() => { loadAllData(); }, []));

  async function loadAllData() {
    setLoading(true);
    try {
      const [statsData, pendingData, usersData, complaintsData, reviewsData, paymentsData] = await Promise.all([
        adminAPI.getStats().catch(() => ({ stats: {} })),
        adminAPI.getPending().catch(() => ({ pending_providers: [] })),
        adminAPI.getAllUsers().catch(() => ({ users: [] })),
        adminAPI.getComplaints().catch(() => ({ complaints: [] })),
        adminAPI.getAllReviews().catch(() => ({ reviews: [] })),
        adminAPI.getPayments().catch(() => ({ payments: [] }))
      ]);
      setStats(statsData.stats);
      setPending(pendingData.pending_providers || []);
      setUsers(usersData.users || []);
      setComplaints(complaintsData.complaints || []);
      setReviews(reviewsData.reviews || []);
      setPayments(paymentsData.payments || []);
    } catch (err) {
      Alert.alert(t('error'), err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function handleVerify(providerId, providerName) {
    Alert.alert(t('verify_provider'), t('activate_provider_confirm', { name: providerName }), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('verify'), onPress: async () => {
        try {
          await adminAPI.verifyProvider(providerId);
          Alert.alert(t('success'), t('provider_activated'));
          loadAllData();
        } catch (err) { Alert.alert(t('error'), err.message); }
      }}
    ]);
  }

  async function handleToggleUserStatus(userId, userName, currentStatus) {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    const action = newStatus === 'suspended' ? t('suspend') : t('activate');
    Alert.alert(action, t('confirm_user_status', { action, name: userName }), [
      { text: t('cancel'), style: 'cancel' },
      { text: action, style: newStatus === 'suspended' ? 'destructive' : 'default', onPress: async () => {
        try {
          if (newStatus === 'suspended') await adminAPI.suspendUser(userId);
          else await adminAPI.reactivateUser(userId);
          Alert.alert(t('success'), t('user_status_updated', { status: newStatus }));
          loadAllData();
        } catch (err) { Alert.alert(t('error'), err.message); }
      }}
    ]);
  }

  async function handleResolveComplaint(complaintId) {
    Alert.alert(t('resolve_complaint'), t('resolve_confirm'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('resolve'), onPress: async () => {
        try {
          await adminAPI.resolveComplaint(complaintId);
          Alert.alert(t('success'), t('complaint_resolved'));
          loadAllData();
        } catch (err) { Alert.alert(t('error'), err.message); }
      }}
    ]);
  }

  async function handleDeleteReview(reviewId) {
    Alert.alert(t('delete_review'), t('delete_review_confirm'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('delete'), style: 'destructive', onPress: async () => {
        try {
          await adminAPI.deleteReview(reviewId);
          Alert.alert(t('success'), t('review_deleted'));
          loadAllData();
        } catch (err) { Alert.alert(t('error'), err.message); }
      }}
    ]);
  }

  async function generateReport() {
    try {
      const report = await adminAPI.generateReport(reportType);
      setReportData(report);
      setShowReportModal(true);
    } catch (err) {
      Alert.alert(t('error'), err.message);
    }
  }

  const dynamicStyles = {
    container: { backgroundColor: theme === 'dark' ? '#121212' : '#f9fafb' },
    card: { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' },
    text: { color: theme === 'dark' ? '#fff' : '#111' },
    subtext: { color: theme === 'dark' ? '#aaa' : '#6b7280' },
    border: { borderBottomColor: theme === 'dark' ? '#333' : '#e5e7eb' },
    tabActive: { borderBottomColor: theme === 'dark' ? '#60a5fa' : '#1a56db' },
  };

  const renderTab = (tabKey, label) => (
    <TouchableOpacity
      key={tabKey}
      style={[styles.tab, activeTab === tabKey ? dynamicStyles.tabActive : { borderBottomColor: 'transparent' }]}
      onPress={() => setActiveTab(tabKey)}
    >
      <Text style={[styles.tabText, activeTab === tabKey ? { color: theme === 'dark' ? '#60a5fa' : '#1a56db' } : dynamicStyles.subtext]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.center, dynamicStyles.container]}>
        <ActivityIndicator size="large" color="#ef4444" />
        <Text style={{ marginTop: 12, color: dynamicStyles.subtext.color }}>{t('loading')}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, dynamicStyles.container]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, dynamicStyles.text]}>{t('admin_panel')}</Text>
          <Text style={[styles.subtitle, dynamicStyles.subtext]}>{t('platform_overview')}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={[styles.logoutText, { color: '#ef4444' }]}>{t('logout')}</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsRow}>
        {renderTab('dashboard', t('dashboard'))}
        {renderTab('users', t('user_management'))}
        {renderTab('complaints', t('complaints'))}
        {renderTab('reviews', t('reviews_moderation'))}
        {renderTab('reports', t('reports'))}
        {renderTab('payments', t('platform_cashflow'))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={styles.inner}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadAllData(); }} />}
      >
        {/* Dashboard */}
        {activeTab === 'dashboard' && stats && (
          <>
            <Text style={[styles.sectionTitle, dynamicStyles.text]}>{t('platform_stats')}</Text>
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: '#eff6ff' }]}><Text style={styles.statNumber}>{stats.total_seekers}</Text><Text style={styles.statLabel}>{t('seekers')}</Text></View>
              <View style={[styles.statCard, { backgroundColor: '#d1fae5' }]}><Text style={styles.statNumber}>{stats.active_providers}</Text><Text style={styles.statLabel}>{t('providers')}</Text></View>
              <View style={[styles.statCard, { backgroundColor: '#fef3c7' }]}><Text style={styles.statNumber}>{stats.pending_providers}</Text><Text style={styles.statLabel}>{t('pending')}</Text></View>
              <View style={[styles.statCard, { backgroundColor: '#f3f4f6' }]}><Text style={styles.statNumber}>{stats.total_requests}</Text><Text style={styles.statLabel}>{t('requests')}</Text></View>
              <View style={[styles.statCard, { backgroundColor: '#d1fae5' }]}><Text style={styles.statNumber}>{stats.completed_jobs}</Text><Text style={styles.statLabel}>{t('completed')}</Text></View>
              <View style={[styles.statCard, { backgroundColor: '#fce7f3' }]}><Text style={styles.statNumber}>{stats.total_revenue_ETB}</Text><Text style={styles.statLabel}>{t('revenue_etb')}</Text></View>
            </View>
            <Text style={[styles.sectionTitle, dynamicStyles.text]}>{t('pending_providers')} ({pending.length})</Text>
            {pending.map(provider => (
              <View key={provider.id} style={[styles.providerCard, dynamicStyles.card]}>
                <View style={styles.providerInfo}>
                  <Text style={[styles.providerName, dynamicStyles.text]}>{provider.name}</Text>
                  <Text style={[styles.providerDate, dynamicStyles.subtext]}>{t('registered')}: {new Date(provider.created_at).toLocaleDateString()}</Text>
                  {provider.id_document_url && (
                    <TouchableOpacity style={styles.docBtn} onPress={() => Linking.openURL(provider.id_document_url)}>
                      <Text style={styles.docBtnText}>🪪 {t('view_id')}</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <View style={styles.providerActions}>
                  <TouchableOpacity style={styles.verifyBtn} onPress={() => handleVerify(provider.id, provider.name)}>
                    <Text style={styles.verifyBtnText}>✅{'\n'}{t('verify')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.suspendBtn} onPress={() => handleToggleUserStatus(provider.id, provider.name, 'pending')}>
                    <Text style={styles.suspendBtnText}>⛔{'\n'}{t('reject')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <>
            <Text style={[styles.sectionTitle, dynamicStyles.text]}>{t('all_users')}</Text>
            {users.map(user => (
              <View key={user.id} style={[styles.userCard, dynamicStyles.card]}>
                <View>
                  <Text style={[styles.userName, dynamicStyles.text]}>{user.name}</Text>
                  <Text style={[styles.userDetail, dynamicStyles.subtext]}>{user.role === 'seeker' ? t('seeker') : t('provider')} | 📞 {user.phone}</Text>
                  <Text style={[styles.userDetail, dynamicStyles.subtext]}>{t('status')}: {user.status}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.userActionBtn, user.status === 'active' ? styles.suspendBtn : styles.activateBtn]}
                  onPress={() => handleToggleUserStatus(user.id, user.name, user.status)}
                >
                  <Text style={styles.userActionText}>{user.status === 'active' ? t('suspend') : t('activate')}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        {/* Complaints Tab */}
        {activeTab === 'complaints' && (
          <>
            <Text style={[styles.sectionTitle, dynamicStyles.text]}>{t('open_complaints')}</Text>
            {complaints.filter(c => c.status === 'open').map(comp => (
              <View key={comp.id} style={[styles.complaintCard, dynamicStyles.card]}>
                <Text style={[styles.complaintTitle, dynamicStyles.text]}>{t('complaint')} #{comp.id}</Text>
                <Text style={[styles.complaintText, dynamicStyles.subtext]}>{t('reporter')}: {comp.reporter_name}</Text>
                <Text style={[styles.complaintText, dynamicStyles.subtext]}>{t('against')}: {comp.against_name}</Text>
                <Text style={[styles.complaintText, dynamicStyles.subtext]}>{t('reason')}: {comp.reason}</Text>
                <TouchableOpacity style={styles.resolveBtn} onPress={() => handleResolveComplaint(comp.id)}>
                  <Text style={styles.resolveBtnText}>{t('resolve')}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <>
            <Text style={[styles.sectionTitle, dynamicStyles.text]}>{t('all_reviews')}</Text>
            {reviews.map(review => (
              <View key={review.id} style={[styles.reviewCard, dynamicStyles.card]}>
                <Text style={[styles.reviewTitle, dynamicStyles.text]}>{t('review_by')} {review.seeker_name} ⭐ {review.rating}</Text>
                <Text style={[styles.reviewText, dynamicStyles.subtext]}>{review.comment}</Text>
                <TouchableOpacity style={styles.deleteReviewBtn} onPress={() => handleDeleteReview(review.id)}>
                  <Text style={styles.deleteReviewBtnText}>{t('delete')}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <>
            <Text style={[styles.sectionTitle, dynamicStyles.text]}>{t('generate_report')}</Text>
            <View style={[styles.reportBox, dynamicStyles.card]}>
              <Text style={[styles.reportLabel, dynamicStyles.text]}>{t('select_report_type')}</Text>
              <View style={styles.reportTypeRow}>
                {['users', 'transactions', 'providers'].map(type => (
                  <TouchableOpacity key={type} style={[styles.reportTypeBtn, reportType === type && styles.reportTypeActive]} onPress={() => setReportType(type)}>
                    <Text style={styles.reportTypeText}>{t(type)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity style={styles.generateBtn} onPress={generateReport}>
                <Text style={styles.generateBtnText}>{t('generate')}</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <>
            <Text style={[styles.sectionTitle, dynamicStyles.text]}>{t('recent_transactions')}</Text>
            {payments.map(payment => (
              <View key={payment.id} style={[styles.paymentCard, dynamicStyles.card]}>
                <Text style={[styles.paymentAmount, dynamicStyles.text]}>{payment.amount} ETB</Text>
                <Text style={[styles.paymentDetail, dynamicStyles.subtext]}>{payment.type} - {payment.user_name}</Text>
                <Text style={[styles.paymentDetail, dynamicStyles.subtext]}>{new Date(payment.created_at).toLocaleDateString()}</Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {/* Report Modal */}
      <Modal visible={showReportModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, dynamicStyles.card]}>
            <Text style={[styles.modalTitle, dynamicStyles.text]}>{t('report')}</Text>
            <Text style={[styles.modalText, dynamicStyles.subtext]}>{JSON.stringify(reportData, null, 2)}</Text>
            <TouchableOpacity style={styles.modalBtn} onPress={() => setShowReportModal(false)}>
              <Text style={styles.modalBtnText}>{t('close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },
  title: { fontSize: 22, fontWeight: 'bold' },
  subtitle: { fontSize: 14 },
  logoutText: { fontWeight: '600' },
  tabsRow: { flexDirection: 'row', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  tab: { paddingVertical: 12, marginRight: 24, borderBottomWidth: 2 },
  tabText: { fontSize: 14, fontWeight: '500' },
  inner: { padding: 20, gap: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: { width: '30%', borderRadius: 12, padding: 14, alignItems: 'center', flexGrow: 1 },
  statNumber: { fontSize: 20, fontWeight: 'bold', color: '#111', marginBottom: 4 },
  statLabel: { fontSize: 11, color: '#6b7280', textAlign: 'center' },
  providerCard: { flexDirection: 'row', borderRadius: 14, padding: 16, gap: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  providerInfo: { flex: 1 },
  providerName: { fontSize: 16, fontWeight: 'bold' },
  providerDate: { fontSize: 12, marginBottom: 6 },
  docBtn: { backgroundColor: '#eff6ff', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 10, alignSelf: 'flex-start', marginTop: 4 },
  docBtnText: { fontSize: 12, color: '#1a56db', fontWeight: '600' },
  providerActions: { gap: 8, justifyContent: 'center' },
  verifyBtn: { backgroundColor: '#10b981', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, alignItems: 'center' },
  verifyBtnText: { color: '#fff', fontWeight: '600', fontSize: 12, textAlign: 'center' },
  suspendBtn: { backgroundColor: '#fee2e2', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, alignItems: 'center' },
  suspendBtnText: { color: '#ef4444', fontWeight: '600', fontSize: 12, textAlign: 'center' },
  userCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 14, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  userName: { fontSize: 16, fontWeight: 'bold' },
  userDetail: { fontSize: 12, marginTop: 2 },
  userActionBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  userActionText: { fontWeight: '600', fontSize: 14 },
  activateBtn: { backgroundColor: '#10b981' },
  complaintCard: { borderRadius: 14, padding: 16, marginBottom: 12, gap: 4 },
  complaintTitle: { fontSize: 14, fontWeight: 'bold' },
  complaintText: { fontSize: 13 },
  resolveBtn: { backgroundColor: '#1a56db', borderRadius: 8, paddingVertical: 8, marginTop: 8, alignItems: 'center' },
  resolveBtnText: { color: '#fff', fontWeight: '600' },
  reviewCard: { borderRadius: 14, padding: 16, marginBottom: 12, gap: 4 },
  reviewTitle: { fontSize: 14, fontWeight: 'bold' },
  reviewText: { fontSize: 13 },
  deleteReviewBtn: { backgroundColor: '#fee2e2', borderRadius: 8, paddingVertical: 8, marginTop: 8, alignItems: 'center' },
  deleteReviewBtnText: { color: '#ef4444', fontWeight: '600' },
  reportBox: { borderRadius: 14, padding: 20, gap: 12 },
  reportLabel: { fontSize: 14, fontWeight: '600' },
  reportTypeRow: { flexDirection: 'row', gap: 12 },
  reportTypeBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#e5e7eb' },
  reportTypeActive: { backgroundColor: '#1a56db' },
  reportTypeText: { fontWeight: '500' },
  generateBtn: { backgroundColor: '#1a56db', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  generateBtnText: { color: '#fff', fontWeight: 'bold' },
  paymentCard: { borderRadius: 14, padding: 16, marginBottom: 12, gap: 4 },
  paymentAmount: { fontSize: 16, fontWeight: 'bold' },
  paymentDetail: { fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modal: { width: '90%', borderRadius: 20, padding: 20, gap: 12, maxHeight: '80%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  modalText: { fontSize: 12, fontFamily: 'monospace' },
  modalBtn: { backgroundColor: '#e5e7eb', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  modalBtnText: { fontSize: 16, fontWeight: '600' },
});