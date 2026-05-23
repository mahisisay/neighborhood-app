// src/screens/HomeScreen.js - Responsive Version

import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator,
  Alert, Modal, TextInput
} from 'react-native';
import { requestAPI, subcategoryAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { getGridColumns, moderateScale, getFontSize, getSpacing, SCREEN_WIDTH } from '../utils/responsive';

const BRAND = {
  primary: '#2E7D32',
  primaryLight: '#E8F5E9',
  secondary: '#F9A825',
  text: '#374151',
  textLight: '#6B7280',
  white: '#FFFFFF',
  error: '#DC2626',
};

const ICON_MAP = {
  wrench: '🔧', zap: '⚡', droplet: '💧', book: '📚',
  smartphone: '📱', wind: '🧹', truck: '🚛', brush: '🖌️',
};

const getIconForService = (serviceName) => {
  const iconMap = {
    'Electrician': '⚡', 'Plumber': '💧', 'Carpenter': '🔨', 'Painter': '🎨',
    'Appliance Repair': '🔧', 'House Cleaning': '🧹', 'Laundry Services': '👕',
    'Compound Cleaning': '🌳', 'Office Cleaning': '🏢', 'Barber': '✂️',
    'Makeup Artist': '💄', 'Tailor': '📏', 'Photographer': '📷', 'Event Helpers': '🎉',
    'Private Tutor (Math)': '📐', 'Private Tutor (English)': '📖', 'Computer Training': '💻',
    'Language Tutoring': '🗣️', 'Grocery Pickup': '🛒', 'Medicine Delivery': '💊',
    'Document Delivery': '📄', 'Small Shopping': '🏪', 'Computer Repair': '🖥️',
    'Phone Repair': '📱', 'Software Installation': '💿', 'Printing/IT Support': '🖨️'
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

  const columns = getGridColumns();
  const cardWidth = (SCREEN_WIDTH - getSpacing(2) * (columns + 1)) / columns;
  const isDark = theme === 'dark';

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
        style={[styles.card, { 
          backgroundColor: isDark ? '#1E1E1E' : BRAND.white,
          width: cardWidth,
          padding: moderateScale(16),
          margin: moderateScale(8),
        }]}
        onPress={() => loadSubcategories(item.id, item.name)}
        activeOpacity={0.7}
      >
        <Text style={[styles.cardIcon, { fontSize: moderateScale(36) }]}>
          {ICON_MAP[item.icon] || '🔨'}
        </Text>
        <Text style={[styles.cardName, { 
          color: isDark ? '#FFF' : BRAND.text,
          fontSize: getFontSize(13),
          marginTop: moderateScale(8),
        }]}>
          {item.name}
        </Text>
        <Text style={[styles.cardHint, { fontSize: getFontSize(10) }]}>
          Tap to select →
        </Text>
      </TouchableOpacity>
    );
  }

  function renderSubcategory({ item }) {
    return (
      <TouchableOpacity
        style={[styles.subCard, { 
          backgroundColor: isDark ? '#2C2C2C' : BRAND.primaryLight,
          padding: moderateScale(12),
          margin: moderateScale(6),
          width: (SCREEN_WIDTH - getSpacing(4) * 3) / 2,
        }]}
        onPress={() => selectSubcategory(item)}
        activeOpacity={0.7}
      >
        <Text style={[styles.subIcon, { fontSize: moderateScale(20) }]}>
          {item.icon || getIconForService(item.name)}
        </Text>
        <Text style={[styles.subName, { 
          color: isDark ? '#FFF' : BRAND.primary,
          fontSize: getFontSize(12),
          marginLeft: moderateScale(8),
        }]}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  }

  const filteredSubcategories = getFilteredSubcategories();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F9FAFB' }]}>
      <View style={[styles.header, { 
        backgroundColor: isDark ? '#1E1E1E' : BRAND.white,
        paddingHorizontal: getSpacing(),
        paddingVertical: moderateScale(12),
      }]}>
        <View>
          <Text style={[styles.greeting, { 
            color: isDark ? '#FFF' : BRAND.text,
            fontSize: getFontSize(20),
          }]}>
            {user ? `Hello, ${user.name?.split(' ')[0]} 👋` : 'Hello Guest 👋'}
          </Text>
          <Text style={[styles.subtitle, { 
            color: isDark ? '#AAA' : BRAND.textLight,
            fontSize: getFontSize(14),
            marginTop: moderateScale(4),
          }]}>
            What service do you need today?
          </Text>
        </View>
        {user && (
          <View style={{ flexDirection: 'row', gap: moderateScale(8) }}>
            <TouchableOpacity
              style={[styles.mapBtn, { backgroundColor: BRAND.primaryLight, padding: moderateScale(8) }]}
              onPress={() => navigation.navigate('Map')}
            >
              <Text style={[styles.mapBtnText, { color: BRAND.primary, fontSize: getFontSize(14) }]}>🗺️ Map</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.logoutBtn, { padding: moderateScale(8) }]}
              onPress={handleLogout}
            >
              <Text style={[styles.logoutText, { color: BRAND.error, fontSize: getFontSize(14) }]}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={BRAND.primary} style={{ marginTop: moderateScale(40) }} />
      ) : (
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id.toString()}
          numColumns={columns}
          contentContainerStyle={[styles.grid, { padding: getSpacing() }]}
          ListHeaderComponent={
            <Text style={[styles.sectionTitle, { 
              color: isDark ? '#CCC' : BRAND.textLight,
              fontSize: getFontSize(16),
              marginBottom: moderateScale(12),
              paddingHorizontal: getSpacing(),
            }]}>
              All Categories
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
          <View style={[styles.modalContent, { 
            backgroundColor: isDark ? '#1E1E1E' : BRAND.white,
            padding: getSpacing(),
          }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { 
                color: isDark ? '#FFF' : BRAND.text,
                fontSize: getFontSize(22),
              }]}>
                {selectedCategory?.name || 'Services'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseBtn}>
                <Text style={[styles.modalClose, { fontSize: getFontSize(20) }]}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.modalSubtitle, { 
              color: BRAND.textLight,
              fontSize: getFontSize(14),
              marginBottom: moderateScale(16),
            }]}>
              Select a specific service
            </Text>

            <View style={[styles.modalSearchContainer, { 
              backgroundColor: isDark ? '#2C2C2C' : '#F3F4F6',
              paddingHorizontal: moderateScale(12),
              marginBottom: moderateScale(16),
            }]}>
              <Text style={[styles.modalSearchIcon, { fontSize: getFontSize(16) }]}>🔍</Text>
              <TextInput
                style={[styles.modalSearchInput, { 
                  color: isDark ? '#FFF' : BRAND.text,
                  fontSize: getFontSize(14),
                  paddingVertical: moderateScale(10),
                }]}
                placeholder="Search services..."
                placeholderTextColor={isDark ? '#888' : BRAND.textLight}
                value={modalSearchQuery}
                onChangeText={setModalSearchQuery}
              />
              {modalSearchQuery !== '' && (
                <TouchableOpacity onPress={() => setModalSearchQuery('')}>
                  <Text style={[styles.modalClearIcon, { fontSize: getFontSize(16) }]}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            {loadingSubs ? (
              <ActivityIndicator size="large" color={BRAND.primary} style={{ marginVertical: moderateScale(40) }} />
            ) : subcategories.length === 0 ? (
              <View style={styles.emptySubs}>
                <Text style={[styles.emptyIcon, { fontSize: moderateScale(48) }]}>🔧</Text>
                <Text style={[styles.emptyText, { color: BRAND.textLight, fontSize: getFontSize(14) }]}>
                  No subcategories found
                </Text>
              </View>
            ) : filteredSubcategories.length === 0 ? (
              <View style={styles.emptySubs}>
                <Text style={[styles.emptyIcon, { fontSize: moderateScale(48) }]}>🔍</Text>
                <Text style={[styles.emptyText, { color: BRAND.textLight, fontSize: getFontSize(14) }]}>
                  No services match your search
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredSubcategories}
                renderItem={renderSubcategory}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  greeting: { fontWeight: 'bold' },
  subtitle: {},
  mapBtn: { borderRadius: 20 },
  mapBtnText: { fontWeight: '600' },
  logoutBtn: { backgroundColor: '#FEE2E2', borderRadius: 20 },
  logoutText: { fontWeight: '600' },
  sectionTitle: { fontWeight: '600' },
  grid: {},
  card: {
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardIcon: {},
  cardName: { fontWeight: '600', textAlign: 'center' },
  cardHint: { color: '#9CA3AF', textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  modalTitle: { fontWeight: 'bold' },
  modalCloseBtn: { padding: 8 },
  modalClose: { fontWeight: '600', color: '#9CA3AF' },
  modalSubtitle: {},
  modalSearchContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  modalSearchIcon: { marginRight: 8, color: '#9CA3AF' },
  modalSearchInput: { flex: 1 },
  modalClearIcon: { color: '#9CA3AF', padding: 8 },
  modalListContent: { paddingBottom: 20 },
  subCard: { borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  subIcon: {},
  subName: { fontWeight: '500', textAlign: 'center', flex: 1 },
  emptySubs: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { marginBottom: 12, opacity: 0.5 },
  emptyText: { textAlign: 'center' },
});