// =============================================
//  src/screens/HomeScreen.js
//  PROFESSIONAL VERSION - Grid Layout Subcategories with Search
// =============================================

import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator,
  Alert, Modal, TextInput
} from 'react-native';
import { requestAPI, subcategoryAPI } from '../api/client';
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

const ICON_MAP = {
  wrench: '🔧', zap: '⚡', droplet: '💧', book: '📚',
  smartphone: '📱', wind: '🧹', truck: '🚛', brush: '🖌️',
};

// Helper function to map service names to icons
const getIconForService = (serviceName) => {
  const iconMap = {
    'Electrician': '⚡',
    'Plumber': '💧',
    'Carpenter': '🔨',
    'Painter': '🎨',
    'Appliance Repair': '🔧',
    'House Cleaning': '🧹',
    'Laundry Services': '👕',
    'Compound Cleaning': '🌳',
    'Office Cleaning': '🏢',
    'Barber': '✂️',
    'Makeup Artist': '💄',
    'Tailor': '📏',
    'Photographer': '📷',
    'Event Helpers': '🎉',
    'Private Tutor (Math)': '📐',
    'Private Tutor (English)': '📖',
    'Computer Training': '💻',
    'Language Tutoring': '🗣️',
    'Grocery Pickup': '🛒',
    'Medicine Delivery': '💊',
    'Document Delivery': '📄',
    'Small Shopping': '🏪',
    'Computer Repair': '🖥️',
    'Phone Repair': '📱',
    'Software Installation': '💿',
    'Printing/IT Support': '🖨️'
  };
  return iconMap[serviceName] || '🔧';
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
  const [modalSearchQuery, setModalSearchQuery] = useState('');

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
    setModalSearchQuery('');
    
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

  function getFilteredSubcategories() {
    if (!modalSearchQuery) return subcategories;
    return subcategories.filter(sub => 
      sub.name.toLowerCase().includes(modalSearchQuery.toLowerCase())
    );
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
        style={[styles.card, { backgroundColor: theme === 'dark' ? '#1E1E1E' : BRAND.white }]}
        onPress={() => loadSubcategories(item.id, item.name)}
        activeOpacity={0.7}
      >
        <Text style={styles.cardIcon}>{ICON_MAP[item.icon] || '🔨'}</Text>
        <Text style={[styles.cardName, { color: theme === 'dark' ? '#FFF' : BRAND.text }]}>{item.name}</Text>
        <Text style={styles.cardHint}>Tap to select →</Text>
      </TouchableOpacity>
    );
  }

  function renderSubcategory({ item }) {
    return (
      <TouchableOpacity
        style={[styles.subCard, { backgroundColor: theme === 'dark' ? '#2C2C2C' : BRAND.primaryLight }]}
        onPress={() => selectSubcategory(item)}
        activeOpacity={0.7}
      >
        <Text style={styles.subIcon}>{item.icon || getIconForService(item.name)}</Text>
        <Text style={[styles.subName, { color: theme === 'dark' ? '#FFF' : BRAND.primary }]}>{item.name}</Text>
      </TouchableOpacity>
    );
  }

  const filteredSubcategories = getFilteredSubcategories();
  const isDark = theme === 'dark';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F9FAFB' }]}>
      <View style={[styles.header, { backgroundColor: isDark ? '#1E1E1E' : BRAND.white, borderBottomColor: isDark ? '#333' : '#E5E7EB' }]}>
        <View>
          <Text style={[styles.greeting, { color: isDark ? '#FFF' : BRAND.text }]}>
            {user ? `Hello, ${user.name?.split(' ')[0]} 👋` : 'Hello Guest 👋'}
          </Text>
          <Text style={[styles.subtitle, { color: isDark ? '#AAA' : BRAND.textLight }]}>
            What service do you need today?
          </Text>
        </View>
        {user && (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              style={[styles.mapBtn, { backgroundColor: BRAND.primaryLight }]}
              onPress={() => navigation.navigate('Map')}
            >
              <Text style={[styles.mapBtnText, { color: BRAND.primary }]}>🗺️ Map</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.mapBtn, styles.logoutBtn]}
              onPress={handleLogout}
            >
              <Text style={[styles.mapBtnText, { color: BRAND.error }]}>Logout</Text>
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
            <Text style={[styles.sectionTitle, { color: isDark ? '#CCC' : BRAND.textLight }]}>
              All Categories
            </Text>
          }
        />
      )}

      {/* Professional Subcategory Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1E1E1E' : BRAND.white }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDark ? '#FFF' : BRAND.text }]}>
                {selectedCategory?.name || 'Services'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseBtn}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.modalSubtitle, { color: BRAND.textLight }]}>
              Select a specific service
            </Text>

            {/* Search Bar inside Modal */}
            <View style={[styles.modalSearchContainer, { backgroundColor: isDark ? '#2C2C2C' : '#F3F4F6' }]}>
              <Text style={styles.modalSearchIcon}>🔍</Text>
              <TextInput
                style={[styles.modalSearchInput, { color: isDark ? '#FFF' : BRAND.text }]}
                placeholder="Search services..."
                placeholderTextColor={isDark ? '#888' : BRAND.textLight}
                value={modalSearchQuery}
                onChangeText={setModalSearchQuery}
              />
              {modalSearchQuery !== '' && (
                <TouchableOpacity onPress={() => setModalSearchQuery('')}>
                  <Text style={styles.modalClearIcon}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            {loadingSubs ? (
              <ActivityIndicator size="large" color={BRAND.primary} style={{ marginVertical: 40 }} />
            ) : subcategories.length === 0 ? (
              <View style={styles.emptySubs}>
                <Text style={styles.emptyIcon}>🔧</Text>
                <Text style={[styles.emptyText, { color: BRAND.textLight }]}>No subcategories found</Text>
              </View>
            ) : filteredSubcategories.length === 0 ? (
              <View style={styles.emptySubs}>
                <Text style={styles.emptyIcon}>🔍</Text>
                <Text style={[styles.emptyText, { color: BRAND.textLight }]}>No services match your search</Text>
              </View>
            ) : (
              <FlatList
                data={filteredSubcategories}
                renderItem={renderSubcategory}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                columnWrapperStyle={styles.modalSubRow}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalListContent}
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
  
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  modalTitle: { fontSize: 22, fontWeight: 'bold' },
  modalCloseBtn: { padding: 8 },
  modalClose: { fontSize: 20, fontWeight: '600', color: '#9CA3AF' },
  modalSubtitle: { fontSize: 14, marginBottom: 20 },
  modalSearchContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 12, marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  modalSearchIcon: { fontSize: 16, marginRight: 8, color: '#9CA3AF' },
  modalSearchInput: { flex: 1, paddingVertical: 10, fontSize: 14 },
  modalClearIcon: { fontSize: 16, color: '#9CA3AF', padding: 8 },
  modalSubRow: { justifyContent: 'space-between', marginBottom: 12 },
  modalListContent: { paddingBottom: 20 },
  subCard: { borderRadius: 12, padding: 14, width: '48%', alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  subIcon: { fontSize: 20 },
  subName: { fontSize: 13, fontWeight: '500', textAlign: 'center' },
  emptySubs: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12, opacity: 0.5 },
  emptyText: { fontSize: 14, textAlign: 'center' },
});