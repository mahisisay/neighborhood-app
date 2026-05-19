// =============================================
//  src/screens/HomeScreen.js
//  Shows all service categories in a grid.
//  Works in guest mode too — no login needed!
//  UPDATED: Global theme & translations (SettingsContext)
// =============================================

import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator,
  Alert
} from 'react-native';
import { requestAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext'; // ✅ ADDED

// Map icon names from database to actual emojis
const ICON_MAP = {
  wrench:     '🔧',
  zap:        '⚡',
  droplet:    '💧',
  book:       '📚',
  smartphone: '📱',
  wind:       '🧹',
  truck:      '🚛',
  brush:      '🖌️',
};

export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { t, theme } = useSettings(); // ✅ ADDED: translation & theme
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);

  // Safe logout handler
  const handleLogout = () => {
    if (logout) {
      logout();
    } else {
      Alert.alert(t('error'), t('logout_unavailable') || 'Logout function not available');
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const data = await requestAPI.getCategories();
      setCategories(data.categories);
    } catch (err) {
      Alert.alert(t('error'), t('could_not_load_categories') || 'Could not load categories');
    } finally {
      setLoading(false);
    }
  }

  function handleCategoryPress(category) {
    if (!user) {
      Alert.alert(
        t('login_required') || 'Login Required',
        t('login_prompt') || 'Please login or create an account to post a service request.',
        [
          { text: t('cancel'), style: 'cancel' },
          { text: t('login'), onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }
    navigation.navigate('PostRequest', { category });
  }

  function renderCategory({ item }) {
    return (
      <TouchableOpacity
        style={[styles.card, dynamicStyles.card]}
        onPress={() => handleCategoryPress(item)}
      >
        <Text style={styles.cardIcon}>{ICON_MAP[item.icon] || '🔨'}</Text>
        <Text style={[styles.cardName, dynamicStyles.cardText]}>{item.name}</Text>
      </TouchableOpacity>
    );
  }

  // ✅ Dynamic styles based on theme
  const dynamicStyles = {
    container: { backgroundColor: theme === 'dark' ? '#121212' : '#f9fafb' },
    header: {
      backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff',
      borderBottomColor: theme === 'dark' ? '#333' : '#e5e7eb',
    },
    greeting: { color: theme === 'dark' ? '#fff' : '#111' },
    subtitle: { color: theme === 'dark' ? '#aaa' : '#6b7280' },
    mapBtn: { backgroundColor: theme === 'dark' ? '#1e3a5f' : '#eff6ff' },
    mapBtnText: { color: theme === 'dark' ? '#90cdf4' : '#1a56db' },
    logoutBtn: { backgroundColor: theme === 'dark' ? '#5c1e1e' : '#fee2e2' },
    logoutText: { color: theme === 'dark' ? '#f87171' : '#ef4444' },
    sectionTitle: { color: theme === 'dark' ? '#ccc' : '#374151' },
    card: { backgroundColor: theme === 'dark' ? '#2c2c2c' : '#fff' },
    cardName: { color: theme === 'dark' ? '#eee' : '#374151' },
  };

  return (
    <SafeAreaView style={[styles.container, dynamicStyles.container]}>
      <View style={[styles.header, dynamicStyles.header]}>
        <View>
          <Text style={[styles.greeting, dynamicStyles.greeting]}>
            {user ? `${t('hello')}, ${user.name.split(' ')[0]} 👋` : `${t('hello_guest')} 👋`}
          </Text>
          <Text style={[styles.subtitle, dynamicStyles.subtitle]}>{t('what_service')}</Text>
        </View>
        {user && (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              style={[styles.mapBtn, dynamicStyles.mapBtn]}
              onPress={() => navigation.navigate('Map')}
            >
              <Text style={[styles.mapBtnText, dynamicStyles.mapBtnText]}>🗺️ {t('map')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.mapBtn, dynamicStyles.logoutBtn, { backgroundColor: '#fee2e2' }]}
              onPress={handleLogout}
            >
              <Text style={[styles.mapBtnText, dynamicStyles.logoutText, { color: '#ef4444' }]}>{t('logout')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1a56db" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          ListHeaderComponent={
            <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>{t('all_categories')}</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 20,
    paddingTop: 20, paddingBottom: 12,
    borderBottomWidth: 1,
  },
  greeting:     { fontSize: 20, fontWeight: 'bold' },
  subtitle:     { fontSize: 14, marginTop: 2 },
  mapBtn: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
  },
  mapBtnText:   { fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  grid:         { padding: 16 },
  row:          { justifyContent: 'space-between', marginBottom: 12 },
  card: {
    width: '48%', borderRadius: 16,
    padding: 20, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  cardIcon: { fontSize: 36, marginBottom: 10 },
  cardName: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
});