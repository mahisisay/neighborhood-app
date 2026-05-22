// =============================================
//  src/screens/HomeScreen.js
//  BRAND COLORS: Ethiopian Green (#2E7D32) + Gold (#F9A825)
// =============================================

import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator,
  Alert, Modal
} from 'react-native';
import { requestAPI, subcategoryAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

// Brand Colors
const BRAND = {
  primary: '#2E7D32',      // Ethiopian Green
  primaryDark: '#1B5E20',
  primaryLight: '#E8F5E9',
  secondary: '#F9A825',    // Gold
  secondaryLight: '#FFF8E1',
  text: '#374151',
  textLight: '#6B7280',
  white: '#FFFFFF',
  dark: '#1F2937',
  error: '#DC2626',
};

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
  const { t, theme } = useSettings();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [loadingSubs, setLoadingSubs] = useState(false);

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

  async function loadSubcategories(categoryId, categoryName) {
    setLoadingSubs(true);
    setSelectedCategory({ id: categoryId, name: categoryName });
    setModalVisible(true);
    
    try {
      const data = await subcategoryAPI.getByCategory(categoryId);
      setSubcategories(data.subcategories || []);
    } catch (err) {
      console.log('Error loading subcategories:', err);
      setSubcategories([]);
    } finally {
      setLoadingSubs(false);
    }
  }

  function selectSubcategory(subcategory) {
    setModalVisible(false);
    if (!user) {
      Alert.alert(
        t('login_required') || 'Login Required',
        t('login_prompt') || 'Please login to post a service request.',
        [
          { text: t('cancel'), style: 'cancel' },
          { text: t('login'), onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }
    navigation.navigate('PostRequest', {
      category_id: selectedCategory.id,
      category_name: selectedCategory.name,
      subcategory_id: subcategory.id,
      subcategory_name: subcategory.name
    });
  }

  const handleLogout = () => {
    if (logout) {
      logout();
    } else {
      Alert.alert(t('error'), t('logout_unavailable') || 'Logout function not available');
    }
  };

  function renderCategory({ item }) {
    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: theme === 'dark' ? BRAND.dark : BRAND.white }]}
        onPress={() => loadSubcategories(item.id, item.name)}
      >
        <Text style={styles.cardIcon}>{ICON_MAP[item.icon] || '🔨'}</Text>
        <Text style={[styles.cardName, { color: theme === 'dark' ? '#EEE' : BRAND.text }]}>{item.name}</Text>
        <Text style={styles.cardHint}>Tap to select →</Text>
      </TouchableOpacity>
    );
  }

  function renderSubcategory({ item }) {
    return (
      <TouchableOpacity
        style={[styles.subCard, { backgroundColor: theme === 'dark' ? '#2C2C2C' : BRAND.primaryLight }]}
        onPress={() => selectSubcategory(item)}
      >
        <Text style={styles.subIcon}>{item.icon || '🔧'}</Text>
        <Text style={[styles.subName, { color: theme === 'dark' ? '#EEE' : BRAND.primary }]}>{item.name}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme === 'dark' ? '#121212' : '#F9FAFB' }]}>
      <View style={[
        styles.header, 
        { 
          backgroundColor: theme === 'dark' ? '#1E1E1E' : BRAND.white,
          borderBottomColor: theme === 'dark' ? '#333' : '#E5E7EB'
        }
      ]}>
        <View>
          <Text style={[styles.greeting, { color: theme === 'dark' ? '#FFF' : BRAND.text }]}>
            {user ? `${t('hello')}, ${user.name.split(' ')[0]} 👋` : `${t('hello_guest')} 👋`}
          </Text>
          <Text style={[styles.subtitle, { color: theme === 'dark' ? '#AAA' : BRAND.textLight }]}>
            {t('what_service')}
          </Text>
        </View>
        {user && (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              style={[styles.mapBtn, { backgroundColor: BRAND.primaryLight }]}
              onPress={() => navigation.navigate('Map')}
            >
              <Text style={[styles.mapBtnText, { color: BRAND.primary }]}>🗺️ {t('map')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.mapBtn, styles.logoutBtn]}
              onPress={handleLogout}
            >
              <Text style={[styles.mapBtnText, { color: BRAND.error }]}>{t('logout')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={BRAND.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          ListHeaderComponent={
            <Text style={[styles.sectionTitle, { color: theme === 'dark' ? '#CCC' : BRAND.textLight }]}>
              {t('all_categories')}
            </Text>
          }
        />
      )}

      {/* Subcategory Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme === 'dark' ? '#1E1E1E' : BRAND.white }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme === 'dark' ? '#FFF' : BRAND.text }]}>
                {selectedCategory?.name || 'Services'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.modalSubtitle, { color: BRAND.textLight }]}>
              Select a specific service
            </Text>

            {loadingSubs ? (
              <ActivityIndicator size="large" color={BRAND.primary} style={{ marginTop: 40 }} />
            ) : subcategories.length === 0 ? (
              <View style={styles.emptySubs}>
                <Text style={styles.emptyIcon}>🔧</Text>
                <Text style={styles.emptyText}>No subcategories found</Text>
              </View>
            ) : (
              <FlatList
                data={subcategories}
                renderItem={renderSubcategory}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                columnWrapperStyle={styles.subRow}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 20,
    paddingTop: 20, paddingBottom: 12,
    borderBottomWidth: 1,
  },
  greeting: { fontSize: 20, fontWeight: 'bold' },
  subtitle: { fontSize: 14, marginTop: 2 },
  mapBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  mapBtnText: { fontWeight: '600' },
  logoutBtn: { backgroundColor: '#FEE2E2' },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  grid: { padding: 16 },
  row: { justifyContent: 'space-between', marginBottom: 12 },
  card: {
    width: '48%', borderRadius: 16,
    padding: 20, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  cardIcon: { fontSize: 36, marginBottom: 10 },
  cardName: { fontSize: 13, fontWeight: '600', textAlign: 'center', marginBottom: 4 },
  cardHint: { fontSize: 10, color: '#9CA3AF', textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  modalTitle: { fontSize: 22, fontWeight: 'bold' },
  modalClose: { fontSize: 24, fontWeight: '600', color: '#9CA3AF', padding: 8 },
  modalSubtitle: { fontSize: 14, marginBottom: 20 },
  subRow: { justifyContent: 'space-between', marginBottom: 12 },
  subCard: { borderRadius: 12, padding: 14, width: '48%', alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  subIcon: { fontSize: 20 },
  subName: { fontSize: 13, fontWeight: '500', textAlign: 'center' },
  emptySubs: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12, opacity: 0.5 },
  emptyText: { fontSize: 16, color: '#9CA3AF' },
});