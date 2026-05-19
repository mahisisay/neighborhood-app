// =============================================
//  src/screens/ProviderHomeScreen.js
//  Provider's main screen:
//  - Toggle online/offline
//  - See their stats
//  - Quick access to offered jobs
//  FIXED: added logout from useAuth + safe handler
// =============================================

import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  TouchableOpacity, Alert, ActivityIndicator,
  ScrollView, RefreshControl
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import { providerAPI, requestAPI, reviewAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function ProviderHomeScreen({ navigation }) {
  // ✅ FIXED: added logout here
  const { user, logout } = useAuth();
  
  if (!user) return null;

  const [isOnline,    setIsOnline]    = useState(false);
  const [offeredJobs, setOfferedJobs] = useState([]);
  const [avgRating,   setAvgRating]   = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [toggling,    setToggling]    = useState(false);
  const [refreshing,  setRefreshing]  = useState(false);

  // Safe logout handler
  const handleLogout = () => {
    if (logout) {
      logout();
    } else {
      Alert.alert('Error', 'Logout function not available');
    }
  };

  useFocusEffect(
    useCallback(() => { loadData(); }, [])
  );

  async function loadData() {
    try {
      const jobsData = await requestAPI.getOffered();
      setOfferedJobs(jobsData.jobs || []);

      const reviewsData = await reviewAPI.getForProvider(user.id);
      setAvgRating(reviewsData.avg_rating || 0);
    } catch (err) {
      console.log('Load error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function handleToggleStatus() {
    setToggling(true);
    try {
      let body = {};

      if (!isOnline) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Location Required', 'Please enable location to go online');
          return;
        }
        const loc = await Location.getCurrentPositionAsync({});
        body = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      }

      const data = await providerAPI.toggleStatus(body);
      setIsOnline(data.is_online);
      Alert.alert('Status Updated', data.message);

    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setToggling(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.inner}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {
            setRefreshing(true);
            loadData();
          }} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user.name.split(' ')[0]} 👷</Text>
            <Text style={styles.subtitle}>Provider Dashboard</Text>
          </View>
          {/* ✅ FIXED: using safe logout handler */}
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Online/Offline toggle card */}
        <View style={[styles.statusCard, isOnline ? styles.statusCardOnline : styles.statusCardOffline]}>
          <View>
            <Text style={styles.statusLabel}>Current Status</Text>
            <Text style={styles.statusValue}>
              {isOnline ? '🟢 ONLINE' : '🔴 OFFLINE'}
            </Text>
            <Text style={styles.statusDesc}>
              {isOnline
                ? 'You are visible to seekers and receiving jobs'
                : 'You are hidden. Go online to receive jobs'}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.toggleBtn, isOnline ? styles.toggleBtnOff : styles.toggleBtnOn]}
            onPress={handleToggleStatus}
            disabled={toggling}
          >
            {toggling
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.toggleBtnText}>
                  {isOnline ? 'Go Offline' : 'Go Online'}
                </Text>
            }
          </TouchableOpacity>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{offeredJobs.length}</Text>
            <Text style={styles.statLabel}>New Jobs</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>⭐ {avgRating.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Your Rating</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>ETB 20</Text>
            <Text style={styles.statLabel}>Per Job Fee</Text>
          </View>
        </View>

        {/* Quick actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('OfferedJobs')}
        >
          <Text style={styles.actionIcon}>📋</Text>
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>View Offered Jobs</Text>
            <Text style={styles.actionDesc}>{offeredJobs.length} job(s) waiting for your response</Text>
          </View>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('AcceptedJobs')}
        >
          <Text style={styles.actionIcon}>✅</Text>
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>My Accepted Jobs</Text>
            <Text style={styles.actionDesc}>View and manage your active jobs</Text>
          </View>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>

        {/* Info box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>💡 How it works</Text>
          <Text style={styles.infoText}>1. Go online to receive job notifications</Text>
          <Text style={styles.infoText}>2. Review and accept offered jobs</Text>
          <Text style={styles.infoText}>3. Pay 20 ETB to unlock seeker contact</Text>
          <Text style={styles.infoText}>4. Complete the job and get reviewed</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#f9fafb' },
  center:           { flex: 1, justifyContent: 'center', alignItems: 'center' },
  inner:            { padding: 20, gap: 16 },
  header:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting:         { fontSize: 22, fontWeight: 'bold', color: '#111' },
  subtitle:         { fontSize: 14, color: '#6b7280' },
  logoutText:       { color: '#ef4444', fontWeight: '600' },
  statusCard:       { borderRadius: 16, padding: 20, gap: 12 },
  statusCardOnline: { backgroundColor: '#d1fae5', borderWidth: 1, borderColor: '#10b981' },
  statusCardOffline:{ backgroundColor: '#fee2e2', borderWidth: 1, borderColor: '#ef4444' },
  statusLabel:      { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  statusValue:      { fontSize: 20, fontWeight: 'bold', color: '#111', marginBottom: 4 },
  statusDesc:       { fontSize: 13, color: '#374151' },
  toggleBtn:        { borderRadius: 12, paddingVertical: 12, paddingHorizontal: 20, alignItems: 'center' },
  toggleBtnOn:      { backgroundColor: '#10b981' },
  toggleBtnOff:     { backgroundColor: '#ef4444' },
  toggleBtnText:    { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  statsRow:         { flexDirection: 'row', gap: 10 },
  statCard:         { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 14, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  statNumber:       { fontSize: 18, fontWeight: 'bold', color: '#111', marginBottom: 4 },
  statLabel:        { fontSize: 11, color: '#6b7280', textAlign: 'center' },
  sectionTitle:     { fontSize: 16, fontWeight: '600', color: '#374151' },
  actionCard:       { backgroundColor: '#fff', borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  actionIcon:       { fontSize: 28 },
  actionInfo:       { flex: 1 },
  actionTitle:      { fontSize: 15, fontWeight: '600', color: '#111' },
  actionDesc:       { fontSize: 12, color: '#6b7280', marginTop: 2 },
  actionArrow:      { fontSize: 18, color: '#9ca3af' },
  infoBox:          { backgroundColor: '#eff6ff', borderRadius: 12, padding: 16, gap: 6 },
  infoTitle:        { fontSize: 14, fontWeight: '600', color: '#1a56db', marginBottom: 4 },
  infoText:         { fontSize: 13, color: '#374151' },
});